import { ConfigNode, SplitflowConfigDef, defToConfig } from '@splitflow/lib/config'
import { readable } from '@splitflow/core/stores'
import { SplitflowDesigner } from './designer'
import { merge } from '@splitflow/core/utils'

export function configAccessor(componentName: string, configDef: SplitflowConfigDef) {
    return (designer: SplitflowDesigner) => {
        const { devtool, definitions } = designer
        
        if (devtool) {
            devtool.registerConfigFragment(defToConfig(componentName, configDef))
            return devtool.configuration
        }

        const root = merge(
            defToConfig(componentName, configDef),
            componentConfig(componentName, definitions.style)
        )
        return readable(root)
    }
}

function componentConfig(componentName: string, root: ConfigNode) {
    if (root) {
        return Object.fromEntries(
            Object.entries(root).filter(([key]) => key.startsWith(componentName))
        )
    }
}