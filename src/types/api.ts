// TypeScript interfaces based on OpenAPI schema

export interface BrochureConfig {
  id: string;
  name: string;
  created_at: string;
  fonts: FontConfig;
  dimensions: BrochureDimensions;
  grid: GridConfig;
  text: TextConfig;
  product_image: ProductImageConfig;
  price_tag: PriceTagConfig;
  icon: IconConfig;
  background_color: [number, number, number];
  grid_background_color: [number, number, number];
}

export interface FontConfig {
  arabic_regular_size: number;
  arabic_bold_size: number;
  english_regular_size: number;
  english_bold_size: number;
  english_bold_price_strike_size: number;
  english_bold_price_size: number;
}

export interface BrochureDimensions {
  width: number;
  height: number;
}

export interface GridConfig {
  cols: number;
  rows: number;
  spacing: number;
}

export interface TextConfig {
  arabic_x: number;
  arabic_y_offset: number;
  arabic_max_width: number;
  arabic_color: [number, number, number];
  english_x: number;
  english_y_offset: number;
  english_max_width: number;
  english_color: [number, number, number];
}

export interface ProductImageConfig {
  max_width: number;
  max_height: number;
  center_x_offset: number;
  center_y_offset: number;
}

export interface PriceTagConfig {
  width: number;
  height: number;
  x_offset: number;
  y_offset: number;
  corner_radius: number;
  background_color: [number, number, number];
  regular_price_x_offset: number;
  regular_price_y_offset: number;
  regular_price_color: [number, number, number];
  strike_line_color: [number, number, number];
  strike_line_width: number;
  promo_price_x_offset: number;
  promo_price_y_offset: number;
  promo_price_color: [number, number, number];
}

export interface IconConfig {
  size: number;
  x_offset: number;
  y_offset: number;
  background_circle_radius_offset: number;
  background_color: [number, number, number];
  border_color: [number, number, number];
  border_width: number;
}

export interface BrochureData {
  sku: string;
  arabic_description: string;
  english_description: string;
  regular_price: string;
  promo_price: string;
  icon_name: string;
}

export interface ComponentInfo {
  name: string;
  position: [number, number];
  size: [number, number];
  image_base64: string;
  format: string;
}

export interface BrochureComponents {
  background: ComponentInfo;
  product_image?: ComponentInfo;
  arabic_text?: ComponentInfo;
  english_text?: ComponentInfo;
  price_tag?: ComponentInfo;
  icon?: ComponentInfo;
  brochure_dimensions: [number, number];
}

export interface GenerateBrochureRequest {
  config_id: string;
  data: BrochureData[];
  output_format?: string;
  return_components?: boolean;
  layout?: Record<string, any>;
}

export interface CombinedBrochureRequest {
  config_id: string;
  data: BrochureData[];
  rows?: number;
  cols?: number;
  brochure_width?: number;
  brochure_height?: number;
  spacing?: number;
  output_format?: string;
  include_header?: boolean;
  header_image_path?: string;
  grid_background_color?: [number, number, number];
  layout?: Record<string, any>;
}

// Image Generation Agent Types
export interface ImageGenerationRequest {
  brochure_data: BrochureData[];
  style_prompt: string;
  image_type: 'flyer' | 'poster' | 'banner' | 'social_media';
  dimensions: {
    width: number;
    height: number;
  };
  additional_prompt?: string;
  brand_colors?: string[];
}

export interface ImageGenerationResponse {
  success: boolean;
  image_url?: string;
  error?: string;
  generation_id: string;
}