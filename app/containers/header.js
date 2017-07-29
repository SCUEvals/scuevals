import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { fetchSearch, setUserInfo, delUserInfo } from '../actions';
import GoogleLogin from 'react-google-login';
import { Link } from 'react-router-dom';
import Toastr from 'toastr';

class Header extends Component {
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
    if (userInfo) { return (
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
    const textHelpClass = `${touched && error ? 'text-help offset-md-2' : ''}`;
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
      </div>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    //console.log(values);
    var d = $("#app");
    console.log(d);
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
        />
      </form>

      <div className="container" style={{marginTop: "7px"}}>
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
