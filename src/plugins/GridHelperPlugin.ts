import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';

/**
 * Grid plane type
 */
export type GridPlane = 'XY' | 'XZ' | 'YZ';

/**
 * GridHelper configuration options
 */
export interface GridHelperConfig {
  /** Size of the grid */
  size?: number;
  /** Number of divisions */
  divisions?: number;
  /** Primary grid color */
  colorCenterLine?: THREE.ColorRepresentation;
  /** Secondary grid color */
  colorGrid?: THREE.ColorRepresentation;
  /** Which plane to display the grid on */
  plane?: GridPlane;
  /** Show axes helper */
  showAxes?: boolean;
  /** Axes helper size */
  axesSize?: number;
}

/**
 * GridHelperPlugin Interface
 */
export interface IGridHelperPlugin extends Plugin {
  configure(config: GridHelperConfig): void;
  setVisible(visible: boolean): void;
  setPlane(plane: GridPlane): void;
  setAxesVisible(visible: boolean): void;
}

/**
 * GridHelperPlugin Implementation
 * 
 * Provides grid and axes visualization for the 3D scene.
 */
export class GridHelperPlugin implements IGridHelperPlugin {
  readonly name = 'GridHelperPlugin';
  
  private _context: PluginContext | null = null;
  private _gridHelper: THREE.GridHelper | null = null;
  private _axesHelper: THREE.AxesHelper | null = null;
  private _isDisposed: boolean = false;
  
  private _config: Required<GridHelperConfig> = {
    size: 10,
    divisions: 10,
    colorCenterLine: 0x444444,
    colorGrid: 0x888888,
    plane: 'XZ',
    showAxes: true,
    axesSize: 5,
  };

  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('GridHelperPlugin has been disposed');
    }

    this._context = context;
    this._createGrid();
    this._createAxes();
  }

  private _createGrid(): void {
    if (!this._context) return;

    // Remove existing grid
    if (this._gridHelper) {
      this._context.scene.remove(this._gridHelper);
      this._disposeHelper(this._gridHelper);
    }

    // Create new grid
    this._gridHelper = new THREE.GridHelper(
      this._config.size,
      this._config.divisions,
      this._config.colorCenterLine,
      this._config.colorGrid
    );

    // Rotate based on plane
    this._applyPlaneRotation();

    this._context.scene.add(this._gridHelper);
  }

  private _createAxes(): void {
    if (!this._context) return;

    // Remove existing axes
    if (this._axesHelper) {
      this._context.scene.remove(this._axesHelper);
      this._disposeHelper(this._axesHelper);
    }

    if (this._config.showAxes) {
      this._axesHelper = new THREE.AxesHelper(this._config.axesSize);
      this._context.scene.add(this._axesHelper);
    }
  }

  private _disposeHelper(helper: THREE.Object3D): void {
    if (!helper) return;

    const disposable = helper as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };

    if (disposable.geometry) {
      disposable.geometry.dispose();
    }

    if (disposable.material) {
      const material = disposable.material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material.dispose();
      }
    }
  }

  private _applyPlaneRotation(): void {
    if (!this._gridHelper) return;

    // Reset rotation
    this._gridHelper.rotation.set(0, 0, 0);

    switch (this._config.plane) {
      case 'XY':
        // Rotate to XY plane (vertical, facing Z)
        this._gridHelper.rotation.x = Math.PI / 2;
        break;
      case 'YZ':
        // Rotate to YZ plane (vertical, facing X)
        this._gridHelper.rotation.z = Math.PI / 2;
        break;
      case 'XZ':
      default:
        // Default XZ plane (horizontal ground)
        break;
    }
  }

  configure(config: GridHelperConfig): void {
    if (this._isDisposed) {
      throw new Error('GridHelperPlugin has been disposed');
    }

    // Update config
    if (config.size !== undefined) this._config.size = config.size;
    if (config.divisions !== undefined) this._config.divisions = config.divisions;
    if (config.colorCenterLine !== undefined) this._config.colorCenterLine = config.colorCenterLine;
    if (config.colorGrid !== undefined) this._config.colorGrid = config.colorGrid;
    if (config.plane !== undefined) this._config.plane = config.plane;
    if (config.showAxes !== undefined) this._config.showAxes = config.showAxes;
    if (config.axesSize !== undefined) this._config.axesSize = config.axesSize;

    // Recreate helpers with new config
    this._createGrid();
    this._createAxes();
  }

  setVisible(visible: boolean): void {
    if (this._gridHelper) {
      this._gridHelper.visible = visible;
    }
    // Axes visibility is controlled independently by configuration
  }

  setPlane(plane: GridPlane): void {
    this._config.plane = plane;
    this._applyPlaneRotation();
  }

  setAxesVisible(visible: boolean): void {
    this._config.showAxes = visible;
    this._createAxes();
  }

  dispose(): void {
    if (this._isDisposed) return;

    if (this._gridHelper && this._context) {
      this._context.scene.remove(this._gridHelper);
      this._disposeHelper(this._gridHelper);
      this._gridHelper = null;
    }

    if (this._axesHelper && this._context) {
      this._context.scene.remove(this._axesHelper);
      this._disposeHelper(this._axesHelper);
      this._axesHelper = null;
    }

    this._context = null;
    this._isDisposed = true;
  }
}
