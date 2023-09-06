import greenAST from './assets/green-ast.json'
import redAST from './assets/red-ast.json'
import resetAST from './assets/reset-ast.json'
import clearAST from './assets/clear-ast.json'
import { style } from './Nav.sf'
import { config } from './Nav.sfc'
import { getDefaultDesigner } from '../lib'

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
        const designer = getDefaultDesigner()

        if (element.id === 'red') {
            designer.devtool?.playStyleFragment(clearAST as any, designer.pod)
            designer.devtool?.playStyleFragment(redAST as any, designer.pod)
        } else if (element.id === 'green') {
            designer.devtool?.playStyleFragment(clearAST as any, designer.pod)
            designer.devtool?.playStyleFragment(greenAST as any, designer.pod)
        } else if (element.id === 'reset') {
            designer.devtool?.playStyleFragment(clearAST as any, designer.pod)
            designer.devtool?.playStyleFragment(resetAST as any, designer.pod)
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
