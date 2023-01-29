let importDevtoolPromise: Promise<any>

export function importInternalDevTool() {
    return (
        importDevtoolPromise ||
        (importDevtoolPromise = import(
            // @ts-ignore
            import.meta.env.MODE === 'development'
                ? 'http://localhost:3000/index.js'
                : 'https://pub-79a464feabb445aa8b15f14f4bbdaeb0.r2.dev/devtool.js'
        ))
    )
}
