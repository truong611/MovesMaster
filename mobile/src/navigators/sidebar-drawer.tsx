// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {} from 'react';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {View, StyleSheet, TouchableOpacity, Image, Dimensions} from 'react-native';
import {Text} from '../components';
import {DrawerActions, useNavigation} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from '../services/authActions';
import {useStores} from '../models';
import {images} from '../images';
import {StatusBarHeight} from "../services";
import codePush from 'react-native-code-push';

const layout = Dimensions.get('window');

export function SidebarDrawer(props: any) {
    const navigation = useNavigation();
    const {movesModel} = useStores();

    // useEffect(() => {
    //   async function fetchData() {
    //   }
    //
    //   fetchData()
    // }, [])

    // useEffect(() => {
    //   fetchData()
    // }, [])
    // const fetchData = async () => {
    // }

    const toggleMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const logOut = async () => {
        await movesModel.logout();
        logout();
    };

    const goToPage = (page: any) => {
        navigation.navigate(page);
    };

    const changeTabIndex = async (key: number) => {
        goToPage('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: key,
        });
        navigation.dispatch(DrawerActions.closeDrawer());
    };

    return (
        <DrawerContentScrollView {...props} style={{backgroundColor: '#F0268A',}}>
            <View style={{flex: 1, height: layout.height - StatusBarHeight}}>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={styles.cancel} onPress={() => toggleMenu()}>
                            <Ionicons name='close-outline' color="white" size={36}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.item} onPress={() => changeTabIndex(1)}>
                            <Ionicons name='grid-outline' color="white" size={24}/>
                            <Text style={styles.item_text}>DASHBOARD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item} onPress={() => goToPage('ViewActivityScreen')}>
                            <Image style={{width: 32, left: -4}} resizeMode={'contain'} source={images.logo_2}/>
                            <Text style={[styles.item_text, {marginLeft: 8}]}>YOUR MOVES</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item} onPress={() => changeTabIndex(0)}>
                            <Ionicons name='heart-outline' color="white" size={24}/>
                            <Text style={styles.item_text}>DONATIONS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item} onPress={() => changeTabIndex(2)}>
                            <Ionicons name='newspaper-outline' color="white" size={24}/>
                            <Text style={styles.item_text}>LATEST NEWS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item}
                                          onPress={() => navigation.navigate('MainScreen', {screen: 'ProfileScreen'})}>
                            <Ionicons name='person-circle-outline' color="white" size={24}/>
                            <Text style={styles.item_text}>PROFILE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.item} onPress={() => logOut()}>
                            <Ionicons name='log-out-outline' color="white" size={24}/>
                            <Text style={styles.item_text}>LOG OUT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/*<View style={{position: 'absolute', bottom: 32, left: 0, right: 0, justifyContent: 'center', alignItems: 'center',}}>*/}
                {/*    <TouchableOpacity onPress={async () => {*/}
                {/*        await codePush.sync({*/}
                {/*            updateDialog: true,*/}
                {/*            installMode: codePush.InstallMode.IMMEDIATE*/}
                {/*        });*/}
                {/*    }}>*/}
                {/*        <Text style={styles.item_text}>v58</Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 32,
        marginTop: 46 + 32,
        // backgroundColor: 'green',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    item_text: {
        marginLeft: 16,
    },
    cancel: {
        // backgroundColor: 'yellow',
        paddingHorizontal: 16,
        paddingVertical: 16,

        position: 'absolute',
        // left: 26
    },
});
