// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2018 GDL
 *
 * See LICENSE
 */
import React, { type Node } from 'react';
import MdCheck from 'react-icons/lib/md/check';
import MdKeyboardArrowRight from 'react-icons/lib/md/keyboard-arrow-right';
import { Trans } from '@lingui/react';
import { cx } from 'react-emotion';

import SrOnly from '../SrOnly';
import { Item, ItemIcon, itemActionStyle } from './styled/Content';

type Props = {|
  isSelected?: boolean,
  showKeyLine?: boolean,
  href?: string,
  onClick?: (
    event: SyntheticMouseEvent<any> | SyntheticKeyboardEvent<any>
  ) => void,
  onCustomClick?: (event: SyntheticMouseEvent<any>) => void,
  hasNestedMenu?: boolean,
  // Adds extra indent
  isNestedItem?: boolean,
  children: Node
|};

const ItemLink = Item.withComponent('a');

class MenuItem extends React.Component<Props> {
  /**
   * Small trick to handle Next.js swallowing up any onClicks on Link components
   * See https://github.com/zeit/next.js/issues/1490#issuecomment-290724312
   */
  handleClick = (event: SyntheticMouseEvent<any>) => {
    this.props.onClick && this.props.onClick(event);

    this.props.onCustomClick && this.props.onCustomClick(event);
  };

  handleKeyDown = (event: SyntheticKeyboardEvent<any>) => {
    if (event.key === 'Enter') {
      // If we don't preventDefault here. It bubbles up as both a keyboard event and a mousevent, causing handlers to be called twice.... ?
      event.preventDefault();
      this.props.onClick && this.props.onClick(event);
    }
  };

  render() {
    const {
      isSelected,
      hasNestedMenu,
      showKeyLine,
      children,
      onClick,
      isNestedItem,
      href
    } = this.props;
    const ItemComponent = href ? ItemLink : Item;

    return (
      <ItemComponent
        className={cx({ [itemActionStyle]: href || onClick })}
        onClick={this.handleClick}
        onKeyDown={!href && onClick ? this.handleKeyDown : null}
        href={href}
        showKeyLine={showKeyLine}
        isNestedItem={isNestedItem}
        tabIndex={href ? null : onClick ? '0' : null}
      >
        {isSelected && (
          <ItemIcon isSelected={isSelected}>
            <MdCheck aria-hidden />
            <SrOnly>
              <Trans>Selected:</Trans>
            </SrOnly>
          </ItemIcon>
        )}
        {children}
        {hasNestedMenu && (
          <ItemIcon aria-hidden style={{ right: '10px', left: 'unset' }}>
            <MdKeyboardArrowRight />
          </ItemIcon>
        )}
      </ItemComponent>
    );
  }
}

export default MenuItem;