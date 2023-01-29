import { importInternalDevTool } from './internal'

export interface DevToolOptions {
    movable?: boolean
    dark?: boolean
}

let destroyHandle: () => void

export function isSplitflowDevTool() {
    return destroyHandle != null
}

export function createSplitflowDevTool(element?: Element, options?: DevToolOptions) {
    if (!destroyHandle) {
        const destroy = createSplitflowDevToolInternal(element, options)

        destroyHandle = () => {
            destroy()
            destroyHandle = null
        }
    }
    return destroyHandle
}

function createSplitflowDevToolInternal(element?: Element, options?: DevToolOptions) {
    const destroy = importInternalDevTool().then(({ createSplitflowDevTool }) =>
        createSplitflowDevTool(element, options)
    )
    return () => destroy.then((destroy) => destroy())
}

export function destroySplitflowDevTool() {
    destroyHandle?.()
}

export function selectComponentInternal(component: any, element: any) {
    importInternalDevTool().then(({ selectComponent, openMenu }) => {
        openMenu('elements')
        selectComponent(component, element)
    })
}

export function playASTFragmentInternal(fragment: any) {
    importInternalDevTool().then(({ playASTFragment }) => playASTFragment(fragment))
}
