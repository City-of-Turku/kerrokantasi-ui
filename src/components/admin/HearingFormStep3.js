import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, FormattedMessage} from 'react-intl';
import Leaflet from 'leaflet';
import getTranslatedTooltips from '../../utils/getTranslatedTooltips';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import {isEmpty, includes, keys, isEqual} from 'lodash';
import {ZoomControl} from 'react-leaflet';
import {localizedNotifyError} from '../../utils/notify';
import Icon from '../../utils/Icon';
import { connect } from 'react-redux';

import leafletMarkerIconUrl from '../../../assets/images/leaflet/marker-icon.png';
import leafletMarkerRetinaIconUrl from '../../../assets/images/leaflet/marker-icon-2x.png';
import leafletMarkerShadowUrl from '../../../assets/images/leaflet/marker-shadow.png';
/* eslint-disable import/no-unresolved */
import localization from '@city-i18n/localization.json';
import urls from '@city-assets/urls.json';
/* eslint-enable import/no-unresolved */

import {hearingShape} from '../../types';
import { getCorrectContrastMapTileUrl } from '../../utils/map';
import {parseCollection} from "../../utils/hearingEditor";

// This is needed for the invalidateMap not to fire after the component has dismounted and causing error.
let mapInvalidator;

Leaflet.Marker.prototype.options.icon = new Leaflet.Icon({
  iconUrl: leafletMarkerIconUrl,
  shadowUrl: leafletMarkerShadowUrl,
  iconRetinaUrl: leafletMarkerRetinaIconUrl,
  iconSize: [25, 41],
  iconAnchor: [13, 41],
});

function getHearingArea(hearing) {
  if (typeof window === "undefined") return null;
  if (!hearing || !hearing.geojson) return null;

  const {LatLng} = require('leaflet');  // Late import to be isomorphic compatible
  const {Polygon, GeoJSON, Marker, Polyline} = require('react-leaflet');  // Late import to be isomorphic compatible
  const {geojson} = hearing;
  console.log(geojson);
  switch (geojson.type) {
    case "Polygon": {
      // XXX: This only supports the _first_ ring of coordinates in a Polygon
      const latLngs = geojson.coordinates[0].map(([lng, lat]) => new LatLng(lat, lng));
      return <Polygon positions={latLngs}/>;
    }
    case "Point": {
      const latLngs = new LatLng(geojson.coordinates[1], geojson.coordinates[0]);
      return (
        <Marker
          position={latLngs}
          icon={new Leaflet.Icon({
            iconUrl: leafletMarkerIconUrl,
            shadowUrl: leafletMarkerShadowUrl,
            iconRetinaUrl: leafletMarkerRetinaIconUrl,
            iconSize: [25, 41],
            iconAnchor: [13, 41]
          })}
        />
      );
    }
    case "LineString": {
      const latLngs = geojson.coordinates.map(([lng, lat]) => new LatLng(lat, lng));
      return (<Polyline positions={latLngs}/>);
    }
    case "FeatureCollection": {
      const foo = geojson.features;
      const collection = foo.reduce((accumulator, currentValue) => {
        accumulator.push(getMapElement(currentValue.geometry));
        return accumulator;
      }, []);
      return [...collection];
    }
    default:
      // TODO: Implement support for other geometries too (markers, square, circle)
      // return (<GeoJSON data={geojson} key={JSON.stringify(geojson)}/>);
      if (Array.isArray(geojson)) {
        const collection = geojson.reduce((accumulator, currentValue) => {
          accumulator.push(getMapElement(currentValue));
          return accumulator;
        }, []);
        return [...collection];
      }
      return (<GeoJSON data={geojson} key={JSON.stringify(geojson)}/>);
  }
}

function getMapElement(geojson) {
  const {LatLng} = require('leaflet');  // Late import to be isomorphic compatible
  const {Polygon, GeoJSON, Marker, Polyline} = require('react-leaflet');  // Late import to be isomorphic compatible

  switch (geojson.type) {
    case "Polygon": {
      // XXX: This only supports the _first_ ring of coordinates in a Polygon
      const latLngs = geojson.coordinates[0].map(([lng, lat]) => new LatLng(lat, lng));
      return <Polygon key={geojson.coordinates[0][0][0]} positions={latLngs}/>;
    }
    case "Point": {
      const latLngs = new LatLng(geojson.coordinates[1], geojson.coordinates[0]);
      return (
        <Marker
          key={geojson.coordinates[0]}
          position={latLngs}
          icon={new Leaflet.Icon({
            iconUrl: leafletMarkerIconUrl,
            shadowUrl: leafletMarkerShadowUrl,
            iconRetinaUrl: leafletMarkerRetinaIconUrl,
            iconSize: [25, 41],
            iconAnchor: [13, 41]
          })}
        />
      );
    }
    case "LineString": {
      const latLngs = geojson.coordinates.map(([lng, lat]) => new LatLng(lat, lng));
      return (<Polyline positions={latLngs}/>);
    }

    default:
      // TODO: Implement support for other geometries too (markers, square, circle)
      return (<GeoJSON data={geojson} key={JSON.stringify(geojson)}/>);
  }
}


function getFirstGeometry(featureCollectionGeoJSON) {
  const firstFeature = featureCollectionGeoJSON.features[0];
  if (firstFeature) {
    return firstFeature.geometry;
  }
  return {};
}


class HearingFormStep3 extends React.Component {
  constructor(props) {
    super(props);
    this.onDrawCreated = this.onDrawCreated.bind(this);
    this.onDrawDeleted = this.onDrawDeleted.bind(this);
    this.onDrawEdited = this.onDrawEdited.bind(this);
    this.onDeleteStart = this.onDeleteStart.bind(this);
    this.onDeleteEnd = this.onDeleteEnd.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onDrawStart = this.onDrawStart.bind(this);
    // This is necessary to prevent getHearingArea() from rendering drawings twice after editing
    this.state = {
      isEdited: false,
      uploadedFile: false,
      geojson: this.props.hearing.geojson || [],
    };
  }

  componentDidMount() {
    Leaflet.drawLocal = getTranslatedTooltips(this.props.language);
  }

  componentWillReceiveProps(nextProps) {
    const {language} = this.props;

    if (nextProps.language !== language) {
      Leaflet.drawLocal = getTranslatedTooltips(nextProps.language);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.hearing.geojson !== prevProps.hearing.geojson) {
      if (Array.isArray(this.props.hearing.geojson)) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({geojson: this.props.hearing.geojson});
      }
      if (this.props.hearing.geojson.type) {
        if (this.props.hearing.geojson.features.length < prevProps.hearing.geojson.features.length) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState({geojson: this.props.hearing.geojson});
        }
      }
    }
    this.invalidateMap();
  }

  componentWillUnmount() {
    clearTimeout(mapInvalidator);
  }

  onDrawEdited(event) {
    // TODO: Implement proper onDrawEdited functionality
    console.log('EDIT');
    this.setState({isEdited: true});
    //    this.props.onHearingChangeMap("geojson", getFirstGeometry(event.layers.toGeoJSON()));
    this.props.onHearingChangeMap("geojson", event.layer.toGeoJSON().geometry);
  }

  onDrawStart() {
    console.log('draw start');
    // this.setState({isEdited: true});
  }
  onDrawCreated(event) {
    // TODO: Implement proper onDrawCreated functionality
    console.log('CREATED');
    console.log(event);

    this.setState({isEdited: true});


    // this.props.onHearingChangeMap("geojson", event.layer.toGeoJSON().geometry);
    if (this.props.hearing.geojson.features) {
      this.props.onHearingAddMapMarkerExisting(event.layer.toGeoJSON().geometry);
    } else {
      this.props.onHearingAddMapMarker(event.layer.toGeoJSON().geometry);
    }
  }

  onDrawDeleted(event) {
    // TODO: Implement proper onDrawDeleted functionality
    // event.layers._layers.feature.geometry.coordinates
    console.log('yass');
    console.log(event);

    if (event.layers && !isEmpty(event.layers._layers)) {
      const temp = this.props.hearing.geojson.features ? this.props.hearing.geojson.features : this.props.hearing.geojson;
      const foo = Object.keys(event.layers._layers);
      console.log(foo);
      let bar;
      // creating a new hearing with uploaded geojson, deleted one element before saving works!
      if (this.state.uploadedFile && false) {
        // eslint-disable-next-line array-callback-return,consistent-return
        bar = foo.map((currentValue) => {
          if (event.layers._layers[currentValue] && event.layers._layers[currentValue].feature.geometry.coordinates) {
            return (event.layers._layers[currentValue].feature.geometry.coordinates[0]);
          }
        });
      } else {
        // eslint-disable-next-line consistent-return,array-callback-return
        bar = foo.map((currentValue) => {
          console.log('toka');
          console.log(typeof event.layers._layers[currentValue]._latlngs === 'object');
          if (event.layers._layers[currentValue] && (event.layers._layers[currentValue]._latlng || event.layers._layers[currentValue]._latlngs)) {
            if (event.layers._layers[currentValue].feature) {
              return (event.layers._layers[currentValue].toGeoJSON().geometry);
            }
            if (typeof event.layers._layers[currentValue]._latlng === 'object') {
              console.log('obj');
              return event.layers._layers[currentValue].toGeoJSON().geometry;
            }
            if (Array.isArray(event.layers._layers[currentValue]._latlngs)) {
              console.log('arrr');
              if (event.layers._layers[currentValue].feature) {
                return event.layers._layers[currentValue].toGeoJSON().geometry;
              }
              if (event.layers._layers[currentValue]._latlngs[0]) {
                /*
                return event.layers._layers[currentValue]._latlngs[0].reduce((accumulator, coord) => {
                  const vals = Object.values(coord);
                  accumulator.push([vals[1], vals[0]]);
                  return accumulator;
                }, []); */
                return event.layers._layers[currentValue].toGeoJSON().geometry;
              }
            }
            // return (event.layers._layers[currentValue]._latlngs);
          }
        });
      }
      console.log(bar);

      console.log(bar);
      console.log(temp);

      let newGeo;
      if (temp[0].geometry) {
        newGeo = temp.filter(geo => geo.geometry.coordinates[0] !== bar);
      }
      else {
        // newGeo = temp.filter(geo => geo.coordinates !== bar[0].coordinates);
        newGeo = temp.reduce((accumulator, geo) => {
          /*
          if (!bar.some((element) => {
            return element === geo.coordinates;
          })) {
            accumulator.push(geo);
          }
          */
          const cords = geo.coordinates;
          console.log(bar.includes(cords));
          /*
          if (!bar.includes(geo.coordinates)) {
            accumulator.push(geo);
          }
          */
          if (bar.some((element) => isEqual(element, geo))) {
            return accumulator;
          }
          accumulator.push(geo);
          return accumulator;
        }, []);
      }

      if (this.props.hearing.geojson.features && this.props.hearing.geojson.type) {
        // const feats = temp.filter(geo => geo.geometry.coordinates[0] !== bar);
        const feats = temp.reduce((accumulator, geo) => {
          if (bar.some((element) => isEqual(element, geo.geometry))) {
            return accumulator;
          }
          accumulator.push(geo);
          return accumulator;
        }, []);
        newGeo = {
          features: feats,
          type: this.props.hearing.geojson.type,
        };
      }
      console.log(newGeo);
      this.props.onHearingChange("geojson", newGeo);
      // this.setState({isEdited: true});


    }
  }
  onDeleteStart(event) {
    console.log('delete start');
    // this.setState({isEdited: true});
  }
  onDeleteEnd() {
    // this.setState({isEdited: false});
  }
  handleClick(event) {
    console.log(event.layer.feature);
  }
  onUploadGeoJSON = (event) => {
    this.readTextFile(event.target.files[0], (json) => {
      try {
        const featureCollection = JSON.parse(json);
        console.log(featureCollection);
        if (
          featureCollection.type === 'FeatureCollection' &&
          !isEmpty(featureCollection.features) &&
          includes(keys(featureCollection.features[0]), 'geometry') &&
          includes(keys(featureCollection.features[0].geometry), 'type') &&
          includes(keys(featureCollection.features[0].geometry), 'coordinates')
        ) {
          /*
          const reducer = (accumulator, currentValue) => accumulator.push(currentValue);
          const arrayyy = featureCollection.features;
          const temppi = arrayyy.reduce((accumulator, currentValue) => {
            if (currentValue) {
              accumulator.push(currentValue);
            }
            return accumulator;
          }, []);
          */
          const temp = parseCollection(featureCollection.features);
          console.log(temp);
          console.log('uploaa');

          this.props.onHearingChange("geojson", temp);
          this.setState({isEdited: false, uploadedFile: true});
        } else {
          localizedNotifyError('Virheellinen tiedostoEka.');
        }
      } catch (err) {
        localizedNotifyError('Virheellinen tiedostoToka.');
      }
    });
  }

  readTextFile = (file, callback) => {
    try {
      const reader = new FileReader();

      reader.onload = () => callback(reader.result);

      reader.readAsText(file);
    } catch (err) {
      localizedNotifyError('Virheellinen tiedosto.');
    }
  }

  invalidateMap() {
    // Map size needs to be invalidated after dynamically resizing
    // the map container.
    const map = this.map;
    if (map && this.props.visible) {
      mapInvalidator = setTimeout(() => {
        map.leafletElement.invalidateSize();
      }, 200);  // Short delay to wait for the animation to end
    }
  }

  getDrawOptions() {
    const {geojson} = this.props.hearing;

    if (!geojson || isEmpty(geojson)) {
      return {
        circle: false,
        circlemarker: false,
        polyline: false,
        marker: {
          icon: new Leaflet.Icon({
            iconUrl: leafletMarkerIconUrl,
            shadowUrl: leafletMarkerShadowUrl,
            iconRetinaUrl: leafletMarkerRetinaIconUrl,
            iconSize: [25, 41],
            iconAnchor: [13, 41],
          })
        }
      };
    }
    return {
      circle: false,
      circlemarker: false,
      marker: {
        icon: new Leaflet.Icon({
          iconUrl: leafletMarkerIconUrl,
          shadowUrl: leafletMarkerShadowUrl,
          iconRetinaUrl: leafletMarkerRetinaIconUrl,
          iconSize: [25, 41],
          iconAnchor: [13, 41],
        })
      },
      polyline: false
    };
  }

  refCallBack = (el) => {
    this.map = el;
  }
  showHearing() {
    const {isEdited, uploadedFile} = this.state;
    const {isNewHearing} = this.props;
    if (!isNewHearing && !isEdited) {
      return true;
    } else if (!isNewHearing && isEdited) {
      return true;
    } else if (!isEdited) {
      return true;
    }
  }

  render() {
    if (typeof window === "undefined") return null;  // Skip rendering outside of browser context
    const {FeatureGroup, Map, TileLayer} = require("react-leaflet");  // Late import to be isomorphic compatible
    const {EditControl} = require("react-leaflet-draw");
    const hearing = this.props.hearing;
    const localHearing = {
      geojson: this.state.geojson,
    };
    return (
      <div className="form-step">
        <FormGroup controlId="hearingArea">
          <ControlLabel><FormattedMessage id="hearingArea"/></ControlLabel>
          <Map
            ref={this.refCallBack}
            // onResize={this.invalidateMap.bind(this)}
            zoomControl={false}
            center={localization.mapPosition}
            zoom={11}
            className="hearing-map"
          >
            <ZoomControl zoomInTitle="Lähennä" zoomOutTitle="Loitonna"/>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={getCorrectContrastMapTileUrl(urls.rasterMapTiles,
                urls.highContrastRasterMapTiles, this.props.isHighContrast)}
            />
            <FeatureGroup ref={(group) => { this.featureGroup = group; }} onClick={this.handleClick}>
              <EditControl
                position="topleft"
                onEdited={this.onDrawEdited}
                onCreated={this.onDrawCreated}
                onDeleted={this.onDrawDeleted}
                onDeleteStart={this.onDeleteStart}
                onDeleteStop={this.onDeleteEnd}
                onDrawStart={this.onDrawStart}
                draw={this.getDrawOptions()}
                edit={
                  {
                    featureGroup: this.featureGroup,
                    edit: false
                  }
                }
              />
              {((!this.props.isNewHearing && !this.state.isEdited) || (!this.props.isNewHearing && this.state.isEdited) || !this.props.isNewHearing || !this.state.isEdited) && getHearingArea(hearing)}
            </FeatureGroup>
          </Map>
        </FormGroup>
        <div className="step-control">
          <label className="geojson_button" htmlFor="geojsonUploader">
            <input id="geojsonUploader" type="file" onChange={this.onUploadGeoJSON} style={{display: 'none'}} />
            <Icon className="icon" name="upload" style={{marginRight: '5px'}}/>
            <FormattedMessage id="addGeojson"/>
          </label>
        </div>
        <div className="step-footer">
          <Button
            bsStyle="default"
            onClick={this.props.onContinue}
          >
            <FormattedMessage id="hearingFormNext"/>
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isHighContrast: state.accessibility.isHighContrast,
});

HearingFormStep3.defaultProps = {
  isNewHearing: false,
};

HearingFormStep3.propTypes = {
  hearing: hearingShape,
  onContinue: PropTypes.func,
  onHearingChange: PropTypes.func,
  onHearingChangeMap: PropTypes.func,
  onHearingAddMapMarker: PropTypes.func,
  onHearingAddMapMarkerExisting: PropTypes.func,
  visible: PropTypes.bool,
  language: PropTypes.string,
  isHighContrast: PropTypes.bool,
  isNewHearing: PropTypes.bool,
};

const WrappedHearingFormStep3 = connect(mapStateToProps, null)(injectIntl(HearingFormStep3));

export default WrappedHearingFormStep3;
