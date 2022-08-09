import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle, Modal} from 'react-native';
import {BtnBack, Header, MButton, Screen, Text, DetailActivity} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getHouse, dateToTimestamp, formatDate, formatNumber, showToast, timestampToDate} from "../../services";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getViewActivity} from "./activity-service";
import {LineChart} from "react-native-chart-kit";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};


const chartConfig = {
    backgroundColor: color.tabbar,
    backgroundGradientFrom:color.tabbar,
    backgroundGradientTo: color.tabbar,
    color: (opacity = 1) => color.white,
    strokeWidth: 1,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
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

    const {refetch} = useQuery(FETCH_getViewActivity);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let _date: any = new Date();
                if (params && params?.date) {
                    _date = timestampToDate(params?.date, 'YYYY-MM-dd');
                    _date = new Date(_date);
                }
                setDate(_date);
                // console.log(_date);
                let {data: {getViewActivity: {Activity_Entry, message, messageCode}}} = await refetch({
                    "date": _date
                });
                setLoading(false);
                if (messageCode == 200) {
                    setListActivityEntry(Activity_Entry)
                    let dataActivity_entry = [];
                    dataActivity_entry = Activity_Entry?.filter(item => item?.Include_YN)
                    dataActivity_entry.sort((a,b) => {
                       return a?.Activity_End_Time - b?.Activity_End_Time
                    })
                    let _data = {
                        labels: [],
                        datasets: [
                            {
                                data: [],
                            }
                        ],
                    };
                    for(let i = 0; i < dataActivity_entry?.length ; i++ ){
                        let label = getHouse(dataActivity_entry[i]?.Activity_End_Time)

                        if(i % 2 == 0 || dataActivity_entry?.length <= 7){
                            _data.labels.push(label)
                        }else{
                            _data.labels.push('')
                        }
                        _data.datasets[0].data.push(dataActivity_entry[i]?.Moves_Arising)
                    }
                    setDataChart(_data)

                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
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

    const onRefresh = () => {
        setRefresh(true)
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = {...modalVisible};
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const ItemView = ({item, index}) => {
        return (
            <TouchableOpacity
                style={[styles.activityLog,
                    index == 0 ? {marginLeft: 16} : {}
                ]}>
                <View style={{zIndex: 1}}>
                    <Text style={{fontSize: 14}}>{item?.ActivityType?.Activity_Type_Name}</Text>
                    <Text style={{fontSize: 18}} fonts={'DemiBold'}>{formatNumber(item?.Moves_Arising)}</Text>
                    <Text style={{fontSize: 13}}>{item?.ActivityUnit?.Activity_Unit_Name}</Text>
                </View>
                {item?.Activity_Type_Icon ?
                    <Image style={{width: layout.width / 3, height: layout.width / 3, borderRadius: 16, position: 'absolute'}} source={{uri: item?.Activity_Type_Icon}}/>
                    : null}
            </TouchableOpacity>
        )
    };

    // const topComponent2 = () => {
    //     return (
    //         <TouchableOpacity
    //             onPress={() => goToPage('UploadActivityScreen')}
    //             style={[styles.activityLog, {marginLeft: 16, backgroundColor: color.tabbar, borderWidth: 1, borderColor: color.blue, marginRight: 0}]}>
    //             <View style={{zIndex: 1}}>
    //                 <View style={{justifyContent: 'center', alignItems: 'center', width: layout.width / 3 - 32}}>
    //                     <Ionicons name={'add-outline'} color="white" size={32}/>
    //                 </View>
    //                 <Text style={{textAlign: 'center', fontSize: 13}}>add manual moves</Text>
    //             </View>
    //         </TouchableOpacity>
    //     )
    // };

    const topComponent_modal = () => {
        return (
          <View>
            <TouchableOpacity
                onPress={() => setChangeModal('detail', false)}
                style={{flexDirection: 'row', position:'absolute'}}>
                <Ionicons
                    name='return-up-back-outline'
                    color={color.green}
                    size={20}/>
                <Text style={styles.backText}>back</Text>
            </TouchableOpacity>
            <View style={styles.modalHeader}>
                <Text fonts={'DemiBold'} style={{textAlign: 'center', fontSize: 15}}>Details Activity</Text>
            </View>
          </View>

        )
    }

    const topComponent = () => {
        let totalMoves = 0;
        for (let i = 0; i < listActivityEntry.length; i++) {
            totalMoves += listActivityEntry[i]?.Include_YN ? listActivityEntry[i]?.Moves_Arising : 0
        }
        return (
            <View style={styles.container}>
                <BtnBack title={formatDate(date) == formatDate(new Date) ? "MY MOVES TODAY": formatDate(date, 'dd MM YYYY')} goBack={goBack}/>
                <TouchableOpacity style={styles.calendar} onPress={() => {
                    navigation.navigate('MainScreen', {
                        screen: 'CalendarActivityScreen',
                        params: {
                            date: dateToTimestamp(date)
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
                <TouchableOpacity style={styles.banner}>

                    {dataChart?.labels?.length ? (
                        <LineChart
                        style={{marginLeft: -32}}
                        // withVerticalLabels={false}
                        withHorizontalLabels={false}
                        fromZero={true}
                        withInnerLines={false}
                        withShadow={false}
                        withOuterLines={false}

                        data={dataChart}
                        width={layout.width}
                        height={layout.width * 4.5 / 10}
                        chartConfig={chartConfig}
                        bezier
                    />

                    ) : null}
                    {/* <Text style={{zIndex: 1}}>{formatDate(date) == formatDate(new Date) ? "today activity": formatDate(date, 'dd MM YYYY') + " activity"} </Text> */}
                </TouchableOpacity>
                {listActivityEntry?.length ?
                    <View style={{alignItems: 'center'}}>
                        <MButton
                            onPress={() => setChangeModal('detail', true)}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text={'view detail'}/>
                    </View>
                    : null}
                <View style={{alignItems: 'center'}}>
                    <MButton
                        onPress={() => goToPage('UploadActivityScreen')}
                        style={styles.btnOrange}
                        styleText={styles.textWhite}
                        text={'submit activity'}/>
                </View>
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

                                <FlatList
                                  showsVerticalScrollIndicator={false}
                                  showsHorizontalScrollIndicator={false}
                                  style={{flex: 1}}
                                  renderItem={({item,index}) =>  <DetailActivity item={item} />}
                                  data={listActivityEntry}
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
    banner: {
        minHeight: layout.width * 4.5 / 10,
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
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 16
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
});
