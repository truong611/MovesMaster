import React, {useEffect, useState} from 'react';
import 'react-native-gesture-handler';
import codePush from 'react-native-code-push';
import {AppNavigator} from './src/navigators';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import CenterSpinner from './src/components/center-spinner/center-spinner';
import {color} from './src/theme';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {RootStore, RootStoreProvider, setupRootStore} from './src/models';
import {initFonts} from './src/theme/fonts';
import {Text} from './src/components';
import * as eva from "@eva-design/eva"
import {ApplicationProvider, IconRegistry} from "@ui-kitten/components"
import {default as mapping} from "./mapping.json" // <-- import mapping
import {EvaIconsPack} from '@ui-kitten/eva-icons';

let codePushOptions = {
    checkFrequency: codePush.CheckFrequency.MANUAL,
    // checkFrequency: codePush.CheckFrequency.ON_APP_START,
    // installMode: codePush.InstallMode.IMMEDIATE,
};

export const toastConfig = {
    success: (props) => (
        <BaseToast
            style={{borderLeftColor: color.green}}
            {...props}
            text1NumberOfLines={3}
            text2NumberOfLines={3}
        />
    ),
    error: (props) => (
        <ErrorToast
            style={{borderLeftColor: color.danger}}
            {...props}
            text1NumberOfLines={3}
            text2NumberOfLines={3}
        />
    ),
    // custom
    tomatoToast: ({text1, props}) => (
        <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
            <Text>{text1}</Text>
            <Text>{props.uuid}</Text>
        </View>
    )
};

function App() {
    const [isLoadingComplete, setLoadingComplete] = useState<any>(true);
    const [isCodePushSync, setCodePushSync] = useState<any>(false);
    const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined);

    // Kick off initial async loading actions, like loading fonts and RootStore
    useEffect(() => {
        ;(async () => {
            await initFonts();
            setupRootStore().then(setRootStore);
            await codePush.sync({
                installMode: codePush.InstallMode.IMMEDIATE
            });
            setCodePushSync(true)
        })();
    }, []);

    // if (!rootStore) return null;

    if (!rootStore || !isLoadingComplete || !isCodePushSync) {
    // if (!rootStore || !isLoadingComplete) {
        return (
            <View style={{flex: 1, backgroundColor: color.primary}}>
                <CenterSpinner/>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default"/>}
                <RootStoreProvider value={rootStore}>
                    <IconRegistry icons={EvaIconsPack}/>
                    <ApplicationProvider {...eva} theme={eva.light} customMapping={mapping}>
                        <AppNavigator/>
                    </ApplicationProvider>
                </RootStoreProvider>
                <Toast config={toastConfig}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.tabbar,
    },
});

export default codePush(codePushOptions)(App);
