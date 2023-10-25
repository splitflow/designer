import { derived, type Readable } from 'svelte/store'
import { type SchemaDef, type ExpressionVariables } from '@splitflow/core/definition'
import { ConfigNode, SplitflowConfigDef } from '@splitflow/lib/config'
import { getDefaultDesigner, isSplitflowDesigner, SplitflowDesigner } from './designer'
import { readable } from '@splitflow/core/stores'
import { configAccessor } from './accessor'
import {
    optionEnabledInjector,
    optionPropertyInjector,
    optionSVGInjector,
    optionTextInjector
} from './injectors'
import {
    optionEnabledFormatter,
    optionPropertyFormatter,
    optionSVGFormatter,
    optionTextFormatter
} from './formatters'

export interface Config {
    [optionName: string]: Option & OptionProperties
}

export interface Option {
    enabled: (value?: boolean) => boolean
    text: (value?: string, variables?: ExpressionVariables) => string
    svg: (data?: string) => string
}

export interface OptionProperties {
    [propertyName: string]: <T>(value?: T, definition?: SchemaDef) => T
}

export function createConfig(
    componentName: string,
    configDef?: SplitflowConfigDef
): Readable<Config>

export function createConfig(
    parent: Readable<Config>,
    designer: SplitflowDesigner
): Readable<Config>

export function createConfig(componentName: string, designer: SplitflowDesigner): Readable<Config>

export function createConfig(arg1: unknown, arg2: unknown) {
    let accessors: Accessors = {}
    let injectors: Injectors = {}
    let formatters: Formatters = {}
    let designer: SplitflowDesigner

    if (typeof arg1 !== 'string') {
        const parent = arg1 as any
        accessors = parent._accessors
        injectors = parent._injectors
        formatters = parent._formatters
    }

    if (typeof arg1 === 'string') {
        const componentName = arg1
        const configDef = isSplitflowDesigner(arg2) ? undefined : (arg2 as SplitflowConfigDef)
        accessors.config = configAccessor(componentName, configDef)
        injectors.optionEnabled = optionEnabledInjector(componentName)
        injectors.optionText = optionTextInjector(componentName)
        injectors.optionSVG = optionSVGInjector(componentName)
        injectors.optionProperty = optionPropertyInjector(componentName)
        formatters.optionEnabled = optionEnabledFormatter(componentName)
        formatters.optionText = optionTextFormatter(componentName)
        formatters.optionSVG = optionSVGFormatter(componentName)
        formatters.optionProperty = optionPropertyFormatter(componentName)
    }

    if (isSplitflowDesigner(arg2)) {
        designer = arg2
    }

    const { subscribe } = derived(
        deferred(() => accessors.config(designer ?? getDefaultDesigner())),
        ($config) => {
            return new Proxy(
                {},
                {
                    get: (_, optionName: string) => {
                        return createOptionProxy(
                            optionName,
                            injectors,
                            formatters,
                            $config,
                            designer ?? getDefaultDesigner()
                        )
                    }
                }
            )
        }
    )

    return {
        subscribe,
        _accessors: accessors,
        _injectors: injectors,
        _formatters: formatters
    }
}

interface Accessors {
    config?: (designer: SplitflowDesigner) => Readable<ConfigNode>
}

interface Injectors {
    optionText?: (
        optionName: string,
        value: string,
        variables: ExpressionVariables,
        designer: SplitflowDesigner
    ) => void
    optionEnabled?: (optionName: string, value: boolean, designer: SplitflowDesigner) => void
    optionSVG?: (optionName: string, data: string, designer: SplitflowDesigner) => void
    optionProperty?: (
        optionName: string,
        propertyName: string,
        value: unknown,
        definition: SchemaDef,
        designer: SplitflowDesigner
    ) => void
}

interface Formatters {
    optionEnabled?: (optionName: string, value: boolean, config: ConfigNode) => boolean
    optionText?: (
        optionName: string,
        value: string,
        variables: ExpressionVariables,
        config: ConfigNode
    ) => string
    optionSVG?: (optionName: string, data: string, config: ConfigNode) => string
    optionProperty?: (
        optionName: string,
        propertyName: string,
        value: unknown,
        config: ConfigNode
    ) => unknown
}

function createOptionProxy(
    optionName: string,
    injectors: Injectors,
    formatters: Formatters,
    config: ConfigNode,
    designer: SplitflowDesigner
): Option {
    return new Proxy(
        {
            enabled: (value = true) => {
                injectors.optionEnabled?.(optionName, value, designer)
                return formatters.optionEnabled(optionName, value, config)
            },
            text: (value, variables) => {
                injectors.optionText?.(optionName, value, variables, designer)
                return formatters.optionText(optionName, value, variables, config)
            },
            svg: (data) => {
                injectors.optionSVG?.(optionName, data, designer)
                return formatters.optionSVG(optionName, data, config)
            }
        },
        {
            get: (option, propertyName: string) => {
                const property = option[propertyName]
                if (property) return property

                return <T>(value?: T, definition?: SchemaDef) => {
                    injectors.optionProperty?.(
                        optionName,
                        propertyName,
                        value,
                        definition,
                        designer
                    )
                    return formatters.optionProperty(optionName, propertyName, value, config)
                }
            }
        }
    )
}

function deferred<T>(start: () => Readable<T>) {
    return readable(undefined, (set) => start().subscribe(set))
}
