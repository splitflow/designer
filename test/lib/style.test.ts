import { describe, expect, it } from 'vitest'
import { createStyle } from '../../src/lib/style'

describe('style', () => {
    it('.root()', () => {
        const s = createStyle('MyComponent')
        expect(s.root()).to.equal('sf-MyComponent-root')
    })
    it('.root() with variant', () => {
        const s = createStyle('MyComponent')
        expect(s.root({ red: true })).to.equal('sf-MyComponent-root red')
    })
    it('.root() with CSSStyleDef function', () => {
        const s = createStyle('MyComponent', {
            root: () => 'other-class-name'
        })
        expect(s.root()).to.equal('sf-MyComponent-root other-class-name')
    })
    it('.root() with CSSStyleDef string', () => {
        const s = createStyle('MyComponent', {
            root: 'other-class-name'
        })
        expect(s.root()).to.equal('sf-MyComponent-root other-class-name')
    })
    it('.root() with CSSStyleDef and variant', () => {
        const s = createStyle('MyComponent', {
            root: () => 'other-class-name'
        })
        expect(s.root({ red: true })).to.equal('sf-MyComponent-root red other-class-name')
    })
})
