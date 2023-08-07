import greenAST from './assets/green-ast.json'
import redAST from './assets/red-ast.json'
import resetAST from './assets/reset-ast.json'
import clearAST from './assets/clear-ast.json'
import { style } from './Nav.sf'
import { config } from './Nav.sfc'
import { getDesigner } from '../lib'

export default function Nav() {
    requestAnimationFrame(() => {
        config.subscribe(($config) => {
            document.getElementById('reset').style.display = $config.reset.enabled(true)
                ? 'block'
                : 'none'
            document.getElementById('red').style.display = $config.red.enabled(false)
                ? 'block'
                : 'none'
            document.getElementById('green').style.display = $config.green.enabled()
                ? 'block'
                : 'none'
        })
    })

    document.body.addEventListener('click', function (event: Event) {
        const element = event.target as HTMLElement
        if (element.id === 'red') {
            getDesigner().devtool?.playStyleFragment(clearAST as any)
            getDesigner().devtool?.playStyleFragment(redAST as any)
        } else if (element.id === 'green') {
            getDesigner().devtool?.playStyleFragment(clearAST as any)
            getDesigner().devtool?.playStyleFragment(greenAST as any)
        } else if (element.id === 'reset') {
            getDesigner().devtool?.playStyleFragment(clearAST as any)
            getDesigner().devtool?.playStyleFragment(resetAST as any)
        }
    })

    return `
        <nav class=${style.root()}>
            <button id="reset" class="${style.button({ reset: true })}">Reset</button>
            <button id="red" class="${style.button({ red: true })}">Red</button>
            <button id="green" class="${style.button({ green: true })}">Green</button>
        </nav>
    `
}
