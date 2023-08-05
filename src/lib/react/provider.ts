import React from "react"
import { SplitflowDesigner } from "../designer"

export const DesignerContext = React.createContext<SplitflowDesigner>(undefined)

interface DesignerProviderProps {
    designer: SplitflowDesigner
    children: React.ReactNode
}

export function DesignerProvider({designer, children}: DesignerProviderProps) {

    return React.createElement(DesignerContext.Provider, {value: designer}, children)
}