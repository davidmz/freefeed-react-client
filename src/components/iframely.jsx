import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import erd from 'element-resize-detector';

const detector = erd({strategy: 'scroll'});
const maxPreviewHeight = 550;
const foldedHeight = 400;
const expandBlockHeight = 27;

export default class Iframely  extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contentHeight: 0,
      expanded: false 
    };
  }

  componentDidMount() {
    detector.listenTo(this.refs.prv, _.debounce(el => this.onPreviewResize(el.offsetHeight), 500));
    window.iframely && iframely.load();
  }

  onPreviewResize(contentHeight) {
    if (this.refs.prv.firstElementChild.tagName == 'A') {
      contentHeight = 0;
    }
    this.setState({contentHeight});
  }

  isFoldingNeeded(state = this.state) {
    return state.contentHeight > maxPreviewHeight;
  }

  getContainerHeight(state = this.state) {
    return this.isFoldingNeeded(state) ? 
      (state.expanded ? state.contentHeight : foldedHeight ) + expandBlockHeight : 
      state.contentHeight; 
  }

  getHTML() {
    return {__html: `<a href="${this.props.url}" data-iframely-url></a>`};
  }

  toggle = () => {
    const expanded = !this.state.expanded;
    this.setState({expanded});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      setTimeout(() => window.iframely && iframely.load(), 0);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const newHeight = this.getContainerHeight(nextState);
    const currentHeight = this.getContainerHeight();

    if (newHeight == currentHeight) {
      return;
    }

    const node = this.refs.container,
      top = elemTop(node),
      halfScreen = Math.round(winHeight() / 2);    

    let scrollBy = 0;

    if (document.body.scrollTop > halfScreen / 2) { // near the top of screen
      if (top > halfScreen) {
        // nope
      } else if (top + currentHeight < halfScreen) {
        scrollBy = newHeight - currentHeight;
      } else {
        scrollBy = Math.round(newHeight * (halfScreen - top) / currentHeight);
      }
    }

    if (scrollBy !== 0) {
      document.body.scrollTop += scrollBy;
    }
  }

  render() {
    const knownLinkType = this.knownLinkType(this.props.url);
    if (knownLinkType === 'freefeed') {
      return false;
    }

    const classNames = {
      'link-preview': true,
      'show-all': !this.isFoldingNeeded(),
      'expanded': this.state.expanded,
      [knownLinkType]: true,
    };

    return (
      <div ref="container" className="link-preview-container" style={{height: this.getContainerHeight() + 'px'}}>
        <div className={classnames(classNames)}>
          <div ref="prv" className="link-preview-inner" dangerouslySetInnerHTML={this.getHTML()} />
        </div>
        {!this.isFoldingNeeded() ? false : (
          <div className="link-preview-expand">
            {this.state.expanded ? 
              <i className="fa fa-minus-square-o"></i> : 
              <i className="fa fa-plus-square-o"></i>
            }
            {' '}
            <a onClick={this.toggle}>{this.state.expanded ? 'Fold' : 'Expand'} preview</a>
          </div>
        )}
      </div>
    );
  }

  knownLinkType = (url) => {
    const types = [
      {
        type: 'google-docs',
        re: [
          /^https:\/\/(?:docs|drive)\.google\.com\/(forms|document|presentation|spreadsheets|file)\/d\//i
        ]
      },
      {
        type: 'youtube',
        re: [
          /^https?:\/\/(?:www\.)?youtube\.com\/(?:tv#\/)?watch\/?\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/youtu.be\/([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/m\.youtube\.com\/#\/watch\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/www\.youtube\.com\/user\/[a-zA-Z0-9_-]+\/?\?v=([a-zA-Z0-9_-]+)/i,
          /^https?:\/\/www\.youtube-nocookie\.com\/v\/([a-zA-Z0-9_-]+)/i          
        ]
      },
      {
        type: 'vimeo',
        re: [
          /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/i
        ]
      }
    ];

    for (let i = 0; i < types.length; i++) {
      const {type, re} = types[i];
      if (re.some(r => r.test(url))) {
        return type;
      }
    }

    return '';
  }
}

function winHeight() {
  return (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
}

function elemTop(el) {
  return Math.round(el.getBoundingClientRect().top);
}
