import { type ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  CREST_INNER_PATH,
  CREST_PATH,
  CREST_VIEWBOX,
} from './crestPath';

type Props = {
  width: number;
  height: number;
  edgeColor: string;
  premium?: boolean;
  children: ReactNode;
};

/**
 * Crest FUT: MaskedView clipa o conteúdo na silhueta SVG.
 * Sem androidRenderingMode="software" (causava vazamento + serrilhado).
 */
export function CrestCardFrame({
  width,
  height,
  edgeColor,
  premium = false,
  children,
}: Props) {
  const strokeOuter = premium ? 3.5 : 2.5;
  const strokeInner = premium ? 1.5 : 0;
  const gradientId = useMemo(
    () => `crestEdge-${Math.round(width)}-${premium ? 1 : 0}`,
    [width, premium],
  );

  const viewBox = `0 0 ${CREST_VIEWBOX.width} ${CREST_VIEWBOX.height}`;

  return (
    <View
      style={[
        styles.wrap,
        {
          width,
          height,
          shadowColor: premium ? edgeColor : '#000',
          shadowOpacity: premium ? 0.5 : 0.25,
          shadowRadius: premium ? 14 : 8,
          shadowOffset: { width: 0, height: premium ? 6 : 4 },
          elevation: premium ? 12 : 6,
        },
      ]}
    >
      {premium ? (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: width * 0.78,
              height: height * 0.78,
              backgroundColor: edgeColor,
            },
          ]}
        />
      ) : null}

      <MaskedView
        style={{ width, height }}
        maskElement={
          <View
            style={{
              width,
              height,
              backgroundColor: 'transparent',
            }}
          >
            <Svg
              width={width}
              height={height}
              viewBox={viewBox}
              preserveAspectRatio="none"
            >
              <Path d={CREST_PATH} fill="#FFFFFF" />
            </Svg>
          </View>
        }
      >
        <View style={[styles.clipped, { width, height }]}>{children}</View>
      </MaskedView>

      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width={width}
        height={height}
        viewBox={viewBox}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF8D6" stopOpacity="1" />
            <Stop offset="0.35" stopColor={edgeColor} stopOpacity="1" />
            <Stop offset="1" stopColor="#8B6914" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Path
          d={CREST_PATH}
          fill="none"
          stroke={premium ? `url(#${gradientId})` : edgeColor}
          strokeWidth={strokeOuter}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          strokeMiterlimit={10}
        />

        {premium ? (
          <Path
            d={CREST_INNER_PATH}
            fill="none"
            stroke={
              edgeColor === '#F5D0A9' || edgeColor === '#F9A8D4'
                ? '#DB2777'
                : 'rgba(255,255,255,0.45)'
            }
            strokeWidth={strokeInner}
            strokeLinejoin="miter"
            strokeLinecap="butt"
            strokeMiterlimit={10}
            opacity={0.9}
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  clipped: {
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 48,
    opacity: 0.2,
  },
});
