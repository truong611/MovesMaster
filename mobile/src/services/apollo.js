import {WebSocketLink} from 'apollo-link-ws';
import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {load} from './storage';
import {API_URL} from "../config";

const makeApolloClient = async () => {
    let token = '';
    const session = await load('root');
    if (session) {
        const sessionObj = session['movesModel']['userInfo'];
        token = sessionObj.token;
    }
    // const authorization = token ? `Bearer ${token}` : '';
    // create an apollo link instance, a network interface for apollo client
    // const link = new WebSocketLink({
    //     uri: API_URL,
    //     options: {
    //         reconnect: true,
    //         connectionParams: {
    //             headers: {
    //                 'content-type': 'application/json',
    //                 'Authorization': authorization,
    //             },
    //         },
    //     },
    // });

    const httpLink = createHttpLink({
        uri: API_URL,
    });

    const authLink = setContext((_, {headers}) => {
        // get the authentication token from local storage if it exists
        // const token = localStorage.getItem('token');
        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            }
        }
    });

    // create an inmemory cache instance for caching graphql data
    const cache = new InMemoryCache();

    // instantiate apollo client with apollo link instance and cache instance
    const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache,
    });

    return client;

};

export default makeApolloClient;
