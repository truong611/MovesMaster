// @ts-ignore
import jwtDecoder from 'jwt-decode';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Animated,
    Dimensions, FlatList, Image,
    StyleSheet,
    TouchableOpacity, View,
    ViewStyle,
} from 'react-native';
import {MButton, Input, Screen, Text, Checkbox} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {color} from '../../theme';
import {regexEmail, regexPassword, regexPhone, regexString, showToast} from '../../services';
import {login, signup} from '../../services/authActions';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {images} from '../../images';
import {useStores} from '../../models';

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const layout = Dimensions.get('window');

const IMAGE_HEIGHT = Dimensions.get('window').width / 2.5;
const IMAGE_HEIGHT_SMALL = Dimensions.get('window').width / 5;

export const LoginScreen = observer(function LoginScreen() {
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [formData, setFormData] = useState<any>({
        username: '',
        password: '',
        passwordSecure: true,
    });
    const navigation = useNavigation();
    const {movesModel} = useStores();
    const [imageHeight, setImageHeight] = useState(new Animated.Value(IMAGE_HEIGHT));
    const [isShow, setShow] = useState(false);
    const ref_input_password = useRef();
    const ref_input_surname = useRef();
    const ref_input_email = useRef();
    const ref_input_phone = useRef();
    const ref_input_new_password = useRef();
    const ref_input_confirm_password = useRef();

    useEffect(() => {
        if (tabIndex) {
            Animated.timing(imageHeight, {
                toValue: IMAGE_HEIGHT_SMALL,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(imageHeight, {
                toValue: IMAGE_HEIGHT,
                useNativeDriver: false,
            }).start();
        }
    }, [tabIndex]);

    const resetFormData = (isLogin) => {
        if (isLogin) {
            setFormData({
                username: '',
                password: '',
                passwordSecure: true,
            });
        } else {
            setFormData({
                surname: '',
                forename: '',
                email: '',
                phone: '',
                password: '',
                passwordConfirm: '',
                passwordSecure: true,
                passwordConfirmSecure: true,
                agree_1: false,
                agree_2: false,
            });
        }
        setSubmit(false);
    };

    const changeTabIndex = (_index) => {
        switch (_index) {
            case 0:
                resetFormData(true);
                break;
            case 1:
                resetFormData(false);
                break;
            default:
            // code block
        }
        setTabIndex(_index);
    };

    const setChangeText = (type, value) => {
        let _formData = {...formData};
        _formData[type] = value;
        setFormData(_formData);
    };

    const checkSubmit = () => {
        setSubmit(true);
        if (tabIndex) {
            if (regexString(formData?.forename)) {
                showToast('error', 'forename cannot be empty');
                return false;
            }
            if (regexString(formData?.surname)) {
                showToast('error', 'surname cannot be empty');
                return false;
            }
            if (regexString(formData?.email)) {
                showToast('error', 'email cannot be empty');
                return false;
            }
            if (regexEmail(formData?.email)) {
                showToast('error', 'invalid email address');
                return false;
            }
            if (regexString(formData?.phone)) {
                showToast('error', 'phone cannot be empty');
                return false;
            }
            if (regexPhone(formData?.phone)) {
                showToast('error', 'invalid phone number');
                return false;
            }
            if (!formData?.agree_1 || !formData?.agree_2) {
                showToast('error', 'please agree to the terms before signing up');
                return false;
            }
            if (regexString(formData?.password)) {
                showToast('error', 'password cannot be empty');
                return false;
            }
            if (regexPassword(formData?.password)) {
                showToast('error', 'password must have at least six characters, at least one uppercase letter, one lowercase letter and one special character');
                return false;
            }
            if (regexString(formData?.passwordConfirm)) {
                showToast('error', 'confirm password cannot be empty');
                return false;
            }
            if (formData?.password != formData?.passwordConfirm) {
                showToast('error', 'passwords do not match');
                return false;
            }
        } else {
            if (regexString(formData?.username)) {
                showToast('error', 'username cannot be empty');
                return false;
            }
            if (regexString(formData?.password)) {
                showToast('error', 'password cannot be empty');
                return false;
            }
        }
        return true;
    };

    const goToPage = (page) => {
        navigation.navigate(page);
    };

    const topComponent = () => {
        return (
            <View style={styles.container}>
                <Animated.Image source={images.login_1} style={[styles.login_1, {height: imageHeight}]}/>
                {
                    tabIndex ?
                        <View style={{alignItems: 'center'}}>
                            <Input
                                onSubmitEditing={() => ref_input_surname.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='forename'
                                status={isSubmit && regexString(formData?.forename) ? 'danger' : ''}
                                value={formData?.forename}
                                onChangeText={(value) => setChangeText('forename', value)}
                            />
                            <Input
                                innerRef={ref_input_surname}
                                onSubmitEditing={() => ref_input_email.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='surname'
                                status={isSubmit && regexString(formData?.surname) ? 'danger' : ''}
                                value={formData?.surname}
                                onChangeText={(value) => setChangeText('surname', value)}
                            />
                            <Input
                                innerRef={ref_input_email}
                                onSubmitEditing={() => ref_input_phone.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='email' type='email-address'
                                status={isSubmit && (regexString(formData?.email) || regexEmail(formData?.email)) ? 'danger' : ''}
                                value={formData?.email}
                                onChangeText={(value) => setChangeText('email', value)}/>
                            <Input
                                innerRef={ref_input_phone}
                                onSubmitEditing={() => ref_input_new_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='phone' type="phone-pad"
                                status={isSubmit && (regexString(formData?.phone) || regexPhone(formData?.phone)) ? 'danger' : ''}
                                value={formData?.phone}
                                onChangeText={(value) => setChangeText('phone', value)}/>
                            <Checkbox
                                style={{marginBottom: 16, width: layout.width * 3 / 4}}
                                multiline={true}
                                value={formData?.agree_1}
                                fillStyle={{backgroundColor: color.primaryDarker}}
                                onToggle={() => setChangeText('agree_1', !formData?.agree_1)}
                                text="Please agree to out 'terms and conditions'"
                            />
                            <Checkbox
                                style={{marginBottom: 16, width: layout.width * 3 / 4}}
                                multiline={true}
                                value={formData?.agree_2}
                                fillStyle={{backgroundColor: color.primaryDarker}}
                                onToggle={() => setChangeText('agree_2', !formData?.agree_2)}
                                text="Please agree to the terms under which we agree to store and use your data"
                            />
                            <Input
                                innerRef={ref_input_new_password}
                                onSubmitEditing={() => ref_input_confirm_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='create password'
                                secureTextEntry={formData?.passwordSecure}
                                onChangeSecure={() => setChangeText('passwordSecure', !formData?.passwordSecure)}
                                status={isSubmit && (regexString(formData?.password) || regexPassword(formData?.password)) ? 'danger' : ''}
                                value={formData?.password}
                                onFocus={() => setShow(true)}
                                onBlur={() => setShow(false)}
                                onChangeText={(value) => setChangeText('password', value)}/>
                            {isShow && (regexString(formData?.password) || regexPassword(formData?.password)) ?
                                <Text style={styles.passDescription}
                                      text='password must have at least six characters, at least one uppercase letter, one lowercase letter and one special character'/>
                                : null}
                            <Input
                                innerRef={ref_input_confirm_password}
                                onSubmitEditing={() => submit()}
                                blurOnSubmit={false}
                                placeholder='confirm password'
                                secureTextEntry={formData?.passwordConfirmSecure}
                                onChangeSecure={() => setChangeText('passwordConfirmSecure', !formData?.passwordConfirmSecure)}
                                status={isSubmit && (regexString(formData?.passwordConfirm) || formData?.password != formData?.passwordConfirm) ? 'danger' : ''}
                                value={formData?.passwordConfirm}
                                onChangeText={(value) => setChangeText('passwordConfirm', value)}/>
                            <MButton onPress={submit} text='sign up'/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() => changeTabIndex(0)}>
                                <Text style={{marginBottom: 4}}>already have an account?</Text>
                                <Text style={styles.signUpText}>log in</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={{alignItems: 'center'}}>
                            <Input
                                onSubmitEditing={() => ref_input_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder='username' type='email-address'
                                status={isSubmit && regexString(formData?.username) ? 'danger' : ''}
                                value={formData?.username}
                                onChangeText={(value) => setChangeText('username', value)}/>
                            <Input
                                innerRef={ref_input_password}
                                onSubmitEditing={() => submit()}
                                blurOnSubmit={false}
                                placeholder='password'
                                secureTextEntry={formData?.passwordSecure}
                                onChangeSecure={() => setChangeText('passwordSecure', !formData?.passwordSecure)}
                                status={isSubmit && regexString(formData?.password) ? 'danger' : ''}
                                value={formData?.password}
                                onChangeText={(value) => setChangeText('password', value)}/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper}
                                              onPress={() => goToPage('ForgotPasswordScreen')}>
                                <Text style={styles.forgotPasswordText}>forgot your password?</Text>
                            </TouchableOpacity>
                            <MButton onPress={submit} text='log in'/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() => changeTabIndex(1)}>
                                <Text style={{marginBottom: 4}}>don't have an account?</Text>
                                <Text style={styles.signUpText}>sign up</Text>
                            </TouchableOpacity>
                        </View>
                }
            </View>
        );
    };

    const submit = async () => {
        if (checkSubmit()) {
            setLoading(true);
            const successCallback = async (response) => {
                resetFormData(true);
                setLoading(false);
                let {user, messageCode, message} = response;
                if (!tabIndex) {
                    const decodedToken = jwtDecoder(user?.token);
                    await movesModel.setUserInfo({
                        username: formData?.username,
                        // password: formData?.password,
                        token: user?.refreshToken,
                        surname: user?.Surname,
                        forename: user?.Forename,
                        id: user?.User_ID,
                        exp: decodedToken?.exp,
                        email: user?.User_Email,
                        phone: user?.User_Phone_Number,
                        avatar: user?.User_Avatar,
                        createdDate: user?.Created_Date,
                    });
                } else {
                    showToast('success', message);
                }
                goToPage('loading');
            };
            const errorCallback = (e) => {
                setLoading(false);
                showToast('error', e.message);
            };
            if (tabIndex) {
                signup(formData?.forename, formData?.surname, formData?.email, formData?.phone, formData?.password, successCallback, errorCallback);
            } else {
                login(formData?.username, formData?.password, successCallback, errorCallback);
            }
        }
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={ROOT} preset="fixed">
                <FlatList
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={{flex: 1, zIndex: 1}}
                    renderItem={null}
                    data={[]}
                    ListHeaderComponent={topComponent()}
                    keyExtractor={(item, index) => 'login-' + index + String(item)}
                />
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
    passDescription: {
        width: layout.width * 3 / 4,
        marginBottom: 16,
        fontSize: 12,
        marginTop: -8,
        color: color.danger,
        textAlign: 'center'
    }
});
