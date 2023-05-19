import React from "react";
import { LayersControl, WMSTileLayer } from "react-leaflet";

import config from "../../config";

export default function getWMSTileLayers(language) {
  return config.wmsLayers.map((layer) => (
    <LayersControl.BaseLayer
      name={layer[`name_${language}`]}
      key={layer[`name_${language}`].replace(/\s/g, '').toLowerCase()} // use changing key to handle language switching
    >
      <WMSTileLayer
        url={config.wmsBaseUrl}
        attribution={config.wmsAttribution}
        layers={layer.layer_name}
      />
    </LayersControl.BaseLayer>
  ));
}
