import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text, Image, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BLACK, CARD_BG, RING, CIRCLE } from '../utils/constance.utils';


export const SelectableItem = forwardRef<
  { deselectAll: () => void; onChipPress: (isSelected: boolean) => void }, 
  { showChip?: boolean; chipText?: string; onChipPress?: (isSelected: boolean) => void }
>(({ showChip = false, chipText = 'Clients', onChipPress }, ref) => {
  
  /** Local state for chip visibility and selection */
  const [chipVisible, setChipVisible] = useState(false);
  const [isChipSelected, setIsChipSelected] = useState(false);


  /** Selection states */
  const heartSelected = useSharedValue(false);
  const starSelected = useSharedValue(false);
  const starContainerVisible = useSharedValue(false);

  /** Heart & Circle animation values */
  const heartScale = useSharedValue(1);
  const heartRotation = useSharedValue(0);
  const circleScale = useSharedValue(1);
  const circleShadowOpacity = useSharedValue(0);
  const circleShadowRadius = useSharedValue(0);
  const circleElevation = useSharedValue(0);

  /** Chip animation values */
  const chipTranslateX = useSharedValue(0);
  const chipTranslateY = useSharedValue(0);
  const chipOpacity = useSharedValue(0);
  const chipScale = useSharedValue(0.3);

  /** Star animation values */
  const starContainerScale = useSharedValue(0.0001);
  const starScale = useSharedValue(1);
  const starRotation = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  const starElev = useSharedValue(3);
  const starShadow = useSharedValue(0.18);

  
  /**
   * Heart bounce animation with satisfying overshoot
   * Creates a "juicy" feel with scale bounce and circle pulse + shadow
   */
  const heartBounce = () => {
    // Heart scale: compress then overshoot then settle
    heartScale.value = withTiming(0.85, { duration: 100 }, () => {
      heartScale.value = withSpring(1.15, { mass: 0.4, damping: 10, stiffness: 200 }, () => {
        heartScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
    });
    
    // Circle pulse effect with shadow for depth
    circleScale.value = withTiming(1.2, { duration: 110 }, () => {
      circleScale.value = withSpring(0.8, { mass: 0.4, damping: 10, stiffness: 200 }, () => {
        circleScale.value = withSpring(1, { damping: 15, stiffness: 300 }, () => {
          // Clean up shadow when animation completes
          circleShadowOpacity.value = withTiming(0, { duration: 200 });
          circleShadowRadius.value = withTiming(0, { duration: 200 });
          circleElevation.value = withTiming(0, { duration: 200 });
        });
      });
    });
    
    // Add dramatic shadow during bounce
    circleShadowOpacity.value = withTiming(0.18, { duration: 110 });
    circleShadowRadius.value = withTiming(4, { duration: 110 });
    circleElevation.value = withTiming(4, { duration: 110 });
  };
  
  /**
   * Star container animations - show/hide with bounce
   */
  const showStarContainer = () => {
    starContainerVisible.value = true;
    starContainerScale.value = withSpring(1.2, { mass: 0.3, damping: 8, stiffness: 200 }, () => {
      starContainerScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    starOpacity.value = withTiming(1, { duration: 200 });
  };
  
  const hideStarContainer = () => {
    starContainerScale.value = withTiming(0.8, { duration: 150 }, () => {
      starContainerScale.value = withTiming(0.0001, { duration: 100 });
    });
    starOpacity.value = withTiming(0, { duration: 150 }, () => {
      starContainerVisible.value = false;
    });
  };

  /**
   * Star selection bounce with rotation and shadow effects
   */
  const starBounce = () => {
    // Satisfying scale bounce
    starScale.value = withTiming(0.8, { duration: 80 }, () => {
      starScale.value = withSpring(1.25, { mass: 0.3, damping: 8, stiffness: 250 }, () => {
        starScale.value = withSpring(1, { damping: 12, stiffness: 300 });
      });
    });
    
    // Playful rotation based on selection state
    starRotation.value = withSpring(starSelected.value ? 360 : -180, { damping: 15, stiffness: 200 }, () => {
      starRotation.value = withSpring(0, { damping: 20, stiffness: 400 });
    });
    
    // Enhanced depth with shadow
    starElev.value = withTiming(12, { duration: 150 }, () => {
      starElev.value = withTiming(3, { duration: 200 });
    });
    starShadow.value = withTiming(0.45, { duration: 150 }, () => {
      starShadow.value = withTiming(0.18, { duration: 200 });
    });
  };

  /**
   * Chip animations - smooth entrance from left with bounce
   */
  const animateChipIn = () => {
    setChipVisible(true);
    
    // Slide in from left with spring physics
    chipTranslateX.value = withSpring(-60, { mass: 0.3, damping: 8, stiffness: 200 });
    chipTranslateY.value = withSpring(0, { mass: 0.3, damping: 8, stiffness: 200 });
    
    // Fade in with satisfying bounce
    chipOpacity.value = withTiming(1, { duration: 400 });
    chipScale.value = withSpring(1.1, { mass: 0.25, damping: 6, stiffness: 250 }, () => {
      chipScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
  };

  /**
   * Fast chip hide animation - optimized for performance
   */
  const hideChip = () => {
    // Simple parallel animations for speed
    chipTranslateX.value = withTiming(0, { duration: 200 });
    chipTranslateY.value = withTiming(0, { duration: 200 });
    chipOpacity.value = withTiming(0, { duration: 200 });
    chipScale.value = withTiming(0.3, { duration: 200 }, () => {
      // Clean up state when animation completes
      runOnJS(setChipVisible)(false);
      runOnJS(setIsChipSelected)(false);
    });
  };

  
  /**
   * Master reset function - deselects everything and triggers appropriate animations
   */
  const deselectAll = () => {
    heartSelected.value = false;
    starSelected.value = false;
    setIsChipSelected(false); // Reset chip visual state
    
    if (starContainerVisible.value) {
      hideStarContainer();
    }
    
    if (chipVisible) {
      // Bounce while hiding chip for satisfying feedback
      heartBounce();
      hideChip();
    } else {
      // Just bounce if no chip to hide
      heartBounce();
    }
  };

  /** Single tap: Activate heart and show chip */
  const onSingleTap = () => {
    if (!heartSelected.value) {
      animateChipIn();
      heartSelected.value = true;
      heartBounce();
      showStarContainer();
    }
  };
  
  /** Double tap: Deselect everything */
  const onDoubleTap = () => {
    deselectAll();
    hideChip();
    onChipPress && onChipPress(false);
  };

  /** Right side tap: Quick way to dismiss chip */
  const onRightSideTap = () => {
    if (chipVisible) {
      hideChip();
      heartBounce(); // Satisfying feedback
    }
  };

  
  /** Main heart tap gestures (double tap beats single tap) */
  const singleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(240)
        .onEnd((_e, ok) => ok && runOnJS(onSingleTap)()),
    []
  );
  
  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(240)
        .onEnd((_e, ok) => ok && runOnJS(onDoubleTap)()),
    []
  );
  
  /** Star tap gesture */
  const starTap = useMemo(
    () =>
      Gesture.Tap().onEnd((_e, ok) => {
        if (!ok) return;
        starSelected.value = !starSelected.value;
        runOnJS(starBounce)();
      }),
    []
  );

  // ==================== ANIMATED STYLES ====================
  
  /** Heart animation styles */
  const aHeart = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartRotation.value}deg` },
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


  /** Expose methods to parent component  is not being used for deleselecting all at onec*/
  useImperativeHandle(ref, () => ({ 
    deselectAll,
    onChipPress: onChipPress || (() => {})
  }), []);

  return (
    <View style={styles.row}>
      {/* Animated chip with star toggle */}
      {chipVisible && (
        <Animated.View style={[styles.chip, aChip]}>
          <TouchableOpacity onPress={() => {
            setIsChipSelected(!isChipSelected); 
            onChipPress && onChipPress(true);
          }}>
            {!isChipSelected ? (
              <Image
                source={require('../../assets/starEmpty.png')}
                style={{ width: 18, height: 18 }}
              />
            ) : (
              <Image
                source={require('../../assets/star.png')}
                style={{ width: 18, height: 18 }}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.chipText}>{chipText}</Text>
        </Animated.View>
      )}

      {/* Main circle container */}
      <Animated.View style={[styles.circle, aCircle]}>
        {/* Heart with gesture detection */}
        <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
          <Animated.View style={aHeart}>
            {/* Base heart (always visible) */}
            <Image
              source={require('../../assets/HeartEmpty.png')}
              style={{ width: 18, height: 18 }}
            />
            {/* Filled heart overlay (shows when selected) */}
            <Animated.View style={[{ position: 'absolute' }, aHeartSelection]}>
              <Image
                source={require('../../assets/HeartFilled.png')}
                style={{ width: 18, height: 18 }}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Star button (bottom-right corner when heart is selected) */}
        {showChip && !chipVisible && (
          <GestureDetector gesture={starTap}>
            <Animated.View style={styles.starBtn}>
              {/* <View style={{
                ...(Platform.OS === 'android'
                  ? { elevation: 6 }
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.4,
                      shadowRadius: 4,
                    }),
              }}> */}
                <Image
                  source={require('../../assets/starFilled.png')}
                  style={{ width: 13, height: 13 }}
                />
              {/* </View> */}
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
});




// ==================== STYLES ====================
const styles = StyleSheet.create({
    /** Main app container */
    screen: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    /** Vertical column layout for items */
    col: {
      width: '100%',
      alignItems: 'center',
      gap: 40, // Generous spacing between items
    },
    
    /** Horizontal row for chip + circle */
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    /** Main circular button */
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      backgroundColor: CARD_BG,
      borderColor: RING,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    /** Star button positioned in bottom-right of circle */
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
    
    /** Animated chip that slides in from left */
    chip: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
      height: 60,
      width: 60,
      borderRadius: 40,
      // borderWidth: 2,
      backgroundColor: '#d8fbde', // Light green background
      // borderColor: GREEN_FILL,
      // Platform-specific shadow
      ...(Platform.OS === 'android'
        ? { elevation: 8 }
        : {
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          }),
    },
    
    /** Chip text styling */
    chipText: {
      color: BLACK,
      fontWeight: '600',
      fontSize: 11,
    },
    
    /** Invisible touch area on right side of circle */
    rightSideTouchArea: {
      position: 'absolute',
      top: -CIRCLE/2,
      right: -220,
      width: 200,
      height: CIRCLE*1.5,
      backgroundColor: 'white', // Uncomment to visualize
    },
    
  
  });