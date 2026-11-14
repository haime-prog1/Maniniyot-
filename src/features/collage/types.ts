/**
 * Collage data model. All positions and sizes are in canvas pixels of the full
 * export canvas (1080 px per panel), so a carousel is one long canvas.
 */

export type FormatId = 'story' | 'post' | 'square' | 'carousel';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How a photo sits inside its frame. */
export interface Crop {
  /** 1 = cover the frame exactly; up to 5 = zoomed in. */
  scale: number;
  /** -1…1: how far the photo is shifted across its available overflow. */
  ox: number;
  oy: number;
}

export type FilterId = 'none' | 'warm' | 'vivid' | 'bw' | 'film' | 'faded';

export interface FilterSettings {
  preset: FilterId;
  /** 1 = unchanged. */
  brightness: number;
  contrast: number;
  saturation: number;
}

/** A polaroid-style paper border around a photo. */
export interface Matte {
  color: string;
  pad: number;
  bottom: number;
}

interface BaseLayer extends Rect {
  id: string;
  /** Degrees, clockwise, around the layer's center. */
  rotation: number;
  /** Created by a template (replaced when the template changes). */
  fromTemplate?: boolean;
}

export interface PhotoLayer extends BaseLayer {
  type: 'photo';
  assetId?: string;
  crop: Crop;
  filter: FilterSettings;
  /** Grid frames: spacing (gap) is applied around them. */
  inset: boolean;
  matte?: Matte;
}

export type TextRole = 'title' | 'body';
export type TextPreset = 'location' | 'date' | 'title' | 'caption';

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  pairId: string;
  role: TextRole;
  /** Font size in canvas px. */
  size: number;
  color: string;
  align: 'left' | 'center' | 'right';
  shadow: boolean;
  outline: boolean;
  /** Pill background behind the text, or null. */
  bg: string | null;
  uppercase?: boolean;
  /** Soft glow in the text color (date stamps). */
  glow?: boolean;
}

export type Layer = PhotoLayer | TextLayer;

export type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'blur'; assetId?: string; dim: number };

export interface CollageStyle {
  gap: number;
  radius: number;
  borderWidth: number;
  borderColor: string;
  background: Background;
  decor?: 'none' | 'sprockets';
}

export interface CollageProject {
  id: string;
  name: string;
  format: FormatId;
  panels: number;
  width: number;
  height: number;
  templateId: string;
  style: CollageStyle;
  /** Array order is stacking order: last is on top. */
  layers: Layer[];
  tripId?: string;
  destination?: string;
  createdAt: number;
  updatedAt: number;
  /** Small JPEG data URL for the My Collages list. */
  thumb?: string;
}

/** A drawable image source with its pixel size. */
export interface Frame {
  src: CanvasImageSource;
  w: number;
  h: number;
}
