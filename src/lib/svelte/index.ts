import { getContext, setContext } from 'svelte'
import { Style, createStyle as _createStyle } from '../style'
import { SplitflowDesigner } from '../designer'
import { Config, createConfig as _createConfig } from '../config'
import { Readable } from 'svelte/store'
import { Theme, createTheme as _createTheme } from '../theme'

const SPLITFLOW_DESIGNER_SYMBOL = Symbol('SplitflowDesigner')

export function setSplitflowDesignerContext(designer: SplitflowDesigner) {
    setContext(SPLITFLOW_DESIGNER_SYMBOL, designer)
}

export function getSplitflowDesignerContext() {
    return getContext<SplitflowDesigner>(SPLITFLOW_DESIGNER_SYMBOL)
}

export function createStyle(componentName: string): Style
export function createStyle(style: Style): Style
export function createStyle(arg1: any) {
    const designer = getContext<SplitflowDesigner>(SplitflowDesigner)

    if (typeof arg1 === 'string') {
        const componentName = arg1
        return _createStyle(componentName, designer)
    }

    if (arg1) {
        const style = arg1 as Style
        return designer ? _createStyle(style, designer) : style
    }
}

export function createTheme(themeName: string): Theme
export function createTheme(theme: Theme): Theme
export function createTheme(arg1: any) {
    const designer = getContext<SplitflowDesigner>(SplitflowDesigner)

    if (typeof arg1 === 'string') {
        const themeName = arg1
        return _createTheme(themeName, designer)
    }

    if (arg1) {
        const theme = arg1 as Theme
        return designer ? _createTheme(theme, designer) : theme
    }
}

export function createConfig(componentName: string): Readable<Config>
export function createConfig(config: Readable<Config>): Readable<Config>
export function createConfig(arg1: any) {
    const designer = getContext<SplitflowDesigner>(SplitflowDesigner)

    if (typeof arg1 === 'string') {
        const componentName = arg1
        return _createConfig(componentName, designer)
    }

    if (arg1) {
        const config = arg1 as Readable<Config>
        return designer ? _createConfig(config, designer) : config
    }
}

export * from './svg'
