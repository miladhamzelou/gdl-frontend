// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */

import React, { type Node } from 'react';
import styled from 'react-emotion';
import invariant from 'invariant';
import {
  alignItems,
  justifyContent,
  space,
  flexDirection,
  maxWidth,
  borders,
  width
} from 'styled-system';

type cssUnit = string | number;
type ResponsiveProp = cssUnit | [cssUnit, cssUnit];
type Props = {
  children: ?Node,
  className?: string,
  alignItems?: 'center',
  justifyContent?: 'space-between',
  flexDirection?: 'row' | 'column',
  width?: ResponsiveProp,
  maxWidth?: ResponsiveProp,
  m?: ResponsiveProp,
  mt?: ResponsiveProp,
  mb?: ResponsiveProp,
  ml?: ResponsiveProp,
  mr?: ResponsiveProp,
  mx?: ResponsiveProp,
  my?: ResponsiveProp,
  p?: ResponsiveProp,
  pt?: ResponsiveProp,
  pb?: ResponsiveProp,
  pl?: ResponsiveProp,
  pr?: ResponsiveProp,
  px?: ResponsiveProp,
  py?: ResponsiveProp,
  borderTop?: string,
  borderBottom?: string
};

const View = (props: Props) => {
  if (process.env.NODE_ENV !== 'production') {
    React.Children.toArray(props.children).forEach(item => {
      invariant(
        typeof item !== 'string',
        `Unexpected text node: ${item}. A text node cannot be a child of a <View>.`
      );
    });
  }

  return <StyledView {...props} />;
};

const StyledView = styled('div')`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  ${maxWidth};
  ${alignItems};
  ${justifyContent};
  ${space};
  ${flexDirection};
  ${borders};
  ${width};
`;

export { StyledView };
export default View;
