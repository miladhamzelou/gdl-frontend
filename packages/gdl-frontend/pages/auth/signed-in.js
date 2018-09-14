// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import { Trans } from '@lingui/react';
import Router, { withRouter } from 'next/router';
import { CircularProgress, Typography } from '@material-ui/core';

import Raven from '../../lib/raven';
import { Router as RoutesRouter } from '../../routes';
import Layout from '../../components/Layout';
import Container from '../../elements/Container';
import Center from '../../elements/Center';
import { handleAuthentication } from '../../lib/auth';

class Success extends React.Component<
  {
    router: {
      query: {
        next?: string
      }
    }
  },
  { authFailed: boolean }
> {
  state = {
    authFailed: false
  };
  async componentDidMount() {
    try {
      await handleAuthentication();
      const redirectUri = this.props.router.query.next || '/';

      // Sucks having 2 routers. But if we use the next-routes one for the admin stuff we get the 404 page :/
      if (redirectUri.startsWith('/admin')) {
        Router.push(redirectUri);
      } else {
        RoutesRouter.pushRoute(this.props.router.query.next || '/');
      }
    } catch (err) {
      this.setState({ authFailed: true });
      Raven.captureException(err);
    }
  }

  render() {
    return (
      <Layout>
        <Container mt="35px">
          {this.state.authFailed ? (
            <>
              <Typography
                align="center"
                variant="headline"
                paragraph
                component="h1"
              >
                <Trans>Oops, there was a problem signing you in.</Trans>
              </Typography>
              <Typography align="center">
                <Trans>
                  The error has been reported. Please feel free to try signing
                  in again.
                </Trans>
              </Typography>
            </>
          ) : (
            <Center>
              <CircularProgress />
            </Center>
          )}
        </Container>
      </Layout>
    );
  }
}

export default withRouter(Success);
