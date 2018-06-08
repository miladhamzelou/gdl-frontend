// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */

import * as React from 'react';

import { fetchBook, fetchChapter } from '../../fetch';
import type { BookDetails, Chapter, Context } from '../../types';
import { claims } from '../../lib/auth/token';
import securePage from '../../hocs/securePage';
import errorPage from '../../hocs/errorPage';
import Head from '../../components/Head';
import Editor from '../../components/Editor';

type Props = {
  book: BookDetails,
  chapter?: Chapter
};

class EditPage extends React.Component<Props> {
  static async getInitialProps({ query }: Context) {
    const bookRes = await fetchBook(query.id, query.lang);

    if (!bookRes.isOk) {
      return {
        statusCode: bookRes.statusCode
      };
    }

    const book = bookRes.data;

    let chapter;
    if (query.chapterId) {
      const chapterRes = await fetchChapter(
        query.id,
        query.chapterId,
        query.lang
      );

      if (!chapterRes.isOk) {
        return {
          statusCode: chapterRes.statusCode
        };
      }

      chapter = chapterRes.data;
    }

    return {
      book,
      chapter
    };
  }

  render() {
    let { book, chapter } = this.props;

    return (
      <React.Fragment>
        <Head
          title={`Edit: ${book.title}`}
          image={book.coverImage && book.coverImage.url}
        />
        <Editor book={book} chapter={chapter} />
      </React.Fragment>
    );
  }
}

export default securePage(errorPage(EditPage), {
  claim: claims.writeBook
});