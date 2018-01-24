// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import { Trans } from '@lingui/react';
import Router from 'next/router';
import defaultPage from '../../hocs/defaultPage';
import Layout from '../../components/Layout';
import Container from '../../components/Container';
import Box from '../../components/Box';
import { setAuthToken } from '../../lib/auth/token';
import { parseHash } from '../../lib/auth';

class Success extends React.Component<*> {
  async componentDidMount() {
    const authResult = await parseHash();
    if (authResult.accessToken) {
      setAuthToken(authResult);
      Router.push('/');
    }
  }

  render() {
    return (
      <Layout>
        <Container pt={50}>
          <Box textAlign="center">
            <Trans>Logged in, please wait while we redirect you!</Trans>
          </Box>
        </Container>
      </Layout>
    );
  }
}

export default defaultPage(Success);
