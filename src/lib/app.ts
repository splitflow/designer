import { importInternal } from './internal'

let app: SplitflowAppConfig = {
    projectId: null,
    devtool: false
}

export interface SplitflowAppConfig {
    projectId?: string
    devtool?: boolean
}

export function initializeSplitflowApp(configuration: SplitflowAppConfig) {
    app = {
        ...app,
        ...configuration
    }

    if (app.devtool) {
        importInternal().then(({ initializeSplitflowApp }) => initializeSplitflowApp(app))
    }
}

export default function() {
    return app ?? {}
}