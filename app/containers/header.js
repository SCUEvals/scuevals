import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { fetchSearch, setUserInfo } from '../actions';
import GoogleLogin from 'react-google-login';

class Header extends Component {

  renderField(field) {
    const { meta: { touched, error } } = field;
    const className = `input-group ${touched && error ? 'has-danger' : ''}`;
    return (
      <div>
        <label>{field.label}</label>
        <div className={className}>
          <input
            className="form-control"
            type="text"
            placeholder='Search for lecturer or class'
            {...field.input}
          />
          <div className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </div>
          <GoogleLogin
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText={field.userName}
            onSuccess={field.setInfo}
            onFailure={field.setInfo}
            style={{}}
            className="oauth-btn"
          />
        </div>
        <div className="text-help">
          {touched ? error : ''}
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
          label="Read &amp; write SCU Evaluations"
          name="searchBar" //responsible for object's key name for values
          component={this.renderField}
          setInfo={setUserInfo}
          userName={userInfo.profileObj.name}

        />
      </form>
      </header>
    );
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
  // Whatever is returned will show up as props
  // inside of BookList
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
