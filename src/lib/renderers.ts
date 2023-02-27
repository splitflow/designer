import { CSSStyleDef, StyleContext, Variants } from './style'

export function classNameRenderer(componentName: string) {
    return ({ elementName, variants }: StyleContext) => {
        return [`${componentName}-${elementName}`, ...variantsClassNames(variants)]
    }
}

export function cssClassNameRenderer(styleDef: CSSStyleDef) {
    return ({ elementName, variants }: StyleContext) => {
        return cssClassNames(styleDef[elementName], variants)
    }
}

function variantsClassNames(variants: Variants) {
    if (!variants) return []

    return Object.entries(variants).reduce((classNames, [variantName, value]) => {
        if (value === true) {
            classNames.push(variantName)
        }
        return classNames
    }, [])
}

function cssClassNames(
    definition: string | ((variants?: Variants) => string),
    variants: Variants
) {
    if (typeof definition === 'function') return [definition(variants)]
    if (definition) return [definition]
    return []
}