import './app.css'
import { initializeSplitflow, style } from '../lib/index'
import { createSplitflowDevTool } from '../lib/devtool'
import Body from './body'
import Nav from './nav'

function App() {
    const s = style('App')

    initializeSplitflow({ devtool: true })
    createSplitflowDevTool()

    return `
    <div class="${s.root()}">
        ${Nav()}
        ${Body()}
    </div>
  `
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = App()
