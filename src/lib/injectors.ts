import {
    StyleToCSSVisitor,
    cssProperyValue,
    SplitflowStyleDef,
    defToStyle,
    ThemeDataNode,
    ThemeToCSSVisitor,
    StyleNode,
    ThemeNode
} from '@splitflow/lib/style'
import { cssRule, stylesheet } from '@splitflow/core/dom'
import { merge } from '@splitflow/core/utils'
import { Variants } from './style'
import { SplitflowDesigner } from './designer'
import { ExpressionVariables, SchemaDef, StringDef } from '@splitflow/core/definition'

const browser = typeof document !== 'undefined'

export function optionTextInjector(componentName: string) {
    return (
        optionName: string,
        value: string,
        variables: ExpressionVariables,
        designer: SplitflowDesigner
    ) => {
        const { devtool } = designer

        if (devtool) {
            const definition: StringDef = { type: 'string', variables }
            devtool.registerOptionText(componentName, optionName, value, definition)
        }
    }
}

export function optionEnabledInjector(componentName: string) {
    return (optionName: string, value: boolean, designer: SplitflowDesigner) => {
        const { devtool } = designer
        devtool?.registerOptionEnabled(componentName, optionName, value)
    }
}

export function optionSVGInjector(componentName: string) {
    return (optionName: string, data: string, designer: SplitflowDesigner) => {
        const { devtool } = designer
        devtool?.registerOptionSVG(componentName, optionName, data)
    }
}

export function optionPropertyInjector(componentName: string) {
    return (
        optionName: string,
        propertyName: string,
        value: unknown,
        definition: SchemaDef,
        designer: SplitflowDesigner
    ) => {
        const { devtool } = designer
        devtool?.registerOptionProperty(componentName, optionName, propertyName, value, definition)
    }
}

export function elementInjector(componentName: string) {
    return (elementName: string, variants: Variants, designer: SplitflowDesigner) => {
        const { devtool } = designer

        if (devtool && designer.include(componentName)) {
            devtool.registerElement(componentName, elementName)

            if (variants) {
                Object.entries(variants)
                    .filter(isSplitflowVariant)
                    .forEach(([variantName]) => {
                        devtool.registerElement(componentName, elementName, variantName)
                    })
            }
        }
    }
}

export function styleInjector(componentName: string, styleDef: SplitflowStyleDef) {
    return (designer: SplitflowDesigner) => {
        const { devtool, definitions, config } = designer

        if (devtool && designer.include(componentName)) {
            devtool.registerStyleFragment(defToStyle(componentName, styleDef))
            return
        }

        if (browser) {
            const root = merge(
                defToStyle(componentName, styleDef),
                componentStyle(componentName, definitions.style)
            )
            applyCSS(styleToCSS(root), stylesheet('style'))
            return
        }

        if (config.ssr) {
            const root = merge(
                defToStyle(componentName, styleDef),
                componentStyle(componentName, definitions.style)
            )
            designer.registerStyleCSS(styleToCSS(root))
            return
        }
    }
}

export function themeInjector(themeName: string, themeData: ThemeDataNode) {
    return (designer: SplitflowDesigner) => {
        const { devtool, definitions, config } = designer

        if (devtool) {
            devtool.registerThemeFragment({ type: 'snapshot', [themeName]: themeData })
            return
        }

        if (browser) {
            const root = merge<ThemeNode, ThemeNode>(
                { type: 'snapshot', [themeName]: themeData },
                { type: 'snapshot', [themeName]: definitions.theme?.[themeName] }
            )
            applyCSS(themeToCSS(root), stylesheet('theme'))
            return
        }

        if (config.ssr) {
            const root = merge<ThemeNode, ThemeNode>(
                { type: 'snapshot', [themeName]: themeData },
                { type: 'snapshot', [themeName]: definitions.theme?.[themeName] }
            )
            designer.registerThemeCSS(styleToCSS(root))
            return
        }
    }
}

function styleToCSS(root: StyleNode) {
    const visitor = new StyleToCSSVisitor()
    return visitor.root(root)
}

function themeToCSS(root: ThemeNode) {
    const visitor = new ThemeToCSSVisitor()
    return visitor.root(root)
}

function applyCSS(css: any, stylesheet: CSSStyleSheet) {
    for (let [selectorText, properties] of Object.entries(css)) {
        const rule = cssRule(stylesheet, selectorText)
        for (let [propertyName, value] of Object.entries(properties)) {
            if (value !== null) {
                const [propertyValue, propertyPriority] = cssProperyValue(value)
                rule.style.setProperty(propertyName, propertyValue, propertyPriority)
            }
        }
    }
}

function isSplitflowVariant([_, value]) {
    return typeof value == 'boolean'
}

function componentStyle(componentName: string, root: StyleNode) {
    if (root) {
        return Object.fromEntries(
            Object.entries(root).filter(([key]) => key.startsWith(componentName))
        )
    }
}
