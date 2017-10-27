import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { delUserInfo, setSearchResults } from '../actions';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { withRouter } from 'react-router';

import API from '../../public/scripts/api_service';
import { storeWithMiddleware } from '../index';


class Header extends Component {
  componentDidMount() {
    let pushFooter = document.getElementById('push-footer');
    if (this.props.userInfo && !this.props.userInfo.roles.includes(0)) pushFooter.className = '';
    else pushFooter.className = 'flex';
  }

  componentWillUpdate(nextProps) {
    if (nextProps.userInfo !== this.props.userInfo) {
      let pushFooter = document.getElementById('push-footer');
      if (nextProps.userInfo && !nextProps.userInfo.roles.includes(0)) pushFooter.className = '';
      else pushFooter.className = 'flex';
    }
  }

  constructor(props) {
    super(props);
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 300);
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {

      const params = {
        params: {
          q: searchVal
        }
      };


      let client = new API();
      client.get('/search', responseData => setSearchResults(responseData), params);
    }
  }

  getResponseAndPushHistory(searchVal, setSearchResults, pushHistory) { //same as debouncedGetResponse but without delay and routes to page after submitted
    if (searchVal && setSearchResults) {

      const params = {
        params: {
          q: searchVal
        }
      };

      let client = new API();
      client.get('/search', responseData => {
          setSearchResults(responseData);
          pushHistory();
          $('#searchBarResults').remove(); //remove results dropdown when submitting until new input entered after
          setSearchResults(null); //set to null so if continuation in typing value after submission, ensures dropdown box reappears
        },
        params
      );
    }
  }

  renderSearch(field) {
    const { meta: { error, submitFailed, touched } } = field;
    const searchBarClass = `col-12 col-md-8 mx-auto input-group ${touched && error ? 'has-danger' : ''}`;
    const textHelpClass = `${submitFailed && error ? 'text-help' : ''}`;
    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div className={searchBarClass}>
          <input
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            {...field.input}
          />
          <div className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </div>
            {submitFailed && error ?
              <div className='text-help'>
                {error}
              </div>
              : ''
            }
        </div>
        {field.searchResults && field.input.value.length > 2 ? field.renderSearchResults(field.searchResults) : ''}
      </div>
    ); //searchResults can exist while value length < 3. Edge case: Old GET request still processing, but value length no longer > 2
  }

  renderSearchResults(response) {
    if (response.courses.length === 0 && response.professors.length === 0) return null;

    return (
      <div className='col-12 col-md-8 mx-auto'>
        <div id='searchBarResultsWrapper'>
            <ul className='dropdown-menu' id='searchBarResults'>
              {response.courses.length > 0 ? <h6>Classes</h6> : ''}
              {response.courses.length > 0 ?
                response.courses.map(course => {
                  return(
                    <li className='dropdown-item' key={course.id}>{course.department} {course.number}: {course.title}</li>
                  );
                })
                : ''
              }
              {response.professors.length > 0 ? <h6>Professors</h6> : ''}
              {response.professors.length > 0 ?
                response.professors.map(professor => {
                  return(
                    <li key={professor.id}>{professor.first_name} {professor.last_name}</li>
                  );
                })
                : ''
              }
            </ul>
        </div>
      </div>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    this.debouncedGetResponse(null, null); //cancel other responses in progress
    this.getResponseAndPushHistory(values.searchBar, response => this.props.setSearchResults(response), () => this.props.history.push('/search/' + values.searchBar));
    $('#searchBarResults').remove(); //remove results dropdown when submitting until new input entered after
  }

  render() {
    const { handleSubmit, setUserInfo, delUserInfo, userInfo } = this.props;
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

          <div className="container header-items">
            <Link to={'/'}>
              <i className="fa fa-home homeBtn" />
            </Link>
            <Link className='profileBtn' to={'/profile'}>
              {userInfo.first_name}
              <img className="oauth-img" src={userInfo.picture} alt="Profile picture" />
            </Link>
            <button type="button" onClick={() => {
              localStorage.removeItem('jwt');
              delUserInfo();
              if (this.props.history.location.pathname !== '/') this.props.history.push('/');
            }}
            className="signOutBtn">
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
