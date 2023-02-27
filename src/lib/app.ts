import { importInternal } from './internal'

let app: SplitflowApp = {
    projectId: null,
    devtool: false,
    include: () => true
}

export interface SplitflowApp {
    projectId?: string
    devtool: boolean
    include: (componentName: string) => boolean
}

export interface SplitflowAppConfig {
    projectId?: string
    devtool?: boolean
    include?: string[]
}

export function initializeSplitflowApp(configuration: SplitflowAppConfig): () => SplitflowApp {
    app = {
        projectId: configuration.projectId ?? app.projectId,
        devtool: configuration.devtool ?? app.devtool,
        include: createInclude(configuration)
    }

    if (app.devtool) {
        const internalConfig = {
            projectId: app.projectId
        }

        importInternal().then(({ initializeSplitflowApp }) => initializeSplitflowApp(internalConfig))
    }
    return () => app
}

function createInclude(configuration: SplitflowAppConfig) {
    if (configuration.include) {
        return (componentName: string) => configuration.include.indexOf(componentName) != -1
    }
    return () => true
}

export default function() {
    return app
}