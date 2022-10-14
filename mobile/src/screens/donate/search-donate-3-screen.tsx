import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {BtnBack, Header, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {formatNumber, replaceHTTP} from "../../services";
import {useStores} from "../../models";
import {Donate} from "../../components/donate/donate";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const SearchDonate3Screen = observer(function SearchDonate3Screen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const {params}: any = useRoute();
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    // const {movesModel} = useStores();
    // const [donateInfo, setDonateInfo] = useState({
    //     donatedMoves: 0,
    //     amountDonated: 0,
    //     movesAvailable: 0,
    // });

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            // let _donation = await movesModel.getDonateInfo();
            // setDonateInfo({
            //     donatedMoves: _donation?.donatedMoves,
            //     amountDonated: _donation?.amountDonated,
            //     movesAvailable: _donation?.movesAvailable
            // });
        }
    };

    const goBack = () => {
        navigation.navigate('MainScreen', {
            screen: 'SearchDonate2Screen',
            params: {
                list: params?.list,
            },
        });
    };

    const goToSearchDonate4Screen = (detail, type) => {
        navigation.navigate('MainScreen', {
            screen: 'SearchDonate4Screen',
            params: {
                list: params?.list,
                data: params?.data,
                detail,
                type,
                screen: 'SearchDonate3Screen'
            },
        });
    };

    const topComponent = () => {
        return (
            <View>
                <BtnBack goBack={goBack}/>
                <Donate title={'DONATIONS'}/>
                <View style={[styles.appsWrapper, {paddingBottom: 12}]}>
                    <View style={{marginBottom: 16}}>
                        <Text fonts={'DemiBold'}>CHARITY</Text>
                    </View>
                    <TouchableOpacity onPress={() => goToSearchDonate4Screen(params?.data, 'charity')}>
                        <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}}>
                            {params?.data?.Charity_icon?
                                <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}} source={{uri:replaceHTTP(params?.data?.Charity_icon)}}/>
                                :null}
                        </View>
                        <Text style={{width: layout.width / 3, textAlign: 'center'}} numberOfLines={2}>{params?.data?.Charity_Name}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.appsWrapper, {paddingBottom: 0}]}>
                    <View style={{marginBottom: 16}}>
                        <Text fonts={'DemiBold'}>APPEALS</Text>
                    </View>
                    <FlatList
                        horizontal
                        data={params?.data?.Appeals}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity style={{marginRight: 16, marginBottom: 16}} onPress={() => goToSearchDonate4Screen(item, 'appeal')}>
                                    <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}}>
                                        {item?.Appeal_Icon?
                                            <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}} source={{uri: replaceHTTP(item?.Appeal_Icon) }}/>
                                            :null}
                                    </View>
                                    <Text style={{width: layout.width / 3, textAlign: 'center'}} numberOfLines={2}>{item?.Appeal_Name}</Text>
                                </TouchableOpacity>
                            )
                        }}
                        keyExtractor={(item, index) => 'search-donate-3-appeals-' + index + String(item)}
                    />
                </View>
                <View style={[styles.appsWrapper, {paddingBottom: 0}]}>
                    <View style={{marginBottom: 16}}>
                        <Text fonts={'DemiBold'}>CAMPAIGNS</Text>
                    </View>
                    <FlatList
                        horizontal
                        data={params?.data?.Campaigns}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity style={{marginRight: 16, marginBottom: 16}} onPress={() => goToSearchDonate4Screen(item, 'campaign')}>
                                    <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}}>
                                        {item?.Campaign_Icon?
                                            <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, borderRadius: 8, marginBottom: 8,backgroundColor:color.primary}} source={{uri: replaceHTTP(item?.Campaign_Icon) }}/>
                                            :null}
                                    </View>
                                    <Text style={{width: layout.width / 3, textAlign: 'center'}} numberOfLines={2}>{item?.Campaign_Name}</Text>
                                </TouchableOpacity>
                            )
                        }}
                        keyExtractor={(item, index) => 'search-donate-3-campaigns-' + index + String(item)}
                    />
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
                        keyExtractor={(item, index) => 'search-donate-3-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
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
    backText: {
        marginLeft: 4,
        color: color.green
    },
});
