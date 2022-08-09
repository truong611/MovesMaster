// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Header, Input, MButton, Screen, Text} from '../../components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useStores} from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {images} from '../../images';
import {regexEmail, regexPhone, regexString, showToast} from '../../services';
import {launchImageLibrary} from 'react-native-image-picker';
import {useMutation} from "@apollo/react-hooks";
import {FETCH_updateProfile} from "./profile-service";

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const EditProfileScreen = observer(function EditProfileScreen() {
    const {movesModel} = useStores();
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [isSubmit, setSubmit] = useState(false);
    const [formData, setFormData] = useState<any>({
        forename: '',
        surname: '',
        email: '',
        phone: '',
        avatar: null,
        fileName: '',
    });
    const [updateProfile, {}] = useMutation(FETCH_updateProfile);
    const ref_input_surname = useRef();
    const ref_input_email = useRef();
    const ref_input_phone = useRef();

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh) {
            resetData();
            let userInfo = await movesModel.getUserInfo();
            setFormData({
                forename: userInfo?.forename,
                surname: userInfo?.surname,
                email: userInfo?.email,
                phone: userInfo?.phone,
                avatar: userInfo?.avatar,
                fileName: '',
            })
        }
    };

    const resetData = () => {
        setSubmit(false);
    };

    const setChangeText = (type, value) => {
        let _formData = {...formData};

        var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~qưertyuiopasdfghjklzxcvbnm]/;
        if(type == 'phone'){
            if(!format.test(value)) _formData[type] = value;; 
        }else{
            _formData[type] = value;
        }
        setFormData(_formData);
    };

    const checkSubmit = () => {
        setSubmit(true);
        if (regexString(formData?.surname)) {
            showToast('error', 'surname cannot be empty');
            return false;
        }
        if (regexString(formData?.forename)) {
            showToast('error', 'forename cannot be empty');
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

        return true;
    };

    const submit = async () => {
        if (checkSubmit()) {
            setLoading(true);
            try {
                let {data: {updateProfile: {user, messageCode, message}}} = await updateProfile({
                    variables: {
                        "forename": formData?.forename,
                        "surname": formData?.surname,
                        "email": formData?.email,
                        "phone": formData?.phone,
                        "avatar": formData?.avatar,
                        "fileName": formData?.fileName,
                    },
                });
                setLoading(false);
                if (messageCode == 200) {
                    let _formData = {...formData};
                    _formData['fileName'] = '';
                    _formData['avatar'] = user?.User_Avatar;
                    setFormData(_formData);

                    resetData();

                    showToast('success', message);

                    await movesModel.setUserInfo({
                        forename: user?.Forename,
                        surname: user?.Surname,
                        email: user?.User_Email,
                        phone: user?.User_Phone_Number,
                        avatar: user?.User_Avatar,
                    });
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }

        }
    };

    const imagePicker = async () => {
        let options = {
            mediaType: 'photo',
            quality: 0.5,
            includeBase64: true,
        };
        await launchImageLibrary(options, (response) => {
            if (response && response?.assets?.length) {
                let _formData = {...formData};
                _formData['fileName'] = response?.assets[0]?.fileName;
                _formData['avatar'] = response?.assets[0]?.base64;
                setFormData(_formData);
            }
        });
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const topComponent = () => {
        return (
            <View style={{paddingVertical: 16}}>
                <View style={{paddingHorizontal: 16}}>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>EDIT PROFILE</Text>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 16}}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={() => imagePicker()}>
                        <View style={styles.avatarUpload}>
                            <Ionicons name={'cloud-upload-outline'} color="white" size={20}/>
                        </View>
                        {formData?.avatar ?
                            formData?.fileName ?
                                <Image style={styles.avatar} resizeMode={"cover"}
                                       source={{uri: `data:image/png;base64,${formData?.avatar}`}}/> :
                                <Image style={styles.avatar} resizeMode={"cover"}
                                       source={{uri: formData?.avatar}}/>
                            : null}
                    </TouchableOpacity>
                    <Text style={styles.infoText}>Forename</Text>
                    <Input
                        textAlign='left'
                        onSubmitEditing={() => ref_input_surname.current?.focus()}
                        blurOnSubmit={false}
                        style={styles.input}
                        placeholder=''
                        status={isSubmit && regexString(formData?.forename) ? 'danger' : 'none'}
                        value={formData?.forename}
                        onChangeText={(value) => setChangeText('forename', value)}
                    />
                    <Text style={styles.infoText}>Surname</Text>
                    <Input
                        textAlign='left'
                        textAlign='left'
                        innerRef={ref_input_surname}
                        onSubmitEditing={() => ref_input_email.current?.focus()}
                        blurOnSubmit={false}
                        style={styles.input}
                        placeholder=''
                        status={isSubmit && regexString(formData?.surname) ? 'danger' : 'none'}
                        value={formData?.surname}
                        onChangeText={(value) => setChangeText('surname', value)}
                    />
                    <Text style={styles.infoText}>Email</Text>
                    <Input
                        textAlign='left'
                        editable={false}
                        innerRef={ref_input_email}
                        onSubmitEditing={() => ref_input_phone.current?.focus()}
                        blurOnSubmit={false}
                        style={[styles.input, {color: 'gray'}]} type='email-address'
                        placeholder=''
                        status={isSubmit && regexString(formData?.email) ? 'danger' : 'none'}
                        value={formData?.email}
                        onChangeText={(value) => setChangeText('email', value)}
                    />
                    <Text style={styles.infoText}>Phone</Text>
                    <Input
                        textAlign='left'
                        innerRef={ref_input_phone}
                        onSubmitEditing={() => submit()}
                        blurOnSubmit={false}
                        style={styles.input} type="phone-pad"
                        placeholder=''
                        status={isSubmit && (regexString(formData?.phone) || regexPhone(formData?.phone)) ? 'danger' : 'none'}
                        value={formData?.phone}
                        onChangeText={(value) => setChangeText('phone', value)}
                    />
                    <View style={styles.view_changePass}>
                        <TouchableOpacity
                           onPress={() => navigation.navigate('MainScreen', {screen: 'ChangePasswordScreen'})}>
                           <Text style={styles.changePasswordText}>Change password</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <MButton
                        onPress={submit}
                        style={styles.editDetails}
                        styleText={styles.editDetailsText}
                        text='Save Details'/>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainScreen', {screen: 'ProfileScreen'})}
                        style={styles.cancel}>
                        <Text style={{paddingVertical: 10}}>Cancel</Text>
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
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'edit-profile-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    avatarWrapper: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: layout.width / 8,
        backgroundColor: color.lighterGrey,
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatar: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: layout.width / 8,
    },
    infoText: {
        marginBottom: 8,
        width: layout.width / 4 * 3
    },
    editDetails: {
        backgroundColor: color.orange,
        marginTop: 16,
        width: layout.width / 4 * 2
    },
    editDetailsText: {
        color: color.white,
    },
    avatarUpload: {
        width: layout.width / 4,
        height: layout.width / 4,
        backgroundColor: '#000000',
        top: layout.width / 6,
        opacity: 0.69,
        alignItems: 'center',
        paddingTop: 6,
        position: 'absolute',
        zIndex: 1,
    },
    input: {
        backgroundColor: color.tabbar,
        marginBottom: 8,
        width: layout.width / 4 * 3,
        borderRadius: 0
    },
    changePasswordText: {
        borderBottomWidth : 1,
        borderBottomColor: color.orange,
        color: color.orange,
        width: '50%'
    },
    view_changePass: {
        width: layout.width / 4 * 3, 
        alignItems: 'flex-start',
        marginBottom: 16
    },
    cancel: {
        backgroundColor: color.green,
        width: layout.width / 4 * 2,
        alignItems: 'center',
        borderRadius: 20,
    }
});
