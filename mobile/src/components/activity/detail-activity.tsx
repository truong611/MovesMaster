import * as React from "react"
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity, View, StyleSheet} from "react-native";
import {Text} from '../index';
import {formatDate, formatNumber,} from "../../services";
import {color} from '../../theme';

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function DetailActivity(props: any) {
    // grab the props
    const {item} = props;
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.row1}>
                <Text
                    style={{fontSize: 14}}>{formatDate(item?.Activity_Start_Time, "hh:mm:ss")} - {formatDate(item?.Activity_End_Time, "hh:mm:ss")}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {}
                    <Ionicons name={item?.Fitness_App?.Fitness_App_Name ? 'globe-outline' : 'copy-outline'}  color={color.white} size={14}/>
                    <Text style={{marginLeft: 4, fontSize: 13}}>{item?.Fitness_App?.Fitness_App_Name ? item?.Fitness_App?.Fitness_App_Name : 'Manual record'}</Text>
                </View>
            </View>
            <View style={styles.row2}>
                <Text style={{}}>{item?.ActivityType?.Activity_Type_Name}</Text>
                <Text>Units: {formatNumber(item?.Number_Units)} {item?.ActivityUnit?.Activity_Unit_Name}</Text>
                <Text>Move: {formatNumber(item?.Moves_Arising)}</Text>
                <Text>{item?.Include_YN ? 'Y' : 'N'}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderColor: color.white,
        marginBottom: 16,
        borderRadius: 8
    },
    row1: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    row2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    }
});

