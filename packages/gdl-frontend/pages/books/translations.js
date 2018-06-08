// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import { Trans } from '@lingui/react';
import MdArrowForward from 'react-icons/lib/md/arrow-forward';
import doFetch, { fetchMyTranslations } from '../../fetch';
import { Link } from '../../routes';
import type { Translation, I18n } from '../../types';
import { securePage, withI18n } from '../../hocs';
import Layout from '../../components/Layout';
import Box from '../../components/Box';
import Flex from '../../components/Flex';
import H1 from '../../components/H1';
import H4 from '../../components/H4';
import P from '../../components/P';
import Card from '../../components/Card';
import A from '../../components/A';
import Container from '../../components/Container';
import Head from '../../components/Head';
import BookCover from '../../components/BookCover';
import { colors } from '../../style/theme';

type Props = {
  i18n: I18n
};

type State = {
  translations: Array<Translation>
};

class TranslationCard extends React.Component<
  { translation: Translation },
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
      <Card key={translation.id} p={[15, 20]} mt={20}>
        <Flex>
          <Box mr={[10, 20]}>
            <Link
              route="book"
              params={{
                lang: translation.translatedTo.code,
                id: translation.id
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
          </Box>
          <Box flex="1">
            <H4>{translation.title}</H4>
            <P color={colors.text.subtle} style={{ marginTop: 0 }}>
              <Trans>from {translation.publisher.name}</Trans>
            </P>
            <Box>
              {translation.translatedFrom.name}{' '}
              <MdArrowForward color={colors.base.orange} />{' '}
              <strong>{translation.translatedTo.name}</strong>
            </Box>
            <div style={{ float: 'right' }}>
              <A
                isUppercased
                isBold
                onClick={this.handleSynchronize}
                isLoading={this.state.isLoading}
                disabled={this.state.isSynchronized}
              >
                <Trans>Sync</Trans>
              </A>
              <A
                isUppercased
                isBold
                style={{ marginLeft: '30px' }}
                href={translation.crowdinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans>Edit</Trans>
              </A>
            </div>
          </Box>
        </Flex>
      </Card>
    );
  }
}

class MyTranslationsPage extends React.Component<Props, State> {
  state = {
    translations: []
  };

  async componentDidMount() {
    const translationsRes = await fetchMyTranslations();
    // TODO: Notify user of error
    if (translationsRes.isOk) {
      this.setState({ translations: translationsRes.data });
    }
  }

  render() {
    const { i18n } = this.props;
    const { translations } = this.state;

    return (
      <Layout crumbs={[<Trans>My translations</Trans>]}>
        <Head title={i18n.t`My translations`} />
        <Container py={[15, 40]}>
          <H1 textAlign="center">
            <Trans>My translations</Trans>
          </H1>
          {translations.map(translation => (
            <TranslationCard key={translation.id} translation={translation} />
          ))}
        </Container>
      </Layout>
    );
  }
}

export default securePage(withI18n(MyTranslationsPage));