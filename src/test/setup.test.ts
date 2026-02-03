import { describe, it, expect } from 'vitest'
import { fc, test as fcTest } from '@fast-check/vitest'

describe('Test Environment Setup', () => {
  it('should have vitest working', () => {
    expect(true).toBe(true)
  })

  it('should have access to DOM APIs via jsdom', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello World'
    expect(div.textContent).toBe('Hello World')
  })

  it('should have WebGL mock available', () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    expect(gl).not.toBeNull()
  })

  it('should have ResizeObserver mock available', () => {
    expect(typeof ResizeObserver).toBe('function')
    const observer = new ResizeObserver(() => {})
    expect(observer).toBeDefined()
  })

  it('should have requestAnimationFrame mock available', () => {
    expect(typeof requestAnimationFrame).toBe('function')
    expect(typeof cancelAnimationFrame).toBe('function')
  })
})

describe('fast-check Integration', () => {
  fcTest.prop([fc.integer()])('should work with fast-check property tests', (n) => {
    expect(typeof n).toBe('number')
    expect(Number.isInteger(n)).toBe(true)
  })

  fcTest.prop([fc.string()])('should generate strings', (s) => {
    expect(typeof s).toBe('string')
  })

  fcTest.prop([fc.array(fc.integer())])('should generate arrays', (arr) => {
    expect(Array.isArray(arr)).toBe(true)
    arr.forEach(item => {
      expect(typeof item).toBe('number')
    })
  })
})

describe('@testing-library/jest-dom matchers', () => {
  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div')
    div.textContent = 'Test Content'
    document.body.appendChild(div)
    
    expect(div).toBeInTheDocument()
    expect(div).toHaveTextContent('Test Content')
    expect(div).toBeVisible()
    
    document.body.removeChild(div)
  })
})
