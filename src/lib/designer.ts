import { StyleNode, ThemeNode } from '@splitflow/lib/style'
import { Devtool, createDevtool } from './devtool'
import { ConfigNode } from '@splitflow/lib/config'
import { loadConfigDefinition, loadStyleDefinition, loadThemeDefinition } from './loader'

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

export function initializeSplitflowDesigner(
    config?: DesignerConfig,
    definitions?: DesignerDefinitions,
    devtool?: Devtool
) {
    if (!NAMESPACE.designer) {
        definitions ??= { style: undefined, theme: undefined, config: undefined }
        devtool ??= config?.devtool ? createDevtool(config) : undefined
        config ??= {}

        NAMESPACE.designer = new SplitflowDesigner(config, definitions, devtool)
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
        const [style, theme, config] = await Promise.all([
            loadStyleDefinition(this.config?.projectId),
            loadThemeDefinition(this.config?.projectId),
            loadConfigDefinition(this.config?.projectId)
        ])
        this.definitions = { style, theme, config }
    }

    printHeaders() {
        return `
            <style type="text/css" data-splitflow-id="style">${formatCss(this.#styleCss)}</style>
            <style type="text/css" data-splitflow-id="theme">${formatCss(this.#themeCss)}</style>
        `
    }

    printStyleCss() {
        return formatCss(this.#styleCss)
    }

    printThemeCss() {
        return formatCss(this.#themeCss)
    }

    destroy() {
        this.devtool.destroy()
        NAMESPACE.designer = undefined
    }
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
