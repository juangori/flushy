import React from 'react';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';

interface BristolIconProps {
  size?: number;
  color?: string;
}

// Type 1: Separate hard lumps (like nuts)
export const BristolType1: React.FC<BristolIconProps> = ({ size = 32, color = '#A78BFA' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Circle cx="9" cy="10" r="4" fill={color} opacity={0.9} />
    <Circle cx="20" cy="8" r="3.5" fill={color} opacity={0.8} />
    <Circle cx="15" cy="18" r="4.2" fill={color} opacity={0.9} />
    <Circle cx="24" cy="17" r="3" fill={color} opacity={0.7} />
    <Circle cx="10" cy="25" r="3.8" fill={color} opacity={0.85} />
    <Circle cx="22" cy="25" r="3.5" fill={color} opacity={0.8} />
  </Svg>
);

// Type 2: Lumpy sausage shape
export const BristolType2: React.FC<BristolIconProps> = ({ size = 32, color = '#A78BFA' }) => (
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
);

// Type 3: Sausage with cracks on surface
export const BristolType3: React.FC<BristolIconProps> = ({ size = 32, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Rect x="4" y="10" rx="6" ry="6" width="24" height="12" fill={color} opacity={0.9} />
    <Path d="M8 13L10 15" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
    <Path d="M13 12L14.5 14.5" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
    <Path d="M18 13L19.5 15" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
    <Path d="M23 12L24 14" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
    <Path d="M10 18L11.5 20" stroke={color} strokeWidth="1" opacity={0.35} strokeLinecap="round" />
    <Path d="M20 17.5L21.5 19.5" stroke={color} strokeWidth="1" opacity={0.35} strokeLinecap="round" />
  </Svg>
);

// Type 4: Smooth soft snake (ideal)
export const BristolType4: React.FC<BristolIconProps> = ({ size = 32, color = '#4ADE80' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path
      d="M4 12C4 9 6.5 7 9 7C12 7 13 10 16 10C19 10 20 7 23 7C25.5 7 28 9 28 12C28 15 25.5 17 23 17C20 17 19 14 16 14C13 14 12 17 9 17C6.5 17 4 15 4 12Z"
      fill={color}
      opacity={0.9}
    />
    <Path
      d="M6 22C6 19.5 8 18 10.5 18C13 18 14 20.5 16 20.5C18 20.5 19 18 21.5 18C24 18 26 19.5 26 22C26 24.5 24 26 21.5 26C19 26 18 23.5 16 23.5C14 23.5 13 26 10.5 26C8 26 6 24.5 6 22Z"
      fill={color}
      opacity={0.75}
    />
  </Svg>
);

// Type 5: Soft blobs with clear edges
export const BristolType5: React.FC<BristolIconProps> = ({ size = 32, color = '#FBBF24' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path
      d="M7 12C7 9 9 7 12 7C14 7 15 9 15 12C15 9 17 7 20 7C23 7 25 9 25 12C25 15 23 17 20 17C17 17 15 15 15 12C15 15 14 17 12 17C9 17 7 15 7 12Z"
      fill={color}
      opacity={0.85}
    />
    <Circle cx="10" cy="23" r="4.5" fill={color} opacity={0.8} />
    <Circle cx="21" cy="22" r="5" fill={color} opacity={0.85} />
    <Circle cx="15.5" cy="25" r="3.5" fill={color} opacity={0.7} />
  </Svg>
);

// Type 6: Fluffy/mushy pieces with ragged edges
export const BristolType6: React.FC<BristolIconProps> = ({ size = 32, color = '#FBBF24' }) => (
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
);

// Type 7: Entirely liquid, watery
export const BristolType7: React.FC<BristolIconProps> = ({ size = 32, color = '#F87171' }) => (
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
    <Circle cx="10" cy="20" r="1.5" fill={color} opacity={0.5} />
    <Circle cx="16" cy="21.5" r="1" fill={color} opacity={0.45} />
    <Circle cx="22" cy="20.5" r="1.3" fill={color} opacity={0.5} />
  </Svg>
);

// Map to get icon by type number
const BRISTOL_ICON_MAP: Record<number, React.FC<BristolIconProps>> = {
  1: BristolType1,
  2: BristolType2,
  3: BristolType3,
  4: BristolType4,
  5: BristolType5,
  6: BristolType6,
  7: BristolType7,
};

interface BristolIconByTypeProps extends BristolIconProps {
  type: number;
}

export const BristolIcon: React.FC<BristolIconByTypeProps> = ({ type, size, color }) => {
  const IconComponent = BRISTOL_ICON_MAP[type];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} />;
};
