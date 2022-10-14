import * as React from "react"
import {TouchableOpacity, View, StyleSheet, Image, Dimensions} from "react-native";
import {Text} from '../index';
import {formatDate, formatNumber, numberFormat, replaceHTTP,} from "../../services";
import {color} from '../../theme';

const layout = Dimensions.get('window');

export function Badge(props: any) {
    // grab the props
    const {value, active, toggleModal, times} = props;

    let isClick = !!toggleModal;

    return (
        <TouchableOpacity disabled={!isClick} onPress={() => toggleModal(value)}>
            <View style={[styles.donationsItem,
                    active ? {borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: color.white} : {},
                    isClick ? {} : {backgroundColor: color.tabbar, marginBottom: 16}
                ]}>
                {!isClick && times ?
                    <Text style={{position: 'absolute', bottom: 0, zIndex: 2, color: color.warning}}>no. {times}</Text>
                    : null}
                <View style={styles.iconWrapper}>
                    {value?.Badge_Icon ?
                        <Image resizeMode={"contain"} source={{uri: replaceHTTP(value?.Badge_Icon) }}
                               style={[styles.icon,
                                   active ? {} : {tintColor: 'gray'},
                                   isClick ? {} : {backgroundColor: color.tabbar}
                               ]}/>
                        : null}
                </View>
                <Text style={[
                        {textAlign: 'center'},
                        active ? {} : {color: color.lightGrey}
                    ]}>
                    {(value?.Badge_Type == 0 ? '' : '£') + (value?.Badge_Type == 0 ? formatNumber(value?.Badge_Condition) : numberFormat(value?.Badge_Condition) )}
                </Text>
                <View style={[styles.flagBottom,
                    active ? {} : {},
                    isClick ? {} : {borderRightColor: color.tabbar, borderBottomColor: color.primary, borderLeftColor: color.tabbar},
                ]}/>
            </View>
            {isClick ?
                <Text fonts={active ? 'DemiBold' : 'Medium'} style={[styles.itemTitle, active ? {} : {color: color.lightGrey}]}>{value.Badge_Name}</Text>
                : null}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    itemTitle: {
        textAlign: 'center',
        width: (layout.width - 16 * 3) * 30 / 100,
    },
    donationsItem: {
        width: (layout.width - 16 * 3) * 30 / 100,
        height: 56 + (layout.width - 16 * 3) * 30 / 100,
        marginHorizontal: '1.5%',
        backgroundColor: color.primary,
        alignItems: 'center',
        paddingTop: 16,
        marginBottom: 8
    },
    iconWrapper: {
        backgroundColor: color.primary,
        width: ((layout.width - 16 * 3) * 30 / 100) - 32,
        height: ((layout.width - 16 * 3) * 30 / 100) - 32,
        marginBottom: 8
    },
    icon: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        backgroundColor: color.primary,
    },
    flagBottom: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: 0,
        height: 0,
        borderBottomWidth: ((layout.width - 16 * 3) * 30 / 100) / 3,
        borderLeftWidth: layout.width / 8,
        borderRightWidth: layout.width / 8,
        borderRightColor: color.primary,
        borderBottomColor: color.tabbar,
        borderLeftColor: color.primary,
    },
});

