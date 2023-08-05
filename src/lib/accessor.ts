import { SplitflowConfigDef, defToConfig } from '@splitflow/lib/config'
import { readable } from '@splitflow/core/stores'
import { SplitflowDesigner } from './designer'

export function configAccessor(componentName: string, configDef: SplitflowConfigDef) {
    return (designer: SplitflowDesigner) => {
        const { devtool, definitions } = designer
        if (devtool) {
            devtool.registerConfigFragment(defToConfig(componentName, configDef))
            return devtool.configuration
        }
        return readable(definitions.config ?? defToConfig(componentName, configDef) ?? {})
    }
}
