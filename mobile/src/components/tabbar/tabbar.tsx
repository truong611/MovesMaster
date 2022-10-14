// @ts-ignore
import * as shape from 'd3-shape';
import * as React from 'react';
import {SafeAreaView, StyleSheet, Dimensions, View, Animated} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {StaticTabbar} from '..';
import {observer} from 'mobx-react-lite';
import {color} from '../../theme';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const width = Dimensions.get('window').width;
const height = 40;
const tabs = [
  {
    name: 'heart-outline',
  },
  {
    name: 'grid-outline',
  },
  {
    name: 'newspaper-outline',
  },
];
const tabWidth = width / tabs.length;
const backgroundColor = color.tabbar;

const getPath = (): string => {
  // @ts-ignore
  const left = shape.line().x(d => d.x).y(d => d.y)([
    {x: 0, y: 0},
    {x: width, y: 0},
  ]);
  let x1 = 0;
  let x2 = 25;
  let x3 = 45;
  let y1 = 0;
  let y2 = 0;
  let y3 = 35;
  // @ts-ignore
  const tab = shape.line().x(d => d.x).y(d => d.y).curve(shape.curveBasis)([
    {x: width, y: 0},
    {x: width + x1, y: y1},
    {x: width + x2, y: y2},
    {x: width + x3, y: y3},
    {x: width + tabWidth - x3, y: y3},
    {x: width + tabWidth - x2, y: y2},
    {x: width + tabWidth - x1, y: y1},
    {x: width + tabWidth, y: 0},
  ]);
  // @ts-ignore
  const right = shape.line().x(d => d.x).y(d => d.y)([
    {x: width + tabWidth, y: 0},
    {x: width * 2, y: 0},
    {x: width * 2, y: height},
    {x: 0, y: height},
    {x: 0, y: 0},
  ]);
  return `${left} ${tab} ${right}`;
};
const d = getPath();

export interface TabbarProps {
}

export const Tabbar = observer(function Tabbar(props: TabbarProps) {
  const {} = props;

  const value = new Animated.Value(0);

  const translateX = value.interpolate({
    inputRange: [0, width],
    outputRange: [-width, 0],
  });

  return (
    <>
      <View {...{height, width}}>
        <AnimatedSvg width={width * 2} height={40} style={{transform: [{translateX}]}}>
          <Path fill={backgroundColor} {...{d}} />
        </AnimatedSvg>
        <View style={StyleSheet.absoluteFill}>
          <StaticTabbar {...{tabs, value}} />
        </View>
      </View>
      <SafeAreaView style={styles.container}/>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor,
  },
});
