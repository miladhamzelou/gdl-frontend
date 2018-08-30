// @flow

import * as React from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import {
  FormControl,
  InputLabel,
  Select,
  Button,
  FormHelperText,
  TextField,
  Typography
} from '@material-ui/core';
import Link from 'next/link';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Container from '../Container';

import ChapterPreview from './ChapterPreview';
import { Page } from '../../style/Page';

type Props = {
  chapterId?: string,
  bookId: string
};

type State = {
  currentChapterId: ?string
};

export default class EditChapterForm extends React.Component<Props, State> {
  state = {
    currentChapterId: this.props.chapterId
  };

  // componentDidMount() {
  //   if (this.state.currentChapterId) {
  //     this.fetchSelectedChapter(this.state.currentChapterId);
  //   }
  // }

  // handleSubmit = async (content: Chapter) => {
  //   if (this.state.currentChapter) {
  //     const result = await saveChapter(this.props.book, content);

  //     if (result.isOk) {
  //       this.setState({ currentChapter: content });
  //     }
  //   }
  // };

  handleSelectChange = (event: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      currentChapterId: event.target.value
    });
  };

  render() {
    const { bookId } = this.props;

    return (
      <Query query={BOOK_CHAPTERS_QUERY} variables={{ id: bookId }}>
        {({ data, loading, error }) => {
          if (loading || error) return null;
          const book = data.book;
          return (
            <Container>
              <div css={{ width: '100%' }}>
                <Typography variant="headline" component="h1" gutterBottom>
                  Edit chapter:{' '}
                  <Link
                    href={`/${book.language.code}/books/read/${book.id}/${
                      this.props.chapterId ? this.props.chapterId : ''
                    }`}
                  >
                    <a>{book.title}</a>
                  </Link>
                </Typography>

                <FormControl margin="normal">
                  <InputLabel>Chapter</InputLabel>
                  <Select
                    native
                    value={this.state.currentChapterId}
                    onChange={this.handleSelectChange}
                    fullWidth
                  >
                    <option value="" />
                    {book.chapters.map(chapter => (
                      <option key={chapter.id} value={chapter.id}>
                        Chapter {chapter.seqNo}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {this.state.currentChapterId ? (
                  <Query
                    query={CHAPTER_QUERY}
                    variables={{ id: this.state.currentChapterId }}
                  >
                    {({ data, loading, error }) => (
                      <Form chapter={data && data.chapter} />
                    )}
                  </Query>
                ) : (
                  <Form chapter={null} />
                )}
              </div>
            </Container>
          );
        }}
      </Query>
    );
  }
}

const BOOK_CHAPTERS_QUERY = gql`
  query book($id: ID!) {
    book(id: $id) {
      id
      title
      language {
        code
      }
      chapters {
        id
        seqNo
      }
    }
  }
`;

const CHAPTER_QUERY = gql`
  query chapter($id: ID!) {
    chapter(id: $id) {
      id
      content
    }
  }
`;

const UPDATE_CHAPTER_MUTATION = gql`
  mutation updateChapter($input: UpdateChapterInput!) {
    updateChapter(input: $input) {
      chapter {
        id
        content
      }
    }
  }
`;

const Form = ({ chapter }) => (
  <Mutation
    mutation={UPDATE_CHAPTER_MUTATION}
    onCompleted={() => console.log('saved that shit')}
  >
    {updateChapter => (
      <FinalForm
        validate={handleValidate}
        onSubmit={values =>
          chapter &&
          updateChapter({
            variables: {
              input: {
                id: chapter.id,
                content: values.content
              }
            }
          })
        }
        initialValues={chapter || {}}
        render={({ pristine, invalid, handleSubmit, form, values }) => (
          <form>
            <Field
              name="content"
              render={({ input, meta }) => (
                <>
                  <TextField
                    margin="normal"
                    fullWidth
                    disabled={!chapter}
                    multiline
                    label="Chapter content"
                    {...input}
                  />
                  {meta.error &&
                    meta.touched && (
                      <FormHelperText error>{meta.error}</FormHelperText>
                    )}
                </>
              )}
            />

            <Button
              color="primary"
              onClick={handleSubmit}
              type="submit"
              disabled={pristine || invalid}
            >
              Save chapter
            </Button>

            <Button
              color="secondary"
              onClick={form.reset}
              type="submit"
              disabled={pristine}
            >
              Discard changes
            </Button>

            {chapter && (
              <div css={{ paddingTop: '16px' }}>
                <Typography variant="headline" component="h2" gutterBottom>
                  Preview
                </Typography>

                <Page
                  css={{
                    maxWidth: '960px',
                    width: '100%',
                    border: '1px solid black'
                  }}
                >
                  {/* $FlowFixMe*/}
                  <ChapterPreview content={values.content} />
                </Page>
              </div>
            )}
          </form>
        )}
      />
    )}
  </Mutation>
);

function handleValidate(values) {
  const errors = {};

  if (values.content === undefined || values.content.trim() === '') {
    errors.content = 'You have to enter something into content.';
  }

  return errors;
}
