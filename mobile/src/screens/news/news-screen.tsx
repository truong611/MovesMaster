import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
    StatusBar,
    Platform
} from 'react-native';
import {Header, Screen, Text} from '../../components';
import CenterSpinner from "../../components/center-spinner/center-spinner";
import {color} from "../../theme";
import {useIsFocused} from "@react-navigation/native";
import {useQuery} from "@apollo/react-hooks";
import {FETCH_getListNews,} from "./news-service";
import {showToast, StatusBarHeight, stripHtml} from "../../services";
import {useNavigation} from "@react-navigation/native"
import { replaceHTTP } from '../../services';

const layout = Dimensions.get('window');

const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const NewsScreen = observer(function NewsScreen() {
    const [isLoading, setLoading] = useState(false);
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [tabIndex, setTabIndex] = useState('favourite');
    const [data, setData] = useState<any>({
        favourite: [],
        all: [],
    });
    const {refetch} = useQuery(FETCH_getListNews);

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
        setRefresh(false);
        if (isFocused && !isRefresh && refetch) {
            setLoading(true);
            try {
                let {data: {getListNews: {listNews, message, messageCode}}} = await refetch(); 
                setLoading(false);
                if (messageCode == 200) {
                    let _data = {...data};
                    _data.favourite = listNews['favourite'];
                    _data.all = listNews['all'];
                    setData(_data)
                } else {
                    showToast('error', message)
                }
            } catch (e) {
                setLoading(false);
                showToast('error', e.message)
            }
        }
    };

    const detailNews = async (id) => {
        navigation.navigate('MainScreen', {
            screen: 'DetailNewsScreen',
            params: {id: id},
        });
    };

    const onRefresh = () => {
        setRefresh(true)
    };

    const ItemView = ({item, index}) => {
        return (
            <TouchableOpacity style={styles.itemView} onPress={() => {
                detailNews(item['News_Item_ID'])
            }}>
                <View style={[styles.newsImageWrapper,
                    item['News_Image'] ? {} : {backgroundColor: color.lightGrey}
                ]}>
                    <Image resizeMode='contain' style={styles.newsImage} source={item['News_Image'] ? {uri: replaceHTTP(item['News_Image'])} : {}}/>    
                </View>
                <View>
                    <Text style={styles.newsTitle} numberOfLines={2} fonts='DemiBold'>
                        {item['News_Title']}
                    </Text>
                    <Text style={styles.newsDescription} numberOfLines={2}>
                        {stripHtml(item['News_Content'])}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const topComponent = () => {
        return (
            <View style={styles.topWrapper}>
                <View style={{paddingHorizontal: 16}}>
                    <Text style={{fontSize: 15}} fonts={'DemiBold'}>NEWS</Text>
                </View>
                <View style={styles.itemTabWrapper}>
                    <TouchableOpacity
                        style={[styles.itemTab, tabIndex == 'favourite' ? styles.itemTabActive : {}]}
                        onPress={() => setTabIndex('favourite')}>
                        <Text>favourite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.itemTab, tabIndex == 'all' ? styles.itemTabActive : {}]}
                        onPress={() => setTabIndex('all')}>
                        <Text>all</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const footerComponent = () => {
        return (
            <View style={{marginBottom: 56}}/>
        );
    };

    const emptyComponent = () => {
        return (
            <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>No data</Text>
            </View>
        )
    };

    return (
        <>
            {isLoading && <CenterSpinner/>}
            <Screen style={[ROOT, {marginTop: 0 - StatusBarHeight}]} preset="fixed">
                <View style={{flex: 1}}>
                    <Header headerText='LOGO'/>
                    <FlatList
                        contentContainerStyle={{flexGrow: 1}}
                        refreshing={isRefresh}
                        onRefresh={() => onRefresh()}
                        // showsVerticalScrollIndicator={false}
                        // showsHorizontalScrollIndicator={false}
                        style={{flex: 1}}
                        renderItem={ItemView}
                        data={data[tabIndex]}
                        ListHeaderComponent={topComponent()}
                        ListFooterComponent={footerComponent()}
                        ListEmptyComponent={emptyComponent()}
                        keyExtractor={(item, index) => 'news-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    topWrapper: {
        paddingTop: 16
    },
    itemTabWrapper: {
        flexDirection: 'row',
        backgroundColor: color.tabbar,
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 24,
    },
    itemTab: {
        width: (layout.width - 16 * 2) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemTabActive: {
        borderRadius: 24,
        backgroundColor: color.green
    },
    itemView: {
        marginBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    newsImageWrapper: {
        width: layout.width / 3,
        height: (layout.width / 3) * 2 / 3,
        borderRadius: 16,
        // backgroundColor: color.lightGrey,
        marginRight: 12,
    },
    newsImage: {
        width: layout.width / 3,
        height: (layout.width / 3) * 2 / 3,
        borderRadius: 16,
        backgroundColor: color.tabbar,
        overlayColor: color.tabbar
    },
    newsTitle: {
        fontSize: 15,
        marginBottom: 6,
        width: layout.width - 16 * 2 - layout.width / 3 - 8
    },
    newsDescription: {
        width: layout.width - 16 * 2 - layout.width / 3 - 8,
        fontSize: 13
    },
    emptyWrapper: {
        flex: 1, justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
    emptyText: {
        color: color.palette.lightGrey,
    },
});
