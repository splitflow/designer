import { Error, firstError } from '@splitflow/lib'
import { ConfigNode } from '@splitflow/lib/config'
import { StyleNode, ThemeNode } from '@splitflow/lib/style'
import { Devtool, DevtoolKit, PodNode, createDevtool } from './devtool'
import { DesignerBundle, isDesignerBundle, loadSplitflowDesignerBundle } from './loaders'
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
    init: DesignerConfig | DesignerBundle,
    devtool?: Devtool,
    registry?: SSRRegistry,
    parent?: SplitflowDesigner
) {
    const bundle = isDesignerBundle(init) ? init : undefined
    const config = isDesignerBundle(init) ? init.designerConfig : init

    devtool ??= parent?.devtool ?? (config?.devtool && browser ? createDevtool(config) : undefined)
    registry ??=
        parent?.registry ?? (config?.ssr && !browser ? { style: {}, theme: {} } : undefined)

    return new SplitflowDesigner(config, bundle, devtool, registry)
}

export function createSplitflowDesigner(init: DesignerConfig | DesignerBundle) {
    return createDesigner(init)
}

export async function initializeSplitflowDesigner(init: DesignerConfig | DesignerBundle) {
    if (!NAMESPACE.designer) {
        NAMESPACE.designer = createDesigner(init)
    }
    return NAMESPACE.designer.initialize()
}

export function getDefaultDesigner(): SplitflowDesigner {
    if (!NAMESPACE.designer) {
        NAMESPACE.designer = createDesigner({})
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
    constructor(
        config: DesignerConfig,
        bundle: DesignerBundle,
        devtool: Devtool,
        registry: SSRRegistry
    ) {
        this.config = config
        this.bundle = bundle
        this.devtool = devtool
        this.registry = registry
        this.definitions = { style: undefined, theme: undefined, config: undefined }
    }

    config: DesignerConfig
    bundle: DesignerBundle
    devtool: Devtool
    registry: SSRRegistry
    definitions: Definitions
    #initialize: Promise<{ designer?: SplitflowDesigner; error?: Error }>

    async initialize(): Promise<{ designer?: SplitflowDesigner; error?: Error }> {
        return (this.#initialize ??= (async () => {
            this.bundle ??= await loadSplitflowDesignerBundle(this)

            const error = firstError(this.bundle)
            if (error) return { error }

            if (this.devtool) {
                const { error } = await this.devtool.boot(this.pod, this.bundle)
                return error ? { error } : { designer: this }
            }

            this.definitions = {
                style: this.bundle.getStyleDesignResult?.style,
                config: this.bundle.getConfigDesignResult?.config,
                theme: this.bundle.getThemeResult?.theme
            }

            this.bundle = undefined
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
        devtool,
        get pod() {
            return podNode(config)
        }
    }
}

export interface SplitflowDesignerKit {
    config: DesignerConfig
    pod: PodNode
    devtool?: DevtoolKit
}

export function discriminator(pod: { podName: string; podId?: string }) {
    return pod.podId ?? (pod.podName === 'App' ? undefined : pod.podName)
}

function podNode(config: DesignerConfig) {
    const podName = config.moduleName ?? config.appName ?? 'App'
    const podId = config.moduleId ?? config.appId
    const podType = config.moduleType ?? 'app'
    return { podName, podId, podType }
}
