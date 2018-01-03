// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */

import { css } from 'styled-components';
import type { TaggedTemplateLiteral } from 'styled-components';
import { TABLET_BREAKPOINT } from './theme';

/**
 * Mobile first media template
 *
 * (Also has a mobile only query)
 *
 */

// A function returning a function :)
const query = (condition: 'min' | 'max', width: number) => (
  ...args: TaggedTemplateLiteral
) => css`
  @media (${condition}-width: ${width}px) {
    ${css(...args)};
  }
`;

const media = {
  mobile: query('max', TABLET_BREAKPOINT - 1),
  tablet: query('min', TABLET_BREAKPOINT),
};

export default media;