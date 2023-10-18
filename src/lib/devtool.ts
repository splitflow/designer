import { SchemaDef, StringDef } from '@splitflow/core/definition'
import { Readable, readable } from '@splitflow/core/stores'
import { Error } from '@splitflow/lib'
import { ConfigNode } from '@splitflow/lib/config'
import { StyleNode, ThemeNode } from '@splitflow/lib/style'

let importPromise: Promise<any>

export function importDevtool() {
    return (
        importPromise ||
        (importPromise = import(
            /* webpackIgnore: true */
            // @ts-ignore
            //'https://pub-79a464feabb445aa8b15f14f4bbdaeb0.r2.dev/devtool-1.0.x.js'
            'http://localhost:3000/index.js'
        ))
    )
}

export interface DevtoolConfig {
    projectId?: string
}

export function isDevtool(arg: any): arg is Devtool {
    return typeof arg?.destroy === 'function'
}

export interface PodNode {
    podName: string
    podId?: string
}

export interface ComponentNode {
    componentName: string
    variantName?: string
}

export interface ElementNode {
    elementName: string
    variantName: string
}

export interface OptionNode {
    optionName: string
    enabled?: EnabledNode
    text?: StringNode
    svg?: SVGNode
}

export interface EnabledNode {
    value: boolean
    definition: SchemaDef
}

export interface StringNode {
    value: string
    definition: StringDef
}

export interface SVGNode {
    value: string
    definition: SchemaDef
}

export interface PropertyNode {
    propertyName: string
    value: unknown
    definition: SchemaDef
}

export interface Devtool {
    boot: (pod?: PodNode) => Promise<{ error?: Error }>
    destroy: () => void
    show?: (element?: Element) => void
    hide?: () => void
    registerStyleFragment: (fragment: StyleNode, pod: PodNode) => void
    registerThemeFragment: (root: ThemeNode) => void
    registerElement: (pod: PodNode, component: ComponentNode, element: ElementNode) => void
    playStyleFragment: (fragment: StyleNode, pod: PodNode) => void
    registerConfigFragment: (fragment: ConfigNode, pod: PodNode) => void
    registerOption: (
        pod: PodNode,
        component: ComponentNode,
        option: OptionNode,
        property?: PropertyNode
    ) => void
    configuration: (pod: PodNode) => Readable<ConfigNode>
}

export function createDevtool(config?: DevtoolConfig, element?: Element): Devtool {
    const promise = importDevtool().then(
        ({ createDevtoolApp }) => createDevtoolApp(config, element) as Devtool
    )

    let registeredConfigFragment: ConfigNode

    return {
        configuration(pod: PodNode) {
            return deferred(
                registeredConfigFragment,
                promise.then((dt) => dt.configuration(pod))
            )
        },
        boot(pod?: PodNode) {
            console.log('BOOT1')
            return promise.then((dt) => dt.boot(pod))
        },
        destroy() {
            promise.then((dt) => dt.destroy())
        },
        show(element?: Element) {
            promise.then((dt) => dt.show(element))
        },
        hide() {
            promise.then((dt) => dt.hide())
        },
        registerStyleFragment(fragment: StyleNode, pod: PodNode) {
            promise.then((dt) => dt.registerStyleFragment(fragment, pod))
        },
        registerThemeFragment(fragment: ThemeNode) {
            promise.then((dt) => dt.registerThemeFragment(fragment))
        },
        registerElement(pod: PodNode, component: ComponentNode, element: ElementNode) {
            promise.then((dt) => dt.registerElement(pod, component, element))
        },
        playStyleFragment(fragment: StyleNode, pod: PodNode) {
            promise.then((dt) => dt.playStyleFragment(fragment, pod))
        },
        registerConfigFragment(fragment: ConfigNode, pod: PodNode) {
            registeredConfigFragment = fragment
            promise.then((dt) => dt.registerConfigFragment(fragment, pod))
        },
        registerOption(
            pod: PodNode,
            component: ComponentNode,
            option: OptionNode,
            property?: PropertyNode
        ) {
            promise.then((dt) => dt.registerOption(pod, component, option, property))
        }
    }
}

function deferred<T>(initialValue: T, promise: Promise<Readable<T>>) {
    const { subscribe } = readable(initialValue, (set) => {
        let unsubscribe: () => void

        promise.then((deferred) => {
            unsubscribe = deferred.subscribe(set)
        })

        return () => {
            unsubscribe?.()
        }
    })

    return {
        subscribe
    }
}
