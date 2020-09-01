import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import { parseIframeHtml } from './IframeUtils';


class IframeCopyPasteField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      htmlCopyPaste: '',
    };

    this.handleCopyPasteChange = this.handleCopyPasteChange.bind(this);
  }

  handleCopyPasteChange(event) {
    const {value} = event.target;
    this.setState({htmlCopyPaste: value});
    const attributes = parseIframeHtml(value);
    this.props.updateAttributes(attributes);
  }

  render() {
    return (
      <div className="input-container html-copy-paste-input">
        <label htmlFor="iframe-html-copy-paste"><FormattedMessage id="iframeHtmlCopyPaste"/></label>
        <textarea
            id="iframe-html-copy-paste"
            name="htmlCopyPaste"
            className="form-control"
            onChange={this.handleCopyPasteChange}
            value={this.state.htmlCopyPaste}
        />
      </div>
    );
  }
}

IframeCopyPasteField.propTypes = {
  updateAttributes: PropTypes.func,
};

export default injectIntl(IframeCopyPasteField);
