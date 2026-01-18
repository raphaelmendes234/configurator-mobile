import React from 'react';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, FeBlend, FeDisplacementMap, FeFlood, FeMerge, FeMergeNode, FeTurbulence, Filter, G, Path } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const JoystickKnob = ({ size }: { size: number }) => {
  return (
    // On utilise les dimensions du viewBox original (151x149) pour garder les proportions
    <Svg width={size} height={size} viewBox="0 0 151 149" fill="none">
      <G filter="url(#filter0_g_1323_2588)">
        <Circle cx="75.1931" cy="74.4023" r="48" fill="#D9F203"/>
      </G>
      <Path d="M132.972 108.06L134.529 105.394C134.665 105.158 134.826 105.104 135.062 105.24L139.332 107.668C139.567 107.804 139.712 107.777 139.848 107.541L140.472 106.46C140.608 106.225 140.769 106.17 141.005 106.306L143.135 107.48C143.371 107.616 143.42 107.755 143.284 107.991L139.655 114.339C139.519 114.575 139.358 114.63 139.123 114.494L136.993 113.319C136.757 113.183 136.708 113.044 136.83 112.801L137.475 111.621C137.597 111.377 137.564 111.21 137.328 111.074L133.165 108.652C132.874 108.484 132.812 108.337 132.972 108.06Z" fill="#D9F203"/>
      {/* ... Copie ici tous tes autres <path> fournis ... */}
      <Path d="M142.927 87.5871L143.585 83.9501C143.632 83.6822 143.765 83.5756 144.033 83.6228L146.433 84.0136C146.701 84.0608 146.81 84.1776 146.763 84.4455L146.138 88.267C146.091 88.5349 145.958 88.6415 145.69 88.5942L143.29 88.2034C142.959 88.1451 142.858 87.9811 142.927 87.5871Z" fill="#D9F203"/>
      
      <Defs>
        <Filter id="filter0_g_1323_2588" x="23.1931" y="22.4023" width="104" height="104" filterUnits="userSpaceOnUse">
          <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
          <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <FeTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" seed="9701" />
          <FeDisplacementMap in="shape" scale="8" xChannelSelector="R" yChannelSelector="G" result="displacedImage" />
          <FeMerge>
            <FeMergeNode in="displacedImage"/>
          </FeMerge>
        </Filter>
      </Defs>
    </Svg>
  );
};