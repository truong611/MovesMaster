import React from 'react';
import {StyleSheet, View,} from 'react-native';
import {color} from '../../theme';
import {SkypeIndicator} from 'react-native-indicators';

const CenterSpinner = () => (
    <View style={styles.container}>
        <SkypeIndicator color={color.danger}/>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignContent: 'center',
        zIndex: 99,
        // backgroundColor: '#80808073',
    },
});


export default CenterSpinner;
