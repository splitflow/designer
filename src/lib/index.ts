import { importInternal } from './internal'

export interface DevToolOptions {
    movable?: boolean
    dark?: boolean
}

let destroyHandle: () => void

export function isDesignerTool() {
    return destroyHandle != null
}

export function createDesignerTool(element?: Element, options?: DevToolOptions) {
    if (!destroyHandle) {
        const destroy = createDesignerToolInternal(element, options)

        destroyHandle = () => {
            destroy()
            destroyHandle = null
        }
    }
    return destroyHandle
}

function createDesignerToolInternal(element?: Element, options?: DevToolOptions) {
    const destroy = importInternal().then(({ createDesignerTool }) =>
        createDesignerTool(element, options)
    )
    return () => destroy.then((destroy) => destroy())
}

export function destroyDesignerTool() {
    destroyHandle?.()
}

export function selectComponentInternal(component: any, element: any) {
    importInternal().then(({ selectComponent, openMenu }) => {
        openMenu('elements')
        selectComponent(component, element)
    })
}

export function playASTFragmentInternal(fragment: any) {
    importInternal().then(({ playASTFragment }) => playASTFragment(fragment))
}
