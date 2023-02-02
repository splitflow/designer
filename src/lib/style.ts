import app from './app'
import { importInternal } from './internal'

interface Style {
    [elementName: string]: (variants?: Variants) => string
}

interface Variants {
    [variantName: string]: boolean
}

export function style(componentName: string, register = true): Style {
    return new Proxy(
        {},
        {
            get: (_, elementName: string) => {
                return (variants: Variants) => {
                    register && app().devtool && registerInternal(componentName, elementName)
                    if (variants) {
                        Object.keys(variants).forEach((variantName) => {
                            register &&
                                app().devtool &&
                                registerInternal(componentName, elementName, variantName)
                        })
                        return `${componentName}-${elementName} ${print(variants)}`
                    }
                    return `${componentName}-${elementName}`
                }
            }
        }
    )
}

function registerInternal(componentName: string, elementName: string, variantName?: string) {
    importInternal().then(({ registerComponent }) =>
        registerComponent(componentName, elementName, variantName)
    )
}

function print(object: object) {
    const result = []
    for (let key of Object.keys(object)) {
        if (object[key] === true) {
            result.push(key)
        }
    }
    return result.join(' ')
}
