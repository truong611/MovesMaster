import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import {BtnBack, Header, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {formatNumber, replaceHTTP,} from "../../services";
import {useStores} from "../../models";
import {Donate} from "../../components/donate/donate";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const SearchDonate2Screen = observer(function SearchDonate2Screen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const {params}: any = useRoute();
    // const [donateInfo, setDonateInfo] = useState({
    //     donatedMoves: 0,
    //     amountDonated: 0,
    //     movesAvailable: 0,
    // });
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    // const {movesModel} = useStores();

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
        navigation.navigate('MainScreen', {screen: 'SearchDonateScreen'});
    };

    const goToRecommendDonateScreen = () => {
        navigation.navigate('MainScreen', {
            screen: 'RecommendDonateScreen',
            params: {
                list: params?.list,
            },
        });
    };

    const goToSearchDonate3Screen = (data) => {
        navigation.navigate('MainScreen', {
            screen: 'SearchDonate3Screen',
            params: {
                list: params?.list,
                data
            },
        });
    };

    const topComponent = () => {
        return (
            <View>
                <BtnBack title="Charity Search" goBack={goBack}/>
                <Donate title={'DONATIONS'}/>
            </View>
        );
    };

    const footerComponent = () => {
        return (
            <View>
                <View style={{paddingHorizontal: 16, marginBottom: 16}}>
                    <Text style={[
                        params?.list?.length ? {marginTop: 8} : {}
                    ]}>not found? recommend charity register with moves?</Text>
                    <View style={{alignItems: 'center', marginTop: 8}}>
                        <MButton
                            onPress={() => goToRecommendDonateScreen()}
                            style={styles.btnDanger}
                            styleText={styles.textWhite}
                            text={'recommend'}/>
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
                    {topComponent()}
                    <ScrollView nestedScrollEnabled={true} style={{width: "100%"}}
                                showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        {params?.list?.length ?
                            <View style={{backgroundColor: color.tabbar, marginHorizontal: 16, borderRadius: 16}}>
                                {/* <ScrollView horizontal={true} scrollEnabled={false} style={{width: '100%'}} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}> */}
                                    <FlatList
                                        style={{width: '100%' ,paddingHorizontal: 16}}
                                        ListHeaderComponent={() => {
                                            return (
                                                <></>
                                            )
                                        }}
                                        data={params?.list}
                                        renderItem={({item, index}) => {
                                            return (
                                                <TouchableOpacity style={[
                                                    {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
                                                    index == 0 ? {marginTop: 16} : {}
                                                ]} onPress={() => goToSearchDonate3Screen(item)}>
                                                    <View style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, marginRight: 16, borderRadius: 8, backgroundColor: color.primary}}>
                                                        {item?.Charity_icon?
                                                            <Image resizeMode={"contain"} style={{width: layout.width / 3, height: (layout.width / 3) * 2 / 3, marginRight: 16, borderRadius: 8, backgroundColor: color.primary}} source={{uri: replaceHTTP(item?.Charity_icon)}}/>
                                                            :null}
                                                    </View>
                                                    <Text style={{width: layout.width - 32 - 32 - (layout.width / 3) - 16}} numberOfLines={3}>{item?.Charity_Name}</Text>
                                                </TouchableOpacity>
                                            )
                                        }}
                                        keyExtractor={(item, index) => 'search-donate-2-result-' + index + String(item)}
                                    />
                                {/* </ScrollView> */}
                            </View>
                            : footerComponent()}
                    </ScrollView>
                    {params?.list?.length ?
                        footerComponent()
                        : null}
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
        paddingTop: 12,
        paddingBottom: 8,
        // marginBottom: 0
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
