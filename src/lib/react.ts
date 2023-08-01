import React from 'react'
import { elementInjector } from './injectors'
import { classNameRenderer } from './renderers'
import { Style, Variants } from './style'
import { SplitflowDesigner } from './designer'

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

        injectors.push(elementInjector(componentName))
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


const DesignerContext = React.createContext<SplitflowDesigner>(undefined)

interface DesignerProviderProps {
    designer: SplitflowDesigner
    children: React.ReactNode
}

export function DesignerProvider({designer, children}: DesignerProviderProps) {

    return React.createElement(DesignerContext.Provider, {value: designer}, children)
}

export function useStyle(parent: Style) {
    const designer = React.useContext(DesignerContext)

    return new Proxy(parent, {
        get: (target, property: string) => {
            if (property === '_injectors') return target.injectors
            if (property === '_renderers') return target.renderers

            const injectors = target.injectors as any
            const renderers = target.renderers as any

            const elementName = property
            return (variants?: Variants) => {
                const context = { elementName, variants, designer }
                injectors.forEach((injector) => injector(context))

                const classNames = renderers.reduce((result, renderer) => {
                    result.push(...renderer(context))
                    return result
                }, [])
                return classNames.join(' ')
            }
        }
    })
}