import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, View, ViewStyle, Dimensions, Animated, Image, TouchableOpacity} from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {observer} from 'mobx-react-lite';
import {useNavigation} from '@react-navigation/native';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {MButton, Screen, Text} from '../../components';
import {color} from '../../theme';
import {images} from '../../images';
import {showToast} from '../../services';

const layout = Dimensions.get('window');

const CELL_COUNT = 4;

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const IMAGE_HEIGHT_SMALL = Dimensions.get('window').width / 5;

export const VerifyTokenScreen = observer(function VerifyTokenScreen() {
    const [isLoading, setLoading] = useState(false);
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const navigation = useNavigation();

    const submit = async () => {
        if (checkSubmit()) {
            goToPage('ResetPasswordScreen');
        }
    };

    const checkSubmit = () => {
        if (value?.length != 4) {
            showToast('error', 'incorrect code');
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
                <View style={styles.container}>
                    <Animated.Image source={images.login_1} style={[styles.login_1, {height: IMAGE_HEIGHT_SMALL}]}/>
                    <View style={{alignItems: 'center'}}>
                        <Text style={styles.title}>Please enter the verification code{'\n'}
                            we send to your email address</Text>
                        <CodeField
                            ref={ref}
                            {...props}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({index, symbol, isFocused}) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor/> : null)}
                                </Text>
                            )}
                        />
                        <MButton onPress={submit} text='send'/>
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
    root: {flex: 1, padding: 20},
    title: {
        textAlign: 'center',
        // marginBottom: 16
        // fontSize: 30
    },
    codeFieldRoot: {
        marginVertical: 36,
    },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 36,
        fontSize: 20,
        borderWidth: 1,
        borderColor: color.white,
        textAlign: 'center',
        marginHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    focusCell: {
        // borderColor: '#000',
    },
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
