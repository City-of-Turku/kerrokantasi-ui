import React from 'react';
import { shallow } from 'enzyme';


import CommentFormMap from '../src/components/CommentFormMap/CommentFormMap';
import { BaseCommentForm } from '../src/components/BaseCommentForm';
import { getIntlAsProp } from '../test-utils';


const defaultProps = {
  canComment: true,
  onPostComment: () => {},
  onOverrideCollapse: () => {},
  collapseForm: false,
  defaultNickname: 'test tester',
  overrideCollapse: false,
  nicknamePlaceholder: 'test anon',
  section: {commenting_map_tools: 'all', commenting: 'open', questions: []},
  language: 'fi',
  onChangeAnswers: () => {},
  answers: [],
  loggedIn: false,
  closed: false,
  user: null,
  isReply: false,
  isHighContrast: false,
  hearingGeojson: {},
};

describe('src/components/BaseCommentForm.js', () => {
  function getWrapper(props) {
    return shallow(<BaseCommentForm intl={getIntlAsProp()} {...defaultProps} {...props} />);
  }

  describe('renders', () => {
    describe('when form is not collapsed', () => {
      const wrapper = getWrapper();
      const instance = wrapper.instance();
      instance.setState({collapsed: false});

      test('CommentFormMap', () => {
        const commentFormMap = wrapper.find(CommentFormMap);
        expect(commentFormMap).toHaveLength(1);
        expect(commentFormMap.prop('center')).toEqual(instance.getMapCenter());
        expect(commentFormMap.prop('mapBounds')).toBe(null);
        expect(commentFormMap.prop('onDrawCreate')).toBe(instance.onDrawCreate);
        expect(commentFormMap.prop('onDrawDelete')).toBe(instance.onDrawDelete);
        expect(commentFormMap.prop('contents')).toEqual(instance.getMapBorder());
        expect(commentFormMap.prop('tools')).toBe(defaultProps.section.commenting_map_tools);
        expect(commentFormMap.prop('language')).toBe(defaultProps.language);
        expect(commentFormMap.prop('isHighContrast')).toBe(defaultProps.isHighContrast);
      });
    });
  });
});
