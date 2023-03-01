import { playASTFragmentInternal } from '../lib'
import greenAST from './assets/green-ast.json'
import redAST from './assets/red-ast.json'
import resetAST from './assets/reset-ast.json'
import clearAST from './assets/clear-ast.json'
import { style } from './Nav.sf'

export default function Nav() {
    document.body.addEventListener('click', function (event: Event) {
        const element = event.target as HTMLElement
        if (element.id === 'red') {
            playASTFragmentInternal(clearAST)
            playASTFragmentInternal(redAST)
        } else if (element.id === 'green') {
            playASTFragmentInternal(clearAST)
            playASTFragmentInternal(greenAST)
        } else if (element.id === 'reset') {
            playASTFragmentInternal(clearAST)
            playASTFragmentInternal(resetAST)
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
