// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */
import * as React from 'react';
import { AppBar, Typography, Tab, Tabs } from '@material-ui/core';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import EditBookForm from '../../components/EditBook/EditBookForm';
import EditChapterForm from '../../components/EditBook/EditChapterForm';
import Layout from '../../components/Layout';
import type { Context } from '../../types';

type State = {
  selectedTab: number
};

export default class EditPage extends React.Component<
  { id: ?string, chapterId: string },
  State
> {
  static async getInitialProps({ query }: Context) {
    const chapterId = query.chapterId;

    return { chapterId, id: query.id };
  }

  state = {
    // If the chapter id is provided in the url the default tab will be the chapters tab
    selectedTab: this.props.chapterId ? 1 : 0
  };

  handleChange = (_: *, selectedTab: number) => {
    this.setState({ selectedTab });
  };

  render() {
    const { chapterId, id } = this.props;
    const selectedTab = this.state.selectedTab;

    return (
      <Layout shouldAddPadding={false}>
        <AppBar position="static" color="default">
          <Tabs
            centered={true}
            value={selectedTab}
            onChange={this.handleChange}
          >
            <Tab label="Edit Book" />
            <Tab label="Edit Chapters" />
          </Tabs>
        </AppBar>
        <TabContainer>
          {!id && (
            <Typography
              align="center"
              variant="subheading"
              css={{ marginTop: 40 }}
            >
              Search for a book to edit it.
            </Typography>
          )}
          {selectedTab === 0 &&
            id && (
              <Query query={BOOK_QUERY} variables={{ id }}>
                {({ loading, error, data }) => {
                  if (loading || error) {
                    return null;
                  }
                  return <EditBookForm book={data.book} />;
                }}
              </Query>
            )}
          {selectedTab === 1 &&
            id && <EditChapterForm book={undefined} chapterId={chapterId} />}
        </TabContainer>
      </Layout>
    );
  }
}

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

const BOOK_QUERY = gql`
  query book($id: ID!) {
    book(id: $id) {
      id
      title
      description
      language {
        code
        name
      }
      publishingStatus
      pageOrientation
      coverImage {
        url
      }
    }
  }
`;
