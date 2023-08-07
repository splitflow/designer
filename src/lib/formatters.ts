import { ConfigNode } from '@splitflow/lib/config'
import { CSSStyleDef, Variants } from './style'
import { ExpressionVariables, StringDef, compile } from '@splitflow/core/definition'

export function optionEnabledFormatter(componentName: string) {
    return (optionName: string, value: boolean, config: ConfigNode) => {
        return config?.[`${componentName}-${optionName}`]?.enabled ?? value
    }
}

export function optionTextFormatter(componentName: string) {
    return (
        optionName: string,
        value: string,
        variables: ExpressionVariables,
        config: ConfigNode
    ) => {
        const definition: StringDef = { type: 'string', variables }
        return compile(definition).format(
            config?.[`${componentName}-${optionName}`]?.content?.text ?? value
        )
    }
}

export function optionSVGFormatter(componentName: string) {
    return (optionName: string, data: string, config: ConfigNode) => {
        return (
            'data:image/svg+xml,' +
            encodeURIComponent(config?.[`${componentName}-${optionName}`]?.content?.svg ?? data)
        )
    }
}

export function optionPropertyFormatter(componentName: string) {
    return (optionName: string, propertyName: string, value: string, config: ConfigNode) => {
        return config?.[`${componentName}-${optionName}`]?.property?.[propertyName] ?? value
    }
}

export function classNameFormatter(componentName: string) {
    return (elementName: string, variants: Variants) => {
        return [`sf-${componentName}-${elementName}`, ...variantsClassNames(variants)]
    }
}

export function cssClassNameFormatter(styleDef: CSSStyleDef) {
    return (elementName: string, variants: Variants) => {
        return cssClassNames(styleDef[elementName], variants)
    }
}

export function themeClassNameFormatter(themeName: string) {
    return () => {
        return [`sft-${themeName}`]
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

function cssClassNames(definition: string | ((variants?: Variants) => string), variants: Variants) {
    if (typeof definition === 'function') return [definition(variants)]
    if (definition) return [definition]
    return []
}
