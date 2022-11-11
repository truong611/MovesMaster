// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Header, Input, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
// import { useStores } from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {regexPassword, regexString, showToast} from '../../services';
import {useMutation} from "@apollo/react-hooks";
import {FETCH_changePassword, FETCH_updateProfile} from "./profile-service";
import {useStores} from "../../models";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const ChangePasswordScreen = observer(function ChangePasswordScreen() {
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const [formData, setFormData] = useState<any>({
        // passwordOld: '',
        passwordNew: '',
        passwordConfirm: '',
        // passwordOldSecure: true,
        passwordNewSecure: true,
        passwordConfirmSecure: true,
    });
    const [changePassword, {}] = useMutation(FETCH_changePassword);
    const [isShow, setShow] = useState(false);
    const isFocused = useIsFocused();
    const ref_input_new_password = useRef();
    const ref_input_confirm_password = useRef();

    useEffect(() => {
        fetchData();
    }, [isFocused]);
    const fetchData = async () => {
        if (isFocused) {
            resetData()
        }
    };

    const resetData = () => {
        setFormData({
            // passwordOld: '',
            passwordNew: '',
            passwordConfirm: '',
            // passwordOldSecure: true,
            passwordNewSecure: true,
            passwordConfirmSecure: true,
        });
        setSubmit(false);
    };

    const setChangeText = (type, value) => {
        let _formData = {...formData};
        _formData[type] = value;
        setFormData(_formData);
    };

    const checkSubmit = () => {
        setSubmit(true);
        // if (regexString(formData?.passwordOld)) {
        //     showToast('error', 'current password cannot be empty');
        //     return false;
        // }
        if (regexString(formData?.passwordNew)) {
            showToast('error', 'new password cannot be empty');
            return false;
        }
        if (regexString(formData?.passwordConfirm)) {
            showToast('error', 'confirm password cannot be empty');
            return false;
        }
        if (formData?.passwordConfirm != formData?.passwordNew) {
            showToast('error', 'password and confirm password does not match');
            return false;
        }else{
            if (regexPassword(formData?.passwordNew)) {
                setShow(true)
                showToast('error', 'password must have at least six characters, at least one uppercase letter, one lowercase letter and at least 1 number');
                return false;
            }else setShow(false)
        }
        if (formData?.passwordOld == formData?.passwordNew) {
            showToast('error', 'current password and new password cannot be same');
            return false;
        }
        return true;
    };

    const submit = async () => {
        if (checkSubmit()) {
            setLoading(true);
            try {
                let {data: {changePassword: {messageCode, message}}} = await changePassword({
                    variables: {
                        // "passwordOld": formData?.passwordOld,
                        "passwordNew": formData?.passwordNew
                    },
                });
                setLoading(false);
                if (messageCode == 200) {
                    resetData();
                    showToast('success', message);
                    navigation.navigate('MainScreen', {screen: 'ProfileScreen'})
                    // navigation.navigate('ProfileScreen')
                    // await movesModel.setUserInfo({
                    //     password: formData?.passwordNew
                    // })
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const topComponent = () => {
        return (
            <View style={{paddingVertical: 16}}>
                <View style={{paddingHorizontal: 16}}>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>CHANGE PASSWORD</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 16}}>
                    {/* <Text style={styles.infoText}>current password</Text>
                    <Input
                        onSubmitEditing={() => ref_input_new_password.current?.focus()}
                        blurOnSubmit={false}
                        style={styles.input}
                        placeholder=''
                        secureTextEntry={formData?.passwordOldSecure}
                        onChangeSecure={() => setChangeText('passwordOldSecure', !formData?.passwordOldSecure)}
                        status={isSubmit && regexString(formData?.passwordOld) ? 'danger' : 'none'}
                        value={formData?.passwordOld}
                        onChangeText={(value) => setChangeText('passwordOld', value)}
                    /> */}
                    <Text style={styles.infoText}>new password</Text>
                    <Input
                        innerRef={ref_input_new_password}
                        onSubmitEditing={() => ref_input_confirm_password.current?.focus()}
                        blurOnSubmit={false}
                        style={styles.input}
                        placeholder=''
                        secureTextEntry={formData?.passwordNewSecure}
                        onChangeSecure={() => setChangeText('passwordNewSecure', !formData?.passwordNewSecure)}
                        status={isSubmit && (regexString(formData?.passwordNew) || regexPassword(formData?.passwordNew)) ? 'danger' : 'none'}
                        value={formData?.passwordNew}
                        // onFocus={() => setShow(true)}
                        // onBlur={() => setShow(false)}
                        onChangeText={(value) => setChangeText('passwordNew', value)}
                    />
                    {isShow && regexPassword(formData?.passwordNew) ?
                        <Text style={styles.passDescription}
                              text='password must have at least six characters, at least one uppercase letter, one lowercase letter and at least one number'/>
                        : null}
                    <Text style={styles.infoText}>confirm password</Text>
                    <Input
                        innerRef={ref_input_confirm_password}
                        onSubmitEditing={() => submit()}
                        blurOnSubmit={false}
                        style={styles.input}
                        placeholder=''
                        secureTextEntry={formData?.passwordConfirmSecure}
                        onChangeSecure={() => setChangeText('passwordConfirmSecure', !formData?.passwordConfirmSecure)}
                        status={isSubmit && (regexString(formData?.passwordConfirm) || formData?.passwordNew != formData?.passwordConfirm) ? 'danger' : 'none'}
                        value={formData?.passwordConfirm}
                        onChangeText={(value) => setChangeText('passwordConfirm', value)}
                    />
                    <MButton
                        onPress={submit}
                        style={styles.editDetails}
                        styleText={styles.editDetailsText}
                        text='save'/>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainScreen', {screen: 'EditProfileScreen'})}>
                        <Text>back</Text>
                    </TouchableOpacity>
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
                        keyExtractor={(item, index) => 'change-password-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    passDescription: {
        width: layout.width * 3 / 4,
        marginBottom: 8,
        fontSize: 12,
        color: color.danger,
        textAlign: 'center'
    },
    avatarWrapper: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: layout.width / 8,
        backgroundColor: color.lighterGrey,
        marginBottom: 15,
    },
    infoText: {
        marginBottom: 8,
    },
    editDetails: {
        backgroundColor: color.orange,
        marginTop: 16,
    },
    editDetailsText: {
        color: color.white,
    },
    input: {
        backgroundColor: color.tabbar,
        marginBottom: 8,
    },
});
