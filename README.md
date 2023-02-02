# SpliFlow

[SplitFlow](https://splitflow.io) is a no-code editor which allows designers to style web based applications.

- Built for UI designers.
- JS Framework agnostic.
- Embedded into your app.
- Real time styling.

![SplitFlow style editor](https://github.com/splitflow/splitflow/blob/master/public/editor.png?raw=true)

## Demo and example

Visit [splitflow.io](https://splitflow.io) to play with the style editor or check the [example](https://github.com/splitflow/designer/tree/master/src/example) page.

## Getting started

### Install SplitFlow

```
npm install @splitflow/designer
```

### Create the SplitFlow designer devtool

```ts
import { initializeSplitflowApp } from '@splitflow/designer/app'
import { createDesignerTool } from '@splitflow/designer'
...
initializeSplitflowApp({ devtool: true })
createDesignerTool()
```

### Register your component classes

```ts
import { style } from '@splitflow/designer/style';
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
initializeSplitflowApp({ projectId: '<my-project-id>', devtool: true })
```

## Going to production

### Generate your css file

SplitFlow CLI allows to generate your app CSS.

```
npm install @splitflow/cli -D
npx @splitflow/cli css --projectId=<my-project-id>
```

Alternatively, you can create a `splitflow.config.json` and run `npx @splitflow/cli css`

```json
{
    "projectId": "<my-project-id>"
}
```

### Disable the designer devtool

```ts
if (process.env.NODE_ENV === 'development')
    initializeSplitflowApp({ devtool: true })
    createDesignerTool()
}
```