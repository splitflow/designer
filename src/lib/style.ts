import { SplitflowStyleDef } from '@splitflow/lib/style'
import { styleInjector, elementInjector } from './injectors'
import { classNameRenderer, cssClassNameRenderer } from './renderers'
import { SplitflowDesigner } from './designer'

export interface StyleContext {
    elementName: string
    variants: Variants
    designer: SplitflowDesigner
}

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

export function createStyle(arg1: unknown, arg2?: unknown): any {
    const injectors = []
    const renderers = []

    if (typeof arg1 !== 'string') {
        const parent = arg1 as any
        injectors.push(...parent._injectors)
        renderers.push(...parent._renderers)
    }

    if (typeof arg1 === 'string') {
        const componentName = arg1
        injectors.push(elementInjector(componentName))
        renderers.push(classNameRenderer(componentName))
    }

    if (isCSSStyleDef(arg2)) {
        const cssStyleDeftyleDef = arg2
        renderers.push(cssClassNameRenderer(cssStyleDeftyleDef))
    }

    if (typeof arg1 === 'string' && !isCSSStyleDef(arg2)) {
        const componentName = arg1
        const styleDef = arg2 as SplitflowStyleDef
        injectors.push(styleInjector(componentName, styleDef))
    }

    const target = { injectors, renderers }

    return new Proxy(target, {
        get: (target, property: string) => {
            if (property === '_injectors') return target.injectors
            if (property === '_renderers') return target.renderers

            const elementName = property
            return (variants?: Variants) => {
                const context = { elementName, variants }
                target.injectors.forEach((injector) => injector(context))

                const classNames = target.renderers.reduce((result, renderer) => {
                    result.push(...renderer(context))
                    return result
                }, [])
                return classNames.join(' ')
            }
        }
    })
}
