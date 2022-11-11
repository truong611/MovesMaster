// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Header, MButton, Screen, Text, Input} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {IndexPath, Select, SelectItem} from "@ui-kitten/components";
import DatePicker from 'react-native-date-picker'
import SelectDropdown from 'react-native-select-dropdown'
import {
    calculateDate,
    converStrToDate,
    dateToTimestamp,
    displaySelect,
    formatDate,
    regexDecimal,
    regexString,
    showToast,
} from "../../services";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const countries = ["Egypt", "Canada", "Australia", "Ireland"]

export const AddIndividualActivityItemsScreen = observer(function AddIndividualActivityItemsScreen() {
    const navigation = useNavigation();
    const {params}: any = useRoute();
    const {movesModel} = useStores();
    const isFocused = useIsFocused();
    const [masterData, setMasterData] = useState<any>(null);
    const [lastUpload, setLastUpload] = useState(new Date());
    const [isSubmit, setSubmit] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState<any>({
        activity_type: null,
        unit_type: null,
    });
    const [units, setUnits] = React.useState('');
    const [showCalculate, setShowCalculate] = useState(false);
    const [isShow, setShow] = useState<any>({
        fromDate: false,
        fromTime: false,
        toDate: false,
        toTime: false,
    });
    const [datetime, setDatetime] = useState<any>({
        fromDate: new Date(),
        toDate: new Date(),
    });
    const [dataSelectActivity, setDataSelectActivity] = useState([])
    const dropdownRef = useRef({});

    useEffect(() => {
        dropdownRef.current.reset()
        fetchMasterData();
    }, [isFocused, isRefresh]);
    const fetchMasterData = async () => {
        setShowCalculate(false)
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();
            let activity = await movesModel.getActivity();
            if (params?.masterData) {
                let _activityTypeMapIndex: any = {};
                let _activityTypeUnitMapIndex: any = {};
                let data = params?.masterData;
         
                data?.ActivityType?.length && data?.ActivityType.map((item, index) => {
                    _activityTypeMapIndex[item?.Activity_Type_ID] = index;
                    item?.ActivityUnit?.length && item?.ActivityUnit.map((value, i) => {
                        _activityTypeUnitMapIndex[value?.Activity_Unit_ID] = i;
                    })
                });

                

                let LastUpload = converStrToDate(data?.LastUpload);
                setLastUpload(LastUpload);

                let _datetime = {...datetime};
                if(activity?.length > 0){
                    let lastDateActivity = new Date(activity[activity?.length - 1]?.ToDate)
                    _datetime.fromDate = lastDateActivity
                    _datetime.toDate = lastDateActivity  
                }else{
                    _datetime.fromDate = LastUpload
                    _datetime.toDate = LastUpload
                } 
                setDatetime(_datetime);
                setMasterData(data);

                let data_Select_Activity = []
                data?.ActivityType?.map((item,index) => {
                    if(item?.Activity_Type_Name != 'JOINING BONUS') data_Select_Activity.push(item?.Activity_Type_Name)
                })
                setDataSelectActivity(data_Select_Activity)

                if (params?.id != null) {
                    let activity = await movesModel.getActivity();
                    if (activity?.length) {
                        let item = activity[params?.id];

                        let _selectedIndex = {...selectedIndex};
                        _selectedIndex.activity_type = new IndexPath(_activityTypeMapIndex[item?.Activity_Type_ID]);
                        _selectedIndex.unit_type = new IndexPath(_activityTypeUnitMapIndex[item?.Activity_Unit_ID]);
                        setSelectedIndex(_selectedIndex);

                        let _datetime = {...datetime};
                        _datetime.fromDate = new Date(item?.FromDate);
                        _datetime.toDate = new Date(item?.ToDate);
                        setDatetime(_datetime);

                        setUnits(item?.Units?.toString())
                    }
                }
            }
        }
    };

    const resetData = () => {
        setSelectedIndex({
            activity_type: null,
            unit_type: null,
        });
        setUnits('');
        setSubmit(false);
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const isUpdate = () => {
        return params?.id != null;

    };

    const setChangeShow = (type, value) => {
        let _isShow = {...isShow};
        _isShow[type] = value;
        setShow(_isShow);
    };

    const setChangeDatetime = (type, value) => {
        let _datetime = {...datetime};
        _datetime[type] = value;
        setDatetime(_datetime);
    };

    const setChangeSelected = (type, value) => {
        let _selectedIndex = {...selectedIndex};
        _selectedIndex[type] = value;
        setSelectedIndex(_selectedIndex);
    };

    const calculateUnits = (toDate) => {
        setShowCalculate(false)
        let _fromDate = new Date(datetime?.fromDate)
        _fromDate.setMilliseconds(0)
        _fromDate.setSeconds(0)
        let fromDate_second = _fromDate.getTime()
        let _toDate = new Date(toDate)
        _toDate.setMilliseconds(0)
        _toDate.setSeconds(0)
        let toDate_second = _toDate.getTime()
        let resultMinute = Math.round((toDate_second - fromDate_second) / 60000);
        if(resultMinute <= 0){
           showToast('error', 'Activity must be for more than 0 minutes');
        }  
        setUnits(resultMinute?.toString())
    }

    const Handlecalculate = () => {
        if(checkSubmit()){
            setShowCalculate(true)
        }
    }

    const addMinutesToDate = () => {
        let _toDate = new Date(datetime?.fromDate)
        if(parseInt(units) > 0) {
            _toDate.setMinutes(_toDate.getMinutes() + parseInt(units))
            if(_toDate.getTime() > new Date().getTime()){
                showToast('error', 'Activity end must be after the current time')
                setUnits('')
            }else{
                setChangeDatetime('toDate', _toDate)
            }    
    }
    }

    const checkSubmit = (activity) => {
        setSubmit(true);
        if (!selectedIndex?.activity_type) {
            showToast('error', 'activity type cannot be empty');
            return false;
        }     
        if (parseFloat(units) <= 0 || units == '') {
            showToast('error', 'Activity of zero minutes not permitted');
            return false;
        }
        if (dateToTimestamp(datetime?.fromDate) > dateToTimestamp(datetime?.toDate)) {
      
            showToast('error', 'Activity end must be after activity start');
            return false;
        }
        if (activity?.length) {
            let overlaps = false;
            // let Activity_Upload_Datetime = formatDate(datetime?.fromDate);
            activity.map((item, index) => {
                if (params?.id != index) {
                    // let Activity_Start_Time_Date = formatDate(item?.FromDate);
                    // let Activity_End_Time_Date = formatDate(item?.ToDate);
                    // if (Activity_Start_Time_Date !== Activity_Upload_Datetime || Activity_End_Time_Date !== Activity_Upload_Datetime) {
                        // showToast('error', `activities must be on the same day ${Activity_Start_Time_Date}`);
                        // overlaps = true;
                    // }

                    let StartDate1 = dateToTimestamp(datetime?.fromDate);
                    let EndDate1 = dateToTimestamp(datetime?.toDate);
                    let StartDate2 = dateToTimestamp(item?.FromDate);
                    let EndDate2 = dateToTimestamp(item?.ToDate);
                    if ((StartDate1 < EndDate2) && (EndDate1 > StartDate2)) {
                        showToast('error', `This ${masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name} overlaps with an individual activity logged earlier`);
                        overlaps = true;
                    }
                }
            });
            if (overlaps) {
                return false
            }
        }
        if(parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Limit_Minute) < parseFloat(units))
        {
            showToast('error', `Maximum time for this Action is ${parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Limit_Minute)} minutes`);
            return false;
        }
        return true;
    };

    const submit = async () => {
        let activity = await movesModel.getActivity();
        if (checkSubmit(activity)) {
                let payload = {
                Activity_Type_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_ID),
                Activity_Type_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name,
                Activity_Type_Icon: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Icon || '',
                Activity_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_ID),
                Activity_Unit_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name,
                // Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                // Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                Units: parseFloat(units),
                FromDate: datetime?.fromDate,
                ToDate: datetime?.toDate,
                };
                if (isUpdate()) {
                    await movesModel.updateActivity(params?.id, payload);
                } else {
                    let arrUpload_giao = []
                    let item = {...payload}
                    if (formatDate(item?.FromDate, "dd MM YYYY") != formatDate(item?.ToDate, "dd MM YYYY")) {  
                        
                        let timeline_FromDate = new Date(item?.FromDate.getTime() + 24*60*60*1000)
                        timeline_FromDate.setHours(0)
                        timeline_FromDate.setMinutes(0)
                        timeline_FromDate.setSeconds(0)
                        timeline_FromDate.setMilliseconds(0)

                        arrUpload_giao.push({
                            Activity_Type_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_ID),
                            Activity_Type_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name,
                            Activity_Type_Icon: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Icon || '',
                            Activity_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_ID),
                            Activity_Unit_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name,
                            Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                            Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                            Units: Math.round((timeline_FromDate.getTime() - new Date(item?.FromDate).getTime()) / 60000),
                            FromDate: new Date(item?.FromDate).getTime(),
                            ToDate: timeline_FromDate.getTime(),
                        })

                        let timeLine_ToDate = new Date(item?.ToDate)
                        timeLine_ToDate.setHours(0)
                        timeLine_ToDate.setMinutes(0)
                        timeLine_ToDate.setSeconds(0)
                        timeLine_ToDate.setMilliseconds(0)

                        arrUpload_giao.push({
                            Activity_Type_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_ID),
                            Activity_Type_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name,
                            Activity_Type_Icon: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Icon || '',
                            Activity_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_ID),
                            Activity_Unit_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name,
                            Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                            Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                            Units: Math.round((new Date(item?.ToDate).getTime() - timeLine_ToDate.getTime()) / 60000),
                            FromDate: timeLine_ToDate.getTime(),
                            ToDate: new Date(item?.ToDate).getTime(),
                        })

                        let time_ToDate_Start_Date = (timeLine_ToDate.getTime() - timeline_FromDate.getTime()) / (24*60*60*1000)
            
                        if(time_ToDate_Start_Date > 0 ) {   
                            for(let i = 1; i <= time_ToDate_Start_Date; i++){
                                // arrUpload_giao.push({
                                //     "Activity_Start_Time": timeline_FromDate.getTime() + (i - 1)* 24*60*60*1000 ,
                                //     "Activity_End_Time": timeline_FromDate.getTime() + i* 24*60*60*1000,
                                //     "Activity_Type_Unit_ID": item?.Activity_Type_Unit_ID,
                                //     "Number_Units": Math.round(((timeline_FromDate.getTime() + i* 24*60*60*1000) - (timeline_FromDate.getTime() + (i - 1)* 24*60*60*1000)) / 60000)
                                // })
                                arrUpload_giao.push({
                                    Activity_Type_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_ID),
                                    Activity_Type_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name,
                                    Activity_Type_Icon: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Icon || '',
                                    Activity_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_ID),
                                    Activity_Unit_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name,
                                    Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                                    Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                                    Units: Math.round(((timeline_FromDate.getTime() + i* 24*60*60*1000) - (timeline_FromDate.getTime() + (i - 1)* 24*60*60*1000)) / 60000),
                                    FromDate: timeline_FromDate.getTime() + (i - 1)* 24*60*60*1000,
                                    ToDate: timeline_FromDate.getTime() + i* 24*60*60*1000,
                                })
                            }
                        }     
                    }else{
                        arrUpload_giao.push({
                            Activity_Type_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_ID),
                            Activity_Type_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name,
                            Activity_Type_Icon: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Icon || '',
                            Activity_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_ID),
                            Activity_Unit_Name: masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name,
                            Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                            Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                            Units: parseFloat(units),
                            FromDate: datetime?.fromDate,
                            ToDate: datetime?.toDate,
                        })
                    }

                    for(let i = 0; i < arrUpload_giao?.length ; i++){
                        await movesModel.addActivity(arrUpload_giao[i]);
                    }
                }
                goToPage('UploadActivityScreen')    
        }
    };

    const remove = async () => {
        await movesModel.removeActivity(params?.id);
        goToPage('UploadActivityScreen')
    };

    const topComponent = () => {
        return (
            <View style={{padding: 16}}>
                <Text style={styles.label}>activity type</Text>
       
                <SelectDropdown 
                    data={dataSelectActivity}
                    ref={dropdownRef}
                    onSelect={(selectedItem, index) => { 
                        let _selectedIndex = {...selectedIndex};
                        _selectedIndex['activity_type'] = {"row": index, "section": undefined};
                        _selectedIndex['unit_type'] = null;
                        setSelectedIndex(_selectedIndex);
                    }}
                    renderDropdownIcon={() => {
                        return (
                            <Ionicons name='chevron-down-outline' size={20} color={color.white}/>
                        )
                    }}
                    defaultButtonText={'select activity type'}
                    buttonStyle={{width: '100%', backgroundColor: color.tabbar,marginBottom: 10, height: 40}}
                    buttonTextStyle={{color: color.white}}
                    search={true}
                    renderCustomizedButtonChild={(selectedItem, index) => {
                    return (
                        <Text>{selectedItem}</Text>
                    )
                    }}
                    renderCustomizedRowChild={(selectedItem, index) => {
                        return (
                            <Text style={{color: color.black, textAlign: 'center', fontSize: 17}}>{selectedItem}</Text>
                        )
                    }}
                />

                <Text style={styles.label}>from</Text>
                <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
                    <View style={{width: '55%'}}>
                        <TouchableOpacity style={styles.inputDate} onPress={() => setChangeShow('fromDate', true)}>
                            <Text>{formatDate(datetime?.fromDate)}</Text>
                            <Ionicons name={'calendar-outline'} color="white" size={24}/>
                        </TouchableOpacity>
                        <DatePicker
                            minimumDate={lastUpload}
                            maximumDate={new Date()}
                            textColor={Platform?.OS == 'ios' ? color.white : color.black}
                            mode="date"
                            modal
                            open={isShow?.fromDate}
                            date={datetime?.fromDate}
                            onConfirm={(date) => {
                                setUnits('')
                                let _datetime = {...datetime};
                                _datetime['fromDate'] = date;
                                _datetime['toDate'] = date;
                                setDatetime(_datetime);
                                setChangeShow('fromDate', false);                             
                            }}
                            onCancel={() => {
                                setChangeShow('fromDate', false);
                            }}
                        />
                    </View>
                    <View style={{width: '45%'}}>
                        <TouchableOpacity style={styles.inputTime} onPress={() => setChangeShow('fromTime', true)}>
                            <Text>{formatDate(datetime?.fromDate, 'hh:mm')}</Text>
                            <Ionicons name={'time-outline'} color="white" size={24}/>
                        </TouchableOpacity>
                        <DatePicker
                            minimumDate={lastUpload}
                            maximumDate={new Date()}
                            textColor={Platform?.OS == 'ios' ? color.white : color.black}
                            mode="time"
                            modal
                            open={isShow?.fromTime}
                            date={datetime?.fromDate}
                            onConfirm={(date) => {
                                setChangeDatetime('fromDate', date);
                                setChangeShow('fromTime', false);
                            }}
                            onCancel={() => {
                                setChangeShow('fromTime', false);
                            }}
                        />
                    </View>
                </View>
                <Text style={styles.label}>to</Text>
                <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
                    <View style={{width: '55%'}}>
                        <TouchableOpacity style={[styles.inputDate]} onPress={() => setChangeShow('toDate', true)}>
                            <Text style={{}}>{formatDate(datetime?.toDate)}</Text>
                            <Ionicons name={'calendar-outline'} color={color.white} size={24}/>
                        </TouchableOpacity>
                        <DatePicker
                            minimumDate={lastUpload}
                            maximumDate={new Date()}
                            textColor={Platform?.OS == 'ios' ? color.white : color.black}
                            mode="date"
                            modal
                            open={isShow?.toDate}
                            date={datetime?.toDate}
                            onConfirm={(date) => {
                               setChangeShow('toDate', false);
                               setChangeDatetime('toDate', date);
                               calculateUnits(date)
                            }}
                            onCancel={() => {
                                setChangeShow('toDate', false);
                            }}
                        />
                    </View>
                    <View style={{width: '45%'}}>
                        <TouchableOpacity style={styles.inputTime} onPress={() => setChangeShow('toTime', true)}>
                            <Text>{formatDate(datetime?.toDate, 'hh:mm')}</Text>
                            <Ionicons name={'time-outline'} color="white" size={24}/>
                        </TouchableOpacity>
                        <DatePicker
                            minimumDate={lastUpload}
                            maximumDate={new Date()}
                            textColor={Platform?.OS == 'ios' ? color.white : color.black}
                            mode="time"
                            modal
                            open={isShow?.toTime}
                            date={datetime?.toDate}
                            onConfirm={(date) => {
                                setChangeDatetime('toDate', date);
                                setChangeShow('toTime', false);
                                calculateUnits(date)
                            }}
                            onCancel={() => {
                                setChangeShow('toTime', false);
                            }}
                        />
                    </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', height: 50}}>
                    <TextInput 
                       style={[styles.input, {width: '30%', color: color.white, height: 50, paddingLeft: 10}]}
                       value={units}
                       keyboardType='numeric'
                       onChangeText={(value) => {
                           setUnits(value)
                           setShowCalculate(false)
                        }}
                       onEndEditing={() => addMinutesToDate()
                       }
                    />
                    <Text style={{marginLeft: 16}}>Minutes</Text>
                </View>
            
                <View style={[styles.center, styles.mt16]}>
                    <MButton
                        onPress={() => Handlecalculate()}
                        style={styles.btnBlue}
                        styleText={styles.textWhite}
                        text={"Calculate"}/>    
                </View>
                {parseFloat(units) > 0 && selectedIndex?.activity_type && showCalculate ?
                <View style={[styles.center, styles.mt16]}>
                    <Text style={{marginBottom: 15}}>{units} minutes of {masterData?.ActivityType[selectedIndex?.activity_type?.row]?.Activity_Type_Name} at {parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate)} Move per minute = {parseFloat(units) * parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[0]?.ActivityTypeUnit?.Conversation_To_Moves_Rate)} Moves</Text>
                    <MButton
                        onPress={() => submit()}
                        style={styles.btnBlue}
                        styleText={styles.textWhite}
                        text={isUpdate() ? 'update' : 'add'}/>
                    {isUpdate() ?
                        <MButton
                            onPress={() => remove()}
                            style={styles.btnOrange}
                            styleText={styles.textWhite}
                            text='remove'/>
                        : null}
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
                    <Header
                        headerText='ADD INDIVIDUAL ACTIVITY ITEMS'
                        onLeftPress={async () => goToPage('UploadActivityScreen')}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'add-individual-activity-items-' + index + String(item)}
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
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        marginBottom: 16
    },
    label: {
        marginBottom: 8
    },
    mb16: {
        marginBottom: 16
    },
    mt16: {
        marginTop: 16
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputDate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 8,
        // borderWidth: 1,
        borderColor: color.white,
        // paddingHorizontal: 12,
        backgroundColor: color.tabbar,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 4
    },
    inputTime: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 8,
        // borderWidth: 1,
        // borderColor: color.white,
        // paddingHorizontal: 12,
        backgroundColor: color.tabbar,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 4
    },
    input: {
        // backgroundColor: color.primary,
        backgroundColor: color.tabbar,
        // marginBottom: 0,
        width: layout.width - 32
    }
});
