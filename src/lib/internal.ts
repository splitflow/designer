let importInternalPromise: Promise<any>

export function importInternal() {
    return (
        importInternalPromise ||
        (importInternalPromise = import(
            // @ts-ignore
            'https://pub-79a464feabb445aa8b15f14f4bbdaeb0.r2.dev/designer.js'
        ))
    )
}
