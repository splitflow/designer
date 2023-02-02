import './app.css'
import { initializeSplitflowApp } from '../lib/app'
import { style } from '../lib/style'
import { createDesignerTool } from '../lib'
import Body from './body'
import Nav from './nav'

function App() {
    const s = style('App')

    initializeSplitflowApp({ devtool: true })
    createDesignerTool()

    return `
    <div class="${s.root()}">
        ${Nav()}
        ${Body()}
    </div>
  `
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = App()
