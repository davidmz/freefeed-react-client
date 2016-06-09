import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import erd from 'element-resize-detector';

const detector = erd({strategy: 'scroll'});
const maxPreviewHeight = 550;

export default class Iframely  extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showAll: false, 
      expanded: false 
    };
  }

  componentDidMount() {
    detector.listenTo(this.refs.prv, _.debounce(el => this.onPreviewResize(el.offsetHeight), 100));
    window.iframely && iframely.load();
  }

  onPreviewResize(height) {
    const showAll = height <= maxPreviewHeight;
    this.setState({showAll});
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

  render() {
    const classNames = {
      'link-preview': true,
      'show-all': this.state.showAll,
      'expanded': this.state.expanded,
    };

    const knownLinkType = this.knownLinkType(this.props.url);
    if (knownLinkType !== null) {
      classNames[knownLinkType] = true;
    }

    return (
      <div className="link-preview-container">
        <div ref="wrapper" className={classnames(classNames)}>
          <div ref="prv" className="link-preview-inner" dangerouslySetInnerHTML={this.getHTML()} />
        </div>
        {this.state.showAll ? false : (
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
          /https:\/\/(?:docs|drive)\.google\.com\/(forms|document|presentation|spreadsheets|file)\/d\//i
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

    return null;
  }

}