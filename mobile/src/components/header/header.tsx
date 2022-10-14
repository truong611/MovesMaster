// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';
import {View, ViewStyle, TextStyle, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {HeaderProps} from './header.props';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {color, spacing} from '../../theme';
import {translate} from '../../i18n/';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {images} from '../../images';
import {useStores} from '../../models';
import {observer} from 'mobx-react-lite';
import codePush from "react-native-code-push";
import { replaceHTTP } from '../../services';

// static styles
const ROOT: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    justifyContent: 'flex-start',
};
const TITLE: TextStyle = {textAlign: 'center'};
const TITLE_MIDDLE: ViewStyle = {flex: 1, justifyContent: 'center', alignItems: 'center'};
const LEFT: ViewStyle = {width: 32};
const RIGHT: ViewStyle = {width: 32};

const CENTER_IMG: any = {
    height: 24,
    resizeMode: 'contain',
};

const LEFT_IMG: any = {
    width: 18,
    resizeMode: 'contain',
};

const RIGHT_IMG: any = {
    width: 18,
    resizeMode: 'contain',
};

const RIGHT_IMG_AVATAR: any = {
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    backgroundColor: color.lightGrey
};

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export const Header = observer(function Header(props: HeaderProps) {
    const {
        onLeftPress,
        onRightPress,
        rightIcon,
        leftIcon,
        headerText,
        headerTx,
        style,
        titleStyle,
    } = props;
    const header = headerText || (headerTx && translate(headerTx)) || '';
    const navigation = useNavigation();
    const {movesModel} = useStores();

    const toggleMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    // const codePushSync = () => {
    //     codePush.sync({
    //         // updateDialog: true,
    //         installMode: codePush.InstallMode.IMMEDIATE
    //     });
    // };

    if (header == 'LOGO') {
        return (
            <View style={[ROOT, style, styles.wrapper]}>
                <Button style={styles.btnIcon} preset="link" onPress={() => toggleMenu()}>
                    <Image source={images.bar} style={LEFT_IMG}/>
                </Button>
                <View style={TITLE_MIDDLE}>
                    <Image source={images.logo} style={CENTER_IMG}/>
                </View>
                <Button style={styles.btnIcon} preset="link" onPress={() => goToPage('ProfileScreen')}>
                    <View style={RIGHT_IMG_AVATAR}>
                        {movesModel?.userInfo?.avatar ?
                            <Image style={RIGHT_IMG_AVATAR}
                                   source={{uri: replaceHTTP(movesModel?.userInfo?.avatar)}}/>
                            : null}
                    </View>
                </Button>
            </View>
        );
    }
    return (
        <View style={[ROOT, style, styles.wrapper]}>
            <Button style={styles.btnIcon} preset="link" onPress={onLeftPress}>
                <Ionicons name={'arrow-back-outline'} color="white" size={24}/>
            </Button>
            <View style={TITLE_MIDDLE}>
                <Text fonts={'DemiBold'}>{header}</Text>
            </View>
            <Button style={styles.btnIcon} preset="link"/>
        </View>
    );


});

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: color.primary,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,

        elevation: 1,
    },
    btnIcon: {
        width: 32, height: 32
    }
});
