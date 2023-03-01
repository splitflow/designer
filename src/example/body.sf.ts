import { createStyle } from '../lib/style'

export const style = createStyle('Body', {
    feature: {
        typography: {
            fontSize: 1.25,
            fontWeight: 400,
            color: [0, 0, 0, 1]
        }
    },
    root: {
        padding: {
            top: 16,
            bottom: 4,
            left: 4,
            right: 4
        },
        layout: {
            direction: 'column',
            mainAxisAlignment: 'start',
            crossAxisAlignment: 'center',
            spacing: 1
        }
    },
    title: {
        typography: {
            fontSize: 4,
            fontWeight: 400,
            color: [0, 0, 0, 1]
        }
    }
})
