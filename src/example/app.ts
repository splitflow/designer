import './app.css'
import splitflowApp from './splitflow'
import { createDesignerTool } from '../lib'
import Body from './body'
import Nav from './nav'
import { style } from './app.sf'

function App() {
    if (splitflowApp().devtool) {
        createDesignerTool()
    }

    return `
        <div class="${style.root()}">
            ${Nav()}
            ${Body()}
        </div>
    `
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = App()
