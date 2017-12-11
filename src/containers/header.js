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
      client.get('/search', responseData => setSearchResults(responseData), {q: searchVal});
    }
  }

  getResponseAndPushHistory(searchVal, setSearchResults, pushHistory) { //same as debouncedGetResponse but without delay and routes to page after submitted
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          setSearchResults(responseData);
          $('#searchBarResults').hide(); //hide results dropdown after new results in until new input entered after
          pushHistory();
        },
        {q: searchVal}
      );
    }
  }

  renderSearch(field) {
    const { meta: { error, submitFailed, touched } } = field;
    const searchBarClass = `col-12 col-md-8 mx-auto input-group ${touched && error ? 'has-danger' : ''}`;

    function hideOnClickOutside(searchBar, searchBarResults) {
     const outsideClickListener = (event) => {
       const searchBarDOM = $(searchBar);
       const searchBarResultsDOM = $(searchBarResults);
       if (searchBarResultsDOM === 0) document.removeEventListener('click', outsideClickListener); //if results empty
       else if (!$(event.target).closest(searchBarDOM).length) {
         if ($(searchBarResultsDOM).is(':visible')) {
           $(searchBarResultsDOM).hide();
           document.removeEventListener('click', outsideClickListener);
         }
       }
     }
     document.addEventListener('click', outsideClickListener);
    }

    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div id='searchBar' className={searchBarClass}>
          <input
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            {...field.input}
            onFocus={ event => {
              $('#searchBarResults').show();
              field.input.onFocus(event);
              hideOnClickOutside('#searchBar', '#searchBarResults');
            }}

          />
          <div className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </div>
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

    return (
      <ul id='searchBarResults'>
        {response.professors.length > 0 ? <h6>Professors</h6> : ''}
        {response.professors.length > 0 ?
          response.professors.map(professor => {
            return(
              <Link tabIndex='0' key={professor.id} to={`/courses/${professor.id}`}><li>{professor.first_name} {professor.last_name}</li></Link>
            );
          })
          : ''
        }
        {response.courses.length > 0 ? <h6>Classes</h6> : ''}
        {response.courses.length > 0 ?
          response.courses.map(course => {
            return(
              <Link tabIndex='0' key={course.id} to={`/courses/${course.id}`}><li>{course.department} {course.number}: {course.title}</li></Link>
            );
          })
          : ''
        }
      </ul>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    $('#searchBarResults').hide();
    this.debouncedGetResponse(null, null); //cancel other responses in progress
    this.getResponseAndPushHistory(values.searchBar, response => this.props.setSearchResults(response), () => this.props.history.push('/search/' + values.searchBar));
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
                    this.debouncedGetResponse(newVal, response => this.props.setSearchResults(response));
                  } else {
                    this.debouncedGetResponse(null, null);//this cancels any previous calls still being debounced so function not called later
                    if (this.props.searchResults !== null) this.props.setSearchResults(null);
                  }
                }
              }
            />
          </form>

          <div styleName="header-items" className="container">
            <Link to={'/'}>
              <i className="fa fa-home homeBtn" />
            </Link>
            <Link styleName='profileBtn' to={'/profile'}>
              {userInfo.first_name}
              <img styleName="oauth-img" src={userInfo.picture} alt="Profile picture" />
            </Link>
            <button type="button" onClick={() => {
              localStorage.removeItem('jwt');
              delUserInfo();
              ReactGA.set({ userId: undefined });
              if (this.props.history.location.pathname !== '/') this.props.history.push('/');
            }}
            styleName="signOutBtn">
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
  if (values.searchBar && values.searchBar.length < 3) {
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
