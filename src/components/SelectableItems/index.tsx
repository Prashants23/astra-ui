import React, { forwardRef, useImperativeHandle, useMemo, useState, useCallback, memo } from 'react';
import { View, StyleSheet, Platform, Text, Image, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BLACK, CARD_BG, RING, CIRCLE } from '../../utils/constance.utils';
import { useHeartAnimations, useChipAnimations, useStarAnimations } from '../../hooks/hooks';
import { ANIMATION_CONFIG, IMAGE_SIZES, CHIP_CONFIG, ASSETS } from '../../utils/constance.utils';

interface SelectableItemProps {
  showChip?: boolean;
  chipText?: string;
  onChipPress?: (isSelected: boolean) => void;
}

interface SelectableItemRef {
  deselectAll: () => void;
  onChipPress: (isSelected: boolean) => void;
}

const SelectableItemComponent = forwardRef<SelectableItemRef, SelectableItemProps>(
  ({ showChip = false, chipText = 'Clients', onChipPress }, ref) => {
    /** Local state for chip visibility and selection */
    const [chipVisible, setChipVisible] = useState(false);
    const [isChipSelected, setIsChipSelected] = useState(false);

    /** Custom hooks for animation logic */
    const {
      heartSelected,
      heartScale,
      circleScale,
      circleShadowOpacity,
      circleShadowRadius,
      circleElevation,
      heartBounce,
    } = useHeartAnimations();

    const {
      chipTranslateX,
      chipTranslateY,
      chipOpacity,
      chipScale,
      animateChipIn,
      hideChip,
    } = useChipAnimations();

    const { starSelected, toggleStar } = useStarAnimations();

    const handleChipShow = useCallback(() => setChipVisible(true), []);
    const handleChipHide = useCallback(() => {
      setChipVisible(false);
      setIsChipSelected(false);
    }, []);

    /** Master reset function - deselects everything and triggers appropriate animations */
    const deselectAll = useCallback(() => {
      heartSelected.value = false;
      starSelected.value = false;
      setIsChipSelected(false); // Reset chip visual state

      if (chipVisible) {
        // Bounce while hiding chip for feedback
        heartBounce();
        hideChip(handleChipHide);
      } else {
        // Just bounce if no chip to hide
        heartBounce();
      }
    }, [chipVisible, heartSelected, starSelected, heartBounce, hideChip, handleChipHide]);

    /** Single tap: Activate heart and show chip */
    const onSingleTap = useCallback(() => {
      if (!heartSelected.value) {
        animateChipIn(handleChipShow);
        heartSelected.value = true;
        heartBounce();
      }
    }, [heartSelected, animateChipIn, handleChipShow, heartBounce]);

    /** Double tap: Deselect everything */
    const onDoubleTap = useCallback(() => {
      deselectAll();
      hideChip(handleChipHide);
      onChipPress?.(false);
    }, [deselectAll, hideChip, handleChipHide, onChipPress]);

    /** Right side tap: Quick way to dismiss chip */
    const onRightSideTap = useCallback(() => {
      if (chipVisible) {
        hideChip(handleChipHide);
        heartBounce(); // feedback
      }
    }, [chipVisible, hideChip, handleChipHide, heartBounce]);

    /** Chip toggle handler */
    const onChipToggle = useCallback(() => {
      setIsChipSelected(!isChipSelected);
      onChipPress?.(true);
    }, [isChipSelected, onChipPress]);


    /** Optimized gesture handlers with proper dependencies */
    const singleTap = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(1)
          .maxDuration(ANIMATION_CONFIG.TAP_MAX_DURATION)
          .onEnd((_e, ok) => ok && runOnJS(onSingleTap)()),
      [onSingleTap]
    );

    const doubleTap = useMemo(
      () =>
        Gesture.Tap()
          .numberOfTaps(2)
          .maxDelay(ANIMATION_CONFIG.DOUBLE_TAP_MAX_DELAY)
          .onEnd((_e, ok) => ok && runOnJS(onDoubleTap)()),
      [onDoubleTap]
    );

    /** Star tap gesture */
    const starTap = useMemo(
      () =>
        Gesture.Tap().onEnd((_e, ok) => {
          if (!ok) {return;}
          runOnJS(toggleStar)();
        }),
      [toggleStar]
    );


  /** Heart animation styles */
  const aHeart = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
    ],
  }));

  /** Heart selection overlay styles */
  const aHeartSelection = useAnimatedStyle(() => ({
    opacity: heartSelected.value ? 1 : 0,
    transform: [{ scale: heartSelected.value ? 1 : 0.9 }],
  }));

  /** Circle container styles with dynamic border and shadow */
  const aCircle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    borderWidth: heartSelected.value ? 2 : 1,
    ...(Platform.OS === 'android'
      ? { elevation: circleElevation.value }
      : {
          shadowColor: '#000',
          shadowOpacity: circleShadowOpacity.value,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: circleShadowRadius.value,
        }),
  }));

  /** Chip animation styles */
  const aChip = useAnimatedStyle(() => ({
    opacity: chipOpacity.value,
    transform: [
      { translateX: chipTranslateX.value },
      { translateY: chipTranslateY.value },
      { scale: chipScale.value },
    ],
  }));


    /** Expose methods to parent component with proper dependencies */
    useImperativeHandle(
      ref,
      () => ({
        deselectAll,
        onChipPress: onChipPress || (() => {}),
      }),
      [deselectAll, onChipPress]
    );

    return (
      <View style={styles.row}>
        {/* Animated chip with star toggle */}
        {chipVisible && (
          <Animated.View style={[styles.chip, aChip]}>
            <TouchableOpacity onPress={onChipToggle}>
              <Image
                source={isChipSelected ? ASSETS.STAR_BUTTON : ASSETS.STAR_EMPTY}
                style={styles.chipStarImage}
              />
            </TouchableOpacity>
            <Text style={styles.chipText}>{chipText}</Text>
          </Animated.View>
        )}

        {/* Main circle container */}
        <Animated.View style={[styles.circle, aCircle]}>
          <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
            <Animated.View style={aHeart}>
              
              <Image
                source={ASSETS.HEART_EMPTY}
                style={styles.heartImage}
              />
              {/* Filled heart overlay (shows when selected) */}
              <Animated.View style={[styles.heartOverlay, aHeartSelection]}>
                <Image
                  source={ASSETS.HEART_FILLED}
                  style={styles.heartImage}
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {/* Star button (bottom-right corner when heart is selected) */}
          {showChip && !chipVisible && (
            <GestureDetector gesture={starTap}>
              <Animated.View style={styles.starBtn}>
                <Image
                  source={ASSETS.STAR_BUTTON}
                  style={styles.starButtonImage}
                />
              </Animated.View>
            </GestureDetector>
          )}

          {/* Right-side touch area for dismissing chip */}
          {chipVisible && (
            <TouchableOpacity onPressOut={onRightSideTap}>
              <View style={styles.rightSideTouchArea} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    );
  }
);

// Memoize the component for performance
export const SelectableItem = memo(SelectableItemComponent);

const styles = StyleSheet.create({

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      backgroundColor: CARD_BG,
      borderColor: RING,
      alignItems: 'center',
      justifyContent: 'center',
    },


    starBtn: {
      position: 'absolute',
      width: 15,
      height: 15,
      bottom: -2,
      right: -4,
      borderColor: '#EDEDED',
      alignItems: 'center',
      justifyContent: 'center',
    },

    chip: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      gap: CHIP_CONFIG.GAP,
      height: CHIP_CONFIG.HEIGHT,
      width: CHIP_CONFIG.WIDTH,
      borderRadius: CHIP_CONFIG.BORDER_RADIUS,
      backgroundColor: CHIP_CONFIG.BACKGROUND_COLOR,

      ...(Platform.OS === 'android'
        ? { elevation: 8 }
        : {
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          }),
    },

    heartImage: IMAGE_SIZES.HEART,
    chipStarImage: IMAGE_SIZES.STAR_CHIP,
    starButtonImage: IMAGE_SIZES.STAR_BUTTON,

  
    heartOverlay: {
      position: 'absolute',
    },

    chipText: {
      color: BLACK,
      fontWeight: '600',
      fontSize: 11,
    },

    rightSideTouchArea: {
      position: 'absolute',
      top: -CIRCLE / 2,
      right: -220,
      width: 200,
      height: CIRCLE * 1.5,
      backgroundColor: 'white',
    },


  });
