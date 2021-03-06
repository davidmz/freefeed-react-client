/* global embedly */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { darkTheme } from '../select-utils';
import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';

class EmbedlyPreview extends React.Component {
  static propTypes = { url: PropTypes.string.isRequired };

  link = null;
  state = { updCounter: 0 };

  setLink = (el) => (this.link = el);

  componentDidMount() {
    embedly('card', this.link);
  }

  componentDidUpdate() {
    embedly('card', this.link);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.feedIsLoading && !nextProps.feedIsLoading) {
      this.setState({ updCounter: this.state.updCounter + 1 });
    }
  }

  render() {
    // We use 'key' to force re-render HTML-code on
    // the feed update or on the props.url change
    return (
      <div
        key={`${this.props.url}##${this.state.updCounter}`}
        className="embedly-preview link-preview-content"
        data-url={this.props.url}
        style={{ height: `${heightCache.get(this.props.url, 0)}px` }}
      >
        <a
          ref={this.setLink}
          href={this.props.url}
          data-card-controls="0"
          data-card-width="400px"
          data-card-recommend="0"
          data-card-align="left"
          data-card-theme={this.props.darkTheme ? 'dark' : 'light'}
        />
      </div>
    );
  }
}

function select(state) {
  return {
    feedIsLoading: state.routeLoadingState,
    darkTheme: darkTheme(state),
  };
}

export default ScrollSafe(connect(select)(EmbedlyPreview));

embedly('on', 'card.resize', (iframe) => {
  let cont = iframe.parentNode;
  while (cont && !cont.classList.contains('embedly-preview')) {
    cont = cont.parentNode;
  }
  if (!cont) {
    return;
  }
  const height = iframe.offsetHeight;
  cont.style.height = `${height}px`;
  heightCache.set(cont.dataset.url, height);
});
