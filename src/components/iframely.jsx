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
    const className = classnames({
      'link-preview': true,
      'show-all': this.state.showAll,
      'expanded': this.state.expanded,
    });

    return (
      <div className="link-preview-container">
        <div ref="wrapper" className={className}>
          <div ref="prv" dangerouslySetInnerHTML={this.getHTML()} />
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
}