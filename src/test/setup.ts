import '@testing-library/jest-dom'

// Declare global for Node.js environment
declare const global: typeof globalThis;

// Mock WebGL context for Three.js testing
// This is needed because jsdom doesn't support WebGL
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement | null = null
  
  getExtension() {
    return null
  }
  
  getParameter(pname: number) {
    // Return reasonable defaults for common parameters
    switch (pname) {
      case 7936: // VERSION
        return 'WebGL 1.0'
      case 7937: // SHADING_LANGUAGE_VERSION
        return 'WebGL GLSL ES 1.0'
      case 7938: // VENDOR
        return 'Mock Vendor'
      case 7939: // RENDERER
        return 'Mock Renderer'
      case 34076: // MAX_TEXTURE_SIZE
        return 4096
      case 34024: // MAX_VIEWPORT_DIMS
        return [4096, 4096]
      default:
        return 0
    }
  }
  
  createShader() {
    return {}
  }
  
  shaderSource() {}
  compileShader() {}
  
  getShaderParameter() {
    return true
  }
  
  createProgram() {
    return {}
  }
  
  attachShader() {}
  linkProgram() {}
  
  getProgramParameter() {
    return true
  }
  
  useProgram() {}
  
  createBuffer() {
    return {}
  }
  
  bindBuffer() {}
  bufferData() {}
  
  createTexture() {
    return {}
  }
  
  bindTexture() {}
  texImage2D() {}
  texParameteri() {}
  
  createFramebuffer() {
    return {}
  }
  
  bindFramebuffer() {}
  framebufferTexture2D() {}
  
  createRenderbuffer() {
    return {}
  }
  
  bindRenderbuffer() {}
  renderbufferStorage() {}
  framebufferRenderbuffer() {}
  
  viewport() {}
  clear() {}
  clearColor() {}
  enable() {}
  disable() {}
  depthFunc() {}
  blendFunc() {}
  cullFace() {}
  frontFace() {}
  
  getAttribLocation() {
    return 0
  }
  
  getUniformLocation() {
    return {}
  }
  
  enableVertexAttribArray() {}
  vertexAttribPointer() {}
  
  uniform1i() {}
  uniform1f() {}
  uniform2f() {}
  uniform3f() {}
  uniform4f() {}
  uniformMatrix4fv() {}
  
  drawArrays() {}
  drawElements() {}
  
  deleteShader() {}
  deleteProgram() {}
  deleteBuffer() {}
  deleteTexture() {}
  deleteFramebuffer() {}
  deleteRenderbuffer() {}
  
  getShaderInfoLog() {
    return ''
  }
  
  getProgramInfoLog() {
    return ''
  }
  
  checkFramebufferStatus() {
    return 36053 // FRAMEBUFFER_COMPLETE
  }
  
  pixelStorei() {}
  activeTexture() {}
  generateMipmap() {}
  
  isContextLost() {
    return false
  }
}

// Override getContext to return mock WebGL context
const originalGetContext = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = function(
  this: HTMLCanvasElement,
  contextId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    const mockContext = new MockWebGLRenderingContext()
    mockContext.canvas = this
    return mockContext as unknown as WebGLRenderingContext
  }
  return originalGetContext(contextId, options)
}

// Mock ResizeObserver for component testing
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock requestAnimationFrame for render loop testing
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number
}

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id)
}
