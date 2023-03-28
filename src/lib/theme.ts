import { ThemeDataNode } from '@splitflow/core/theme'
import app from './app'
import { cssThemeInjector, themeFragmentInjector } from './injectors'

export type Theme = () => string

export function createTheme(themeName: string, themeData?: ThemeDataNode) {
    const eagerInjectors = []

    if (themeData) {
        app().devtool && eagerInjectors.push(themeFragmentInjector(themeName, themeData))
        !app().devtool && eagerInjectors.push(cssThemeInjector(themeName, themeData))
    }

    eagerInjectors.forEach((injector) => injector())

    return () => `sft-${themeName}`
}