import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { fetchSearch, setUserInfo, delUserInfo, postConfig, ROOT_URL } from '../actions';
import GoogleLogin from 'react-google-login';
import { Link } from 'react-router-dom';
import Toastr from 'toastr';
import { debounce } from 'lodash';
import axios from 'axios';

class Header extends Component {

  constructor(props) {
    super(props);
    this.getResponse = debounce(this.getResponse, 300);
    this.state = {
      searchBarValue: null,
      searchBarResponse: null
    };
  }

  getResponse(searchBarValue, setSearchBarResponseState) {
  const options =
    { params:
      {
        q: searchBarValue,
        university_id: 1
      }
    };

    axios.get(`${ROOT_URL}/search`, options, postConfig)
    .then(response => {
        setSearchBarResponseState(response.data);
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
    });
  }

  shouldComponentUpdate(prevProps) {
    if (prevProps.searchBarResponse !== this.state.searchBarResponse ||
      (prevProps.searchBarResponse === null && this.state.searchBarResponse === null)) {
      return true;
    }
    else return false;
  }

  componentDidMount() {
    Toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": false,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "2000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
  }

  displaySignedIn(userInfo, delUserInfo){
    if (userInfo) { return(
      <span>
        <img className="oauth-img" src={userInfo.imageUrl} alt="Profile photo" />
        <button type="button" onClick={() => {delUserInfo(); Toastr["success"]("Signed Out");}} className="signOutBtn">Sign Out</button>
      </span>
  )}
    else return;
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
            className="form-control"
            type="text"
            placeholder='Search for lecturer or class'
            {...field.input}
          />
          <div className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </div>
          <div className={textHelpClass}>
            {touched ? error : ''}
          </div>
        </div>
        {field.searchBarResponse ? field.renderSearchBarResponse(field.searchBarResponse) : ''}
      </div>
    );
  }

  renderSearchBarResponse(response) {
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
    //console.log(values);
    this.props.fetchSearch(values, () => {
      this.props.history.push('/');
    });
  }

  render() {
    const { handleSubmit, setUserInfo, userInfo } = this.props;
    const oAuthClass = `oauth-btn ${userInfo != null ? 'withImg' : ''}`;
    return (
      <header>

      <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          label="Read &amp; Write SCU Evals"
          name="searchBar" //responsible for object's key name for values
          component={this.renderField}
          renderSearchBarResponse={this.renderSearchBarResponse}
          searchBarResponse={this.state.searchBarResponse}
          onChange={
            (change, newVal) => {
              if (newVal.length > 2) {
                this.getResponse(newVal, (response) => this.setState({searchBarResponse: response}));
              } else if (this.state.searchBarResponse !== null) this.setState({searchBarResponse: null});
            }
          }
        />
      </form>

      <div className="container " style={{marginTop: "7px", position: "relative"}}>
        <Link to={'/'}>
          <i className="fa fa-home homeBtn"></i>
        </Link>
        <GoogleLogin
          hostedDomain="scu.edu"
          clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
          buttonText={userInfo ?  userInfo.givenName: 'Sign in with SCU Gmail'}
          onSuccess={setUserInfo}
          onFailure={setUserInfo}
          style={{}}
          className={oAuthClass}
        />
        {this.displaySignedIn(userInfo, this.props.delUserInfo)}
      </div>
      </header>
    );
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
    userInfo: state.userInfo
  };
}

export default reduxForm({
  validate,
  form: 'searchBar'
})(
  connect(mapStateToProps,{ setUserInfo, delUserInfo, fetchSearch })(Header)
);
