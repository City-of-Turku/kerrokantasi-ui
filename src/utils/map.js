/* eslint-disable id-length */
import L, {LatLng} from 'leaflet';
import 'proj4'; // import required for side effect
import 'proj4leaflet'; // import required for side effect
import { Polygon, Marker, Polyline, GeoJSON } from 'react-leaflet';
import React from 'react';

export function EPSG3067() { // eslint-disable-line
  const crsName = 'EPSG:3067';
  const projDef = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const bounds = L.bounds(L.point(-548576, 6291456), L.point(1548576, 8388608));
  const originNw = [bounds.min.x, bounds.max.y];
  const crsOpts = {
    resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
    bounds,
    transformation: new L.Transformation(1, -originNw[0], -1, originNw[1])
  };
  return new L.Proj.CRS(crsName, projDef, crsOpts);
}

/**
 * Returns high contrast map tiles url if the url exists and if high contrast setting is on,
 * otherwise returns normal map tiles url.
 * @param {string} normalMapTilesUrl
 * @param {string} highContrastMapTilesUrl
 * @param {boolean} isHighContrastEnabled
 */
export function getCorrectContrastMapTileUrl(normalMapTilesUrl, highContrastMapTilesUrl, isHighContrastEnabled) {
  if (isHighContrastEnabled && highContrastMapTilesUrl) {
    return highContrastMapTilesUrl;
  }

  return normalMapTilesUrl;
}

export function getFeatureCollectionElement(feature, content, marker) {
  if (feature.geometry) {
    switch (feature.geometry.type) {
      case "Polygon": {
        const latLngs = feature.geometry.coordinates[0].map(([lng, lat]) => new LatLng(lat, lng));
        return (<Polygon key={Math.random()} positions={latLngs}>{content}</Polygon>);
      }
      case "Point": {
        const latLngs = new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        return (
          <Marker
            position={latLngs}
            key={Math.random()}
            icon={new L.Icon({
              iconUrl: marker.leafletMarkerIconUrl,
              shadowUrl: marker.leafletMarkerShadowUrl,
              iconRetinaUrl: marker.leafletMarkerRetinaIconUrl,
              iconSize: [25, 41],
              iconAnchor: [13, 41]
            })}
          >{content}
          </Marker>);
      }
      case "LineString": {
        const latLngs = feature.geometry.coordinates(([lng, lat]) => new LatLng(lat, lng));
        return (<Polyline key={Math.random()} positions={latLngs}>{content}</Polyline>);
      }
      default: {
        return (<GeoJSON data={feature} key={JSON.stringify(feature)}>{content}</GeoJSON>);
      }
    }
  }
}
