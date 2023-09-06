export interface SSRRegistry {
    style: object
    theme: object
}

export function formatHeaders(registry: SSRRegistry) {
    return `
        <style type="text/css" data-splitflow-id="style">
            ${formatCss(registry.style)}
        </style>
        <style type="text/css" data-splitflow-id="theme">
            ${formatCss(registry.theme)}
        </style>
    `
}

export function formatCss(css: any) {
    const tokens = []

    for (let [selectorText, properties] of Object.entries(css)) {
        tokens.push(selectorText)
        tokens.push('{')
        for (let [propertyName, value] of Object.entries(properties)) {
            if (value !== null) {
                const propertyValue = formatCssProperyValue(value)
                tokens.push(propertyName)
                tokens.push(':')
                tokens.push(propertyValue)
                tokens.push(';')
            }
        }
        tokens.push('}')
    }
    return tokens.join('')
}

function formatCssProperyValue(value: string) {
    if (value.charAt(0) === '!') {
        return `${value.slice(1)} !important`
    }
    return value
}
