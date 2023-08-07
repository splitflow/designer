import { ConfigNode } from '@splitflow/lib/config'
import { StyleNode, ThemeNode } from '@splitflow/lib/style'

const STYLE_ENDPOINT = 'https://main.splitflow.workers.dev/ast'
const THEME_ENDPOINT = 'https://main.splitflow.workers.dev/theme'
const CONFIG_ENDPOINT = 'https://config.splitflow.workers.dev'

export async function loadStyleDefinition(projectId: string): Promise<StyleNode> {
    const response = await fetch(`${STYLE_ENDPOINT}/${projectId}`)
    if (response.status === 200) {
        return response.json()
    }
    throw new Error(response.statusText)
}

export async function loadThemeDefinition(projectId: string): Promise<ThemeNode> {
    const response = await fetch(`${THEME_ENDPOINT}/${projectId}`)
    if (response.status === 200) {
        return response.json()
    }
    throw new Error(response.statusText)
}

export async function loadConfigDefinition(projectId: string): Promise<ConfigNode> {
    const response = await fetch(`${CONFIG_ENDPOINT}/${projectId}`)
    if (response.status === 200) {
        return response.json()
    }
    throw new Error(response.statusText)
}