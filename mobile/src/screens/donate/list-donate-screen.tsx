import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    View,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import {BtnBack, Header, Screen, Text} from '../../components';
import {useNavigation, useIsFocused, useRoute} from '@react-navigation/native';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {formatNumber, formatDate, showToast, numberFormat} from '../../services';
import {FETCH_getListDonationMobile} from './donate-service';
import {useQuery} from '@apollo/react-hooks';
import {Donate} from "../../components/donate/donate";
import {useStores} from "../../models";
import Ionicons from 'react-native-vector-icons/Ionicons';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const ListDonateScreen = observer(function ListDonateScreen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [listDonate, setListDonate] = useState([]);
    const isFocused = useIsFocused();
    const {movesModel} = useStores();
    const [sortDay , setSortDay] = useState(false)
    const [sortPrice , setSortPrice] = useState(false)
    const [sortName , setSortName] = useState(false)
    const [typeName , setTypeName] = useState('')
    const {params}: any = useRoute();

    const {refetch} = useQuery(FETCH_getListDonationMobile);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);

    const fetchData = async () => {
        setRefresh(false);
        if (!isRefresh && isFocused && refetch) {
            setLoading(true);
            try {
                let {data: {getListDonationMobile: {ListDonation, messageCode, message}}} = await refetch();
                setLoading(false);
                if (messageCode == 200) {        
                    setListDonate(ListDonation);
                    console.log(params);
                    
                    if(params?.type == 'Date'){
                        sortHistoryByDate(params?.value, ListDonation)
                    }
                    if(params?.type == 'Name'){
                        sortHistoryByName(params?.value, ListDonation)
                    }
                    if(params?.type == 'Price'){
                        sortHistoryByPrice(params?.value, ListDonation)
                    }
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const sortHistoryByDate = (type : boolean, ListDonation = null) => {
        setTypeName('Date')
        setSortDay(type)
        let _listDonate = ListDonation == null ? [...listDonate] : [...ListDonation]

        if(type){
            _listDonate.sort((a,b) => {
                return a?.Created_Date - b?.Created_Date
            })
        }else{
            _listDonate.sort((a,b) => {
                return b?.Created_Date - a?.Created_Date
            })
        }
        
        setListDonate(_listDonate)  
    }

    const sortHistoryByPrice = (type : boolean, ListDonation = null) => {
        setTypeName('Price')
        setSortPrice(type)
        let _listDonate = ListDonation == null ? [...listDonate] : [...ListDonation]
        if(type){
            _listDonate.sort((a,b) => {
                return a?.Sterling_Amount - b?.Sterling_Amount
            })
        }else{
            _listDonate.sort((a,b) => {
                return b?.Sterling_Amount - a?.Sterling_Amount
            })
        }
        setListDonate(_listDonate)  
    }

    const sortHistoryByName = (type : boolean, ListDonation = null) => {
        setTypeName('Name')
        setSortName(type)
        let _listDonate = ListDonation == null ? [...listDonate] : [...ListDonation]
        if(type){     
            _listDonate.sort((a,b) => {
                let name_a = ''
                let name_b = ''     
                if (a?.Campaign_ID != null) name_a = a?.Campaign_Name;
                else if (a?.Appeal_ID != null) name_a = a?.Appeal_Name;
                else if (a.Moves_Charity_ID != null) name_a = a?.Charity_Name;

                if (b?.Campaign_ID != null) name_b = b?.Campaign_Name;
                else if (b?.Appeal_ID != null) name_b = b?.Appeal_Name;
                else if (b.Moves_Charity_ID != null) name_b = b?.Charity_Name;
            return name_a.localeCompare(name_b)
            })
        }else{
            _listDonate.sort((a,b) => {
                let name_a = ''
                let name_b = ''     
                if (a?.Campaign_ID != null) name_a = a?.Campaign_Name;
                else if (a?.Appeal_ID != null) name_a = a?.Appeal_Name;
                else if (a.Moves_Charity_ID != null) name_a = a?.Charity_Name;

                if (b?.Campaign_ID != null) name_b = b?.Campaign_Name;
                else if (b?.Appeal_ID != null) name_b = b?.Appeal_Name;
                else if (b.Moves_Charity_ID != null) name_b = b?.Charity_Name;
            return name_b.localeCompare(name_a)
            })
        }
        setListDonate(_listDonate)  
    }

    const goToPage = page => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const goBack = async () => {
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 1,
        });
    };

    const topComponent = () => {
        return (
            <View style={{flex: 1, marginBottom: 16}}>
                <BtnBack goBack={goBack}/>
                <Donate title={'DONATIONS'}/>
                {listDonate?.length ?
                    <View style={styles.list_item}>
                        <Text style={{marginBottom: 12}} fonts={'DemiBold'}>DONATION HISTORY</Text>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity style={{width: '44%',}} onPress={() => sortHistoryByName(!sortName)}>
                               <Ionicons name={'swap-vertical-outline'} color={color.white} size={30}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{width: '25%', alignItems: 'flex-end'}} onPress={() => sortHistoryByPrice(!sortPrice)}>
                               <Ionicons name={'swap-vertical-outline'} color={color.white} size={30}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{width: '30%', alignItems: 'flex-end'}} onPress={() => sortHistoryByDate(!sortDay)}>
                               <Ionicons name={'swap-vertical-outline'} color={color.white} size={30}/>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            style={{flex: 1}}
                            renderItem={renderItem}
                            data={listDonate}
                            keyExtractor={(item, index) =>
                                'list-donate-' + index + String(item)
                            }/>
                    </View>
                    : null}
            </View>
        );
    };

    const renderItem = ({item, index}) => (
        <TouchableOpacity
            style={[styles.item,
                index == listDonate.length - 1 ? {marginBottom: 0} : {},
                index == 0 ? {borderTopWidth: 1, borderTopColor: color.white, paddingTop: 16} : {}
            ]}
            onPress={() =>
                navigation.navigate('MainScreen', {
                    screen: 'DetailDonateScreen',
                    params: {
                        id: item.Donation_ID,
                        type : typeName,
                        value: typeName == '' ? null : typeName == 'Date' ? sortDay : typeName == 'Price' ? sortPrice : sortName
                    },
                })
            }>
            <Text style={{width: '44%', textAlign: 'left',}} numberOfLines={3} adjustsFontSizeToFit={true}>
                {getNameDonate(item)}
            </Text>
            <Text style={{width: '25%', textAlign: 'right', color: color.danger}} numberOfLines={1} adjustsFontSizeToFit={true}>
                £{numberFormat(item.Sterling_Amount)}
            </Text>
            <Text style={{width: '30%', textAlign: 'right', color: color.danger}} numberOfLines={1} adjustsFontSizeToFit={true}>
                {formatDate(item.Created_Date)}
            </Text>
        </TouchableOpacity>
    );

    const getNameDonate = item => {
        if (item.Campaign_ID != null) return item.Campaign_Name;
        if (item.Appeal_ID != null) return item.Appeal_Name;
        if (item.Moves_Charity_ID != null) return item.Charity_Name;
    };

    const onRefresh = () => {
        setRefresh(true);
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={ROOT} preset="fixed">
                <View style={{flex: 1}}>
                    <Header headerText="LOGO"/>
                    <FlatList
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) =>
                            'list-donate-' + index + String(item)
                        }/>
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    appsWrapper: {
        backgroundColor: color.tabbar,
        marginTop: 16,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        paddingBottom: 4,
        marginBottom: 16,
    },
    donationsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
        marginHorizontal: -8,
    },
    donationsItem: {
        width: '30%',
        marginHorizontal: '1.5%',
        borderWidth: 1,
        borderColor: color.danger,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    donationsText: {
        textAlign: 'center',
    },
    donationsValue: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 8,
        color: color.danger,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: color.white,
        paddingBottom: 16
    },
    list_item: {
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16
    },
});
