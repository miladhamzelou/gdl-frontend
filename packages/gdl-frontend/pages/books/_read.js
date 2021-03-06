// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import Head from 'next/head';
import { withRouter } from 'next/router';
import getConfig from 'next/config';

import { fetchBook, fetchChapter } from '../../fetch';
import { hasClaim, claims } from 'gdl-auth';
import type { ConfigShape, BookDetails, Chapter, Context } from '../../types';
import { errorPage } from '../../hocs';
import Reader from '../../components/Reader';

const {
  publicRuntimeConfig: { canonicalUrl }
}: ConfigShape = getConfig();

type Props = {
  book: BookDetails,
  chapter: Chapter,
  userHasEditAccess: boolean,
  router: {
    query: {
      chapterId?: string
    }
  }
};

class Read extends React.Component<Props> {
  static async getInitialProps({ query, req }: Context) {
    const bookRes = await fetchBook(query.id, query.lang);

    if (!bookRes.isOk) {
      return {
        statusCode: bookRes.statusCode
      };
    }

    const book = bookRes.data;

    // If no chapter is specified, we get the first one
    const chapterId = query.chapterId ? query.chapterId : book.chapters[0].id;

    const chapterRes = await fetchChapter(query.id, chapterId, query.lang);

    if (!chapterRes.isOk) {
      return {
        statusCode: chapterRes.statusCode
      };
    }

    return {
      userHasEditAccess: hasClaim(claims.writeBook, req),
      chapter: chapterRes.data,
      book
    };
  }

  render() {
    const { book, chapter, userHasEditAccess } = this.props;

    return (
      <React.Fragment>
        <Head>
          {!this.props.router.query.chapterId && (
            <link
              rel="canonical"
              href={`${canonicalUrl}/${book.language.code}/books/read/${
                book.id
              }/${chapter.id}`}
            />
          )}
        </Head>

        <Reader
          book={book}
          chapter={chapter}
          userHasEditAccess={userHasEditAccess}
        />
      </React.Fragment>
    );
  }
}

export default errorPage(withRouter(Read));
