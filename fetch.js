// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import fetch from 'isomorphic-unfetch';
import { bookApiUrl } from './config';
import type {RemoteData, Language, Book, FeaturedContent} from './types';
import {
  getAccessTokenFromLocalStorage,
  setAnonToken,
} from './lib/auth/token';

let getTokenOnServer;

if (!process.browser) {
  getTokenOnServer = require('./server/lib/auth').getToken; // eslint-disable-line global-require
}

/**
 * Get anonymous access token
 */
export async function fetchAnonToken(): Promise<{
  access_token: string,
  expires_in: number,
}> {
  if (!process.browser) {
    const token = await getTokenOnServer();
    return token;
  }
  const response = await fetch('/get_token');
  if (response.ok) {
    const token = await response.json();
    return token;
  }
  throw new Error('Unable to get access token');
}

/*
* Wrap fetch with some error handling and automatic json parsing
* Also ensures we have a valid access token.
*/
function fetchWithToken(
  url: string,
): (accessToken: ?string) => Promise<RemoteData<any>> {
  return async (accessToken: ?string) => {
    if (!process.browser && !accessToken) {
      throw new Error(
        'accessToken is a required parameter when calling fetch on the server',
      );
    }

    let token = accessToken || getAccessTokenFromLocalStorage();

    try {
      // Automatically renew token on the client if it is expired
      if (process.browser && accessToken == null) {
        const fullToken = await fetchAnonToken();
        setAnonToken(fullToken);
        token = fullToken.access_token;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : null,
        },
      });

      if (response.headers.get('Content-Type').includes('application/json')) {
        const json = await response.json();
        // Check if the response is in the 200-299 range
        if (response.ok) {
          return json;
        }
      }
      const err = new Error('Remote data error');
      // $FlowFixMe Ignore the flow error here. Should really extend the Error class, but that requires special Babel configuration. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
      err.statusCode = response.status || 500;
      throw err;
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  };
}

export default fetchWithToken;

// Default page size
const PAGE_SIZE = 5;

type Options = {
  pageSize?: number,
  level?: string,
  sort?: 'arrivaldate' | '-arrivaldate' | 'id' | '-id' | 'title' | '-title',
  page?: number,
};

export function fetchLevels(
  language: ?string,
): (accessToken: ?string) => Promise<RemoteData<Array<string>>> {
  return accessToken =>
    fetchWithToken(`${bookApiUrl}/levels/${language || ''}`)(accessToken);
}

export function fetchLanguages(): (
  accessToken: ?string,
) => Promise<RemoteData<Array<Language>>> {
  return accessToken => fetchWithToken(`${bookApiUrl}/languages`)(accessToken);
}

export function fetchFeaturedContent(
  language: ?string,
): (accessToken: ?string) => Promise<RemoteData<Array<FeaturedContent>>> {
  return accessToken =>
    fetchWithToken(`${bookApiUrl}/featured/${language || ''}`)(accessToken);
}

export function fetchBook(
  id: string | number,
  language: string,
): (accessToken: ?string) => Promise<RemoteData<Book>> {
  return accessToken =>
    fetchWithToken(`${bookApiUrl}/books/${language}/${id}`)(accessToken);
}

export function fetchSimilarBooks(
  id: string | number,
  language: string,
): (accessToken: ?string) => Promise<RemoteData<{ results: Array<Book> }>> {
  return accessToken =>
    fetchWithToken(
      `${bookApiUrl}/books/${language}/similar/${
      id
      }?sort=-arrivaldate&page-size=${PAGE_SIZE}`,
    )(accessToken);
}

export function fetchBooks(
  language: ?string,
  options: Options = {},
): (
    accessToken: ?string,
  ) => Promise<
  RemoteData<{
    results: Array<Book>,
    language: Language,
    page: number,
    totalCount: number,
  }>,
    > {
  return accessToken =>
    fetchWithToken(
      `${bookApiUrl}/books/${language || ''}?page=${options.page ||
      1}&sort=${options.sort ||
      '-arrivaldate'}&page-size=${options.pageSize || PAGE_SIZE}${
      options.level ? `&reading-level=${options.level}` : ''
      }`,
    )(accessToken);
}
