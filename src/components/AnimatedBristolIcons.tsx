import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';

interface AnimatedBristolIconProps {
  size?: number;
  color?: string;
}

// Type 1: Separate hard lumps - bouncing pebbles (staggered)
export const AnimatedBristolType1: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#A78BFA'
}) => {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -4,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 600,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const anim1 = createBounce(bounce1, 0);
    const anim2 = createBounce(bounce2, 200);
    const anim3 = createBounce(bounce3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: bounce1 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="9" cy="10" r="4" fill={color} opacity={0.9} />
          <Circle cx="20" cy="8" r="3.5" fill={color} opacity={0.8} />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: bounce2 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="15" cy="18" r="4.2" fill={color} opacity={0.9} />
          <Circle cx="24" cy="17" r="3" fill={color} opacity={0.7} />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: bounce3 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="10" cy="25" r="3.8" fill={color} opacity={0.85} />
          <Circle cx="22" cy="25" r="3.5" fill={color} opacity={0.8} />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Type 2: Lumpy sausage - heavy wobble
export const AnimatedBristolType2: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#A78BFA'
}) => {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rotate = wobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
          d="M6 16C6 12 8 9 12 9C14 9 14.5 10.5 16 10.5C17.5 10.5 18 9 20 9C24 9 26 12 26 16C26 20 24 23 20 23C18 23 17.5 21.5 16 21.5C14.5 21.5 14 23 12 23C8 23 6 20 6 16Z"
          fill={color}
          opacity={0.9}
        />
        <Circle cx="10.5" cy="14" r="1.8" fill={color} opacity={0.5} />
        <Circle cx="16" cy="13.5" r="2" fill={color} opacity={0.5} />
        <Circle cx="21.5" cy="14" r="1.8" fill={color} opacity={0.5} />
        <Circle cx="13" cy="18.5" r="1.5" fill={color} opacity={0.5} />
        <Circle cx="19" cy="18.5" r="1.5" fill={color} opacity={0.5} />
      </Svg>
    </Animated.View>
  );
};

// Type 3: Sausage with cracks - drop with bounce
export const AnimatedBristolType3: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#4ADE80'
}) => {
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(drop, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drop, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = drop.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 3, 0],
  });

  const scaleY = drop.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1],
  });

  const scaleX = drop.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scaleY }, { scaleX }] }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="4" y="10" rx="6" ry="6" width="24" height="12" fill={color} opacity={0.9} />
        {/* More visible cracks - darker lines with better contrast */}
        <Path d="M7 12L9.5 16" stroke="#000" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
        <Path d="M12 11L14 15.5" stroke="#000" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
        <Path d="M17 12L19.5 16" stroke="#000" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
        <Path d="M22 11L24.5 15" stroke="#000" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
        <Path d="M9 17L11 20" stroke="#000" strokeWidth="1.2" opacity={0.2} strokeLinecap="round" />
        <Path d="M19 16.5L21.5 20" stroke="#000" strokeWidth="1.2" opacity={0.2} strokeLinecap="round" />
        {/* Highlight effect to make cracks pop */}
        <Path d="M8 12.5L10 16" stroke="#FFF" strokeWidth="0.8" opacity={0.15} strokeLinecap="round" />
        <Path d="M18 12.5L20 16" stroke="#FFF" strokeWidth="0.8" opacity={0.15} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
};

// Type 4: Smooth snake - elegant wave/slither motion
export const AnimatedBristolType4: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#4ADE80'
}) => {
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 2800,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateX1 = wave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-3, 3, -3],
  });

  const translateX2 = wave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [3, -3, 3],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ position: 'absolute', transform: [{ translateX: translateX1 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M4 12C4 9 6.5 7 9 7C12 7 13 10 16 10C19 10 20 7 23 7C25.5 7 28 9 28 12C28 15 25.5 17 23 17C20 17 19 14 16 14C13 14 12 17 9 17C6.5 17 4 15 4 12Z"
            fill={color}
            opacity={0.9}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ translateX: translateX2 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M6 22C6 19.5 8 18 10.5 18C13 18 14 20.5 16 20.5C18 20.5 19 18 21.5 18C24 18 26 19.5 26 22C26 24.5 24 26 21.5 26C19 26 18 23.5 16 23.5C14 23.5 13 26 10.5 26C8 26 6 24.5 6 22Z"
            fill={color}
            opacity={0.75}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Type 5: Soft blobs - floating motion
export const AnimatedBristolType5: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#FBBF24'
}) => {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(float2, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, []);

  const translateY1 = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const translateY2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const scale1 = float1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: translateY1 }, { scale: scale1 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M7 12C7 9 9 7 12 7C14 7 15 9 15 12C15 9 17 7 20 7C23 7 25 9 25 12C25 15 23 17 20 17C17 17 15 15 15 12C15 15 14 17 12 17C9 17 7 15 7 12Z"
            fill={color}
            opacity={0.85}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: translateY2 }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="10" cy="23" r="4.5" fill={color} opacity={0.8} />
          <Circle cx="21" cy="22" r="5" fill={color} opacity={0.85} />
          <Circle cx="15.5" cy="25" r="3.5" fill={color} opacity={0.7} />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Type 6: Mushy - jelly wobble effect
export const AnimatedBristolType6: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#FBBF24'
}) => {
  const jelly = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(jelly, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(jelly, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const scaleX = jelly.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  const scaleY = jelly.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1],
  });

  return (
    <Animated.View style={{ transform: [{ scaleX }, { scaleY }] }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
          d="M5 14C5 10 7 8 10 9C12 10 11 12 14 11C16 10 17 8 20 9C23 10 22 13 25 12C27 11 28 13 27 16C26 19 24 18 22 20C20 22 21 24 18 25C15 26 15 23 12 24C9 25 10 22 7 21C4 20 5 17 5 14Z"
          fill={color}
          opacity={0.8}
        />
        <Circle cx="11" cy="15" r="2" fill={color} opacity={0.4} />
        <Circle cx="18" cy="14" r="1.5" fill={color} opacity={0.35} />
        <Circle cx="15" cy="19" r="1.8" fill={color} opacity={0.4} />
        <Circle cx="21" cy="19" r="1.2" fill={color} opacity={0.35} />
      </Svg>
    </Animated.View>
  );
};

// Type 7: Liquid - flowing wave ripples
export const AnimatedBristolType7: React.FC<AnimatedBristolIconProps> = ({
  size = 32,
  color = '#F87171'
}) => {
  const ripple = useRef(new Animated.Value(0)).current;
  const droplets = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rippleAnim = Animated.loop(
      Animated.timing(ripple, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );

    const dropletsAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(droplets, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(droplets, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    rippleAnim.start();
    dropletsAnim.start();

    return () => {
      rippleAnim.stop();
      dropletsAnim.stop();
    };
  }, []);

  const scaleX = ripple.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1.05, 0.95],
  });

  const translateX = ripple.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-2, 2, -2],
  });

  const translateY = droplets.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const opacity = droplets.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ position: 'absolute', transform: [{ scaleX }, { translateX }] }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path
            d="M4 15C4 11 8 8 16 8C24 8 28 11 28 15C28 19 24 24 16 24C8 24 4 19 4 15Z"
            fill={color}
            opacity={0.6}
          />
          <Path
            d="M8 16C8 14 10 12 14 12C18 12 19 14 19 16C19 18 17 19 14 19C10 19 8 18 8 16Z"
            fill={color}
            opacity={0.35}
          />
          <Path
            d="M18 14C18 13 20 12 22 12C24 12 25 13 25 14C25 15 24 16 22 16C20 16 18 15 18 14Z"
            fill={color}
            opacity={0.3}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY }], opacity }}>
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx="10" cy="20" r="1.5" fill={color} opacity={0.5} />
          <Circle cx="16" cy="21.5" r="1" fill={color} opacity={0.45} />
          <Circle cx="22" cy="20.5" r="1.3" fill={color} opacity={0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Map to get animated icon by type number
const ANIMATED_BRISTOL_ICON_MAP: Record<number, React.FC<AnimatedBristolIconProps>> = {
  1: AnimatedBristolType1,
  2: AnimatedBristolType2,
  3: AnimatedBristolType3,
  4: AnimatedBristolType4,
  5: AnimatedBristolType5,
  6: AnimatedBristolType6,
  7: AnimatedBristolType7,
};

interface AnimatedBristolIconByTypeProps extends AnimatedBristolIconProps {
  type: number;
}

export const AnimatedBristolIcon: React.FC<AnimatedBristolIconByTypeProps> = ({
  type,
  size,
  color
}) => {
  const IconComponent = ANIMATED_BRISTOL_ICON_MAP[type];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
};
