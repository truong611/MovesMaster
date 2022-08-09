// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
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
import { DetailActivity, Header, MButton, Screen, Text } from '../../components';
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { color } from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import { calculateDate, formatDate, formatNumber, showToast, StatusBarHeight, timestampToDate } from "../../services";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { FETCH_getMasterDataUploadActivity, FETCH_uploadActivity } from "./activity-service";
import { images } from "../../images";
import Share from "react-native-share";
import ViewShot, { captureRef } from "react-native-view-shot";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const UploadActivityScreen = observer(function UploadActivityScreen() {
    const navigation = useNavigation();
    const { movesModel } = useStores();
    const [modalVisible, setModalVisible] = useState<any>({
        confirm: false,
        success: false,
        detail: false
    });
    const [listData, setListData] = useState<any>([]);
    const [totalMoves, setTotalMoves] = useState(0);
    const [lastUpload, setLastUpload] = useState(new Date());
    const [isLoading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    const [masterData, setMasterData] = useState<any>(null);

    const viewRef = useRef();

    const { refetch } = useQuery(FETCH_getMasterDataUploadActivity);

    const [uploadActivity, { }] = useMutation(FETCH_uploadActivity);

    useEffect(() => {
        fetchMasterData();
    }, [isFocused, isRefresh]);
    const fetchMasterData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            // setLoading(true);
            let activity = await movesModel.getActivity();
            setListData(activity);

            try {
                let { data: { getMasterDataUploadActivity: { data, message, messageCode } } } = await refetch();

                // setLoading(false);
                if (messageCode == 200) {
                    setLastUpload(new Date(data?.LastUpload));
                    setMasterData(data);
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                showToast('error', e.message)
            }
        }
    };

    const goToPage = (page, index = null) => {
        navigation.navigate('MainScreen', {
            screen: page,
            params: {
                id: index,
                masterData
            },
        });
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = { ...modalVisible };
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const ItemView = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={{ width: layout.width / 3, height: layout.width / 3, borderRadius: 16, backgroundColor: color.lightGrey, marginRight: 16, justifyContent: 'flex-end', alignItems: 'flex-start', padding: 8 }}
                onPress={() => {
                    goToPage('AddIndividualActivityItemsScreen', index)
                }}>
                <View style={{ zIndex: 1 }}>
                    <Text style={{ fontSize: 13 }}>{item?.Activity_Type_Name}</Text>
                    <Text style={{ fontSize: 16 }} fonts={'DemiBold'}>{formatNumber(item?.Units)}</Text>
                    <Text style={{ fontSize: 13 }}>{item?.Activity_Unit_Name}</Text>
                </View>
                {item?.Activity_Type_Icon ?
                    <Image style={{ width: layout.width / 3, height: layout.width / 3, borderRadius: 16, position: 'absolute' }} source={{ uri: item?.Activity_Type_Icon }} />
                    : null}
            </TouchableOpacity>
        )
    };

    const abandonUpload = async () => {
        await movesModel.clearActivity();
        // setRefresh(true)
        navigation.navigate('HomeScreen');
        await movesModel.setAppInfo({
            tabIndex: 1,
        });
    };

    const checkSubmit = () => {
        return true
    };

    const calculatorMoves = () => {
        let moves = 0;
        for (let i = 0; i < listData.length; i++) {
            let item = listData[i];
            let temp = parseFloat(item?.Units) / parseFloat(item?.Conversation_To_Moves_Rate);
            temp = Math.round(temp * 100) / 100;
            moves += temp;
        }
        let total_moves = 0;
        if (masterData?.Activity_Type_Entry?.length) {
            for (let i = 0; i < masterData?.Activity_Type_Entry?.length; i++) {
                if (masterData?.Activity_Type_Entry[i]?.Include_YN) {
                    total_moves += masterData?.Activity_Type_Entry[i]?.Moves_Arising
                }
            }
        }
        return formatNumber(moves + total_moves)
    };

    const submitUploadActivity = async () => {
        setLoading(true);
        try {
            let bodyData: any = [];
            let _totalMoves = 0;
            for (let i = 0; i < listData.length; i++) {
                let item = listData[i];
                bodyData = [...bodyData, {
                    "Activity_Start_Time": new Date(item?.FromDate).getTime(),
                    "Activity_End_Time": new Date(item?.ToDate).getTime(),
                    "Activity_Type_Unit_ID": item?.Activity_Type_Unit_ID,
                    "Number_Units": item?.Units
                }];
                let temp = parseFloat(item?.Units) / parseFloat(item?.Conversation_To_Moves_Rate);
                temp = Math.round(temp * 100) / 100;
                _totalMoves += temp
            }

            if (masterData?.Activity_Type_Entry?.length) {
                for (let i = 0; i < masterData?.Activity_Type_Entry?.length; i++) {
                    let item2 = masterData?.Activity_Type_Entry[i]
                    if (masterData?.Activity_Type_Entry[i]?.Include_YN) {
                        _totalMoves += masterData?.Activity_Type_Entry[i]?.Moves_Arising
                    }
                }
            }

            console.log("bodydata : ", bodyData);


            let { data: { uploadActivity: { messageCode, message } } } = await uploadActivity({
                variables: {
                    bodyData: bodyData
                },
            });
            setLoading(false);

            let _modalVisible = { ...modalVisible };
            _modalVisible['confirm'] = false;

            if (messageCode == 200) {
                setTotalMoves(_totalMoves);

                _modalVisible['success'] = true;
                setModalVisible(_modalVisible);

                let _donation = await movesModel.getDonateInfo();
                await movesModel.setDonateInfo({
                    movesAvailable: _donation?.movesAvailable + _totalMoves
                });

                await movesModel.clearActivity();

                setRefresh(true);
            } else {
                setModalVisible(_modalVisible);
                showToast('error', message)
            }
        } catch (e) {
            setLoading(false);
            showToast('error', e.message)
        }
    };

    const submit = async () => {
        if (checkSubmit()) {
            setChangeModal('confirm', true);
        }
    };

    const shareSocial = async () => {
        captureRef(viewRef, { format: "jpg", quality: 0.8, result: "base64" })
            .then(
                async (uri) => {
                    await Share.open({ url: `data:image/png;base64,${uri}` });
                },
                (error) => console.error("Oops, snapshot failed", error)
            );
    };


    const topComponent_modal = () => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => setChangeModal('detail', false)}
                    style={{ flexDirection: 'row', position: 'absolute' }}>
                    <Ionicons
                        name='return-up-back-outline'
                        color={color.green}
                        size={20} />
                    <Text style={styles.backText}>back</Text>
                </TouchableOpacity>
                <View style={styles.modalHeader}>
                    <Text fonts={'DemiBold'} style={{ textAlign: 'center', fontSize: 15 }}>Details Activity</Text>
                </View>
            </View>

        )
    }

    const topComponent = () => {
        let date = new Date().getTime();
        let total_moves = 0;
        if (masterData?.Activity_Type_Entry?.length) {
            for (let i = 0; i < masterData?.Activity_Type_Entry?.length; i++) {
                if (masterData?.Activity_Type_Entry[i]?.Include_YN) {
                    total_moves += masterData?.Activity_Type_Entry[i]?.Moves_Arising
                }
            }
        }

        return (
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 15, marginBottom: 8 }} fonts={'DemiBold'}>
                    Date of last upload: {formatDate(lastUpload, 'dd/MM/YYYY hh:mm')}
                </Text>
                <Text style={{ marginBottom: 8 }}>
                    From {timestampToDate(lastUpload, 'dd/MM/YYYY hh:mm')} to {timestampToDate(date, 'dd/MM/YYYY hh:mm')} ({calculateDate(lastUpload, date)})
                </Text>
                <Text style={{ marginBottom: 16 }}>
                    We have calculated
                    <Text style={{ fontSize: 15 }} fonts={'DemiBold'}> {formatNumber(total_moves)} Moves </Text>
                    from your devices and fitness app
                </Text>
                {total_moves > 0 ?
                    <View style={{ alignItems: 'center' }}>
                        <MButton
                            onPress={() => {
                                setChangeModal('detail', true)
                            }}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text='detail' />
                    </View>
                    : null}
                <Text style={{ marginBottom: 16 }}>Do you want to record other activities carried out in the same
                    period?</Text>
                <View style={{ marginBottom: 16 }}>
                    <Text fonts={'DemiBold'}>INDIVIDUAL ACTIVITIES</Text>
                </View>
                <View style={styles.appsWrapper}>
                    <View style={{ marginBottom: 16 }}>
                        <Text fonts={'DemiBold'}>RECENTLY ADDED</Text>
                    </View>
                    <FlatList
                        style={{ marginBottom: 16 }}
                        horizontal
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={listData}
                        renderItem={ItemView}
                        keyExtractor={(item, index) => item.toString() + index}
                    />
                    {masterData ?
                        <View style={[{ alignItems: 'center' },
                        listData?.length ? {} : { marginTop: -16 }
                        ]}>
                            <MButton
                                onPress={() => goToPage('AddIndividualActivityItemsScreen')}
                                style={styles.btnBlue}
                                styleText={styles.textWhite}
                                text='add' />
                        </View>
                        : null}
                </View>
                {listData?.length || total_moves > 0 ?
                    <View style={{ alignItems: 'center' }}>
                        <MButton
                            onPress={() => abandonUpload()}
                            style={styles.btnOrange}
                            styleText={styles.textWhite}
                            text='abandon upload' />
                        <MButton
                            onPress={() => submit()}
                            style={styles.btnBlue}
                            styleText={styles.textWhite}
                            text='submit upload' />
                    </View>
                    : null}
            </View>
        );
    };

    return (
        <>
            {isLoading && <CenterSpinner />}
            <Screen style={ROOT} preset="fixed">
                <View style={{ flex: 1 }}>
                    <Header
                        headerText='UPLOAD ACTIVITY'
                        onLeftPress={async () => {
                            navigation.navigate('HomeScreen');
                            await movesModel.setAppInfo({
                                tabIndex: 1,
                            });
                        }}
                    />
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{ flex: 1 }}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'upload-activity-' + index + String(item)}
                    />
                </View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.confirm}
                    onRequestClose={() => {
                    }}
                >
                    <>
                        {isLoading && <CenterSpinner />}
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={{ textAlign: 'center', marginBottom: 16 }}>
                                    There are
                                    <Text style={{ color: color.blue }}> {calculatorMoves()} </Text>
                                    moves recorded in this time period.
                                </Text>
                                <Text style={{ textAlign: 'center', marginBottom: 16 }}>Are you sure you wish to replace these
                                    existing moves with your new data?</Text>
                                <View style={{ alignItems: 'center' }}>
                                    <MButton
                                        onPress={() => submitUploadActivity()}
                                        style={styles.btnBlue}
                                        styleText={styles.textWhite}
                                        text='submit upload' />
                                    <TouchableOpacity onPress={() => setChangeModal('confirm', false)}>
                                        <Text style={{ color: color.blue }}>cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
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
                                contentContainerStyle={{ flexGrow: 1 }}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                style={{ flex: 1, }}
                                renderItem={null}
                                data={[]}
                                ListEmptyComponent={() => {
                                    return (
                                        <View style={styles.listEmptyComponent}>
                                            <View style={{ backgroundColor: color.primary }}>
                                                <TouchableOpacity
                                                    style={styles.backWrapper}
                                                    onPress={() => setChangeModal('success', false)}>
                                                    <Ionicons
                                                        name='return-up-back-outline'
                                                        color={color.green}
                                                        size={20} />
                                                    <Text style={styles.backText}>back</Text>
                                                </TouchableOpacity>
                                                <ViewShot ref={viewRef}>
                                                    <View style={{ backgroundColor: color.primary }}>
                                                        <View style={{ marginBottom: 16 }}>
                                                            <Image
                                                                resizeMode={"contain"}
                                                                style={styles.balloons}
                                                                source={images.balloons} />
                                                        </View>
                                                        <View style={styles.thanksWrapper}>
                                                            <Text style={styles.thanksTitle}>
                                                                Thank you for adding your moves
                                                            </Text>
                                                            <Text style={styles.thanksMoves} fonts={'DemiBold'}>
                                                                {formatNumber(totalMoves)} Moves were added
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </ViewShot>
                                            </View>
                                            <View style={{ alignItems: 'center', backgroundColor: color.primary }}>
                                                <MButton
                                                    onPress={() => {
                                                        setChangeModal('success', false)
                                                        goToPage('ViewActivityScreen')
                                                    }}
                                                    style={[styles.btnBlue, {}]}
                                                    styleText={styles.textWhite}
                                                    text='view details' />
                                                <TouchableOpacity
                                                    style={styles.shareWrapper}
                                                    onPress={() => shareSocial()}>
                                                    <Text>share your moves</Text>
                                                    <View style={styles.shareIcons}>
                                                        <Ionicons name='logo-facebook' color={color.green} size={32} />
                                                        <Ionicons name='logo-twitter' color={color.green} size={32} />
                                                        <Ionicons name='logo-linkedin' color={color.green} size={32} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ backgroundColor: color.primary }}>
                                                <Text style={styles.thanksDonate}>ready to donate</Text>
                                                <TouchableOpacity style={styles.thanksDonateBtn} onPress={async () => {
                                                    setChangeModal('success', false);
                                                    navigation.navigate('HomeScreen');
                                                    await movesModel.setAppInfo({
                                                        tabIndex: 0,
                                                    });
                                                }}>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24} />
                                                    <Text>donate</Text>
                                                    <Ionicons name={'heart-circle-outline'} color="white" size={24} />
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
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.detail}
                    onRequestClose={() => {
                    }}
                >
                    <>
                        {isLoading && <CenterSpinner />}
                        <View style={styles.centeredView}>
                            <View style={styles.modalView3}>

                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    style={{ flex: 1 }}
                                    renderItem={({ item, index }) => <DetailActivity item={item} />}
                                    data={masterData?.Activity_Type_Entry}
                                    ListHeaderComponent={topComponent_modal()}
                                    keyExtractor={(item, index) => 'view-activity-modal-' + index + String(item)}
                                />

                            </View>

                        </View>
                    </>
                </Modal>
            </Screen>

        </>
    );
});

const styles = StyleSheet.create({
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 2,
    },
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: layout.width / 2,
    },
    textWhite: {
        color: color.white
    },
    appsWrapper: {
        backgroundColor: color.tabbar,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 16,
        marginBottom: 16
    },
    centeredView: {
        flex: 1,
    },
    modalView: {
        flex: 1,
        backgroundColor: color.primary,
        opacity: .95,
        paddingVertical: layout.width / 4,
        paddingHorizontal: layout.width / 8
    },
    modalView2: {
        flex: 1,
        backgroundColor: color.primary,
        opacity: 1,
        // paddingVertical: layout.width / 6,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: StatusBarHeight
    },
    modalView3: {
        flex: 1,
        backgroundColor: color.primary,
        padding: 16
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20
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
        // marginHorizontal: 16,
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
        height: layout.width / 2,
        width: layout.width
    },
    thanksWrapper: {
        paddingHorizontal: 16, alignItems: 'center'
    },
    thanksTitle: {
        textAlign: 'center',
        fontSize: 16,
        // marginBottom: 16,
        width: layout.width * 2 / 3,
        // backgroundColor: 'red',
        // marginTop: 16,
        marginBottom: 16,
    },
    thanksDonate: {
        color: color.danger,
        marginVertical: 16,
        textAlign: 'center'
    },
    thanksMoves: {
        // color: color.danger,
        // marginBottom: 8
        fontSize: 22,
        marginBottom: 16,
        // marginTop: 16
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
        // marginBottom: 32
    },
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16
    },
    backText: {
        marginLeft: 4,
        color: color.green
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
