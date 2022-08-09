// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import {BtnBack, Header, Screen, Text} from '../../components';
import {color} from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import {useRoute, useIsFocused, useNavigation} from '@react-navigation/native';
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getNews} from "./news-service";
import {showToast, timestampToDate} from "../../services";
import {useStores} from "../../models";
import RenderHtml from 'react-native-render-html';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const DetailNewsScreen = observer(function DetailNewsScreen() {
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const [isLoading, setLoading] = useState(false);
    const {params}: any = useRoute();
    const [data, setData] = useState<any>(null);
    const navigation = useNavigation();
    const {movesModel} = useStores();

    const {refetch} = useQuery(FETCH_getNews);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let {data: {getNews: {news, message, messageCode}}} = await refetch({
                    id: parseInt(params?.id)
                });
                setLoading(false);
                if (messageCode == 200) {
                    delete news.__typename;
                    setData(news);
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const goToPage = (page: any) => {
        navigation.navigate('MainScreen', {screen: page});
    };

    const goBack = async () => {
        goToPage('NewsScreen');
        // await movesModel.setAppInfo({
        //     tabIndex: 2,
        // });
        
    };

    const shareOnSocial = (type: string, shareURL: string) => {
        let url = '';
        switch (type) {
            case 'facebook':
                url = 'https://www.facebook.com/sharer/sharer.php?u=' + shareURL;
                break;
            case 'twitter':
                url = 'https://twitter.com/intent/tweet?url=' + shareURL;
                break;
            case 'linkedin':
                url = 'https://www.linkedin.com/sharing/share-offsite/?url=' + shareURL;
                break;
            default:
        }
        Linking.openURL(url)
            .catch(() => {
                showToast('error', 'Something went wrong');
            });
    };

    const topComponent = () => {
        console.log(data?.News_Content);
        
        return (
            <View style={styles.container}>
                <BtnBack goBack={goBack}/>
                <View style={{paddingHorizontal: 16}}>
                    <Text style={styles.newsTitle} fonts='DemiBold'>
                        {data?.News_Title}
                    </Text>
                    {data?.News_Image ?
                        <View>
                            <Image resizeMode={"contain"} style={styles.newsImage} source={{uri: data?.News_Image}}/>
                        </View>
                        : null}

                    {data?.News_Content ?
                        <RenderHtml
                            contentWidth={layout.width - 16}
                            source={{
                                html: `<div style="color: white">${data?.News_Content}</div>`,
                            }}
                        />
                        : null}

                    <Text style={styles.newsDate}>
                        {`${timestampToDate(data?.Created_Date)}, By ${data?.News_Item_Author?.Forename} ${data?.News_Item_Author?.Surname}`}
                    </Text>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.shareWrapper}>
                            <Text>share this</Text>
                            <View style={styles.shareIcons}>
                                <TouchableOpacity
                                    onPress={() => shareOnSocial('facebook', data?.News_Url)}>
                                    <Ionicons name='logo-facebook' color={color.green} size={32}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => shareOnSocial('twitter', data?.News_Url)}>
                                    <Ionicons name='logo-twitter' color={color.green} size={32}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => shareOnSocial('linkedin', data?.News_Url)}>
                                    <Ionicons name='logo-linkedin' color={color.green} size={32}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
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
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'detail-news-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        // padding: 16
        // paddingHorizontal: 16,
        paddingBottom: 16
    },
    backWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    backText: {
        marginLeft: 4,
        color: color.green
    },
    newsTitle: {
        fontSize: 15,
        marginBottom: 16,
    },
    newsImage: {
        width: layout.width - 32,
        height: (layout.width - 32) * 2 / 3,
        borderRadius: 32,
        marginBottom: 16,
        backgroundColor: color.tabbar
    },
    newsDescription: {},
    newsDate: {
        marginVertical: 16,
        textAlign: 'right'
    },
    shareWrapper: {
        alignItems: 'center',
        backgroundColor: color.tabbar,
        paddingTop: 16,
        paddingBottom: 8,
        borderRadius: 16,
        width: layout.width * 3 / 4,
    },
    shareIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
        marginBottom: 8
    }
});
