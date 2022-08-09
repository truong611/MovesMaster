import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Alert, Dimensions, FlatList, Image, Modal, StyleSheet, TouchableOpacity, View, ViewStyle, Linking, ScrollView} from 'react-native';
import {Badge, BtnBack, Button, Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {formatNumber, getDiffDate, getRemainDay, showToast, StatusBarHeight, timestampToDate} from "../../services";
import Slider from '@react-native-community/slider';
import {useStores} from "../../models";
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useMutation, useQuery} from "@apollo/react-hooks";
import {
    FETCH_favouriteMobile,
    FETCH_getDashboardReport,
    FETCH_getDetailAppeal,
    FETCH_getDetailCampaign,
    FETCH_storeDonate
} from "./donate-service";
import { toastConfig } from '../../../App';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import ViewShot, {captureRef} from "react-native-view-shot";
import Share from "react-native-share";
import {Donate} from "../../components/donate/donate";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const SearchDonate4Screen = observer(function SearchDonate4Screen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [number, setNumber] = useState(0);
    const [donateInfo, setDonateInfo] = useState({
        donatedMoves: 0,
        amountDonated: 0,
        movesAvailable: 0,
    });
    const {params}: any = useRoute();
    const {movesModel} = useStores();
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    const [badgeAwarded, setBadgeAwarded] = useState<any>([]);
    const [modalVisible, setModalVisible] = useState<any>({
        viewInfo: false,
        success: false
    });
    const viewRef = useRef();

    const [favouriteMobile, {}] = useMutation(FETCH_favouriteMobile);
    const [storeDonate, {}] = useMutation(FETCH_storeDonate);

    let query: any;

    switch(params?.type) {
        case 'charity':
            query = useQuery(FETCH_getDashboardReport);
            break;
        case 'appeal':
            query = useQuery(FETCH_getDetailAppeal);
            break;
        case 'campaign':
            query = useQuery(FETCH_getDetailCampaign);
            break;
        default:
    }

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();

            let _donation = await movesModel.getDonateInfo();
            setDonateInfo({
                donatedMoves: _donation?.donatedMoves,
                amountDonated: _donation?.amountDonated,
                movesAvailable: _donation?.movesAvailable
            });
            // setNumber(_donation?.movesAvailable / 2);
            switch (params?.type) {
                case 'charity':
                    if (query?.refetch) {
                        setLoading(true);
                        try {
                            let {data: {getDashboardReport}} = await query?.refetch({
                                "type": 4,
                                "objectId": parseInt(params?.detail?.Moves_Charity_ID),
                            });
                            setLoading(false);
                            if (getDashboardReport?.messageCode == 200) {
                                console.log("Check charity: ", params?.detail);
                                
                                let _data = {...data};
                                _data.id = params?.detail?.Moves_Charity_ID;
                                _data.name = params?.detail?.Charity_Name;
                                _data.icon = params?.detail?.Charity_icon || '';
                                _data.description = params?.detail?.Charity_Aims;
                                _data.createdDate = params?.detail?.Created_Date ? timestampToDate(params?.detail?.Created_Date) : '';
                                _data.status = params?.detail?.Is_Active || false;
                                _data.url = params?.detail?.Charity_URL

                                _data.TotalAppeal = getDashboardReport?.TotalAppeal || 0;
                                _data.TotalCampaign = getDashboardReport?.TotalCampaign || 0;
                                _data.TotalDonation = getDashboardReport?.TotalDonation || 0;
                                _data.isFavourite = getDashboardReport?.isFavourite || false;

                                setData(_data);
                            } else {
                                showToast('error', getDashboardReport?.message)
                            }
                        } catch (e) {
                            setLoading(false);
                            showToast('error', e?.message)
                        }
                    }
                    break;
                case 'appeal':
                    if (query?.refetch) {
                        setLoading(true);
                        try {
                            let {data: {getDetailAppeal}} = await query?.refetch({
                                "appealId": parseInt(params?.detail?.Appeal_ID),
                            });
                            setLoading(false);
                            if (getDetailAppeal?.messageCode == 200) {
                                console.log("CHekc appeal: ", getDetailAppeal?.Appeal );
                                
                                let _data = {...data};
                                _data.id = getDetailAppeal?.Appeal?.Appeal_ID;
                                _data.name = getDetailAppeal?.Appeal?.Appeal_Name;
                                _data.icon = getDetailAppeal?.Appeal?.Appeal_Icon;
                                _data.description = getDetailAppeal?.Appeal?.Appeal_Description;
                                _data.status = getDetailAppeal?.Appeal?.Appeal_Status_Name;
                                _data.url = getDetailAppeal?.Appeal?.Appeal_URL

                                _data.Appeal_Target_Amount = getDetailAppeal?.Appeal?.Appeal_Target_Amount || 0;
                                _data.Launch_Date = getDetailAppeal?.Appeal?.Appeal_Start_Date ? timestampToDate(getDetailAppeal?.Appeal?.Appeal_Start_Date) : '';
                                _data.Amount_Date = getDetailAppeal?.Appeal?.Appeal_Start_Date ? getDiffDate(getDetailAppeal?.Appeal?.Appeal_Start_Date, new Date()) : '';
                                _data.TotalCampaign = getDetailAppeal?.Appeal?.TotalCampaign || 0;
                                _data.Amount_Raised = getDetailAppeal?.Appeal?.Amount_Raised || 0;
                                _data.percent = _data.Appeal_Target_Amount ? parseFloat((_data.Amount_Raised * 100 / _data.Appeal_Target_Amount)?.toFixed(2)) : 0;
                                _data.isFavourite = getDetailAppeal?.isFavourite || false;

                                setData(_data);
                            } else {
                                showToast('error', getDetailAppeal?.message)
                            }
                        } catch (e) {
                            setLoading(false);
                            showToast('error', e?.message)
                        }
                    }
                    break;
                case 'campaign':
                    if (query?.refetch) {
                        setLoading(true);
                        try {
                            // console.log(params?.detail?.Campaign_ID)
                            let {data: {getDetailCampaign}} = await query?.refetch({
                                "campaignId": parseInt(params?.detail?.Campaign_ID),
                            });
                            setLoading(false);
                            if (getDetailCampaign?.messageCode == 200) {
                                console.log("check campain: ", getDetailCampaign?.Campaign);
                                
                                let _data = {...data};
                                _data.id = getDetailCampaign?.Campaign?.Campaign_ID;
                                _data.name = getDetailCampaign?.Campaign?.Campaign_Name;
                                _data.icon = getDetailCampaign?.Campaign?.Campaign_Icon;
                                _data.description = getDetailCampaign?.Campaign?.Campaign_Description;
                                _data.status = getDetailCampaign?.Campaign?.Campaign_Status_Name;
                                _data.url = getDetailCampaign?.Campaign?.Campaign_URL;


                                _data.Charity_Appeal_Icon = getCharityAppealIcon(getDetailCampaign);
                                _data.Company_Icon = getCompanyIcon(getDetailCampaign);
                                _data.Launch_Date = getDetailCampaign?.Campaign?.Campaign_Launch_Date ? timestampToDate(getDetailCampaign?.Campaign?.Campaign_Launch_Date) : '';
                                _data.Amount_Date = getDetailCampaign?.Campaign?.Campaign_Launch_Date ? getDiffDate(getDetailCampaign?.Campaign?.Campaign_Launch_Date, new Date()) : '';
                                _data.End_Date_Target = getDetailCampaign?.Campaign?.End_Date_Target;
                                _data.Campaign_Target_Value = getDetailCampaign?.Campaign?.Campaign_Target_Value || 0;
                                _data.Campaign_Price_Per_Move = getDetailCampaign?.Campaign?.Campaign_Price_Per_Move || 0;
                                _data.Contract_Move = _data.Campaign_Price_Per_Move ? parseFloat((_data.Campaign_Target_Value / _data.Campaign_Price_Per_Move).toFixed(2)) : "";
                                _data.Number_Matches = getDetailCampaign?.Campaign?.Number_Matches || 0;
                                _data.Progress_Donations = getDetailCampaign?.Campaign?.Progress_Donations || 0;
                                _data.Progress_Moves = getDetailCampaign?.Campaign?.Progress_Moves || 0;
                                _data.Amount_Raised = getDetailCampaign?.Campaign?.Amount_Raised || 0;
                                _data.Sterling_Amount = getDetailCampaign?.Campaign?.Sterling_Amount || 0;
                                _data.Progress_Line4 = getProgressLine4(getDetailCampaign?.Campaign);
                                _data.isFavourite = getDetailCampaign?.isFavourite || false;
                                _data.movesNeedDonate = (_data?.Campaign_Target_Value / _data?.Campaign_Price_Per_Move) - _data?.Progress_Moves;
                                setData(_data);
                            } else {
                                showToast('error', getDetailCampaign?.message)
                            }
                        } catch (e) {
                            setLoading(false);
                            showToast('error', e?.message)
                        }
                    }
                    break;
                default:
            }
        }
    };

    const resetData = () => {
        setNumber(0);
        setBadgeAwarded([])
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = {...modalVisible};
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const openUrlBrowser = async (url) => {
        if(url){
           await Linking.openURL(url)
        } 
    }
    const goBack = async () => {
        switch (params?.screen) {
            case 'DonateScreen':
                navigation.navigate('HomeScreen');
                await movesModel.setAppInfo({
                    tabIndex: 0,
                });
                break;
            case 'SearchDonate3Screen':
                navigation.navigate('MainScreen', {
                    screen: params?.screen,
                    params: {
                        list: params?.list,
                        data: params?.data,
                    },
                });
                break;
            default:
        }
    };

    const viewInfo = async () => {
        setChangeModal('viewInfo', true);
    };

    const getProgressLine4 = (campaign) => {
        if (!campaign?.End_Date_Target) {
            if (campaign?.Campaign_Target_Value) {
                let percent = parseFloat((campaign?.Sterling_Amount * 100 / campaign?.Campaign_Target_Value).toFixed(2))
                return percent + '% Funded';
            }
            return '0% Funded';
        } else {
            return getRemainDay(campaign?.Campaign_Launch_Date, campaign?.Campaign_End_Date)
        }
    };

    const getCharityAppealIcon = (data) => {
        let appeal = data?.ListAppeal.find(x => x.Appeal_ID == data?.Campaign?.Appeal_ID);
        if (appeal) {
            return appeal?.Appeal_Icon
        }
        return data?.Campaign?.Charity_icon
    };

    const getCompanyIcon = (data) => {
        let company = data?.ListCompany.find(x => x.Moves_Company_ID == data?.Campaign?.Moves_Company_ID);
        if (company) {
            return company?.Company_Icon
        }
        return '';
    };

    const getBadgeAwarded = () => {
        let badge = '';
        for (let i = 0; i < badgeAwarded?.length; i++) {
            badge += (i != 0 ? ', ' : '') + badgeAwarded[i]?.Badge?.Badge_Name
        }
        return badge
    };

    const donate = async () => {
        setLoading(true);
        try {
            let payload = {
                "bodyData": {
                    "Sterling_Amount": null,
                    "Amount_Donated": null,
                    "Moves_Donated": number,
                    "Moves_Conversion_Rate": params?.type == 'campaign' ? data?.Campaign_Price_Per_Move : null,
                    "Appeal_ID": params?.type == 'appeal' ? data?.id : null,
                    "Moves_Charity_ID": params?.type == 'charity' ? data?.id : null,
                    "Campaign_ID": params?.type == 'campaign' ? data?.id : null,
                    "type": params?.type
                }
            };
            // console.log(payload);
            let {data: {storeDonate: {Donated_Moves, Amount_Donated, Moves_Avaiable, Badge_Awarded, messageCode, message}}} = await storeDonate({
                variables: payload
            });
            setLoading(false);
            if (messageCode == 200) {
                await movesModel.setDonateInfo({
                    donatedMoves: Donated_Moves,
                    amountDonated: Amount_Donated,
                    movesAvailable: Moves_Avaiable,
                });
                setBadgeAwarded(Badge_Awarded);
                // console.log(Badge_Awarded);
                setChangeModal('success', true);
            } else {
                showToast('error', message)
            }
        } catch (e) {
            setLoading(false);
            showToast('error', e.message)
        }
    };

    const favourite = async () => {
        setLoading(true);
        try {
            let {data: {favouriteMobile: {messageCode, message}}} = await favouriteMobile({
                variables: {
                    "type": params?.type,
                    "id": data?.id
                },
            });
            setLoading(false);
            if (messageCode == 200) {
                let _data = {...data};
                _data.isFavourite = !_data.isFavourite;
                setData(_data);
                showToast('success', _data.isFavourite ? 'added to favourites!' : "removed to favourites!")
            } else {
                showToast('error', message)
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

    const topComponent = () => {
        return (
            <View>
                <BtnBack title={"Donate " + params?.type} goBack={goBack}/>
                <Donate title={'DONATIONS'} isRefresh={isRefresh}/>
                <View style={{paddingHorizontal: 16,}}>
                    <View style={{flexDirection: 'row', marginBottom: 16}}>
                        <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8, marginRight: 16, backgroundColor: color.tabbar}}>
                            {data?.icon?
                                <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8, marginRight: 16, backgroundColor: color.tabbar}} source={{uri: data?.icon}}/>
                                :null}
                        </View>
                        <View style={{justifyContent: "center",}}>
                            <Text style={{fontSize: 15, marginBottom: 8, textAlign: 'center', width: layout.width - 32 - (layout.width / 3) - 16}} numberOfLines={2} fonts={'DemiBold'}>{data?.name}
                            </Text>
                            <View style={{alignItems: 'center'}}>
                                <MButton
                                    onPress={() => viewInfo()}
                                    style={[styles.btnOrange, {maxWidth: layout.width - 32 - (layout.width / 3) - 16 - 32, marginBottom: 0}]}
                                    styleText={styles.textWhite}
                                    text={'view info'}/>
                            </View>
                        </View>
                    </View>
                    {data?.status=='Live' || data?.status==true ?
                        <View>
                            {params?.type != 'campaign' ?
                                <Text style={{marginBottom: 16, textAlign: 'center'}}>
                                    You are donating to a
                                    <Text style={{textTransform: 'capitalize'}}> {params?.type}</Text>.
                                    You can donate your Moves and they may be purchased in future under a Campaign
                                </Text> :
                                <Text style={{marginBottom: 16, textAlign: 'center'}}>
                                    {!data?.End_Date_Target ?
                                        <Text>
                                            <Text style={{fontSize: 15}} fonts={'DemiBold'}> {formatNumber(data?.movesNeedDonate)} </Text>
                                            Moves available at
                                        </Text>
                                        : null}
                                    <Text style={{fontSize: 15}} fonts={'DemiBold'}> {data?.Campaign_Price_Per_Move} </Text>
                                    per Move
                                </Text>
                            }
                            <Text style={{marginBottom: 32, textAlign: 'center'}}>
                                Please select the number of moves you would like to donate
                            </Text>
                            <Text style={{textAlign: 'center', fontSize: 18,}} fonts={'DemiBold'}>{number}</Text>
                            <Slider
                                style={{width: layout.width - 32, height: 56}}
                                minimumValue={0}
                                value={number}
                                maximumValue={!data?.End_Date_Target && (data?.movesNeedDonate < donateInfo?.movesAvailable) ? data?.movesNeedDonate : donateInfo?.movesAvailable}
                                minimumTrackTintColor={color.danger}
                                maximumTrackTintColor="#8f256e"
                                onValueChange={(number) => {
                                    setNumber(parseFloat(number?.toFixed(2)))
                                }}
                            />
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: -10}}>
                                <Text style={{color: color.orange, fontSize: 16}}>0</Text>
                                <Text style={{color: color.orange, fontSize: 16}}>{!data?.End_Date_Target && (data?.movesNeedDonate < donateInfo?.movesAvailable) ? parseFloat(data?.movesNeedDonate?.toFixed(2)) : parseFloat(donateInfo?.movesAvailable?.toFixed(2))}</Text>
                            </View>
                            <View style={{alignItems: 'center',}}>
                                <MButton
                                    onPress={() => {
                                        if(number > 0) {
                                            Alert.alert(
                                                "Confirm",
                                                "Are you sure to donate " + number + ' move',
                                                [
                                                    {
                                                        text: "Cancel",
                                                        onPress: () => console.log("Cancel Pressed"),
                                                        style: "cancel"
                                                    },
                                                    { text: "OK", onPress: () => donate() }
                                                ]
                                            );
                                        } else {
                                            showToast('error', 'donation move must be greater than 0')
                                        }

                                    }}
                                    style={styles.btnDanger}
                                    styleText={styles.textWhite}
                                    text={'donate'}/>
                            </View>
                            {params?.type != 'campaign' ?
                                <View>
                                    <Text style={{textAlign: 'center', marginBottom: 12, marginTop: -6}}>or</Text>
                                    <View style={{alignItems: 'center',}}>
                                        <MButton
                                            style={[styles.btnOrange, {maxWidth: layout.width * 2 / 3,}]}
                                            styleText={styles.textWhite}
                                            text={'make a personal donation'}/>
                                    </View>
                                </View>
                                : null}
                        </View>
                    :null}
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
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'search-donate-4-' + index + String(item)}
                    />
                </View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.viewInfo}
                    onRequestClose={() => {
                    }}
                >
                    <View style={styles.centeredView}>
                        <>
                            {isLoading && <CenterSpinner/>}
                            <View style={styles.modalView}>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    style={{flex: 1}}
                                    renderItem={null}
                                    data={[]}
                                    ListHeaderComponent={() => {
                                        return (
                                            <View>
                                                <View style={{alignItems:'flex-end'}}>
                                                    <TouchableOpacity style={styles.btnClose} onPress={() => setChangeModal('viewInfo', false)}>
                                                        <Ionicons name={'close-outline'} color="white" size={24}/>
                                                    </TouchableOpacity>
                                                </View>
                                                <View>
                                                    <Text style={{fontSize: 16, textAlign:'center', marginBottom: 16}} fonts={'DemiBold'}>{data?.name}</Text>
                                                    {
                                                        params?.type != 'campaign' ?
                                                            <View style={{alignItems:'center', marginBottom: 16}}>
                                                                <TouchableOpacity onPress={() => openUrlBrowser(data?.url)} style={{width: layout.width / 2, height: (layout.width / 2) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}}>
                                                                    {data?.icon?
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 2, height: (layout.width / 2) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}} source={{uri: data?.icon}}/>
                                                                        :null}
                                                                </TouchableOpacity>
                                                            </View> :
                                                            <View style={{alignItems:'center', marginBottom: 16, flexDirection:'row', justifyContent:'space-between'}}>
                                                                <TouchableOpacity onPress={() => openUrlBrowser(data?.url)}  style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}}>
                                                                    {data?.icon?
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}} source={{uri: data?.icon}}/>
                                                                        :null}
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => openUrlBrowser(data?.url)} style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}}>
                                                                    {data?.Charity_Appeal_Icon?
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}} source={{uri: data?.Charity_Appeal_Icon}}/>
                                                                        :null}
                                                                </TouchableOpacity>
                                                                <TouchableOpacity onPress={() => openUrlBrowser(data?.url)} style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}}>
                                                                    {data?.Company_Icon?
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 3.5, height: (layout.width / 3.5) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar}} source={{uri: data?.Company_Icon}}/>
                                                                        :null}
                                                                </TouchableOpacity>
                                                            </View>
                                                    }
                                                    {params?.type!='charity'?
                                                        <Text style={{textAlign: 'center', marginBottom: 16}}>{data?.status}</Text>
                                                    :null}
                                                    <ScrollView 
                                                       style={params?.type == 'campaign' ? {height: layout.height / 10 * 4 - 20} : {height: layout.height / 10 * 5 - 20}}
                                                       showsVerticalScrollIndicator={false} 
                                                       showsHorizontalScrollIndicator={false}
                                                    >
                                                       <Text style={{textAlign: 'justify', marginBottom: 16}}>{data?.description}</Text>
                                                    </ScrollView>
                                                    
                                                    {
                                                        params?.type == 'charity' ?
                                                            <View style={{marginVertical: 8, flexDirection: 'row', backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12}}>
                                                                <View style={{width: '30%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Joined</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.createdDate}</Text>
                                                                </View>
                                                                <View style={{width: '20%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Appeals</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.TotalAppeal}</Text>
                                                                </View>
                                                                <View style={{width: '25%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Campaigns</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.TotalCampaign}</Text>
                                                                </View>
                                                                <View style={{width: '25%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Raised</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>£{data?.TotalDonation}</Text>
                                                                </View>
                                                            </View> :
                                                            params?.type == 'appeal' ?
                                                                <View style={{marginVertical: 8, flexDirection: 'row', backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12}}>
                                                                    <View style={{width: '30%'}}>
                                                                        <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Launch Date</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.Launch_Date}</Text>
                                                                        {/* <Text numberOfLines={1} style={{textAlign:'center'}}  >D: H: M: S</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}}>{data?.Amount_Date}</Text> */}
                                                                    </View>
                                                                    <View style={{width: '20%'}}>
                                                                        <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Target</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>£{data?.Appeal_Target_Amount}</Text>
                                                                    </View>
                                                                    <View style={{width: '25%'}}>
                                                                        <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Campaigns</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.TotalCampaign}</Text>
                                                                    </View>
                                                                    <View style={{width: '25%'}}>
                                                                        <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Progress</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>£{data?.Amount_Raised}</Text>
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.percent}%</Text>
                                                                    </View>
                                                                </View> :
                                                                params?.type == 'campaign' ?
                                                                    <View style={{marginVertical: 8, flexDirection: 'row', backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12}}>
                                                                        <View style={{width: '30%'}}>
                                                                            <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Launch Date</Text>
                                                                            <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.Launch_Date}</Text>
                                                                            {/* <Text numberOfLines={1} style={{textAlign:'center'}}  >D: H: M: S</Text>
                                                                            <Text numberOfLines={1} style={{textAlign:'center'}}>{data?.Amount_Date}</Text> */}
                                                                        </View>
                                                                        <View style={{width: '20%'}}>
                                                                            <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Contract</Text>
                                                                            <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>£{data?.Campaign_Target_Value}</Text>
                                                                            <Text style={{textAlign:'center'}} fonts={'DemiBold'}>@{data?.Campaign_Price_Per_Move} a Move ({formatNumber(data?.Contract_Move)} Moves)</Text>
                                                                        </View>
                                                                        <View style={{width: '25%'}}>
                                                                            <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Matches</Text>
                                                                            <Text style={{textAlign:'center'}} fonts={'DemiBold'}>Matched by {data?.Number_Matches} Companies</Text>
                                                                        </View>
                                                                        <View style={{width: '25%'}}>
                                                                            <Text style={{textAlign:'center', marginBottom: 8}}>Progress</Text>
                                                                            <Text numberOfLines={2} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.Progress_Donations} Donations</Text>
                                                                            <Text numberOfLines={2} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.Progress_Moves} Moves</Text>
                                                                            <Text numberOfLines={2} style={{textAlign:'center'}} fonts={'DemiBold'}>(£{data?.Amount_Raised})</Text>
                                                                            <Text style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.Progress_Line4}</Text>
                                                                        </View>
                                                                    </View> : null
                                                    }
                                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 16}}>
                                                        <MButton
                                                            onPress={() => favourite()}
                                                            style={[styles.btnOrange, {maxWidth: layout.width / 2.5}]}
                                                            styleText={styles.textWhite}
                                                            text={data?.isFavourite ? 'unfavourite' : "favourite"}/>
                                                        <MButton
                                                            onPress={() => setChangeModal('viewInfo', false)}
                                                            style={[styles.btnDanger, {maxWidth: layout.width / 2.5}]}
                                                            styleText={styles.textWhite}
                                                            text={'donate'}/>
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    }}
                                    keyExtractor={(item, index) => 'search-donate-4-modal-' + index + String(item)}
                                />
                            </View>
                        </>
                    </View>
                    <Toast config={toastConfig}/>
                </Modal>
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
                                                    style={styles.backWrapper2}
                                                    onPress={() => {
                                                        setRefresh(true);
                                                        setChangeModal('success', false)
                                                    }}>
                                                    <Ionicons
                                                        name='return-up-back-outline'
                                                        color={color.green}
                                                        size={20}/>
                                                    <Text style={styles.backText}>back</Text>
                                                </TouchableOpacity>
                                                <ViewShot ref={viewRef}>
                                                    <View style={{backgroundColor: color.primary, paddingTop: 16, minWidth: layout.width, paddingHorizontal: 16}}>
                                                        <View style={styles.thanksWrapper}>
                                                            <Text style={styles.thanksTitle}>
                                                                THANK YOU FOR DONATING TO
                                                            </Text>
                                                        </View>
                                                        <View style={{backgroundColor: color.primary}}>
                                                            <View style={{marginBottom: 16}}>
                                                                <View style={styles.balloons}>
                                                                    {data?.icon?
                                                                        <Image
                                                                            resizeMode={"contain"}
                                                                            style={styles.balloons}
                                                                            source={{uri: data?.icon}}/>
                                                                    :null}
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={styles.thanksWrapper}>
                                                            <Text style={styles.thanksMoves} fonts={'DemiBold'}>
                                                                {formatNumber(number)} Moves
                                                            </Text>
                                                            {params?.type == 'campaign' ?
                                                                <View style={{alignItems:'center'}}>
                                                                    <Text style={[styles.thanksMoves, {fontSize: 14, marginTop: -8}]}>
                                                                        at £{formatNumber(data?.Campaign_Price_Per_Move)} per Move is
                                                                    </Text>
                                                                    <Text style={[styles.thanksMoves, {fontSize: 18, marginTop: -8}]} fonts={'DemiBold'}>
                                                                        £{formatNumber(number * data?.Campaign_Price_Per_Move)}
                                                                    </Text>
                                                                </View>
                                                            :null}
                                                        </View>
                                                        {badgeAwarded?.length ?
                                                            <View>
                                                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
                                                                    {badgeAwarded.map((item, index) => {
                                                                        return (
                                                                            <View key={'badge-' + item?.toString() + index}>
                                                                                <Badge
                                                                                    times={item?.Badge_Awarded_Times}
                                                                                    value={item?.Badge}
                                                                                    active={true}
                                                                                    toggleModal={null}
                                                                                />
                                                                            </View>
                                                                        )
                                                                    })}
                                                                </View>
                                                                <Text style={{textAlign: 'center', marginBottom: 16}}>
                                                                    Congratulations – this donation makes you {getBadgeAwarded()}
                                                                </Text>
                                                            </View>
                                                            : null}
                                                    </View>
                                                </ViewShot>
                                            </View>
                                            <View style={{alignItems: 'center', backgroundColor: color.primary}}>
                                                <TouchableOpacity
                                                    style={styles.shareWrapper}
                                                    onPress={() => shareSocial()}>
                                                    <Text>share your donation</Text>
                                                    <View style={styles.shareIcons}>
                                                        <Ionicons name='logo-facebook' color={color.green} size={32}/>
                                                        <Ionicons name='logo-twitter' color={color.green} size={32}/>
                                                        <Ionicons name='logo-linkedin' color={color.green} size={32}/>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{backgroundColor: color.primary}}>
                                                <Text style={styles.thanksDonate}>want to make another donation?</Text>
                                                <TouchableOpacity style={styles.thanksDonateBtn}
                                                    onPress={() => {
                                                        setRefresh(true);
                                                        setChangeModal('success', false)
                                                    }}>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24}/>
                                                    <Text>donate again</Text>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                }}
                                keyExtractor={(item, index) => 'upload-activity-modal-' + index + String(item)}
                            />
                        </View>
                    </View>
                </Modal>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    btnClose: {
        width: 36,
        height:36,
        justifyContent:'center',
        alignItems:'center',
    },
    appsWrapper: {
        backgroundColor: color.tabbar,
        // marginTop: 16,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        // paddingBottom: 8,
        marginBottom: 16
    },
    donationsWrapper: {
        flex: 1, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16,
        marginHorizontal: -8
    },
    donationsItem: {
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: color.danger,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12,
        height: '100%'
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
    btnDanger: {
        backgroundColor: color.danger,
        maxWidth: layout.width / 2,
    },
    btnWarning: {
        backgroundColor: color.warning,
        maxWidth: layout.width / 2,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    textWhite: {
        color: color.white
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
    backWrapper2: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
    centeredView: {
        flex: 1,
    },
    modalView: {
        flex: 1,
        backgroundColor: color.primary,
        paddingTop: StatusBarHeight,
        paddingHorizontal: 16,
    },
    modalView2: {
        flex: 1,
        backgroundColor: color.primary,
        opacity: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: StatusBarHeight
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
        height: (layout.width - 32) * 2 / 3,
        width: layout.width - 32,
        borderRadius: 16,
        backgroundColor: color.tabbar
    },
    thanksWrapper: {
        paddingHorizontal: 16, alignItems: 'center'
    },
    thanksTitle: {
        textAlign: 'center',
        fontSize: 16,
        width: layout.width * 2 / 3,
        marginBottom: 16,
        color: color.danger
    },
    thanksDonate: {
        color: color.danger,
        marginVertical: 16,
        textAlign: 'center'
    },
    thanksMoves: {
        fontSize: 22,
        marginBottom: 16,
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
