import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {View, ViewStyle, StyleSheet} from 'react-native';
import {Screen, Tabbar} from '../../components';
import {useStores} from '../../models';
import {color} from '../../theme';
import {DashboardScreen, DonateScreen, NewsScreen} from '..';
import {useQuery} from "@apollo/react-hooks";
import {FETCH_refreshToken} from "../profile/profile-service";
import { useIsFocused, useRoute } from '@react-navigation/native';

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const HomeScreen = observer(function HomeScreen() {
    // const [tabIndex, setTabIndex] = useState(1);
    const {movesModel} = useStores();
    const {params}: any = useRoute();
    const isFocused = useIsFocused();
    const [type_news, setType_News] = useState('favourite')

    const {refetch} = useQuery(FETCH_refreshToken);

    useEffect(() => {
        ;(async () => {
            if (refetch) {
                let token = await movesModel.getUserInfoByKey('token');
                let count = await movesModel.getUserInfoByKey('count');
                let {data: {refreshToken: {user: {refreshToken}, message, messageCode}}} = await refetch({
                    refreshToken: token
                });
                if (messageCode == 200) {
                    await movesModel.setUserInfo({
                        token: refreshToken
                    })
                    await movesModel.setUserInfo({
                        count: count + 1
                    })
                }
            }
        })();
    }, []);

    const HandleSelectTypeNews = (type) => {
        setType_News(type)
        console.log("OKKK");
        
    }

    return (
        <Screen style={ROOT} preset="fixed">
            <View style={{flex: 1}}>
                {
                    movesModel?.appInfo?.tabIndex == 1 ? <DashboardScreen HandleSelectTypeNews={HandleSelectTypeNews} /> :
                        movesModel?.appInfo?.tabIndex == 2 ? <NewsScreen type={type_news} HandleSelectTypeNews={HandleSelectTypeNews}/> :
                            <DonateScreen/>
                }
                <View style={styles.bottomTab}>
                    <Tabbar/>
                </View>
            </View>
        </Screen>
    );
});

const styles = StyleSheet.create({
    bottomTab: {
        position: 'absolute',
        bottom: 0,
    },
});
