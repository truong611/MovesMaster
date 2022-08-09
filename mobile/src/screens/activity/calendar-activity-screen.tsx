import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {BtnBack, Header, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    dateToTimestamp, formatDate,
    getDay,
    getDaysInMonth,
    timestampToDate
} from "../../services";
import DatePicker from "react-native-date-picker";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const CalendarActivityScreen = observer(function CalendarActivityScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [today, setToday] = useState(new Date());
    const [days, setDays] = useState<any>([]);
    const isFocused = useIsFocused();
    const {params}: any = useRoute();
    const [date, setDate] = useState<any>(null);
    const [date2, setDate2] = useState<any>(null);
    const [isShow, setShow] = useState<any>({
        date: false,
    });

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            let days = getDaysInMonth(params?.date);
            setDays(days);

            let _date: any = timestampToDate(params?.date, 'YYYY-MM-dd');
            _date = new Date(_date);
            setDate(_date);
            setDate2(_date);

            let _userInfo = await movesModel.getUserInfo();
            setUserInfo(_userInfo)
        }
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const goBack = async () => {
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 1,
        });
    };

    const changeMonth = (boolean) => {
        let current;
        if (boolean) {
            if (date2.getMonth() == 11) {
                current = new Date(date2.getFullYear() + 1, 0, 1);
            } else {
                current = new Date(date2.getFullYear(), date2.getMonth() + 1, 1);
            }
        } else {
            if (date2.getMonth() == 0) {
                current = new Date(date2.getFullYear() - 1, 11, 1);
            } else {
                current = new Date(date2.getFullYear(), date2.getMonth() - 1, 1);
            }
        }

        current.setHours(7, 0, 0);

        let _current = dateToTimestamp(current);
        let days = getDaysInMonth(_current);
        setDays(days);

        setDate2(current);
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const setChangeShow = (type, value) => {
        let _isShow = {...isShow};
        _isShow[type] = value;
        setShow(_isShow);
    };

    const goToDate = (date, screen = 'ViewActivityScreen') => {
        setChangeShow('date', false);
        let _date = new Date(date);
        _date.setHours(7, 0, 0);

        navigation.navigate('MainScreen', {
            screen: screen,
            params: {
                date: dateToTimestamp(_date)
            },
        });
    };

    const topComponent = () => {
        return (
            <View style={styles.container}>
                <BtnBack title="CALENDAR" goBack={() => goToDate(date)}/>
                <TouchableOpacity style={{position:'absolute', right: 16, paddingVertical: 8, top: 8}}
                    onPress={() => goToDate(date, 'OverviewActivityScreen')}>
                    <Text style={{color: color.blue}}>overview</Text>
                </TouchableOpacity>
                <Text style={{textAlign: 'center', marginBottom: 16, color: color.blue}}>
                    select a date to view your moves
                </Text>
                {days?.length ?
                    <View style={{flex: 1, backgroundColor: color.tabbar, marginHorizontal: 16, padding: 16, borderRadius: 16}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 4}}>
                            <TouchableOpacity style={{width: 42, height: 42, alignItems: 'center', justifyContent: 'center'}} onPress={() => changeMonth(false)}>
                                <Ionicons name={'chevron-back-outline'} color="white" size={24}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{paddingHorizontal: 16, height: 42, alignItems: 'center', justifyContent: 'center'}} onPress={() => setChangeShow('date', true)}>
                                <Text>{formatDate(date2, 'MM YYYY')}</Text>
                            </TouchableOpacity>
                            <DatePicker
                                minimumDate={userInfo?.createdDate ? new Date(userInfo?.createdDate) : new Date()}
                                maximumDate={new Date()}
                                mode="date"
                                modal
                                open={isShow?.date}
                                date={date}
                                onConfirm={(date) => goToDate(date)}
                                onCancel={() => {setChangeShow('date', false);}}
                            />
                            <TouchableOpacity style={{width: 42, height: 42, alignItems: 'center', justifyContent: 'center'}} onPress={() => changeMonth(true)}>
                                <Ionicons name={'chevron-forward-outline'} color="white" size={24}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap',}}>
                            {days.map((item, index) => {
                                return (
                                    <View key={'day-' + item?.toString() + index} style={[{width: '25%'}, {paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center'}]}>
                                        <TouchableOpacity style={[{borderWidth: 1, borderColor: color.blue, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 16},
                                            formatDate(today) == formatDate(item) ? {borderColor: color.green} : {},
                                            formatDate(date) == formatDate(item) ? {borderColor: color.warning} : {},
                                        ]} onPress={() => goToDate(item)}>
                                            <Text>{getDay(item)}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
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
                        keyExtractor={(item, index) => 'calendar-activity-' + index + String(item)}
                    />
                    {/* <TouchableOpacity style={{width: layout.width / 7, height: layout.width / 7, borderRadius: layout.width / 14, justifyContent: 'center', alignItems: 'center', backgroundColor: color.blue, position: 'absolute', bottom: 16, right: 16}} onPress={() => goToDate(new Date())}>
                        <Text style={{fontSize: 13}}>today</Text>
                    </TouchableOpacity> */}
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
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
    banner: {
        height: layout.width * 4.5 / 10,
        width: layout.width - 32,
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'flex-end',
        marginBottom: 16
    },
    activityLog: {
        width: layout.width / 3,
        height: layout.width / 3,
        borderRadius: 16,
        backgroundColor: color.primary,
        marginRight: 16,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 16
    },
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 3,
        position: 'absolute',
        right: 0,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    textWhite: {
        color: color.white
    },
});
