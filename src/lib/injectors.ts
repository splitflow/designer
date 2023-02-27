import { ASTToCSSVisitor, RootNode } from 'core/ast'
import { cssRule, stylesheet } from 'core/utils/dom'
import { importInternal } from './internal'
import { SplitflowStyleDef, StyleContext } from './style'

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
    return () => registerASTFragmentInternal(toASTFragment(componentName, styleDef))
}

export function cssInjector(componentName: string, styleDef: SplitflowStyleDef) {
    return () => applyCSS(toCSS(componentName, styleDef), stylesheet('splitflow-style'))
}

function toASTFragment(componentName: string, styleDef: SplitflowStyleDef): RootNode {
    return Object.entries(styleDef).reduce(
        (ast, [elementName, definition]) => {
            ast[componentName + '-' + elementName] = definition
            return ast
        },
        { type: 'fragment' }
    )
}

function toCSS(componentName: string, styleDef: SplitflowStyleDef) {
    const visitor = new ASTToCSSVisitor()
    return visitor.root(toASTFragment(componentName, styleDef))
}

function applyCSS(css: any, stylesheet: CSSStyleSheet) {
    for (let [selectorText, properties] of Object.entries(css)) {
        const rule = cssRule(stylesheet, selectorText)
        for (let [propertyName, value] of Object.entries(properties)) {
            if (value) {
                rule.style.setProperty(propertyName, value)
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

function registerASTFragmentInternal(root: RootNode) {
    importInternal().then(({ registerASTFragment }) => registerASTFragment(root))
}
