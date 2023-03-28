import { ASTToCSSVisitor, cssProperyValue, RootNode as ASTRootNode } from '@splitflow/core/ast'
import { SplitflowStyleDef, styleToAST } from '@splitflow/core/style'
import { ThemeDataNode, ThemeToCSSVisitor, RootNode as ThemeRootNode } from '@splitflow/core/theme'
import { cssRule, stylesheet } from '@splitflow/core/utils/dom'
import { importInternal } from './internal'
import { StyleContext } from './style'

export function componentInjector(componentName: string) {
    return ({ elementName, variants }: StyleContext) => {
        registerComponentInternal(componentName, elementName)

        if (variants) {
            Object.entries(variants)
                .filter(isSplitflowVariant)
                .forEach(([variantName]) => {
                    registerComponentInternal(componentName, elementName, variantName)
                })
        }
    }
}

export function astFragmentInjector(componentName: string, styleDef: SplitflowStyleDef) {
    return () => registerASTFragmentInternal(styleToAST(componentName, styleDef))
}

export function themeFragmentInjector(themeName: string, themeData: ThemeDataNode) {
    return () => registerThemeFragmentInternal({ type: 'snapshot', [themeName]: themeData })
}

export function cssInjector(componentName: string, styleDef: SplitflowStyleDef) {
    return () => applyCSS(toCSS(componentName, styleDef), stylesheet('style'))
}

export function cssThemeInjector(themeName: string, themeData: ThemeDataNode) {
    return () => applyCSS(themeToCSS(themeName, themeData), stylesheet('theme'))
}

function toCSS(componentName: string, styleDef: SplitflowStyleDef) {
    const visitor = new ASTToCSSVisitor()
    return visitor.root(styleToAST(componentName, styleDef))
}

function themeToCSS(themeName: string, themeData: ThemeDataNode) {
    const visitor = new ThemeToCSSVisitor()
    return visitor.root({ type: 'snapshot', [themeName]: themeData })
}

function applyCSS(css: any, stylesheet: CSSStyleSheet) {
    for (let [selectorText, properties] of Object.entries(css)) {
        const rule = cssRule(stylesheet, selectorText)
        for (let [propertyName, value] of Object.entries(properties)) {
            if (value) {
                const [propertyValue, propertyPriority] = cssProperyValue(value)
                rule.style.setProperty(propertyName, propertyValue, propertyPriority)
            }
        }
    }
}

function isSplitflowVariant([_, value]) {
    return typeof value == 'boolean'
}

function registerComponentInternal(
    componentName: string,
    elementName: string,
    variantName?: string
) {
    importInternal().then(({ registerComponent }) =>
        registerComponent(componentName, elementName, variantName)
    )
}

function registerASTFragmentInternal(root: ASTRootNode) {
    importInternal().then(({ registerASTFragment }) => registerASTFragment(root))
}

function registerThemeFragmentInternal(root: ThemeRootNode) {
    importInternal().then(({ registerThemeFragment }) => registerThemeFragment(root))
}
