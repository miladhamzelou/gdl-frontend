import { render } from 'react-dom';

import React, { Component } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Link from 'next/link';
import fetch from 'isomorphic-fetch';
import {getTokenFromLocalCookie} from '../lib/fetch';

class Crop extends Component {

  
  state = { ratio: 0.81, imageApiBody: null, existingParameters: null };

  toPercentages = c => {
    var cropStartPxX = c.getCropBoxData().left - c.getCanvasData().left;
    var cropEndPxX = cropStartPxX + c.getCropBoxData().width;
    var cropStartPxY = c.getCropBoxData().top - c.getCanvasData().top;
    var cropEndPxY = cropStartPxY + c.getCropBoxData().height;

    return {
      cropStartX: Math.max(
        0,
        Math.round((cropStartPxX / c.getImageData().naturalWidth) * 100)
      ),
      cropEndX: Math.min(
        100,
        Math.round((cropEndPxX / c.getImageData().naturalWidth) * 100)
      ),
      cropStartY: Math.max(
        0,
        Math.round((cropStartPxY / c.getImageData().naturalHeight) * 100)
      ),

      cropEndY: Math.min(
        100,
        Math.round((cropEndPxY / c.getImageData().naturalHeight) * 100)
      )
    };
  };

  // TODO Ha med revision her
  toImageApiBody = pcnt => {
    const existingParametersForCurrentRatio = this.state.existingParameters !== null && this.state.existingParameters.find(p => p.forRatio === String(this.state.ratio));
    const revision = existingParametersForCurrentRatio !== null ? existingParametersForCurrentRatio.revision : 1;
    console.log('Using revision=' + revision);

    return {
      forRatio: String(this.state.ratio),
      revision: revision,
      imageUrl: this.props.imageUrl.substr(
        this.props.imageUrl.lastIndexOf('/')
      ),
      rawImageQueryParameters: {
        cropStartX: pcnt.cropStartX,
        cropEndX: pcnt.cropEndX,
        cropStartY: pcnt.cropStartY,
        cropEndY: pcnt.cropEndY
      }
    };
  };

  _crop() {
    var pcnt = this.toPercentages(this.refs.cropper);
    var url = `${this.props.imageUrl}?cropStartX=${pcnt.cropStartX}&cropEndX=${
      pcnt.cropEndX
    }&cropStartY=${pcnt.cropStartY}&cropEndY=${pcnt.cropEndY}`;

    console.log(JSON.stringify(this.toImageApiBody(pcnt), undefined, 2));
    this.setState({imageApiBody: this.toImageApiBody(pcnt)});
  }

  postToImageApi = async _ => {
    if (this.state.imageApiBody !== null) {
      console.log('Posting');
      // TODO Hent URL fra config istedet
      await fetch('https://api.test.digitallibrary.io/image-api/v2/images/stored-parameters', {
        method: 'POST',
        // TODO Ikke ta med dette
        headers: {
          'Authorization': 'Bearer ' + getTokenFromLocalCookie(),
          'Accept': 'application/json'
        },
        body: JSON.stringify(this.state.imageApiBody)
      });
      await this.getExistingParameters();
    } else {
      console.log('Not posting');
    }
  }

  getExistingParameters = async () => {
    const imageUrl = this.props.  imageUrl.substr(this.props.imageUrl.lastIndexOf('/'));
    const url = 'https://api.test.digitallibrary.io/image-api/v2/images/stored-parameters' + imageUrl;
    // fetch(url).thresults => {console.log(results)})// this.setState({existingParameters: results.json()})});
    const response = await fetch(url);
    this.setState({existingParameters: await response.json()});

  }

  toggleRatio = e => {
    e.preventDefault();
    if (this.state.ratio === 0.81) {
      this.setState({ ratio: 2.63 });
    } else {
      this.setState({ ratio: 0.81 });
    }
  };

  componentDidMount() {
    this.getExistingParameters();
  }

  render() {
    return (
      <div>
        <p>
          <button onClick={this.toggleRatio}>Toggle ratio</button>
        </p>
        <p>Existing stuff: {JSON.stringify(this.state.existingParameters)}</p>
        <Cropper
          ref="cropper"
          src={this.props.imageUrl}
          aspectRatio={this.state.ratio}
          guides={false}
          viewMode={2}
          zoomable={false}
          dragMode={'move'}
          preview={'.preview'}
          crop={this._crop.bind(this)}
        />
        <p
          className="preview"
          style={{ overflow: 'hidden', height: 400, width: 400 }}
        />
        <button onClick={this.postToImageApi}>Save this crop config for ratio={this.state.ratio}</button>
      </div>
    );
  }
}


const CropPage = ({imageUrl}) => (
  <div>
  <h1>Crop</h1>
  {imageUrl == null ? (
    <p>
      You need to specify <tt>imageUrl</tt> in the URL
    </p>
  ) : (
    <Crop imageUrl={imageUrl} />
  )}
</div>

);

CropPage.getInitialProps = (context) => {
  const imageUrl = context.query.imageUrl;

  return {
    imageUrl
  };
}

export default CropPage;
