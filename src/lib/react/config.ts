import React from 'react'
import { Config, createConfig } from '../config'
import { SplitflowDesignerContext } from './provider'
import { Readable } from '@splitflow/core/stores'

export function useConfig(parent: Readable<Config>) {
    const designer = React.useContext(SplitflowDesignerContext)
    const subscriber = React.useRef<(config: Config) => void>()
    const unsubscribe = React.useRef<() => void>()
    const value = React.useRef<Config>()

    const [config, setConfig] = React.useState<Config>(() => {
        const config = designer ? createConfig(parent, designer) : parent

        let initialValue: Config
        unsubscribe.current = config.subscribe(($config) => {
            if (!initialValue) {
                initialValue = $config
            } else {
                value.current = $config
                subscriber.current?.($config)
            }
        })
        return initialValue
    })

    React.useEffect(() => {
        if (value.current) {
            setConfig(value.current)
        }

        subscriber.current = setConfig
        return () => unsubscribe.current()
    }, [])

    return config
}
