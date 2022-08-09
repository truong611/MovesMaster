// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, Easing} from 'react-native';
import {color} from '../../theme';
import {observer} from 'mobx-react-lite';
import {useEffect, useMemo} from 'react';
import {useStores} from '../../models';

const {width} = Dimensions.get('window');

interface Tab {
  name: string;
}

interface StaticTabbarProps {
  tabs: Tab[];
  value: Animated.Value;
}

export const StaticTabbar = observer(function StaticTabbar(props: StaticTabbarProps) {
  const {tabs, value} = props;
  const {movesModel} = useStores();

  let values: Animated.Value[] = [];

  values = tabs.map((tab, index) => new Animated.Value(index === movesModel?.appInfo?.tabIndex ? 1 : 0));

  useEffect(() => {
    onPress(movesModel?.appInfo?.tabIndex);
  }, [movesModel?.appInfo?.tabIndex]);

  const onPress = (index: any) => {
    const tabWidth = width / tabs.length;
    Animated.sequence([
      Animated.parallel(
        values.map(v => Animated.timing(v, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })),
      ),
      Animated.parallel([
        Animated.spring(value, {
          toValue: tabWidth * index,
          useNativeDriver: true,
        }),
        Animated.spring(values[index], {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const setTabIndex = async (index: number) => {
    await movesModel.setAppInfo({
      tabIndex: index,
    });
  };

  return (
    <View style={styles.container}>
      {
        tabs.map((tab, key) => {
          const tabWidth = (width / tabs.length);
          const cursor = tabWidth * key;
          const opacity = value.interpolate({
            inputRange: [cursor - tabWidth, cursor, cursor + tabWidth],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp',
          });
          const translateY = values[key].interpolate({
            inputRange: [0, 1],
            outputRange: [64, 0],
            extrapolate: 'clamp',
          });
          const opacity1 = values[key].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });
          return (
            <React.Fragment {...{key}}>
              <TouchableWithoutFeedback onPress={() => setTabIndex(key)}>
                <Animated.View style={[styles.tab, {opacity}]}>
                  <Ionicons name={tab.name} color="white" size={24}/>
                </Animated.View>
              </TouchableWithoutFeedback>
              <Animated.View
                style={{
                  position: 'absolute',
                  // top: -8,
                  top: -30,
                  left: tabWidth * key,
                  width: tabWidth,
                  height: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: opacity1,
                  transform: [{translateY}],
                }}
              >
                <View style={styles.activeIcon}>
                  <Ionicons name={tab.name} color="white" size={24}/>
                </View>
              </Animated.View>
            </React.Fragment>
          );
        })
      }
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
  },
  activeIcon: {
    backgroundColor: color.primary,
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.danger,
  },
});
