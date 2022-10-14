import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    // Animated,
    Dimensions,
    FlatList,
    // Image,
    Modal,
    StyleSheet,
    // TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import {BtnBack, Header, Input, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation, useRoute} from "@react-navigation/native"
// import { useStores } from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
// import Ionicons from "react-native-vector-icons/Ionicons";
import {regexEmail, regexString, showToast, StatusBarHeight} from "../../services";
import {useMutation} from "@apollo/react-hooks";
import {FETCH_recommendCharity} from "./donate-service";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import ViewShot from "react-native-view-shot";
import {useStores} from "../../models";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const RecommendDonateScreen = observer(function RecommendDonateScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [formData, setFormData] = useState({
        charityName: "",
        charityEmail: "",
    });
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const {params}: any = useRoute();
    const [modalVisible, setModalVisible] = useState<any>({
        success: false
    });
    // const {movesModel} = useStores();

    const [recommendCharity, {}] = useMutation(FETCH_recommendCharity);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();
        }
    };

    const resetData = () => {
        setFormData({
            charityName: "",
            charityEmail: "",
        });
        setSubmit(false);
    };

    const setChangeModal = (type, value) => {
        let _modalVisible = {...modalVisible};
        _modalVisible[type] = value;
        setModalVisible(_modalVisible);
    };

    const setChangeInput = (type, value) => {
        let _formData = {...formData};
        _formData[type] = value;
        setFormData(_formData);
    };

    const checkSubmit = () => {
        setSubmit(true);
        if (regexString(formData?.charityName)) {
            showToast('error', 'charity name cannot be empty');
            return false;
        }
        // if (regexString(formData?.charityEmail)) {
        //     showToast('error', 'charity email cannot be empty');
        //     return false;
        // }
        // if (regexEmail(formData?.charityEmail)) {
        //     showToast('error', 'invalid email address');
        //     return false;
        // }
        return true
    };

    const submit = async () => {
        if (checkSubmit()) {
            setLoading(true);
            try {
                let {data: {recommendCharity: {messageCode, message}}} = await recommendCharity({
                    variables: {
                        "bodyData": {
                            Charity_Name: formData?.charityName?.trim(),
                            Charity_Email: formData?.charityEmail?.trim(),
                        }
                    },
                });
                setLoading(false);
                if (messageCode == 200) {
                    setChangeModal('success', true)
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
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

    const goToPage = (page: any) => {
        navigation.navigate(page);
    };

    const topComponent = () => {
        return (
            <View>
                <BtnBack title="Recommend Charity" goBack={goBack}/>
                <View style={{
                    paddingHorizontal: 16,
                }}>
                    <Text style={{marginBottom: 16}}>Please enter the name of the charity you would like to see register
                        with Moves and we'll see if we can persuade them</Text>
                    <Text style={{marginBottom: 16}}>Their email would be useful if you know it. Thanks</Text>
                    <Text style={styles.label}>charity name</Text>
                    <Input
                        style={[styles.mb16, styles.input]}
                        placeholder=''
                        status={isSubmit && regexString(formData?.charityName) ? 'danger' : 'none'}
                        value={formData?.charityName}
                        onChangeText={nextValue => setChangeInput('charityName', nextValue)}
                    />
                    <Text style={styles.label}>charity email</Text>
                    <Input
                        style={[styles.mb16, styles.input]}
                        placeholder=''
                        // status={isSubmit && (regexString(formData?.charityEmail) || regexEmail(formData?.charityEmail)) ? 'danger' : 'none'}
                        status={'none'}
                        value={formData?.charityEmail}
                        onChangeText={nextValue => setChangeInput('charityEmail', nextValue)}
                    />
                    <View style={{alignItems: 'center', marginTop: 8}}>
                        <MButton
                            onPress={() => submit()}
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
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'recommend-donate-' + index + String(item)}
                    />
                </View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={modalVisible?.success}
                    onRequestClose={() => {
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={[styles.modalView]}>
                            <View style={{
                                backgroundColor: color.primary,
                                width: layout.width - 32,
                                padding: 16,
                                borderRadius: 16
                            }}>
                                <Text style={{textAlign: 'center', fontSize: 18, marginVertical: 16}} fonts='DemiBold'>Recommend Charity</Text>
                                <Text style={{textAlign: 'center', fontSize: 16, marginBottom: 16}} fonts='DemiBold'>Thanks</Text>
                                <View style={{marginTop: 8}}>
                                    <Text style={{marginBottom: 16}}>Charity name:
                                        <Text style={{marginBottom: 16}} fonts='DemiBold'> {formData?.charityName}</Text>
                                    </Text>
                                    <Text style={{marginBottom: 16}}>Charity email:
                                        <Text style={{marginBottom: 16}} fonts='DemiBold'> {formData?.charityEmail}</Text>
                                    </Text>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <MButton
                                        onPress={async () => {                            
                                            // setRefresh(true);
                                            setChangeModal('success', false)
                                            goToPage('HomeScreen');
                                            await movesModel.setAppInfo({
                                                tabIndex: 0,
                                            });
                                        }}
                                        style={styles.btnBlue}
                                        styleText={styles.textWhite}
                                        text='ok'/>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    btnBlue: {
        backgroundColor: color.blue,
        maxWidth: layout.width / 2,
        marginBottom: 8,
        marginTop: 8
    },
    centeredView: {
        flex: 1,
    },
    modalView: {
        flex: 1,
        backgroundColor: '#80808073',
        // backgroundColor: color.primary,
        paddingTop: StatusBarHeight,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        // backgroundColor:'red'
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
    label: {
        marginBottom: 8
    },
    input: {
        backgroundColor: color.tabbar,
        width: layout.width - 32
    },
    mb16: {
        marginBottom: 16
    },
});
