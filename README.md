# SpliFlow

[SplitFlow](https://splitflow.io) is a no-code editor which allows designers to style web based applications.

- Built for UI designers.
- JS Framework agnostic.
- Embedded into your app.
- Real time styling.

![SplitFlow style editor](https://github.com/splitflow/splitflow/blob/master/public/editor.png?raw=true)

## Demo and example

Visit https://splitflow.io to play with the style editor or check the [example](/src/example/) page.

## Getting started

### Install SplitFlow

```
npm install splitflow
```

### Create the SplitFlow designer devtool

```ts
import { initializeSplitflow } from 'splitflow'
import { createSplitflowDevTool } from 'splitflow/devtool'
...
initializeSplitflow({ devtool: true })
createSplitflowDevTool()
```

### Register your component classes

```ts
import { style } from 'splitflow';
...
const s = style('MyComponentName');
...
<div class={s.root()}>
    <h1 class={s.title()}></h1>
</div>
```

Caution : The root element of a component must be styled with the `root` keyword.

### Launch your app and start styling!

SplitFlow style editor is displayed within your app as an overlay. Any element registered with the `style` API can be styled.

Caution : at this stage, your design is not persisted and will be discarded on page reload. Add your API key!

## Add your API key

### Request your project id

Request a project id on https://splitflow.io/preview

### Initialize SplitFlow

```
initializeSplitflow({ projectId: '<my-project-id>', devtool: true })
```

## Going to production

### Generate your css file

SplitFlow CLI allows to generate your app CSS.

```
npx splitflow css --projectId=<my-project-id>
```

Alternatively, you can create a `splitflow.config.json` and run `npx splitflow css`

```
{
    "projectId": "<my-project-id>"
}
```

### Disable the designer devtool

```
if (process.env.NODE_ENV === 'development')
    initializeSplitflow({ devtool: true })
    createSplitflowDevTool()
}
```