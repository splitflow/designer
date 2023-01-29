#!/usr/bin/env node
import { writeFile } from 'fs/promises'
import yargs from 'yargs/yargs'

//const URL = 'http://localhost:54080'
const URL = 'https://main.splitflow.workers.dev/css'

yargs(process.argv.slice(2))
.config('config').default('config', 'splitflow.config.json')
.command(
    'css',
    'the css command',
    () => {},
    (argv) => {
        buildCss(argv.projectId as any)
    }
).argv

async function buildCss(projectId: string) {
    const css = await getCSS(projectId)

    if (css) {
        await writeFile('./app.css', css)
    }
}

async function getCSS(key: string) {
    const response = await fetch(`${URL}/${key}`)
    if (response.status === 200) {
        return response.text()
    }
    return null
}
