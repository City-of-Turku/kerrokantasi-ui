import React from 'react';
import {shallow} from 'enzyme';
import {getIntlAsProp} from '../../test-utils';
import {UnconnectedHearingFormStep1} from '../../src/components/admin/HearingFormStep1';
import Select from 'react-select';
import HearingLanguages from '../../src/components/admin/HearingLanguages';
import MultiLanguageTextField from '../../src/components/forms/MultiLanguageTextField';

const defaultProps = {
  contactPersons: [],
  dispatch: jest.fn(),
  errors: {},
  hearing: {
    title: 'hearing title',
    labels: [],
    slug: 'hearingSlug',
    contact_persons: []
  },
  hearingLanguages: ['fi'],
  onContinue: jest.fn(),
  onHearingChange: jest.fn(),
  onLanguagesChange: jest.fn(),
  intl: getIntlAsProp(),
  labels: []
};

function createContactPerson(id = 0) {
  const rndNum = Math.floor(Math.random() * (99999 - 1000));
  return {
    id: `id-${id}-${rndNum}`,
    name: `First Last ${rndNum}`,
    phone: `012345${rndNum}`,
    email: `first.${rndNum}@domain.com`,
    organization: `testOrg ${rndNum}`,
    title: {
      fi: `first title ${rndNum}`
    }
  };
}

function createLabel(id = 0) {
  const rndNum = Math.floor(Math.random() * (99999 - 1000));
  return {id, label: `label ${id || rndNum}`};
}

describe('HearingFormStep1', () => {
  function getWrapper(props) {
    return shallow(<UnconnectedHearingFormStep1 {...defaultProps} {...props} />);
  }
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('lifecycle methods', () => {
    describe('mount', () => {
      test('initial state.selectedLabels is mapped from hearing.labels', () => {
        const mockLabels = [createLabel(1), createLabel(2)];
        const hearingWithLabels = Object.assign({}, defaultProps.hearing);
        hearingWithLabels.labels = mockLabels;
        const wrapper = getWrapper({hearing: hearingWithLabels});
        expect(wrapper.state('selectedLabels')).toEqual(mockLabels.map(label => label.id));
      });
      test('initial state.selectedContacts is mapped from hearing.contact_persons', () => {
        const mockContacts = [createContactPerson(), createContactPerson()];
        const hearingWithContacts = Object.assign({}, defaultProps.hearing);
        hearingWithContacts.contact_persons = mockContacts;
        const wrapper = getWrapper({hearing: hearingWithContacts});
        expect(wrapper.state('selectedContacts')).toEqual(mockContacts.map(label => label.id));
      });
    });
  });
  describe('methods', () => {
    describe('onChange', () => {
      test('calls props.onHearingChange with correct params', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        const mockEvent = {target: {name: 'nameValue', value: 'valueValue'}};
        instance.onChange(mockEvent);
        expect(defaultProps.onHearingChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onHearingChange)
          .toHaveBeenCalledWith(mockEvent.target.name, mockEvent.target.value);
      });
    });
    describe('onLabelsChange', () => {
      test('calls props.onHearingChange with correct params and updates state.selectedLabels', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        const mockSelectedLabels = [createLabel(1), createLabel(2)];
        const expectedValues = mockSelectedLabels.map(label => label.id);
        expect(wrapper.state('selectedLabels')).toEqual([]);
        instance.onLabelsChange(mockSelectedLabels);
        expect(wrapper.state('selectedLabels')).toEqual(expectedValues);
        expect(defaultProps.onHearingChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onHearingChange).toHaveBeenCalledWith('labels', expectedValues);
      });
    });
    describe('onContactsChange', () => {
      test('calls props.onHearingChange with correct params and updates state.selectedContacts', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        const mockSelectedContacts = [createContactPerson(), createContactPerson()];
        const expectedValues = mockSelectedContacts.map(label => label.id);
        expect(wrapper.state('selectedContacts')).toEqual([]);
        instance.onContactsChange(mockSelectedContacts);
        expect(wrapper.state('selectedContacts')).toEqual(expectedValues);
        expect(defaultProps.onHearingChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onHearingChange).toHaveBeenCalledWith('contact_persons', expectedValues);
      });
    });
    describe('openLabelModal', () => {
      test('state.showLabelModal is set to true', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        expect(wrapper.state('showLabelModal')).toBe(false);
        instance.openLabelModal();
        expect(wrapper.state('showLabelModal')).toBe(true);
      });
    });
    describe('closeLabelModal', () => {
      test('state.showLabelModal is set to false', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        wrapper.setState({showLabelModal: true});
        expect(wrapper.state('showLabelModal')).toBe(true);
        instance.closeLabelModal();
        expect(wrapper.state('showLabelModal')).toBe(false);
      });
    });
    describe('openContactModal', () => {
      test('updates state correctly when editing an existing contact', () => {
        const mockContacts = [createContactPerson(), createContactPerson()];
        const hearingWithContacts = Object.assign({}, defaultProps.hearing);
        hearingWithContacts.contact_persons = mockContacts;
        const wrapper = getWrapper({hearing: hearingWithContacts});
        const instance = wrapper.instance();
        const mockEvent = {preventDefault: jest.fn()};
        instance.openContactModal(mockContacts[1], mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(wrapper.state('contactInfo')).toEqual(mockContacts[1]);
        expect(wrapper.state('showContactModal')).toBe(true);
      });
      test('updates state correctly when creating a new contact', () => {
        const mockContacts = [createContactPerson(), createContactPerson()];
        const hearingWithContacts = Object.assign({}, defaultProps.hearing);
        hearingWithContacts.contact_persons = mockContacts;
        const wrapper = getWrapper({hearing: hearingWithContacts});
        const instance = wrapper.instance();
        const mockEvent = {preventDefault: jest.fn()};
        instance.openContactModal({}, mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(wrapper.state('contactInfo')).toEqual({});
        expect(wrapper.state('showContactModal')).toBe(true);
      });
    });
    describe('closeContactModal', () => {
      test('sets state.showContactModal to false', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        wrapper.setState({showContactModal: true});
        instance.closeContactModal();
        expect(wrapper.state('showContactModal')).toBe(false);
      });
    });
    describe('formatContacts', () => {
      test('returns the contacts array of objects that only have id, name and title keys', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        const initialContacts = [createContactPerson(1), createContactPerson(2), createContactPerson(3)];
        const expectedTitle = 'title string';
        const expectedValues = initialContacts.map((person) => ({
          id: person.id,
          name: person.name,
          title: expectedTitle
        }));
        const returnValues = instance.formatContacts(expectedTitle, initialContacts);
        expect(returnValues).toEqual(expectedValues);
      });
    });
  });
  describe('render', () => {
    describe('HearingLanguages', () => {
      test('is rendered with correct props', () => {
        const mockHearingLanguages = ['fi', 'sv', 'en'];
        const wrapper = getWrapper({hearingLanguages: mockHearingLanguages});
        const hearingLangComponent = wrapper.find(HearingLanguages);
        expect(hearingLangComponent.prop('hearingLanguages')).toEqual(mockHearingLanguages);
        expect(hearingLangComponent.prop('onChange')).toBe(defaultProps.onLanguagesChange);
      });
    });
    describe('MultiLanguageTextField', () => {
      test('is rendered with correct props', () => {
        const mockError = {title: 'this is an error'};
        const wrapper = getWrapper({errors: mockError});
        const multiLangComponent = wrapper.find(MultiLanguageTextField);
        expect(multiLangComponent.prop('error')).toEqual(mockError.title);
        expect(multiLangComponent.prop('languages')).toBe(defaultProps.hearingLanguages);
        expect(multiLangComponent.prop('value')).toEqual(defaultProps.hearing.title);
      });
    });
    describe('Select contacts', () => {
      let mockContacts;
      beforeEach(() => {
        mockContacts = [createContactPerson(), createContactPerson()];
      });
      test('options parameter values are correctly formatted', () => {
        const wrapper = getWrapper({contactPersons: mockContacts});
        const instance = wrapper.instance();
        const selectComponent = wrapper.find(Select).last();
        const message = defaultProps.intl.formatMessage({id: 'addContactPerson'});
        const formattedContacts = instance.formatContacts(message, mockContacts);
        /**
         * values should be formatted like this
         * @example
         * {id: contact.id,
         * name: contact.name,
         * title: id used when selecting a contact
         * }
         */
        expect(selectComponent.prop('options')).toEqual(formattedContacts);
      });
      test('value parameter values are correctly formatted', () => {
        const hearingWithContacts = Object.assign({}, defaultProps.hearing);
        hearingWithContacts.contact_persons = mockContacts;
        const wrapper = getWrapper({hearing: hearingWithContacts});
        const instance = wrapper.instance();
        const selectComponent = wrapper.find(Select).last();
        const message = defaultProps.intl.formatMessage({id: 'delete'});
        const formattedContacts = instance.formatContacts(message, mockContacts);
        /**
         * values should be formatted like this
         * @example
         * {id: contact.id,
         * name: contact.name,
         * title: id used when hovering over a selected contact
         * }
         */
        expect(selectComponent.prop('value')).toEqual(formattedContacts);
      });
    });
  });
});
