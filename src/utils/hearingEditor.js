// @flow
import {normalize} from 'normalizr';
import uuid from 'uuid/v1';
import pickBy from 'lodash/pickBy';
import includes from 'lodash/includes';
import first from 'lodash/first';
import {assign, flowRight} from 'lodash';
import updeep from 'updeep';

import {hearingSchema} from '../types';

const ATTR_WITH_FRONT_ID = [
  'sections',
  'labels',
  'contact_persons',
];

export const fillFrontId = (
  obj: {frontId: ?string, id: ?string},
  idGenerator: () => string = uuid
) => (
  {
    ...obj,
    frontId: obj.frontId || obj.id || idGenerator(),
  }
);

export const fillFrontIds = (thingz: Array<Object>, idGenerator: () => string = uuid) =>
  thingz.map((thing) => fillFrontId(thing, idGenerator));

export const normalizeEntitiesByFrontId = (data: Object, entityKey: string, idGenerator: () => string = uuid) =>
  normalize({
    ...data,
    [entityKey]: fillFrontIds(data[entityKey], idGenerator),
  }, hearingSchema).entities[entityKey] || {};

export const normalizeHearing = (hearing: Object) =>
  normalize(hearing, hearingSchema);

export const fillFrontIdsForAttributes = (data: Object, attrKeys: Array<string> = ATTR_WITH_FRONT_ID) => ({
  ...data,
  ...attrKeys.reduce((filled, key) => ({
    ...filled,
    [key]: fillFrontIds(data[key]),
  }), {})
});

export const removeFrontId = (obj: Object) => {
  const result = {...obj};
  delete result.frontId;
  return result;
};

export const filterFrontIds = (thingz: Array<Object>) =>
  thingz.map(removeFrontId);

export const filterFrontIdFromPhases = (data: Object) => {
  const cleanedPhases = data.project.phases.map(phase => {
    if (phase.frontId) return removeFrontId(updeep({id: ''}, phase));
    return phase;
  });
  return updeep({
    project: {
      phases: cleanedPhases
    }
  }, data);
};

export const filterFrontIdsFromAttributes = (data: Object, attrKeys: Array<string> = ATTR_WITH_FRONT_ID) => {
  let filteredPhasesData = data;
  if (data.project && data.project.phases) {
    filteredPhasesData = filterFrontIdFromPhases(data);
  }
  return ({
    ...filteredPhasesData,
    ...attrKeys.reduce((filtered, key) => ({
      ...filtered,
      [key]: filterFrontIds(filteredPhasesData[key]),
    }), {})
  });
};

const filterObjectByLanguages = (object, languages) => pickBy(object, (value, key) => includes(languages, key));

const filterSectionsContentByLanguages = (sections, languages) => {
  return sections.map((section) => assign(
    section,
    {
      abstract: filterObjectByLanguages(section.abstract, languages),
      content: filterObjectByLanguages(section.content, languages),
      images: section.images.map((image) => assign(image, filterObjectByLanguages(image.abstract))),
      title: filterObjectByLanguages(section.title, languages)
    }
  ));
};

export const filterTitleAndContentByLanguage = (data, languages) => assign(
  data,
  {
    abstract: filterObjectByLanguages(data.title, languages),
    main_image: data.main_image
      ? assign(data.main_image, filterObjectByLanguages(data.main_image.caption, languages))
      : null,
    title: filterObjectByLanguages(data.title, languages),
    sections: filterSectionsContentByLanguages(data.sections, languages)
  }
);

export const fillFrontIdsAndNormalizeHearing = flowRight([normalizeHearing, fillFrontIdsForAttributes]);

export const getDocumentOrigin = () => (
  `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/`
);

export const moveSubsectionInArray = (array, index, delta) => {
  const newArray = array.slice();
  const newIndex = index + delta;
  if (newIndex < 1 || newIndex === array.length || newIndex === index) {
    return newArray;
  } // Already at the top or bottom, or delta was zero
  const indexes = index < newIndex ? [index, newIndex] : [newIndex, index]; // sort indices by integer value!!!
  newArray.splice(indexes[0], 2, newArray[indexes[1]], newArray[indexes[0]]);
  // Replace from lowest index, two elements, reverting the order
  return newArray;
};

export const initNewPhase = () => {
  return {
    frontId: uuid(),
    has_hearings: false,
    hearings: [],
    is_active: false,
    title: {},
    description: {},
    schedule: {}
  };
};

export const initNewProject = () => {
  return {
    id: '',
    title: {},
    phases: []
  };
};

export const cleanHearing = (hearing) => {
  const featureCollectionReducer = function (accumulator, currentValue) {
    const feature = {
      type: 'Feature',
      geometry: currentValue
    };
    accumulator.push(feature);
    return accumulator;
  };
  let cleanedHearing = {};
  if (hearing.geojson.length === 1) {
    console.log('eka');
    const tempArr = hearing.geojson;
    cleanedHearing = Object.assign({}, hearing, {
      sections: hearing.sections.reduce((sections, section) => [...sections, Object.assign({}, section, {id: ''})], []),
      geojson: { type: 'FeatureCollection', features: tempArr.reduce(featureCollectionReducer, [])}
      // geojson: first(hearing.geojson)
    });
    // eslint-disable-next-line brace-style
  }
  else if (typeof hearing === 'object' && hearing.geojson.type === 'FeatureCollection') {
    console.log('toka');
    cleanedHearing = Object.assign({}, hearing, {
      sections: hearing.sections.reduce((sections, section) => [...sections, Object.assign({}, section, {id: ''})], []),
      geojson: hearing.geojson
    });
  } else if (hearing.geojson.length > 1) {
    console.log('kolmas');
    const tempArr = hearing.geojson;
    cleanedHearing = Object.assign({}, hearing, {
      sections: hearing.sections.reduce((sections, section) => [...sections, Object.assign({}, section, {id: ''})], []),
      geojson: { type: 'FeatureCollection', features: tempArr.reduce(featureCollectionReducer, [])}
    });
  } else {
    console.log('viimene');
    cleanedHearing = Object.assign({}, hearing, {
      sections: hearing.sections.reduce((sections, section) => [...sections, Object.assign({}, section, {id: ''})], []),
      geojson: hearing.geojson
    });
  }
  return cleanedHearing;
};

export const parseCollection = (featureCollection) => {
  // const featureArray = featureCollection.reduce((features, feature) => [...features, feature.geometry], []);
  const featureArray = featureCollection.reduce((features, feature) => {
    let foo;
    if (feature.geometry.coordinates.length === 1) {
      foo = window.L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates, 1);
      foo = window.L.GeoJSON.latLngsToCoords(foo, 1);
    } else {
      foo = window.L.GeoJSON.coordsToLatLng(feature.geometry.coordinates);
      foo = window.L.GeoJSON.latLngToCoords(foo, 6);
    }

    const bar = {
      coordinates: foo,
      type: feature.geometry.type,
    };
    features.push(bar);
    /*
    features.push({
      coordinates: window.L.GeoJSON.latLngToCoords(foo, 6),
      type: feature.geometry.type,
    }); */
    return features;
  }, []);
  console.log(featureArray);
  return featureArray;
};

export const normalizeGeoJSON = (hearing, id) => {
  const origHearing = hearing.entities.hearing[id];
  if (hearing.entities.hearing[id].geojson.type !== 'FeatureCollection') {
    const normalizedGeoJSON = Object.assign({}, hearing, {
      geojson: [...hearing.geojson]
    });
    return normalizedGeoJSON;
  }
  return hearing;
};
