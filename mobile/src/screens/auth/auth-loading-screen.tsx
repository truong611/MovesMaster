import React from 'react';
import {
  View,
} from 'react-native';
import {setLogout} from '../../services/authActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {color} from '../../theme';
import {useStores} from '../../models';
import CenterSpinner from "../../components/center-spinner/center-spinner";

// @ts-ignore
const AuthLoadingScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {movesModel} = useStores();

  // auth init function
  const _bootstrapAsync = async () => {
    // Fetch token from storage
    const session = await movesModel.getUserInfo();
    // If session exists, validate it, else redirect to login screen
    if (session) {
      const sessionObj = session;
      const currentTime = Math.floor(new Date().getTime() / 1000);
      if (currentTime < sessionObj.exp) {
        setLogout(() => navigation.navigate('LoginScreen'));
        navigation.navigate('primaryStack');
      } else {
        navigation.navigate('LoginScreen');
      }
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  React.useEffect(() => {
    isFocused && _bootstrapAsync();
  }, [isFocused]);

  return (
    <View style={{flex: 1, backgroundColor: color.primary}}>
      {/*<CenterSpinner/>*/}
    </View>
  );
};

export default AuthLoadingScreen;
