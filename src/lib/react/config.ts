import React from 'react'
import { Config, createConfig } from '../config'
import { DesignerContext } from './provider'
import { Readable } from '@splitflow/core/stores'

export function useConfig(parent: Readable<Config>) {
    const designer = React.useContext(DesignerContext)
    const unsubscribe = React.useRef<() => void>()
    const [config, setConfig] = React.useState<Config>()

    const subscribe = React.useCallback(() => {
        const config = designer ? createConfig(parent, designer) : parent
        unsubscribe.current?.()
        unsubscribe.current = config.subscribe(setConfig)
    }, [designer])

    React.useEffect(() => {
        return () => unsubscribe.current()
    }, [])

    if (!unsubscribe.current) {
        subscribe()
    }

    return config
}
