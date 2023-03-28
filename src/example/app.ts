import './app.css'
import splitflowApp from './splitflow'
import { createDesignerTool } from '../lib'
import Body from './Body'
import Nav from './Nav'
import { style } from './App.sf'
import { theme } from './Light.sft'

function App() {
    if (splitflowApp().devtool) {
        createDesignerTool()
    }

    return `
        <div class="${theme()}">
            <div class="${style.root()}">
                ${Nav()}
                ${Body()}
            </div>
        </div>
    `
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = App()
