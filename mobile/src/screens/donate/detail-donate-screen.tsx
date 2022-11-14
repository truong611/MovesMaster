import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import {Header, Screen, Text, MButton, BtnBack} from '../../components';
import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import {formatNumber, formatDate, showToast, numberFormat, converStrToDate} from '../../services';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {FETCH_getDetailDonationMobile} from './donate-service';
import {useQuery} from '@apollo/react-hooks';
import {Donate} from "../../components/donate/donate";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const DetailDonateScreen = observer(function DetailDonateScreen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [detailDonate, setDetailDonate] = useState<any>(null);
    const isFocused = useIsFocused();
    const {params}: any = useRoute();

    const {refetch} = useQuery(FETCH_getDetailDonationMobile, {
        variables: {id: parseInt(params?.id)},
    });

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);

    const fetchData = async () => {
        setRefresh(false);
        if (!isRefresh && isFocused && refetch) {
            setLoading(true);
            try {
                let {data: {getDetailDonationMobile: {Donation, message, messageCode}}} = await refetch();
                setLoading(false);
                if (messageCode == 200) {
                    let data_donation = {...Donation}
                    data_donation.Created_Date = converStrToDate(Donation.Created_Date)
                    setDetailDonate(data_donation);
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const goToPage = page => {
        navigation.navigate('MainScreen',
         {screen: page,
            params: {
                type : params?.type,
                value: params?.value
            },
        });
    };

    const onRefresh = () => {
        setRefresh(true);
    };

    const topComponent = () => {
        return (
            <View style={{flex: 1, marginBottom: 16}}>
                <BtnBack goBack={() => goToPage('ListDonateScreen')}/>
                <Donate title={'DONATIONS HISTORY'}/>
                <View style={{backgroundColor: color.tabbar, marginHorizontal: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderRadius: 16, marginBottom: 16}}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>charity</Text>
                        <Text style={{width: '65%', textAlign: 'right'}} numberOfLines={2} adjustsFontSizeToFit={true}>{detailDonate?.Charity_Name ? detailDonate?.Charity_Name : 'n/a'}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>appeal</Text>
                        <Text style={{width: '65%', textAlign: 'right'}}>{detailDonate?.Appeal_Name ? detailDonate?.Appeal_Name : 'n/a'}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>campaign</Text>
                        <Text style={{width: '65%', textAlign: 'right'}}>
                            {detailDonate?.Campaign_Name ? detailDonate?.Campaign_Name : 'n/a'}
                        </Text>
                    </View>
                    <View style={{height: 1, width: layout.width - 64, backgroundColor: color.white, marginBottom: 16, marginTop: 4}}/>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>date</Text>
                        <Text>{formatDate(detailDonate?.Created_Date)}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>time</Text>
                        <Text>{formatDate(detailDonate?.Created_Date, 'hh:mm')}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>amount</Text>
                        <Text>£ {numberFormat(detailDonate?.Sterling_Amount)}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                        <Text style={styles.child_item}>moves</Text>
                        <Text>{formatNumber(detailDonate?.Moves_Donated)}</Text>
                    </View>
                </View>
                {/* <View style={{alignItems: 'center'}}>
                    <MButton
                        onPress={() => goToPage('ListDonateScreen')}
                        style={styles.btn}
                        styleText={{color: color.white}}
                        text="view older transactions"/>
                </View> */}
            </View>
        );
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
                            'detail-donate-' + index + String(item)
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
    content_1: {
        borderWidth: 1,
        borderColor: color.danger,
        width: '75%',
        marginLeft: '10%',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    content_2: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginTop: 30,
        borderWidth: 1,
        borderColor: color.danger,
        width: '75%',
        marginLeft: '20%',
        borderRadius: 12,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    btn: {
        backgroundColor: color.danger,
        maxWidth: layout.width * 2 / 3,
    },
    rowInfo: {
        marginBottom: 8, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between'
    },
    child_item: {
        color: color.danger,
        width: '30%'
    }
});
