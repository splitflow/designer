import { getContext, setContext } from 'svelte'
import { Style, createStyle as _createStyle } from '../style'
import { SplitflowDesigner } from '../designer'

const SPLITFLOW_DESIGNER_SYMBOL = Symbol('SplitflowDesigner')

export function setSplitflowDesignerContext(designer: SplitflowDesigner) {
    setContext(SPLITFLOW_DESIGNER_SYMBOL, designer)
}

export function getSplitflowDesignerContext() {
    return getContext<SplitflowDesigner>(SPLITFLOW_DESIGNER_SYMBOL)
}

export function createStyle(componentName: string): Style
export function createStyle(style: Style): Style
export function createStyle(arg1: unknown) {
    const designer = getContext<SplitflowDesigner>(SPLITFLOW_DESIGNER_SYMBOL)

    if (typeof arg1 === 'string') {
        const componentName = arg1
        return _createStyle(componentName, designer)
    }

    if (arg1) {
        const style = arg1 as Style
        return designer ? _createStyle(style, designer) : style
    }
}
