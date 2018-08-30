// @flow

import React from 'react';
import Router from 'next/router';
import Downshift from 'downshift';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Avatar,
  ListItemText,
  ListItem,
  Paper,
  Typography
} from '@material-ui/core';

import colors from '../../style/colors';
import type { Book } from '../../types';
import SearchField from './SearchField';

type State = {
  query: string
};

export default class AutoCompleteSearchField extends React.Component<
  {},
  State
> {
  state = {
    query: ''
  };

  handleSelection = (selectedBook: Book) => {
    Router.push({
      pathname: '/admin/edit',
      // TODO: When search returns ID with language code. Fix this part
      query: { id: `${selectedBook.id}-${selectedBook.language.code}` }
    });
  };

  handleChange = (event: SyntheticInputEvent<EventTarget>) => {
    this.setState({ query: event.target.value });
  };

  render() {
    return (
      <Downshift
        onChange={this.handleSelection}
        itemToString={item => (item ? item.title : '')}
      >
        {({
          getInputProps,
          getItemProps,
          getLabelProps,
          isOpen,
          highlightedIndex
        }) => (
          <div>
            <SearchField
              {...getInputProps({
                placeholder: 'Search books',
                onChange: this.handleChange,
                autoFocus: true
              })}
            />
            <AutoCompleteMenu
              {...{
                isOpen,
                getInputProps,
                getItemProps,
                getLabelProps,
                highlightedIndex,
                query: this.state.query
              }}
            />
          </div>
        )}
      </Downshift>
    );
  }
}

function AutoCompleteMenu({
  isOpen,
  getInputProps,
  getItemProps,
  getLabelProps,
  highlightedIndex,
  query
}) {
  if (!isOpen || query.trim() === '') {
    return null;
  }

  return (
    <Query query={SEARCH_QUERY} variables={{ query }}>
      {({ loading, error, data }) => {
        if (loading) return null;
        return (
          <Paper css={{ position: 'absolute', width: '960px' }} square>
            {data.search && data.search.totalCount === 0 ? (
              <ListItem>
                <ListItemText
                  primary={`No search results for "${query}"`}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ) : (
              data.search.results.map((book, index) => (
                <ListItem
                  {...getItemProps({
                    key: book.id,
                    item: book,
                    index,
                    style: {
                      backgroundColor:
                        highlightedIndex === index
                          ? colors.base.grayLight
                          : 'inherit'
                    }
                  })}
                  button
                >
                  {book.coverImage && <Avatar src={book.coverImage.url} />}
                  <ListItemText
                    primary={
                      <div>
                        {book.title}
                        <Typography variant="caption">
                          {book.language.name}
                        </Typography>
                      </div>
                    }
                    secondary={book.description}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))
            )}
          </Paper>
        );
      }}
    </Query>
  );
}

const SEARCH_QUERY = gql`
  query search($query: String!) {
    search(query: $query) {
      totalCount
      results {
        id
        title
        description
        language {
          code
          name
        }
        coverImage {
          url
        }
      }
    }
  }
`;
