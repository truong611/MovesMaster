import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    View,
    ViewStyle,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Platform,
} from 'react-native';
import {Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {color} from '../../theme';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {calculateDate, converStrToDate, formatDate, formatNumber, numberFormat, showToast, StatusBarHeight, timestampToDate} from "../../services";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {FETCH_getDashboardMobile} from "./dashboard-service";
import {useStores} from "../../models";
import { FETCH_getFitnessAppUsage } from '../fitness-apps/fitness-apps-service';
import { FETCH_uploadActivityApple, FETCH_uploadActiviyGarmin } from '../activity/activity-service';
import AppleHealthKit, { HealthKitPermissions, } from 'react-native-health'
import { Limit_Second } from '../../config';

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const layout = Dimensions.get('window');

export const DashboardScreen = observer(function DashboardScreen(props: any) {
    const navigation = useNavigation();
    const [dashboard, setDashboard] = useState<any>(null);
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const {movesModel} = useStores();
    const {refetch} = useQuery(FETCH_getDashboardMobile);
    const query = useQuery(FETCH_getFitnessAppUsage)
    const [uploadActivityGarmin, {}] = useMutation(FETCH_uploadActiviyGarmin);
    const [uploadActivityApple, {}] = useMutation(FETCH_uploadActivityApple);

    let {HandleSelectTypeNews} = props

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {

        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            try {           
                let {data: {getDashboardMobile}} = await refetch({
                    // GMT_Mobile
                }); 
                if (getDashboardMobile?.messageCode == 200) {
                    let {data: {getFitnessAppUsage: {FitnessApp, FitnessAppUsage}}} = await query.refetch()
                    for(let i = 0; i < FitnessAppUsage?.length; i++){             
                        if(FitnessAppUsage[i]?.FitnessApp?.Fitness_App_Name == "Garmin") {
                            let GMT_Mobile = new Date().getTimezoneOffset() / 60
                            let res = await uploadActivityGarmin({
                                variables: {
                                    GMT_Mobile
                                },
                            })  
                        }
                        if(FitnessAppUsage[i]?.FitnessApp?.Fitness_App_Name == "Apple Health") {
                            if(Platform?.OS == 'ios') {
                                await getData(getDashboardMobile?.data?.LastUpload)
                            }
                            
                        }
                    }
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

    const getData = async (strDate) => {
        console.log(strDate)
        let  _startDate = converStrToDate(strDate)
        const permissions = {
        permissions: {
            read: [
                AppleHealthKit.Constants.Permissions.DistanceCycling,
                AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
                AppleHealthKit.Constants.Permissions.FlightsClimbed,
                AppleHealthKit.Constants.Permissions.StepCount,
                AppleHealthKit.Constants.Permissions.DistanceSwimming,
            ],
        },
        } as HealthKitPermissions;

        await AppleHealthKit.initHealthKit(permissions, (error: string, results: boolean) => {
        /* Called after we receive a response from the system */
        if (error) {
            console.log('[ERROR] Cannot grant permissions!')
            return
        }
        let startDate = new Date(_startDate?.getFullYear() , _startDate?.getMonth(), _startDate?.getDate())
        const activityApplelheath = ['Walking']
        for(let i = 0; i < activityApplelheath?.length; i++){
            let res = getAppleHealthData(startDate, activityApplelheath[i]);
        }
        })
    }
    
    const getAppleHealthData = async (fromDate, type) =>  {
        let dataActivity = []
        let dataActivity_final : any = []
        let options = {
            startDate: fromDate.toISOString(),
            endDate: new Date().toISOString(),
            period: 1440,
            includeManuallyAdded: true,
            type: type
        }
        await AppleHealthKit.getSamples(
        options,
        (err: Object, results: Array<Object>) => {
        if(err){
            console.log("Err: ", err);
            return
        } 
        dataActivity = results.map((item, index) => {
            let start = new Date(item.start).toString()
            let end = new Date(item.end).toString()
            let obj = {
                "ID": new Date(start).getTime().toString(),
                "Type_Name": type,
                "StartTime": new Date(start).getTime(),
                "EndTime": new Date(end).getTime(),
                "Quantity": item.quantity,
                "Unit_Minute": Math.ceil( (new Date(end).getTime() - new Date(start).getTime()) / 60000)
            }
            return obj

        })
        dataActivity.reverse()
        for(let j = 0; j < dataActivity?.length; j++){
            let obj
            if(j == 0) dataActivity_final.push(dataActivity[j])
            else {
                let item = dataActivity_final[dataActivity_final?.length - 1]
                let endDate1 = item?.EndTime
                let startDate2 = dataActivity[j].StartTime
                if((startDate2 - endDate1) <= Limit_Second*1000){
                    dataActivity_final[dataActivity_final?.length - 1].EndTime = dataActivity[j].EndTime;
                    dataActivity_final[dataActivity_final?.length - 1].Quantity = item.Quantity + dataActivity[j].Quantity;
                    dataActivity_final[dataActivity_final?.length - 1].Unit_Minute = Math.ceil((new Date(dataActivity[j].EndTime).getTime() - new Date(item.StartTime).getTime())/60000)
                }else{
                    dataActivity_final.push(dataActivity[j])
                }
            }
        }
        let data_dataActivity_final : any = []
        dataActivity_final.map(item => {
            let obj = {...item}
            obj.StartTime = formatDate(obj.StartTime , "YYYY/MM/DD-hh:mm:ss")
            obj.EndTime = formatDate(obj.EndTime , "YYYY/MM/DD-hh:mm:ss")
            data_dataActivity_final.push(obj)
        })
        if(dataActivity_final?.length > 0) {
            let GMT_Mobile = new Date().getTimezoneOffset()/60
            let res = uploadActivityApple({
                variables: {
                    bodyData: dataActivity_final,
                    GMT_Mobile
                },
            }); 
        }    
        return
        })
    }

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
                            <Text style={{marginBottom: 8}}>last uploaded: {timestampToDate(converStrToDate(dashboard?.LastUpload) , 'dd/MM/YYYY hh:mm')}</Text>
                            <Text fonts={'DemiBold'}>({calculateDate(converStrToDate(dashboard?.LastUpload), date)} ago)</Text>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row',justifyContent: 'space-around', alignItems: 'center', marginVertical: 5}}>
                            <MButton
                                onPress={() => goToPage('UploadActivityScreen')}
                                style={styles.btnOrange}
                                styleText={styles.textWhite}
                                text='upload'/>
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
                                text='view'/>
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
                        <View style={{flexDirection: 'row',justifyContent: 'space-around', alignItems: 'center', marginTop: 15}}>
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
                                text='view'/>
                        </View>
                    </View>
                    <View style={styles.appsWrapper}>
                        <View style={{marginBottom: 12}}>
                            <Text fonts={'DemiBold'}>News</Text>
                        </View>
                        <View style={{flexDirection: 'row' ,justifyContent: 'space-around', alignItems: 'center', marginTop: 12, marginBottom: 10}}>
                            <MButton
                                onPress={async () => {
                                    navigation.navigate('HomeScreen');
                                    HandleSelectTypeNews('favourite')
                                    await movesModel.setAppInfo({
                                        tabIndex: 2,
                                    });
                                    // navigation.navigate('MainScreen', {screen: "NewsScreen"});
                                }}
                                style={styles.btnOrange}
                                styleText={styles.textWhite}
                                text='favourites'/>
                            <MButton
                                onPress={async () => {
                                    navigation.navigate('HomeScreen');
                                    HandleSelectTypeNews('all')
                                    await movesModel.setAppInfo({
                                        tabIndex: 2,
                                    });
                                }}
                                style={styles.btnBlue}
                                styleText={styles.textWhite}
                                text='all'/>
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
        width: '45%'
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
        width: '45%'
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
