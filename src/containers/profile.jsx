import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';

import { setUserInfoAction, setMajorsListAction } from '../actions';
import API from '../services/api';
import '../styles/profile.scss';
import { INCOMPLETE, READ_EVALUATIONS } from '../index';
import { userInfoPT, majorsListPT, historyPT, locationPT } from '../utils/propTypes';

class Profile extends Component {
  static propTypes = {
    userInfo: userInfoPT,
    majorsList: majorsListPT,
    setUserInfo: PropTypes.func.isRequired,
    setMajorsList: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    history: historyPT,
    handleSubmit: PropTypes.func.isRequired,
    location: locationPT,
  }

  static renderGradYear(field) {
    const { input } = field;
    const { meta: { submitFailed, error } } = field;
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < currentYear + 6; i++) options.push({ value: i, label: i });

    return (
      <Select
        value={input.value}
        className={error && submitFailed ? 'select-error' : undefined}
        simpleValue
        options={options}
        onChange={newGradYear => input.onChange(newGradYear)}
        placeholder="Select your expected graduation year"
        onBlur={() => input.onBlur(input.value)}
      />
    );
  }

  static renderGender(field) {
    const { meta: { submitFailed, error } } = field;
    return (
      <div className={`flex ${error && submitFailed ? 'error' : ''}`}>
        <label htmlFor="male">
          <Field
            id="male"
            name="gender"
            component="input"
            type="radio"
            value="m"
          />{' '}
          Male
        </label>
        <label htmlFor="other">
          <Field
            id="female"
            name="gender"
            component="input"
            type="radio"
            value="f"
          />{' '}
          Female
        </label>
        <label htmlFor="female">
          <Field
            id="other"
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

  static renderMajors(field) {
    const { input, majorsListArr } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <Fragment>
        {error && submitFailed && <span>{error}</span>}
        <Select
          name="majors"
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          joinValues
          multi
          valueKey="id"
          labelKey="name"
          value={input.value}
          options={majorsListArr}
          onChange={input.onChange}
          isLoading={!majorsListArr}
          placeholder="Select your major(s)"
        />
      </Fragment>
    );
  }

  componentDidMount() {
    /* don't need to check if majorsList or userInfo exists, majorsList shouldn't exist and userInfo
       should if statement below true */
    if (this.props.userInfo.permissions.includes(INCOMPLETE)
     || !this.props.userInfo.permissions.includes(READ_EVALUATIONS)
    ) {
      const client = new API();
      client.get('/majors', majorsList => this.props.setMajorsList(majorsList));
    }
  }

  onSubmit(values) {
    const client = new API();
    return client.patch(`/students/${this.props.userInfo.id}`, values, (responseData) => {
      if (this.props.userInfo.permissions.includes(INCOMPLETE)) ReactGA.event({ category: 'User', action: 'Completed Profile' });
      this.props.setUserInfo(responseData.jwt);
      if (this.props.location.state) this.props.history.push(this.props.location.state.referrer);
      else this.props.history.push('/');
    });
  }

  render() {
    const {
      handleSubmit, history, setUserInfo, userInfo, submitting, majorsList,
    } = this.props;
    const incomplete = userInfo.permissions.includes(INCOMPLETE);
    const readAccess = userInfo.permissions.includes(READ_EVALUATIONS);
    const profileInfo = 'This information may only be used anonymously for statistical purposes.\nYour name is kept hidden at all times.';
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} styleName="profile" className="content" >
        {!readAccess && (
          <div className="noWriteDiv">
            <Link className="homeBtn noWriteHomeBtn" to="/">
              <i className="fa fa-home" />
            </Link>
          </div>
        )}
        {!incomplete ?
          <div>
            <h4 className="banner">{`${userInfo.first_name}'s Profile`}</h4>
            <small>{profileInfo}</small>
          </div>
          :
          <div>
            <h4 className="banner">Welcome to SCU Evals, {userInfo.first_name}!</h4>
            <p>Before we start, we need to know a few things about you.</p>
            <small>{profileInfo}<br />
              <button
                type="button"
                onClick={() => {
                  setUserInfo(null);
                  history.push('/');
                }}
                className="signOutBtn"
              >
              Sign Out
              </button>
            </small>
          </div>
        }
        <hr />
        {!incomplete && (<Link className="btn" to="/profile/evals">Manage my Evals</Link>)}
        {!incomplete && (<hr />)}
        <div styleName="form-container">
          <h5>Major(s)</h5>
          <Field
            name="majors"
            component={Profile.renderMajors}
            majorsListArr={majorsList ? majorsList.array : undefined}
          />
          <h5>Expected Graduation Year</h5>
          <Field
            name="graduation_year"
            component={Profile.renderGradYear}
          />
          <h5>Gender</h5>
          <Field
            name="gender"
            component={Profile.renderGender}
          />
        </div>
        <button disabled={submitting} type="submit" className="btn">
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    );
  }
}


const validate = (values) => {
  const currentYear = new Date().getFullYear();
  const errors = {};
  if (!values.gender || (values.gender !== 'm' && values.gender !== 'f' && values.gender !== 'o')) errors.gender = true;
  if (!values.graduation_year
    || (values.graduation_year < currentYear || values.graduation_year > currentYear + 5)
  ) errors.graduation_year = true;

  /* simpleValue only gives string, so convert to array. Without simpleValue, entire object passed,
     making comparisons more difficult */
  if (values.majors && typeof (values.majors) === 'string') values.majors = values.majors.split(',').map(Number);
  if (!Array.isArray(values.majors) || values.majors.length < 1) errors.majors = true;
  else if (values.majors.length > 3) errors.majors = 'Only up to 3 majors may be declared.';
  else if (values.majors.length > 1 && values.majors.includes(0)) errors.majors = 'Cannot choose "Undeclared" with other majors.';

  return errors;
};

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  majorsList: state.majorsList,
  initialValues: {
    graduation_year: state.userInfo ? state.userInfo.graduation_year : null,
    majors: state.userInfo ? state.userInfo.majors : null,
    gender: state.userInfo ? state.userInfo.gender : null,
  },
});

const mapDispatchToProps = {
  setUserInfo: setUserInfoAction,
  setMajorsList: setMajorsListAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  validate,
  form: 'profile',
})(Profile));
