import React from 'react';
import {observer} from 'mobx-react-lite';
import {ViewStyle} from 'react-native';
import {Screen, Text} from '../../components';
import {useNavigation} from '@react-navigation/native';
// import { useStores } from "../../models"
import {color} from '../../theme';
import TodoScreen from './components/TodoScreen';

const ROOT: ViewStyle = {
  backgroundColor: color.primary,
  flex: 1,
};

export const DemoScreen = observer(function DemoScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation();
  return (
    <Screen style={ROOT} preset="fixed">
      <TodoScreen isPublic={true} navigate={navigation.navigate}/>
    </Screen>
  );
});
