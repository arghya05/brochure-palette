// Centralized default configuration values
export const DEFAULT_CONFIG = {
  FONTS: {
    ARABIC_REGULAR_SIZE: 24,
    ARABIC_BOLD_SIZE: 28,
    ENGLISH_REGULAR_SIZE: 22,
    ENGLISH_BOLD_SIZE: 24,
    ENGLISH_BOLD_PRICE_STRIKE_SIZE: 18,
    ENGLISH_BOLD_PRICE_SIZE: 30,
  },
  DIMENSIONS: {
    WIDTH: 400,
    HEIGHT: 600,
  },
  GRID: {
    COLS: 4,
    ROWS: 3,
    SPACING: 2,
  },
  TEXT: {
    ARABIC_X: 30,
    ARABIC_Y_OFFSET: 200,
    ARABIC_MAX_WIDTH: 16,
    ARABIC_COLOR: [35, 31, 32] as [number, number, number],
    ENGLISH_X: 30,
    ENGLISH_Y_OFFSET: 120,
    ENGLISH_MAX_WIDTH: 16,
    ENGLISH_COLOR: [35, 31, 32] as [number, number, number],
  },
  PRODUCT_IMAGE: {
    MAX_WIDTH: 300,
    MAX_HEIGHT: 300,
    CENTER_X_OFFSET: 0,
    CENTER_Y_OFFSET: -50,
  },
  PRICE_TAG: {
    WIDTH: 120,
    HEIGHT: 120,
    X_OFFSET: 15,
    Y_OFFSET: 120,
    CORNER_RADIUS: 50,
    BACKGROUND_COLOR: [232, 62, 50] as [number, number, number],
    REGULAR_PRICE_X_OFFSET: 0,
    REGULAR_PRICE_Y_OFFSET: 15,
    REGULAR_PRICE_COLOR: [255, 255, 0] as [number, number, number],
    STRIKE_LINE_COLOR: [100, 100, 100] as [number, number, number],
    STRIKE_LINE_WIDTH: 1,
    PROMO_PRICE_X_OFFSET: 0,
    PROMO_PRICE_Y_OFFSET: 50,
    PROMO_PRICE_COLOR: [255, 255, 255] as [number, number, number],
  },
  ICON: {
    SIZE: 50,
    X_OFFSET: 15,
    Y_OFFSET: 15,
    BACKGROUND_CIRCLE_RADIUS_OFFSET: 3,
    BACKGROUND_COLOR: [255, 255, 255] as [number, number, number],
    BORDER_COLOR: [0, 0, 0] as [number, number, number],
    BORDER_WIDTH: 1,
  },
  BACKGROUND_COLOR: [255, 255, 255] as [number, number, number],
  GRID_BACKGROUND_COLOR: [240, 240, 240] as [number, number, number],
} as const;

// Component-specific defaults
export const COMPONENT_DEFAULTS = {
  TEXT_PROPERTIES: {
    FONT_SIZE: DEFAULT_CONFIG.FONTS.ARABIC_REGULAR_SIZE,
    MAX_WIDTH: DEFAULT_CONFIG.TEXT.ARABIC_MAX_WIDTH,
    COLOR: '#231f20',
  },
  OPACITY: 1,
  ROTATION: 0,
  VISIBLE: true,
} as const;