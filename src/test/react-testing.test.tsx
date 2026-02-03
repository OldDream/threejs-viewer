import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component
function TestComponent({ message }: { message: string }) {
  return <div data-testid="test-component">{message}</div>
}

describe('@testing-library/react Integration', () => {
  it('should render React components', () => {
    render(<TestComponent message="Hello from React" />)
    
    const element = screen.getByTestId('test-component')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello from React')
  })

  it('should support queries', () => {
    render(<TestComponent message="Query Test" />)
    
    expect(screen.getByText('Query Test')).toBeInTheDocument()
  })
})
