/**
 * This is the navigator you will modify to display the logged-in screens of your app.
 * You can use RootNavigator to also display an auth flow or other user flows.
 *
 * You'll likely spend most of your time in this file.
 */
import React, {useEffect, useState} from 'react';
import {
    createDrawerNavigator,
} from '@react-navigation/drawer';
import {SidebarDrawer} from './sidebar-drawer';
import BottomTabsScreen from './bottom-tab-navigator';
import {ApolloProvider} from 'react-apollo';
import {useBackButtonHandler} from './navigation-utilities';
import makeApolloClient from '../services/apollo';
import gql from "graphql-tag";
import CenterSpinner from '../components/center-spinner/center-spinner';
import {
    ChangePasswordScreen,
    DashboardScreen,
    DemoScreen,
    DonateScreen,
    EditProfileScreen,
    HomeScreen,
    NewsScreen,
    ProfileScreen,
    WelcomeScreen,
    DetailNewsScreen,
    ManagerFitnessApps,
    UploadActivityScreen,
    RecommendDonateScreen,
    AddIndividualActivityItemsScreen,
    SearchDonateScreen,
    SearchDonate2Screen,
    SearchDonate3Screen,
    SearchDonate4Screen,
    AchievementsScreen,
    ViewActivityScreen,
    CalendarActivityScreen,
    DetailDonateScreen,
    ListDonateScreen,
    OverviewActivityScreen,
    DetailActivityScreen
} from '../screens';

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */

const Drawer = createDrawerNavigator();

const EMIT_ONLINE_EVENT = gql`
    mutation {
        update_users(
            _set: {
                last_seen: "now()"
            },
            where: {}
        ) {
            affected_rows
        }
    }
`;

export function PrimaryNavigator() {
    const [client, setClient] = useState<any>(null);
    useBackButtonHandler(canExit);

    useEffect(() => {
        fetchSession();
    }, []);
    const fetchSession = async () => {
        const client = await makeApolloClient();

        setClient(client);
        // setInterval(
        //   () => {
        //     client.mutate({
        //       mutation: EMIT_ONLINE_EVENT,
        //     });
        //   },
        //   30000,
        // );
    };

    if (!client) {
        return <CenterSpinner/>;
    }

    return (
        <ApolloProvider client={client}>
            <Drawer.Navigator
                initialRouteName="HomeScreen"
                screenOptions={{
                    headerShown: false,
                    swipeEdgeWidth: 0,
                }}
                drawerContent={(props) => <SidebarDrawer {...props} />}
            >
                <Drawer.Screen name="MainScreen" component={BottomTabsScreen}/>
                <Drawer.Screen name="HomeScreen" component={HomeScreen}/>
                <Drawer.Screen name="demo" component={DemoScreen}/>
                <Drawer.Screen name="welcome" component={WelcomeScreen}/>
                <Drawer.Screen name="NewsScreen" component={NewsScreen}/>
                <Drawer.Screen name="DonateScreen" component={DonateScreen}/>
                <Drawer.Screen name="DashboardScreen" component={DashboardScreen}/>
                <Drawer.Screen name="ProfileScreen" component={ProfileScreen}/>
                <Drawer.Screen name="EditProfileScreen" component={EditProfileScreen}/>
                <Drawer.Screen name="ChangePasswordScreen" component={ChangePasswordScreen}/>
                <Drawer.Screen name="DetailNewsScreen" component={DetailNewsScreen}/>
                <Drawer.Screen name="ManagerFitnessApps" component={ManagerFitnessApps}/>
                <Drawer.Screen name="UploadActivityScreen" component={UploadActivityScreen}/>
                <Drawer.Screen name="AddIndividualActivityItemsScreen" component={AddIndividualActivityItemsScreen}/>
                <Drawer.Screen name="SearchDonateScreen" component={SearchDonateScreen}/>
                <Drawer.Screen name="SearchDonate2Screen" component={SearchDonate2Screen}/>
                <Drawer.Screen name="RecommendDonateScreen" component={RecommendDonateScreen}/>
                <Drawer.Screen name="SearchDonate3Screen" component={SearchDonate3Screen}/>
                <Drawer.Screen name="SearchDonate4Screen" component={SearchDonate4Screen}/>
                <Drawer.Screen name="AchievementsScreen" component={AchievementsScreen}/>
                <Drawer.Screen name="ViewActivityScreen" component={ViewActivityScreen}/>
                <Drawer.Screen name="CalendarActivityScreen" component={CalendarActivityScreen}/>
                <Drawer.Screen name="ListDonateScreen" component={ListDonateScreen}/>
                <Drawer.Screen name="DetailDonateScreen" component={DetailDonateScreen}/>
                <Drawer.Screen name="OverviewActivityScreen" component={OverviewActivityScreen}/>
                <Drawer.Screen name="DetailActivityScreen" component={DetailActivityScreen}/>
            </Drawer.Navigator>
        </ApolloProvider>
    );
}

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ['Trang chủ'];
export const canExit = (routeName: string) => exitRoutes.includes(routeName);
