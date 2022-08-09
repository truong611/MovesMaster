import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {BtnBack, Header, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {
    dateToTimestamp,
    formatNumber,
    timestampToDate,
    showToast,
    getDayOfWeek,
    getDay,
    getRandomColor,
    formatDate
} from "../../services";
import {LineChart} from "react-native-chart-kit";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getOverViewActivity} from "./activity-service";
import {ScrollView} from 'react-native-gesture-handler';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const OverviewActivityScreen = observer(function OverviewActivityScreen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [date, setDate] = useState<any>(null);
    const isFocused = useIsFocused();
    const {params}: any = useRoute();
    const [tabIndex, setTabIndex] = useState('week');
    const [dataOverView, setDataOverView] = useState<any>(null);
    const [activitys, setActivity] = useState<any>([]);
    const [arrColor, setArrColor] = useState<any>([]);


    const {refetch} = useQuery(FETCH_getOverViewActivity);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh, tabIndex]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            let _date: any = timestampToDate(params?.date, 'YYYY-MM-dd');
            _date = new Date(_date);
            setDate(_date);

            setLoading(true);
            try {
                let {data: {getOverviewActivity: {data, message, messageCode}}} = await refetch({
                    "date": _date,
                    'type': tabIndex
                });
                setLoading(false);
                if (messageCode == 200) {
                    let _data = JSON.parse(data);
                    setDataOverView(_data);
                    let _label = [];
                    let _color = [];
                    for (let key of Object.keys(_data)) {
                        let item = _data[key];
                        for (let key1 of Object.keys(item.activity)) {
                            _label.push(key1)
                        }
                    }
                    _label = [...new Set(_label)];
                    for (let i = 0; i < _label.length; i++) {
                        switch (i) {
                            case 0:
                                _color.push('#e60049');
                                break;
                            case 1:
                                _color.push('#0bb4ff');
                                break;
                            case 2:
                                _color.push('#50e991');
                                break;
                            case 3:
                                _color.push('#e6d800');
                                break;
                            case 4:
                                _color.push('#9b19f5');
                                break;
                            case 5:
                                _color.push('#ffa300');
                                break;
                            case 6:
                                _color.push('#dc0ab4');
                                break;
                            case 7:
                                _color.push('#b3d4ff');
                                break;
                            case 8:
                                _color.push('#00bfa0');
                                break;
                            default:
                                _color.push(getRandomColor())
                        }
                    }
                    setActivity(_label);
                    setArrColor(_color)
                } else {
                    showToast('error', message)
                }
            } catch (error) {
                setLoading(false);
                showToast('error', error.message)
            }
        }
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const goBack = () => {
        navigation.navigate('MainScreen', {
            screen: 'CalendarActivityScreen',
            params: {
                date: dateToTimestamp(date)
            },
        });
    };

    const chartConfig = (rgba) => {
        return {
            backgroundGradientFrom: color.tabbar,
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: color.tabbar,
            backgroundGradientToOpacity: 0.5,
            color: (opacity = 1) => rgba,
            strokeWidth: 1,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
            fillShadowGradientFromOpacity: 0.3,
            fillShadowGradientToOpacity: 0.01,

            // labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            // style: {
            //     borderRadius: 16
            // },
            // propsForDots: {
            //     r: "6",
            //     strokeWidth: "2",
            //     stroke: "#ffa726"
            // }
        }
    };

    const getData = () => {
        let _data: any = {
            labels: [],
            datasets: [],
        };
        let j = 0;
        
        if (dataOverView) {
            for (let key of Object.keys(dataOverView)) {
              
                if (Object.keys(dataOverView)?.length <= 7 ||
                    (Object.keys(dataOverView)?.length <= 12 && j % 2 == 0) ||
                    (Object.keys(dataOverView)?.length > 12 && j % 4 == 0)) {
                    _data.labels.push(convertDataTime(key));
                } else {
                    _data.labels.push('');
                }
                j += 1;
            }
            for (let i = 0; i < activitys.length; i++) {
                _data.datasets.push(
                    {
                        data: [],
                        color: (opacity = 1) => arrColor[i]
                    }
                );
                for (let key of Object.keys(dataOverView)) {
                    _data.datasets[i]['data'].push(dataOverView[key].activity[activitys[i]] ? dataOverView[key].activity[activitys[i]] : 0);
                }
            }
        }
        return _data
    };

    const convertDataTime = (item) => {
        if (tabIndex == 'week') return getDayOfWeek(item);
        if (tabIndex == 'month') return getDay(new Date(item));
        if (tabIndex == 'year') return item
    };

    const topComponent = () => {
        return (
            <View style={styles.container}>
                <BtnBack title={'OVERVIEW'} goBack={goBack}/>
                <View>
                    <View style={styles.topWrapper}>
                        <View style={{paddingHorizontal: 16, marginBottom: 12}}>
                            <Text style={{fontSize: 15}} fonts={'DemiBold'}>MY MOVES</Text>
                        </View>
                        <View style={styles.itemTabWrapper}>
                            <TouchableOpacity
                                style={[styles.itemTab, tabIndex == 'week' ? styles.itemTabActive : {}]}
                                onPress={() => setTabIndex('week')}>
                                <Text>week</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.itemTab, tabIndex == 'month' ? styles.itemTabActive : {}]}
                                onPress={() => setTabIndex('month')}>
                                <Text>month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.itemTab, tabIndex == 'year' ? styles.itemTabActive : {}]}
                                onPress={() => setTabIndex('year')}>
                                <Text>year</Text>
                            </TouchableOpacity>
                        </View>
                        {dataOverView && !isLoading ?
                            <View>
                                <View style={{marginBottom: 16, height: 220}}>
                                    <LineChart
                                        style={{marginLeft: -40, position: 'absolute', zIndex: 1}}
                                        withHorizontalLabels={false}
                                        fromZero={true}
                                        withShadow={true}
                                        withInnerLines={false}
                                        withOuterLines={false}
                                        data={getData()}
                                        width={layout.width}
                                        height={220}
                                        chartConfig={chartConfig(color.white)}
                                        bezier
                                    />
                                </View>
                                <View style={{marginHorizontal: 16, marginBottom: 16}}>
                                    <Text style={{marginBottom: 12, textAlign: 'center'}} fonts={'DemiBold'}>
                                    {
                                         tabIndex == 'month' ||  tabIndex == 'week' ? 'daily average' : 'month average'
                                    }
                                    </Text>
                                    <ScrollView horizontal={true}>
                                        <View>
                                            <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
                                                <View style={{width: layout.width / 5, backgroundColor: color.primary, paddingVertical: 6}}><
                                                    Text style={{textAlign: 'center'}}>{
                                                    tabIndex == 'month' ||  tabIndex == 'week' ? 'day' : 'month'   
                                                }</Text>
                                                </View>
                                                {activitys?.length ?
                                                    activitys.map((item1, index1) => {
                                                        return (
                                                            <View key={item1.toString() + index1 + '1'} style={{width: layout.width / 5, backgroundColor: color.primary, paddingVertical: 6}}>
                                                                <Text style={{textAlign: 'center', color: arrColor[index1]}}>{item1}</Text>
                                                            </View>
                                                        )
                                                    })
                                                    : null}
                                            </View>
                                            {dataOverView && Object.keys(dataOverView)?.length ?
                                                Object.keys(dataOverView).map((item, index) => {
                                                    return (
                                                        <View key={item.toString() + index} style={{marginTop: 16}}>
                                                            <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
                                                                <View style={[{width: layout.width / 5},
                                                                    index % 2 != 0 ? {backgroundColor: color.primary, paddingVertical: 6} : {}]}>
                                                                    <Text style={{textAlign: 'center'}}>{convertDataTime(item)}</Text>
                                                                </View>
                                                                {activitys?.length ?
                                                                    activitys.map((item1, index1) => {
                                                                        return (
                                                                            <View key={item1.toString() + index1}
                                                                                  style={[{width: layout.width / 5}, index % 2 != 0 ? {backgroundColor: color.primary, paddingVertical: 6} : {}]}>
                                                                                <Text style={{textAlign: 'center', color: arrColor[index1]}}>
                                                                                    {formatNumber(dataOverView[item]?.activity[item1] || '')}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    })
                                                                    : null}
                                                            </View>
                                                        </View>
                                                    )
                                                })
                                                : null}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                            : null}
                    </View>
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
                        keyExtractor={(item, index) => 'activity-overview-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingBottom: 16
    },
    topWrapper: {
        paddingTop: 16,
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden'
    },
    itemTabWrapper: {
        flexDirection: 'row',
        backgroundColor: color.primary,
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 24,
    },
    itemTab: {
        width: (layout.width - 32 * 2) / 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemTabActive: {
        borderRadius: 24,
        backgroundColor: color.green
    },
    itemView: {
        marginBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    newsImageWrapper: {
        width: layout.width / 3,
        height: (layout.width / 3) * 2 / 3,
        borderRadius: 16,
        marginRight: 12
    },
    newsImage: {
        width: layout.width / 3,
        height: (layout.width / 3) * 2 / 3,
        borderRadius: 16,
        backgroundColor: color.tabbar
    },
    newsTitle: {
        fontSize: 15,
        marginBottom: 6,
        width: layout.width - 16 * 2 - layout.width / 3 - 8
    },
    newsDescription: {
        width: layout.width - 16 * 2 - layout.width / 3 - 8,
        fontSize: 13
    },
    emptyWrapper: {
        flex: 1, justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
    emptyText: {
        color: color.palette.lightGrey,
    },
    flatlist_child: {
        flex: 1,
        marginBottom: 16,
        marginRight: 16
    },
    Items: {
        marginLeft: 15,
        alignItems: 'center'
    }
});
