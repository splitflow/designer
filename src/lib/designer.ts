import { Error, firstError } from '@splitflow/lib'
import { ConfigNode } from '@splitflow/lib/config'
import { StyleNode, ThemeNode } from '@splitflow/lib/style'
import { Devtool, createDevtool } from './devtool'
import { getConfigDefinition, getStyleDefinition, getThemeDefinition } from './gateway'
import { SSRRegistry, formatCss, formatHeaders } from './ssr'

const browser = typeof document !== 'undefined'

interface Namespace {
    designer?: SplitflowDesigner
}

const NAMESPACE: Namespace = (globalThis.splitflow ??= {})

export interface DesignerConfig {
    projectId?: string
    appName?: string
    appId?: string
    moduleName?: string
    moduleId?: string
    devtool?: boolean
    ssr?: boolean
}

interface Definitions {
    style: StyleNode
    theme: ThemeNode
    config: ConfigNode
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

    async initialize(): Promise<{ designer?: SplitflowDesigner; error?: Error }> {
        return (this.#initialize ??= (async () => {
            if (this.devtool) return this.devtool.boot(this.pod)

            const [result1, result2, result3] = await Promise.all([
                this.pod.podId && getStyleDefinition(this.pod.podId),
                this.config.projectId && getThemeDefinition(this.config.projectId),
                this.pod.podId && getConfigDefinition(this.pod.podId)
            ])

            const errorResult = firstError([result1, result2, result3])
            if (errorResult) return errorResult

            this.definitions = {
                style: result1?.node as StyleNode,
                theme: result2?.node as ThemeNode,
                config: result3?.node as ConfigNode
            }

            return { designer: this }
        })())
    }

    get pod() {
        const podName = this.config.moduleName ?? this.config.appName ?? 'App'
        const podId = this.config.moduleId ?? this.config.appId
        return { podName, podId }
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

export function discriminator(pod: { podName: string; podId?: string }) {
    return pod.podId ?? (pod.podName === 'App' ? undefined : pod.podName)
}
