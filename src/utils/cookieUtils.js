/* eslint-disable react/self-closing-comp */
import React from 'react';
// eslint-disable-next-line import/no-unresolved
import urls from '@city-assets/urls.json';

/**
 * Returns a <script> element with src urls.analytics
 * @returns {JSX.Element}
 */
export function getCookieScripts() {
  return (
    <script
      type="text/javascript"
      src={urls.analytics}
    >
    </script>
  );
}

export default {
  getCookieScripts
};
