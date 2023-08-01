import { ThemeDataNode } from '@splitflow/lib/style'
import { themeInjector } from './injectors'

export type Theme = () => string

export function createTheme(themeName: string, themeData?: ThemeDataNode) {
    const injectors = []

    if (themeData) {
        injectors.push(themeInjector(themeName, themeData))
    }

    return () => {
        injectors.forEach((injector) => injector())
        return `sft-${themeName}`
    }
}
