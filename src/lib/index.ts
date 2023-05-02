import { importInternal } from './internal'
import { createContainerElement, createSplitflowButton } from './ui'

export interface DevToolOptions {
    movable?: boolean
}

let destroyHandle: () => void

export function isDesignerTool() {
    return destroyHandle != null
}

export function createDesignerTool(element?: Element, options?: DevToolOptions) {
    if (!destroyHandle) {
        let toolElement: Element
        let designerVisible = false
        const designer = createDesignerToolInternal(null, options)

        function toggleDesignerVisibility(event: Event) {
            event.stopPropagation()
            if (designerVisible) {
                designerVisible = false
                designer.hide()
            } else {
                designerVisible = true
                designer.show()
            }
        }

        const button = createSplitflowButton()
        button.addEventListener('click', toggleDesignerVisibility)

        if (element) {
            toolElement = button
            element.appendChild(toolElement)
        } else {
            toolElement = createContainerElement()
            toolElement.appendChild(button)
            document.body.appendChild(toolElement)
        }

        destroyHandle = () => {
            toolElement.remove()
            designer.destroy()
            destroyHandle = null
        }
    }
    return destroyHandle
}

export function createDesignerToolInternal(element?: Element, options?: DevToolOptions) {
    const designer = importInternal().then(({ createDesignerTool }) =>
        createDesignerTool(element, options)
    )
    return {
        destroy: () => designer.then((designer) => designer.destroy()),
        show: () => designer.then((designer) => designer.show()),
        hide: () => designer.then((designer) => designer.hide()),
    }
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
