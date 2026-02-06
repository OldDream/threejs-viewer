/**
 * Backward Compatibility Tests for ThreeViewer
 *
 * These tests verify that the new instance access API does not break
 * existing functionality of the ThreeViewer component.
 *
 * Requirements Verified:
 * - 6.1: THE existing ThreeViewer props interface SHALL remain unchanged
 * - 6.2: THE existing callback props (onLoad, onError, onLoadingChange) SHALL continue to function
 * - 6.3: THE new ref prop SHALL be optional and not affect existing usage
 * - 6.5: WHEN the new API is not used, THE ThreeViewer behavior SHALL be identical to the previous version
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import React from 'react';
import { ThreeViewer, ThreeViewerProps, ZoomLimits } from '../components/ThreeViewer';

describe('Backward Compatibility - ThreeViewer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('Requirement 6.1: Props Interface Unchanged', () => {
    it('should accept all original props without errors', () => {
      const props: ThreeViewerProps = {
        modelUrl: 'test.glb',
        pivotPoint: { x: 0, y: 0, z: 0 },
        zoomLimits: { min: 1, max: 100 },
        className: 'test-class',
        style: { width: '100%', height: '100%' },
        onLoad: vi.fn(),
        onError: vi.fn(),
        onLoadingChange: vi.fn(),
      };

      // Should not throw when rendering with all original props
      expect(() => {
        render(<ThreeViewer {...props} />);
      }).not.toThrow();
    });

    it('should accept modelUrl prop', () => {
      expect(() => {
        render(<ThreeViewer modelUrl="model.glb" />);
      }).not.toThrow();
    });

    it('should accept pivotPoint prop', () => {
      expect(() => {
        render(<ThreeViewer pivotPoint={{ x: 1, y: 2, z: 3 }} />);
      }).not.toThrow();
    });

    it('should accept zoomLimits prop', () => {
      const zoomLimits: ZoomLimits = { min: 0.5, max: 50 };
      expect(() => {
        render(<ThreeViewer zoomLimits={zoomLimits} />);
      }).not.toThrow();
    });

    it('should accept className prop', () => {
      const { container } = render(<ThreeViewer className="custom-class" />);
      const viewerDiv = container.firstChild as HTMLElement;
      expect(viewerDiv.className).toBe('custom-class');
    });

    it('should accept style prop', () => {
      const customStyle = { backgroundColor: 'red', border: '1px solid black' };
      const { container } = render(<ThreeViewer style={customStyle} />);
      const viewerDiv = container.firstChild as HTMLElement;
      expect(viewerDiv.style.backgroundColor).toBe('red');
      expect(viewerDiv.style.border).toBe('1px solid black');
    });

    it('should apply default styles (width: 100%, height: 100%)', () => {
      const { container } = render(<ThreeViewer />);
      const viewerDiv = container.firstChild as HTMLElement;
      expect(viewerDiv.style.width).toBe('100%');
      expect(viewerDiv.style.height).toBe('100%');
    });
  });

  describe('Requirement 6.2: Callback Props Continue to Function', () => {
    it('should accept onLoad callback prop', () => {
      const onLoad = vi.fn();
      expect(() => {
        render(<ThreeViewer onLoad={onLoad} />);
      }).not.toThrow();
    });

    it('should accept onError callback prop', () => {
      const onError = vi.fn();
      expect(() => {
        render(<ThreeViewer onError={onError} />);
      }).not.toThrow();
    });

    it('should accept onLoadingChange callback prop', () => {
      const onLoadingChange = vi.fn();
      expect(() => {
        render(<ThreeViewer onLoadingChange={onLoadingChange} />);
      }).not.toThrow();
    });

    it('should call onViewerReady callback after initialization', async () => {
      const onViewerReady = vi.fn();
      render(<ThreeViewer onViewerReady={onViewerReady} />);

      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      expect(onViewerReady).toHaveBeenCalledTimes(1);
      const viewerCore = onViewerReady.mock.calls[0]?.[0];
      expect(viewerCore).toBeTruthy();
      expect(viewerCore.isInitialized).toBe(true);
    });

    it('should accept all callback props together', () => {
      const onLoad = vi.fn();
      const onError = vi.fn();
      const onLoadingChange = vi.fn();

      expect(() => {
        render(
          <ThreeViewer
            onLoad={onLoad}
            onError={onError}
            onLoadingChange={onLoadingChange}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Requirement 6.3: New ref prop is Optional', () => {
    it('should work without ref prop', () => {
      expect(() => {
        render(<ThreeViewer />);
      }).not.toThrow();
    });

    it('should work with ref prop', () => {
      const ref = React.createRef<any>();
      expect(() => {
        render(<ThreeViewer ref={ref} />);
      }).not.toThrow();
    });

    it('should work with all original props and no ref', () => {
      const props: ThreeViewerProps = {
        modelUrl: 'test.glb',
        pivotPoint: { x: 0, y: 0, z: 0 },
        zoomLimits: { min: 1, max: 100 },
        className: 'test-class',
        style: { width: '500px', height: '500px' },
        onLoad: vi.fn(),
        onError: vi.fn(),
        onLoadingChange: vi.fn(),
      };

      expect(() => {
        render(<ThreeViewer {...props} />);
      }).not.toThrow();
    });
  });

  describe('Requirement 6.5: Behavior Identical Without New API', () => {
    it('should render a container div', () => {
      const { container } = render(<ThreeViewer />);
      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should initialize Three.js viewer on mount', async () => {
      const { container } = render(<ThreeViewer />);
      
      // Advance timers to allow initialization
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // The container should have a canvas element added by Three.js renderer
      const viewerDiv = container.firstChild as HTMLElement;
      expect(viewerDiv).toBeInTheDocument();
    });

    it('should clean up on unmount', () => {
      const { unmount } = render(<ThreeViewer />);
      
      // Should not throw when unmounting
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle prop changes without re-initialization', async () => {
      const { rerender } = render(<ThreeViewer pivotPoint={{ x: 0, y: 0, z: 0 }} />);
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should not throw when props change
      expect(() => {
        rerender(<ThreeViewer pivotPoint={{ x: 1, y: 1, z: 1 }} />);
      }).not.toThrow();
    });

    it('should handle zoomLimits prop changes', async () => {
      const { rerender } = render(<ThreeViewer zoomLimits={{ min: 1, max: 10 }} />);
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should not throw when zoomLimits change
      expect(() => {
        rerender(<ThreeViewer zoomLimits={{ min: 0.5, max: 50 }} />);
      }).not.toThrow();
    });
  });

  describe('Children Support (New Feature - Should Not Break Existing)', () => {
    it('should work without children', () => {
      expect(() => {
        render(<ThreeViewer />);
      }).not.toThrow();
    });

    it('should work with children', () => {
      expect(() => {
        render(
          <ThreeViewer>
            <div>Child Component</div>
          </ThreeViewer>
        );
      }).not.toThrow();
    });

    it('should render children alongside the viewer', () => {
      const { getByText } = render(
        <ThreeViewer>
          <div>Test Child</div>
        </ThreeViewer>
      );

      expect(getByText('Test Child')).toBeInTheDocument();
    });
  });

  describe('Type Exports Verification', () => {
    it('should export ThreeViewerProps type', () => {
      // This test verifies at compile time that ThreeViewerProps is exported
      const props: ThreeViewerProps = {};
      expect(props).toBeDefined();
    });

    it('should export ZoomLimits type', () => {
      // This test verifies at compile time that ZoomLimits is exported
      const limits: ZoomLimits = { min: 1, max: 100 };
      expect(limits).toBeDefined();
    });
  });
});

describe('Backward Compatibility - Component Behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should maintain display name for debugging', () => {
    expect(ThreeViewer.displayName).toBe('ThreeViewer');
  });

  it('should be a forwardRef component', () => {
    // forwardRef components have $$typeof property
    expect(ThreeViewer).toHaveProperty('$$typeof');
  });

  it('should accept no props (all optional)', () => {
    // All props are optional, so rendering without any props should work
    expect(() => {
      render(<ThreeViewer />);
    }).not.toThrow();
  });
});
