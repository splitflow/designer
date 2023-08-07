import React from 'react'
import { SplitflowDesignerContext } from './provider'
import { Theme, createTheme } from '../theme'

export function useTheme(theme: Theme) {
    const designer = React.useContext(SplitflowDesignerContext)
    return designer ? createTheme(theme, designer) : theme
}
