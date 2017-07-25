import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { fetchSearch, setUserInfo } from '../actions';
import GoogleLogin from 'react-google-login';

class Header extends Component {

  checkImg(url){
    if (url) { return (
    <img className="oauth-img" src={url} alt="Profile photo" />
  )}
    else return;
  }
  renderField(field) {
    const { meta: { touched, error } } = field;
    const searchBarClass = `input-group ${touched && error ? 'has-danger' : ''}`;
    const oAuthClass = `oauth-btn ${field.userInfo.imageUrl ? 'withImg' : ''}`;
    const textHelpClass = `${touched && error ? 'text-help' : ''}`;
    return (
      <div>
        <label>{field.label}</label>
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
        <div style={{marginTop: "7px"}}>
          <GoogleLogin
            hostedDomain="scu.edu"
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText={field.userInfo.givenName}
            onSuccess={field.setInfo}
            onFailure={field.setInfo}
            style={{}}
            className={oAuthClass}
          />
          {field.checkImg(field.userInfo.imageUrl)}
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
    return (
      <header>
      <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          label="Read &amp; Write SCU Evals"
          name="searchBar" //responsible for object's key name for values
          component={this.renderField}
          setInfo={setUserInfo}
          userInfo={userInfo}
          checkImg={this.checkImg}

        />
      </form>
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
  connect(mapStateToProps,{ setUserInfo, fetchSearch })(Header)
);
