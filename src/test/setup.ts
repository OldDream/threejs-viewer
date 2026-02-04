import '@testing-library/jest-dom'

// Declare global for Node.js environment
declare const global: typeof globalThis;

// WebGL constants
const GL_VERSION = 0x1F02;
const GL_SHADING_LANGUAGE_VERSION = 0x8B8C;
const GL_VENDOR = 0x1F00;
const GL_RENDERER = 0x1F01;

// Mock WebGL2 context for Three.js testing
// This is needed because jsdom doesn't support WebGL
class MockWebGL2RenderingContext {
  canvas: HTMLCanvasElement | null = null;
  drawingBufferWidth = 800;
  drawingBufferHeight = 600;
  
  // WebGL2 constants
  TEXTURE_2D = 0x0DE1;
  TEXTURE_CUBE_MAP = 0x8513;
  FRAMEBUFFER = 0x8D40;
  RENDERBUFFER = 0x8D41;
  FRAMEBUFFER_COMPLETE = 0x8CD5;
  ARRAY_BUFFER = 0x8892;
  ELEMENT_ARRAY_BUFFER = 0x8893;
  STATIC_DRAW = 0x88E4;
  DYNAMIC_DRAW = 0x88E8;
  FLOAT = 0x1406;
  UNSIGNED_BYTE = 0x1401;
  UNSIGNED_SHORT = 0x1403;
  UNSIGNED_INT = 0x1405;
  RGBA = 0x1908;
  RGB = 0x1907;
  DEPTH_TEST = 0x0B71;
  BLEND = 0x0BE2;
  CULL_FACE = 0x0B44;
  VERTEX_SHADER = 0x8B31;
  FRAGMENT_SHADER = 0x8B30;
  COMPILE_STATUS = 0x8B81;
  LINK_STATUS = 0x8B82;
  COLOR_BUFFER_BIT = 0x4000;
  DEPTH_BUFFER_BIT = 0x0100;
  STENCIL_BUFFER_BIT = 0x0400;
  
  getExtension(name: string) {
    // Return mock extensions that Three.js commonly checks for
    const extensions: Record<string, object | null> = {
      'EXT_color_buffer_float': {},
      'EXT_color_buffer_half_float': {},
      'EXT_texture_filter_anisotropic': { MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF },
      'WEBGL_compressed_texture_s3tc': {},
      'WEBGL_compressed_texture_pvrtc': null,
      'WEBGL_compressed_texture_etc1': null,
      'WEBGL_compressed_texture_astc': null,
      'WEBGL_debug_renderer_info': {},
      'WEBGL_lose_context': {},
      'OES_texture_float': {},
      'OES_texture_float_linear': {},
      'OES_texture_half_float': {},
      'OES_texture_half_float_linear': {},
      'OES_standard_derivatives': {},
      'OES_element_index_uint': {},
      'OES_vertex_array_object': {},
      'ANGLE_instanced_arrays': {},
      'WEBGL_depth_texture': {},
      'WEBGL_draw_buffers': {},
    };
    return extensions[name] ?? null;
  }
  
  getParameter(pname: number): string | number | Int32Array | Float32Array | null {
    // Return reasonable defaults for common parameters
    switch (pname) {
      case GL_VERSION:
      case 0x1F02:
        return 'WebGL 2.0 (OpenGL ES 3.0 Mock)';
      case GL_SHADING_LANGUAGE_VERSION:
      case 0x8B8C:
        return 'WebGL GLSL ES 3.00 (Mock)';
      case GL_VENDOR:
      case 0x1F00:
        return 'Mock Vendor';
      case GL_RENDERER:
      case 0x1F01:
        return 'Mock Renderer';
      case 0x0D33: // MAX_TEXTURE_SIZE
      case 0x851C: // MAX_CUBE_MAP_TEXTURE_SIZE
        return 4096;
      case 0x84E8: // MAX_VIEWPORT_DIMS
        return new Int32Array([4096, 4096]);
      case 0x8872: // MAX_TEXTURE_IMAGE_UNITS
        return 16;
      case 0x8B4D: // MAX_VERTEX_TEXTURE_IMAGE_UNITS
        return 16;
      case 0x8DFB: // MAX_VERTEX_UNIFORM_VECTORS
        return 4096;
      case 0x8DFC: // MAX_VARYING_VECTORS
        return 30;
      case 0x8DFD: // MAX_FRAGMENT_UNIFORM_VECTORS
        return 4096;
      case 0x8869: // MAX_VERTEX_ATTRIBS
        return 16;
      case 0x8B4C: // MAX_COMBINED_TEXTURE_IMAGE_UNITS
        return 32;
      case 0x84E4: // MAX_RENDERBUFFER_SIZE
        return 4096;
      case 0x8B4A: // MAX_VERTEX_UNIFORM_COMPONENTS
        return 16384;
      case 0x8B49: // MAX_FRAGMENT_UNIFORM_COMPONENTS
        return 16384;
      case 0x8D57: // MAX_SAMPLES
        return 4;
      case 0x8A2E: // MAX_DRAW_BUFFERS
        return 8;
      case 0x8A2D: // MAX_COLOR_ATTACHMENTS
        return 8;
      case 0x80E9: // MAX_ELEMENTS_VERTICES
        return 1048576;
      case 0x80EA: // MAX_ELEMENTS_INDICES
        return 1048576;
      case 0x8D6B: // MAX_ELEMENT_INDEX
        return 4294967295;
      case 0x8073: // MAX_3D_TEXTURE_SIZE
        return 2048;
      case 0x88FF: // MAX_ARRAY_TEXTURE_LAYERS
        return 2048;
      case 0x8D6C: // MAX_UNIFORM_BUFFER_BINDINGS
        return 72;
      case 0x8A30: // MAX_UNIFORM_BLOCK_SIZE
        return 65536;
      case 0x8A2F: // MAX_COMBINED_UNIFORM_BLOCKS
        return 70;
      case 0x8A2B: // MAX_VERTEX_UNIFORM_BLOCKS
        return 14;
      case 0x8A2C: // MAX_FRAGMENT_UNIFORM_BLOCKS
        return 14;
      case 0x8904: // MIN_PROGRAM_TEXEL_OFFSET
        return -8;
      case 0x8905: // MAX_PROGRAM_TEXEL_OFFSET
        return 7;
      case 0x0B21: // LINE_WIDTH
        return 1;
      case 0x846E: // ALIASED_LINE_WIDTH_RANGE
        return new Float32Array([1, 1]);
      case 0x846D: // ALIASED_POINT_SIZE_RANGE
        return new Float32Array([1, 1024]);
      case 0x0D32: // MAX_TEXTURE_SIZE
        return 4096;
      default:
        // Return empty string for unknown string parameters to avoid indexOf errors
        return '';
    }
  }
  
  getSupportedExtensions() {
    return [
      'EXT_color_buffer_float',
      'EXT_texture_filter_anisotropic',
      'OES_texture_float_linear',
      'WEBGL_debug_renderer_info',
    ];
  }
  
  createShader() {
    return { id: Math.random() };
  }
  
  shaderSource() {}
  compileShader() {}
  
  getShaderParameter(_shader: unknown, pname: number) {
    if (pname === 0x8B81) return true; // COMPILE_STATUS
    return true;
  }
  
  createProgram() {
    return { id: Math.random() };
  }
  
  attachShader() {}
  linkProgram() {}
  validateProgram() {}
  
  getProgramParameter(_program: unknown, pname: number) {
    if (pname === 0x8B82) return true; // LINK_STATUS
    return true;
  }
  
  useProgram() {}
  
  createBuffer() {
    return { id: Math.random() };
  }
  
  bindBuffer() {}
  bufferData() {}
  bufferSubData() {}
  
  createTexture() {
    return { id: Math.random() };
  }
  
  bindTexture() {}
  texImage2D() {}
  texSubImage2D() {}
  texParameteri() {}
  texParameterf() {}
  
  createFramebuffer() {
    return { id: Math.random() };
  }
  
  bindFramebuffer() {}
  framebufferTexture2D() {}
  
  createRenderbuffer() {
    return { id: Math.random() };
  }
  
  bindRenderbuffer() {}
  renderbufferStorage() {}
  renderbufferStorageMultisample() {}
  framebufferRenderbuffer() {}
  
  viewport() {}
  scissor() {}
  clear() {}
  clearColor() {}
  clearDepth() {}
  clearStencil() {}
  enable() {}
  disable() {}
  depthFunc() {}
  depthMask() {}
  depthRange() {}
  blendFunc() {}
  blendFuncSeparate() {}
  blendEquation() {}
  blendEquationSeparate() {}
  blendColor() {}
  cullFace() {}
  frontFace() {}
  colorMask() {}
  stencilFunc() {}
  stencilFuncSeparate() {}
  stencilMask() {}
  stencilMaskSeparate() {}
  stencilOp() {}
  stencilOpSeparate() {}
  
  getAttribLocation() {
    return 0;
  }
  
  getUniformLocation() {
    return { id: Math.random() };
  }
  
  getActiveAttrib() {
    return { name: 'attr', type: 0x1406, size: 1 };
  }
  
  getActiveUniform() {
    return { name: 'uniform', type: 0x1406, size: 1 };
  }
  
  enableVertexAttribArray() {}
  disableVertexAttribArray() {}
  vertexAttribPointer() {}
  vertexAttrib1f() {}
  vertexAttrib2f() {}
  vertexAttrib3f() {}
  vertexAttrib4f() {}
  vertexAttrib1fv() {}
  vertexAttrib2fv() {}
  vertexAttrib3fv() {}
  vertexAttrib4fv() {}
  
  uniform1i() {}
  uniform1f() {}
  uniform2f() {}
  uniform3f() {}
  uniform4f() {}
  uniform1iv() {}
  uniform2iv() {}
  uniform3iv() {}
  uniform4iv() {}
  uniform1fv() {}
  uniform2fv() {}
  uniform3fv() {}
  uniform4fv() {}
  uniformMatrix2fv() {}
  uniformMatrix3fv() {}
  uniformMatrix4fv() {}
  
  drawArrays() {}
  drawElements() {}
  drawArraysInstanced() {}
  drawElementsInstanced() {}
  
  deleteShader() {}
  deleteProgram() {}
  deleteBuffer() {}
  deleteTexture() {}
  deleteFramebuffer() {}
  deleteRenderbuffer() {}
  
  getShaderInfoLog() {
    return '';
  }
  
  getProgramInfoLog() {
    return '';
  }
  
  getShaderPrecisionFormat() {
    return {
      rangeMin: 127,
      rangeMax: 127,
      precision: 23,
    };
  }
  
  checkFramebufferStatus() {
    return 0x8CD5; // FRAMEBUFFER_COMPLETE
  }
  
  readPixels() {}
  pixelStorei() {}
  activeTexture() {}
  generateMipmap() {}
  
  isContextLost() {
    return false;
  }
  
  getContextAttributes() {
    return {
      alpha: true,
      antialias: true,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    };
  }
  
  // WebGL2 specific methods
  createVertexArray() {
    return { id: Math.random() };
  }
  
  bindVertexArray() {}
  deleteVertexArray() {}
  
  createQuery() {
    return { id: Math.random() };
  }
  
  deleteQuery() {}
  beginQuery() {}
  endQuery() {}
  getQueryParameter() {
    return 0;
  }
  
  createSampler() {
    return { id: Math.random() };
  }
  
  deleteSampler() {}
  bindSampler() {}
  samplerParameteri() {}
  samplerParameterf() {}
  
  fenceSync() {
    return { id: Math.random() };
  }
  
  deleteSync() {}
  clientWaitSync() {
    return 0x911A; // ALREADY_SIGNALED
  }
  
  waitSync() {}
  
  createTransformFeedback() {
    return { id: Math.random() };
  }
  
  deleteTransformFeedback() {}
  bindTransformFeedback() {}
  beginTransformFeedback() {}
  endTransformFeedback() {}
  transformFeedbackVaryings() {}
  
  getUniformBlockIndex() {
    return 0;
  }
  
  uniformBlockBinding() {}
  
  createUniformBuffer() {
    return { id: Math.random() };
  }
  
  bindBufferBase() {}
  bindBufferRange() {}
  
  getBufferSubData() {}
  
  blitFramebuffer() {}
  invalidateFramebuffer() {}
  
  texStorage2D() {}
  texStorage3D() {}
  texImage3D() {}
  texSubImage3D() {}
  
  compressedTexImage2D() {}
  compressedTexImage3D() {}
  compressedTexSubImage2D() {}
  compressedTexSubImage3D() {}
  
  copyTexSubImage3D() {}
  
  getFragDataLocation() {
    return 0;
  }
  
  uniform1ui() {}
  uniform2ui() {}
  uniform3ui() {}
  uniform4ui() {}
  uniform1uiv() {}
  uniform2uiv() {}
  uniform3uiv() {}
  uniform4uiv() {}
  
  uniformMatrix2x3fv() {}
  uniformMatrix3x2fv() {}
  uniformMatrix2x4fv() {}
  uniformMatrix4x2fv() {}
  uniformMatrix3x4fv() {}
  uniformMatrix4x3fv() {}
  
  vertexAttribI4i() {}
  vertexAttribI4ui() {}
  vertexAttribI4iv() {}
  vertexAttribI4uiv() {}
  vertexAttribIPointer() {}
  
  vertexAttribDivisor() {}
  
  drawRangeElements() {}
  
  readBuffer() {}
  drawBuffers() {}
  
  clearBufferfv() {}
  clearBufferiv() {}
  clearBufferuiv() {}
  clearBufferfi() {}
  
  getInternalformatParameter() {
    return new Int32Array([4]);
  }
  
  getUniformIndices() {
    return [0];
  }
  
  getActiveUniforms() {
    return [0];
  }
  
  getActiveUniformBlockParameter() {
    return 0;
  }
  
  getActiveUniformBlockName() {
    return 'block';
  }
  
  isEnabled() {
    return false;
  }
  
  finish() {}
  flush() {}
  
  hint() {}
  lineWidth() {}
  polygonOffset() {}
  sampleCoverage() {}
}

// Override getContext to return mock WebGL2 context
const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function(
  contextId: string,
  _options?: any
): any {
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    const mockContext = new MockWebGL2RenderingContext();
    mockContext.canvas = this;
    return mockContext as unknown as WebGL2RenderingContext;
  }
  // For non-WebGL contexts, use the original implementation
  // We need to use apply with arguments to preserve the original call signature
  return originalGetContext.apply(this, arguments as any);
};

// Mock ResizeObserver for component testing
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame for render loop testing
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};
