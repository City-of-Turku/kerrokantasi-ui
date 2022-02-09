import React from 'react';
import {
  cookieBotAddListener,
  cookieBotRemoveListener,
  cookieBotImageOverride,
  getConsentScripts,
} from '../../src/utils/cookiebotUtils';
import config from '../../src/config';
import {shallow} from 'enzyme';

jest.mock('../../src/config', () => {
  return {
    enableCookies: true,
    enableCookiebot: true,
    cookiebotDataBlockingmode: 'auto',
    cookiebotDataCbid: '123-abc'
  };
});
describe('cookiebotUtils', () => {
  describe('cookieBotAddListener', () => {
    afterEach(() => {
      jest.clearAllMocks();
      config.enableCookies = true;
      config.enableCookiebot = true;
    });
    test('calls window.addEventListener with correct params if enableCookies and enableCookiebot is true', () => {
      window.addEventListener = jest.fn();
      cookieBotAddListener();
      expect(window.addEventListener).toHaveBeenCalledWith('CookiebotOnDialogDisplay', cookieBotImageOverride);
    });
    test('does not call window.addEventListener when enableCookies is false', () => {
      config.enableCookies = false;
      window.addEventListener = jest.fn();
      cookieBotAddListener();
      expect(window.addEventListener).not.toHaveBeenCalled();
    });
    test('does not call window.addEventListener when enableCookiebot is false', () => {
      config.enableCookiebot = false;
      window.addEventListener = jest.fn();
      cookieBotAddListener();
      expect(window.addEventListener).not.toHaveBeenCalled();
    });
  });
  describe('cookieBotRemoveListener', () => {
    afterEach(() => {
      jest.clearAllMocks();
      config.enableCookies = true;
    });
    test('calls window.removeEventListener with correct params if enableCookies and enableCookiebot is true', () => {
      window.removeEventListener = jest.fn();
      cookieBotRemoveListener();
      expect(window.removeEventListener).toHaveBeenCalledWith('CookiebotOnDialogDisplay', cookieBotImageOverride);
    });
    test('does not call window.removeEventListener when enableCookies is false', () => {
      config.enableCookies = false;
      window.removeEventListener = jest.fn();
      cookieBotRemoveListener();
      expect(window.removeEventListener).not.toHaveBeenCalled();
    });
    test('does not call window.removeEventListener when enableCookiebot is false', () => {
      config.enableCookiebot = false;
      window.removeEventListener = jest.fn();
      cookieBotRemoveListener();
      expect(window.removeEventListener).not.toHaveBeenCalled();
    });
  });
  describe('getConsentScripts', () => {
    test('returns the Cookiebot script element', () => {
      const element = getConsentScripts();
      const wrapper = shallow(<div>{element}</div>);
      expect(wrapper.find('script')).toHaveLength(1);
      expect(wrapper.find('script').prop('id')).toBe('Cookiebot');
      expect(wrapper.find('script').prop('data-blockingmode')).toBe(config.cookiebotDataBlockingmode);
      expect(wrapper.find('script').prop('data-cbid')).toBe(config.cookiebotDataCbid);
      expect(wrapper.find('script').prop('src')).toBe('https://consent.cookiebot.com/uc.js');
      expect(wrapper.find('script').prop('type')).toBe('text/javascript');
    });
  });
});
