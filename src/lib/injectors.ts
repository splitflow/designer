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
import { StyleContext } from './style'
import { getDesigner } from './designer'
import { ConfigNode, SplitflowConfigDef, defToConfig } from '@splitflow/lib/config'
import { Readable, readable } from '@splitflow/core/stores'

const browser = typeof document !== 'undefined'

export function configInjector(componentName: string, configDef: SplitflowConfigDef) {
    let config: Readable<ConfigNode>

    return () => {
        if (!config) {
            const { devtool, definitions } = getDesigner()
            if (devtool) {
                devtool.registerConfigFragment(defToConfig(componentName, configDef))
                config = devtool.configuration
            } else {
                config = readable(definitions.config ?? defToConfig(componentName, configDef) ?? {})
            }
        }
        return config
    }
}

export function elementInjector(componentName: string) {
    return ({ elementName, variants, designer }: StyleContext) => {
        //const designer = getDesigner()
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
    let injected = false

    return ({designer}) => {
        if (injected) return

        //const designer = getDesigner()
        const { devtool, definitions, config } = designer

        if (devtool && designer.include(componentName)) {
            devtool.registerStyleFragment(defToStyle(componentName, styleDef))
            injected = true
            return
        }

        if (browser) {
            const root = merge(
                defToStyle(componentName, styleDef),
                componentStyle(componentName, definitions.style)
            )
            applyCSS(styleToCSS(root), stylesheet('style'))
            injected = true
            return
        }

        if (config.ssr) {
            const root = merge(
                defToStyle(componentName, styleDef),
                componentStyle(componentName, definitions.style)
            )
            designer.registerStyleCSS(styleToCSS(root))
            injected = true
            return
        }

        // mark as injected despite noop
        injected = true
    }
}

export function themeInjector(themeName: string, themeData: ThemeDataNode) {
    let injected = false

    return ({designer}) => {
        if (injected) return

        //const designer = getDesigner()
        const { devtool, definitions, config } = designer

        if (devtool) {
            devtool.registerThemeFragment({ type: 'snapshot', [themeName]: themeData })
            injected = true
            return
        }

        if (browser) {
            const root = merge<ThemeNode, ThemeNode>(
                { type: 'snapshot', [themeName]: themeData },
                { type: 'snapshot', [themeName]: definitions.theme?.[themeName] }
            )
            applyCSS(themeToCSS(root), stylesheet('theme'))
            injected = true
            return
        }

        if (config.ssr) {
            const root = merge<ThemeNode, ThemeNode>(
                { type: 'snapshot', [themeName]: themeData },
                { type: 'snapshot', [themeName]: definitions.theme?.[themeName] }
            )
            designer.registerThemeCSS(styleToCSS(root))
            injected = true
            return
        }

        // mark as injected despite noop
        injected = true
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
