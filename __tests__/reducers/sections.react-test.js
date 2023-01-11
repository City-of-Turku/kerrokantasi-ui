import sections from '../../src/reducers/hearingEditor/sections';
import { EditorActions } from '../../src/actions/hearingEditor';
import { createStore } from 'redux';

const INITIAL_STATE = {
  all: ['abc'],
  byId: {
    abc: {
      title: {fi: 'first section'},
      images: [{url: 'urlofthepicture.foo', alt: ''}],
      files: [],
      questions: [
        {
          id: 29,
          independent_poll: false,
          options: [
            {
              id: 1,
              text: { en: 'first'}
            },
            {
              id: 2,
              text: { en: 'second'}
            },
          ],
          text: {
            en: 'Which of these?'
          },
          n_answers: 0,
          type: 'single-choice'
        },
        {
          id: 30,
          independent_poll: false,
          options: [
            {
              id: 11,
              text: { en: 'alpha'}
            },
            {
              id: 22,
              text: { en: 'beta'}
            },
            {
              id: 33,
              text: { en: 'gamma'}
            },
            {
              id: 44,
              text: { en: 'delta'}
            },
            {
              id: 55,
              text: { en: 'epsilon'}
            },
          ],
          text: {
            en: 'Select all applicable options?'
          },
          n_answers: 0,
          type: 'multiple-choice'
        }
      ]
    },
  }};

describe('sections', () => {
  /**
   * Calls store.dispatch(actionObj) and returns getState().byId[sectionId]
   * @param store
   * @param {string} sectionId
   * @param {object} actionObj
   * @returns {*}
   */
  function dispatcher(store, sectionId, actionObj = {}) {
    store.dispatch(actionObj);
    return store.getState().byId[sectionId];
  }
  describe('HEARING', () => {
    let store;
    const entities = {
      sections: {firstSectionId: {}, secondSectionId: {}}
    };
    beforeEach(() => {
      store = createStore(sections);
    });
    test('RECEIVE_HEARING', () => {
      store.dispatch({type: EditorActions.RECEIVE_HEARING, payload: {entities}});
      expect(store.getState().all).toEqual(Object.keys(entities.sections));
      expect(store.getState().byId).toEqual(entities.sections);
    });
    test('INIT_NEW_HEARING', () => {
      store.dispatch({type: EditorActions.INIT_NEW_HEARING, payload: {entities}});
      expect(store.getState().all).toEqual(Object.keys(entities.sections));
      expect(store.getState().byId).toEqual(entities.sections);
    });
    test('UPDATE_HEARING_AFTER_SAVE', () => {
      store.dispatch({type: EditorActions.UPDATE_HEARING_AFTER_SAVE, payload: {entities}});
      expect(store.getState().all).toEqual(Object.keys(entities.sections));
      expect(store.getState().byId).toEqual(entities.sections);
    });
  });

  describe('SECTION', () => {
    let store;

    beforeEach(() => {
      store = createStore(sections, INITIAL_STATE);
    });
    afterEach(() => {
      store = null;
    });
    test('EDIT_SECTION', () => {
      const sectionID = 'abc';
      const field = 'title';
      const value = {fi: 'modified title'};

      expect(store.getState().byId[sectionID][field]).toEqual(INITIAL_STATE.byId[sectionID][field]);
      const expectedValue = dispatcher(store, sectionID,
        {type: EditorActions.EDIT_SECTION, payload: {sectionID, field, value}})[field];
      expect(expectedValue).toEqual(value);
    });
    test('ADD_SECTION', () => {
      const section = {frontId: 'xyz'};
      const expectedKeys = [...INITIAL_STATE.all];

      expect(store.getState().all).toEqual(expectedKeys);
      expect(Object.keys(store.getState().byId)).toEqual(expectedKeys);
      store.dispatch({type: EditorActions.ADD_SECTION, payload: {section}});
      expectedKeys.push('xyz');
      expect(store.getState().all).toEqual(expectedKeys);
      expect(Object.keys(store.getState().byId)).toEqual(expectedKeys);
    });
    test('REMOVE_SECTION', () => {
      expect(store.getState().all).toEqual(INITIAL_STATE.all);
      const section = {frontId: 'addedSection'};
      const sectionID = section.frontId;
      store.dispatch({type: EditorActions.ADD_SECTION, payload: {section}});
      // should contain the original section + the added one
      expect(store.getState().all).toEqual([...INITIAL_STATE.all, section.frontId]);
      expect(Object.keys(store.getState().byId)).toEqual([...Object.keys(INITIAL_STATE.byId), section.frontId]);
      store.dispatch({type: EditorActions.REMOVE_SECTION, payload: {sectionID}});
      // should only contain the original section
      expect(Object.keys(store.getState().byId)).toEqual([...Object.keys(INITIAL_STATE.byId)]);
    });
    test('EDIT_SECTION_MAIN_IMAGE', () => {
      const sectionID = INITIAL_STATE.all[0];
      let field = 'alt';
      let value = 'alternative text';
      let expectedImages = store.getState().byId[sectionID].images;
      expect(expectedImages).toEqual(INITIAL_STATE.byId[sectionID].images);
      expectedImages = dispatcher(store, sectionID,
        {type: EditorActions.EDIT_SECTION_MAIN_IMAGE, payload: {sectionID, field, value}}).images[0];
      expect(expectedImages[field]).toEqual(value);
      field = 'image';
      value = 'url key should be empty string';
      expectedImages = dispatcher(store, sectionID,
        {type: EditorActions.EDIT_SECTION_MAIN_IMAGE, payload: {sectionID, field, value}}).images[0];
      expect(expectedImages[field]).toEqual(value);
      expect(expectedImages.url).toEqual('');
    });
  });
  describe('ATTACHMENT', () => {
    let store;
    const sectionId = INITIAL_STATE.all[0];

    beforeEach(() => {
      store = createStore(sections, INITIAL_STATE);
    });
    afterEach(() => {
      store = null;
    });

    test('ADD_ATTACHMENT', () => {
      const attachment = {id: 123};
      expect(store.getState().byId[sectionId].files).toEqual([]);
      const expectedFiles = dispatcher(store, sectionId,
        {type: EditorActions.ADD_ATTACHMENT, payload: {sectionId, attachment}}).files;
      expect(expectedFiles).toEqual([attachment]);
    });

    test('ORDER_ATTACHMENTS', () => {
      const FILES = [{id: 123, ordering: 5}, {id: 456, ordering: 1}, {id: 683, ordering: 3}];
      let attachment;
      let expectedFiles;
      FILES.forEach((file) => {
        attachment = file;
        expectedFiles = dispatcher(store, sectionId,
          {type: EditorActions.ADD_ATTACHMENT, payload: {sectionId, attachment}}).files;
      });
      const attachments = [];

      // files should be in the order they were added
      expect(expectedFiles).toEqual(FILES);
      // order files in descending order according to the ordering key
      expectedFiles = dispatcher(store, sectionId,
        {type: EditorActions.ORDER_ATTACHMENTS, payload: {sectionId, attachments}}).files;
      expect(expectedFiles).toEqual([FILES[1], FILES[2], FILES[0]]);
    });

    test('EDIT_SECTION_ATTACHMENT', () => {
      const FILES = [{id: 123, title: 'first'}, {id: 456, title: 'is this second?'}, {id: 683, title: 'third'}];
      let attachment;
      let expectedFiles;
      FILES.forEach((file) => {
        attachment = file;
        expectedFiles = dispatcher(store, sectionId,
          {type: EditorActions.ADD_ATTACHMENT, payload: {sectionId, attachment}}).files;
      });
      // second files title should be default
      expect(expectedFiles[1].title).toEqual('is this second?');
      attachment = {id: 456, title: 'this is correct'};
      // update the second files title
      expectedFiles = dispatcher(store, sectionId,
        {type: EditorActions.EDIT_SECTION_ATTACHMENT, payload: {sectionId, attachment}}).files;
      expect(expectedFiles[1].title).toEqual('this is correct');
    });

    test('DELETE_ATTACHMENT', () => {
      const FILES = [{id: 123, title: 'first'}, {id: 456, title: 'is this second?'}];
      let attachment;
      let expectedFiles;
      FILES.forEach((file) => {
        attachment = file;
        expectedFiles = dispatcher(store, sectionId,
          {type: EditorActions.ADD_ATTACHMENT, payload: {sectionId, attachment}}).files;
      });
      // should contain the added files
      expect(expectedFiles).toHaveLength(2);
      expect(expectedFiles).toEqual(FILES);
      attachment = {id: 123};
      expectedFiles = dispatcher(store, sectionId,
        {type: EditorActions.DELETE_ATTACHMENT, payload: {sectionId, attachment}}).files;
      // should only contain the second file that was added as the first one was deleted
      expect(expectedFiles).toHaveLength(1);
      expect(expectedFiles).toEqual([FILES[1]]);
    });
  });

  describe('QUESTIONS', () => {
    let store;
    let sectionId;
    let section;
    // questionCount is 2 by default
    let questionCount;

    beforeEach(() => {
      store = createStore(sections, INITIAL_STATE);
      sectionId = store.getState().all[0];
      section = store.getState().byId[sectionId];
      questionCount = section.questions.length;
    });
    test('INIT_SINGLECHOICE_QUESTION', () => {
      // questionCount is 2 by default
      expect(section.questions).toHaveLength(questionCount);
      // add a single choice question
      section = dispatcher(store, sectionId, {type: EditorActions.INIT_SINGLECHOICE_QUESTION, payload: {sectionId}});
      // amount of questions should be default + 1
      expect(section.questions).toHaveLength(questionCount + 1);
      // last question(the added one) should have single-choice type
      expect(section.questions.slice(-1)[0].type).toBe('single-choice');
    });
    test('INIT_MULTIPLECHOICE_QUESTION', () => {
      expect(section.questions).toHaveLength(questionCount);
      // add a multiple choice question
      section = dispatcher(store, sectionId, {type: EditorActions.INIT_MULTIPLECHOICE_QUESTION, payload: {sectionId}});
      // amount of questions should be default + 1
      expect(section.questions).toHaveLength(questionCount + 1);
      // last question(the added one) should have multiple-choice type
      expect(section.questions.slice(-1)[0].type).toBe('multiple-choice');
    });
    test('CLEAR_QUESTIONS', () => {
      expect(section.questions).toHaveLength(questionCount);
      section = dispatcher(store, sectionId, {type: EditorActions.CLEAR_QUESTIONS, payload: {sectionId}});
      expect(section.questions).toHaveLength(0);
    });
    test('DELETE_TEMP_QUESTION', () => {
      expect(section.questions).toHaveLength(questionCount);

      // add a single choice question, newly added questions have frontId key instead of the id key
      section = dispatcher(store, sectionId, {type: EditorActions.INIT_SINGLECHOICE_QUESTION, payload: {sectionId}});
      expect(section.questions).toHaveLength(questionCount + 1);
      const questionFrontId = section.questions[2].frontId;

      // delete the newly added question
      section = dispatcher(store, sectionId,
        {type: EditorActions.DELETE_TEMP_QUESTION, payload: {sectionId, questionFrontId}});
      expect(section.questions).toHaveLength(questionCount);
    });
    test('DELETE_EXISTING_QUESTION', () => {
      expect(section.questions).toHaveLength(questionCount);
      expect(section.questions).toEqual(INITIAL_STATE.byId[sectionId].questions);
      // questions that have been saved use/have the id key
      const questionId = section.questions[0].id;

      // delete the first question
      section = dispatcher(store, sectionId,
        {type: EditorActions.DELETE_EXISTING_QUESTION, payload: {sectionId, questionId}});
      expect(section.questions).toHaveLength(questionCount - 1);
      // only the second question should remain
      expect(section.questions).toEqual([INITIAL_STATE.byId[sectionId].questions[1]]);
    });
    test('EDIT_QUESTION', () => {
      let questionId = store.getState().byId[sectionId].questions[0].id; // id of the first question
      let fieldType = 'text'; // update the questions text
      let value = {en: 'WHICH IS IT?!'};
      let optionKey = 1; // key of the option that is updated

      // edit question text
      expect(section.questions[0].text)
        .toEqual(INITIAL_STATE.byId[sectionId].questions[0].text);
      section = dispatcher(store, sectionId,
        {type: EditorActions.EDIT_QUESTION, payload: {fieldType, sectionId, questionId, optionKey, value}});
      expect(section.questions[0].text).toEqual(value);

      // edit option text
      questionId = store.getState().byId[sectionId].questions[1].id; // id of the second question
      fieldType = 'option'; // update an options text
      value = {en: 'omega'};
      optionKey = 2; // updating the third value of the array
      section = store.getState().byId[sectionId];

      // expect option text to be initial state
      expect(section.questions[1].options[optionKey].text)
        .toEqual(INITIAL_STATE.byId[sectionId].questions[1].options[optionKey].text);
      section = dispatcher(store, sectionId,
        {type: EditorActions.EDIT_QUESTION, payload: {fieldType, sectionId, questionId, optionKey, value}});

      // expect option text to be value
      expect(section.questions[1].options[optionKey].text).toEqual(value);
    });
    test('ADD_OPTION', () => {
      const questionId = store.getState().byId[sectionId].questions[0].id;
      // add 2 options
      expect(section.questions[0].options).toHaveLength(questionCount);

      section = dispatcher(store, sectionId,
        {type: EditorActions.ADD_OPTION, payload: {sectionId, questionId}});
      expect(section.questions[0].options).toHaveLength(questionCount + 1);

      section = dispatcher(store, sectionId,
        {type: EditorActions.ADD_OPTION, payload: {sectionId, questionId}});
      expect(section.questions[0].options).toHaveLength(questionCount + 2);
    });
    test('DELETE_OPTION', () => {
      let question = store.getState().byId[sectionId].questions[1];
      const questionId = store.getState().byId[sectionId].questions[1].id;
      // the second question has 5 options by default.
      expect(question.options.length).toBe(5);

      // delete the third option in the options array using the optionKey as key.
      let optionKey = 33;
      let useOptionIndex = false;
      question = dispatcher(store, sectionId,
        {type: EditorActions.DELETE_OPTION, payload: {sectionId, questionId, optionKey, useOptionIndex}})
        .questions[1];
      expect(question.options.length).toBe(4);

      // add new option, newly added options don't have an id key.
      store.dispatch({type: EditorActions.ADD_OPTION, payload: {sectionId, questionId}});
      const fieldType = 'option';
      const value = {en: 'newly added value'};
      optionKey = 4;
      // add some text to the new option.
      question = dispatcher(store, sectionId,
        {type: EditorActions.EDIT_QUESTION, payload: {fieldType, sectionId, questionId, optionKey, value}})
        .questions[1];
      expect(question.options.length).toBe(5);

      // remove the newly added option, optionKey is now used as index instead of key.
      optionKey = 4;
      useOptionIndex = true;
      question = dispatcher(store, sectionId,
        {type: EditorActions.DELETE_OPTION, payload: {sectionId, questionId, optionKey, useOptionIndex}})
        .questions[1];
      expect(question.options.length).toBe(4);
    });
  });
});
