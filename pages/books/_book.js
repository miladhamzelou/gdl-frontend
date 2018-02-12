// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import { DateFormat, Trans } from '@lingui/react';
import { MdTranslate } from 'react-icons/lib/md';

import styled from 'react-emotion';
import config from '../../config';
import { fetchBook, fetchSimilarBooks } from '../../fetch';
import type { Book, RemoteData, Context } from '../../types';
import defaultPage from '../../hocs/defaultPage';
import { Link } from '../../routes';
import Box from '../../components/Box';
import Flex from '../../components/Flex';
import Layout from '../../components/Layout';
import Ribbon from '../../components/Ribbon';
import A from '../../components/A';
import H3 from '../../components/H3';
import H1 from '../../components/H1';
import H6 from '../../components/H6';
import P from '../../components/P';
import Card from '../../components/Card';
import BookCover from '../../components/BookCover';
import Button from '../../components/Button';
import Container from '../../components/Container';
import Head from '../../components/Head';
import BookList from '../../components/BookList';
import media from '../../style/media';
import theme from '../../style/theme';
import { flexColumnCentered } from '../../style/flex';

type Props = {
  book: RemoteData<Book>,
  similar: RemoteData<{
    results: Array<Book>
  }>
};

const CoverWrap = styled('div')`
  ${media.mobile`
    position: absolute;
    top: -120px;
    z-index: 10;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
  `} height: 190px;

  ${media.tablet`
    height: 365px;
    flex: 0 0 260px;
    margin-right: 20px;
  `};
`;

const Hr = styled('hr')`
  height: 1px;
  background-color: ${theme.colors.grayLight};
  border-style: none;
  margin: 0;
  ${media.mobile`
    margin-left: -15px;
    margin-right: -15px;
  `};
`;

const HeroCard = styled(Card)`
  ${flexColumnCentered};
`;

class BookPage extends React.Component<Props> {
  static async getInitialProps({ query, accessToken }: Context) {
    const [book, similar] = await Promise.all([
      fetchBook(query.id, query.lang)(accessToken),
      fetchSimilarBooks(query.id, query.lang)(accessToken)
    ]);

    return {
      book,
      similar
    };
  }

  render() {
    const { similar, book } = this.props;

    const contributors = book.contributors
      .map(contributor => <span key={contributor.id}>{contributor.name}</span>)
      .map((item, index) => [index > 0 && ', ', item]);

    const categories = book.categories
      .map(category => <span key={category.id}>{category.name}</span>)
      .map((item, index) => [index > 0 && ', ', item]);

    return (
      <Layout
        crumbs={[
          <Link route="books" params={{ lang: book.language.code }}>
            <a>{book.language.name}</a>
          </Link>,
          book.title
        ]}
        language={book.language}
      >
        <Head
          title={book.title}
          description={book.description}
          imageUrl={book.coverPhoto ? book.coverPhoto.large : null}
          isBookType
        />
        <Container pt={[15, 20]}>
          <Flex mt={[120, 0]} style={{ position: 'relative' }}>
            <CoverWrap>
              <BookCover coverPhoto={book.coverPhoto} width={[150, 260]} />
            </CoverWrap>
            <HeroCard textAlign="center" p={[15, 20]} pt={[80, 20]} flex="1">
              <H1 fontSize={[28, 38]}>{book.title}</H1>
              <P fontSize={14}>
                <Trans>
                  from <span>{book.publisher.name}</span>
                </Trans>
              </P>
              <P fontSize={[14, 16]} lineHeight={[22, 26]}>
                {book.description}
              </P>
              <Link
                route="read"
                passHref
                params={{ id: book.id, lang: book.language.code }}
                prefetch
              >
                <Button color="green">
                  <Trans>Read Book</Trans>
                </Button>
              </Link>
              <Box mt={[15, 20]}>
                <A isBold isUnderlined href={book.downloads.epub}>
                  <Trans>Download book</Trans>
                </A>
              </Box>
            </HeroCard>
          </Flex>
        </Container>
        <Container pb={[15, 20]}>
          <Box ml={[0, 'auto']} w={['auto', 438]}>
            <Box p={[15, 20]} fontSize={[14, 16]}>
              <Ribbon level={book.readingLevel} />
              {book.datePublished && (
                <Box mb={15}>
                  <H6>
                    <Trans>Published</Trans>
                  </H6>
                  <DateFormat value={new Date(book.datePublished)} />
                </Box>
              )}
              <Box mb={15}>
                <H6>
                  <Trans>Authors</Trans>
                </H6>
                {contributors}
              </Box>
              <Box>
                <H6>
                  <Trans>License</Trans>
                </H6>
                <A href={book.license.url}>{book.license.description}</A>
              </Box>
              {book.categories.length > 0 && (
                <Box mb={15}>
                  <H6>
                    <Trans>categories</Trans>
                  </H6>,
                  {categories},
                </Box>
              )}
            </Box>
            {config.TRANSLATION_PAGES &&
              book.supportsTranslation && (
                <React.Fragment>
                  <Hr />
                  <Box my={[15, 20]} textAlign="center">
                    <Link
                      route="translate"
                      passHref
                      params={{ id: book.id, lang: book.language.code }}
                    >
                      <Button>
                        <MdTranslate /> <Trans>Translate book</Trans>
                      </Button>
                    </Link>
                  </Box>
                </React.Fragment>
              )}
          </Box>
          <Hr />
          <H3>
            <Trans>Similar</Trans>
          </H3>
          <BookList books={similar.results} mt={20} />
        </Container>
      </Layout>
    );
  }
}

export default defaultPage(BookPage);
