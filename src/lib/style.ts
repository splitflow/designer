import { SplitflowStyleDef } from '@splitflow/lib/style'
import { styleInjector, elementInjector } from './injectors'
import { classNameFormatter, cssClassNameFormatter } from './formatters'
import { SplitflowDesigner, getDefaultDesigner, isSplitflowDesigner } from './designer'

export interface Style {
    [elementName: string]: (variants?: Variants) => string
}

export interface Variants {
    [variantName: string]: boolean | string
}

export interface CSSStyleDef {
    [key: string]: string | ((variants: Variants) => string)
}

function isCSSStyleDef(value: any): value is CSSStyleDef {
    const property = value && Object.values(value)[0]
    return typeof property === 'string' || typeof property === 'function'
}

export function createStyle(componentName: string): Style

export function createStyle<
    U extends SplitflowStyleDef,
    V extends { [key in keyof U]: (variants?: Variants) => string }
>(componentName: string, styleDef: U): V & Style

export function createStyle<
    U extends CSSStyleDef,
    V extends { [key in keyof U]: (variants?: Variants) => string }
>(componentName: string, styleDef: U): V & Style

export function createStyle<
    U extends Style,
    V extends { [key in keyof U]: string | ((variants: Variants) => string) },
    W extends { [key in keyof (U | V)]: (variants?: Variants) => string }
>(parent: U, styleDef: V | CSSStyleDef): W & Style

export function createStyle<U extends Style>(parent: U, designer: SplitflowDesigner): U & Style
export function createStyle(componentName: string, designer: SplitflowDesigner): Style

export function createStyle(arg1: unknown, arg2?: unknown): any {
    let injectors: Injectors = {}
    let formatters: Formatters = {}
    let designer: SplitflowDesigner

    if (typeof arg1 !== 'string') {
        const parent = arg1 as any
        injectors = parent._injectors
        formatters = parent._formatters
    }

    if (typeof arg1 === 'string') {
        const componentName = arg1
        const styleDef =
            isCSSStyleDef(arg2) || isSplitflowDesigner(arg2)
                ? undefined
                : (arg2 as SplitflowStyleDef)

        injectors.element = elementInjector(componentName)
        formatters.className = classNameFormatter(componentName)
        injectors.style = styleInjector(componentName, styleDef)
    }

    if (isCSSStyleDef(arg2)) {
        const cssStyleDeftyleDef = arg2
        formatters.cssClassName = cssClassNameFormatter(cssStyleDeftyleDef)
    }

    if (isSplitflowDesigner(arg2)) {
        designer = arg2
    }

    return createStyleProxy(injectors, formatters, designer)
}

interface Injectors {
    element?: (elementName: string, variants: Variants, preset: 'svg', designer: SplitflowDesigner) => void
    style?: (designer: SplitflowDesigner) => void
}

interface Formatters {
    className?: (elementName: string, variants: Variants, designer: SplitflowDesigner) => string[]
    cssClassName?: (elementName: string, variants: Variants) => string[]
}

function createStyleProxy(
    injectors: Injectors,
    formatters: Formatters,
    designer: SplitflowDesigner
) {
    return new Proxy(
        {},
        {
            get: (_, propertyName: string) => {
                if (propertyName === '_injectors') return injectors
                if (propertyName === '_formatters') return formatters

                const tokens = propertyName.split('$')
                const elementName = tokens[0]
                const preset = tokens[1] === 'svg' ? 'svg' : undefined

                return (variants?: Variants) => {
                    designer ??= getDefaultDesigner()
                    injectors.style?.(designer)
                    injectors.element?.(elementName, variants, preset, designer)

                    return [
                        ...(formatters.className?.(elementName, variants, designer) ?? []),
                        ...(formatters.cssClassName?.(elementName, variants) ?? [])
                    ].join(' ')
                }
            }
        }
    )
}
