import React from 'react';
import {
  getCookieScripts
} from '../../src/utils/cookieUtils';
import {shallow} from 'enzyme';
// eslint-disable-next-line import/no-unresolved
import urls from '@city-assets/urls.json';

jest.mock('../../src/config', () => {
  return {
    enableCookies: true
  };
});
describe('cookieUtils', () => {
  describe('getCookieScripts', () => {
    test('returns a script element', () => {
      const element = getCookieScripts();
      const wrapper = shallow(<div>{element}</div>);
      expect(wrapper.find('script')).toHaveLength(1);
      expect(wrapper.find('script').prop('src')).toEqual(urls.analytics);
      expect(wrapper.find('script').prop('type')).toEqual('text/javascript');
    });
  });
});
