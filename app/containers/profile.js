import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import Select from 'react-select';

import { setUserInfo, delUserInfo } from '../actions';
import API from '../../public/scripts/api_service';

class Profile extends Component {

  componentWillMount() {
    const getMajors = () => {
      let client = new API();
      client.get('/majors', responseData => {
        for (var i = 0; i < responseData.length; i++) {
          responseData[i].value = responseData[i].id;
          delete responseData[i].id;
          responseData[i].label = responseData[i].name;
          delete responseData[i].name;
        }
        this.setState({majorsList: responseData});
      })
    };
    getMajors();
  }

  constructor(props) {
    super(props);
    this.state = {
      majorsList: null,
      gradYear: this.props.userInfo ? this.props.userInfo.graduation_year : null
    };
  }

  renderMajors(field) {
    const { input, majorsList } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <Select
        name='majors'
        className={error && submitFailed ? 'error' : ''}
        joinValues
        multi
        value={input.value}
        options={majorsList}
        onChange={val => input.onChange(val)}
        isLoading={majorsList ? false : true}
        placeholder="Select your major(s)"
        onBlur={() => input.onBlur(input.value)}
      />
    );
  }

  renderGradYear(field) {
    const { input, majorsList, gradYear, setGradYear } = field;
    const { meta: {submitFailed, error} } = field;
    let options = [];
    const currentYear = new Date().getFullYear();
    for (var i = currentYear; i < currentYear + 6; i ++) {
      options.push({value: i, label: i});
    }

    return (
      <Select
        value={gradYear}
        className={error && submitFailed ? 'error' : ''}
        simpleValue
        options={options}
        onChange={gradYear => {
          setGradYear(gradYear);
          input.onChange(gradYear);
        }}
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
    var majorIDs = [];
    values.majors.map(obj => majorIDs.push(obj.value));
    values.majors = majorIDs;
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
              <h4 className='banner'>{userInfo.first_name}'s Profile</h4>
              <small>This information is kept anonymous from the public and is only used for statistical purposes.</small>
            </div>
            :
            <div>
            <h4 className='banner'>Welcome to SCU Evals, {userInfo.first_name}!</h4>
            <p>Before we start, we need to know a few things about you.</p>
            <small>This information is kept anonymous from the public and is only used for statistical purposes.<br/>
            <button type="button" onClick={() => {
              localStorage.removeItem('jwt');
              delUserInfo();
              history.push('/');
              }}
              className="signOutBtn">
              Sign Out
            </button>
          </small>
        </div>
          }
        <hr/>
        <div className='form-container'>
          <h5>Major(s)</h5>
          <Field
            name='majors' //responsible for object's key name for values
            component={this.renderMajors}
            majorsList={this.state.majorsList}
          />
          <h5>Expected Graduation Year</h5>
          <Field
            name='graduation_year'
            component={this.renderGradYear}
            setGradYear={gradYear => this.setState({gradYear})}
            gradYear={this.state.gradYear}
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
  if (!values.gender || (values.gender !== 'm' && values.gender !== 'f' && values.gender !=='o')) errors.gender = 'Not a valid gender input.';
  if (!values.graduation_year || (values.graduation_year < currentYear || values.graduation_year > currentYear + 5)) errors.graduation_year = 'Graduation year not in valid range.';
  if (!Array.isArray(values.majors) || values.majors.length < 1) errors.majors = 'Not a valid major selected.';
  if (Array.isArray(values.majors) && values.majors.length > 3) errors.majors = 'To prevent spam, we only allow up to 3 majors declared. Sorry!';
  return errors;
}


function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    initialValues: {
      graduation_year: state.userInfo ? state.userInfo.graduation_year : null,
      majors: state.userInfo ? state.userInfo.majors : null
    }
  }
}

export default reduxForm({
  validate,
  form: 'profile'
})(
  connect(mapStateToProps, { setUserInfo, delUserInfo })(Profile)
);
