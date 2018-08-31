// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import { Trans, I18n } from '@lingui/react';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Divider,
  CircularProgress
} from '@material-ui/core';
import gql from 'graphql-tag';
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons';
import { Query } from 'react-apollo';

import doFetch from '../../fetch';
import { Link } from '../../routes';
import { securePage } from '../../hocs';
import type { Language } from '../../types';
import Layout from '../../components/Layout';
import { Center, Container } from '../../elements';
import Head from '../../components/Head';
import BookCover from '../../components/BookCover';
import { spacing } from '../../style/theme';

class MyTranslationsPage extends React.Component<{}> {
  render() {
    return (
      <Layout>
        <I18n>{({ i18n }) => <Head title={i18n.t`My translations`} />}</I18n>
        <Container>
          <Typography
            variant="display1"
            align="center"
            paragraph
            css={{ marginTop: spacing.large, marginBottom: spacing.large }}
          >
            <Trans>My translations</Trans>
          </Typography>
          <Query query={TRANSLATIONS_QUERY}>
            {({ loading, data, error }) => {
              if (loading) {
                return (
                  <Center>
                    <CircularProgress />
                  </Center>
                );
              }

              if (error) {
                return (
                  <Typography align="center" color="error">
                    <Trans>An error has occurred. Please try again.</Trans>
                  </Typography>
                );
              }

              const translations = data.currentUser.translations;

              return translations.length === 0 ? (
                <Typography
                  align="center"
                  paragraph
                  css={{ marginTop: spacing.medium }}
                >
                  <Trans>You have not translated any books yet.</Trans>
                </Typography>
              ) : (
                translations.map(t => (
                  <TranslationCard
                    key={`${t.id}-${t.translatedTo.code}`}
                    translation={t}
                  />
                ))
              );
            }}
          </Query>
        </Container>
      </Layout>
    );
  }
}

const TRANSLATIONS_QUERY = gql`
  query translations {
    currentUser {
      translations {
        id
        bookId
        title
        coverImage {
          url
        }
        translatedFrom {
          code
          name
        }
        translatedTo {
          code
          name
        }
        crowdinUrl
        synchronizeUrl
        publisher {
          name
        }
      }
    }
  }
`;

class TranslationCard extends React.Component<
  {
    translation: {
      id: string,
      bookId: number,
      title: string,
      translatedFrom: Language,
      translatedTo: Language,
      synchronizeUrl: string,
      crowdinUrl: string,
      publisher: {
        name: string
      },
      coverImage: ?{ url: string }
    }
  },
  { isLoading: boolean, isSynchronized: boolean }
> {
  state = {
    isLoading: false,
    isSynchronized: false
  };

  handleSynchronize = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    await doFetch(this.props.translation.synchronizeUrl);
    this.setState({ isLoading: false, isSynchronized: true });
  };

  render() {
    const { translation } = this.props;

    return (
      <Card css={{ marginBottom: spacing.large }}>
        <Grid container>
          <Grid item>
            <Link
              route="book"
              params={{
                lang: translation.translatedTo.code,
                id: translation.bookId
              }}
            >
              <a>
                <BookCover
                  w={[75, 120]}
                  h={[100, 150]}
                  coverImage={translation.coverImage}
                />
              </a>
            </Link>
          </Grid>
          <Grid item xs>
            <CardContent>
              <Typography variant="headline">{translation.title}</Typography>
              <Typography variant="subheading">
                <Trans>from {translation.publisher.name}</Trans>
              </Typography>
            </CardContent>
          </Grid>
        </Grid>
        <CardContent>
          <Grid container alignItems="center">
            <Grid item xs={4}>
              <Typography>{translation.translatedFrom.name}</Typography>
            </Grid>
            <Grid item xs={4} css={{ textAlign: 'center' }}>
              <ArrowForwardIcon />
            </Grid>
            <Grid item xs={4}>
              <Typography align="right" variant="body2">
                {translation.translatedTo.name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            color="primary"
            onClick={this.handleSynchronize}
            disabled={this.state.isSynchronized}
          >
            <Trans>Sync</Trans>
          </Button>
          <Button
            color="primary"
            href={translation.crowdinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Edit</Trans>
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default securePage(MyTranslationsPage);
