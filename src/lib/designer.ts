import { Error, firstError } from '@splitflow/lib'
import { ConfigNode } from '@splitflow/lib/config'
import { StyleNode, ThemeNode } from '@splitflow/lib/style'
import { Devtool, DevtoolKit, createDevtool } from './devtool'
import { SplitflowDesignerData, loadSplitflowDesignerData } from './loaders'
import { SSRRegistry, formatCss, formatHeaders } from './ssr'

const browser = typeof document !== 'undefined'

interface Namespace {
    designer?: SplitflowDesigner
}

const NAMESPACE: Namespace = (globalThis.splitflow ??= {})

export interface DesignerConfig {
    accountId?: string
    appName?: string
    appId?: string
    moduleName?: string
    moduleId?: string
    moduleType?: string
    devtool?: boolean
    ssr?: boolean
    remote?: boolean
}

interface Definitions {
    style: StyleNode
    config: ConfigNode
    theme: ThemeNode
}

export function createDesigner(
    config?: DesignerConfig,
    devtool?: Devtool,
    registry?: SSRRegistry,
    parent?: SplitflowDesigner
) {
    config ??= {}
    devtool ??= parent?.devtool ?? (config?.devtool && browser ? createDevtool(config) : undefined)
    registry ??=
        parent?.registry ?? (config?.ssr && !browser ? { style: {}, theme: {} } : undefined)

    return new SplitflowDesigner(config, devtool, registry)
}

export function createSplitflowDesigner(config?: DesignerConfig) {
    return createDesigner(config)
}

export async function initializeSplitflowDesigner(config?: DesignerConfig) {
    if (!NAMESPACE.designer) {
        NAMESPACE.designer = createDesigner(config)
    }
    return NAMESPACE.designer.initialize()
}

export function getDefaultDesigner(): SplitflowDesigner {
    if (!NAMESPACE.designer) {
        NAMESPACE.designer = createDesigner()
    }
    return NAMESPACE.designer
}

export function isSplitflowDesigner(value: any): value is SplitflowDesigner {
    // The instanceof operator returns false when it shouldn't in some cases. We use duck typing instead
    // The issue is relate to the app packaging https://stackoverflow.com/a/75977756
    return (
        typeof value?.registerStyleCss === 'function' &&
        typeof value?.registerThemeCss === 'function'
    )
}

export class SplitflowDesigner {
    constructor(config: DesignerConfig, devtool: Devtool, registry: SSRRegistry) {
        this.config = config
        this.devtool = devtool
        this.registry = registry
        this.definitions = { style: undefined, theme: undefined, config: undefined }
    }

    config: DesignerConfig
    devtool: Devtool
    registry: SSRRegistry
    definitions: Definitions
    #initialize: Promise<{ designer?: SplitflowDesigner; error?: Error }>

    async initialize(
        data?: SplitflowDesignerData
    ): Promise<{ designer?: SplitflowDesigner; error?: Error }> {
        return (this.#initialize ??= (async () => {
            data ??= await loadSplitflowDesignerData(this)

            const error = firstError(data)
            if (error) return { error }

            if (this.devtool) return this.devtool.boot(this.pod, data)

            this.definitions = {
                style: data.getStyleDesignResult?.style as StyleNode,
                config: data.getConfigDesignResult?.config as ConfigNode,
                theme: data.getThemeResult?.theme as ThemeNode
            }

            return { designer: this }
        })())
    }

    get pod() {
        return podNode(this.config)
    }

    registerStyleCss(css: any) {
        Object.assign(this.registry.style, css)
    }

    registerThemeCss(css: any) {
        Object.assign(this.registry.theme, css)
    }

    formatHeaders() {
        if (!browser) return formatHeaders(this.registry)
    }

    formatStyleCss() {
        if (!browser) return formatCss(this.registry.style)
    }

    formatThemeCss() {
        if (!browser) return formatCss(this.registry.theme)
    }

    destroy() {
        this.devtool.destroy()
        if (NAMESPACE.designer === this) {
            NAMESPACE.designer = undefined
        }
    }
}

export function createDesignerKit(
    config: DesignerConfig,
    devtool?: DevtoolKit,
    parent?: SplitflowDesignerKit
): SplitflowDesignerKit {
    devtool ??= parent?.devtool ?? (config?.devtool && browser ? createDevtool(config) : undefined)

    return {
        config,
        devtool
    }
}

export interface SplitflowDesignerKit {
    config: DesignerConfig
    devtool?: DevtoolKit
}

export function discriminator(pod: { podName: string; podId?: string }) {
    return pod.podId ?? (pod.podName === 'App' ? undefined : pod.podName)
}

export function podNode(config: DesignerConfig) {
    const podName = config.moduleName ?? config.appName ?? 'App'
    const podId = config.moduleId ?? config.appId
    const podType = config.moduleType ?? 'app'
    return { podName, podId, podType }
}
