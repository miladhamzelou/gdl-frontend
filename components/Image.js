// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */
import * as React from 'react';
import styled from 'styled-components';
import { width } from 'styled-system';
import height from '../style/height';

// Base on gatbsy-image Kyle Mathews
// See https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/src/index.js

// Cache if we've seen an image before so we don't bother with lazy loading and fading on subsequent mounts
const imageCache = {};

// With side effect :-O
function inBrowserImageCache(props): boolean {
  if (imageCache[props.src]) {
    return true;
  }
  imageCache[props.src] = true;
  return false;
}

let io;

const listeners = [];
if (typeof window !== 'undefined' && window.IntersectionObserver) {
  io = new window.IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        listeners.forEach(([el, cb]) => {
          if (el === entry.target) {
            // Edge doesn't currently support isIntersecting, so also test for an intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io.unobserve(el);
              cb();
            }
          }
        });
      });
    },
    { rootMargin: '200px' },
  );
}

const listenToIntersections = (el, cb) => {
  io.observe(el);
  listeners.push([el, cb]);
};

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.5s;
`;

const ImageWrapper = styled('div')`
  overflow: hidden;
  ${width};
  ${height};
`;

type Props = {
  alt?: ?string,
  src: string,
  h?: Array<string | number>,
  w?: string,
};

type State = { isVisible: boolean, imgLoaded: boolean, IOSupported: boolean };

export default class Image extends React.Component<Props, State> {
  static defaultProps = {
    alt: '',
  };

  constructor(props: Props) {
    super(props);
    // If the browser doesn't support the IntersectionObserver API
    // we default to start loading the image right away
    let isVisible = true;
    let imgLoaded = true;
    let IOSupported = false;

    // If this image has already been loaded before then we can assume it's
    // already in the browser cache so it's cheap to just show directly.
    const seenBefore = inBrowserImageCache(props);

    if (
      !seenBefore &&
      typeof window !== 'undefined' &&
      window.IntersectionObserver
    ) {
      isVisible = false;
      imgLoaded = false;
      IOSupported = true;
    }

    // Always don't render image while server rendering
    if (typeof window === 'undefined') {
      isVisible = false;
      imgLoaded = false;
    }

    this.state = {
      isVisible,
      imgLoaded,
      IOSupported,
    };
  }

  handleRef = (ref: ?HTMLDivElement) => {
    if (this.state.IOSupported && ref) {
      listenToIntersections(ref, () => {
        this.setState({ isVisible: true, imgLoaded: false });
      });
    }
  };

  render() {
    const { src, alt, h, w } = this.props;
    return (
      <ImageWrapper h={h} w={w} innerRef={this.handleRef}>
        {this.state.isVisible && (
          <Img
            src={src}
            alt={alt}
            style={{
              opacity: this.state.imgLoaded ? 1 : 0,
            }}
            onLoad={() =>
              this.state.IOSupported && this.setState({ imgLoaded: true })
            }
          />
        )}
      </ImageWrapper>
    );
  }
}
