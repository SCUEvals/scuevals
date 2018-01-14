import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';

import { setUserInfo, delUserInfo, setMajorsList } from '../actions';
import API from '../services/api';
import '../styles/profile.scss';

class Profile extends Component {

  static defaultProps = {
    userInfo: PropTypes.object,
    setUserInfo: PropTypes.func,
    history: PropTypes.obj,
    handleSubmit: PropTypes.obj,
    delUserInfo: PropTypes.func,
  }

  componentWillMount() {
    if (this.props.majorsList) return;
    let client = new API();
    client.get('/majors', responseData => {
      this.props.setMajorsList(responseData.sort((a, b) => {
        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
      }));
    });
  }

  renderMajors(field) {
    const { input, majorsList } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        {error && submitFailed ? <span>{error}</span> : ''}
        <Select
          name='majors'
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          joinValues
          multi
          valueKey='id'
          labelKey='name'
          value={input.value}
          options={majorsList}
          onChange={newMajors => input.onChange(newMajors)}
          isLoading={majorsList ? false : true}
          placeholder="Select your major(s)"
          onBlur={() => input.onBlur(input.value)}
        />
    </div>
    );
  }

  renderGradYear(field) {
    const { input, majorsList } = field;
    const { meta: {submitFailed, error} } = field;
    let options = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < currentYear + 6; i++) {
      options.push({value: i, label: i});
    }

    return (
      <Select
        value={input.value}
        className={error && submitFailed ? 'error' : ''}
        simpleValue
        options={options}
        onChange={newGradYear => input.onChange(newGradYear)}
        placeholder="Select your expected graduation year"
        onBlur={() => input.onBlur(input.value)}
      />
    );
  }

  renderGender(field) {
    const { meta: {submitFailed, error} } = field;
    return (
      <div className={`flex ${error && submitFailed ? 'error' : ''}`}>
        <label>
          <Field
            name="gender"
            component="input"
            type="radio"
            value="m"
          />{' '}
          Male
        </label>
        <label>
          <Field
            name="gender"
            component="input"
            type="radio"
            value="f"
          />{' '}
          Female
        </label>
        <label>
          <Field
            name="gender"
            component="input"
            type="radio"
            value="o"
          />{' '}
          Other
        </label>
      </div>
    );
  }

  onSubmit(values) {
    const client = new API();
    client.patch(`/students/${this.props.userInfo.id}`, values, responseData => {
      localStorage.jwt = responseData.jwt;
      this.props.setUserInfo(responseData.jwt);
      this.props.history.push('/');
    });
  }

  render() {
    const { handleSubmit, history, delUserInfo, userInfo, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
          {userInfo && !userInfo.roles.includes(0) ?
            <div>
              <h4 styleName='banner'>{userInfo.first_name}'s Profile</h4>
              <small>This information is displayed anonymously when posting to give readers a better idea of the demographics of the poster. Your name is kept hidden.</small>
            </div>
            :
            <div>
            <h4 styleName='banner'>Welcome to SCU Evals, {userInfo.first_name}!</h4>
            <p>Before we start, we need to know a few things about you.</p>
            <small>This information is kept anonymous from the public and is only used for statistical purposes.<br/>
            <button type="button" onClick={() => {
              localStorage.removeItem('jwt');
              delUserInfo();
              history.push('/');
              }}
              styleName="signOutBtn">
              Sign Out
            </button>
          </small>
        </div>
          }
        <hr/>
        <div styleName='form-container'>
          <h5>Major(s)</h5>
          <Field
            name='majors'
            component={this.renderMajors}
            majorsList={this.props.majorsList}
          />
          <h5>Expected Graduation Year</h5>
          <Field
            name='graduation_year'
            component={this.renderGradYear}
          />
          <h5>Gender</h5>
          <Field
            name='gender'
            component={this.renderGender}
          />
        </div>
        <button disabled={submitting} style={{marginTop: '35px'}} type="submit" className="btn">{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    );
  }
}


function validate(values) {
  const currentYear = new Date().getFullYear();
  const errors = {};
  if (!values.gender || (values.gender !== 'm' && values.gender !== 'f' && values.gender !=='o')) errors.gender = true;
  if (!values.graduation_year || (values.graduation_year < currentYear || values.graduation_year > currentYear + 5)) errors.graduation_year = true;

  //simpleValue only gives string, so convert to array. Without simpleValue, entire object passed, making comparisons more difficult
  if (values.majors && typeof(values.majors) == 'string') values.majors = values.majors.split(',').map(Number);
  if (!Array.isArray(values.majors) || values.majors.length < 1) errors.majors = true;
  else if (values.majors.length > 3) errors.majors = 'Only up to 3 majors may be declared.';
  else if (values.majors.length > 1 && values.majors.includes(0))  errors.majors = 'Cannot choose "Undeclared" with other majors.';

  return errors;
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    majorsList: state.majorsList,
    initialValues: {
      graduation_year: state.userInfo ? state.userInfo.graduation_year : null,
      majors: state.userInfo ? state.userInfo.majors : null,
      gender: state.userInfo ? state.userInfo.gender : null
    }
  }
}

export default connect(
  mapStateToProps, { setUserInfo, delUserInfo, setMajorsList }
)
(reduxForm({
    validate,
    form:'profile'
})(Profile));
