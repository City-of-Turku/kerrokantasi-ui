import config from '../config';
/**
 * Add event listener that overrides the image served by cookiebot.
 */
export function cookieBotAddListener() {
  if (config.enableCookies) {
    window.addEventListener('CookiebotOnDialogDisplay', cookieBotImageOverride);
  }
}

/**
 * Remove event listener that overrides the image served by cookiebot.
 */
export function cookieBotRemoveListener() {
  if (config.enableCookies) {
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
