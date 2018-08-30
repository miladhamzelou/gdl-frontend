// @flow

import {
  InputLabel,
  FormControl,
  Button,
  TextField,
  Typography,
  Select
} from '@material-ui/core';
import * as React from 'react';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import { Form, Field } from 'react-final-form';

import isEmptyString from '../../lib/isEmptyString';
import type { BookDetails } from '../../types';
import Container from '../Container';
import Row from '../Row';
import EditBookImage from './EditBookImage';

const PUBLISHING_STATUS = ['PUBLISHED', 'FLAGGED', 'UNLISTED'];
const PAGE_ORIENTATIONS = ['PORTRAIT', 'LANDSCAPE'];

type Props = {
  book: BookDetails
};

export default class EditBookForm extends React.Component<Props> {
  handleMutationCompleted = () => {
    // Simplest way to update the data is to run getInitialProps again :]
    Router.push({
      pathname: '/admin/edit',
      query: { id: this.props.book.id, lang: this.props.book.language.code }
    });
  };

  render() {
    const book = this.props.book;
    return (
      <Container>
        {' '}
        {book && (
          <Typography variant="headline" component="h1" gutterBottom>
            Editing book:{' '}
            <Link href={`/${book.language.code}/books/details/${book.id}`}>
              <a>{book.title}</a>
            </Link>
          </Typography>
        )}
        <Row gridTemplateColumns="min-content auto">
          <EditBookImage book={book} />
          <Mutation
            mutation={UPDATE_BOOK_MUTATION}
            onCompleted={this.handleMutationCompleted}
          >
            {updateBook => (
              <Form
                initialValues={book}
                onSubmit={values =>
                  updateBook({
                    variables: {
                      input: {
                        id: book.id,
                        title: values.title,
                        description: values.description,
                        pageOrientation: values.pageOrientation,
                        publishingStatus: values.publishingStatus
                      }
                    }
                  })
                }
                validate={validateForm}
                render={({ handleSubmit, pristine, form, invalid }) => (
                  <form>
                    <Row autoFlow="row">
                      <Field
                        name="title"
                        render={({ input, meta }) => (
                          <TextField
                            fullWidth
                            label="Title"
                            {...input}
                            error={meta.error && meta.touched}
                          />
                        )}
                      />

                      <TextField
                        fullWidth
                        label="Language"
                        value={book.language.name}
                        disabled
                      />

                      <Field
                        name="description"
                        render={({ input, meta }) => (
                          <TextField
                            fullWidth
                            label="Description"
                            {...input}
                            error={meta.error && meta.touched}
                            multiline
                          />
                        )}
                      />
                      <Row>
                        <Field
                          label="Page orientation"
                          name="pageOrientation"
                          render={({ input }) => (
                            <FormControl>
                              <InputLabel>Page orientation</InputLabel>
                              <Select fullWidth {...input} native>
                                {PAGE_ORIENTATIONS.map(orientation => (
                                  <option key={orientation} value={orientation}>
                                    {orientation}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                        <Field
                          name="publishingStatus"
                          label="Publishing status"
                          render={({ input }) => (
                            <FormControl>
                              <InputLabel>Publishing status</InputLabel>
                              <Select fullWidth {...input} native>
                                {PUBLISHING_STATUS.map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Row>
                      <div>
                        <Button
                          color="secondary"
                          disabled={pristine}
                          onClick={form.reset}
                        >
                          Discard changes
                        </Button>

                        <Button
                          color="primary"
                          onClick={handleSubmit}
                          type="submit"
                          disabled={pristine || invalid}
                        >
                          Save book
                        </Button>
                      </div>
                    </Row>
                  </form>
                )}
              />
            )}
          </Mutation>
        </Row>
      </Container>
    );
  }
}

function validateForm(values) {
  const errors = {};

  if (isEmptyString(values.title)) {
    errors.title = 'Required';
  }

  if (isEmptyString(values.description)) {
    errors.description = 'Required';
  }

  return errors;
}

const UPDATE_BOOK_MUTATION = gql`
  mutation updateBook($input: UpdateBookInput!) {
    updateBook(input: $input) {
      book {
        id
      }
    }
  }
`;
