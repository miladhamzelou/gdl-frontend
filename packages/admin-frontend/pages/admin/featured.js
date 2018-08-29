// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */

import * as React from 'react';
import {
  Select,
  Button,
  FormHelperText,
  InputLabel,
  FormControl,
  TextField,
  Typography
} from '@material-ui/core';
import { Form, Field, FormSpy } from 'react-final-form';
import CropImageViewer from '../../components/ImageCropper/CropImageViewer';
import {
  fetchFeaturedContent,
  updateFeaturedContent,
  saveFeaturedContent,
  deleteFeaturedContent
} from '../../lib/fetch';
import UploadFileDialog from '../../components/UploadFileDialog';
import Layout from '../../components/Layout';
import Row from '../../components/Row';
import Container from '../../components/Container';
import isEmptyString from '../../lib/isEmptyString';
import Languages from '../../components/Languages';
import type { FeaturedContent, ImageParameters } from '../../types';

type State = {
  featuredContent: ?FeaturedContent,
  selectedLanguage: string,
  croppedParameters: ?ImageParameters,
  file: ?File
};

export default class EditFeaturedContent extends React.Component<{}, State> {
  state = {
    featuredContent: null,
    selectedLanguage: '',
    croppedParameters: null,
    file: null
  };

  getFeaturedContent = async (languageCode: string) => {
    const featuredContentRes = await fetchFeaturedContent(languageCode);
    const featuredContent = featuredContentRes.isOk
      ? featuredContentRes.data[0]
      : null;

    if (featuredContent) {
      if (featuredContent.language.code !== languageCode) {
        this.setState({
          featuredContent: null
        });
      } else {
        this.setState({
          featuredContent: featuredContent
        });
      }
    }
  };

  putFeaturedContent = async (content: FeaturedContent) => {
    await updateFeaturedContent(content);
  };

  postFeaturedContent = async (content: FeaturedContent) => {
    const result = await saveFeaturedContent(
      content,
      this.state.selectedLanguage
    );
    if (result.isOk) {
      this.setState(prevState => ({
        featuredContent: { ...prevState.featuredContent, id: result.data.id }
      }));
    }
  };

  handleSaveButtonClick = (defaultReturned: boolean) => (
    content: FeaturedContent
  ) => {
    defaultReturned
      ? this.postFeaturedContent(content)
      : this.putFeaturedContent(content);

    this.setState({ featuredContent: content });
  };

  handleLanguageSelect = (event: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      selectedLanguage: event.target.value
    });

    this.getFeaturedContent(event.target.value);
  };

  deleteFeaturedContent = async (id: number) => {
    await deleteFeaturedContent(id);
  };

  handleDelete = () => {
    if (this.state.featuredContent) {
      this.deleteFeaturedContent(this.state.featuredContent.id);
      this.setState({ featuredContent: null });
    }
  };

  handleCroppedParametersReceived = (
    croppedParameters: ImageParameters,
    change: (name: string, value: any) => void,
    imageUrl: string
  ) => {
    const baseUrl =
      imageUrl && imageUrl.includes('?')
        ? imageUrl.substring(0, imageUrl.indexOf('?'))
        : imageUrl;

    if (croppedParameters) {
      change(
        'imageUrl',
        baseUrl +
          '?cropStartX=' +
          croppedParameters.cropStartX +
          '&cropEndX=' +
          croppedParameters.cropEndX +
          '&cropStartY=' +
          croppedParameters.cropStartY +
          '&cropEndY=' +
          croppedParameters.cropEndY
      );
    }

    this.setState({ croppedParameters: croppedParameters });
  };

  handleOnUpload = (
    imageUrl: string,
    change: (name: string, value: any) => void
  ) => {
    this.setState({ file: null });
    change('imageUrl', imageUrl);
  };

  handleOnCancel = () => {
    this.setState({ file: null });
  };

  handleFileChosen = (event: SyntheticInputEvent<EventTarget>) => {
    this.setState({
      file: event.target.files[0]
    });
  };

  render() {
    const { featuredContent, selectedLanguage } = this.state;

    // If the language of the featured content is different from what we expected to fetch, there is no featured content for that language. A request defaults to english if it does not exist.
    let defaultReturned = true;
    if (
      featuredContent &&
      featuredContent.language &&
      featuredContent.language.code
    ) {
      defaultReturned = featuredContent.language.code !== selectedLanguage;
    }

    return (
      <Layout>
        <Container>
          <Typography variant="headline" component="h1" gutterBottom>
            Edit featured content
          </Typography>

          <FormControl fullWidth>
            <InputLabel htmlFor="language-select">Select language</InputLabel>
            <Languages>
              {({ loading, error, data }) => {
                const languages = (data && data.languages) || [];
                return (
                  <Select
                    onChange={this.handleLanguageSelect}
                    value={selectedLanguage}
                    native
                    inputProps={{ id: 'language-select' }}
                  >
                    <option value="" />
                    {languages.map(language => {
                      return (
                        <option key={language.code} value={language.code}>
                          {language.name} ({language.code})
                        </option>
                      );
                    })}
                    ;
                  </Select>
                );
              }}
            </Languages>
          </FormControl>
          <Form
            initialValues={featuredContent || {}}
            onSubmit={this.handleSaveButtonClick(defaultReturned)}
            validate={handleValidate}
            render={({ handleSubmit, pristine, invalid, form }) => (
              <form>
                <Field
                  name="title"
                  render={({ input, meta }) => (
                    <TextField
                      fullWidth
                      error={meta.error && meta.touched}
                      margin="normal"
                      disabled={selectedLanguage === ''}
                      label="Title"
                      {...input}
                    />
                  )}
                />
                <Field
                  name="description"
                  render={({ input, meta }) => (
                    <TextField
                      fullWidth
                      margin="normal"
                      error={meta.error && meta.touched}
                      disabled={selectedLanguage === ''}
                      label="Description"
                      {...input}
                      multiline
                    />
                  )}
                />
                <Field
                  name="link"
                  render={({ input, meta }) => (
                    <>
                      <TextField
                        fullWidth
                        type="url"
                        error={meta.error && meta.touched}
                        margin="normal"
                        disabled={selectedLanguage === ''}
                        label="Link"
                        {...input}
                      />
                      {meta.error &&
                        meta.touched && (
                          <FormHelperText error>{meta.error}</FormHelperText>
                        )}
                    </>
                  )}
                />

                <Row
                  alignItems="center"
                  gridTemplateColumns="auto min-content min-content"
                >
                  <div>
                    <Field
                      name="imageUrl"
                      render={({ input, meta }) => (
                        <>
                          <TextField
                            fullWidth
                            margin="normal"
                            error={meta.error && meta.touched}
                            type="url"
                            disabled={selectedLanguage === ''}
                            label="Image Url"
                            {...input}
                          />
                          {meta.error &&
                            meta.touched && (
                              <FormHelperText error>
                                {meta.error}
                              </FormHelperText>
                            )}
                        </>
                      )}
                    />
                  </div>

                  <span>or</span>

                  <input
                    disabled={this.state.selectedLanguage === ''}
                    type="file"
                    accept="image/*"
                    value=""
                    onChange={event => this.handleFileChosen(event)}
                  />

                  {this.state.file && (
                    <UploadFileDialog
                      language={selectedLanguage}
                      selectedFile={this.state.file}
                      objectURL={URL.createObjectURL(this.state.file)}
                      onCancel={this.handleOnCancel}
                      onUpload={url => this.handleOnUpload(url, form.change)}
                    />
                  )}
                </Row>

                <FormSpy
                  render={({ values }) => (
                    <div>
                      {/*$FlowFixMe*/}
                      {values.imageUrl && (
                        <CropImageViewer
                          ratio={2.63}
                          imageUrl={values.imageUrl}
                          onDialogOk={croppedParameters => {
                            this.handleCroppedParametersReceived(
                              croppedParameters,
                              form.change,
                              /*$FlowFixMe*/
                              values.imageUrl
                            );
                          }}
                        />
                      )}
                    </div>
                  )}
                />

                <Button
                  color="primary"
                  disabled={invalid || pristine}
                  type="submit"
                  onClick={handleSubmit}
                >
                  Save changes
                </Button>
                <Button
                  color="secondary"
                  disabled={pristine}
                  onClick={form.reset}
                >
                  Discard changes
                </Button>
                <Button
                  color="secondary"
                  disabled={
                    selectedLanguage === '' || !featuredContent // We will disable the button if there is no selected language or if the language selection causes the default feature content to be returned
                  }
                  onClick={this.handleDelete}
                >
                  Delete featured content
                </Button>
              </form>
            )}
          />
        </Container>
      </Layout>
    );
  }
}
function handleValidate(values) {
  const errors = {};

  if (isEmptyString(values.title)) {
    errors.title = 'Required';
  }

  if (isEmptyString(values.description)) {
    errors.description = 'Required';
  }

  const regex = /http(s)?:\/\/.*/;
  if (isEmptyString(values.link) || !values.link.match(regex)) {
    errors.link = 'Must be a valid URL e.g "https://digitallibrary.io"';
  }

  if (isEmptyString(values.imageUrl) || !values.imageUrl.match(regex)) {
    errors.imageUrl =
      'Must be a valid URL image url e.g "https://images.digitallibrary.io/imageId.png';
  }

  return errors;
}