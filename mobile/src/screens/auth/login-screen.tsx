// @ts-ignore
import jwtDecoder from 'jwt-decode';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Animated,
    Dimensions, FlatList, Image,
    StyleSheet,
    TouchableOpacity, View,
    ViewStyle, Linking, Modal, TextInput,
    BackHandler
} from 'react-native';
import {MButton, Input, Screen, Text, Checkbox} from '../../components';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {color} from '../../theme';
import {regexEmail, regexPassword, regexPhone, regexString, showToast} from '../../services';
import {login, signup} from '../../services/authActions';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {images} from '../../images';
import {useStores} from '../../models';
import { WEB_URL } from '../../config';

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
    const [registe_mobile, setRegiste_mobile]=useState(false)
    const [confirmModal, setConfirmModal]=useState(false)
    
    const [formData, setFormData] = useState<any>({
        username: '',
        password: '',
        passwordSecure: true,
    });
    const [placeholderSingup, setPlaceholderSingup] = useState<any>({
        forename: 'forename',
        surname: 'surname',
        email: 'email',
        phone: 'phone',
        create_password: 'create password',
        confirm_password: 'confirm password',
        username: 'username',
        password: 'password'

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

    useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            return true;
          };
    
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
          return () =>
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
      )

    const resetFormData = (isLogin) => {
        if (isLogin) {
            setFormData({
                username: '',
                password: '',
                passwordSecure: true,
                agree_1: false,
                agree_2: false,
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
        setRegiste_mobile(false)
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

    const setChangePlaceholder = (type, value) => {
        let _formData = {...placeholderSingup};
        _formData[type] = value;
        setPlaceholderSingup(_formData);
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
            if (regexString(formData?.passwordConfirm)) {
                showToast('error', 'confirm password cannot be empty');
                return false;
            }
            if (formData?.password != formData?.passwordConfirm) {
                showToast('error', 'passwords do not match');
                return false;
            }else{
                if (regexPassword(formData?.password)) {
                    setShow(true)
                    showToast('error', 'password must have at least six characters, at least one uppercase letter, one lowercase letter and at least one number');
                    return false;
                }else setShow(false)
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
            if(registe_mobile){
                if (!formData?.agree_1 || !formData?.agree_2) {
                    showToast('error', 'please agree to the terms before signin');
                    return false;
                }
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
                                autoCorrect={false}
                                spellCheck={false}
                                onSubmitEditing={() => ref_input_surname.current?.focus()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.forename}
                                onFocus={() => setChangePlaceholder('forename','')}
                                onBlur={() => setChangePlaceholder('forename','forename')}
                                status={isSubmit && regexString(formData?.forename) ? 'danger' : ''}
                                value={formData?.forename}
                                onChangeText={(value) => setChangeText('forename', value)}
                            />
                            <Input
                                autoCorrect={false}
                                spellCheck={false}
                                innerRef={ref_input_surname}
                                onSubmitEditing={() => ref_input_email.current?.focus()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.surname}
                                onFocus={() => setChangePlaceholder('surname','')}
                                onBlur={() => setChangePlaceholder('surname','surname')}
                                status={isSubmit && regexString(formData?.surname) ? 'danger' : ''}
                                value={formData?.surname}
                                onChangeText={(value) => setChangeText('surname', value)}
                            />
                            <Input 
                                autoCorrect={false}
                                spellCheck={false}
                                innerRef={ref_input_email}
                                onSubmitEditing={() => ref_input_phone.current?.focus()}
                                blurOnSubmit={false}
                                secureTextEntry={false}
                                keyboardType='email-address'    
                                placeholder={placeholderSingup?.email}
                                onFocus={() => setChangePlaceholder('email','')}
                                onBlur={() => setChangePlaceholder('email','email')}
                                hideIcon={true}
                                status={isSubmit && (regexString(formData?.email) || regexEmail(formData?.email)) ? 'danger' : ''}
                                value={formData?.email}
                                onChangeText={(value) => setChangeText('email', value)}
                            />
                            <Input
                                autoCorrect={false}
                                spellCheck={false}
                                innerRef={ref_input_phone}
                                onSubmitEditing={() => ref_input_new_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.phone}
                                onFocus={() => setChangePlaceholder('phone','')}
                                onBlur={() => setChangePlaceholder('phone','phone')}
                                type="phone-pad"
                                status={isSubmit && (regexString(formData?.phone) || regexPhone(formData?.phone)) ? 'danger' : ''}
                                value={formData?.phone}
                                onChangeText={(value) => setChangeText('phone', value)}/>
                            <View style={{flexDirection: 'row', width: layout.width * 3 / 4}}>
                                <Checkbox
                                style={{marginBottom: 16}}
                                multiline={true}
                                value={formData?.agree_1}
                                fillStyle={{backgroundColor: color.primaryDarker}}
                                onToggle={() => setChangeText('agree_1', !formData?.agree_1)}
                                />
                                <View>
                                    <Text>Please agree to our 
                                      <Text onPress={() => Linking.openURL(WEB_URL + '/terms-and-conditions')} style={{color: color.green}}> terms and conditions</Text>                    
                                    </Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', width: layout.width * 3 / 4, marginBottom: 10}}>
                                <Checkbox
                                    style={{marginBottom: 16}}
                                    multiline={true}
                                    value={formData?.agree_2}
                                    fillStyle={{backgroundColor: color.primaryDarker}}
                                    onToggle={() => setChangeText('agree_2', !formData?.agree_2)}
                                />
                                <View>
                                    <Text>Please agree to the
                                      <Text onPress={() => Linking.openURL(WEB_URL + '/terms-and-conditions')} style={{color: color.green}}> terms </Text>
                                    under which we agree to store and use your data          
                                    </Text>
                                </View>
                            </View>
                            <Input
                                autoCorrect={false}
                                spellCheck={false}
                                innerRef={ref_input_new_password}
                                onSubmitEditing={() => ref_input_confirm_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.create_password}
                                onFocus={() => setChangePlaceholder('create_password','')}
                                onBlur={() => setChangePlaceholder('create_password','create password')}
                                secureTextEntry={formData?.passwordSecure}
                                onChangeSecure={() => setChangeText('passwordSecure', !formData?.passwordSecure)}
                                status={isSubmit && (regexString(formData?.password) || regexPassword(formData?.password)) ? 'danger' : ''}
                                value={formData?.password}
                                valueInput={formData?.password}
                                // onFocus={() => setShow(true)}
                                // onBlur={() => setShow(false)}
                                onChangeText={(value) => setChangeText('password', value)}/>
                            {isShow && regexPassword(formData?.password) ?
                                <Text style={styles.passDescription}
                                      text='password must have at least six characters, at least one uppercase letter, one lowercase letter and at least one number'/>
                                : null}
                            <Input
                                autoCorrect={false}
                                spellCheck={false}
                                innerRef={ref_input_confirm_password}
                                onSubmitEditing={() => submit()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.confirm_password}
                                onFocus={() => setChangePlaceholder('confirm_password','')}
                                onBlur={() => setChangePlaceholder('confirm_password','confirm password')}
                                secureTextEntry={formData?.passwordConfirmSecure}
                                onChangeSecure={() => setChangeText('passwordConfirmSecure', !formData?.passwordConfirmSecure)}
                                status={isSubmit && (regexString(formData?.passwordConfirm) || formData?.password != formData?.passwordConfirm) ? 'danger' : ''}
                                value={formData?.passwordConfirm}
                                valueInput={formData?.passwordConfirm}
                                onChangeText={(value) => setChangeText('passwordConfirm', value)}/>
                            <MButton onPress={submit} text='sign up'/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() =>changeTabIndex(0)}>
                                <Text style={{marginBottom: 4}}>already have an account?</Text>
                                <Text style={styles.signUpText}>log in</Text>
                            </TouchableOpacity>
                        </View> :
                        <View style={{alignItems: 'center'}}>
                            {registe_mobile ? 
                            <View style={{paddingVertical: 16, paddingHorizontal: 16}}>
                                <Text>To be a moves matter mobile app user, please agree to the following and log in once more</Text>
                                <View style={{flexDirection: 'row', width: layout.width * 3 / 4}}>
                                <Checkbox
                                style={{marginBottom: 16}}
                                multiline={true}
                                value={formData?.agree_1}
                                fillStyle={{backgroundColor: color.primaryDarker}}
                                onToggle={() => setChangeText('agree_1', !formData?.agree_1)}
                                />
                                <View>
                                    <Text>Please agree to our 
                                      <Text onPress={() => Linking.openURL(WEB_URL + '/terms-and-conditions')} style={{color: color.green}}> terms and conditions</Text>                    
                                    </Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', width: layout.width * 3 / 4, marginBottom: 10}}>
                                <Checkbox
                                    style={{marginBottom: 16}}
                                    multiline={true}
                                    value={formData?.agree_2}
                                    fillStyle={{backgroundColor: color.primaryDarker}}
                                    onToggle={() => setChangeText('agree_2', !formData?.agree_2)}
                                />
                                <View>
                                    <Text>Please agree to the
                                      <Text onPress={() => Linking.openURL(WEB_URL + '/terms-and-conditions')} style={{color: color.green}}> terms </Text>
                                    under which we agree to store and use your data          
                                    </Text>
                                </View>
                            </View>
                            </View>
                             : null}
                            <Input
                                autoCorrect={false}
                                spellCheck={false}
                                onSubmitEditing={() => ref_input_password.current?.focus()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.username}
                                onFocus={() => setChangePlaceholder('username','')}
                                onBlur={() => setChangePlaceholder('username','username')}
                                type='email-address'
                                status={isSubmit && regexString(formData?.username) ? 'danger' : ''}
                                value={formData?.username}
                                onChangeText={(value) => setChangeText('username', value)}/>
                            <Input
                                placeholderTextColor={color.white}
                                autoCapitalize={'none'}
                                innerRef={ref_input_password}
                                onSubmitEditing={() => submit()}
                                blurOnSubmit={false}
                                placeholder={placeholderSingup?.password}
                                onFocus={() => setChangePlaceholder('password','')}
                                onBlur={() => {
                                    setChangePlaceholder('password','password')}}
                                secureTextEntry={formData?.passwordSecure}
                                onChangeSecure={() => setChangeText('passwordSecure', !formData?.passwordSecure)}
                                status={isSubmit && regexString(formData?.password) ? 'danger' : ''}
                                value={formData?.password}
                                valueInput={formData?.password}
                                onChangeText={(value) => setChangeText('password', value)}/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper}
                                              onPress={() => goToPage('ForgotPasswordScreen')}>
                                <Text style={styles.forgotPasswordText}>forgot your password?</Text>
                            </TouchableOpacity>
                            <MButton onPress={submit} text='log in'/>
                            <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() =>changeTabIndex(1)}>
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
                    count: 0
                });
                } else {
                    showToast('success', message);
                }
                // if(!user?.Is_Mobile_App_User && user?.Is_Web_App_User){
                //     setRegiste_mobile(true)
                // }
                goToPage('loading');
            };
            const errorCallback = (e) => {
                setLoading(false);
                if(e?.isExistsWeb){
                    setChangeText('password', '')
                    setRegiste_mobile(true)
                }else{
                    showToast('error', e.message);
                }
            };
            if (tabIndex) {
                signup(formData?.forename, formData?.surname, formData?.email, formData?.phone, formData?.password, successCallback, errorCallback);
            } else {
                if(!registe_mobile){
                    login(formData?.username, formData?.password, successCallback, errorCallback, false);
                }
                else{
                    login(formData?.username, formData?.password, successCallback, errorCallback, true);
                }
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
    },
    centeredView: {
        marginTop: layout.height/10*3,
        width: layout.width / 10 * 8,
        height: layout.height/10*3,
        alignItems:'center',
        marginLeft: layout.width / 10 - 5

    },
    modalView: {
        flex: 1,
        backgroundColor: color.white,
        paddingVertical: 15,
        paddingHorizontal: 15
    },
});
