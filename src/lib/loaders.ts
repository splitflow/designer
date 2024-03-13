import { actionRequestX, getResult } from '@splitflow/lib'
import {
    GetDesignAction,
    GetDesignEndpoint,
    GetDesignResult,
    GetThemeAction,
    GetThemeEndpoint,
    GetThemeResult
} from '@splitflow/lib/design'
import { DesignerConfig, SplitflowDesignerKit } from './designer'

export interface DesignerBundle {
    designerConfig: DesignerConfig
    getStyleDesignResult?: GetDesignResult
    getConfigDesignResult?: GetDesignResult
    getThemeResult?: GetThemeResult
}

export function isDesignerBundle(
    bundle: DesignerConfig | DesignerBundle
): bundle is DesignerBundle {
    return !!(bundle as any).designerConfig
}

export async function loadSplitflowDesignerBundle(
    kit: SplitflowDesignerKit
): Promise<DesignerBundle> {
    if (kit.devtool) {
        const bundle = await kit.devtool.load(kit.pod)
        return { designerConfig: kit.config, ...bundle }
    }
    if (kit.config.remote) {
        return loadRemoteSplitflowDesignerBundle(kit)
    }
    return { designerConfig: kit.config }
}

export async function loadRemoteSplitflowDesignerBundle(
    kit: SplitflowDesignerKit
): Promise<DesignerBundle> {
    const { accountId } = kit.config
    const { podId, podType } = kit.pod

    if (accountId && podId && podType) {
        const action1: GetDesignAction = {
            type: 'get-design',
            accountId,
            podId,
            podType: `${podType}s`,
            style: true
        }
        const response1 = fetch(actionRequestX(action1, GetDesignEndpoint))

        const action2: GetDesignAction = {
            type: 'get-design',
            accountId,
            podId,
            podType: `${podType}s`,
            config: true
        }
        const response2 = fetch(actionRequestX(action2, GetDesignEndpoint))

        const action3: GetThemeAction = { type: 'get-theme', accountId }
        const response3 = fetch(actionRequestX(action3, GetThemeEndpoint))

        const [getStyleDesignResult, getConfigDesignResult, getThemeResult] = await Promise.all([
            getResult<GetDesignResult>(response1),
            getResult<GetDesignResult>(response2),
            getResult<GetThemeResult>(response3)
        ])

        return {
            designerConfig: kit.config,
            getStyleDesignResult,
            getConfigDesignResult,
            getThemeResult
        }
    }
    return { designerConfig: kit.config }
}
