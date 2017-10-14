import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { setUserInfo, delUserInfo, setSearchResults, ROOT_URL } from '../actions';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import axios from 'axios';
import { withRouter } from 'react-router';

class Header extends Component {

  componentWillUpdate(nextProps) {
    if (nextProps.searchResults === this.props.searchResults) {
      var pushFooter = document.getElementById('push-footer');
      if (localStorage.jwt) pushFooter.className = '';
      else pushFooter.className = 'flex';
    }
  }

  constructor(props) {
    super(props);
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 300);
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {

    const options =
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.jwt
        },
        params: {
          q: searchVal,
          university_id: 1
        }
      };

      axios.get(`${ROOT_URL}/search`, options)
      .then(response => setSearchResults(response.data))
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
    }
  }

  getResponseAndPushHistory(searchVal, setSearchResults, pushHistory) { //same as debouncedGetResponse but without delay and routes to page after submitted
    if (searchVal && setSearchResults) {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.jwt
        },
        params: {
          q: searchVal,
          university_id: 1
        }
      };

      axios.get(`${ROOT_URL}/search`, options)
      .then(
        response => {
          setSearchResults(response.data);
          pushHistory();
          $('#searchBarResults').remove(); //remove results dropdown when submitting until new input entered after
          setSearchResults(null); //set to null so if continuation in typing value after submission, ensures dropdown box reappears

        }
      )
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      })
    }
  }



  displaySignedIn(userInfo, delUserInfo, refresh){
    return (
      <span>
        {userInfo ? <img className="oauth-img" src={userInfo.imageUrl} alt="Profile photo" /> : ''}
        <button type="button" onClick={() => {
          delUserInfo();
          localStorage.removeItem('jwt');
          refresh();
        }}
        className="signOutBtn">
          Sign Out
        </button>
      </span>
    );
  }

  renderField(field) {
    const { meta: { touched, error } } = field;
    const searchBarClass = `col-12 col-md-8 mx-auto input-group ${touched && error ? 'has-danger' : ''}`;
    const textHelpClass = `${touched && error ? 'text-help' : ''}`;
    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div className={searchBarClass}>
          <input
            className='form-control'
            type='text'
            placeholder='Search for lecturer or class'
            autoComplete='off'
            {...field.input}
          />
          <div className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </div>
          <div className={textHelpClass}>
            {touched ? error : ''}
          </div>
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
            <ul id='searchBarResults'>
              {response.courses.length > 0 ? <h6>Classes</h6> : ''}
              {response.courses.length > 0 ?
                response.courses.map(course => {
                  return(
                    <li key={course.id}>{course.department} {course.number}: {course.title}</li>
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
    const { handleSubmit, setUserInfo, userInfo } = this.props;
    const oAuthClass = `oauth-btn ${userInfo != null ? 'withImg' : ''}`;
    if (localStorage.jwt) {
      return (
        <header>
          <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <Field
              label="Read &amp; Write SCU Evals"
              name="searchBar" //responsible for object's key name for values
              component={this.renderField}
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

          <div className="container " style={{marginTop: "7px", position: "relative"}}>
            <Link to={'/'}>
              <i className="fa fa-home homeBtn" />
            </Link>
            {this.displaySignedIn(userInfo, this.props.delUserInfo, () => this.props.history.push('/'))}
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
  connect(mapStateToProps, { setUserInfo, delUserInfo, setSearchResults })(Header))
);
