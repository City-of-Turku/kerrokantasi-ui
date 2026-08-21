import React from "react";
import { TileLayer } from "react-leaflet";
import PropTypes from 'prop-types';

import { getCorrectContrastMapTileUrl } from "../../utils/map";
import getMessage from "../../utils/getMessage";
// eslint-disable-next-line import/no-unresolved
import urls from '@city-assets/urls.json';


function DefaultTileLayer({isHighContrast, language}) {
  return (
    <TileLayer
      url={getCorrectContrastMapTileUrl(urls.rasterMapTiles,
        urls.highContrastRasterMapTiles, isHighContrast, language)}
      attribution={getMessage('mapAttribution', language)}
    />
  );
}

DefaultTileLayer.propTypes = {
  language: PropTypes.string.isRequired,
  isHighContrast: PropTypes.bool.isRequired,
};

export default DefaultTileLayer;
