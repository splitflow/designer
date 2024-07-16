# SpliFlow designer

[SplitFlow designer](https://splitflow.io/designer) is a no-code editor which allows designers to style and configure web based applications.

- :heart: No-code for UI designers and developers.
- :sparkles: JS Framework agnostic.
- :snowflake: Embedded into your app.
- :zap: Real time styling.

![SplitFlow designer](https://github.com/splitflow/designer/blob/master/public/editor.png?raw=true)

## Demo and example

Visit [splitflow.io](https://splitflow.io/designer) to play with the embedded designer tool. Check out the [plain JS example](https://github.com/splitflow/designer/tree/master/src/example) or the [React example](https://github.com/splitflow/react/tree/master/example) for a NextJS integration with SSR support.

## Getting started

The SplitFlow designer API can be used with your framework of choice. Below is a minimal React integration.

```
npm install @splitflow/designer
```

Initialize the SplitFlow designer with the devtool enabled

```ts
import { initializeSplitflowDesigner } from '@splitflow/designer'

initializeSplitflowDesigner({ devtool: true })
```

Register your component classes

Caution : The root element of a component must be styled with the `root` keyword.

```ts
// MyComponent.tsx file
import { useStyle } from './MyComponent.sf'

export function MyComponent() {
    const style = useStyle()
    
    return (
        <div className={style.root()}>
            <h1 className={style.title()}>Title</h1>
        </div>
    )
}
```

Create the SF file skeleton. This file should not be edited. It will be updated later on with the SplitFlow CLI.

Caution : The component name should match the file name.

```ts
// MyComponent.sf.ts file
import { createStyle as _createStyle } from '@splitflow/designer'
import { useStyle as _useStyle } from '@splitflow/designer/react'

export function useStyle() {
    return _useStyle(style)
}

export const style = _createStyle('MyComponent', {
})

```

Launch your app and start designing!

SplitFlow designer tool is displayed within your app as an overlay. Any element registered with the `createStyle` API can be styled or configured.

Caution : at this stage, your design is not persisted and will be discarded on page reload.

## Register your App

To save your design, you will need to provide your _accountId_ and _appId_.
Go to https://dash.splitflow.io and create a new Application.

When initializing the designer, provide your ids (they can be found in the dashboard)

```ts
initializeSplitflowDesigner({
    accountId: '<your-account-id>',
    appId: '<your-app-id>',
    devtool: true
})
```

Changes made with the devtool are now saved automatically.

## Going to production

With the `devtool: true` option, designs are loaded from SplitFlow servers. Before going to production, the designs must be synced into the source code using the CLI. Having the design files part of the source code makes refactoring easier.

Create a `splitflow.config.json` at the root of your project.

```json
{
    "accountId": "<your-account-id>",
    "appId": "<your-app-id>",
    "framework": "react"
}
```

and run

```bash
npm install @splitflow/cli -D
npx @splitflow/cli login
npx @splitflow/cli style
```

The `devtool` option should now be set depending on the deployment environment.

```ts
initializeSplitflowDesigner({
    accountId: '<your-account-id>',
    appId: 'your-app-id',
    devtool: process.env.NODE_ENV === 'development' // or staging ...
})
```