// @flow
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import fetch from 'isomorphic-unfetch';

let apolloClient = null;

function create(initialState, { getToken }) {
  const authLink = setContext((_, { headers }) => {
    const token = getToken();
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : null
      }
    };
  });

  return new ApolloClient({
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          // Sentry... sendToLoggingService(graphQLErrors);
          console.error({ graphQLErrors });
        }
        if (networkError) {
          console.error({ networkError });
          // hmmm
          // logoutUser();
        }
      }),
      authLink,
      new HttpLink({
        uri: 'http://localhost:4000/graphql',
        //credentials: 'include'
        fetch
      })
    ]),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(
  initialState: {},
  options: { getToken: () => ?string }
) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, options);
  }

  return apolloClient;
}
