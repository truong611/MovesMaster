import * as React from "react"
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity, View, StyleSheet, Image} from "react-native";
import {Text} from '../index';
import {converStrToDate, formatDate, formatNumber, replaceHTTP,} from "../../services";
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
        <View style={styles.container}>
            <View style={styles.row1}>
                <Text>Upload: {item?.Upload_Count}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                    {item?.Fitness_App?.Fitness_App_Name ? 
                    <View style={{width: 15,height: 15}}>
                        <Image resizeMode={"contain"} style={{width: 15,height: 15}}
                        source={{ uri: replaceHTTP(item?.Fitness_App?.Fitness_App_Icon) }} />
                    </View>
                    : 
                    <Ionicons name={item?.Fitness_App?.Fitness_App_Name ? 'globe-outline' : 'copy-outline'}  color={color.white} size={14}/> }
                    <Text style={{marginLeft: 4, fontSize: 13}}>{item?.Fitness_App?.Fitness_App_Name ? item?.Fitness_App?.Fitness_App_Name : 'Manual record'}</Text>
                </View>
            </View>
            <Text style={{fontSize: 14}}>{formatDate(item?.Activity_Start_Time, "dd/MM/YYYY hh:mm:ss")} - {formatDate(item?.Activity_End_Time , "dd/MM/YYYY hh:mm:ss")}</Text>
            <View style={styles.row2}>
                <Text style={{width: '30%', fontSize: 12}} numberOfLines={1} >{item?.ActivityType?.Activity_Type_Name}</Text>
                <Text style={{width: '30%', fontSize: 12}} numberOfLines={1} >Units: {formatNumber(item?.Number_Units)} {item?.ActivityUnit?.Activity_Unit_Name} minute</Text>
                <Text style={{width: '30%', fontSize: 12}} numberOfLines={1} >Move: {formatNumber(Math.floor(item?.Moves_Arising))}</Text>
                <Text style={{width: '3%', fontSize: 12}}>{item?.Include_YN ? 'Y' : 'N'}</Text>
            </View>
        </View>
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
        marginTop: 10,
    }
});

