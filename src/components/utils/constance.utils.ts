// ==================== THEME & CONSTANTS ====================
/** Design system colors */
export const BLACK = '#000000';        // Primary green for borders and text
export const CARD_BG = '#FFFFFF';      // White background
export const RING = '#EEEEEE';         // Light gray for inactive borders

/** Layout constants */
export const CIRCLE = 32; // Main circle diameter

export const ANIMATION_CONFIG = {
    // Heart bounce timings
    HEART_COMPRESS_DURATION: 100,
    HEART_OVERSHOOT: { mass: 0.4, damping: 10, stiffness: 200 },
    HEART_SETTLE: { damping: 15, stiffness: 300 },

    // Circle pulse timings
    CIRCLE_PULSE_DURATION: 110,
    CIRCLE_BOUNCE: { mass: 0.4, damping: 10, stiffness: 200 },
    CIRCLE_SETTLE: { damping: 15, stiffness: 300 },

    // Shadow cleanup
    SHADOW_CLEANUP_DURATION: 200,

    // Chip animations
    CHIP_SLIDE_CONFIG: { mass: 0.3, damping: 8, stiffness: 200 },
    CHIP_FADE_DURATION: 400,
    CHIP_BOUNCE_CONFIG: { mass: 0.25, damping: 6, stiffness: 250 },
    CHIP_BOUNCE_SETTLE: { damping: 10, stiffness: 300 },
    CHIP_HIDE_DURATION: 200,

    // Gesture timings
    TAP_MAX_DURATION: 240,
    DOUBLE_TAP_MAX_DELAY: 240,
  } as const;

  export const ANIMATION_VALUES = {
    // Heart scales
    HEART_SCALE_COMPRESS: 0.85,
    HEART_SCALE_OVERSHOOT: 1.15,
    HEART_SCALE_NORMAL: 1,

    // Circle scales
    CIRCLE_SCALE_PULSE: 1.2,
    CIRCLE_SCALE_BOUNCE: 0.8,
    CIRCLE_SCALE_NORMAL: 1,

    // Shadow values
    SHADOW_OPACITY_ACTIVE: 0.18,
    SHADOW_RADIUS_ACTIVE: 4,
    SHADOW_ELEVATION_ACTIVE: 4,

    // Chip values
    CHIP_TRANSLATE_X: -60,
    CHIP_SCALE_HIDDEN: 0.3,
    CHIP_SCALE_OVERSHOOT: 1.1,
    CHIP_SCALE_NORMAL: 1,
  } as const;

  // STYLE CONSTANTS
  export const IMAGE_SIZES = {
    HEART: { width: 18, height: 18 },
    STAR_CHIP: { width: 18, height: 18 },
    STAR_BUTTON: { width: 13, height: 13 },
  } as const;

  export const CHIP_CONFIG = {
    HEIGHT: 60,
    WIDTH: 60,
    BORDER_RADIUS: 40,
    BACKGROUND_COLOR: '#d8fbde',
    GAP: 2,
  } as const;

  // ASSET CONSTANTS
  export const ASSETS = {
    HEART_EMPTY: require('../../assets/HeartEmpty.png'),
    HEART_FILLED: require('../../assets/HeartFilled.png'),
    STAR_EMPTY: require('../../assets/starEmpty.png'),
    STAR_FILLED: require('../../assets/star.png'),
    STAR_BUTTON: require('../../assets/starFilled.png'),
  } as const;
