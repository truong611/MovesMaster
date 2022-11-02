import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    View,
    ViewStyle,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
    ScrollView,
    RefreshControl,
    Platform
} from 'react-native';
import {Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {color} from '../../theme';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {formatNumber, numberFormat, replaceHTTP, showToast, StatusBarHeight, stripHtml} from "../../services";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getListCampaignMobile} from "./donate-service";
import {useStores} from "../../models";
import {Donate} from "../../components/donate/donate";

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const layout = Dimensions.get('window');

export const DonateScreen = observer(function DonateScreen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [listData, setListData] = useState<any>([]);
    const [isRefresh, setRefresh] = useState(false);
    const [tabIndex, setTabIndex] = useState('favourite');
    // const [donateInfo, setDonateInfo] = useState({
    //     donatedMoves: 0,
    //     amountDonated: 0,
    //     movesAvailable: 0,
    // });
    const isFocused = useIsFocused();
    // const {movesModel} = useStores();

    const {refetch} = useQuery(FETCH_getListCampaignMobile);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh, tabIndex]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            // let _donation = await movesModel.getDonateInfo();
            // setDonateInfo({
            //     donatedMoves: _donation?.donatedMoves,
            //     amountDonated: _donation?.amountDonated,
            //     movesAvailable: _donation?.movesAvailable
            // });

            setLoading(true);
            try {
                let {data: {getListCampaignMobile: {Campaign, Appeal, Charity, message, messageCode}}} = await refetch({
                    "type": tabIndex
                });
                setLoading(false);
                if (messageCode == 200) {                 
                    let Campaign_check : any[] = [];
                    Campaign.map((item,index) => {
                        let check = true
                        for(let i = 0; i < Campaign_check?.length ; i++){
                            if(Campaign_check[i].Campaign_ID == item.Campaign_ID){
                                check = false
                            }
                        }
                        if(check) Campaign_check.push(item)
                    })         
                    let _Campaign: any[] = [];
                    _Campaign = Campaign_check.map((item) =>
                        Object.assign({
                            id: item?.Campaign_ID,
                            name: item?.Campaign_Name,
                            icon: item?.Campaign_Icon ? item?.Campaign_Icon : item?.Appeal_Icon ? item?.Appeal_Icon : item?.Charity_icon,
                            date: item?.Campaign_Launch_Date,
                            per: item?.Campaign_Price_Per_Move,
                            type: 'campaign',
                            detail: item
                        }, item)
                    );          
                    
                    let _Appeal: any[] = [];
                    _Appeal = Appeal.map((item) =>
                        Object.assign({
                            id: item?.Appeal_ID,
                            name: item?.Appeal_Name,
                            icon: item?.Appeal_Icon ? item?.Appeal_Icon : item?.Charity_icon,
                            date: item?.Appeal_Start_Date,
                            type: 'appeal',
                            detail: item
                        }, item)
                    );

                    let _Charity: any[] = [];
                    _Charity = Charity.map((item) =>
                        Object.assign({
                            id: item?.Moves_Charity_ID,
                            name: item?.Charity_Name,
                            icon: item?.Charity_icon,
                            date: item?.Created_Date,
                            type: 'charity',
                            detail: item
                        }, item)
                    );

                    let _listData = [..._Campaign, ..._Appeal, ..._Charity];
                    _listData.sort(function (a, b) {
                        // @ts-ignore
                        return new Date(b.date) - new Date(a.date);
                    });
                    setListData(_listData)
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const goToSearchDonate4Screen = (item) => {
        navigation.navigate('MainScreen', {
            screen: 'SearchDonate4Screen',
            params: {
                list: [],
                data: null,
                detail: item,
                type: item?.type,
                screen: 'DonateScreen'
            },
        });
    };

    const topComponent = () => {
        return (
            <View style={styles.topWrapper}>
                <Donate title={'DONATIONS'}/>
                <View style={styles.itemTabWrapper}>
                    <TouchableOpacity
                        style={[styles.itemTab, tabIndex == 'favourite' ? styles.itemTabActive : {}]}
                        onPress={() => setTabIndex('favourite')}>
                        <Text>favourite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.itemTab, tabIndex == 'all' ? styles.itemTabActive : {}]}
                        onPress={() => setTabIndex('all')}>
                        <Text>trending</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const ItemView = ({item, index}) => {          
        return (
            <TouchableOpacity
                style={[{width: '100%', marginVertical: 8,marginLeft: 10},
                    index == 0 || index == 1 ? {marginTop: 16} : {},
                    index == listData.length - 1 || index == listData.length - 2 ? {marginBottom: 10} : {},
                ]}
                onPress={() => {
                    // console.log(item)
                    goToSearchDonate4Screen(item)
                }}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{width: layout.width / 2.5, height: (layout.width / 2.5) * 2 / 3, marginBottom: 8, borderRadius: 16, backgroundColor: color.primary}}>
                        {item?.icon?
                            <Image resizeMode={"contain"} style={{width: layout.width / 2.5, height: (layout.width / 2.5) * 2 / 3, marginBottom: 8, borderRadius: 16, backgroundColor: color.primary, overlayColor: color.tabbar }} source={{uri: replaceHTTP(item?.icon)}}/>
                            :null}
                    </View>
                    <View style={{marginLeft: 10,justifyContent: 'center'}}>
                        <Text numberOfLines={2} style={{textAlign: 'center', width: layout.width / 2.5, fontSize: 14}}>{item?.name}</Text>
                        {item?.type == 'campaign' ?
                        <Text style={{fontSize: 13, color: color.danger, textAlign: 'center',}}>£ {numberFormat(parseFloat(item?.per))} per move</Text>
                        : null}
                    </View>
                </View>
            </TouchableOpacity>     
        );
    };

    const footerComponent = () => {
        return (
            <View style={Platform.OS == 'ios' ? {marginBottom: 76} : {marginBottom: 56}}>
                <Text style={[{textAlign: 'center'},
                    listData.length ? {marginVertical: 8} : {marginBottom: 8}
                ]}>OR</Text>
                <View style={{alignItems: 'center'}}>
                    <MButton
                        onPress={() => goToPage('SearchDonateScreen')}
                        style={styles.btnDanger}
                        styleText={styles.textWhite}
                        text={'search'}/>
                </View>
            </View>
        );
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={[ROOT, {marginTop: 0 - StatusBarHeight}]} preset="fixed">
                <View style={{flex: 1}}>
                    <Header headerText='LOGO'/>
                    {topComponent()}
                    <ScrollView nestedScrollEnabled={true} style={{width: "100%"}}
                                showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        {listData?.length ?
                            <View style={{backgroundColor: color.tabbar, marginHorizontal: 16, borderRadius: 16}}>
                                {/* <ScrollView horizontal={true} scrollEnabled={false} style={{width: '100%'}} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> */}
                                    <FlatList
                                        style={{width: layout.width - 32}}
                                        renderItem={ItemView}
                                        data={listData}
                                        keyExtractor={(item, index) => 'donate-' + index + String(item)}
                                    />
                                {/* </ScrollView> */}
                            </View>
                            : footerComponent()}                         
                    </ScrollView>
                    {listData?.length ?
                        footerComponent()
                        : null}
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
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
    topWrapper: {
        paddingTop: 16,
    },
    itemTabWrapper: {
        flexDirection: 'row',
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        // marginVertical: 16,
        borderRadius: 24,
        marginBottom: 12
    },
    itemTab: {
        width: (layout.width - 16 * 2) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemTabActive: {
        borderRadius: 24,
        backgroundColor: color.danger
    },
    itemView: {
        marginBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    newsImageWrapper: {
        width: layout.width / 4,
        height: (layout.width / 4) * 2 / 3,
        borderRadius: 16,
        // backgroundColor: color.lightGrey,
        marginRight: 8
    },
    newsImage: {
        width: layout.width / 4,
        height: (layout.width / 4) * 2 / 3,
        borderRadius: 16,
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
    appsWrapper: {
        backgroundColor: color.tabbar,
        // marginTop: 16,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 12,
        paddingBottom: 8,
        marginBottom: 12
    },
    donationsWrapper: {
        // flex: 1,
        flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4,
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
        // flex: 1,
        // height: '100%'
    },
    donationsText: {
        textAlign: 'center'
    },
    donationsValue: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 8,
        color: color.danger
    },
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 2,
    },
    btnWarning: {
        backgroundColor: color.warning,
        maxWidth: layout.width / 2,
    },
    input: {
        backgroundColor: color.tabbar,
        width: layout.width - 32
    },
    mb16: {
        marginBottom: 16
    },
    label: {
        marginBottom: 8
    },
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
});
