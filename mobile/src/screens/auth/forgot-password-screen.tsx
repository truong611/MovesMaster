import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions, Image, Keyboard, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Input, MButton, Screen, Text} from '../../components';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {images} from '../../images';
import {regexEmail, regexString, showToast} from '../../services';
import {forgotPassword} from "../../services/authActions";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const IMAGE_HEIGHT_SMALL = Dimensions.get('window').width / 5;
const IMAGE_HEIGHT = Dimensions.get('window').width / 2;

export const ForgotPasswordScreen = observer(function ForgotPasswordScreen() {
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const [email, setEmail] = useState('');
    const [placeholderEmail,setPlaceholderEmail] = useState('email')
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [imageHeight, setImageHeight] = useState(new Animated.Value(IMAGE_HEIGHT));
    const [showKeyBoard, setShowKeyBoard] = useState(false)

    useEffect(() => {
        fetchData();
    }, [isFocused]);
    const fetchData = async () => {
        if (isFocused) {
            resetData()
        }
    };

    const resetData = () => {
        setEmail('');
        setSubmit(false);
    };

    const submit = async () => {
        if(showKeyBoard){
            setShowKeyBoard(false)
            Keyboard.dismiss()
        }else{
            if (checkSubmit()) {
                setLoading(true);
                const successCallback = async (response) => {
                    setLoading(false);
                    // goToPage('LoginScreen');
                    showToast('success', response.message); 
                };
                const errorCallback = (e) => {
                    setLoading(false);
                    showToast('error', e.message);
                    
                };
                forgotPassword(email, successCallback, errorCallback);
            }
        }
        
        
    };

    const checkSubmit = () => {
        setSubmit(true);
        if (regexString(email)) {
            showToast('error', 'email address cannot be empty');
            return false;
        }
        if (regexEmail(email)) {
            showToast('error', 'invalid email address');
            return false;
        }
        return true;
    };

    const goToPage = (page) => {
        navigation.navigate(page);
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
           
            <Screen style={ROOT} preset="fixed">
                <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => {
                    setShowKeyBoard(false)
                    Keyboard.dismiss()
                } }>
                    <Animated.Image source={images.login_1} style={[styles.login_1, {height: imageHeight}]}/>
                    
                    <View style={{alignItems: 'center'}}>
                        <Text style={{marginBottom: 24}}>enter your email to reset your password.</Text>
                        <Input
                            // onSubmitEditing={() => submit()}
                            onSubmitEditing={() =>{
                                setShowKeyBoard(false) 
                                Keyboard.dismiss()
                            } }
                            blurOnSubmit={false}
                            placeholder={placeholderEmail}
                            onFocus={() => {
                                setShowKeyBoard(true) 
                                setPlaceholderEmail('')}}
                            onBlur={() => setPlaceholderEmail('email')}
                            type='email-address'
                            status={isSubmit && (regexString(email) || regexEmail(email)) ? 'danger' : ''}
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                        />
                        <MButton onPress={submit} text='reset'/>
                        <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={() =>{
                            if(showKeyBoard){
                                Keyboard.dismiss()
                            }else{
                                navigation.goBack()
                            }
                            
                        }}>
                            <Text style={styles.signUpText}>login</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
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
