import { style } from '../lib'
import { playASTFragmentInternal } from '../lib/devtool'
import greenAST from './assets/green-ast.json'
import redAST from './assets/red-ast.json'
import resetAST from './assets/reset-ast.json'
import clearAST from './assets/clear-ast.json'

export default function Nav() {
    const s = style('Nav')

    playASTFragmentInternal(redAST)

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
        <nav class=${s.root()}>
            <button id="reset" class="${s.button({ reset: true })}">Reset</button>
            <button id="red" class="${s.button({ red: true })}">Red</button>
            <button id="green" class="${s.button({ green: true })}">Green</button>
        </nav>
    `
}
