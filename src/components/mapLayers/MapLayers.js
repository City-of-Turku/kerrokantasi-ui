import React from "react";
import { LayersControl } from "react-leaflet";
import PropTypes from 'prop-types';

import config from '../../config';
import DefaultTileLayer from "./DefaultTileLayer";
import getWMSTileLayers from "./getWMSTileLayers";

function MapLayers({isHighContrast, language}) {
  if (!config.wmsBaseUrl || config.wmsLayers.length < 1) {
    return <DefaultTileLayer language={language} isHighContrast={isHighContrast}/>;
  }

  return (
    <LayersControl>
      <LayersControl.BaseLayer
        checked
        name="OpenStreetMap"
        key={`osmKey${language}`} // use changing key to handle language switching
      >
        <DefaultTileLayer language={language} isHighContrast={isHighContrast}/>
      </LayersControl.BaseLayer>
      {getWMSTileLayers(language)}
    </LayersControl>
  );
}

MapLayers.propTypes = {
  language: PropTypes.string.isRequired,
  isHighContrast: PropTypes.bool.isRequired,
};

export default MapLayers;
