// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */

import fetch from 'isomorphic-unfetch';
import { getAuthToken } from 'gdl-auth';
import getConfig from 'next/config';
import type {
  BookDetails,
  RemoteData,
  Chapter,
  FeaturedContent,
  StoredParameters,
  NewImageMetadata,
  ImageMetadata,
  License
} from '../types';

const {
  publicRuntimeConfig: { bookApiUrl, imageApiUrl }
} = getConfig();

export async function fetchBook(
  id: string | number,
  language: string
): Promise<RemoteData<BookDetails>> {
  return await doFetch(`${bookApiUrl}/books/${language}/${id}`);
}

export async function exportBooks(
  language: string,
  source: string
): Promise<RemoteData<Blob>> {
  return await doFetch(`${bookApiUrl}/export/${language}/${source}`);
}

/*
* Wrap fetch with some error handling and automatic json parsing
*/
async function doFetch(
  url: string,
  options: ?{
    method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any
  }
): Promise<RemoteData<any>> {
  const token = typeof window !== 'undefined' ? getAuthToken() : undefined;

  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : null
    },
    ...options
  });

  let result;
  if (response.headers.get('Content-Type').includes('application/json')) {
    result = await response.json();
  } else {
    result = await response.text();
  }

  if (response.ok) {
    return {
      data: result,
      isOk: true,
      statusCode: response.status
    };
  }

  return {
    error: result,
    isOk: false,
    statusCode: response.status
  };
}

export async function postStoredParameters(
  imageApiBody: StoredParameters
): Promise<RemoteData<StoredParameters>> {
  const result = await doFetch(`${imageApiUrl}/images/stored-parameters`, {
    method: 'POST',
    body: JSON.stringify(imageApiBody)
  });

  return result;
}

export async function fetchStoredParameters(
  imageUrl: string
): Promise<RemoteData<StoredParameters>> {
  const result = await doFetch(
    `${imageApiUrl}/images/stored-parameters${imageUrl}`,
    {
      method: 'GET',
      body: null
    }
  );
  return result;
}

export async function fetchImageMetadata(
  imageId: string
): Promise<RemoteData<ImageMetadata>> {
  const result = await doFetch(`${imageApiUrl}/images/${imageId}`, {
    method: 'GET',
    body: null
  });
  return result;
}

export async function patchImageMetadata(
  imageId: string,
  data: Object
): Promise<RemoteData<{}>> {
  const result = await doFetch(`${imageApiUrl}/images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

  return result;
}

export async function fetchChapter(
  bookId: string | number,
  chapterId: string | number,
  language: string
): Promise<RemoteData<Chapter>> {
  const result = await doFetch(
    `${bookApiUrl}/books/${language}/${bookId}/chapters/${chapterId}`
  );

  return result;
}

export async function saveChapter(
  book: BookDetails,
  chapter: Chapter
): Promise<RemoteData<Chapter>> {
  const result = await doFetch(
    `${bookApiUrl}/books/${book.language.code}/${book.id}/chapters/${
      chapter.id
    }`,
    { method: 'PUT', body: JSON.stringify(chapter) }
  );

  return result;
}

export function fetchSources(
  languageCode: string
): Promise<RemoteData<Array<any>>> {
  return doFetch(`${bookApiUrl}/sources/${languageCode}`);
}

export function fetchFeaturedContent(
  language: ?string
): Promise<RemoteData<Array<FeaturedContent>>> {
  return doFetch(`${bookApiUrl}/featured/${language || ''}`);
}

export function saveFeaturedContent(
  featuredContent: FeaturedContent,
  languageCode: string
): Promise<RemoteData<{ id: number }>> {
  // transform the featured content object into the format that the API is accepting
  const transformedFeaturedContent = {
    ...featuredContent,
    language: languageCode
  };

  return doFetch(`${bookApiUrl}/featured`, {
    method: 'POST',
    body: JSON.stringify(transformedFeaturedContent)
  });
}

export function updateFeaturedContent(
  featuredContent: FeaturedContent
): Promise<RemoteData<{ id: number }>> {
  return doFetch(`${bookApiUrl}/featured`, {
    method: 'PUT',
    body: JSON.stringify(featuredContent)
  });
}

export function deleteFeaturedContent(
  id: number
): Promise<
  RemoteData<{ code: string, description: string, occuredAt: string }>
> {
  return doFetch(`${bookApiUrl}/featured/${id}`, {
    method: 'DELETE'
  });
}

export async function uploadNewImage(
  file: File,
  metadata: NewImageMetadata
): Promise<RemoteData<ImageMetadata>> {
  const url = `${imageApiUrl}/images`;

  const formData = new FormData();
  formData.append('metadata', JSON.stringify(metadata));
  formData.append('file', file);

  const result = await doFetch(url, {
    method: 'POST',
    body: formData
  });
  return result;
}

export async function fetchLicenses(): Promise<RemoteData<Array<License>>> {
  const url = `${imageApiUrl}/images/licenses`;

  return await doFetch(url, {
    method: 'GET',
    body: null
  });
}
