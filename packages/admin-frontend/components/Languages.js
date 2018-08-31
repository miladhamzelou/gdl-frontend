// @flow
import * as React from 'react';
import gql from 'graphql-tag';
import type { QueryRenderProps } from 'react-apollo';
import { Query } from 'react-apollo';

const LANGUAGES_QUERY = gql`
  query languages {
    languages {
      code
      name
    }
  }
`;

export default (props: QueryRenderProps) => (
  <Query query={LANGUAGES_QUERY} {...props} />
);
