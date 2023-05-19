import React from 'react';
import { shallow } from 'enzyme';
import { TileLayer } from 'react-leaflet';

// eslint-disable-next-line import/no-unresolved
import urls from '@city-assets/urls.json';
import DefaultTileLayer from '../../src/components/mapLayers/DefaultTileLayer';
import { getCorrectContrastMapTileUrl } from '../../src/utils/map';


const defaultProps = {
  language: 'fi',
  isHighContrast: false,
};

describe('src/components/mapLayers/DefaultTileLayer.js', () => {
  function getWrapper(props) {
    return shallow(<DefaultTileLayer {...defaultProps} {...props} />);
  }
  describe('renders', () => {
    describe('TileLayer', () => {
      test('with correct props', () => {
        const tileLayer = getWrapper().find(TileLayer);
        expect(tileLayer).toHaveLength(1);
        expect(tileLayer.prop('url')).toBe(
          getCorrectContrastMapTileUrl(urls.rasterMapTiles,
            urls.highContrastRasterMapTiles, defaultProps.isHighContrast, defaultProps.language)
        );
        expect(tileLayer.prop('attribution')).toBe(
          `&copy; <a href="http://osm.org/copyright" rel="noreferrer" target="_blank">OpenStreetMap</a> contributors`
        );
      });
    });
  });
});
