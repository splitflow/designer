import { style } from '../lib'

export default function Body() {
    const s = style('Body')

    return `
        <section class="${s.root()}">
            <h1 class="${s.title()}">SplitFlow</h1>
            <label class="${s.feature()}">
                Built with UI designers in minde
                <input class="${s.checkbox()}" type="checkbox" />
            </label>
        </section>
    `
}
