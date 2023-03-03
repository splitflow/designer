# SpliFlow

[SplitFlow](https://splitflow.io) is a no-code editor which allows designers to style web based applications.

- :heart: Built for UI designers.
- :sparkles: JS Framework agnostic.
- :snowflake: Embedded into your app.
- :zap: Real time styling.

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
import { createStyle } from '@splitflow/designer/style';
...
const style = createStyle('MyComponentName');
...
<div class={style.root()}>
    <h1 class={style.title()}>Title</h1>
</div>
```

Caution : The root element of a component must be styled with the `root` keyword.

### Launch your app and start styling!

SplitFlow style editor is displayed within your app as an overlay. Any element registered with the `createStyle` API can be styled.

Caution : at this stage, your design is not persisted and will be discarded on page reload. Add your API key!

## React styled-components built in support

SplitFlow handles most of the styling, but sometimes developers need to have control on some CSS declarations. The most common use case are animations which remain within the developers responsibility.

```ts
import { createStyle } from '@splitflow/designer/react';
import styled from 'my-preferred-styled-components-lib';
...
const Style = createStyle('MyComponentName', {
    Root: 'div',
    Title: styled.div({
        fontWeight: 600
    })
});
...
<Style.Root>
    <Style.Title>Title</Style.Title>
</Style.Root>
```

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