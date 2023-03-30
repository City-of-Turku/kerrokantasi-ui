import React from "react";
import { TileLayer } from "react-leaflet";
import PropTypes from 'prop-types';

import { getCorrectContrastMapTileUrl } from "../../utils/map";
// eslint-disable-next-line import/no-unresolved
import urls from '@city-assets/urls.json';


function DefaultTileLayer({isHighContrast, language}) {
  return (
    <TileLayer
      url={getCorrectContrastMapTileUrl(urls.rasterMapTiles,
        urls.highContrastRasterMapTiles, isHighContrast, language)}
      attribution={
        `&copy; <a href="http://osm.org/copyright" rel="noreferrer" target="_blank">OpenStreetMap</a> contributors`
      }
    />
  );
}

DefaultTileLayer.propTypes = {
  language: PropTypes.string.isRequired,
  isHighContrast: PropTypes.bool.isRequired,
};

export default DefaultTileLayer;
