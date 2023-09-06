export function svg(element: SVGSVGElement, data: string) {
    function apply(data: string) {
        if (!data) return

        const parser = new DOMParser()
        const document = parser.parseFromString(data, 'text/html')
        const node = document.body.firstChild as SVGSVGElement

        element.replaceChildren(...Array.from(node.childNodes))
        for (const attribute of Array.from(node.attributes)) {
            if (attribute.name !== 'class') {
                element.setAttribute(attribute.name, attribute.value)
            }
        }
    }

    apply(data)
    return {
        update(nextData: string) {
            if (nextData !== data) {
                data = nextData
                apply(nextData)
            }
        }
    }
}
