// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
    Platform,
    Alert
} from 'react-native';
import {DetailActivity, Header, MButton, Screen, Text, BtnBack} from '../../components';
import {useIsFocused, useNavigation} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {calculateDate, formatDate, formatNumber, showToast, StatusBarHeight, timestampToDate} from "../../services";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {FETCH_getMasterDataUploadActivity, FETCH_uploadActivity, FETCH_uploadActiviyGarmin, FETCH_uploadActivityApple} from "./activity-service";
import {images} from "../../images";
import Share from "react-native-share";
import ViewShot, {captureRef} from "react-native-view-shot";
import AppleHealthKit, { HealthKitPermissions, } from 'react-native-health'
import { FETCH_getFitnessAppUsage } from '../fitness-apps/fitness-apps-service';
import { Limit_Second } from '../../config';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const UploadActivityScreen = observer(function UploadActivityScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [modalVisible, setModalVisible] = useState<any>({
        confirm: false,
        success: false,
        detail: false,
        detail_success: false
    });
    const [listData, setListData] = useState<any>([]);
    const [totalMoves, setTotalMoves] = useState(0);
    const [lastUpload, setLastUpload] = useState(new Date());
    const [newDate, setNewDate] = useState(new Date());
    const [Upload_Count, setUpload_Count] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    const [masterData, setMasterData] = useState<any>(null);
    const viewRef = useRef();
    const [listDataSubmitFinal, setListDataSubmitFinal] = useState<any>(null);
    const [totalMovesDevice, setTotalMovesDevice] = useState(0)
    const [totalMovesFitness, setTotalMovesFitness] = useState(0)
    const [totalMovesManual, setTotalMovesManual] = useState(0)

    const {refetch} = useQuery(FETCH_getMasterDataUploadActivity);

    const [uploadActivity, {}] = useMutation(FETCH_uploadActivity);
    const [uploadActivityGarmin, {}] = useMutation(FETCH_uploadActiviyGarmin);
    const [uploadActivityApple, {}] = useMutation(FETCH_uploadActivityApple);
    const query = useQuery(FETCH_getFitnessAppUsage)


    useEffect(() => {
        fetchMasterData();
    }, [isFocused, isRefresh]);
    const fetchMasterData = async () => {
        setTotalMovesDevice(-1)
        setTotalMovesFitness(-1)
        setTotalMovesManual(-1)
        setNewDate(new Date())
        setRefresh(false);
        setLoading(true)
        if (isFocused && !isRefresh && refetch) {
            let activity = await movesModel.getActivity();
            let count = await movesModel.getUserInfoByKey('count');
            // setListData(activity);
            try {
                let {data: {getFitnessAppUsage: {FitnessApp, FitnessAppUsage}}} = await query.refetch()
                for(let i = 0; i < FitnessAppUsage?.length; i++){             
                    if(FitnessAppUsage[i]?.FitnessApp?.Fitness_App_Name == "Garmin") {
                       let res = await uploadActivityGarmin()  
                    }
                    if(FitnessAppUsage[i]?.FitnessApp?.Fitness_App_Name == "Apple Health") {
                      getData()
                 }
                }
                let {data: {getMasterDataUploadActivity: {data, message, messageCode}}} = await refetch();               
                // setLoading(false);          
                if (messageCode == 200) {
                    setLastUpload(new Date(data?.LastUpload));
                    setUpload_Count(data?.Upload_Count + 1)
                    setMasterData(data);
                    if(data?.Upload_Count == 0) {
                        if(count == 1){
                            Alert.alert(
                            "Confirm",
                            'You have not selected your fitness apps. Do you want to select now?',
                            [
                                {
                                    text: "Cancel",
                                    onPress: async () => {await movesModel.setUserInfo({
                                        count: count + 1
                                    })},
                                    style: "cancel"
                                },
                                { text: "OK", onPress: async () => {
                                    await movesModel.setUserInfo({
                                        count: count + 1
                                    })
                                    goToPage('ManagerFitnessApps')}}
                            ]
                        ); 
                        }
                        if(activity?.length == 0){
                        await movesModel.addActivity({
                            Activity_Type_ID: 0,
                            Activity_Type_Name: "JOINING BONUS",
                            Activity_Type_Icon: '',
                            Activity_Unit_ID: 0,
                            Activity_Unit_Name: '',
                            Activity_Type_Unit_ID: 112,
                            Conversation_To_Moves_Rate: 1,
                            Units: data?.JOINING_BONUS,
                            FromDate: new Date(data?.LastUpload) ,
                            ToDate: new Date(data?.LastUpload),
                        });
                    }        
                    }
                    
                } else {
                    showToast('error', message)
                }
                // lấy list hành động submit cuối cùng
                let _activity_hight = await movesModel.getActivity();
                setListData(_activity_hight);
                let _data_activities = []                                                      
                for (let i = 0; i < _activity_hight?.length; i++) {
                    let item = _activity_hight[i];
                    let temp = parseFloat(item?.Units) * parseFloat(item?.Conversation_To_Moves_Rate);
                    temp = Math.round(temp * 100) / 100;                                             
                    let obj = {
                        "Activity_Start_Time": new Date(item?.FromDate) ,
                        "Activity_End_Time": new Date(item?.ToDate),
                        "ActivityType": {
                            "Activity_Type_Name": item?.Activity_Type_Name
                        },
                        "Activity_Unit_Name": item?.Activity_Unit_Name,
                        "Number_Units": item?.Units,
                        "Moves_Arising": temp,
                        "Include_YN": true,
                        "Type": "Manual"
                    };     
                    _data_activities.push(obj)                               
                }
                let dataFitness = [...data?.Activity_Type_Entry]
                let notActivityManual : any = []
                let notActivityAuto : any = []
                for(let i = 0; i < _data_activities?.length; i++){
                    let itemManual = _data_activities[i]
                    let startDate1 = itemManual?.Activity_Start_Time.getTime()
                    let endDate1 = itemManual?.Activity_End_Time.getTime()
                    for(let j = 0; j < dataFitness?.length ; j++){
                        let itemFitness = dataFitness[j]
                        if(itemFitness?.Include_YN) {
                            let startDate2 = new Date(itemFitness?.Activity_Start_Time).getTime()
                            let endDate2 = new Date(itemFitness?.Activity_End_Time).getTime()
                            if(startDate2 < startDate1 && startDate1 < endDate2 || startDate2 < endDate1 && endDate1 < endDate2 || startDate1 < startDate2 && startDate2 < endDate1){
                                if(itemManual?.Moves_Arising < itemFitness?.Moves_Arising){
                                    notActivityManual.push(i)
                                }else {
                                    notActivityAuto.push(itemFitness)
                                }
                            }
                        }         
                    }
                }
                let new_dataFitness = dataFitness.map((item,index) => {
                    let obj = {...item};
                    for(let i = 0; i < notActivityAuto?.length ; i++){
                        let obj2 = {...notActivityAuto[i]}
                        if(obj?.Activity_Type_Name == obj2?.Activity_Type_Name && 
                        obj?.Activity_Start_Time == obj2?.Activity_Start_Time && 
                        obj?.Fitness_App?.Fitness_App_Name == obj2?.Fitness_App?.Fitness_App_Name) {
                            obj.Include_YN = false
                        }
                    }
                    return obj
                })
                let new_dataManual = _data_activities.map((item,index) => {
                    if(notActivityManual.includes(index)) {
                        item.Include_YN = false
                    }
                    return item
                })
                let _listDataSubmit = [...new_dataManual,...new_dataFitness]
                setListDataSubmitFinal(_listDataSubmit)
                let totalMovesApple = 0
                let totalMovesFitness = 0
                let totalMovesMaunal = 0
                if(new_dataFitness?.length){
                    for(let i = 0; i < new_dataFitness?.length; i++ ){
                        if(new_dataFitness[i]?.Include_YN){
                            if(new_dataFitness[i]?.Fitness_App?.Fitness_App_Name == "Apple Health"){
                                totalMovesApple += new_dataFitness[i]?.Moves_Arising
                            }else {
                                totalMovesFitness += new_dataFitness[i]?.Moves_Arising
                            }
                            
                        }
                    }
                }
                for (let i = 0; i < new_dataManual.length; i++) {
                    let item = new_dataManual[i];
                    if(item?.Include_YN) totalMovesMaunal += item?.Moves_Arising
                }
                let _total_moves = totalMovesApple + totalMovesFitness + totalMovesMaunal
                setTotalMovesDevice(totalMovesApple)
                setTotalMovesFitness(totalMovesFitness)
                setTotalMovesManual(totalMovesMaunal)
                setTotalMoves(_total_moves)
            } catch (e) {
                showToast('error', e.message)
            }
        }
        setLoading(false)
    };

    const getData = async () => {
        let {data: {getMasterDataUploadActivity: {data : {LastUpload}}}} = await refetch();
        let _startDate = new Date(LastUpload)
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
                // let startDate = new Date(2022, 7, 24);
                let startDate = new Date(_startDate?.getFullYear(), _startDate?.getMonth(), _startDate?.getDate())
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
        dataActivity = results.map((item, index) => {
            let start = new Date(item.start).toString()
            let end = new Date(item.end).toString()
            let obj = {
                "Type_Name": type,
                "StartTime": new Date(start).getTime(),
                "EndTime": new Date(end).getTime(),
                "Quantity": item.quantity,
                "Unit_Minute": Math.ceil(new Date(end).getMinutes() - new Date(start).getMinutes())
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
                    dataActivity_final[dataActivity_final?.length - 1].Unit_Minute = Math.ceil(new Date(dataActivity[j].EndTime).getMinutes() - new Date(item.StartTime).getMinutes())
                }else{
                    dataActivity_final.push(dataActivity[j])
                }
            }
        }
        if(dataActivity_final?.length > 0) {
            let res = uploadActivityApple({
                variables: {
                    bodyData: dataActivity_final
                },
            });  
        }    
        return
        })
    }

    const goToPage = (page, index = null) => {
        navigation.navigate('MainScreen', {
            screen: page,
            params: {
                id: index,
                masterData
            },
        });
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = {...modalVisible};
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const abandonUpload = async () => {
        await movesModel.clearActivity();
        // setRefresh(true)
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 1,
        });
    };

    const submitUploadActivity = async () => {
        if(listDataSubmitFinal?.length == 0) {
            showToast('error', "Don't upload zero moves!")
            return
        }
        setLoading(true);
        try {
            let bodyData: any = [];
            for (let i = 0; i < listData.length; i++) {
                let item = listData[i];
                    bodyData = [...bodyData, {
                        "Activity_Start_Time": new Date(item?.FromDate).getTime() ,
                        "Activity_End_Time": new Date(item?.ToDate).getTime() ,
                        "Activity_Type_Unit_ID": item?.Activity_Type_Unit_ID,
                        "Number_Units": item?.Units
                    }];
            }
      
            let {data: {uploadActivity: {messageCode, message}}} = await uploadActivity({
                variables: {
                    bodyData: bodyData
                },
            });          
            setLoading(false);

            let _modalVisible = {...modalVisible};
            _modalVisible['confirm'] = false;

            if (messageCode == 200) {
                _modalVisible['success'] = true;
                setModalVisible(_modalVisible);

                let _donation = await movesModel.getDonateInfo();
                await movesModel.setDonateInfo({
                    movesAvailable: _donation?.movesAvailable + totalMoves
                });

                // await movesModel.clearActivity();

                // setRefresh(true);
                
            } else {
                setModalVisible(_modalVisible);
                if(message == 'Activity_End_Time > new Date') showToast('error','The time of the last action is beyond the present time!')
                if(message == 'Activity_Start_Time < User.Created_Date') showToast('error','Action start time cannot be after account creation time!')
                if(message == 'Activity_Start_Time < Upload_Period_End_Time') showToast('error',"Action start time cannot be after last upload action's end time!")
            }
        } catch (e) {
            setLoading(false);
            showToast('error', e.message)
        }
    };

    const shareSocial = async () => {
        captureRef(viewRef, {format: "jpg", quality: 0.8, result: "base64"})
            .then(
                async (uri) => {
                    await Share.open({url: `data:image/png;base64,${uri}`});
                },
                (error) => console.error("Oops, snapshot failed", error)
            );
    };


    const topComponent_modal = () => {
        return (
          <View style={Platform?.OS == 'ios' ? {marginTop: 40} : {marginTop: 0}}>
            <BtnBack title={"Activity Details"} goBack={() => setChangeModal('detail', false)} />
          </View>
        )
    }
    const topComponent = () => {
        let date = new Date().getTime();
        return (
            <View style={{padding: 16}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                    <Text style={{fontSize: 17}}>UPLOAD: {Upload_Count}</Text>
                    {/* <Text style={{fontSize: 17}}>{formatDate(Upload_End_Date, 'dd/MM/YYYY hh:mm:ss')}</Text> */}
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{fontSize: 15, width: 50}}>From: </Text>
                        <Text style={{fontSize: 15}}>{formatDate(lastUpload, 'dd/MM/YYYY hh:mm')}</Text>
                    </View>      
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom:7}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{fontSize: 15, width: 50}}>To: </Text>
                        <Text style={{fontSize: 15}}>{formatDate(newDate, 'dd/MM/YYYY hh:mm')}</Text>
                    </View>
                    
                </View>
                {/* <Text style={{fontSize: 15, marginBottom: 8}} fonts={'DemiBold'}>
                    Date of last upload: {formatDate(lastUpload, 'dd/MM/YYYY hh:mm')}
                </Text> */}
                <Text style={{marginBottom: 8}}>
                   ({calculateDate(lastUpload, date)})
                </Text>
                <Text style={{marginTop: 15, marginBottom: 10, fontSize: 16}}>UPLOADED ACTIVITY</Text>
                <View style={{flexDirection: 'row', justifyContent:'space-between', width: '90%', marginBottom: 10}}>
                    <Text>From your device</Text>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>{totalMovesDevice >= 0 ? formatNumber(Math.floor(totalMovesDevice))  : "..."} Moves</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent:'space-between', width: '90%', marginBottom: 10}}>
                    <Text>From your Fitness Apps</Text>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>{totalMovesFitness >= 0 ? formatNumber(Math.floor(totalMovesFitness)) : "..."} Moves</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent:'space-between', width: '90%', marginBottom: 10}}>
                    <Text>INDIVIDUAL ACTIVITIES</Text>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>{totalMovesManual >= 0 ? formatNumber(Math.floor(totalMovesManual)) : "..."} Moves</Text>
                </View>
                
                {/* {total_moves > 0 ? */}
                    <View style={{alignItems: 'center'}}>
                        <MButton
                            onPress={() => {
                                goToPage("DetailActivityScreen")
                            }}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text='detail'/>
                    </View>
                    {/* : null} */}
                <Text style={{marginBottom: 16}}>Do you want to record other activities carried out in the same
                    period?</Text>
                <View style={styles.appsWrapper}>       
                    <MButton
                        onPress={() => goToPage('AddIndividualActivityItemsScreen')}
                        style={styles.btnBlue}
                        styleText={styles.textWhite}
                        text='add'/>
                </View>
                {/* {listData?.length || total_moves > 0 ? */}
                    <View style={{alignItems: 'center', marginTop: 60}}>
                        <MButton
                            onPress={() => abandonUpload()}
                            style={styles.btnOrange}
                            styleText={styles.textWhite}
                            text='abandon upload'/>
                        <MButton
                            onPress={() => submitUploadActivity()}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text='submit upload'/>
                    </View>
            </View>
        );
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={ROOT} preset="fixed">
                <View style={{flex: 1}}>
                    <Header
                        headerText='UPLOAD ACTIVITY'
                        onLeftPress={async () => {
                            navigation.navigate('HomeScreen');
                            await movesModel.setAppInfo({
                                tabIndex: 1,
                            });
                        }}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'upload-activity-' + index + String(item)}
                    />
                </View>

                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.success}
                    onRequestClose={() => {
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView2]}>
                            <FlatList
                                contentContainerStyle={{flexGrow: 1}}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                style={{flex: 1,}}
                                renderItem={null}
                                data={[]}
                                ListEmptyComponent={() => {
                                    return (
                                        <View style={styles.listEmptyComponent}>
                                            <View style={{backgroundColor: color.primary}}>
                                                <TouchableOpacity
                                                    style={styles.backWrapper}
                                                    onPress={async () => {
                                                        setRefresh(true);
                                                        await movesModel.clearActivity()
                                                        setChangeModal('success', false)
                                                        goToPage("DashboardScreen")
                                                    }
                                                    }>
                                                    <Ionicons
                                                        name='return-up-back-outline'
                                                        color={color.green}
                                                        size={20}/>
                                                    <Text style={styles.backText}>back</Text>
                                                </TouchableOpacity>
                                                <ViewShot ref={viewRef}>
                                                    <View style={{backgroundColor: color.primary}}>
                                                        <View style={{marginBottom: 16}}>
                                                            <Image
                                                                resizeMode={"contain"}
                                                                style={styles.balloons}
                                                                source={images.balloons}/>
                                                        </View>
                                                        <View style={styles.thanksWrapper}>
                                                            <Text style={styles.thanksTitle}>
                                                                Thank you for adding your moves
                                                            </Text>
                                                            <Text style={styles.thanksMoves} fonts={'DemiBold'}>
                                                                {formatNumber(totalMoves)} Moves were added
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                            </View>
                                            <View style={{alignItems: 'center', backgroundColor: color.primary}}>
                                                <MButton
                                                    onPress={ async () => {
                                                        setChangeModal('detail_success', true)                                    
                                                    }}
                                                    style={[styles.btnBlue, {}]}
                                                    styleText={styles.textWhite}
                                                    text='view details'/>
                                                <TouchableOpacity
                                                    style={styles.shareWrapper}
                                                    onPress={() => shareSocial()}>
                                                    <Text>share your moves</Text>
                                                    <View style={styles.shareIcons}>
                                                        <Ionicons name='logo-facebook' color={color.green} size={32}/>
                                                        <Ionicons name='logo-twitter' color={color.green} size={32}/>
                                                        <Ionicons name='logo-linkedin' color={color.green} size={32}/>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{backgroundColor: color.primary}}>
                                                <Text style={styles.thanksDonate}>ready to donate</Text>
                                                <TouchableOpacity style={styles.thanksDonateBtn} onPress={async () => {
                                                    setRefresh(true);
                                                    await movesModel.clearActivity()
                                                    setChangeModal('success', false);
                                                    navigation.navigate('HomeScreen');
                                                    await movesModel.setAppInfo({
                                                        tabIndex: 0,
                                                    });
                                                }}>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24}/>
                                                    <Text>donate</Text>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24}/>
                                                </TouchableOpacity>
                                            </View>
                                            <Modal
                                                animationType={"slide"}
                                                transparent={true}
                                                visible={modalVisible?.detail_success}
                                                onRequestClose={() => {
                                                }}
                                            >
                                                <>
                                                    {isLoading && <CenterSpinner/>}
                                                    <View style={styles.centeredView}>
                                                        <View style={styles.modalView3}>
                                                            <View style={Platform?.OS == 'ios' ? {marginTop: 40} : {marginTop: 0}}>
                                                                <BtnBack title={"Activity Details"} 
                                                                    goBack={() => {
                                                                    setChangeModal('detail_success', false)
                                                                    }} 
                                                                />
                                                            </View>
                                                            <FlatList
                                                            showsVerticalScrollIndicator={false}
                                                            showsHorizontalScrollIndicator={false}
                                                            style={{flex: 1}}
                                                            renderItem={({item,index}) =>  <DetailActivity item={item} />}
                                                            data={listDataSubmitFinal}
                                                            keyExtractor={(item, index) => 'view-activity-success-modal-' + index + String(item)}
                                                            />

                                                        </View>

                                                    </View>
                                                </>
                                            </Modal>
                                        </View>
                                    )
                                }}
                                keyExtractor={(item, index) => 'upload-activity-modal-' + index + String(item)}
                            />
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.detail}
                    onRequestClose={() => {
                    }}
                >
                    <>
                        {isLoading && <CenterSpinner/>}
                        <View style={styles.centeredView}>
                            <View style={styles.modalView3}>

                                <FlatList
                                  showsVerticalScrollIndicator={false}
                                  showsHorizontalScrollIndicator={false}
                                  style={{flex: 1}}
                                  renderItem={({item,index}) =>  <DetailActivity item={item} />}
                                  data={masterData?.Activity_Type_Entry}
                                  ListHeaderComponent={topComponent_modal()}
                                  keyExtractor={(item, index) => 'view-activity-modal-' + index + String(item)}
                                />

                            </View>

                        </View>
                    </>
                </Modal>

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
        alignItems: 'center'
    },
    centeredView: {
        flex: 1,
    },
    modalView: {
        flex: 1,
        backgroundColor: color.primary,
        opacity: .95,
        paddingVertical: layout.width / 4,
        paddingHorizontal: layout.width / 8
    },
    modalView2: {
        flex: 1,
        backgroundColor: color.primary,
        opacity: 1,
        // paddingVertical: layout.width / 6,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: StatusBarHeight
    },
    modalView3: {
        flex: 1,
        backgroundColor: color.primary,
        padding: 16
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent:'center',
        marginBottom: 20
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    shareWrapper: {
        alignItems: 'center',
        backgroundColor: color.tabbar,
        paddingTop: 16,
        paddingBottom: 8,
        borderRadius: 16,
        // marginHorizontal: 16,
        width: layout.width * 3 / 4,
    },
    shareIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
        marginBottom: 8
    },
    balloons: {
        height: layout.width / 2,
        width: layout.width
    },
    thanksWrapper: {
        paddingHorizontal: 16, alignItems: 'center'
    },
    thanksTitle: {
        textAlign: 'center',
        fontSize: 16,
        // marginBottom: 16,
        width: layout.width * 2 / 3,
        // backgroundColor: 'red',
        // marginTop: 16,
        marginBottom: 16,
    },
    thanksDonate: {
        color: color.danger,
        marginVertical: 16,
        textAlign: 'center'
    },
    thanksMoves: {
        // color: color.danger,
        // marginBottom: 8
        fontSize: 22,
        marginBottom: 16,
        // marginTop: 16
    },
    thanksDonateBtn: {
        backgroundColor: color.danger,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 24,
        width: layout.width * 2 / 3,
        justifyContent: 'space-between',
        // marginBottom: 32
    },
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
    listEmptyComponent: {
        backgroundColor: color.primary,
        flex: 1,
        height: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16
    }
});
