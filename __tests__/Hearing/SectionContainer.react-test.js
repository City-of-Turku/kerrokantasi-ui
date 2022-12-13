import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import {SectionContainerComponent} from '../../src/components/Hearing/Section/SectionContainer';
import {MemoryRouter} from 'react-router-dom';
import {mockStore, getIntlAsProp, mockComment} from '../../test-utils';
import {
  getHearingWithSlug,
  getSections,
  getMainSectionComments,
  getHearingContacts,
} from '../../src/selectors/hearing';
import HearingMap from '../../src/components/Hearing/HearingMap';

// Renders the Hearings component using enzymes shallow rendering.
// You can pass props you want to override as a parameter.
const setup = propOverrides => {
  const {labels, sectionComments, hearingLists: {allHearings}, mockHearingWithSections, user} = mockStore;
  const props = Object.assign({
    labels: labels.data,
    hearing: mockHearingWithSections.data,
    hearingDraft: {},
    match: {
      params: {
        hearingSlug: allHearings.data[0].slug
      }
    },
    location: {
      pathname: '/' + allHearings.data[0].slug
    },
    sectionComments,
    showClosureInfo: true,
    sections: mockHearingWithSections.data.sections,
    language: 'fi',
    contacts: mockHearingWithSections.data.contacts,
    user
  }, propOverrides);

  const wrapper = shallow(<MemoryRouter><SectionContainerComponent intl={getIntlAsProp()} {...props} /></MemoryRouter>);

  return {
    props,
    wrapper
  };
};
const mockState = mockStore;
const mockSectionComments = mockState.sectionComments;

const defaultProps = {
  hearing: getHearingWithSlug(mockState, 'exampleHearing'),
  sections: getSections(mockState, 'exampleHearing'),
  sectionComments: mockSectionComments,
  mainSectionComments: getMainSectionComments(mockState, 'exampleHearing'),
  language: 'fi',
  contacts: getHearingContacts(mockState, 'exampleHearing'),
  user: mockStore.user,
  match: {
    params: {
      sectionId: mockState.hearing.exampleHearing.data.sections[0].id,
    }
  }
};
test('SectionContainer component should render as expected', () => {
  const {wrapper} = setup();
  const tree = toJson(wrapper.dive().dive());
  expect(tree).toMatchSnapshot();
});

describe('SectionContainer', () => {
  function getWrapper(props) {
    return shallow(<SectionContainerComponent intl={getIntlAsProp()} {...defaultProps} {...props} />);
  }
  describe('methods', () => {
    describe('toggleDisplayCommentResults', () => {
      test('toggles state.displayCommentResults boolean value', () => {
        const hearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        hearing.closed = true;
        const wrapper = getWrapper({hearing});
        const instance = wrapper.instance();
        expect(wrapper.state('displayCommentResults')).toBe(false);
        instance.toggleDisplayCommentResults();
        expect(wrapper.state('displayCommentResults')).toBe(true);
        instance.toggleDisplayCommentResults();
        expect(wrapper.state('displayCommentResults')).toBe(false);
      });
    });
    describe('renderCommentMapResults', () => {
      test('passes comments that arent deleted and have geojson to HearingMap as hearings prop', () => {
        const hearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        hearing.closed = true;

        const mockComments = Object.assign({}, mockState.sectionComments);
        // contains 1 comment with geojson by default, so we clear it before adding new comments
        mockComments[hearing.sections[0].id].results = [];
        // only comments that have geojson and are NOT deleted are passed to HearingMap
        const newComments = [
          mockComment({geojson: []}),
          mockComment({geojson: [], deleted: true}),
          mockComment(),
          mockComment(),
          mockComment({geojson: []}),
        ];
        newComments.forEach(comment => mockComments[hearing.sections[0].id].results.push(comment));

        const wrapper = getWrapper({hearing, sectionComments: mockComments});
        const mapElement = wrapper.find('div.map-results').find(HearingMap);
        expect(mapElement).toHaveLength(1);
        const hearingsProp = mapElement.prop('hearings');
        expect(hearingsProp).toHaveLength(2);
        // newComments content that should've been passed to HearingMap
        const commentsWithGeojson = newComments.filter(comment => comment.geojson && !comment.deleted);
        expect(commentsWithGeojson).toHaveLength(2);
        // every value in hearings array should exist in the newComments array.
        expect(hearingsProp.every(prop => commentsWithGeojson.find(comment => comment.id === prop.id))).toBe(true);
      });
      test('button onClick ultimately calls toggleDisplayCommentResults when all comments exist', () => {
        const hearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        hearing.closed = true;
        const wrapper = getWrapper({hearing});
        const instance = wrapper.instance();
        const spy = jest.spyOn(instance, 'toggleDisplayCommentResults');
        const mapToggleButton = wrapper.find('div.map-results').find('button');
        expect(mapToggleButton).toHaveLength(1);
        spy.mockReset();
        wrapper.find('button.hearing-map-results-toggle-button').simulate('click');
        expect(spy).toHaveBeenCalled();
      });
      test('button onClick calls fetchAllComments with correct params when some comments are missing', () => {
        // A hearing where comments for subsection A haven't been fetched at all and
        // not all comments for subsection B have been fetched.
        // fetchAllComments should be called twice, once for each section.

        const hearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        hearing.closed = true;
        const mockComments = Object.assign({}, mockState.sectionComments);
        // add comment to subsection A
        hearing.sections[1].n_comments = 1;
        // add 2 comments to subsection B
        hearing.sections[2].n_comments = 2;
        // delete fetched comments for subsection A
        delete mockComments[hearing.sections[1].id];
        const mockFetchAllComments = jest.fn();
        const wrapper = getWrapper({hearing, sectionComments: mockComments, fetchAllComments: mockFetchAllComments});
        mockFetchAllComments.mockReset();
        wrapper.find('button.hearing-map-results-toggle-button').simulate('click');
        expect(mockFetchAllComments).toHaveBeenCalledTimes(2);
        const firstCall = [hearing.slug, hearing.sections[1].id, '-created_at'];
        const secondCall = [hearing.slug, hearing.sections[2].id, '-created_at'];
        expect(mockFetchAllComments.mock.calls).toEqual([firstCall, secondCall]);
      });
    });
  });
  describe('render', () => {
    describe('map-results', () => {
      test('is rendered if hearing is closed and has geojson', () => {
        const closedHearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        closedHearing.closed = true;
        const wrapper = getWrapper({hearing: closedHearing});
        expect(wrapper.find('div.map-results')).toHaveLength(1);
      });
      test('is NOT rendered if hearing is NOT closed and has geojson', () => {
        const wrapper = getWrapper();
        expect(wrapper.find('div.map-results')).toHaveLength(0);
      });
      test('is rendered if hearing is closed but does NOT have geojson', () => {
        const closedHearing = Object.assign({}, getHearingWithSlug(mockState, 'exampleHearing'));
        closedHearing.closed = true;
        closedHearing.geojson = null;
        const wrapper = getWrapper({hearing: closedHearing});
        expect(wrapper.find('div.map-results')).toHaveLength(1);
      });
    });
  });
});
