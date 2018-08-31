// @flow
import * as React from 'react';
import initApollo from './initApollo';
import Head from 'next/head';
import { getDataFromTree } from 'react-apollo';
import { getAuthToken } from 'gdl-auth';

export default (App: React.ComponentType<{}>, apiUrl: string) => {
  return class Apollo extends React.Component<{}> {
    static displayName = `withApollo(${App.displayName || 'App'})`;
    static async getInitialProps(ctx) {
      const { Component, router } = ctx;

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(ctx);
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apollo = initApollo(
        {},
        {
          getToken: () => getAuthToken(ctx.ctx.req),
          apiUrl
        }
      );

      if (typeof window === 'undefined') {
        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apollo}
            />
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
          console.error('Error while running `getDataFromTree`', error);
          if (
            error.graphQLErrors &&
            error.graphQLErrors.find(e => e.extensions.code === 'NOT_FOUND')
          ) {
            // SSR: Small hack to force 404 response
            const notFoundError = new Error('Not found');
            notFoundError.code = 'ENOENT';
            throw notFoundError;
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apollo.cache.extract();

      return {
        ...appProps,
        apolloState
      };
    }

    constructor(props) {
      super(props);
      this.apolloClient = initApollo(props.apolloState, {
        getToken: getAuthToken,
        apiUrl
      });
    }

    render() {
      return <App {...this.props} apolloClient={this.apolloClient} />;
    }
  };
};
