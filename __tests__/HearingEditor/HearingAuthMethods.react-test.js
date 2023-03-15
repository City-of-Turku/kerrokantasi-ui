import React from 'react';
import { shallow } from 'enzyme';
import {getIntlAsProp} from '../../test-utils';
import { FormattedMessage } from 'react-intl';

import {UnconnectedHearingAuthMethods as HearingAuthMethods} from '../../src/components/admin/HearingAuthMethods';
import { HelpBlock } from 'react-bootstrap';

describe('HearingAuthMethods', () => {
  const defaultProps = {
    authMethodOptions: [
      {id: 1, name: "library card", amr: 'lib_card'},
      {id: 2, name: "test auth", amr: 'test_amr'},
    ],
    hearingAuthMethods: [],
    onChange: jest.fn(),
  };

  function getWrapper(props) {
    return shallow(<HearingAuthMethods intl={getIntlAsProp()} {...defaultProps} {...props}/>);
  }

  describe('renders', () => {
    test('wrapping fieldset', () => {
      const fieldset = getWrapper().find('.hearing-auth-methods');
      expect(fieldset).toHaveLength(1);
    });

    test('legend', () => {
      const legend = getWrapper().find('legend');
      expect(legend).toHaveLength(1);
      expect(legend.prop('aria-describedby')).toBe('auth-method-help-block');
      const text = legend.find(FormattedMessage);
      expect(text).toHaveLength(1);
      expect(text.prop('id')).toBe('hearingAuthMethodRestrictionsLabel');
    });

    test('div for input row', () => {
      const div = getWrapper().find('div.hearing-languages__row');
      expect(div).toHaveLength(1);
    });

    describe('auth method elements', () => {
      const authMethodWrappers = getWrapper().find('span.hearing-languages__language');

      test('wrapping span elements', () => {
        expect(authMethodWrappers).toHaveLength(defaultProps.authMethodOptions.length);
      });

      test('labels', () => {
        const labels = authMethodWrappers.find('label');
        expect(labels).toHaveLength(defaultProps.authMethodOptions.length);
        labels.forEach((label, index) => {
          expect(label.prop('htmlFor')).toBe('kkEditorAuthMethodSelector-' + defaultProps.authMethodOptions[index].id);
          expect(label.text()).toBe(defaultProps.authMethodOptions[index].name);
        });
      });

      test('inputs', () => {
        const inputs = authMethodWrappers.find('input');
        expect(inputs).toHaveLength(defaultProps.authMethodOptions.length);
        inputs.forEach((input, index) => {
          expect(input.prop('id')).toBe('kkEditorAuthMethodSelector-' + defaultProps.authMethodOptions[index].id);
          expect(input.prop('type')).toBe('checkbox');
          expect(input.prop('name')).toBe('authMethod');
          expect(input.prop('value')).toBe(defaultProps.authMethodOptions[index].id);
          expect(input.prop('onChange')).toBeDefined();
          expect(input.prop('checked')).toBe(false);
        });
      });

      test('help text', () => {
        const helpText = getWrapper().find(HelpBlock);
        expect(helpText).toHaveLength(1);
        expect(helpText.prop('id')).toBe('auth-method-help-block');
        const text = helpText.find(FormattedMessage);
        expect(text).toHaveLength(1);
        expect(text.prop('id')).toBe('hearingAuthMethodRestrictionsHelp');
      });
    });
  });
});
