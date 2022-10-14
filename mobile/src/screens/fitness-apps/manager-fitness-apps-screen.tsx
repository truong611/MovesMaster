import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Header, Screen, Text } from '../../components';
import { color } from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import AppleHealthKit, { HealthKitPermissions, } from 'react-native-health'
import { getQueryVariable, replaceHTTP, showToast } from "../../services";
import { GARMIN_accsess_token, GARMIN_activities, GARMIN_Consumer_Key, GARMIN_Consumer_Secret, GARMIN_oauthConfirm, GARMIN_request_token, STRAVA_oauthAuthorize, STRAVA_oauthToken } from "../../config";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { FETCH_getFitnessAppUsage, FETCH_removeFitnessAppUsage } from "./fitness-apps-service";
import { Buffer } from "buffer"


const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

/* Permission options */
const permissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.DistanceCycling,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            AppleHealthKit.Constants.Permissions.FlightsClimbed,
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.DistanceSwimming,
        ],
    },
} as HealthKitPermissions;

export const ManagerFitnessApps = observer(function ManagerFitnessApps() {
    const isFocused = useIsFocused();
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const [listFitnessApp, setListFitnessApp] = useState([]);
    const [listFitnessAppUsage, setListFitnessAppUsage] = useState([]);

    const { refetch } = useQuery(FETCH_getFitnessAppUsage);
    const [removeFitnessAppUsage, { }] = useMutation(FETCH_removeFitnessAppUsage);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let { data: { getFitnessAppUsage: { FitnessApp, FitnessAppUsage, message, messageCode } } } = await refetch();
                setLoading(false);
                if (messageCode == 200) {            
                    setListFitnessApp(FitnessApp);
                    setListFitnessAppUsage(FitnessAppUsage)
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const connectAppleHealth = async (Fitness_App_ID) => {
        // AppleHealthKit.isAvailable((err: Object, available: boolean) => {
        //     console.log(err)
        //     console.log(available)
        //     if (err) {
        //         console.log('error initializing Healthkit: ', err)
        //         return
        //     }
        // })
        // AppleHealthKit.getAuthStatus(permissions, (err, results) => {
        //     console.log(err)
        //     console.log(results)
        // })
        await AppleHealthKit.initHealthKit(permissions, (error: string, results: boolean) => {
            /* Called after we receive a response from the system */
            if (error) {
                console.log('[ERROR] Cannot grant permissions!')
            }
            let _json = {
                athlete: {
                    id: "MovesMatter_AppleHealth"
                }
            }
            remove(Fitness_App_ID, false, _json);
            
})

    };

    const getStepData = async (options) => {
        await AppleHealthKit.getDailyStepCountSamples(
                        options,
                        (err: Object, results: HealthValue) => {
                        console.log("######getDailyStepCountSamples");
                            console.log(results)
                        },
                    )
    }

    const getSwimmingData = async (options) => {
        await AppleHealthKit.getDailyDistanceSwimmingSamples(
                                options,
                                (err: Object, results: HealthValue) => {
                                console.log("######getDailyDistanceSwimmingSamples");
                                    console.log(results)
                                },
                            )

    }

    const getCyclingData = async (options) => {
        await AppleHealthKit.getDailyDistanceCyclingSamples(
                                        options,
                                        (err: Object, results: HealthValue) => {
                                        console.log("######getDailyDistanceCyclingSamples");
                                            console.log(results)
                                        },
                                    )
        }

    const connect = async (item) => {
            let appId = item?.Fitness_App_ID
            let appName = item?.Fitness_App_Name
            if (appName == 'Strava') {
                await connectStrava(appId)
                return
            }
            if (appName == 'Garmin') {
                await connectGarmin(appId)
                return
            }
            if (appName == 'Apple Health') {
                await connectAppleHealth(appId)
                return
            }
        // if(listFitnessAppUsage?.length > 0){
        //     let checkApplehealth = false;
        //     listFitnessAppUsage.map((item) => {
        //         if(item?.FitnessApp?.Fitness_App_Name == 'Apple Health') checkApplehealth = true
        //     })
        //     if(checkApplehealth){
        //         if(listFitnessAppUsage?.length == 1){
        //             if (item?.Fitness_App_Name == 'Strava') {
        //                 await connectStrava(item?.Fitness_App_ID)
        //                 return
        //             }
        //             if (item?.Fitness_App_Name == 'Garmin') {
        //                 await connectGarmin(item?.Fitness_App_ID)
        //             }
        //         }else{
        //             showToast('error', "You connected another app!")
        //         }
        //     }else{
        //         if(listFitnessAppUsage?.length >= 1){
        //             showToast('error', "You connected another app!")
                    
        //         }else {
        //             if (item?.Fitness_App_Name == 'Strava') {
        //                 await connectStrava(item?.Fitness_App_ID)
        //                 return
        //             }
        //             if (item?.Fitness_App_Name == 'Garmin') {
        //                 await connectGarmin(item?.Fitness_App_ID)
        //             }
        //         }
        //     }

        // }else{
        //     let appId = item?.Fitness_App_ID
        //     let appName = item?.Fitness_App_Name
        //     if (appName == 'Strava') {
        //         await connectStrava(appId)
        //         return
        //     }
        //     if (appName == 'Garmin') {
        //         await connectGarmin(appId)
        //     }
        //     if (appName == 'Apple Health') {
        //         await connectAppleHealth(appId)
        //     }
        // }
        
    };

    const connectStrava = async (Fitness_App_ID) => {
        await Linking.openURL(STRAVA_oauthAuthorize).then(() => {
            Linking.addEventListener('url', async ({ url }) => {              
                if (url.search("strava") != -1) {
                    setLoading(true);
                    let params = getQueryVariable(url);
                    const response = await fetch(STRAVA_oauthToken + params?.code, {
                        method: 'POST',
                    });
                    setLoading(false);                  
                    let json = await response.json();
                    console.log(json);
                    await remove(Fitness_App_ID, false, json);
                }
            });
        });
    };
    const connectGarmin = async (Fitness_App_ID) => {
        let data_request = create_oauth_signature({
            type: "request_token"
        })
        let myHeaders = new Headers()
        myHeaders.append("Authorization", `OAuth oauth_nonce=${data_request?.oauth_nonce}, oauth_signature=${data_request?.uriEncodedHash}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${data_request?.oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`)
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };
        await fetch(GARMIN_request_token, requestOptions)
            .then(response => response.text())
            .then(result => {
                let arrRes = result.split('&')
                let oauth_token = arrRes[0].split("=")[1]
                let oauth_token_secret = arrRes[1].split("=")[1]
                Linking.openURL(GARMIN_oauthConfirm + oauth_token).then(() => {
                    Linking.addEventListener('url', async ({ url }) => {
                        if (url) {    
                            let params = getQueryVariable(url);
                            let data_access = create_oauth_signature({
                                type: "access_token",
                                oauth_token_secret: oauth_token_secret,
                                oauth_verifier: params?.oauth_verifier,
                                oauth_token: params?.oauth_token
                            })
                            let _myHeaders = new Headers()
                            _myHeaders.append("Authorization", `OAuth oauth_nonce=${data_access?.oauth_nonce}, oauth_signature=${data_access?.uriEncodedHash}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_token=${params?.oauth_token}, oauth_timestamp=${data_access?.oauth_timestamp}, oauth_verifier=${params?.oauth_verifier}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`)
                            var _requestOptions = {
                                method: 'POST',
                                headers: _myHeaders,
                                redirect: 'follow'
                            };
                            await fetch(GARMIN_accsess_token, _requestOptions)
                                .then(response => response.text())
                                .then(responAccess => {
                                    // console.log(responAccess);
                                    let ArrRespronAccess = responAccess.split('&')
                                    let _oauth_token = ArrRespronAccess[0].split("=")[1]
                                    let _oauth_token_secret = ArrRespronAccess[1].split("=")[1]

                                    let _json = {
                                        access_token: _oauth_token,
                                        refresh_token: _oauth_token_secret,
                                        athlete: {
                                            id: _oauth_token
                                        }
                                    }
                                     remove(Fitness_App_ID, false, _json)

                                    let EndTime = Math.floor(new Date().getTime() / 1000)
                                    let StartTime = EndTime - 86400;      
                                    
                                    let data_Activities = create_oauth_signature({
                                        type: "activities",
                                        oauth_token: _oauth_token,
                                        oauth_token_secret: _oauth_token_secret,
                                        EndTime: EndTime,
                                        StartTime: StartTime
                                    })
                                    // console.log(data_Activities);
                                    if (data_Activities) {
                                        var myHeaders_activity = new Headers();
                                        myHeaders_activity.append("Authorization", `OAuth oauth_nonce=${data_Activities.oauth_nonce}, oauth_signature=${data_Activities.uriEncodedHash}, oauth_token=${_oauth_token}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${data_Activities.oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`)
                                        requestOptions = {
                                            method: 'GET',
                                            headers: myHeaders_activity,
                                            redirect: 'follow'
                                        };
                                        // console.log("Header: ", `OAuth oauth_nonce=${data_Activities.oauth_nonce}, oauth_signature=${data_Activities.uriEncodedHash}, oauth_token=${_oauth_token}, oauth_consumer_key=${GARMIN_Consumer_Key}, oauth_timestamp=${data_Activities.oauth_timestamp}, oauth_signature_method="HMAC-SHA1", oauth_version="1.0"`);
                                        // console.log("Api: ", GARMIN_activities + "uploadStartTimeInSeconds=" + StartTime + "&uploadEndTimeInSeconds=" + EndTime, requestOptions)
                                        
                                        fetch(GARMIN_activities + "uploadStartTimeInSeconds=" + StartTime + "&uploadEndTimeInSeconds=" + EndTime, requestOptions)
                                            .then(response => response.text())
                                            .then(result => eval(result))
                                            .then(json => {
                                                console.log(json);
                                                // remove(Fitness_App_ID, false, json)
                                            })
                                            .catch(error => console.log('error', error));
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                    });
                });
            }).catch(err => console.log(err))
    };

    const create_oauth_signature = (data) => {
        let CryptoJS = require("crypto-js");
        let oauth_timestamp = new Date().getTime()
        let oauth_nonce = 3153996031
        let key = ""
        let Signature_Base_String = ""
        if (data?.type == "request_token") {
            key = Buffer.from(GARMIN_Consumer_Secret + '&', 'utf-8').toString();
            Signature_Base_String = `POST&https%3A%2F%2Fconnectapi.garmin.com%2Foauth-service%2Foauth%2Frequest_token&oauth_consumer_key%3D${GARMIN_Consumer_Key}%26oauth_nonce%3D${oauth_nonce}%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D${oauth_timestamp}%26oauth_version%3D1.0`
        }
        if (data?.type == "access_token") {
            key = Buffer.from(GARMIN_Consumer_Secret + '&' + data?.oauth_token_secret).toString();
            Signature_Base_String = `POST&https%3A%2F%2Fconnectapi.garmin.com%2Foauth-service%2Foauth%2Faccess_token&oauth_consumer_key%3D${GARMIN_Consumer_Key}%26oauth_nonce%3D${oauth_nonce}%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D${oauth_timestamp}%26oauth_token%3D${data?.oauth_token}%26oauth_verifier%3D${data?.oauth_verifier}%26oauth_version%3D1.0`
        }
        if (data?.type == "activities") {
            oauth_timestamp = Math.floor(oauth_timestamp / 1000)
            key = Buffer.from(GARMIN_Consumer_Secret + '&' + data?.oauth_token_secret).toString();
            Signature_Base_String = `GET&https%3A%2F%2Fapis.garmin.com%2Fwellness-api%2Frest%2Factivities&oauth_consumer_key%3D${GARMIN_Consumer_Key}%26oauth_nonce%3D${oauth_nonce}%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D${oauth_timestamp}%26oauth_token%3D${data?.oauth_token}%26oauth_version%3D1.0%26uploadEndTimeInSeconds%3D${data?.EndTime}%26uploadStartTimeInSeconds%3D${data?.StartTime}`
        }
        const hash = CryptoJS.HmacSHA1(Signature_Base_String, key)
        let base64encoded = CryptoJS.enc.Base64.stringify(hash)
        const uriEncodedHash = encodeURIComponent(base64encoded);
        return { uriEncodedHash, oauth_nonce, oauth_timestamp }

    }

    // }

    const remove = async (fitnessAppId, isRemove = true, json = null) => {
        if (!isRemove && !json?.athlete?.id) {
            return
        } 
        setLoading(true);
        try {
            let payload = {
                bodyData: {
                    Fitness_App_ID: fitnessAppId,
                    isRemove: isRemove,
                    Fitness_App_Usage_ID: json?.athlete?.id.toString() || null,
                    Fitness_App_Usage_Access_Token: json?.access_token || null,
                    Fitness_App_Usage_Refresh_Token: json?.refresh_token || null,
                    Fitness_App_Usage_Expires_At: json?.expires_at ? (new Date(json?.expires_at * 1000)).toUTCString() : null,
                }
            };
            let { data: { removeFitnessAppUsage: { messageCode, message } } } = await removeFitnessAppUsage({
                variables: payload,
            });
            setLoading(false);
            if (messageCode == 200) {
                onRefresh();
                showToast('success', message)
            } else {
                showToast('error', message)
            }
        } catch (e) {
            setLoading(false);
            showToast('error', e.message)
        }
    };

    const isShow = (id) => {
        let find = listFitnessAppUsage.find(x => x?.Fitness_App_ID == id);
        return !find;
    };

    const topComponent = () => {
        return (
            <View style={{ paddingVertical: 16 }}>
                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 15 }} fonts={'DemiBold'}>MANAGE FITNESS APPS</Text>
                </View>
                <View style={styles.appsWrapper}>
                    <View style={{ marginBottom: 16 }}>
                        <Text fonts={'DemiBold'}>CURRENT APPS</Text>
                    </View>
                    {listFitnessAppUsage?.length ?
                        <View style={styles.appsItemWrapper}>
                            {listFitnessAppUsage.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={'listFitnessAppUsage-' + item.toString() + index}
                                        style={[styles.appsItem]}
                                        onPress={() => {
                                            Alert.alert("Confirm", "Are you sure remove fitness app " + item?.FitnessApp?.Fitness_App_Name,
                                                [
                                                    {
                                                        text: "Cancel",
                                                        onPress: () => console.log("Cancel Pressed"),
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: "OK",
                                                        onPress: () => remove(item?.Fitness_App_ID)
                                                    }
                                                ]
                                            );
                                        }}>
                                        <View style={styles.appsItemImageWrapper}>
                                            {item?.FitnessApp?.Fitness_App_Icon ?
                                                <Image resizeMode={"contain"} style={styles.appsItemImage}
                                                    source={{ uri: replaceHTTP(item?.FitnessApp?.Fitness_App_Icon) }} />
                                                : null}
                                        </View>
                                        <Text style={{
                                            width: layout.width / 4,
                                            textAlign: 'center'
                                        }}>{item?.FitnessApp?.Fitness_App_Name}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        : null}
                </View>
                <View style={styles.appsWrapper}>
                    <View style={{ marginBottom: 16 }}>
                        <Text fonts={'DemiBold'}>POPULAR APPS AVAILABLE TO MOVES USERS</Text>
                    </View>
                    {listFitnessApp?.length ?
                        <View style={styles.appsItemWrapper}>
                            {listFitnessApp.map((item, index) => {
                                if (isShow(item?.Fitness_App_ID)) {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => connect(item)}
                                            key={'listFitnessApp-' + index}
                                            style={[styles.appsItem,
                                            isShow(item?.Fitness_App_ID) ? {} : { opacity: 0, height: 0 }
                                            ]}>
                                            <View style={styles.appsItemImageWrapper}>
                                                {item?.Fitness_App_Icon ?
                                                    <Image resizeMode={"contain"} style={styles.appsItemImage}
                                                        source={{ uri: replaceHTTP(item?.Fitness_App_Icon)}} />
                                                    : null}
                                            </View>
                                            <Text style={{
                                                width: layout.width / 4,
                                                textAlign: 'center'
                                            }}>{item?.Fitness_App_Name}</Text>
                                        </TouchableOpacity>
                                    )
                                } else {
                                    return null
                                }
                            })}
                        </View>
                        : null}
                </View>
            </View>
        );
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    return (
        <>
            {isLoading && <CenterSpinner />}
            <Screen style={ROOT} preset="fixed">
                <View style={{ flex: 1 }}>
                    <Header headerText='LOGO' />
                    <FlatList
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{ flex: 1 }}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'manager-fitness-apps-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    btnOrange: {
        backgroundColor: color.orange,
        maxWidth: (layout.width / 4) - 8,
    },
    textWhite: {
        color: color.white
    },
    appsWrapper: {
        backgroundColor: color.tabbar,
        marginBottom: 16,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderRadius: 12
    },
    appsItemWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8
    },
    appsItem: {
        alignItems: 'center',
        marginBottom: 16,
        width: '30%',
        marginHorizontal: '1.5%'
    },
    appsItemImageWrapper: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: 16,
        backgroundColor: color.primary,
        marginBottom: 4
    },
    appsItemImage: {
        width: layout.width / 4,
        height: layout.width / 4,
        borderRadius: 16,
    }
});
