import React from 'react';
import {shallow} from 'enzyme';

import {getIntlAsProp} from '../../test-utils';
import {UnconnectedHearingFormStep4} from '../../src/components/admin/HearingFormStep4';
import HearingAuthMethods from '../../src/components/admin/HearingAuthMethods';
import config from '../../src/config';


const defaultProps = {
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
  onSectionChange: jest.fn(),
  formatMessage: (id) => id,
  intl: getIntlAsProp(),
};

describe('HearingFormStep4', () => {
  function getWrapper(props) {
    return shallow(<UnconnectedHearingFormStep4 {...defaultProps} {...props} />);
  }

  describe('renders', () => {
    describe('HearingAuthMethods', () => {
      test('when state authMethods has 1 or more auth methods', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        instance.setState({authMethods: [{id: 1, name: 'lib card', amr: 'lib_card'}]});
        const hearingAuthMethods = wrapper.find(HearingAuthMethods);
        expect(hearingAuthMethods).toHaveLength(1);
        expect(hearingAuthMethods.prop('authMethodOptions')).toBe(instance.state.authMethods);
        expect(hearingAuthMethods.prop('hearingAuthMethods')).toEqual([]);
        expect(hearingAuthMethods.prop('onChange')).toBe(instance.onChangeAuthMethods);
      });

      test('when state authMethods has 0 auth methods', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        instance.setState({authMethods: []});
        const hearingAuthMethods = wrapper.find(HearingAuthMethods);
        expect(hearingAuthMethods).toHaveLength(0);
      });
    });
  });

  describe('methods', () => {
    describe('componentDidMount', () => {
      const data = [
        { id: 1, name: 'Library card', amr: 'lib_card' },
        { id: 2, name: 'Test auth', amr: 'test_amr' },
      ];

      beforeAll(() => {
        global.fetch = jest.fn(() => Promise.resolve({
          ok: true,
          data: () => Promise.resolve(data),
          json: () => Promise.resolve(data),
        }));
      });

      afterAll(() => {
        fetch.mockClear();
      });

      test('fetches auth data', async () => {
        await getWrapper().instance();
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(`${config.apiBaseUrl}/v1/auth_method/`);
      });
    });

    describe('onChangeAuthMethods', () => {
      test('calls props onHearingChange', () => {
        const instance = getWrapper().instance();
        const authMethods = [{id: 1, name: 'lib card', amr: 'lib_card'}];
        instance.onChangeAuthMethods(authMethods);
        expect(defaultProps.onHearingChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onHearingChange).toHaveBeenCalledWith('visible_for_auth_methods', authMethods);
      });
    });
  });
});
