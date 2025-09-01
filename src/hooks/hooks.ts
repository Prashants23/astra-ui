import { useCallback } from 'react';
import { runOnJS, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ANIMATION_CONFIG, ANIMATION_VALUES } from '../utils/constance.utils';

// HEART ANIMATIONS HOOK
export const useHeartAnimations = () => {
  const heartSelected = useSharedValue(false);
  const heartScale = useSharedValue<number>(ANIMATION_VALUES.HEART_SCALE_NORMAL);

  const circleScale = useSharedValue<number>(ANIMATION_VALUES.CIRCLE_SCALE_NORMAL);
  const circleShadowOpacity = useSharedValue<number>(0);
  const circleShadowRadius = useSharedValue<number>(0);
  const circleElevation = useSharedValue<number>(0);

  const heartBounce = useCallback(() => {
    // Heart scale: compress then overshoot then settle
    heartScale.value = withTiming(
      ANIMATION_VALUES.HEART_SCALE_COMPRESS,
      { duration: ANIMATION_CONFIG.HEART_COMPRESS_DURATION },
      () => {
        heartScale.value = withSpring(
          ANIMATION_VALUES.HEART_SCALE_OVERSHOOT,
          ANIMATION_CONFIG.HEART_OVERSHOOT,
          () => {
            heartScale.value = withSpring(
              ANIMATION_VALUES.HEART_SCALE_NORMAL,
              ANIMATION_CONFIG.HEART_SETTLE
            );
          }
        );
      }
    );

    // Circle pulse effect with shadow for depth
    circleScale.value = withTiming(
      ANIMATION_VALUES.CIRCLE_SCALE_PULSE,
      { duration: ANIMATION_CONFIG.CIRCLE_PULSE_DURATION },
      () => {
        circleScale.value = withSpring(
          ANIMATION_VALUES.CIRCLE_SCALE_BOUNCE,
          ANIMATION_CONFIG.CIRCLE_BOUNCE,
          () => {
            circleScale.value = withSpring(
              ANIMATION_VALUES.CIRCLE_SCALE_NORMAL,
              ANIMATION_CONFIG.CIRCLE_SETTLE,
              () => {
                // Clean up shadow when animation completes
                circleShadowOpacity.value = withTiming(0, { duration: ANIMATION_CONFIG.SHADOW_CLEANUP_DURATION });
                circleShadowRadius.value = withTiming(0, { duration: ANIMATION_CONFIG.SHADOW_CLEANUP_DURATION });
                circleElevation.value = withTiming(0, { duration: ANIMATION_CONFIG.SHADOW_CLEANUP_DURATION });
              }
            );
          }
        );
      }
    );

    // Add dramatic shadow during bounce
    circleShadowOpacity.value = withTiming(ANIMATION_VALUES.SHADOW_OPACITY_ACTIVE, { duration: ANIMATION_CONFIG.CIRCLE_PULSE_DURATION });
    circleShadowRadius.value = withTiming(ANIMATION_VALUES.SHADOW_RADIUS_ACTIVE, { duration: ANIMATION_CONFIG.CIRCLE_PULSE_DURATION });
    circleElevation.value = withTiming(ANIMATION_VALUES.SHADOW_ELEVATION_ACTIVE, { duration: ANIMATION_CONFIG.CIRCLE_PULSE_DURATION });
  }, [heartScale, circleScale, circleShadowOpacity, circleShadowRadius, circleElevation]);

  return {
    heartSelected,
    heartScale,
    circleScale,
    circleShadowOpacity,
    circleShadowRadius,
    circleElevation,
    heartBounce,
  };
};

// CHIP ANIMATIONS HOOK
export const useChipAnimations = () => {
  const chipTranslateX = useSharedValue<number>(0);
  const chipTranslateY = useSharedValue<number>(0);
  const chipOpacity = useSharedValue<number>(0);
  const chipScale = useSharedValue(ANIMATION_VALUES.CHIP_SCALE_HIDDEN as number);

  const animateChipIn = useCallback((onShow?: () => void) => {
    if (onShow) {runOnJS(onShow)();}

    // Slide in from left with spring physics
    chipTranslateX.value = withSpring(ANIMATION_VALUES.CHIP_TRANSLATE_X, ANIMATION_CONFIG.CHIP_SLIDE_CONFIG);
    chipTranslateY.value = withSpring(0, ANIMATION_CONFIG.CHIP_SLIDE_CONFIG);

    // Fade in with bounce
    chipOpacity.value = withTiming(1, { duration: ANIMATION_CONFIG.CHIP_FADE_DURATION });
    chipScale.value = withSpring(
      ANIMATION_VALUES.CHIP_SCALE_OVERSHOOT as number,
      ANIMATION_CONFIG.CHIP_BOUNCE_CONFIG,
      () => {
        chipScale.value = withSpring(
          ANIMATION_VALUES.CHIP_SCALE_NORMAL as number,
          ANIMATION_CONFIG.CHIP_BOUNCE_SETTLE
        );
      }
    );
  }, [chipTranslateX, chipTranslateY, chipOpacity, chipScale]);

  const hideChip = useCallback((onHide?: () => void, onComplete?: () => void) => {
    // Simple parallel animations for speed
    chipTranslateX.value = withTiming(0, { duration: ANIMATION_CONFIG.CHIP_HIDE_DURATION });
    chipTranslateY.value = withTiming(0, { duration: ANIMATION_CONFIG.CHIP_HIDE_DURATION });
    chipOpacity.value = withTiming(0, { duration: ANIMATION_CONFIG.CHIP_HIDE_DURATION });
    chipScale.value = withTiming(
      ANIMATION_VALUES.CHIP_SCALE_HIDDEN,
      { duration: ANIMATION_CONFIG.CHIP_HIDE_DURATION },
      () => {
        // Clean up state when animation completes
        if (onHide) {runOnJS(onHide)();}
        if (onComplete) {runOnJS(onComplete)();}
      }
    );
  }, [chipTranslateX, chipTranslateY, chipOpacity, chipScale]);

  return {
    chipTranslateX,
    chipTranslateY,
    chipOpacity,
    chipScale,
    animateChipIn,
    hideChip,
  };
};

// STAR ANIMATIONS HOOK
export const useStarAnimations = () => {
  const starSelected = useSharedValue(false);

  const toggleStar = useCallback(() => {
    starSelected.value = !starSelected.value;
  }, [starSelected]);

  return {
    starSelected,
    toggleStar,
  };
};
