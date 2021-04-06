import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import {getUser} from "../../selectors/user";
import {getUserHearingList} from "../../selectors/hearing";
import {fetchHearingList as fetchHearingListAction} from '../../actions/index';
import {Button, Col, ControlLabel, FormControl, FormGroup, Row} from 'react-bootstrap';
import HearingCard from "../../components/HearingCard";
import Link from "../../components/LinkWithLang";
import LoadSpinner from "../../components/LoadSpinner";
import Icon from "../../utils/Icon";
import Helmet from "react-helmet";
import classNames from 'classnames';

export const GET_HEARINGS = {
  OPEN: 'userHearingsOpen',
  CLOSED: 'userHearingsClosed',
  DRAFT: 'userHearingsDrafts'
};

export const SEARCH_PARAMS = {
  OPEN: {published: 'true', open: 'true', limit: 4},
  CLOSED: {published: 'true', open: 'false', limit: 4},
  DRAFT: {published: 'false', limit: 4}
};
class UserHearings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadOwn: true,
      openTools: false,
      sortHearingsBy: '-created_at',
    };
  }

  componentDidMount() {
    const {userState: {userExists}, user} = this.props;
    if (userExists && user) {
      this.fetchAllHearings();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.user && this.props.user && this.props.user.adminOrganizations[0]) {
      this.fetchAllHearings();
    }
    if (prevState.loadOwn !== this.state.loadOwn || prevState.sortHearingsBy !== this.state.sortHearingsBy) {
      this.fetchAllHearings();
    }
  }

  changeSort(event) {
    this.setState({sortHearingsBy: event.target.value});
  }

  fetchAllHearings() {
    const params = this.getDefaultParams();

    this.fetchHearing(GET_HEARINGS.OPEN, {...SEARCH_PARAMS.OPEN, ...params});
    this.fetchHearing(GET_HEARINGS.CLOSED, {...SEARCH_PARAMS.CLOSED, ...params});
    this.fetchHearing(GET_HEARINGS.DRAFT, {...SEARCH_PARAMS.DRAFT, ...params});
  }

  /**
   * fetch
   * @param {string} listID
   * @param {Object} params
   */
  fetchHearing(listID, params) {
    const {fetchHearingList} = this.props;
    fetchHearingList(listID, '/v1/hearing/', params);
  }


  getDefaultParams() {
    const {loadOwn, sortHearingsBy} = this.state;
    const {user} = this.props;
    const hearingCreator = loadOwn ? 'me' : user.adminOrganizations[0];
    return {created_by: hearingCreator, ordering: sortHearingsBy};
  }


  getRemainingHearings(hearingType) {
    const params = this.getDefaultParams();
    const type = hearingType.toUpperCase();

    const typeParamsArray = Object.keys(SEARCH_PARAMS[type]).reduce((acc, curr) => {
      if (curr !== 'limit') {
        acc.push([curr, SEARCH_PARAMS[type][curr]]);
      }
      return acc;
    }, []);

    const typeParamsWithoutLimit = Object.fromEntries(typeParamsArray);
    this.fetchHearing(GET_HEARINGS[type], {...typeParamsWithoutLimit, ...params});
  }


  getHearingListing(type) {
    const {fetching, hearingCount, hearingData} = this.props;
    if (fetching[type]) {
      return (
        <LoadSpinner />
      );
    }
    const elements = this.getHearingCards(hearingData[type]);
    if (elements.length === 0) {
      return (
        <div>
          <div className="loader-wrap">
            <Icon name="search" size="2x" aria-hidden/>
            <FormattedMessage id="noHearings">{txt => <p>{txt}</p>}</FormattedMessage>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="row card-list">
          {elements}
        </div>
        {elements.length === 4 && hearingCount[type] > 4 &&
        <Button onClick={() => this.getRemainingHearings(type)}>
          <FormattedMessage id="showAll" values={{n: hearingCount[type]}}>{txt => txt}</FormattedMessage>
        </Button>
        }
      </div>
    );
  }

  getHearingCards(hearings) {
    const {intl: {locale}} = this.props;
    return hearings.reduce((accumulator, currentValue) => {
      accumulator.push(
        <Col className="user-hearing" sm={4} md={3} key={currentValue.slug}>
          <HearingCard hearing={currentValue} language={locale} />
        </Col>
      );
      return accumulator;
    }, []);
  }

  /**
   * Returns h2 element with content according to type.
   * @param {string} type
   * @returns {JSX.Element}
   */
  getHearingHeader(type) {
    const {hearingCount} = this.props;
    return (
      <FormattedMessage id={`${type}Count`} values={{n: hearingCount[type]}}>{txt => <h2>{txt}</h2>}</FormattedMessage>
    );
  }

  getToolContent() {
    const {loadOwn, openTools} = this.state;
    const {intl: {formatMessage}} = this.props;
    return (
      <React.Fragment>
        <div className="col-md-12 tool-buttons">
          <div>
            <Link to={{path: '/hearing/new'}} className="btn btn-success">
              <Icon name="plus" aria-hidden/>
              {formatMessage({id: 'createHearing'})}
            </Link>
          </div>
          <Button onClick={() => this.toggleDropdown()}>
            <Icon className={classNames({active: openTools})} name="gear" size="2x" />
          </Button>
        </div>
        <div className={classNames('tool-dropdown', {open: openTools})}>
          <div className="tool-content">
            {this.getFormControlSelect()}
            <div className="hearing-radio">
              {/* eslint-disable-next-line jsx-a11y/label-has-for */}
              <label id="show">{formatMessage({id: 'show'})}</label>
              <form>
                <div>
                  <label id="orgLabel">
                    <input
                      aria-labelledby="show orgLabel"
                      type="radio"
                      value="org"
                      name="type"
                      id="orgRadio"
                      onChange={this.toggleHearingCreator}
                      checked={!loadOwn}
                    />
                    {formatMessage({id: 'organizationHearings'})}
                  </label>
                </div>
                <div>
                  <label id="ownLabel">
                    <input
                      aria-labelledby="show ownLabel"
                      type="radio"
                      value="own"
                      name="type"
                      id="ownRadio"
                      onChange={this.toggleHearingCreator}
                      checked={loadOwn}
                    />
                    {formatMessage({id: 'ownHearings'})}
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }


  getFormControlSelect() {
    const {intl: {formatMessage}} = this.props;
    return (
      <FormGroup controlId="formControlsSelect" className="hearing-list__filter-bar-filter">
        <ControlLabel className="hearing-list__filter-bar-label">
          <FormattedMessage id="sort" />
        </ControlLabel>
        <FormControl
          className="select"
          componentClass="select"
          placeholder="select"
          onChange={event => this.changeSort(event)}
        >
          <option value="-created_at">{formatMessage({id: 'newestFirst'})}</option>
          <option value="created_at">{formatMessage({id: 'oldestFirst'})}</option>
          <option value="-close_at">{formatMessage({id: 'lastClosing'})}</option>
          <option value="close_at">{formatMessage({id: 'firstClosing'})}</option>
          <option value="-open_at">{formatMessage({id: 'lastOpen'})}</option>
          <option value="open_at">{formatMessage({id: 'firstOpen'})}</option>
          <option value="-n_comments">{formatMessage({id: 'mostCommented'})}</option>
          <option value="n_comments">{formatMessage({id: 'leastCommented'})}</option>
        </FormControl>
      </FormGroup>
    );
  }

  toggleHearingCreator = () => {
    this.setState({loadOwn: !this.state.loadOwn});
  }

  toggleDropdown() {
    this.setState({openTools: !this.state.openTools});
  }

  render() {
    const {loadOwn} = this.state;
    const {
      intl: {formatMessage},
      userState: {userLoading, userExists}
    } = this.props;
    const activeTitle = loadOwn ? 'ownHearings' : 'organizationHearings';
    const helmetTitle = <Helmet title={formatMessage({id: activeTitle})} />;
    if (userLoading || !userExists) {
      return (helmetTitle);
    }
    return (
      <div className="user-hearings">
        {helmetTitle}
        <div className="container">
          <Row>
            <div className="col-md-12 head">
              <div className="row">
                <div className="col-md-7">
                  <FormattedMessage id={activeTitle}>{txt => <h1>{txt}</h1>}</FormattedMessage>
                </div>
                <div className="col-md-5 tool-container">
                  {this.getToolContent()}
                </div>
              </div>
            </div>
          </Row>
          <Row>
            <div className="col-md-12">
              {this.getHearingHeader('open')}
            </div>
            <div className="col-md-12 user-hearing-list">
              {this.getHearingListing('open')}
            </div>
          </Row>
          <Row>
            <div className="col-md-12">
              {this.getHearingHeader('closed')}
            </div>
            <div className="col-md-12 user-hearing-list">
              {this.getHearingListing('closed')}
            </div>
          </Row>
          <Row>
            <div className="col-md-12">
              {this.getHearingHeader('draft')}
            </div>
            <div className="col-md-12 user-hearing-list">
              {this.getHearingListing('draft')}
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

UserHearings.propTypes = {
  user: PropTypes.object,
  userState: PropTypes.shape({
    userExists: PropTypes.bool,
    userLoading: PropTypes.bool
  }),
  intl: intlShape.isRequired,
  fetching: PropTypes.object,
  fetchHearingList: PropTypes.func,
  hearingData: PropTypes.object,
  hearingCount: PropTypes.object,
};

/**
 * @param {Object} state
 * @returns {{userExists: boolean, userLoading: boolean}}
 */
const existsSelector = state => {
  return {
    userExists: !state.oidc.isLoading && state.oidc.user !== null,
    userLoading: state.oidc.isLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchHearingList: (list, endpoint, param) => dispatch(fetchHearingListAction(list, endpoint, param)),
});
const mapStateToProps = state => ({
  user: getUser(state),
  userState: existsSelector(state),
  fetching: getUserHearingList(state, 'isFetching'),
  hearingCount: getUserHearingList(state, 'count'),
  hearingData: getUserHearingList(state, 'data'),
});

export { UserHearings as UnconnectedUserHearings};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserHearings));

