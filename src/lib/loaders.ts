import { actionRequestX, getResult } from '@splitflow/lib'
import {
    GetDesignAction,
    GetDesignEndpoint,
    GetDesignResult,
    GetThemeAction,
    GetThemeEndpoint,
    GetThemeResult
} from '@splitflow/lib/design'
import { SplitflowDesignerKit, podNode } from './designer'

export interface SplitflowDesignerData {
    getStyleDesignResult?: GetDesignResult
    getConfigDesignResult?: GetDesignResult
    getThemeResult?: GetThemeResult
}

export async function loadSplitflowDesignerData(
    kit: SplitflowDesignerKit
): Promise<SplitflowDesignerData> {
    if (kit.devtool) return kit.devtool.load(podNode(kit.config))
    return loadRemoteSplitflowDesignerData(kit)
}

export async function loadRemoteSplitflowDesignerData(
    kit: SplitflowDesignerKit
): Promise<SplitflowDesignerData> {
    const { accountId } = kit.config
    const { podId, podType } = podNode(kit.config)

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
            getStyleDesignResult,
            getConfigDesignResult,
            getThemeResult
        }
    }
    return {}
}
