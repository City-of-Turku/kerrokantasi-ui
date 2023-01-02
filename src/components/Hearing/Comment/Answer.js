import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v1';

import Icon from '../../../utils/Icon';

/**
 * Class declaration for answer component.
 */
const Answer = ({ answer }) => {
  return (
    <div className="comment-question-answer-wrapper">
      <p><strong>{answer.question}</strong></p>
      {
        answer.answers.map((ans) => (
          <div key={uuid()}>
            <span className="comment-question-answer-icon">
              <Icon className="icon" name="check" />
            </span>
            <p className="comment-question-answer-text">{ans}</p>
          </div>
        ))
      }
    </div>
  );
};

Answer.propTypes = {
  answer: PropTypes.object
};

export default Answer;
