// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import {
    ChangePasswordScreen,
    DashboardScreen,
    DonateScreen,
    EditProfileScreen,
    NewsScreen,
    ProfileScreen,
    DetailNewsScreen,
    ManagerFitnessApps,
    UploadActivityScreen,
    RecommendDonateScreen,
    SearchDonate3Screen,
    AddIndividualActivityItemsScreen,
    SearchDonateScreen,
    SearchDonate2Screen,
    SearchDonate4Screen,
    AchievementsScreen,
    ViewActivityScreen,
    CalendarActivityScreen,
    ListDonateScreen,
    DetailDonateScreen,
    OverviewActivityScreen,
    DetailActivityScreen,
} from '../screens';
import {BottomTabBar, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Animated, StyleSheet, View} from 'react-native';
import {color} from '../theme';
import {useStores} from '../models';
import {useNavigation} from '@react-navigation/native';

const BottomTabs = createBottomTabNavigator();

const getTabBarIcon = (name) => ({color, size}: { color: string; size: number }) => (
    <Ionicons name={name} color="white" size={24}/>
);

export default function BottomTabsScreen(props: any) {
    const {movesModel} = useStores();
    const navigation = useNavigation();

    const screens = [
        {name: 'DonateScreen', component: DonateScreen, icon: 'heart-outline'},
        {name: 'DashboardScreen', component: DashboardScreen, icon: 'grid-outline'},
        {name: 'NewsScreen', component: NewsScreen, icon: 'newspaper-outline'},
        {name: 'ProfileScreen', component: ProfileScreen, icon: 'heart-outline'},
        {name: 'EditProfileScreen', component: EditProfileScreen, icon: 'heart-outline'},
        {name: 'ChangePasswordScreen', component: ChangePasswordScreen, icon: 'heart-outline'},
        {name: 'DetailNewsScreen', component: DetailNewsScreen, icon: 'heart-outline'},
        {name: 'ManagerFitnessApps', component: ManagerFitnessApps, icon: 'heart-outline'},
        {name: 'UploadActivityScreen', component: UploadActivityScreen, icon: 'heart-outline'},
        {name: 'AddIndividualActivityItemsScreen', component: AddIndividualActivityItemsScreen, icon: 'heart-outline'},
        {name: 'SearchDonateScreen', component: SearchDonateScreen, icon: 'heart-outline'},
        {name: 'SearchDonate2Screen', component: SearchDonate2Screen, icon: 'heart-outline'},
        {name: 'RecommendDonateScreen', component: RecommendDonateScreen, icon: 'heart-outline'},
        {name: 'SearchDonate3Screen', component: SearchDonate3Screen, icon: 'heart-outline'},
        {name: 'SearchDonate4Screen', component: SearchDonate4Screen, icon: 'heart-outline'},
        {name: 'AchievementsScreen', component: AchievementsScreen, icon: 'heart-outline'},
        {name: 'ViewActivityScreen', component: ViewActivityScreen, icon: 'heart-outline'},
        {name: 'CalendarActivityScreen', component: CalendarActivityScreen, icon: 'heart-outline'},
        {name: 'ListDonateScreen', component: ListDonateScreen, icon: 'heart-outline'},
        {name: 'DetailDonateScreen', component: DetailDonateScreen, icon: 'heart-outline'},
        {name: 'OverviewActivityScreen', component: OverviewActivityScreen, icon: 'heart-outline'},
        {name: 'DetailActivityScreen', component: DetailActivityScreen, icon: 'heart-outline'},

    ];

    if (!screens.length) {
        return <View/>;
    }

    return (
        <>
            <BottomTabs.Navigator
                tabBar={(props) => (
                    <View style={{}}>
                        <BottomTabBar {...props} />
                    </View>
                )}
                initialRouteName="DashboardScreen"
            >
                {
                    screens.map((item, index) => {
                        return (
                            <BottomTabs.Screen
                                key={item.name}
                                name={item.name}
                                component={item.component}
                                options={{
                                    headerShown: false,
                                    tabBarShowLabel: false,
                                    tabBarStyle: {
                                        backgroundColor: color.tabbar
                                    },
                                    tabBarItemStyle: {
                                        display: ['DonateScreen', 'DashboardScreen', 'NewsScreen'].includes(item.name) ? undefined : 'none',
                                        backgroundColor: color.tabbar,
                                        top: -1,
                                    },
                                    tabBarIcon: getTabBarIcon(item.icon),
                                }}
                                listeners={{
                                    tabPress: async e => {
                                        e.preventDefault();
                                        navigation.navigate('HomeScreen');
                                        let tabIndex: number;
                                        switch (item.name) {
                                            case 'DonateScreen':
                                                tabIndex = 0;
                                                break;
                                            case 'DashboardScreen':
                                                tabIndex = 1;
                                                break;
                                            case 'NewsScreen':
                                                tabIndex = 2;
                                                break;
                                            default:
                                                tabIndex = 1;
                                        }
                                        await movesModel.setAppInfo({
                                            tabIndex: tabIndex,
                                        });
                                    },
                                }}
                            />
                        );
                    })
                }
            </BottomTabs.Navigator>
        </>
    );
}

const styles = StyleSheet.create({});
