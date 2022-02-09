/* eslint-disable react/self-closing-comp */
import config from '../config';
import React from 'react';

/**
 * Add event listener that overrides the image served by cookiebot.
 */
export function cookieBotAddListener() {
  if (config.enableCookies && config.enableCookiebot) {
    window.addEventListener('CookiebotOnDialogDisplay', cookieBotImageOverride);
  }
}

/**
 * Remove event listener that overrides the image served by cookiebot.
 */
export function cookieBotRemoveListener() {
  if (config.enableCookies && config.enableCookiebot) {
    window.removeEventListener('CookiebotOnDialogDisplay', cookieBotImageOverride);
  }
}

/**
 * Sets the cookiebot banner's header <img> src to empty string,
 * so the image specified by the style rules is shown instead.
 */
export function cookieBotImageOverride() {
  document.getElementById('CybotCookiebotDialogPoweredbyImage').src = '';
}

/**
 * Returns the Cookiebot <script> element
 * @returns {JSX.Element}
 */
export function getConsentScripts() {
  return (
    <script
      data-blockingmode={config.cookiebotDataBlockingmode}
      data-cbid={config.cookiebotDataCbid}
      id="Cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      type="text/javascript"
    >
    </script>
  );
}

export default {
  cookieBotAddListener,
  cookieBotRemoveListener,
  cookieBotImageOverride,
  getConsentScripts,
};
