import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Alert, Dimensions, FlatList, Image, StyleSheet, View, ViewStyle} from 'react-native';
import {Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {useStores} from "../../models";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getProfile} from "./profile-service";
import { FETCH_getFitnessAppUsage } from '../fitness-apps/fitness-apps-service';
import {replaceHTTP, showToast} from "../../services";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const ProfileScreen = observer(function ProfileScreen() {
    const {movesModel} = useStores();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [listFitnessAppUsage, setListFitnessAppUsage] = useState([]);

    const {refetch} = useQuery(FETCH_getProfile);
    const query = useQuery(FETCH_getFitnessAppUsage)


    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            fectDataFitnessApp()
            try {
                let {data: {getProfile: {user, message, messageCode}}} = await refetch();  
                setLoading(false);
                if (messageCode == 200) {
                    await movesModel.setUserInfo({
                        forename: user?.Forename,
                        surname: user?.Surname,
                        email: user?.User_Email,
                        phone: user?.User_Phone_Number,
                        avatar: user?.User_Avatar,
                    })
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }

        }
    };

    const fectDataFitnessApp = async () => {
        setLoading(true);
        let {data: {getFitnessAppUsage: {FitnessApp, FitnessAppUsage, message, messageCode}}} = await query.refetch()
        setLoading(false);
        if (messageCode == 200) {
            setListFitnessAppUsage(FitnessAppUsage)  
        }
    }

    const onRefresh = () => {
        setRefresh(true)
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const topComponent = () => {
        return (
            <View style={{paddingVertical: 16}}>
                <View style={{paddingHorizontal: 16}}>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>MY PROFILE</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 16}}>
                    <View style={styles.avatarWrapper}>
                        {movesModel?.userInfo?.avatar ?
                            <Image resizeMode={"cover"} style={styles.avatar}
                                   source={{uri: replaceHTTP(movesModel?.userInfo?.avatar)}}/>
                            : null}
                    </View>
                    <View style={{marginBottom: 16, alignItems: 'center'}}>
                        <Text
                            style={styles.infoText}>{movesModel?.userInfo?.forename + ' ' + movesModel?.userInfo?.surname}</Text>
                        <Text style={styles.infoText}>{movesModel?.userInfo?.email}</Text>
                        <Text style={styles.infoText}>{movesModel?.userInfo?.phone}</Text>
                    </View>
                    <MButton
                        onPress={() => navigation.navigate('MainScreen', {screen: 'EditProfileScreen'})}
                        style={styles.editDetails}
                        styleText={styles.editDetailsText}
                        text='edit details'/>
                    <View style={{alignItems: 'center', marginVertical: 8}}>
                        <MButton
                            onPress={() => navigation.navigate('MainScreen', {screen: 'AchievementsScreen'})}
                            style={[styles.editDetails, {marginTop: 12}]}
                            styleText={styles.editDetailsText}
                            text='achievements'/>
                    </View>
                    <View style={{alignItems: 'center', marginVertical: 8}}>
                        <Text>You currently have {listFitnessAppUsage?.length} fitness apps linked</Text>
                        <MButton
                            onPress={() => goToPage('ManagerFitnessApps')}
                            style={[styles.editDetails, {marginTop: 12}]}
                            styleText={styles.editDetailsText}
                            text='edit fitness apps'/>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <>
            {/*{isLoading && <CenterSpinner/>}*/}
            <Screen style={ROOT} preset="fixed">
                <View style={{flex: 1}}>
                    <Header headerText='LOGO'/>
                    <FlatList
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'profile-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    avatarWrapper: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: layout.width / 8,
        backgroundColor: color.lighterGrey,
        marginBottom: 15,
    },
    avatar: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: layout.width / 8,
    },
    infoText: {
        marginBottom: 8,
    },
    editDetails: {
        backgroundColor: color.orange,
    },
    editDetailsText: {
        color: color.white,
    },
});
