import { SplitflowStyleDef } from 'core/style'
import app from './app'
import { astFragmentInjector, componentInjector, cssInjector } from './injectors'
import { classNameRenderer, cssClassNameRenderer } from './renderers'

export interface Style {
    [elementName: string]: (variants?: Variants) => string
}

export interface Variants {
    [variantName: string]: boolean | string
}

export interface StyleContext {
    elementName: string
    variants: Variants
}

export interface CSSStyleDef {
    [key: string]: string | ((variants: Variants) => string)
}

function isCSSStyleDef(value: any): value is CSSStyleDef {
    const property = value && Object.values(value)[0]
    return typeof property === 'string' || typeof property === 'function'
}

function isSplitflowStyleDef(value: any): value is SplitflowStyleDef {
    const property = value && Object.values(value)[0]
    return typeof property == 'object' && property !== null
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
    const eagerInjectors = []
    const injectors = []
    const renderers = []

    if (typeof arg1 !== 'string') {
        const parent = arg1 as any

        injectors.push(...parent._injectors)
        renderers.push(...parent._renderers)
    }

    if (typeof arg1 === 'string') {
        const componentName = arg1

        if (app().devtool && app().include(componentName)) {
            injectors.push(componentInjector(componentName))
        }
        renderers.push(classNameRenderer(componentName))
    }

    if (isCSSStyleDef(arg2)) {
        const root = arg2

        renderers.push(cssClassNameRenderer(root))
    }

    if (typeof arg1 === 'string' && isSplitflowStyleDef(arg2)) {
        const componentName = arg1
        const root = arg2

        app().devtool && eagerInjectors.push(astFragmentInjector(componentName, root))
        !app().devtool && eagerInjectors.push(cssInjector(componentName, root))
    }

    eagerInjectors.forEach((injector) => injector())

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
