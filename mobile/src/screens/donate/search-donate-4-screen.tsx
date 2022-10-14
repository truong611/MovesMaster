import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Alert, Dimensions, FlatList, Image, Modal, StyleSheet, TouchableOpacity, View, ViewStyle, Linking, ScrollView, Platform} from 'react-native';
import {Badge, BtnBack, Button, Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {calculateDate, formatDate, formatNumber, getDiffDate, getRemainDay, numberFormat, replaceHTTP, showToast, StatusBarHeight, timestampToDate} from "../../services";
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
    FETCH_storeDonate,
    getListMatch
} from "./donate-service";
import { toastConfig } from '../../../App';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import ViewShot, {captureRef} from "react-native-view-shot";
import Share from "react-native-share";
import {Donate} from "../../components/donate/donate";
import RenderHTML from 'react-native-render-html';

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
    const [numberMoney, setNumberMoney] = useState(0);
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
        success: false,
        showDonateMoney: false
    });
    const viewRef = useRef();

    const [favouriteMobile, {}] = useMutation(FETCH_favouriteMobile);
    const [storeDonate, {}] = useMutation(FETCH_storeDonate);
    const [donateMoney, setDonateMoney] = useState(false);
    const [showMatch, setShowMatch] = useState(false);

    let query_listMatch = useQuery(getListMatch)

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
                                let _data = {...data};
                                _data.id = params?.detail?.Moves_Charity_ID;
                                _data.name = params?.detail?.Charity_Name;
                                _data.icon = params?.detail?.Charity_icon || '';
                                _data.description = params?.detail?.Charity_Aims;
                                _data.createdDate = params?.detail?.Created_Date ? timestampToDate(params?.detail?.Created_Date) : '';
                                _data.status = params?.detail?.Is_Active || false;
                                _data.url = params?.detail?.Charity_URL
                                _data.Payment_Site_Url = params?.detail?.Payment_Site_Url ;
                                _data.Member_Payment_Site_Url = params?.detail?.Member_Payment_Site_Url

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
                                let _data = {...data};
                                _data.id = getDetailAppeal?.Appeal?.Appeal_ID;
                                _data.name = getDetailAppeal?.Appeal?.Appeal_Name;
                                _data.icon = getDetailAppeal?.Appeal?.Appeal_Icon;
                                _data.description = getDetailAppeal?.Appeal?.Appeal_Description;
                                _data.status = getDetailAppeal?.Appeal?.Appeal_Status_Name;
                                _data.url = getDetailAppeal?.Appeal?.Appeal_URL;
                                _data.url_charity = getDetailAppeal?.Appeal?.Charity_URL;
                                _data.Payment_Site_Url = getDetailAppeal?.Appeal?.Payment_Site_Url;
                                _data.Member_Payment_Site_Url = getDetailAppeal?.Appeal?.Member_Payment_Site_Url
                                _data.charity_icon = getDetailAppeal?.Appeal?.Charity_icon;

                                _data.Appeal_Target_Amount = getDetailAppeal?.Appeal?.Appeal_Target_Amount || 0;
                                _data.Launch_Date = getDetailAppeal?.Appeal?.Appeal_Start_Date ? timestampToDate(getDetailAppeal?.Appeal?.Appeal_Start_Date) : '';
                                _data.End_Date = getDetailAppeal?.Appeal?.Appeal_End_Date ? timestampToDate(getDetailAppeal?.Appeal?.Appeal_End_Date) : '';
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
                            let {data: {getDetailCampaign}} = await query?.refetch({
                                "campaignId": parseInt(params?.detail?.Campaign_ID),
                            });
                            setLoading(false);
                            if (getDetailCampaign?.messageCode == 200) {                     
                                let _data = {...data};
                                _data.id = getDetailCampaign?.Campaign?.Campaign_ID;
                                _data.name = getDetailCampaign?.Campaign?.Campaign_Name;
                                _data.icon = getDetailCampaign?.Campaign?.Campaign_Icon;                         
                                _data.description = getDetailCampaign?.Campaign?.Campaign_Description;
                                _data.status = getDetailCampaign?.Campaign?.Campaign_Status_Name;
                                _data.url = getDetailCampaign?.Campaign?.Campaign_URL;


                                _data.Appeal_Icon = getCharityAppealIcon(getDetailCampaign);
                                _data.Appeal_URL = getCharityAppealURL(getDetailCampaign)
                                _data.Charity_URL = getDetailCampaign?.Campaign?.Charity_URL
                                _data.Charity_icon = getDetailCampaign?.Campaign?.Charity_icon
                                
                                _data.Company_Icon = getCompanyIcon(getDetailCampaign);
                                _data.Company_Name = getDetailCampaign?.Campaign?.Company_Name;
                                _data.Company_URL = getCompanyURL(getDetailCampaign);
                                _data.Launch_Date = getDetailCampaign?.Campaign?.Campaign_Launch_Date ? getDetailCampaign?.Campaign?.Campaign_Launch_Date : null;
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
                     

                                let {data: {getListMatchByObjectId}} = await query_listMatch?.refetch({
                                    "id": parseInt(params?.detail?.Campaign_ID),
                                    "type": "campaign"
                                });
                                if(getListMatchByObjectId?.messageCode == 200) {
                                    _data.ListMatch = getListMatchByObjectId?.ListMatch
                                }else showToast('error', getListMatchByObjectId?.message)

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
        setShowMatch(false)
        setNumberMoney(0)
        setNumber(0);
        setData(null)
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
        if(donateMoney){
            setDonateMoney(false)
        }else{
            resetData()
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
        }
    };

    const viewInfo = async () => {
        setChangeModal('viewInfo', true);
    };

    const onClickPersonalDonate = async () => {
        if(numberMoney > 0 ){
            if(data?.Member_Payment_Site_Url){
                donate()
                setDonateMoney(0)
                await Linking.openURL(data?.Member_Payment_Site_Url)
                return
            }
            else if(data?.Payment_Site_Url){
                donate()
                setDonateMoney(0)
                await Linking.openURL(data?.Payment_Site_Url)
                return
            }
            // showToast('error', "Sorry we do not have the charity's giving page details. Please try at the charity's home page")
            setChangeModal('showDonateMoney', true)
            // setTimeout(() => {setChangeModal('showDonateMoney', false)}, 5000)
            
        }else showToast('error', "donation amount must be greater than £0.00")

    }

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
        return null
    };

    const getCharityAppealURL = (data) => {
        let appeal = data?.ListAppeal.find(x => x.Appeal_ID == data?.Campaign?.Appeal_ID);
        if (appeal) {
            return appeal?.Appeal_URL
        }
        return null
    };

    const getCompanyIcon = (data) => {
        let company = data?.ListCompany.find(x => x.Moves_Company_ID == data?.Campaign?.Moves_Company_ID);
        if (company) {
            return company?.Company_Icon
        }
        return '';
    };
    const getCompanyURL = (data) => {
        let company = data?.ListCompany.find(x => x.Moves_Company_ID == data?.Campaign?.Moves_Company_ID);
        if (company) {
            return company?.Company_URL
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
                    "Sterling_Amount": numberMoney ? numberMoney : 0,
                    "Amount_Donated": numberMoney ? numberMoney : 0,
                    "Moves_Donated": number,
                    "Moves_Conversion_Rate": params?.type == 'campaign' ? data?.Campaign_Price_Per_Move : null,
                    "Appeal_ID": params?.type == 'appeal' ? data?.id : null,
                    "Moves_Charity_ID": params?.type == 'charity' ? data?.id : null,
                    "Campaign_ID": params?.type == 'campaign' ? data?.id : null,
                    "type": params?.type
                }
            };
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
                numberMoney > 0 ? setRefresh(true) : setChangeModal('success', true)
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

    const renderItemMatch = ({item, index}) => {
        return (
            <View style={{flexDirection: 'row', marginVertical: 16, width: '100%', borderBottomColor: color.white, borderBottomWidth: 2, alignItems: 'center', paddingBottom: 16}}>          
                <TouchableOpacity  onPress={() => openUrlBrowser(item?.Company_URL)} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, marginRight: 20}}>
                    {item?.Company_Icon ?
                    <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.tabbar}} source={{  uri: replaceHTTP(item?.Company_Icon) }}/>
                    : null }
                </TouchableOpacity>
                <Text>{item?.Company_Name}</Text>
            </View>
        )
    }

    const topComponent = () => {
        return (
            <View>
                <BtnBack title={"Donate " + params?.type} goBack={goBack}/>
                <Donate title={'DONATIONS'} isRefresh={isRefresh}/>
                <View style={{paddingHorizontal: 16,}}>
                    <View style={{flexDirection: 'row', marginBottom: 16}}>
                        <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8, marginRight: 16, backgroundColor: color.tabbar}}>
                            {params?.detail?.icon ?
                                <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8, marginRight: 16, backgroundColor: color.tabbar, overlayColor:color.tabbar }} source={params?.detail?.icon ? {uri: replaceHTTP(params?.detail?.icon)} : {}}/>
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
                                <View>
                                  {!donateMoney ?   
                                        <Text style={{marginBottom: 16, textAlign: 'center'}}>
                                        You are donating to a
                                        <Text style={{textTransform: 'capitalize'}}> {params?.type}</Text>.
                                        You can donate your Moves and they may be purchased in future under a Campaign. Please select the number of moves you would like to donate
                                        </Text> 
                                   : <Text>
                                    Thank you for donating to this charity. Please select the amount you wish to donate below. On clicking donate you will be taken to the charity's giving page to complete the donation
                                    </Text>}
                                </View>
                                 :
                                <Text style={{marginBottom: 16, textAlign: 'center'}}>
                                    {!data?.End_Date_Target ?
                                        <Text>
                                            <Text style={{fontSize: 15}} fonts={'DemiBold'}> {formatNumber(Math.ceil(data?.movesNeedDonate) )} </Text>
                                            Moves available at
                                        </Text>
                                        : null}
                                    <Text style={{fontSize: 15}} fonts={'DemiBold'}> £ {numberFormat(parseFloat(data?.Campaign_Price_Per_Move))} </Text>
                                    per Move
                                </Text>
                            }
                            {/* <Text style={{marginBottom: 32, textAlign: 'center'}}>
                                Please select the number of moves you would like to donate
                            </Text> */}
                            {!donateMoney ? 
                            <View>
                                <Text style={{textAlign: 'center', fontSize: 18,}} fonts={'DemiBold'}>{formatNumber(number)}</Text>
                                <Slider
                                    style={{width: layout.width - 32, height: 56}}
                                    minimumValue={0}
                                    value={number}
                                    maximumValue={!data?.End_Date_Target && (data?.movesNeedDonate < donateInfo?.movesAvailable) ? Math.ceil(data?.movesNeedDonate) : Math.round(donateInfo?.movesAvailable)}
                                    minimumTrackTintColor={color.danger}
                                    maximumTrackTintColor="#8f256e"
                                    onValueChange={(number) => {
                                        setNumber(Math.round(number))
                                    }}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: -10}}>
                                    <Text style={{color: color.orange, fontSize: 16}}>0</Text>
                                    <Text style={{color: color.orange, fontSize: 16}}>{!data?.End_Date_Target && (data?.movesNeedDonate < donateInfo?.movesAvailable) ? Math.ceil(data?.movesNeedDonate) : formatNumber(Math.round(donateInfo?.movesAvailable))}</Text>
                                </View>
                            </View>
                            : 
                            <View>
                                <Text style={{textAlign: 'center', fontSize: 18,marginTop: 10, color: color.orange}} fonts={'DemiBold'}>£{numberFormat(numberMoney)}</Text>
                                <Slider
                                    style={{width: layout.width - 32, height: 56}}
                                    minimumValue={0}
                                    value={numberMoney}
                                    maximumValue={100}
                                    minimumTrackTintColor={color.danger}
                                    maximumTrackTintColor="#8f256e"
                                    onValueChange={(number) => {
                                        setNumberMoney(Math.round(number))
                                    }}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: -10}}>
                                    <Text style={{color: color.orange, fontSize: 16}}>0</Text>
                                    <Text style={{color: color.orange, fontSize: 16}}>£100.00</Text>
                                </View>
                            </View> }
                            {!donateMoney ?
                                <View style={{marginTop: 5, alignItems: 'center'}}>
                                    <MButton
                                        onPress={() => {
                                            if(number > 0) {
                                                Alert.alert(
                                                    "Confirm",
                                                    "Donate " + number + ' moves? Please confirm',
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
                                        style={[styles.btnDanger,{width: layout.width / 10*4}]}
                                        styleText={styles.textWhite}
                                        text={'donate moves'}/>
                                
                                    {params?.type != 'campaign' ? 
                                        <View style={{flexDirection:'row',justifyContent:'center', alignItems: 'center'}}>
                                            <Text style={{marginRight: 5, marginTop: -10}}>or</Text>
                                            <View style={{alignItems: 'center', marginRight: 20}}>
                                                <MButton         
                                                    onPress={() => {
                                                        setNumber(0)
                                                        setDonateMoney(true)
                                                    //    onClickPersonalDonate()
                                                    }}                 
                                                    style={[styles.btnGreen, {width: layout.width / 10 * 4}]}
                                                    styleText={styles.textWhite}
                                                    text={'donate money'}/>
                                            </View>
                                        </View>
                                        : null}
                                </View>
                            : <View style={{marginTop: 10, alignItems: 'center'}}>  
                                <MButton         
                                    onPress={() => onClickPersonalDonate()}                 
                                    style={[styles.btnGreen, {width: layout.width / 10 * 4}]}
                                    styleText={styles.textWhite}
                                    text={'donate'}/>                               
                            </View> }
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
                                                {showMatch ? 
                                                <View>
                                                    <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={() => {
                                                        if(showMatch) setShowMatch(false)
                                                        else setChangeModal('viewInfo', false)      
                                                    }}>
                                                        <Ionicons name='return-up-back-outline' color={color.green} size={20}/>
                                                        <Text style={styles.backText}>back</Text>
                                                    </TouchableOpacity>
                                                </View> : null}
                                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                    <TouchableOpacity style={{marginTop: 20,marginLeft: 5}} onPress={() => favourite()}>
                                                        {data?.isFavourite ? 
                                                           <Ionicons name={'heart'} color={color.white} size={35}/>
                                                        :
                                                           <Ionicons name={'heart-outline'} color={color.white} size={35}/>
                                                        }
                                                       
                                                       
                                                    </TouchableOpacity>

                                                    {showMatch ? null :
                                                    <TouchableOpacity style={[styles.btnClose,{marginTop: 20}]} onPress={() => {
                                                        if(showMatch) setShowMatch(false)
                                                        else setChangeModal('viewInfo', false)      
                                                    }}>
                                                        <Ionicons name={'close-outline'} color="white" size={24}/>
                                                    </TouchableOpacity>
                                                    }
                                                </View>   
                                                <View>                                               
                                                    <Text style={{fontSize: 16, textAlign:'center', marginBottom: 16}} fonts={'DemiBold'}>{data?.name}</Text>
                                                    {
                                                        params?.type != 'campaign' ?
                                                            <View>
                                                                { params?.type == 'appeal' ?
                                                                <View style={{alignItems:'center', marginBottom: 16, flexDirection:'row', justifyContent:'center'}}>
                                                                    {data?.charity_icon ? 
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.url_charity)} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.primary, marginRight: 10}}>                                                                     
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.tabbar}} source={{  uri: replaceHTTP(data?.charity_icon) }}/>                                                                     
                                                                    </TouchableOpacity>
                                                                    :null}
                                                                     {data?.icon ?
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.url)} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.primary}}>
                                                                        <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.tabbar}} source={{  uri: replaceHTTP(data?.icon) }}/>                
                                                                    </TouchableOpacity>
                                                                    :null}
                                                                </View>
                                                                : <View style={{alignItems:'center', marginBottom: 16, flexDirection:'row', justifyContent:'center'}}>
                                                                     {data?.icon?
                                                                        <TouchableOpacity onPress={() => openUrlBrowser(data?.url)} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.primary}}>
                                                                            <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.tabbar}} source={{  uri: replaceHTTP(data?.icon) }}/>                                                               
                                                                        </TouchableOpacity>
                                                                        :null}
                                                                  </View>}
                                                            </View> :
                                                            <View style={{alignItems:'center', marginBottom: 16, flexDirection:'row', justifyContent:'center'}}>
                                                                {data?.Charity_icon ? 
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.Charity_URL)} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, marginRight: 5}}>
                                                                            <Image resizeMode={"contain"} style={{width: layout.width / 4 - 15, height: (layout.width / 4 ) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.primary}} source={{uri: replaceHTTP(data?.Charity_icon) }}/> 
                                                                    </TouchableOpacity>
                                                                : null}
                                                                {data?.Company_Icon ? 
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.Company_URL)} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.primary, marginRight: 5}}>
                                                                        {data?.Company_Icon ?
                                                                            <Image resizeMode={"contain"} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.primary}} source={{uri: replaceHTTP(data?.Company_Icon) }}/>
                                                                            :null}
                                                                    </TouchableOpacity>
                                                                : null}
                                                                {data?.Appeal_Icon?
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.Appeal_URL)} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.primary, marginRight: 5}}>    
                                                                            <Image resizeMode={"contain"} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar, overlayColor:color.primary}} source={{uri: replaceHTTP(data?.Appeal_Icon) }}/>                                                        
                                                                    </TouchableOpacity>
                                                                : null}
                                                                {data?.icon? 
                                                                    <TouchableOpacity onPress={() => openUrlBrowser(data?.url)}  style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.primary}}>
                                                                            <Image resizeMode={"contain"} style={{width: layout.width / 4 - 15, height: (layout.width / 4) * 2 / 3, borderRadius: 16,backgroundColor:color.tabbar,overlayColor:color.primary }} source={{uri: replaceHTTP(data?.icon) }}/>
                                                                    </TouchableOpacity>
                                                                : null}                                                                                                                               
                                                            </View>
                                                    }
                                                    {params?.type!='charity'?
                                                        <Text style={{textAlign: 'center', marginBottom: 16}}>{data?.status}</Text>
                                                    :null}
                                                    {!showMatch ?
                                                        <ScrollView 
                                                        style={[
                                                            params?.type == 'campaign' && Platform?.OS == 'android' ? {height: layout.height / 10 * 3 - 30} : {},
                                                            params?.type == 'appeal' && Platform?.OS == 'android' ? {height: layout.height / 10 * 4 - 50} : {},
                                                            params?.type == 'charity' && Platform?.OS == 'android' ? {height: layout.height / 10 * 4} : {},
                                                            Platform?.OS == 'ios' ? {height: layout.height / 10 * 4} : {}

                                                        ]}
                                                        showsVerticalScrollIndicator={false} 
                                                        showsHorizontalScrollIndicator={false}
                                                        >
                                                        {/* <Text style={{textAlign: 'justify', marginBottom: 16}}>{data?.description}</Text> */}
                                                        {data?.description ? 
                                                        <RenderHTML 
                                                                contentWidth={layout.width - 16}
                                                                source={{
                                                                    html: `<div style="color: white">${data?.description}</div>`,
                                                                }}
                                                        />
                                                        : null }
                                                        </ScrollView>
                                                    : null } 
                                                    {
                                                        params?.type == 'charity' ?
                                                            <View style={{marginVertical: 8, flexDirection: 'row', backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12}}>
                                                                <View style={{width: '30%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}} adjustsFontSizeToFit={true}>Joined Moves</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.createdDate}</Text>
                                                                </View>
                                                                <View style={{width: '20%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}} adjustsFontSizeToFit={true}>Appeals</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.TotalAppeal}</Text>
                                                                </View>
                                                                <View style={{width: '25%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}} adjustsFontSizeToFit={true}>Campaigns</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>{data?.TotalCampaign}</Text>
                                                                </View>
                                                                <View style={{width: '25%'}}>
                                                                    <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}} adjustsFontSizeToFit={true}>Raised</Text>
                                                                    <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>£ {numberFormat(data?.TotalDonation) }</Text>
                                                                </View>
                                                            </View> :
                                                            params?.type == 'appeal' ?
                                                                <View style={{marginVertical: 8, backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12, paddingHorizontal: 5}}>
                                                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                                        <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Launch: {data?.Launch_Date}</Text>
                                                                        {data?.End_Date ?
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>End: {data?.End_Date}</Text> : null }
                                                                    </View>                                                             
                                                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                                        {data?.Appeal_Target_Amount ? 
                                                                            <Text numberOfLines={1} style={{textAlign:'center', marginBottom: 8}}>Target: £ {numberFormat(parseFloat(data?.Appeal_Target_Amount))}</Text>: null }
                                                                        <Text numberOfLines={1} style={{textAlign:'center'}} fonts={'DemiBold'}>Raised: £{numberFormat(parseFloat(data?.Amount_Raised)) }</Text>
                                                                    </View>
                                                                    <View style={{}}>
                                                                        <Text numberOfLines={1} style={{marginBottom: 8}}>Campaigns: {data?.TotalCampaign}</Text>
                                                                    </View> 
                                                                    
                                                                </View> :
                                                                params?.type == 'campaign' && !showMatch ?
                                                                    <View style={{marginVertical: 8, backgroundColor: color.tabbar, paddingVertical: 12, borderRadius: 12, paddingHorizontal: 5}}>
                                                                        <View style={{ flexDirection: 'row' }}>
                                                                            <Text numberOfLines={1} style={Platform?.OS == 'android' ? {marginBottom: 5, fontSize: 10} : {marginBottom: 5, fontSize: 13}} adjustsFontSizeToFit={true}>Launch: {timestampToDate(data?.Launch_Date,'dd/MM/YYYY hh:mm:ss')} ({new Date(data?.Launch_Date).getTime() < new Date().getTime() ? " + " : " - "} {calculateDate(data?.Launch_Date, new Date())})</Text> 
                                                                        </View>
                                                                        <View style={{flexDirection: 'row'}}>
                                                                            <Text numberOfLines={1} style={[{textAlign:'center', marginBottom: 5, fontSize: 10}, Platform?.OS == 'ios' ? {fontSize: 13}: {}]} >Contract: £{numberFormat(data?.Campaign_Target_Value) } @ £{data?.Campaign_Price_Per_Move.toFixed(2)}/Move ({formatNumber(data?.Contract_Move)} Moves)</Text>
                                                                        </View>
                                                                         <View style={{flexDirection: 'row'}}>
                                                                            <Text style={[{textAlign:'center', marginBottom: 5, fontSize: 10},Platform?.OS == 'ios' ? {fontSize: 13}: {}]} numberOfLines={1} >Donations: {data?.Progress_Donations} of {data?.Progress_Moves} Moves ({data?.Progress_Line4})</Text>
                                                                        </View>
                                                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                                            {parseFloat(data?.Number_Matches) > 0 ? 
                                                                            <TouchableOpacity onPress={() => setShowMatch(true)}>
                                                                                <Text numberOfLines={1} style={[{textAlign:'center', marginBottom: 8, fontSize: 10, borderBottomWidth: 1, borderBottomColor: color.blue, color: color.blue},Platform?.OS == 'ios' ? {fontSize: 13}: {}]}>Matches: {data?.Number_Matches}</Text>
                                                                            </TouchableOpacity>
                                                                            : <Text numberOfLines={1} style={[{textAlign:'center', marginBottom: 8, fontSize: 10},Platform?.OS == 'ios' ? {fontSize: 13}: {}]}>Matches: {data?.Number_Matches}</Text>}
                                                                            <Text style={[{textAlign:'center',marginRight: 10,fontSize: 10},Platform?.OS == 'ios' ? {fontSize: 13}: {}]}>Campaign value: £ {numberFormat(data?.Sterling_Amount * (data?.Number_Matches + 1))}</Text>
                                                                        </View>                                    
                                                                    </View> : 
                                                                    <View>
                                                                        <View style={[styles.centeredView]}>
                                                                            <View style={[styles.modalView]}>
                                                                                <View style={{borderBottomWidth: 2, borderBottomColor: color.white, marginBottom: 16}}>
                                                                                    <Text style={{marginBottom: 16}}>Companies matching the Campaign</Text>
                                                                                </View>
                                                                                <FlatList
                                                                                    contentContainerStyle={{flexGrow: 1}}
                                                                                    showsVerticalScrollIndicator={false}
                                                                                    showsHorizontalScrollIndicator={false}
                                                                                    style={{flex: 1}}
                                                                                    renderItem={renderItemMatch}
                                                                                    data={data?.ListMatch}
                                                                                    keyExtractor={(item, index) => 'upload-activity-modal-' + index + String(item)}
                                                                                />
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                    }
                                                    {!showMatch ? 
                                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16}}>
                                                            <MButton
                                                                onPress={() => setChangeModal('viewInfo', false)}
                                                                style={[styles.btnDanger, {maxWidth: layout.width / 2.5}]}
                                                                styleText={styles.textWhite}
                                                                text={'donate'}/>
                                                        </View>
                                                    : null }
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
                                                                    {params?.detail?.icon?
                                                                        <Image
                                                                            resizeMode={"contain"}
                                                                            style={styles.balloons}
                                                                            source={{uri: replaceHTTP(params?.detail?.icon)}}/>
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
                                                                        at £{numberFormat(data?.Campaign_Price_Per_Move)} per Move is
                                                                    </Text>
                                                                    <Text style={[styles.thanksMoves, {fontSize: 18, marginTop: -8}]} fonts={'DemiBold'}>
                                                                        £{numberFormat(number * data?.Campaign_Price_Per_Move)}
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
                <Modal
                        animationType={"fade"}
                        transparent={true}
                        visible={modalVisible?.showDonateMoney}
                        onRequestClose={() => {
                        }}
                    >
                            <View style={styles.modal_thongbao}>
                                <View style={{paddingHorizontal: 10}}>
                                    <Text style={{color:color.black, marginTop: 15, fontSize: 16}}>Sorry we do not have the charity's giving page details. Please try at the charity's 
                                    <Text onPress={() => {
                                        setChangeModal('showDonateMoney', false)
                                        Linking.openURL(params?.type == 'appeal' ? data?.url_charity : data.url)
                                    }
                                        } style={{color: color.green,fontSize: 16}}> home </Text>
                                    page
                                </Text>
                                </View>
                                
                                <View>
                                    <TouchableOpacity
                                        style={{position: 'absolute', right: 0, borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10}}
                                        onPress={() => {
                                            setChangeModal('showDonateMoney', false)
                                    }}>
                                        <Text style={{color: color.black}}>Close</Text>
                                    </TouchableOpacity>
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
    },
    btnWarning: {
        backgroundColor: color.warning,
        maxWidth: layout.width / 2,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    btnGreen: {
        backgroundColor: color.green,
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
        backgroundColor: color.tabbar,
        overlayColor:color.tabbar
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
    },
    modal_thongbao : {
        height: 130, 
        width: '90%', 
        marginLeft: '5%', 
        backgroundColor: color.white, 
        paddingHorizontal: 10, 
        marginTop: layout.height / 10 * 4
    }
});
