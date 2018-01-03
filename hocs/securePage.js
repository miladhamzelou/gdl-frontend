// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import Link from 'next/link';
import defaultPage from './defaultPage';
import { getAuthTokenTokenFromLocalStorage } from '../lib/auth/token';
import Layout from '../components/Layout';
import Container from '../components/Container';

/**
 * A HoC that ensures users are authenticated before displaying content
 */
const securePageHoc = Page =>
  class SecurePage extends React.Component<any> {
    static getInitialProps(ctx) {
      return typeof Page.getInitialProps === 'function' && Page.getInitialProps(ctx);
    }

    render() {
      if (!getAuthTokenTokenFromLocalStorage()) {
        return (
          <Layout>
            <Container pt={50}>
              Please <Link href="/auth/sign-in" prefetch><a>login</a></Link> to continue
            </Container>
          </Layout>
        );
      }
      return <Page {...this.props} />;
    }
  };

export default (Page: React.ComponentType<any>) =>
  defaultPage(securePageHoc(Page));