import { createStyle } from '../lib/style'

export const style = createStyle('App', {
    root: {
        layout: {
            direction: 'row',
            mainAxisAlignment: 'space-between',
            crossAxisAlignment: 'stretch',
            spacing: 1
        },
        background: {
            color: ['#background', '#background', '#background', '#background']
        }
    }
})
