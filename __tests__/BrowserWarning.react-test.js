import React from 'react';
import BrowserWarning from "../src/views/BrowserWarning";
import {shallow} from 'enzyme';

describe('src/views/BrowserWarning', () => {
  function getWrapper() {
    return shallow(<BrowserWarning />);
  }
  describe('contains', () => {
    test('correct amount of text containers, 1 for each language so 3 in total', () => {
      const element = getWrapper();
      const textContainers = element.find('.browser-warning-text-container');
      expect(element).toHaveLength(1);
      expect(textContainers).toHaveLength(3);
    });
    test('2 p elements per language', () => {
      const textContainers = getWrapper().find('.browser-warning-text-container');
      const finnishTexts = textContainers.at(0).find('p');
      const swedishTexts = textContainers.at(1).find('p');
      const englishTexts = textContainers.at(2).find('p');

      expect(finnishTexts).toHaveLength(2);
      expect(swedishTexts).toHaveLength(2);
      expect(englishTexts).toHaveLength(2);
    });
    test('3 links per language', () => {
      const textContainers = getWrapper().find('.browser-warning-text-container');
      const finnishLinks = textContainers.at(0).find('a');
      const swedishLinks = textContainers.at(1).find('a');
      const englishLinks = textContainers.at(2).find('a');

      expect(finnishLinks).toHaveLength(3);
      expect(swedishLinks).toHaveLength(3);
      expect(englishLinks).toHaveLength(3);
    });
  });

});
