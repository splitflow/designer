import React from 'react'
import { elementInjector } from '../injectors'
import { classNameFormatter } from '../formatters'
import { Style, Variants, createStyle } from '../style'
import { SplitflowDesignerContext } from './provider'
import { SplitflowDesigner, getDesigner } from '../designer'

interface ReactStyle {
    [elementName: string]: React.FunctionComponent
}

export function styled<T extends ReactStyle>(componentName: string, styleDef: T): T
export function styled<T extends ReactStyle>(parent: Style, styleDef: T): T
export function styled<T extends ReactStyle>(arg: unknown, styleDef: T): T {
    let injectors: Injectors = {}
    let formatters: Formatters = {}

    if (typeof arg !== 'string') {
        const parent = arg as any
        injectors = parent._injectors
        formatters = parent._formatters
    }

    if (typeof arg === 'string') {
        const componentName = arg
        injectors.element = elementInjector(componentName)
        formatters.className = classNameFormatter(componentName)
    }

    function wrap([elementName, functionComponent]: [string, React.FunctionComponent]) {
        const wrappedFunctionComponent = React.forwardRef((props, ref) => {
            const designer = React.useContext(SplitflowDesignerContext) ?? getDesigner()

            injectors.style?.(designer)
            injectors.element?.(elementName, undefined, designer)

            const className = formatters.className?.(elementName, undefined) ?? [].join(' ')

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

interface Injectors {
    element?: (elementName: string, variants: Variants, designer: SplitflowDesigner) => void
    style?: (designer: SplitflowDesigner) => void
}

interface Formatters {
    className?: (elementName: string, variants: Variants) => string[]
}

export function useStyle(style: Style) {
    const designer = React.useContext(SplitflowDesignerContext)
    return designer ? createStyle(style, designer) : style
}
