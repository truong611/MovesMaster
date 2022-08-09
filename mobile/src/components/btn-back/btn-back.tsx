// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from '../text/text';
import {color} from '../../theme';

const layout = Dimensions.get('window');

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function BtnBack(props: any) {
    // grab the props
    let {title, goBack} = props;

    title = title || '';

    return (
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 16,}}>
            <TouchableOpacity style={styles.backWrapper} onPress={() => goBack()}>
                <Ionicons name='return-up-back-outline' color={color.green} size={20}/>
                <Text style={styles.backText}>back</Text>
            </TouchableOpacity>
            <Text style={{fontSize: 15, textTransform: 'capitalize'}} fonts={'DemiBold'}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
});
