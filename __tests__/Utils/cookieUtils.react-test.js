import {cookieBotAddListener, cookieBotRemoveListener, cookieBotImageOverride} from '../../src/utils/cookieUtils';
import config from '../../src/config';

jest.mock('../../src/config', () => {
  return {
    enableCookies: true
  };
});
describe('cookieUtils', () => {
  describe('cookieBotAddListener', () => {
    afterEach(() => {
      jest.clearAllMocks();
      config.enableCookies = true;
    });
    test('calls window.addEventListener with correct params if enableCookies is true', () => {
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
  });
  describe('cookieBotRemoveListener', () => {
    afterEach(() => {
      jest.clearAllMocks();
      config.enableCookies = true;
    });
    test('calls window.removeEventListener with correct params if enableCookies is true', () => {
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
  });
});
