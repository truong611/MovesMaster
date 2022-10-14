import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    View,
    ViewStyle,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import {Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {color} from '../../theme';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {calculateDate, formatDate, formatNumber, numberFormat, showToast, StatusBarHeight, timestampToDate} from "../../services";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getDashboardMobile} from "./dashboard-service";
import {useStores} from "../../models";

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const layout = Dimensions.get('window');

export const DashboardScreen = observer(function DashboardScreen() {
    const navigation = useNavigation();
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const {movesModel} = useStores();

    const {refetch} = useQuery(FETCH_getDashboardMobile);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            try {           
                let {data: {getDashboardMobile}} = await refetch(); 
                if (getDashboardMobile?.messageCode == 200) {   
                    setDashboard(getDashboardMobile?.data);
                    await movesModel.setDonateInfo({
                        donatedMoves: getDashboardMobile?.data?.Donated_Moves,
                        amountDonated: getDashboardMobile?.data?.Amount_Donated,
                        movesAvailable: getDashboardMobile?.data?.Moves_Avaiable,
                    })
                } else {
                    showToast('error', getDashboardMobile?.message)
                }
            } catch (e) {
                showToast('error', e?.message)
            }
        }
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const topComponent = () => {
        let date = new Date().getTime();
        return (
            <View>
                {/*<View style={{alignItems:'center', marginTop: 8, marginBottom: 12}}>*/}
                {/*<Text style={{fontSize: 13,color:color.white, marginBottom: 4, opacity: 0.2}}>swipe down to sync</Text>*/}
                {/*<Image source={images.icon_down}/>*/}
                {/*</View>*/}
                <View>
                    <View style={styles.appsWrapper}>
                        <View style={{marginBottom: 16}}>
                            <Text fonts={'DemiBold'}>ACTIVITY</Text>
                        </View>
                        <TouchableOpacity style={styles.activityDetailWrapper}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                <Text style={{fontSize: 18, color: color.danger}}
                                      fonts={'DemiBold'}>{formatNumber(Math.round(dashboard?.Donated_Moves + dashboard?.Moves_Avaiable))}</Text>
                                <Text fonts={'DemiBold'}> total moves</Text>
                            </View>
                            <Text style={{marginBottom: 8}}>last uploaded: {timestampToDate(dashboard?.LastUpload, 'dd/MM/YYYY hh:mm')}</Text>
                            <Text fonts={'DemiBold'}>({calculateDate(dashboard?.LastUpload, date)} ago)</Text>
                        </TouchableOpacity>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <MButton
                                onPress={() => goToPage('UploadActivityScreen')}
                                style={styles.btnOrange}
                                styleText={styles.textWhite}
                                text='upload activity'/>
                            <MButton
                                onPress={() => {
                                    navigation.navigate('MainScreen', {
                                        screen: 'ViewActivityScreen',
                                        params: {
                                           reset: true
                                    }})
                                } }
                                style={styles.btnBlue}
                                styleText={styles.textWhite}
                                text='view activity'/>
                        </View>
                    </View>
                    <View style={styles.appsWrapper}>
                        <View style={{marginBottom: 12}}>
                            <Text fonts={'DemiBold'}>DONATIONS</Text>
                        </View>
                        <View style={styles.donationsWrapper}>
                            <TouchableOpacity style={styles.donationsItem}>
                                <Text style={styles.donationsValue} fonts={'DemiBold'} numberOfLines={1} adjustsFontSizeToFit={true}>{formatNumber(Math.round(dashboard?.Donated_Moves))}</Text>
                                <Text style={styles.donationsText}>donated moves</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.donationsItem}>
                                <Text style={styles.donationsValue} fonts={'DemiBold'} numberOfLines={1} adjustsFontSizeToFit={true}>£{numberFormat(dashboard?.Amount_Donated)}</Text>
                                <Text style={styles.donationsText}>amount donated</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.donationsItem}>
                                <Text style={styles.donationsValue} fonts={'DemiBold'} numberOfLines={1} adjustsFontSizeToFit={true}>{formatNumber(Math.round(dashboard?.Moves_Avaiable))}</Text>
                                <Text style={styles.donationsText}>moves available</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 12}}>
                            <MButton
                                onPress={async () => {
                                    navigation.navigate('HomeScreen');
                                    await movesModel.setAppInfo({
                                        tabIndex: 0,
                                    });
                                }}
                                style={styles.btnOrange}
                                styleText={styles.textWhite}
                                text='donate'/>
                            <MButton
                                onPress={() => goToPage('ListDonateScreen')}
                                style={styles.btnBlue}
                                styleText={styles.textWhite}
                                text='view history'/>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const footerComponent = () => {
        return (
            <View style={{marginBottom: 56}}/>
        );
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={[ROOT, {marginTop: 0 - StatusBarHeight}]} preset="fixed">
                <View style={{flex: 1}}>
                    <Header headerText='LOGO'/>
                    <FlatList
                        contentContainerStyle={{flexGrow: 1}}
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        // showsVerticalScrollIndicator={false}
                        // showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        ListFooterComponent={footerComponent()}
                        keyExtractor={(item, index) => 'dashboard-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 2,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    textWhite: {
        color: color.white
    },
    appsWrapper: {
        backgroundColor: color.tabbar,
        marginTop: 16,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        paddingBottom: 4
    },
    activityDetailWrapper: {
        borderColor: color.danger,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginBottom: 16,
        borderRadius: 12
    },
    donationsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
        marginHorizontal: -8
    },
    donationsItem: {
        width: '30%',
        marginHorizontal: '1.5%',
        borderWidth: 1,
        borderColor: color.danger,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    donationsText: {
        textAlign: 'center'
    },
    donationsValue: {
        textAlign: 'center',
        marginBottom: 8,
        color: color.danger,
    },
});
