import * as THREE from 'three';
import { Plugin, PluginContext } from '../core/PluginSystem';
import { IOrbitControlsPlugin } from './OrbitControlsPlugin';

export type CameraPathDesignerTarget =
  | { type: 'point'; point: THREE.Vector3 }
  | { type: 'object'; object: THREE.Object3D };

export interface CameraPathDesignerShot {
  duration: number;
  loop: boolean;
  easeInOut: number;
  pathPoints: Array<{ x: number; y: number; z: number }>;
  target?: { x: number; y: number; z: number } | null;
}

export interface CameraPathDesignerConfig {
  enabled?: boolean;
  pointSize?: number;
  lineColor?: number;
  pointColor?: number;
  selectedPointColor?: number;
  targetColor?: number;
  samples?: number;
}

export class CameraPathDesignerPlugin implements Plugin {
  readonly name = 'CameraPathDesignerPlugin';

  private _context: PluginContext | null = null;
  private _isDisposed = false;

  private _enabled = false;
  private _orbitControlsPlugin: IOrbitControlsPlugin | null = null;
  private _wasOrbitControlsEnabled = true;

  private _duration = 10;
  private _loop = false;
  private _easeInOut = 0;

  private _pathPoints: THREE.Vector3[] = [];
  private _target: CameraPathDesignerTarget | null = null;

  private _selectedIndex: number | null = null;
  private _draggingIndex: number | null = null;
  private _pickTargetArmed = false;

  private _raycaster = new THREE.Raycaster();
  private _pointerNdc = new THREE.Vector2();
  private _dragPlane = new THREE.Plane();
  private _tempNormal = new THREE.Vector3();
  private _tempPoint = new THREE.Vector3();

  private _helpersGroup: THREE.Group | null = null;
  private _pointMeshes: THREE.Mesh[] = [];
  private _pointGeometry: THREE.SphereGeometry | null = null;
  private _pointMaterial: THREE.MeshBasicMaterial | null = null;
  private _selectedPointMaterial: THREE.MeshBasicMaterial | null = null;

  private _targetMesh: THREE.Mesh | null = null;
  private _targetGeometry: THREE.SphereGeometry | null = null;
  private _targetMaterial: THREE.MeshBasicMaterial | null = null;

  private _line: THREE.Line | null = null;
  private _lineGeometry: THREE.BufferGeometry | null = null;
  private _lineMaterial: THREE.LineBasicMaterial | null = null;

  private _selectionHalo: THREE.Mesh | null = null;
  private _selectionHaloGeometry: THREE.RingGeometry | null = null;
  private _selectionHaloMaterial: THREE.MeshBasicMaterial | null = null;
  private _pulseTime = 0;

  private _samples = 200;

  private _pointSize = 0.12;
  private _lineColor = 0x44aaff;
  private _pointColor = 0xffffff;
  private _selectedPointColor = 0xffcc44;
  private _targetColor = 0xff4466;

  private _onPointerDown = (event: PointerEvent) => {
    if (!this._context || !this._enabled || this._isDisposed) return;

    const dom = this._context.renderer.domElement;
    const rect = dom.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    this._pointerNdc.set(x, y);
    this._raycaster.setFromCamera(this._pointerNdc, this._context.camera);

    if (this._pickTargetArmed) {
      const hits = this._raycaster.intersectObjects(this._context.scene.children, true);
      const hit = hits.find((h) => !this._isHelperObject(h.object));
      if (hit) {
        this.setTargetPoint(hit.point);
      }
      this._pickTargetArmed = false;
      return;
    }

    const intersections = this._raycaster.intersectObjects(this._pointMeshes, false);
    const hit = intersections[0];
    if (!hit) {
      this.setSelectedIndex(null);
      return;
    }

    const idx = (hit.object as THREE.Mesh).userData?.['pathPointIndex'];
    if (typeof idx !== 'number') return;
    const dragPoint = this._pathPoints[idx];
    if (!dragPoint) return;
    this.setSelectedIndex(idx);

    this._draggingIndex = idx;
    this._context.camera.getWorldDirection(this._tempNormal).normalize();
    this._dragPlane.setFromNormalAndCoplanarPoint(this._tempNormal, dragPoint);

    if (this._orbitControlsPlugin) {
      this._wasOrbitControlsEnabled = this._orbitControlsPlugin.controls.enabled;
      this._orbitControlsPlugin.controls.enabled = false;
    }

    dom.setPointerCapture(event.pointerId);
  };

  private _onPointerMove = (event: PointerEvent) => {
    if (!this._context || !this._enabled || this._isDisposed) return;
    if (this._draggingIndex === null) return;

    const dom = this._context.renderer.domElement;
    const rect = dom.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    this._pointerNdc.set(x, y);
    this._raycaster.setFromCamera(this._pointerNdc, this._context.camera);

    const ray = this._raycaster.ray;
    const hit = ray.intersectPlane(this._dragPlane, this._tempPoint);
    if (!hit) return;

    const draggingPoint = this._pathPoints[this._draggingIndex];
    if (!draggingPoint) return;
    draggingPoint.copy(this._tempPoint);
    this._syncHelpers();
  };

  private _onPointerUp = (event: PointerEvent) => {
    if (!this._context || this._isDisposed) return;

    if (this._draggingIndex !== null && this._orbitControlsPlugin) {
      this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled;
    }
    this._draggingIndex = null;

    try {
      this._context.renderer.domElement.releasePointerCapture(event.pointerId);
    } catch {
      void 0;
    }
  };

  initialize(context: PluginContext): void {
    if (this._isDisposed) {
      throw new Error('CameraPathDesignerPlugin has been disposed');
    }
    this._context = context;
    this._ensureHelpers();
  }

  configure(config: CameraPathDesignerConfig): void {
    if (this._isDisposed) return;

    if (config.pointSize !== undefined && config.pointSize > 0) this._pointSize = config.pointSize;
    if (config.lineColor !== undefined) this._lineColor = config.lineColor;
    if (config.pointColor !== undefined) this._pointColor = config.pointColor;
    if (config.selectedPointColor !== undefined) this._selectedPointColor = config.selectedPointColor;
    if (config.targetColor !== undefined) this._targetColor = config.targetColor;
    if (config.samples !== undefined && config.samples >= 10) this._samples = config.samples;

    this._rebuildMaterials();
    this._syncHelpers();

    if (config.enabled !== undefined) {
      if (config.enabled) this.enable();
      else this.disable();
    }
  }

  enable(): void {
    if (!this._context || this._isDisposed) return;
    if (this._enabled) return;
    this._enabled = true;
    this._ensureHelpers();
    if (this._helpersGroup) this._helpersGroup.visible = true;

    const dom = this._context.renderer.domElement;
    dom.addEventListener('pointerdown', this._onPointerDown);
    dom.addEventListener('pointermove', this._onPointerMove);
    dom.addEventListener('pointerup', this._onPointerUp);
  }

  disable(): void {
    if (!this._context || this._isDisposed) return;
    if (!this._enabled) return;
    this._enabled = false;
    this._pickTargetArmed = false;
    this._draggingIndex = null;

    const dom = this._context.renderer.domElement;
    dom.removeEventListener('pointerdown', this._onPointerDown);
    dom.removeEventListener('pointermove', this._onPointerMove);
    dom.removeEventListener('pointerup', this._onPointerUp);

    if (this._helpersGroup) this._helpersGroup.visible = false;
    if (this._selectionHalo) this._selectionHalo.visible = false;
    this._resetPointScales();
    if (this._orbitControlsPlugin) {
      this._orbitControlsPlugin.controls.enabled = this._wasOrbitControlsEnabled;
    }
  }

  update(deltaTime: number): void {
    if (!this._context || this._isDisposed) return;
    if (!this._enabled) return;

    this._pulseTime += deltaTime;

    const selectedIndex = this._selectedIndex;
    const pulse = 0.5 + 0.5 * Math.sin(this._pulseTime * 6);
    const selectedScale = 1 + 0.35 * pulse;

    for (let i = 0; i < this._pointMeshes.length; i++) {
      const mesh = this._pointMeshes[i];
      if (!mesh) continue;
      mesh.scale.setScalar(i === selectedIndex ? selectedScale : 1);
    }

    if (this._selectionHalo && this._selectionHaloMaterial) {
      if (selectedIndex === null) {
        this._selectionHalo.visible = false;
        return;
      }

      const selectedMesh = this._pointMeshes[selectedIndex];
      if (!selectedMesh) {
        this._selectionHalo.visible = false;
        return;
      }

      this._selectionHalo.visible = true;
      this._selectionHalo.position.copy(selectedMesh.position);
      this._selectionHalo.quaternion.copy(this._context.camera.quaternion);
      this._selectionHalo.scale.setScalar(1 + 0.65 * pulse);
      this._selectionHaloMaterial.opacity = 0.25 + 0.45 * pulse;
    }
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  setOrbitControlsPlugin(plugin: IOrbitControlsPlugin): void {
    this._orbitControlsPlugin = plugin;
  }

  setDuration(duration: number): void {
    if (Number.isFinite(duration) && duration > 0) this._duration = duration;
  }

  getDuration(): number {
    return this._duration;
  }

  setLoop(loop: boolean): void {
    this._loop = loop;
  }

  getLoop(): boolean {
    return this._loop;
  }

  setEaseInOut(value: number): void {
    if (!Number.isFinite(value)) return;
    this._easeInOut = Math.max(0, Math.min(1, value));
  }

  getEaseInOut(): number {
    return this._easeInOut;
  }

  getPathPoints(): THREE.Vector3[] {
    return this._pathPoints.map((p) => p.clone());
  }

  setPathPoints(points: THREE.Vector3[]): void {
    this._pathPoints = points.map((p) => p.clone());
    this.setSelectedIndex(null);
    this._ensureHelpers();
    this._syncHelpers();
  }

  addPoint(point: THREE.Vector3): void {
    this._pathPoints.push(point.clone());
    this._ensureHelpers();
    this._syncHelpers();
    this.setSelectedIndex(this._pathPoints.length - 1);
  }

  addPointFromCamera(): void {
    if (!this._context) return;
    this.addPoint(this._context.camera.position);
  }

  insertPointAfter(index: number): void {
    if (!this._context) return;
    if (index < 0 || index >= this._pathPoints.length) return;
    const base = this._pathPoints[index];
    if (!base) return;
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this._context.camera.quaternion).normalize();
    const inserted = base.clone().addScaledVector(camRight, this._pointSize * 6);
    this._pathPoints.splice(index + 1, 0, inserted);
    this._ensureHelpers();
    this._syncHelpers();
    this.setSelectedIndex(index + 1);
  }

  removePoint(index: number): void {
    if (index < 0 || index >= this._pathPoints.length) return;
    this._pathPoints.splice(index, 1);
    if (this._selectedIndex !== null) {
      if (this._pathPoints.length === 0) this._selectedIndex = null;
      else this._selectedIndex = Math.min(this._selectedIndex, this._pathPoints.length - 1);
    }
    this._ensureHelpers();
    this._syncHelpers();
  }

  removeSelectedPoint(): void {
    if (this._selectedIndex === null) return;
    this.removePoint(this._selectedIndex);
  }

  clear(): void {
    this._pathPoints = [];
    this._selectedIndex = null;
    this._ensureHelpers();
    this._syncHelpers();
  }

  setSelectedIndex(index: number | null): void {
    if (index === null) {
      this._selectedIndex = null;
      this._syncPointMaterials();
      return;
    }
    if (index < 0 || index >= this._pathPoints.length) return;
    this._selectedIndex = index;
    this._syncPointMaterials();
  }

  getSelectedIndex(): number | null {
    return this._selectedIndex;
  }

  armPickTargetOnce(): void {
    if (!this._enabled) this.enable();
    this._pickTargetArmed = true;
  }

  isPickTargetArmed(): boolean {
    return this._pickTargetArmed;
  }

  setTargetPoint(point: THREE.Vector3): void {
    this._target = { type: 'point', point: point.clone() };
    this._syncHelpers();
  }

  setTargetObject(object: THREE.Object3D): void {
    this._target = { type: 'object', object };
    this._syncHelpers();
  }

  clearTarget(): void {
    this._target = null;
    this._syncHelpers();
  }

  getTargetPoint(): THREE.Vector3 | null {
    if (!this._target) return null;
    if (this._target.type === 'point') return this._target.point.clone();
    this._target.object.getWorldPosition(this._tempPoint);
    return this._tempPoint.clone();
  }

  exportShot(): CameraPathDesignerShot {
    return {
      duration: this._duration,
      loop: this._loop,
      easeInOut: this._easeInOut,
      pathPoints: this._pathPoints.map((p) => ({ x: p.x, y: p.y, z: p.z })),
      target: this.getTargetPoint()
        ? (() => {
            const t = this.getTargetPoint()!;
            return { x: t.x, y: t.y, z: t.z };
          })()
        : null,
    };
  }

  importShot(shot: CameraPathDesignerShot): void {
    this.setDuration(shot.duration);
    this.setLoop(shot.loop);
    this.setEaseInOut(shot.easeInOut);
    this.setPathPoints(shot.pathPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)));
    if (shot.target) this.setTargetPoint(new THREE.Vector3(shot.target.x, shot.target.y, shot.target.z));
    else this.clearTarget();
  }

  dispose(): void {
    if (this._isDisposed) return;
    this.disable();
    this._isDisposed = true;

    if (this._helpersGroup && this._context) {
      this._context.scene.remove(this._helpersGroup);
    }

    this._pointMeshes = [];

    this._pointGeometry?.dispose();
    this._pointMaterial?.dispose();
    this._selectedPointMaterial?.dispose();
    this._targetGeometry?.dispose();
    this._targetMaterial?.dispose();
    this._lineGeometry?.dispose();
    this._lineMaterial?.dispose();
    this._selectionHaloGeometry?.dispose();
    this._selectionHaloMaterial?.dispose();

    this._helpersGroup = null;
    this._pointGeometry = null;
    this._pointMaterial = null;
    this._selectedPointMaterial = null;
    this._targetMesh = null;
    this._targetGeometry = null;
    this._targetMaterial = null;
    this._line = null;
    this._lineGeometry = null;
    this._lineMaterial = null;
    this._selectionHalo = null;
    this._selectionHaloGeometry = null;
    this._selectionHaloMaterial = null;
    this._context = null;
    this._orbitControlsPlugin = null;
    this._target = null;
  }

  private _ensureHelpers(): void {
    if (!this._context) return;
    if (!this._helpersGroup) {
      this._helpersGroup = new THREE.Group();
      this._helpersGroup.name = 'CameraPathDesignerHelpers';
      this._helpersGroup.visible = this._enabled;
      this._context.scene.add(this._helpersGroup);
    }

    if (!this._pointGeometry) this._pointGeometry = new THREE.SphereGeometry(this._pointSize, 16, 12);
    if (!this._lineMaterial) this._lineMaterial = new THREE.LineBasicMaterial({ color: this._lineColor });
    if (!this._targetGeometry) this._targetGeometry = new THREE.SphereGeometry(this._pointSize * 1.2, 16, 12);
    if (!this._targetMaterial) this._targetMaterial = new THREE.MeshBasicMaterial({ color: this._targetColor });

    if (!this._pointMaterial || !this._selectedPointMaterial) {
      this._rebuildMaterials();
    }

    if (!this._lineGeometry) this._lineGeometry = new THREE.BufferGeometry();
    if (!this._line) {
      this._line = new THREE.Line(this._lineGeometry, this._lineMaterial);
      this._line.renderOrder = 9999;
      this._helpersGroup.add(this._line);
    }

    if (!this._selectionHaloGeometry) {
      this._selectionHaloGeometry = new THREE.RingGeometry(this._pointSize * 2.1, this._pointSize * 3.6, 40);
    }
    if (!this._selectionHaloMaterial) {
      this._selectionHaloMaterial = new THREE.MeshBasicMaterial({
        color: this._selectedPointColor,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    }
    if (!this._selectionHalo) {
      this._selectionHalo = new THREE.Mesh(this._selectionHaloGeometry, this._selectionHaloMaterial);
      this._selectionHalo.visible = false;
      this._selectionHalo.renderOrder = 11000;
      this._helpersGroup.add(this._selectionHalo);
    }

    if (!this._targetMesh) {
      this._targetMesh = new THREE.Mesh(this._targetGeometry, this._targetMaterial);
      this._targetMesh.visible = false;
      this._targetMesh.renderOrder = 10000;
      this._helpersGroup.add(this._targetMesh);
    }

    while (this._pointMeshes.length < this._pathPoints.length) {
      const mesh = new THREE.Mesh(this._pointGeometry, this._pointMaterial!);
      mesh.userData = { pathPointIndex: this._pointMeshes.length };
      mesh.renderOrder = 10000;
      this._pointMeshes.push(mesh);
      this._helpersGroup.add(mesh);
    }

    while (this._pointMeshes.length > this._pathPoints.length) {
      const mesh = this._pointMeshes.pop()!;
      this._helpersGroup.remove(mesh);
    }

    for (let i = 0; i < this._pointMeshes.length; i++) {
      const mesh = this._pointMeshes[i];
      if (!mesh) continue;
      mesh.userData['pathPointIndex'] = i;
    }
  }

  private _rebuildMaterials(): void {
    this._pointMaterial?.dispose();
    this._selectedPointMaterial?.dispose();
    this._lineMaterial?.dispose();
    this._targetMaterial?.dispose();
    this._selectionHaloMaterial?.dispose();

    this._pointMaterial = new THREE.MeshBasicMaterial({ color: this._pointColor });
    this._selectedPointMaterial = new THREE.MeshBasicMaterial({ color: this._selectedPointColor });
    this._lineMaterial = new THREE.LineBasicMaterial({ color: this._lineColor });
    this._targetMaterial = new THREE.MeshBasicMaterial({ color: this._targetColor });
    this._selectionHaloMaterial = new THREE.MeshBasicMaterial({
      color: this._selectedPointColor,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    if (this._line) this._line.material = this._lineMaterial;
    if (this._targetMesh) this._targetMesh.material = this._targetMaterial;
    if (this._selectionHalo) this._selectionHalo.material = this._selectionHaloMaterial;
    this._syncPointMaterials();
  }

  private _syncPointMaterials(): void {
    if (!this._pointMaterial || !this._selectedPointMaterial) return;
    for (let i = 0; i < this._pointMeshes.length; i++) {
      const mesh = this._pointMeshes[i];
      if (!mesh) continue;
      mesh.material = i === this._selectedIndex ? this._selectedPointMaterial : this._pointMaterial;
    }
  }

  private _resetPointScales(): void {
    for (const mesh of this._pointMeshes) {
      mesh.scale.setScalar(1);
    }
  }

  private _syncHelpers(): void {
    if (!this._context || !this._helpersGroup) return;

    for (let i = 0; i < this._pathPoints.length; i++) {
      const mesh = this._pointMeshes[i];
      const p = this._pathPoints[i];
      if (!mesh || !p) continue;
      mesh.position.copy(p);
      mesh.visible = this._enabled;
    }

    if (!this._enabled && this._selectionHalo) {
      this._selectionHalo.visible = false;
    }

    if (this._targetMesh) {
      const t = this.getTargetPoint();
      if (t) {
        this._targetMesh.visible = this._enabled;
        this._targetMesh.position.copy(t);
      } else {
        this._targetMesh.visible = false;
      }
    }

    this._syncLine();
    this._syncPointMaterials();
  }

  private _syncLine(): void {
    if (!this._lineGeometry) return;

    if (this._pathPoints.length < 2) {
      this._lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      this._lineGeometry.computeBoundingSphere();
      return;
    }

    const curve = new THREE.CatmullRomCurve3(this._pathPoints);
    const pts = curve.getPoints(this._samples);
    const positions = new Float32Array(pts.length * 3);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (!p) continue;
      positions[i * 3 + 0] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }

    this._lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._lineGeometry.computeBoundingSphere();
  }

  private _isHelperObject(obj: THREE.Object3D): boolean {
    if (!this._helpersGroup) return false;
    if (obj === this._helpersGroup) return true;
    return this._helpersGroup.children.includes(obj) || this._helpersGroup.getObjectById(obj.id) !== undefined;
  }
}
