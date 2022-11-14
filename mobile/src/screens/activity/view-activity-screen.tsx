import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle, Modal, Platform, ScrollView} from 'react-native';
import {BtnBack, Header, MButton, Screen, Text, DetailActivity} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getHouse, dateToTimestamp, formatDate, formatNumber, showToast, timestampToDate, replaceHTTP, converStrToDate} from "../../services";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getViewActivity} from "./activity-service";
import {LineChart} from "react-native-chart-kit";
import { FETCH_getFitnessAppUsage } from '../fitness-apps/fitness-apps-service';
import { GMT_SERVER } from '../../config';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};


const chartConfig = {
    backgroundColor: color.tabbar,
    backgroundGradientFrom:color.tabbar,
    backgroundGradientTo: color.tabbar,
    color: (opacity = 1) => color.tabbar,
    strokeWidth: 1,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => color.white,
};

export const ViewActivityScreen = observer(function ViewActivityScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [listActivityEntry, setListActivityEntry] = useState<any>([]);
    const [date, setDate] = useState<any>(null);
    const isFocused = useIsFocused();
    const {params}: any = useRoute();
    const [modalVisible, setModalVisible] = useState<any>({
        detail: false
    });
    const [dataChart, setDataChart] = useState<any>(null);
    const [isActivities, setIsActivities] = useState(false)
    const [isChangeDay, setIsChangeDay] = useState(false)
    const [dotNoDisplay, setDotNoDisplay] = useState<any>([]);
    const [dataFitness, setDataFitness] = useState<any>([]);
    const query = useQuery(FETCH_getFitnessAppUsage)

    const {refetch} = useQuery(FETCH_getViewActivity);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let {data: {getFitnessAppUsage: {FitnessApp}}} = await query.refetch()
                setDataFitness(FitnessApp)
                let newDate = new Date();
                newDate.setHours(0)
                newDate.setMinutes(0)
                newDate.setSeconds(0)
                newDate.setMilliseconds(0) 
                
                let _date: any = newDate.getTime();
                if (params && params?.date && !isChangeDay) {
                    _date = new Date(params?.date).getTime() 
                }
                if(params && params?.reset) {
                    _date = newDate.getTime()
                } 
                setDate(_date)
                let {data: {getViewActivity: {Activity_Entry, message, messageCode}}} = await refetch({
                    "month": new Date(_date).getMonth(),
                    "year":  new Date(_date).getFullYear(),
                    "day": new Date(_date).getDate()
                });
                setLoading(false);
                if (messageCode == 200) {
                    let _Activity_Entry = [...Activity_Entry]
                    // _Activity_Entry.sort((a,b) => {
                    //     // return (parseInt(b?.Upload_Count) - parseInt(a?.Upload_Count))
                    //     return (parseInt(a?.Activity_End_Time) - parseInt(b?.Activity_End_Time))
                    // })
                    let _Activity_Entry_final = []
                    _Activity_Entry.map((item,index) => {
                        let obj = {...item}
                        obj.Activity_Start_Time = converStrToDate(obj.Activity_Start_Time)
                        obj.Activity_End_Time = converStrToDate(obj.Activity_End_Time)
                        for(let i = 0; i < FitnessApp?.length ; i++){
                            if(obj?.Fitness_App?.Fitness_App_Name == FitnessApp[i]?.Fitness_App_Name){
                                obj.Fitness_App = {...obj.Fitness_App, Fitness_App_Icon: FitnessApp[i]?.Fitness_App_Icon}
                            }
                        }
                        _Activity_Entry_final.push(obj)
                    })

                    _Activity_Entry_final.sort((a,b) => {
                        // return (parseInt(b?.Upload_Count) - parseInt(a?.Upload_Count))
                        return new Date(a?.Activity_End_Time).getTime() - new Date(b?.Activity_End_Time).getTime()
                    })

                    setListActivityEntry(_Activity_Entry_final)

                    Activity_Entry?.length > 0 ? setIsActivities(true) : setIsActivities(false)

                    let dataActivity_entry = [];
                    dataActivity_entry = Activity_Entry?.filter(item => item?.Include_YN)
                    dataActivity_entry.sort((a,b) => {
                       return a?.Activity_End_Time - b?.Activity_End_Time
                    })

                    let _dataActivity_entry = []
                    
                    dataActivity_entry.map((item, index) => {
                        let obj = {...item}
                        obj.Activity_Start_Time = converStrToDate(obj.Activity_Start_Time)
                        obj.Activity_End_Time = converStrToDate(obj.Activity_End_Time)
                        _dataActivity_entry.push(obj)
                    })
                    HandleDataChart(_dataActivity_entry)
                    // let _data = {
                    //     labels: [],
                    //     datasets: [
                    //         {
                    //             data: [],
                    //         }
                    //     ],
                    // };        
                    // for(let i = 0; i < dataActivity_entry?.length ; i++ ){
                    //     let label = getHouse(dataActivity_entry[i]?.Activity_End_Time)

                    //     if(i % 2 == 0 || dataActivity_entry?.length <= 7){
                    //         _data.labels.push(label)
                    //     }else{
                    //         _data.labels.push('')
                    //     }
                    //     _data.datasets[0].data.push(dataActivity_entry[i]?.Moves_Arising)
                    // }            
                    // setDataChart(_data)

                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const getActivityDays = async (date) => {   
        let {data: {getViewActivity: {Activity_Entry, message, messageCode}}} = await refetch({
            // "date": date,
            "month": new Date(date).getMonth(),
            "year":  new Date(date).getFullYear(),
            "day": new Date(date).getDate()
        });
        setLoading(false);
        if (messageCode == 200) {
            let _Activity_Entry = [...Activity_Entry]
            _Activity_Entry.sort((a,b) => {
                return (parseInt(b?.Upload_Count) - parseInt(a?.Upload_Count))
            })  
            setListActivityEntry(_Activity_Entry)
            Activity_Entry?.length > 0 ? setIsActivities(true) : setIsActivities(false)

            let dataActivity_entry = [];
            dataActivity_entry = Activity_Entry?.filter(item => item?.Include_YN)
            dataActivity_entry.sort((a,b) => {
               return a?.Activity_End_Time - b?.Activity_End_Time
            })
            let _dataActivity_entry = []
            dataActivity_entry.map((item,index) => {
                let obj = {...item}
                obj.Activity_Start_Time = converStrToDate(obj.Activity_Start_Time)
                obj.Activity_End_Time = converStrToDate(obj.Activity_End_Time)
                for(let i = 0; i < dataFitness?.length ; i++){
                    if(obj?.Fitness_App?.Fitness_App_Name == dataFitness[i]?.Fitness_App_Name){
                        obj.Fitness_App = {...obj.Fitness_App, Fitness_App_Icon: dataFitness[i]?.Fitness_App_Icon}
                    }
                }
                _dataActivity_entry.push(obj)
            })
            _dataActivity_entry.sort((a,b) => {
                return new Date(a?.Activity_End_Time).getTime() - new Date(b?.Activity_End_Time).getTime()
             })
            setListActivityEntry(_dataActivity_entry)
            HandleDataChart(_dataActivity_entry)
            // let _data = {
            //     labels: [],
            //     datasets: [
            //         {
            //             data: [],
            //         }
            //     ],
            // };
            // for(let i = 0; i < dataActivity_entry?.length ; i++ ){
            //     let label = getHouse(dataActivity_entry[i]?.Activity_End_Time)

            //     if(i % 2 == 0 || dataActivity_entry?.length <= 7){
            //         _data.labels.push(label)
            //     }else{
            //         _data.labels.push('')
            //     }
            //     _data.datasets[0].data.push(dataActivity_entry[i]?.Moves_Arising)
            // }
            // setDataChart(_data);
        }
    }

    const HandleDataChart = (Activity_Entry = []) => {
        let _data = {
            labels: [],
            datasets: [
                {
                    data: [],
                }
            ],
        };
        let _dotNoDisplay : any = []
        let dataActivity_entry = [...Activity_Entry]
        let datetime_03_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_03_00.setHours(3)
        datetime_03_00.setMinutes(0)
        datetime_03_00.setSeconds(59)
        datetime_03_00.setMilliseconds(0)

        let datetime_06_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_06_00.setHours(6)
        datetime_06_00.setMinutes(0)
        datetime_06_00.setSeconds(59)
        datetime_06_00.setMilliseconds(0)

        let datetime_09_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_09_00.setHours(9)
        datetime_09_00.setMinutes(0)
        datetime_09_00.setSeconds(59)
        datetime_09_00.setMilliseconds(0)

        let datetime_12_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_12_00.setHours(12)
        datetime_12_00.setMinutes(0)
        datetime_12_00.setSeconds(59)
        datetime_12_00.setMilliseconds(0)

        let datetime_15_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_15_00.setHours(15)
        datetime_15_00.setMinutes(0)
        datetime_15_00.setSeconds(59)
        datetime_15_00.setMilliseconds(0)

        let datetime_18_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_18_00.setHours(18)
        datetime_18_00.setMinutes(0)
        datetime_18_00.setSeconds(59)
        datetime_18_00.setMilliseconds(0)

        let datetime_21_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_21_00.setHours(21)
        datetime_21_00.setMinutes(0)
        datetime_21_00.setSeconds(59)
        datetime_21_00.setMilliseconds(0)

        let datetime_23_59 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_23_59.setHours(23)
        datetime_23_59.setMinutes(59)
        datetime_23_59.setSeconds(59)
        datetime_23_59.setMilliseconds(0)

        let datetime_0_00 = new Date(dataActivity_entry[0]?.Activity_End_Time)
        datetime_0_00.setHours(0)
        datetime_0_00.setMinutes(0)
        datetime_0_00.setSeconds(59)
        datetime_0_00.setMilliseconds(0)
        for(let i = 0; i < dataActivity_entry?.length ; i++ ){
            let label = getHouse(dataActivity_entry[i]?.Activity_End_Time)
            let label_Start = getHouse(dataActivity_entry[i]?.Activity_Start_Time)
            let item_time = new Date(dataActivity_entry[i]?.Activity_End_Time).getTime()
            let item_time_start = new Date(dataActivity_entry[i]?.Activity_Start_Time).getTime()

            let distance = Math.floor((item_time - item_time_start) / 3600000)
            if(getHouse(datetime_0_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_0_00.getTime() < item_time && item_time < datetime_03_00.getTime()){
                if(!_data.labels.includes('00:00')){
                    if(distance > 0 && getHouse(datetime_0_00) == label_Start){
                        _data.labels.push('00:00')
                        _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
                    }else{
                        _data.labels.push('00:00')
                        _data.datasets[0].data.push(0)
                    }
                }
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
                
            }else if(getHouse(datetime_03_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_03_00.getTime() < item_time && item_time < datetime_06_00.getTime()){
                if(!_data.labels.includes('00:00')){
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)  
                }
                if(!_data.labels.includes('03:00')){       
                        _data.labels.push('03:00')
                        _data.datasets[0].data.push(0)
                }     
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(getHouse(datetime_06_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_06_00.getTime() < item_time && item_time < datetime_09_00.getTime()){
                if(!_data.labels.includes('00:00')){            
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('03:00')){                
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('06:00')){
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(getHouse(datetime_09_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_09_00.getTime() < item_time && item_time < datetime_12_00.getTime()){
                if(!_data.labels.includes('00:00')){       
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('03:00')){              
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('06:00')){          
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('09:00')){
                    _data.labels.push('09:00')
                    _data.datasets[0].data.push(0)
                }
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
               
            }else if (getHouse(datetime_12_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_12_00.getTime() < item_time && item_time < datetime_15_00.getTime()){
                if(!_data.labels.includes('00:00')){         
                        _data.labels.push('00:00')
                        _data.datasets[0].data.push(0)
                }
               
                if(!_data.labels.includes('03:00')){        
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0)
                }   
                if(!_data.labels.includes('06:00')){             
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
               
                if(!_data.labels.includes('09:00')){                 
                    _data.labels.push('09:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('12:00')){                 
                    _data.labels.push('12:00')
                    _data.datasets[0].data.push(0)
                }  
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(getHouse(datetime_15_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_15_00.getTime() < item_time && item_time < datetime_18_00.getTime()){
                if(!_data.labels.includes('00:00')){                
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('03:00')){              
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('06:00')){         
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('09:00')){
                    _data.labels.push('09:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('12:00')){   
                    _data.labels.push('12:00')
                    _data.datasets[0].data.push(0)
                }

                if(!_data.labels.includes('15:00')){           
                    _data.labels.push('15:00')
                    _data.datasets[0].data.push(0)
                }

                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
              
            }
            else if(getHouse(datetime_18_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_18_00.getTime() < item_time && item_time < datetime_21_00.getTime()){
                if(!_data.labels.includes('00:00')){
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)
                }  
                if(!_data.labels.includes('03:00')){              
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('06:00')){
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('09:00')){             
                    _data.labels.push('09:00')
                    _data.datasets[0].data.push(0)
                }
               
                if(!_data.labels.includes('12:00')){                 
                    _data.labels.push('12:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('15:00')){    
                    _data.labels.push('15:00')
                    _data.datasets[0].data.push(0)
                }
              
                if(!_data.labels.includes('18:00')){                 
                    _data.labels.push('18:00')
                    _data.datasets[0].data.push(0)
                }
                
                _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(getHouse(datetime_21_00) == label){
                _data.labels.push(label)
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }
            else if(datetime_21_00.getTime() < item_time) {
                if(!_data.labels.includes('00:00')){                 
                    _data.labels.push('00:00')
                    _data.datasets[0].data.push(0)
                }          
                if(!_data.labels.includes('03:00')){
                    _data.labels.push('03:00')
                    _data.datasets[0].data.push(0) 
                }
                
                if(!_data.labels.includes('06:00')){             
                    _data.labels.push('06:00')
                    _data.datasets[0].data.push(0)
                }
  
                if(!_data.labels.includes('09:00')){
                    _data.labels.push('09:00')
                    _data.datasets[0].data.push(0)
                }
    
                if(!_data.labels.includes('12:00')){
                    _data.labels.push('12:00')
                    _data.datasets[0].data.push(0)
                }
                
                if(!_data.labels.includes('15:00')){              
                    _data.labels.push('15:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('18:00')){            
                    _data.labels.push('18:00')
                    _data.datasets[0].data.push(0)
                }
                if(!_data.labels.includes('21:00')){                
                        _data.labels.push('21:00')
                        _data.datasets[0].data.push(0)
                }
                if(getHouse(datetime_23_59) == label) _data.labels.push(label)
                else _data.labels.push('')
                _data.datasets[0].data.push(dataActivity_entry[i]?.Conversion_Rate)
            }       
        }
        if(!_data.labels.includes('00:00')){
            _data.labels.push('00:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('03:00')){
            _data.labels.push('03:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('06:00')){
            _data.labels.push('06:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('09:00')){
            _data.labels.push('09:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('12:00')){
            _data.labels.push('12:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('15:00')){
            _data.labels.push('15:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('18:00')){
            _data.labels.push('18:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('21:00')){
            _data.labels.push('21:00')
            _data.datasets[0].data.push(0)
        }
        if(!_data.labels.includes('23:59')){
            _data.labels.push('23:59')
            _data.datasets[0].data.push(0)
        }
        setDataChart(_data)  
        setDotNoDisplay(_dotNoDisplay)   
    }


    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const goBack = async () => {
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 1,
        });
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = {...modalVisible};
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const ChangeDay = (type) => {
        let new_date = new Date()
        new_date.setDate(new_date.getDate() + 1)
        new_date.setHours(0)
        new_date.setMinutes(0)
        new_date.setSeconds(0)
        new_date.setMilliseconds(0) 
        if(type == 'next') {
            let _date = new Date(date).getTime() + 3600 * 1000 * 24;
            if(_date < new_date.getTime()){
                setDate(new Date(_date))
                // getActivityDays( lechGio < 0 ? _date + 24*60*60*1000 : _date + lechGio*60*60*1000)
                getActivityDays(_date)
            }   
        }
        if(type == 'back') {
            let _date = new Date(date).getTime() - 3600 * 1000 * 24;
            setDate(new Date(_date))    
            // getActivityDays( lechGio < 0 ? _date + 24*60*60*1000 : _date + lechGio*60*60*1000)
            getActivityDays(_date)
        }
        setIsChangeDay(true)
    }

    const ItemView = ({item, index}) => {
        return (
            <View
                style={[styles.activityLog,
                    index == 0 ? {marginLeft: 16} : {}
            ]}> 
                    <View style={styles.appsItemImageWrapper}>
                           {item?.Fitness_App?.Fitness_App_Icon ? 
                                <Image resizeMode={"contain"} style={styles.appsItemImage}
                                    source={{ uri: replaceHTTP(item?.Fitness_App?.Fitness_App_Icon) }} />
                            : null }
                    </View>

                <View style={{zIndex: 1}}>
                    <Text style={{fontSize: 16}} numberOfLines={1} adjustsFontSizeToFit={true}>{item?.ActivityType?.Activity_Type_Name}</Text>
                    <Text style={{fontSize: 13,marginTop: 10}}>{item?.Number_Units} minutes</Text>
                    <Text style={{fontSize: 13}} fonts={'DemiBold'}>{formatNumber(item?.Moves_Arising)} moves</Text>
                </View>
                {item?.Activity_Type_Icon ?
                    <Image style={{width: layout.width / 3, height: layout.width / 3, borderRadius: 16, position: 'absolute'}} source={{uri: item?.Activity_Type_Icon}}/>
                    : null}
            </View>
        )
    };
    const topComponent = () => {
        let totalMoves = 0;
        for (let i = 0; i < listActivityEntry.length; i++) {
            totalMoves += listActivityEntry[i]?.Include_YN ? listActivityEntry[i]?.Moves_Arising : 0
        }
        return (
            <View style={styles.container}>
                <BtnBack title={formatDate(date) == formatDate(new Date) ? "MY MOVES TODAY": formatDate(date, 'dd MM YYYY')} goBack={goBack}/>
                <TouchableOpacity style={styles.btnBackDay} onPress={() => ChangeDay('back')}>
                    <Ionicons name={'chevron-back-outline'} color="white" size={28} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnNextDay} onPress={() => ChangeDay('next')}>
                    <Ionicons name={'chevron-forward-outline'} color="white" size={28} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.calendar} onPress={() => {
                    setIsChangeDay(false)
                    navigation.navigate('MainScreen', {
                        screen: 'CalendarActivityScreen',
                        params: {
                            date: new Date(date).getTime(),
                            isActivities: isActivities
                        },
                    });
                }}>
                    <Ionicons name={'calendar-outline'} color="white" size={28}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.banner}>
                    <Text style={{fontSize: 20, lineHeight: 20, marginBottom: 4}} fonts={'DemiBold'}>{formatNumber(totalMoves)}</Text>
                    <Text> total moves</Text>
                </TouchableOpacity>
                <View style={{backgroundColor: color.tabbar, paddingVertical: 16, marginBottom: 16}}>
                    <Text style={[{fontSize: 15, marginLeft: 16, marginBottom: 12},
                        // listActivityEntry?.length ? {marginBottom: 12} : {}
                    ]} fonts={'DemiBold'}>ACTIVITY LOG</Text>
                    <FlatList
                        horizontal
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={listActivityEntry}
                        ListHeaderComponent={null}
                        renderItem={ItemView}
                        keyExtractor={(item, index) => 'activity-log-' + item.toString() + index}
                    />
                </View>
                <View style={[styles.banner]}>

                    {dataChart?.labels?.length ? (
                        <> 
                            <ScrollView
                            horizontal={true}
                            >   
                                <View>
                                    {/* <Text style={{fontSize: 11,marginBottom: 5}}>Moves/minute</Text> */}
                                    <LineChart
                                        style={styles.lineChart}
                                        // withVerticalLabels={true}
                                        withHorizontalLabels={false}
                                        // segments={4}
                                        fromZero={true}
                                        withInnerLines={false}
                                        withShadow={false}
                                        withOuterLines={false}
                                        data={dataChart}
                                        // width={layout.width + (dataChart?.labels?.length - 8) / 3 * 80}
                                        width={dataChart?.labels?.length*50 + 50}
                                        // width={layout.width - 30}
                                        height={layout.width * 4.5 / 10}
                                        chartConfig={chartConfig}
                                        bezier
                                        getDotColor={(dataPoint, dataPointIndex) => {
                                            if(dataPoint == 0) return color.tabbar
                                            return color.white;
                                            }}
                                    />
                                </View>
                                
                            </ScrollView>
                            
                        </>
                        

                    ) : null}
                    {/* <Text style={{zIndex: 1}}>{formatDate(date) == formatDate(new Date) ? "today activity": formatDate(date, 'dd MM YYYY') + " activity"} </Text> */}
                </View>
                {listActivityEntry?.length ?
                    <View style={{alignItems: 'center'}}>
                        <MButton
                            onPress={() => setChangeModal('detail', true)}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text={'view detail'}/>
                    </View>
                    : null}         
            </View>
        );
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
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
                        keyExtractor={(item, index) => 'view-activity-' + index + String(item)}
                    />
                </View>
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
                                <View style={Platform?.OS == 'ios' ? {marginTop: 40} : {marginTop: 0}}>
                                   <BtnBack title={"Activity Details"} goBack={() => setChangeModal('detail', false)} />
                                </View>
                                <FlatList
                                  showsVerticalScrollIndicator={false}
                                  showsHorizontalScrollIndicator={false}
                                  style={{flex: 1}}
                                  renderItem={({item,index}) =>  <DetailActivity item={item}/>}
                                  data={listActivityEntry}
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
    appsItemImageWrapper: {
        width: 25,
        height: 25,
        borderRadius: 5,
        backgroundColor: color.primary,
        marginBottom: 15,
        marginTop: 5
    },
    appsItemImage: {
        width: 25,
        height: 25,
        borderRadius: 5,
    },
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 2,
    },
    btnDanger: {
        backgroundColor: color.danger,
        maxWidth: layout.width / 2,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    textWhite: {
        color: color.white
    },
    container: {
        paddingBottom: 16
    },
    calendar: {
        width: 60,
        height: 60,
        position: 'absolute',
        right: 0,
        paddingTop: 12,
        alignItems: 'center',
    },
    btnBackDay: {
        position: 'absolute',
        width: 20,
        height: 50,
        alignItems: 'center',
        paddingTop: 12,
        marginLeft: '17%'
    },
    btnNextDay: {
        position: 'absolute',
        width: 20,
        height: 50,
        alignItems: 'center',
        paddingTop: 12,
        right: 0,
        marginRight: '17%'
    },
    banner: {
        minHeight: layout.width * 2.5 / 10,
        width: layout.width - 32,
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'flex-end',
        marginBottom: 16,
        overflow: 'hidden',
    },
    activityLog: {
        width: layout.width / 3,
        height: layout.width / 3,
        borderRadius: 16,
        backgroundColor: color.primary,
        marginRight: 16,
        alignItems: 'flex-start',
        paddingTop: 5,
        paddingLeft: 10
    },
    centeredView: {
        flex: 1,
    },
    modalView3: {
        flex: 1,
        backgroundColor: color.primary,
        padding: 16
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent:'center',
        marginBottom: 20
    },
    lineChart: {
        marginLeft: -45,
    },
    lineChart_2: {
        marginLeft: -45,
        // position: 'absolute'
    }
});
