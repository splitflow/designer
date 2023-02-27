import { createStyle } from '../lib/style'

export const style = createStyle('Nav', {
    root: {
        layout: {
            direction: 'column',
            mainAxisAlignment: 'center',
            crossAxisAlignment: 'stretch',
            spacing: 1
        },
        padding: { top: 1, bottom: 1, left: 1, right: 1 }
    },
    button: {
        padding: { top: 0.5, bottom: 0.5, left: 1, right: 1 },
        corner: { topLeft: 1, topRight: 1, bottomLeft: 1, bottomRight: 1 },
        layout: {
            direction: 'row',
            mainAxisAlignment: 'center',
            crossAxisAlignment: 'stretch',
            spacing: 1
        }
    },
    'button:red': {
        border: { tickness: 0.2, color: [0, 50, 40, 1] },
        typography: { fontSize: 1, fontWeight: 600, color: [0, 50, 30, 1] }
    },
    'button:green': {
        border: { tickness: 0.2, color: [150, 50, 40, 1] },
        typography: { fontSize: 1, fontWeight: 600, color: [150, 50, 30, 1] }
    },
    'button:reset': {
        border: { tickness: 0.2, color: [0, 0, 100] },
        typography: { fontSize: 1, fontWeight: 400, color: [0, 0, 100] }
    },
    'button:hover': { background: { color: [0, 50, 65] } }
})
