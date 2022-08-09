import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions, Image, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Input, MButton, Screen, Text} from '../../components';
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import {color} from '../../theme';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {images} from '../../images';
import {regexString, showToast} from '../../services';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const IMAGE_HEIGHT_SMALL = Dimensions.get('window').width / 5;

export const ResetPasswordScreen = observer(function ResetPasswordScreen() {
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const navigation = useNavigation();
    const [formData, setFormData] = useState<any>({
        password: '',
        passwordConfirm: '',
        passwordSecure: true,
        passwordConfirmSecure: true,
    });
    const isFocused = useIsFocused();

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
            password: '',
            passwordConfirm: '',
            passwordSecure: true,
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
        if (regexString(formData?.password)) {
            showToast('error', 'password cannot be empty');
            return false;
        }
        if (regexString(formData?.passwordConfirm)) {
            showToast('error', 'confirm password cannot be empty');
            return false;
        }
        if (formData?.password != formData?.passwordConfirm) {
            showToast('error', 'password and confirm password does not match');
            return false;
        }
        return true;
    };

    const submit = async () => {
        if (checkSubmit()) {
            goToPage('LoginScreen');
        }
    };

    const goToPage = (page) => {
        navigation.navigate(page);
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={ROOT} preset="fixed">
                <View style={styles.container}>
                    <Animated.Image source={images.login_1} style={[styles.login_1, {height: IMAGE_HEIGHT_SMALL}]}/>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{marginBottom: 24}}>create new password</Text>
                        <Input placeholder='password'
                               secureTextEntry={formData?.passwordSecure}
                               onChangeSecure={() => setChangeText('passwordSecure', !formData?.passwordSecure)}
                               status={isSubmit && regexString(formData?.password) ? 'danger' : ''}
                               value={formData?.password}
                               onChangeText={(value) => setChangeText('password', value)}/>
                        <Input placeholder='confirm password'
                               secureTextEntry={formData?.passwordConfirmSecure}
                               onChangeSecure={() => setChangeText('passwordConfirmSecure', !formData?.passwordConfirmSecure)}
                               status={isSubmit && (regexString(formData?.passwordConfirm) || formData?.password != formData?.passwordConfirm) ? 'danger' : ''}
                               value={formData?.passwordConfirm}
                               onChangeText={(value) => setChangeText('passwordConfirm', value)}/>
                        <MButton onPress={submit} text='reset password'/>
                        <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() => goToPage('LoginScreen')}>
                            <Text style={styles.signUpText}>cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Image resizeMode={'contain'} style={styles.login_2} source={images.login_2}/>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    login_1: {
        marginBottom: 32,
        resizeMode: 'contain',
    },
    login_2: {
        position: 'absolute',
        width: layout.width,
        bottom: -32,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    forgotPasswordWrapper: {
        marginBottom: 16,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: color.danger,
    },
    signUpText: {
        color: color.danger,
    },
});
