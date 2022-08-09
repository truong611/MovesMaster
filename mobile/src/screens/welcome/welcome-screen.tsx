import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Animated, Dimensions, FlatList, StyleSheet, View, ViewStyle} from 'react-native';
import {Header, Screen, Text} from '../../components';
import {useNavigation} from "@react-navigation/native"
// import { useStores } from "../../models"
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const WelcomeScreen = observer(function WelcomeScreen() {
    const navigation = useNavigation();
    // const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);

    // useEffect(() => {
    //   fetchData();
    // }, []);
    // const fetchData = async () => {
    // };

    const goToPage = (page) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const topComponent = () => {
        return (
            <View>

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
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'profile-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({});
