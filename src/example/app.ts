import './app.css'
import Body from './Body'
import Nav from './Nav'
import { style } from './App.sf'
import { theme } from './Light.sft'
import { initializeSplitflowDesigner } from '../lib'

initializeSplitflowDesigner({ devtool: true })

function App() {
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
