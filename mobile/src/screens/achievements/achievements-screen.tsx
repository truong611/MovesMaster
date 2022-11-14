import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import {Badge, BtnBack, Header, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from "@react-navigation/native"
import {color} from '../../theme';
import {formatNumber, replaceHTTP, showToast, timestampToDate} from "../../services";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getBadgeAwarded} from "./achievements-service";
import CenterSpinner from "../../components/center-spinner/center-spinner";
import Ionicons from "react-native-vector-icons/Ionicons";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const AchievementsScreen = observer(function AchievementsScreen() {
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [listBadge, setListBadge] = useState<any>([]);
    const [listBadgeAwarded, setListBadgeAwarded] = useState<any>(null);
    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState<any>({
        isShow: false,
        value: null
    });

    const {refetch} = useQuery(FETCH_getBadgeAwarded);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let {data: {getBadgeAwarded: {BadgeAwarded, Badge, message, messageCode}}} = await refetch();
                setLoading(false);
                if (messageCode == 200) {
                    let _badge: any[] = [
                        {title: 'moves donated', values: []},
                        {title: 'money donated via moves', values: []},
                        {title: 'money donated personally', values: []},
                    ];
                    if (Badge?.length) {
                        let _Badge = Badge.map((item) =>
                            Object.assign({}, item)
                        );
                        for (let i = 0; i < _Badge.length; i++) {
                            let item = _Badge[i];
                            // item.Badge_Icon = 'https://www12.lunapic.com/editor/premade/transparent.gif';
                            if (item?.Badge_Type == 0) {
                                _badge[0].values.push(item)
                            } else if (item?.Badge_Type == 1) {
                                _badge[1].values.push(item)
                            } else if (item?.Badge_Type == 2) {
                                _badge[2].values.push(item)
                            }
                        }
                    }
                    setListBadge(_badge);

                    let _badgeAwarded: any = null;
                    if (BadgeAwarded?.length) {
                        _badgeAwarded = BadgeAwarded.reduce((item, cur) => (item[cur.Badge_ID] = cur, item), {})
                    }
                    setListBadgeAwarded(_badgeAwarded);
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const goBack = async () => {
        navigation.navigate('MainScreen', {screen: 'ProfileScreen'})
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const toggleModal = (value = null) => {
        if(value) {
            let _modalVisible = {...modalVisible};
            _modalVisible.isShow = true;
            _modalVisible.value = value;
            setModalVisible(_modalVisible)
        } else {
            let _modalVisible = {...modalVisible};
            _modalVisible.isShow = false;
            _modalVisible.value = null;
            setModalVisible(_modalVisible)
        }
    };

    const topComponent = () => {
        return (
            <View style={styles.container}>
                <BtnBack title="My Achievements" goBack={goBack}/>
                {listBadge?.length ?
                    listBadge.map((item, index) => {                  
                        return (
                            <View key={'achievements-' + item + index} style={styles.listContainer}>
                                <Text style={styles.title}>{item?.title}</Text>
                                <View style={styles.donationsWrapper}>
                                    {item?.values?.length ?
                                        item?.values.map((value, i) => {
                                            let active = listBadgeAwarded && value?.Badge_ID && listBadgeAwarded[value?.Badge_ID];                                         
                                            return (
                                                <View key={'achievements-item-' + value + i}>
                                                    <Badge
                                                        value={value}
                                                        active={active}
                                                        toggleModal={toggleModal}
                                                    />
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
                        keyExtractor={(item, index) => 'achievements-' + index + String(item)}
                    />
                </View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.isShow}
                    onRequestClose={() => {
                    }}
                >
                    <>
                        <View style={styles.centeredView}>
                            <TouchableOpacity
                                style={styles.modalView}
                                activeOpacity={1}
                                onPress={() => toggleModal()}>
                                <View style={{position: 'absolute', right: 16, top: 16}}>
                                    <Ionicons name={'close-outline'} color="white" size={32}/>
                                </View>
                                {listBadgeAwarded && modalVisible?.value?.Badge_ID && listBadgeAwarded[modalVisible?.value?.Badge_ID] ?
                                    <Text style={[styles.Badge_Name, {marginBottom: 8}]}>You are a</Text>
                                    : null}
                                <Text style={[styles.Badge_Name, {marginBottom: 16}]}>{modalVisible?.value?.Badge_Name}</Text>
                                <View style={[styles.donationsItem, {marginBottom: 32, width: (layout.width - 16 * 3) * 50 / 100, height: 42 + (layout.width - 16 * 3) * 50 / 100,}]}>
                                    <View style={[styles.iconWrapper, {width: ((layout.width - 16 * 3) * 50 / 100) - 32, height: ((layout.width - 16 * 3) * 50 / 100) - 32,}]}>
                                        {modalVisible?.value?.Badge_Icon ?
                                            <Image resizeMode={"contain"} style={[styles.icon, styles.Badge_Icon, listBadgeAwarded && modalVisible?.value?.Badge_ID && listBadgeAwarded[modalVisible?.value?.Badge_ID] ? {} : {tintColor: 'gray'}]}
                                                   source={{uri: replaceHTTP(modalVisible?.value?.Badge_Icon)}}/>
                                            : null}
                                    </View>
                                    <View style={[styles.flagBottom, {borderBottomWidth: (((layout.width - 16 * 3) * 50 / 100) - 32)/3, borderLeftWidth: ((layout.width - 16 * 3) * 50 / 100) / 2, borderRightWidth: ((layout.width - 16 * 3) * 50 / 100) / 2,}]}/>
                                </View>
                                {listBadgeAwarded && modalVisible?.value?.Badge_ID && listBadgeAwarded[modalVisible?.value?.Badge_ID] ?
                                    <Text style={[styles.Badge_Awarded_Times]}>no. {(listBadgeAwarded[modalVisible?.value?.Badge_ID]?.Badge_Awarded_Times)}</Text>
                                    : null}
                                {listBadgeAwarded && modalVisible?.value?.Badge_ID && listBadgeAwarded[modalVisible?.value?.Badge_ID] ?
                                    <Text style={[styles.Badge_Awarded_Date]}>{timestampToDate(listBadgeAwarded[modalVisible?.value?.Badge_ID]?.Badge_Awarded_Date)}</Text>
                                    : null}
                                {listBadgeAwarded && modalVisible?.value?.Badge_ID && listBadgeAwarded[modalVisible?.value?.Badge_ID] ?
                                    <Text style={[styles.Badge_Reason]}>{modalVisible?.value?.Badge_Reason}</Text>
                                    : <Text style={[styles.Badge_Reason]}>{`to achieve this badge, you must have completed ${formatNumber(modalVisible?.value?.Badge_Condition)} ${modalVisible?.value?.Badge_Type == 0 ? 'moves' : '£'}`}</Text>}
                            </TouchableOpacity>
                        </View>
                    </>
                </Modal>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: color.tabbar
    },
    modalView: {
        flex: 1,
        backgroundColor: color.tabbar,
        paddingVertical: layout.width / 4,
        paddingHorizontal: layout.width / 8,
        alignItems: 'center',
        marginTop: 30
    },
    title: {
        fontSize: 15, marginBottom: 12, color: color.warning, textAlign: 'center'
    },
    container: {
        paddingBottom: 16
    },
    flag: {},
    listContainer: {
        backgroundColor: color.tabbar,
        padding: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 16
    },
    itemTitle: {
        textAlign: 'center',
        width: (layout.width - 16 * 3) * 30 / 100,
    },
    flagBottom: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: 0,
        height: 0,
        borderBottomWidth: ((layout.width - 16 * 3) * 30 / 100) / 3,
        borderBottomColor: color.tabbar,
        borderLeftWidth: layout.width / 8,
        borderLeftColor: color.primary,
        borderRightWidth: layout.width / 8,
        borderRightColor: color.primary,
    },
    appsWrapper: {
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 12,
        paddingBottom: 8,
        marginBottom: 12
    },
    donationsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
        marginHorizontal: -8
    },
    flagTop: {
        width: layout.width / 4,
        height: layout.width / 3.5,
        backgroundColor: color.primary,
    },
    donationsItem: {
        width: (layout.width - 16 * 3) * 30 / 100,
        height: 56 + (layout.width - 16 * 3) * 30 / 100,
        marginHorizontal: '1.5%',
        backgroundColor: color.primary,
        alignItems: 'center',
        paddingTop: 16,
        marginBottom: 8
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
    iconWrapper: {
        backgroundColor: color.primary,
        width: ((layout.width - 16 * 3) * 30 / 100) - 32,
        height: ((layout.width - 16 * 3) * 30 / 100) - 32,
        marginBottom: 8
    },
    icon: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        backgroundColor: color.primary,
    },
    Badge_Name: {
        fontSize: 24, lineHeight: 24,
        textAlign: 'center'
    },
    Badge_Reason: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24
    },
    Badge_Awarded_Date: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 16
    },
    Badge_Awarded_Times: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 16,
        color: color.warning
    },
    Badge_Icon: {}
});
