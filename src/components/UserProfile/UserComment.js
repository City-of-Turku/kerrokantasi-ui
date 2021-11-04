import React from 'react';
import PropTypes from 'prop-types';
import {Button, OverlayTrigger, Tooltip, Label} from 'react-bootstrap';
import nl2br from 'react-nl2br';
import moment from 'moment';
import Icon from '../../utils/Icon';
import {FormattedMessage, FormattedRelative} from 'react-intl';
import Link from '../LinkWithLang';
import HearingMap from '../Hearing/HearingMap';


class UserComment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMap: false,
      mapContainer: null,
    };
  }

  /**
   * Returns a formatted timestamp
   * @param {string} timestamp
   * @example "2021-06-12T22:37:00Z" returned as "12.06.2021 22:37"
   * @returns {string}
   */
  parseTimestamp = timestamp => (
    moment(timestamp).format('DD.MM.YYYY hh:mm')
  );
  /**
   * Returns a Tooltip component with timestamp from date.
   * @param {string} date
   * @returns {JSX.Element}
   */
  dateTooltip = date => {
    return (
      <Tooltip id="comment-date-tooltip">
        {this.parseTimestamp(date)}
      </Tooltip>
    );
  }
  /**
   * Toggles state.displayMap value
   */
  toggleMap = () => {
    this.setState({displayMap: !this.state.displayMap});
  }
  render() {
    const {comment} = this.props;
    const {hearing_data: data} = comment;
    const labelConf = {
      style: data.closed ? 'danger' : 'success',
      id: data.closed ? 'closedHearing' : 'openHearing'
    };
    return (
      <div className="hearing-comment">
        <div className="hearing-comment__comment-wrapper">
          <div className="hearing-comment-header">
            <div className="hearing-comment-publisher">
              <span className="hearing-comment-user">
                <Icon name="user" aria-hidden="true" />
                {comment.author_name}
              </span>
              <OverlayTrigger placement="top" overlay={this.dateTooltip(comment.created_at)} delayShow={300}>
                <span className="hearing-comment-date">
                  <FormattedRelative value={comment.created_at} />
                </span>
              </OverlayTrigger>
            </div>
            <div className="hearing-comment-status">
              <Label
                bsStyle={labelConf.style}
              >
                <FormattedMessage id={labelConf.id}>{txt => txt}</FormattedMessage>
              </Label>
              <Link to={{path: `/${data.slug}`}}>
                {data.slug}
              </Link>
            </div>
          </div>
          <div className="hearing-comment-body">
            <p>{nl2br(comment.content)}</p>
          </div>
          {comment.geojson && (
            <div className="hearing-comment__map">
              <React.Fragment>
                <Button
                  onClick={this.toggleMap}
                  className="hearing-comment__map-toggle"
                  aria-expanded={this.state.displayMap}
                >
                  <FormattedMessage id="commentShowMap">{text => text}</FormattedMessage>
                </Button>
              </React.Fragment>
              {(this.state.displayMap && comment.geojson) && (
                <div
                  className="hearing-comment__map-container"
                  ref={this.handleSetMapContainer}
                >
                  {comment.geojson && (
                    <HearingMap
                      hearing={{geojson: comment.geojson}}
                      mapContainer={this.state.mapContainer}
                      mapSettings={{dragging: false}}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

UserComment.propTypes = {
  comment: PropTypes.object,
};

export default UserComment;
