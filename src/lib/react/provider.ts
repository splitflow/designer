import React from 'react'
import { SplitflowDesigner } from '../designer'

export const SplitflowDesignerContext = React.createContext<SplitflowDesigner>(undefined)

interface SplitflowDesignerProviderProps {
    designer: SplitflowDesigner
    children: React.ReactNode
}

export function SplitflowDesignerProvider({ designer, children }: SplitflowDesignerProviderProps) {
    return React.createElement(SplitflowDesignerContext.Provider, { value: designer }, children)
}
