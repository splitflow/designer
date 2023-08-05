import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

export default defineConfig({
    plugins: [dts()],
    build: {
        lib: {
            entry: {
                index: './src/lib/index.ts',
                react: './src/lib/react/index.ts'
            }
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies)]
        }
    }
})
