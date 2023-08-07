import { StyleNode, ThemeNode } from '@splitflow/lib/style'
import { Devtool, createDevtool } from './devtool'
import { ConfigNode } from '@splitflow/lib/config'
import { loadConfigDefinition, loadStyleDefinition, loadThemeDefinition } from './loaders'

const browser = typeof document !== 'undefined'

interface Namespace {
    designer?: SplitflowDesigner
}

const NAMESPACE: Namespace = (globalThis.splitflow ??= {})

export interface DesignerConfig {
    projectId?: string
    devtool?: boolean
    include?: string[]
    ssr?: boolean
}

interface DesignerDefinitions {
    style: StyleNode
    theme: ThemeNode
    config: ConfigNode
}

export function createSplitflowDesigner(
    config?: DesignerConfig,
    definitions?: DesignerDefinitions,
    devtool?: Devtool
) {
    definitions ??= { style: undefined, theme: undefined, config: undefined }
    devtool ??= config?.devtool && browser ? createDevtool(config) : undefined
    config ??= {}

    return new SplitflowDesigner(config, definitions, devtool)
}

export function initializeSplitflowDesigner(
    config?: DesignerConfig,
    definitions?: DesignerDefinitions,
    devtool?: Devtool
) {
    if (!NAMESPACE.designer) {
        NAMESPACE.designer = createSplitflowDesigner(config, definitions, devtool)
    }
    return NAMESPACE.designer
}

export function getDesigner(): SplitflowDesigner {
    return NAMESPACE.designer ?? initializeSplitflowDesigner()
}

export class SplitflowDesigner {
    constructor(config: DesignerConfig, definitions: DesignerDefinitions, devtool: Devtool) {
        this.config = config
        this.definitions = definitions
        this.devtool = devtool
    }

    config: DesignerConfig
    definitions: DesignerDefinitions
    devtool: Devtool
    #styleCss: any = {}
    #themeCss: any = {}

    include(componentName: string) {
        return this.config?.include?.indexOf(componentName) != -1 ?? true
    }

    registerStyleCSS(css: any) {
        this.#styleCss = { ...this.#styleCss, ...css }
    }

    registerThemeCSS(css: any) {
        this.#themeCss = { ...this.#themeCss, ...css }
    }

    async loadDefinitions() {
        this.definitions = await loadSplitflowDesignerDefinitions(this.config)
    }

    printHeaders() {
        if (!browser) {
            return `
                <style type="text/css" data-splitflow-id="style">
                    ${formatCss(this.#styleCss)}
                </style>
                <style type="text/css" data-splitflow-id="theme">
                    ${formatCss(this.#themeCss)}
                </style>
            `
        }
    }

    printStyleCss() {
        if (!browser) {
            return formatCss(this.#styleCss)
        }
    }

    printThemeCss() {
        if (!browser) {
            return formatCss(this.#themeCss)
        }
    }

    destroy() {
        this.devtool.destroy()
        if (NAMESPACE.designer === this) {
            NAMESPACE.designer = undefined
        }
    }
}

export async function loadSplitflowDesignerDefinitions(
    config: DesignerConfig
): Promise<DesignerDefinitions> {
    const [style, theme, _config] = await Promise.all([
        loadStyleDefinition(config?.projectId),
        loadThemeDefinition(config?.projectId),
        loadConfigDefinition(config?.projectId)
    ])
    return { style, theme, config: _config }
}

function formatCss(css: any) {
    const tokens = []

    for (let [selectorText, properties] of Object.entries(css)) {
        tokens.push(selectorText)
        tokens.push('{')
        for (let [propertyName, value] of Object.entries(properties)) {
            if (value !== null) {
                const propertyValue = formatCssProperyValue(value)
                tokens.push(propertyName)
                tokens.push(':')
                tokens.push(propertyValue)
                tokens.push(';')
            }
        }
        tokens.push('}')
    }
    return tokens.join('')
}

function formatCssProperyValue(value: string) {
    if (value.charAt(0) === '!') {
        return `${value.slice(1)} !important`
    }
    return value
}
