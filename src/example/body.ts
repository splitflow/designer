import { style } from './Body.sf'

export default function Body() {
    return `
        <section class="${style.root()}">
            <h1 class="${style.title()}">SplitFlow</h1>
            <label class="${style.feature()}">
                Built with UI designers in mind
                <input class="${style.checkbox()}" type="checkbox" />
            </label>
        </section>
    `
}