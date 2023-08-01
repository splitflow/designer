import { derived, type Readable } from 'svelte/store'
import {
    compile,
    type SchemaDef,
    type StringDef,
    type ExpressionVariables
} from '@splitflow/core/definition'
import { ConfigurationNode, SplitflowConfigDef } from '@splitflow/lib/config'
import { getDesigner } from './designer'
import { configInjector } from './injectors'
import { readable } from '@splitflow/core/stores'

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
): Readable<Config> {
    const injector = configInjector(componentName, configDef)

    return derived(deferred(injector), ($config) => {
        return new Proxy(
            {},
            {
                get: (_, optionName: string) => {
                    const configuration = $config[`${componentName}-${optionName}`]
                    return createOption(componentName, optionName, configuration)
                }
            }
        )
    })
}

function createOption(
    componentName: string,
    optionName: string,
    configuration: ConfigurationNode
): Option {
    const { devtool } = getDesigner()

    return new Proxy(
        {
            enabled: (value = true) => {
                devtool?.registerOptionEnabled(componentName, optionName, value)
                return configuration?.enabled ?? true
            },
            text: (value, variables) => {
                const definition: StringDef = { type: 'string', variables }

                devtool?.registerOptionText(componentName, optionName, value, definition)
                return compile(definition).format(configuration?.content?.text ?? value)
            },
            svg: (data) => {
                devtool?.registerOptionSVG(componentName, optionName, data)
                return (
                    'data:image/svg+xml,' + encodeURIComponent(configuration?.content?.svg ?? data)
                )
            }
        },
        {
            get: (option, propertyName: string) => {
                const property = option[propertyName]
                if (property) return property

                return <T>(value?: T, definition?: SchemaDef) => {
                    devtool?.registerOptionProperty(
                        componentName,
                        optionName,
                        propertyName,
                        value,
                        definition
                    )
                    return configuration?.property?.[propertyName] ?? value
                }
            }
        }
    )
}

function deferred<T>(start: () => Readable<T>) {
    return readable(undefined, (set) => start().subscribe(set))
}
