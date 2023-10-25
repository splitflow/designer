import { actionRequest, getResult } from '@splitflow/lib'
import { GetNodeAction, GetNodeResult } from '@splitflow/lib/design'

export function getStyleDefinition(podId: string) {
    const action: GetNodeAction = { type: 'get-node', designId: podId, style: true }
    const response = fetch(actionRequest('design', action))
    return getResult<GetNodeResult>(response)
}

export function getThemeDefinition(podId: string) {
    const action: GetNodeAction = { type: 'get-node', designId: podId, theme: true }
    const response = fetch(actionRequest('design', action))
    return getResult<GetNodeResult>(response)
}

export function getConfigDefinition(podId: string) {
    const action: GetNodeAction = { type: 'get-node', designId: podId, config: true }
    const response = fetch(actionRequest('design', action))
    return getResult<GetNodeResult>(response)
}
