import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableFooter,
  TablePagination,
  Typography
} from '@material-ui/core';
import NextLink from 'next/link';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Container from '../../components/Container';
import Layout from '../../components/Layout';

class Flagged extends React.Component<{}> {
  render() {
    return (
      <Layout>
        <Container>
          <Typography variant="headline" component="h1" gutterBottom>
            Flagged books
          </Typography>
          <Query query={FLAGGED_BOOKS_QUERY}>
            {({ loading, error, data, fetchMore }) => {
              if (loading) return null;
              return data.flagged.totalCount === 0 ? (
                <Typography variant="subheading" align="center">
                  Could not find any flagged books.
                </Typography>
              ) : (
                <FlaggedTable
                  page={data.flagged.pageInfo.page}
                  totalCount={data.flagged.totalCount}
                  pageSize={data.flagged.pageInfo.pageSize}
                  onPageChange={(_, page) =>
                    fetchMore({
                      variables: { page: page + 1 },
                      updateQuery: (previousResult, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return previousResult;
                        return fetchMoreResult;
                      }
                    })
                  }
                  books={data.flagged.results}
                />
              );
            }}
          </Query>
        </Container>
      </Layout>
    );
  }
}

const FlaggedTable = ({
  page,
  totalCount,
  pageSize,
  loadingState,
  onPageChange,
  books
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Language</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {books.map(book => (
          <TableRow key={`${book.id}-${book.language.code}`}>
            <TableCell>
              <NextLink
                href={{
                  pathname: '/admin/edit',
                  query: { id: book.id, lang: book.language.code }
                }}
                passHref
              >
                <a>{book.title}</a>
              </NextLink>
            </TableCell>
            <TableCell>{book.language.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow />
        <TableRow>
          <TablePagination
            count={totalCount}
            page={page - 1}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[]}
            onChangePage={onPageChange}
          />
        </TableRow>
      </TableFooter>
    </Table>
  );
};

const FLAGGED_BOOKS_QUERY = gql`
  query flagged($page: Int) {
    flagged(page: $page, pageSize: 30) {
      totalCount
      pageInfo {
        pageSize
        page
      }
      results {
        id
        title
        language {
          code
          name
        }
      }
    }
  }
`;

export default Flagged;
