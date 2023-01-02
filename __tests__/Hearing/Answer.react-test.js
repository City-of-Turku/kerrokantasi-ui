import React from 'react';
import {shallow} from 'enzyme';
import { getIntlAsProp } from '../../test-utils';
import Answer from '../../src/components/Hearing/Comment/Answer';
import Icon from '../../src/utils/Icon';

describe('Answer', () => {
  const defaultProps = {
    answer: {
      answers: ['Two'],
      question: 'One or two?'
    }
  };

  function getWrapper(props) {
    return (shallow(<Answer intl={getIntlAsProp()} {...defaultProps} {...props} />));
  }

  describe('renders', () => {
    test('wrapping div', () => {
      const div = getWrapper().find('div.comment-question-answer-wrapper');
      expect(div).toHaveLength(1);
    });

    test('question text', () => {
      const paragraphs = getWrapper().find('p');
      expect(paragraphs).toHaveLength(2);
      const questionText = paragraphs.at(0).find('strong');
      expect(questionText).toHaveLength(1);
      expect(questionText.text()).toBe(defaultProps.answer.question);
    });

    test('answer icon span container', () => {
      const span = getWrapper().find('span.comment-question-answer-icon');
      expect(span).toHaveLength(1);
    });

    test('answer icon', () => {
      const icon = getWrapper().find(Icon);
      expect(icon).toHaveLength(1);
      expect(icon.prop('className')).toBe('icon');
      expect(icon.prop('name')).toBe('check');
    });

    test('answer text', () => {
      const text = getWrapper().find('p.comment-question-answer-text');
      expect(text).toHaveLength(1);
      expect(text.text()).toBe(defaultProps.answer.answers[0]);
    });
  });
});
