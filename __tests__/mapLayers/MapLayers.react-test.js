import React from 'react';
import { shallow } from 'enzyme';
import { LayersControl } from 'react-leaflet';

import MapLayers from '../../src/components/mapLayers/MapLayers';
import DefaultTileLayer from '../../src/components/mapLayers/DefaultTileLayer';
import config from '../../src/config';


const wmsBaseUrl = "https://test.map.fi";
const wmsAttribution = "<a href='https://test.map.fi/' rel='noreferrer' target='_blank' >test</a>";
const wmsLayers = [
  {layer_name: 'guide', name_fi: 'opas', name_en: 'guide', name_sv: 'guide'},
  {layer_name: 'air', name_fi: 'ilmakuva', name_en: 'air photo', name_sv: 'flygbild'},
];

jest.mock('../../src/config', () => {
  return {
    wmsBaseUrl,
    wmsAttribution,
    wmsLayers
  };
});

const defaultProps = {
  language: 'fi',
  isHighContrast: false,
};

describe('src/components/mapLayers/MapLayers.js', () => {
  function getWrapper(props) {
    return shallow(<MapLayers {...defaultProps} {...props} />);
  }

  describe('renders', () => {
    describe('when config wmsBaseUrl is not set', () => {
      beforeEach(() => {
        config.wmsBaseUrl = "";
        config.wmsAttribution = wmsAttribution;
        config.wmsLayers = wmsLayers;
      });


      test('DefaultTileLayer', () => {
        const layer = getWrapper().find(DefaultTileLayer);
        expect(layer).toHaveLength(1);
        expect(layer.prop('language')).toBe(defaultProps.language);
        expect(layer.prop('isHighContrast')).toBe(defaultProps.isHighContrast);
      });
      test('LayersControl', () => {
        const control = getWrapper().find(LayersControl);
        expect(control).toHaveLength(0);
      });
    });

    describe('when config wmsLayers are not set', () => {
      beforeEach(() => {
        config.wmsBaseUrl = wmsBaseUrl;
        config.wmsAttribution = wmsAttribution;
        config.wmsLayers = [];
      });

      test('DefaultTileLayer', () => {
        const layer = getWrapper().find(DefaultTileLayer);
        expect(layer).toHaveLength(1);
        expect(layer.prop('language')).toBe(defaultProps.language);
        expect(layer.prop('isHighContrast')).toBe(defaultProps.isHighContrast);
      });
      test('LayersControl', () => {
        const control = getWrapper().find(LayersControl);
        expect(control).toHaveLength(0);
      });
    });

    describe('when config wmsBaseUrl and wmsLayers are set', () => {
      beforeEach(() => {
        config.wmsBaseUrl = wmsBaseUrl;
        config.wmsAttribution = wmsAttribution;
        config.wmsLayers = wmsLayers;
      });

      test('LayersControl', () => {
        const control = getWrapper().find(LayersControl);
        expect(control).toHaveLength(1);
      });
      test('LayersControl.BaseLayer', () => {
        const baseLayers = getWrapper().find(LayersControl.BaseLayer);
        expect(baseLayers).toHaveLength(config.wmsLayers.length + 1);
        const defaultBase = baseLayers.at(0);
        expect(defaultBase.prop('checked')).toBe(true);
        expect(defaultBase.prop('name')).toBe('OpenStreetMap');
      });
      test('DefaultTileLayer', () => {
        const defaultTileLayer = getWrapper().find(DefaultTileLayer);
        expect(defaultTileLayer).toHaveLength(1);
        expect(defaultTileLayer.prop('language')).toBe(defaultProps.language);
        expect(defaultTileLayer.prop('isHighContrast')).toBe(defaultProps.isHighContrast);
      });
    });
  });
});
