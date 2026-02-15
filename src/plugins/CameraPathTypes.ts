/**
 * 路径插值类型
 */
export type InterpolationType = 'linear' | 'curve';

/**
 * 缓动配置
 */
export type EasingSpec =
  | { type: 'linear' }
  | { type: 'smoothstep'; strength: number };

/**
 * 分段覆盖模式
 */
export type SegmentOverride<T> =
  | { mode: 'inherit' }
  | { mode: 'override'; value: T };

/**
 * 单段路径配置（point[i] -> point[i + 1]）
 */
export interface CameraPathSegmentConfig {
  /** 段时长（秒） */
  duration: number;
  /** 插值模式（缺省为 inherit） */
  interpolation?: SegmentOverride<InterpolationType>;
  /** 缓动模式（缺省为 inherit） */
  easing?: SegmentOverride<EasingSpec>;
}

/**
 * 全局默认配置（供 segment inherit 使用）
 */
export interface CameraPathDefaults {
  interpolation: InterpolationType;
  easing: EasingSpec;
}

