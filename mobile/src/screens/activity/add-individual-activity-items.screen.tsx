// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Header, MButton, Screen, Text, Input} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {IndexPath, Select, SelectItem} from "@ui-kitten/components";
import DatePicker from 'react-native-date-picker'
import {
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

    useEffect(() => {
        fetchMasterData();
    }, [isFocused, isRefresh]);
    const fetchMasterData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();
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

                let LastUpload = new Date(data?.LastUpload);
                setLastUpload(LastUpload);

                let _datetime = {...datetime};
                _datetime.fromDate = LastUpload
                _datetime.toDate = LastUpload
                setDatetime(_datetime);

                setMasterData(data);
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

        // let _datetime = {...datetime};
        // _datetime.fromDate = new Date();
        // _datetime.toDate = new Date();
        // setDatetime(_datetime);

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

    const checkSubmit = (activity) => {
        setSubmit(true);
        if (!selectedIndex?.activity_type) {
            showToast('error', 'activity type cannot be empty');
            return false;
        }
        if (!selectedIndex?.unit_type) {
            showToast('error', 'unit type cannot be empty');
            return false;
        }
        if (regexString(units)) {
            showToast('error', 'units cannot be empty');
            return false;
        }
        if (regexDecimal(units)) {
            showToast('error', 'units must be decimal');
            return false;
        }
        if (parseFloat(units) <= 0) {
            showToast('error', 'units must be greater than 0');
            return false;
        }
        if (dateToTimestamp(datetime?.fromDate) >= dateToTimestamp(datetime?.toDate)) {
            showToast('error', 'start time must be less than end time');
            return false;
        }
        if (formatDate(datetime?.fromDate, "dd MM YYYY") != formatDate(datetime?.toDate, "dd MM YYYY")) {
            showToast('error', 'Start and end End date must be within one day');
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
                Activity_Type_Unit_ID: parseInt(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.ActivityTypeUnit?.Activity_Type_Unit_ID),
                Conversation_To_Moves_Rate: parseFloat(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.ActivityTypeUnit?.Conversation_To_Moves_Rate),
                Units: parseFloat(units),
                FromDate: datetime?.fromDate,
                ToDate: datetime?.toDate,
            };
            if (isUpdate()) {
                await movesModel.updateActivity(params?.id, payload);
            } else {
                await movesModel.addActivity(payload);
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
                <Select
                    placeholder='select activity type'
                    status={isSubmit && !selectedIndex?.activity_type ? 'danger' : 'primary'}
                    style={[styles.mb16]}
                    selectedIndex={selectedIndex?.activity_type}
                    value={displaySelect(masterData?.ActivityType, selectedIndex?.activity_type, 'Activity_Type_Name')}
                    onSelect={index => {
                        let _selectedIndex = {...selectedIndex};
                        _selectedIndex['activity_type'] = index;
                        _selectedIndex['unit_type'] = null;
                        setSelectedIndex(_selectedIndex);
                    }}>
                    {masterData?.ActivityType?.length && masterData?.ActivityType?.map((item, index) => {
                        return (
                            <SelectItem
                                key={'activity_type-' + item.toString() + index}
                                title={item?.Activity_Type_Name}
                            />
                        )
                    })}
                </Select>
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
                            mode="date"
                            modal
                            open={isShow?.fromDate}
                            date={datetime?.fromDate}
                            onConfirm={(date) => {
                                let _datetime = {...datetime};
                                _datetime['fromDate'] = date;
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
                        <TouchableOpacity style={[styles.inputDate, {borderColor: color.lightGrey}]} onPress={() => setChangeShow('toDate', true)}>
                            <Text style={{color: color.lightGrey}}>{formatDate(datetime?.toDate)}</Text>
                            <Ionicons name={'calendar-outline'} color={color.lightGrey} size={24}/>
                        </TouchableOpacity>
                        <DatePicker
                            minimumDate={lastUpload}
                            maximumDate={new Date()}
                            mode="date"
                            modal
                            open={isShow?.toDate}
                            date={datetime?.toDate}
                            onConfirm={(date) => {
                               setChangeShow('toDate', false);
                               setChangeDatetime('toDate', date);
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
                            // maximumDate={new Date()}
                            mode="time"
                            modal
                            open={isShow?.toTime}
                            date={datetime?.toDate}
                            onConfirm={(date) => {
                                setChangeDatetime('toDate', date);
                                setChangeShow('toTime', false);
                            }}
                            onCancel={() => {
                                setChangeShow('toTime', false);
                            }}
                        />
                    </View>
                </View>

                {selectedIndex?.activity_type ?
                    <View>
                        <Text style={styles.label}>unit type</Text>
                        <Select
                            placeholder='select unit type'
                            status={isSubmit && !selectedIndex?.unit_type ? 'danger' : 'primary'}
                            style={[styles.mb16]}
                            selectedIndex={selectedIndex?.unit_type}
                            value={displaySelect(masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit, selectedIndex?.unit_type, 'Activity_Unit_Name')}
                            onSelect={index => setChangeSelected('unit_type', index)}>
                            {masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit?.length
                            && masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit?.map((item, index) => {
                                return (
                                    <SelectItem
                                        key={'unit_type-' + item.toString() + index}
                                        title={item?.Activity_Unit_Name}
                                    />
                                )
                            })}
                        </Select>
                        {selectedIndex?.unit_type ?
                            <Text style={[styles.mb16]}>
                                {`conversation rate${
                                    selectedIndex?.unit_type ?
                                        ': ' + masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.ActivityTypeUnit?.Conversation_To_Moves_Rate
                                        + ' ' + masterData?.ActivityType[selectedIndex?.activity_type?.row]?.ActivityUnit[selectedIndex?.unit_type?.row]?.Activity_Unit_Name
                                        + '/moves'
                                        : ""}`}
                            </Text>
                            : null}
                    </View>
                    : null}

                <Text style={styles.label}>units</Text>
                <Input
                    style={[styles.mb16, styles.input]}
                    keyboardType='numeric'
                    placeholder=''
                    status={isSubmit && (regexString(units) || regexDecimal(units) || parseFloat(units) <= 0) ? 'danger' : 'none'}
                    value={units}
                    onChangeText={nextValue => {
                        let myArray = nextValue.split(".");
                        if (regexDecimal(nextValue) || (myArray.length && (myArray[1] == '0' || myArray[1] == '00'))) {
                            setUnits(nextValue);                   
                        } else {
                            let temp = Math.round(parseFloat(nextValue) * 100) / 100;
                            setUnits(temp?.toString())                        
                        }
                    }}
                />
                <View style={[styles.center, styles.mt16]}>
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
