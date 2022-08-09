import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink } from '@apollo/client/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from "../environments/environment";
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { split, ApolloClientOptions } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';

const uri = environment.apiUrl; // <-- add the URL of the GraphQL server here
const wsUri = uri.replace('http://', '').replace('https://', '')

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        const http = httpLink.create({ uri: uri + '/graphql' });
        const middleware = new ApolloLink((operation, forward) => {
          const user = JSON.parse(localStorage.getItem('user'));
          operation.setContext({
            headers: new HttpHeaders().set('Authorization', `Bearer ${user?.token || null}`)
          });
          return forward(operation);
        });
        const authenLink = middleware.concat(http);
        const logoutLink = onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) => {
              if (message === "Unauthenticated!") {
                localStorage.removeItem('user');
                location.reload();
              }
            });
          }
        });

        // Create a WebSocket link:
        let temp = uri.includes('https') ? 'wss' : 'ws';

        const ws = new WebSocketLink({
          uri: `${temp}:${wsUri}/graphql`,
          options: {
            reconnect: true,
          },
        });

        // using the ability to split links, you can send data to each link
        // depending on what kind of operation is being sent
        const link = split(
          // split based on operation type
          ({ query }) => {
            const { kind, operation }: any = getMainDefinition(query);
            return (
              kind === 'OperationDefinition' && operation === 'subscription'
            );
          },
          ws,
          logoutLink.concat(authenLink),
        );

        return {
          link: link,
          cache: new InMemoryCache(),
        };
      },
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
}
