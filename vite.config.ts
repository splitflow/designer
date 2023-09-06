import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

export default defineConfig({
    plugins: [dts()],
    build: {
        minify: false,
        lib: {
            entry: {
                index: './src/lib/index.ts',
                react: './src/lib/react/index.ts',
                svelte: './src/lib/svelte/index.ts'
            }
        },
        rollupOptions: {
            external: [
                ...withEntryPoints(Object.keys(packageJson.dependencies)),
                ...withEntryPoints(Object.keys(packageJson.peerDependencies))
            ]
        }
    }
})

function withEntryPoints(deps: string[]) {
    return deps.map((v) => new RegExp(`^${v}.*$`))
}
