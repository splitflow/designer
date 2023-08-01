import { SchemaDef, StringDef } from '@splitflow/core/definition'
import { Readable, readable } from '@splitflow/core/stores'
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
    include?: string[]
}

export function isDevtool(arg: any): arg is Devtool {
    return typeof arg?.destroy === 'function'
}

export interface Devtool {
    destroy: () => void
    show?: (element?: Element) => void
    hide?: () => void
    registerStyleFragment: (root: StyleNode) => void
    registerThemeFragment: (root: ThemeNode) => void
    registerElement: (componentName: string, elementName: string, variantName?: string) => void
    playStyleFragment: (root: StyleNode) => void
    registerConfigFragment: (root: ConfigNode) => void
    registerOptionEnabled: (componentName: string, optionName: string, enabled: boolean) => void
    registerOptionSVG: (componentName: string, optionName: string, value: string) => void
    registerOptionText: (
        componentName: string,
        optionName: string,
        value: string,
        definition: StringDef
    ) => void
    registerOptionProperty: (
        componentName: string,
        optionName: string,
        propertyName: string,
        value: unknown,
        definition: SchemaDef
    ) => void
    configuration: Readable<ConfigNode>
}

export function createDevtool(config?: DevtoolConfig, element?: Element): Devtool {
    const promise = importDevtool().then(
        ({ createDevtoolApp }) => createDevtoolApp(config, element) as Devtool
    )

    function include(componentName: string) {
        return config?.include?.indexOf(componentName) != -1 ?? true
    }

    return {
        configuration: deferred(promise.then((dt) => dt.configuration)),
        destroy() {
            promise.then((dt) => dt.destroy())
        },
        show(element?: Element) {
            promise.then((dt) => dt.show(element))
        },
        hide() {
            promise.then((dt) => dt.hide())
        },
        registerStyleFragment(root: StyleNode) {
            promise.then((dt) => dt.registerStyleFragment(root))
        },
        registerThemeFragment(root: ThemeNode) {
            promise.then((dt) => dt.registerThemeFragment(root))
        },
        registerElement(componentName: string, elementName: string, variantName?: string) {
            if (include(componentName)) {
                promise.then((dt) => dt.registerElement(componentName, elementName, variantName))
            }
        },
        playStyleFragment(root: StyleNode) {
            promise.then((dt) => dt.playStyleFragment(root))
        },
        registerConfigFragment(root: ConfigNode) {
            promise.then((dt) => dt.registerConfigFragment(root))
        },
        registerOptionEnabled(componentName: string, optionName: string, enabled: boolean) {
            promise.then((dt) => dt.registerOptionEnabled(componentName, optionName, enabled))
        },
        registerOptionSVG(componentName: string, optionName: string, value: string) {
            promise.then((dt) => dt.registerOptionSVG(componentName, optionName, value))
        },
        registerOptionText(
            componentName: string,
            optionName: string,
            value: string,
            definition: StringDef
        ) {
            promise.then((dt) =>
                dt.registerOptionText(componentName, optionName, value, definition)
            )
        },
        registerOptionProperty(
            componentName: string,
            optionName: string,
            propertyName: string,
            value: unknown,
            definition: SchemaDef
        ) {
            promise.then((dt) =>
                dt.registerOptionProperty(
                    componentName,
                    optionName,
                    propertyName,
                    value,
                    definition
                )
            )
        }
    }
}

function deferred<T>(promise: Promise<Readable<T>>) {
    const { subscribe } = readable({}, (set) => {
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
