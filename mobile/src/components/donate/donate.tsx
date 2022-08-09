import * as React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from '../text/text';
import {color} from '../../theme';
import {formatNumber} from "../../services";
import {useState} from "react";
import {useEffect} from "react";
import {useIsFocused} from "@react-navigation/native";
import {useStores} from "../../models";

const layout = Dimensions.get('window');

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Donate(props: any) {
    // grab the props
    let {title, isRefresh} = props;
    const [donateInfo, setDonateInfo] = useState({
        donatedMoves: 0,
        amountDonated: 0,
        movesAvailable: 0,
    });
    const isFocused = useIsFocused();
    const {movesModel} = useStores();

    title = title || 'DONATIONS';

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        if (isFocused) {
            let _donation = await movesModel.getDonateInfo();
            setDonateInfo({
                donatedMoves: _donation?.donatedMoves,
                amountDonated: _donation?.amountDonated,
                movesAvailable: _donation?.movesAvailable
            });
        }
    };

    return (
        <View style={styles.appsWrapper}>
            <View style={{marginBottom: 12}}>
                <Text fonts={'DemiBold'}>{title}</Text>
            </View>
            <View style={styles.donationsWrapper}>
                <TouchableOpacity style={styles.donationsItem}>
                    <Text style={styles.donationsValue}
                          fonts={'DemiBold'}>{formatNumber(donateInfo?.donatedMoves)}</Text>
                    <Text style={styles.donationsText}>donated moves</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.donationsItem}>
                    <Text style={styles.donationsValue}
                          fonts={'DemiBold'}>£{formatNumber(donateInfo?.amountDonated)}</Text>
                    <Text style={styles.donationsText}>amount donated</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.donationsItem}>
                    <Text style={styles.donationsValue}
                          fonts={'DemiBold'}>{formatNumber(donateInfo?.movesAvailable)}</Text>
                    <Text style={styles.donationsText}>moves available</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appsWrapper: {
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        paddingTop: 12,
        paddingBottom: 8,
        marginBottom: 12
    },
    donationsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
        marginHorizontal: -8
    },
    donationsItem: {
        width: '30%',
        marginHorizontal: '1.5%',
        borderWidth: 1,
        borderColor: color.danger,
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12,
    },
    donationsText: {
        textAlign: 'center'
    },
    donationsValue: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 8,
        color: color.danger
    },
});
