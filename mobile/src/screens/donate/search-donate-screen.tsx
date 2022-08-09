import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {BtnBack, Header, Input, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from "@react-navigation/native"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {displayMultiSelect, formatNumber, regexString, showToast} from "../../services";
import {Select, SelectItem} from "@ui-kitten/components";
import {useStores} from "../../models";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getListCharity} from "./donate-service";
import {Donate} from "../../components/donate/donate";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const SearchDonateScreen = observer(function SearchDonateScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        keyword: "",
        geographic: "",
        size: [],
        charitySector: []
    });
    const [listSize, setListSize] = useState<any>([]);
    const [listCharitySector, setListCharitySector] = useState<any>([]);
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    // const [donateInfo, setDonateInfo] = useState({
    //     donatedMoves: 0,
    //     amountDonated: 0,
    //     movesAvailable: 0,
    // });

    const {refetch} = useQuery(FETCH_getListCharity);

    useEffect(() => {
        fetchMasterData();
    }, []);
    const fetchMasterData = async () => {
        if (refetch) {
            setLoading(true);
            try {
                let {data: {getListCharity: {Size, CharitySector, message, messageCode}}} = await refetch({
                    bodyData: {}
                });
                setLoading(false);
                if (messageCode == 200) {
                    setListSize(Size);
                    setListCharitySector(CharitySector)
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();
            // let _donation = await movesModel.getDonateInfo();
            // setDonateInfo({
            //     donatedMoves: _donation?.donatedMoves,
            //     amountDonated: _donation?.amountDonated,
            //     movesAvailable: _donation?.movesAvailable
            // });
        }
    };

    const resetData = () => {
        setFilter({
            keyword: "",
            geographic: "",
            size: [],
            charitySector: []
        })
    };

    const setChangeFilter = (type, value) => {
        let _filter = {...filter};
        _filter[type] = value;
        setFilter(_filter);
    };

    const checkSubmit = () => {
        if (regexString(filter?.keyword)
            && regexString(filter?.geographic)
            && !filter?.size?.length
            && !filter?.charitySector?.length) {
            showToast('error', 'please select at least one search condition');
            return false
        }
        return true
    };

    const goBack = async () => {
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 0,
        });
    };

    const submit = async () => {
        if (checkSubmit()) {
            let Size: any[] = [];
            filter?.size?.length && filter?.size.map(item => {
                Size = [...Size, parseInt(listSize[item['row']]['Category_ID'])]
            });

            let CharitySector: any[] = [];
            filter?.charitySector?.length && filter?.charitySector.map(item => {
                CharitySector = [...CharitySector, parseInt(listCharitySector[item['row']]['Category_ID'])]
            });

            setLoading(true);
            let payload = {
                "bodyData": {
                    "Keyword": regexString(filter?.keyword) ? null : filter?.keyword,
                    "Geographic": regexString(filter?.geographic) ? null : filter?.geographic,
                    "Size": !Size?.length ? null : Size,
                    "CharitySector": !CharitySector?.length ? null : CharitySector,
                }
            };
            let {data: {getListCharity: {Charity, message, messageCode}}} = await refetch(payload);
            setLoading(false);
            if (messageCode == 200) {
                navigation.navigate('MainScreen', {
                    screen: 'SearchDonate2Screen',
                    params: {
                        list: Charity,
                    },
                });
            } else {
                showToast('error', message)
            }
        }
    };

    const topComponent = () => {
        return (
            <View>
                <BtnBack title="Charity Search" goBack={goBack}/>
                <Donate title={'DONATIONS'}/>
                <View style={{paddingHorizontal: 16, marginBottom: 16}}>
                    <Text style={styles.label}>keyword</Text>
                    <Input
                        style={[styles.mb16, styles.input]}
                        placeholder=''
                        status={'none'}
                        value={filter?.keyword}
                        onChangeText={nextValue => setChangeFilter('keyword', nextValue)}
                    />
                    <Text style={styles.label}>geographic</Text>
                    <Input
                        style={[styles.mb16, styles.input]}
                        placeholder=''
                        status={'none'}
                        value={filter?.geographic}
                        onChangeText={nextValue => setChangeFilter('geographic', nextValue)}
                    />
                    <Text style={styles.label}>size</Text>
                    <Select
                        multiSelect={true}
                        placeholder='select size'
                        status={'primary'}
                        style={[styles.mb16]}
                        selectedIndex={filter?.size}
                        value={displayMultiSelect(listSize, filter?.size, 'Category_Name')}
                        onSelect={(index: any) => setChangeFilter('size', index)}>
                        {listSize?.length && listSize?.map((item, index) => {
                            return (
                                <SelectItem key={'listSize-' + item.toString() + index} title={item?.Category_Name}/>
                            )
                        })}
                    </Select>
                    <Text style={styles.label}>charity sector</Text>
                    <Select
                        multiSelect={true}
                        placeholder='select charity sector'
                        status={'primary'}
                        style={[styles.mb16]}
                        selectedIndex={filter?.charitySector}
                        value={displayMultiSelect(listCharitySector, filter?.charitySector, 'Category_Name')}
                        onSelect={(index: any) => setChangeFilter('charitySector', index)}>
                        {listCharitySector?.length && listCharitySector?.map((item, index) => {
                            return (
                                <SelectItem key={'listCharitySector-' + item.toString() + index} title={item?.Category_Name}/>
                            )
                        })}
                    </Select>
                    <View style={{alignItems: 'center', marginTop: 8}}>
                        <MButton
                            onPress={() => submit()}
                            style={styles.btnDanger}
                            styleText={styles.textWhite}
                            text={'search'}/>
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
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'search-donate-' + index + String(item)}
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
        // paddingBottom: 8
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
