import { ThemeDataNode } from '@splitflow/lib/style'
import { themeInjector } from './injectors'
import { SplitflowDesigner, getDefaultDesigner, isSplitflowDesigner } from './designer'
import { themeClassNameFormatter } from './formatters'

export type Theme = () => string

interface Injectors {
    theme?: (desoigner: SplitflowDesigner) => void
}

interface Formatters {
    className?: () => string[]
}

export function createTheme(themeName: string, themeData?: ThemeDataNode): Theme
export function createTheme(parent: Theme, designer: SplitflowDesigner): Theme
export function createTheme(themeName: string, designer: SplitflowDesigner): Theme
export function createTheme(arg1: unknown, arg2: unknown): any {
    let injectors: Injectors = {}
    let formatters: Formatters = {}
    let designer: SplitflowDesigner

    if (typeof arg1 !== 'string') {
        const parent = arg1 as any
        injectors = parent._injectors
        formatters = parent._formatters
    }

    if (typeof arg1 === 'string') {
        const themeName = arg1
        const themeData = isSplitflowDesigner(arg2) ? undefined : (arg2 as ThemeDataNode)

        formatters.className = themeClassNameFormatter(themeName)
        injectors.theme = themeInjector(themeName, themeData)
    }

    if (isSplitflowDesigner(arg2)) {
        designer = arg2
    }

    const fn = () => {
        injectors.theme?.(designer ?? getDefaultDesigner())
        return formatters.className().join(' ')
    }
    fn._injectors = injectors
    fn._formatters = formatters
    return fn
}
