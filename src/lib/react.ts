import React from 'react'
import app from './app'
import { componentInjector } from './injectors'
import { classNameRenderer } from './renderers'
import { Style } from './style'

interface ReactStyle {
    [elementName: string]: React.FunctionComponent
}

export function createStyle<T extends ReactStyle>(componentName: string, styleDef: T): T
export function createStyle<T extends ReactStyle>(parent: Style, styleDef: T): T

export function createStyle<T extends ReactStyle>(arg: unknown, styleDef: T): T {
    const injectors = []
    const renderers = []

    if (typeof arg !== 'string') {
        const parent = arg as any

        injectors.push(...parent._injectors)
        renderers.push(...parent._renderers)
    }

    if (typeof arg === 'string') {
        const componentName = arg

        if (app().devtool && app().include(componentName)) {
            injectors.push(componentInjector(componentName))
        }
        renderers.push(classNameRenderer(componentName))
    }

    function wrap([elementName, functionComponent]: [string, React.FunctionComponent]) {
        const wrappedFunctionComponent = React.forwardRef((props, ref) => {
            const context = { elementName }
            injectors.forEach((injector) => injector(context))

            const classNames = renderers.reduce((result, renderer) => {
                result.push(...renderer(context))
                return result
            }, [])
            const className = classNames.join(' ')

            const forwardProps = {
                ...props,
                ref,
                className
            }

            return React.createElement(functionComponent, forwardProps as any)
        })
        return [elementName, wrappedFunctionComponent]
    }

    return Object.fromEntries(Object.entries(styleDef).map(wrap))
}
