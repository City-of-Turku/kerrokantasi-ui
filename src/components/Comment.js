import React from 'react';
import {injectIntl, FormattedMessage, FormattedRelative} from 'react-intl';
import Button from 'react-bootstrap/lib/Button';
import Icon from 'utils/Icon';
import {notifyError} from '../utils/notify';


class Comment extends React.Component {
  onVote() {
    if (this.props.canVote) {
      const {data} = this.props;
      this.props.onPostVote(data.id, data.section);
    } else {
      notifyError("Kirjaudu sisään äänestääksesi kommenttia.");
    }
  }

  render() {
    const {data} = this.props;
    const authorName = data.author_name || (data.created_by ? data.created_by.username : null);
    if (!data.content) {
      return null;
    }

    return (<div className="hearing-comment">
      <div className="hearing-comment-header clearfix">
        <div className="hearing-comment-votes">
          <Button className="btn-sm hearing-comment-vote-link" onClick={this.onVote.bind(this)}>
            <Icon name="thumbs-o-up"/> {data.n_votes}
          </Button>
        </div>
        <div className="hearing-comment-publisher">
          <span className="hearing-comment-user">{authorName || <FormattedMessage id="anonymous"/>}</span>
          <span className="hearing-comment-date"><FormattedRelative value={data.created_at}/></span>
        </div>
      </div>
      <div className="hearing-comment-body">
        <p>{data.content}</p>
      </div>
    </div>);
  }
}

Comment.propTypes = {
  data: React.PropTypes.object,
  canVote: React.PropTypes.bool,
  onPostVote: React.PropTypes.func,
};

export default injectIntl(Comment);
