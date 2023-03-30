import React from 'react';
import { shallow } from 'enzyme';
import { LayersControl, WMSTileLayer } from 'react-leaflet';

import getWMSTileLayers from "../../src/components/mapLayers/getWMSTileLayers";
import config from '../../src/config';

jest.mock('../../src/config', () => {
  return {
    wmsBaseUrl: "https://test.map.fi",
    wmsAttribution: "<a href='https://test.map.fi/' rel='noreferrer' target='_blank' >test</a>",
    wmsLayers: [
      {layer_name: 'guide', name_fi: 'opas', name_en: 'guide', name_sv: 'guide'},
      {layer_name: 'air', name_fi: 'ilmakuva', name_en: 'air photo', name_sv: 'flygbild'},
    ]
  };
});


describe('src/components/mapLayers/getWMSTileLayers.js', () => {
  const language = 'fi';
  function getWrapper() {
    return shallow(<div>{getWMSTileLayers(language)}</div>);
  }
  describe('returns', () => {
    afterAll(() => {
      jest.clearAllMocks();
    });

    describe('LayersControl.BaseLayer', () => {
      test('correct amount and with correct props', () => {
        const baseLayers = getWrapper().find(LayersControl.BaseLayer);
        expect(baseLayers).toHaveLength(config.wmsLayers.length);
        baseLayers.forEach((baseLayer, index) => {
          expect(baseLayer.prop('name')).toBe(config.wmsLayers[index][`name_${language}`]);
        });
      });
    });

    describe('WMSTileLayer', () => {
      test('correct amount and with correct props', () => {
        const layers = getWrapper().find(WMSTileLayer);
        expect(layers).toHaveLength(config.wmsLayers.length);
        layers.forEach((layer, index) => {
          expect(layer.prop('url')).toBe(config.wmsBaseUrl);
          expect(layer.prop('attribution')).toBe(config.wmsAttribution);
          expect(layer.prop('layers')).toBe(config.wmsLayers[index].layer_name);
        });
      });
    });
  });
});
