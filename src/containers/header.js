import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { delUserInfo, setSearchResults } from '../actions';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import API from '../services/api';
import '../styles/header.scss';

class Header extends Component {

  static defaultProps = {
    userInfo: PropTypes.object,
    setUserInfo: PropTypes.func,
    history: PropTypes.obj,
    handleSubmit: PropTypes.obj,
    delUserInfo: PropTypes.func,
  }

  componentDidMount() {
    let pushFooter = document.getElementById('push-footer');
    if (this.props.userInfo && !this.props.userInfo.roles.includes(0)) pushFooter.classList.remove('flex');
    else pushFooter.classList.add('flex');
  }

  componentWillUpdate(nextProps) {
    if (nextProps.userInfo !== this.props.userInfo) {
      let pushFooter = document.getElementById('push-footer');
      if (nextProps.userInfo && !nextProps.userInfo.roles.includes(0)) pushFooter.classList.remove('flex');
      else pushFooter.classList.add('flex');
    }
  }

  constructor(props) {
    super(props);
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 250);
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          setSearchResults(responseData);
          $('#searchBar input').focus(); //focus on input after appears, which will also enable searchResults
        },
        {q: searchVal}
      );
    }
  }

  getResponse(searchVal, setSearchResults) { //same as debouncedGetResponse but without delay
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          responseData.term = searchVal;
          setSearchResults(responseData);
          $('#searchBarResults').hide(); //hide results dropdown after new results in until new input entered after
        },
        {q: searchVal}
      );
    }
  }

  renderSearch(field) {
    const { meta: { error, submitFailed, touched } } = field;

    function hideOnMouseDownOutside(searchBar, searchBarResults) { //must not be DOM objects passed, since each click needs to re-search DOM to see if exists
      const outsideMouseDownListener = event => {
        if (!$(event.target).closest($(searchBar)).length) {
          $(searchBarResults).hide(); //if already hidden, will do nothing
          document.removeEventListener('mousedown', outsideMouseDownListener);
        }
      }
      document.addEventListener('mousedown', outsideMouseDownListener);
    }

    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div id='searchBar' styleName={submitFailed && error ? 'search-error' : ''} className='col-12 col-md-8 mx-auto input-group'>
          <input
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            {...field.input}
            onFocus={ event => {
              $('#searchBarResults').show();
              field.input.onFocus(event);
              hideOnMouseDownOutside('#searchBar', '#searchBarResults');
            }}

          />
          <span className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </span>
          {submitFailed && error ?
            <div styleName='text-help'>
              {error}
            </div>
            : ''
          }
          {field.searchResults && field.input.value.length > 2 ? field.renderSearchResults(field.searchResults)
            : ''
          }
        </div>
      </div>
    ); //searchResults can exist while value length < 3. Edge case: Old GET request still processing, but value length no longer > 2
  }

  renderSearchResults(response) {
    if (response.courses.length === 0 && response.professors.length === 0) return null;

    //onMouseDown prevents losing focus if clicking on h6 elements (will also prevent potential unnecessary hideOnMouseDownOutside events which are called on refocusing on input)
    return (
      <ul id='searchBarResults'>
        {response.professors.length > 0 ? <h6 onMouseDown={event => event.preventDefault()}>Professors</h6> : ''}
        {
          response.professors.map(professor => {
            return (
              <Link
                onMouseDown={event => event.preventDefault()}
                onClick={event => {
                  $('#searchBarResults').hide();
                  $('#searchBar input').blur();
                 }}
                 tabIndex='0' key={professor.id} to={`/professors/${professor.id}`}><li>{professor.first_name} {professor.last_name}</li></Link>
            );
          })
        }
        {response.courses.length > 0 ? <h6 onMouseDown={event => event.preventDefault()}>Classes</h6> : ''}
        {
          response.courses.map(course => {
            return(
              <Link onClick={() => $('#searchBarResults').hide()} tabIndex='0' key={course.id} to={`/courses/${course.id}`}><li>{course.department} {course.number}: {course.title}</li></Link>
            );
          })
        }
      </ul>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    this.debouncedGetResponse(null, null); //cancel other responses in progress
    if ('/search/' + values.searchBar !== window.location.pathname) { //only do something if search is different than last
      if (this.props.searchResults && values.searchBar === this.props.searchResults.term) { //if values same, don't make new request, use current searchResults instead (but force update for searchContent)
        const response = this.props.searchResults;
        response.forceUpdate = true;
        this.props.setSearchResults(response);
      }
      else if ('/search/' + values.searchBar !== window.location.pathname) { //don't re-search if search would be same
        const tempResponse = {professors: [], courses: [], forceUpdate: true, loading: true};
        this.props.setSearchResults(tempResponse); //show loading icon while results being asynchronously fetched
        this.getResponse(values.searchBar, response =>  {
          response.forceUpdate = true;
          response.term = values.searchBar;
          this.props.setSearchResults(response);
        });
      }
      this.props.history.push('/search/' + values.searchBar);
    }
  }

  render() {
    const { handleSubmit, delUserInfo, userInfo } = this.props;
    if (this.props.userInfo && !this.props.userInfo.roles.includes(0)) {
      return (
        <header>
          <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <Field
              name="searchBar" //responsible for object's key name for values
              component={this.renderSearch}
              renderSearchResults={this.renderSearchResults}
              searchResults={this.props.searchResults}
              setSearchResults={response => this.props.setSearchResults(response)}
              onChange={
                (change, newVal) => {
                  if (newVal.length > 2) {
                    this.debouncedGetResponse(newVal, response => {
                      response.term = newVal;
                      this.props.setSearchResults(response);
                    });
                  } else {
                    this.debouncedGetResponse(null, null);//this cancels any previous calls still being debounced so function not called later
                    if (this.props.searchResults !== null) this.props.setSearchResults(null);
                  }
                }
              }
            />
          </form>

          <div styleName="header-items" className="container">
            <Link to={'/'} styleName="homeBtn">
              <i className="fa fa-home" />
            </Link>
            <Link className='btn' styleName='profileBtn' to={'/profile'}>
              <img styleName="profile-img" src={userInfo.picture} alt="Profile picture" />
              {userInfo.first_name}
            </Link>
            <button className='btn' styleName='signOutBtn' type="button" onClick={() => {
              localStorage.removeItem('jwt');
              delUserInfo();
              ReactGA.set({ userId: undefined });
              if (this.props.history.location.pathname !== '/') this.props.history.push('/');
            }} >
              Sign Out
            </button>
          </div>
        </header>
      );
    }
    else return null;
  }
}

function validate(values) {
  const errors = {};
  if (!values.searchBar || values.searchBar.length < 3) {
    errors.searchBar = "Enter at least 3 characters";
  }
  return errors;
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    searchResults: state.searchResults
  };
}

export default withRouter(reduxForm({
  validate,
  form: 'searchBar'
})(
  connect(mapStateToProps, { delUserInfo, setSearchResults })(Header))
);
