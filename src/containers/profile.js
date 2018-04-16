import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';

import { setUserInfo, setMajorsList } from '../actions';
import API from '../services/api';
import '../styles/profile.scss';
import { INCOMPLETE, READ_EVALUATIONS } from '../index';

class Profile extends Component {
  static propTypes = {
    userInfo: PropTypes.object,
    majorsList: PropTypes.object,
    setUserInfo: PropTypes.func.isRequired,
    setMajorsList: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
  }

  renderMajors(field) {
    const { input, majorsList } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        {error && submitFailed ? <span>{error}</span> : ''}
        <Select
          name='majors'
          className={error && submitFailed ? 'select-error' : ''}
          simpleValue
          joinValues
          multi
          valueKey='id'
          labelKey='name'
          value={input.value}
          options={majorsList}
          onChange={newMajors => input.onChange(newMajors)}
          isLoading={!majorsList}
          placeholder='Select your major(s)'
          onBlur={() => input.onBlur(input.value)}
        />
    </div>
    );
  }

  renderGradYear(field) {
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
        placeholder='Select your expected graduation year'
        onBlur={() => input.onBlur(input.value)}
      />
    );
  }

  renderGender(field) {
    const { meta: { submitFailed, error } } = field;
    return (
      <div className={`flex ${error && submitFailed ? 'error' : ''}`}>
        <label>
          <Field
            name='gender'
            component='input'
            type='radio'
            value='m'
          />{' '}
          Male
        </label>
        <label>
          <Field
            name='gender'
            component='input'
            type='radio'
            value='f'
          />{' '}
          Female
        </label>
        <label>
          <Field
            name='gender'
            component='input'
            type='radio'
            value='o'
          />{' '}
          Other
        </label>
      </div>
    );
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

  componentDidMount() {
    if (this.props.userInfo.permissions.includes(INCOMPLETE) || !this.props.userInfo.permissions.includes(READ_EVALUATIONS)) { // don't need to check if majorsList or userInfo exists, majorsList shouldn't exist and userInfo should
      const client = new API();
      client.get('/majors', majorsList => this.props.setMajorsList(majorsList));
    }
  }

  render() {
    const {
      handleSubmit, history, setUserInfo, userInfo, submitting, majorsList,
    } = this.props;
    const incomplete = userInfo.permissions.includes(INCOMPLETE);
    const read_access = userInfo.permissions.includes(READ_EVALUATIONS);
    const profileInfo = 'This information may only be used anonymously for statistical purposes.\nYour name is kept hidden at all times.';
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className='content' >
        {!read_access && (
          <div className='noWriteDiv'>
            <Link className='homeBtn noWriteHomeBtn' to={'/'}>
              <i className='fa fa-home' />
            </Link>
          </div>
        )}
          {!incomplete ?
            <div>
              <h4 className='banner'>{`${userInfo.first_name}'s Profile`}</h4>
              <small>{profileInfo}</small>
            </div>
            :
            <div>
            <h4 className='banner'>Welcome to SCU Evals, {userInfo.first_name}!</h4>
            <p>Before we start, we need to know a few things about you.</p>
            <small>{profileInfo}<br/>
            <button type='button' onClick={() => {
              setUserInfo(null);
              history.push('/');
              }}
              className='signOutBtn'>
              Sign Out
            </button>
          </small>
        </div>
        }
        <hr />
        {!incomplete && (<Link className='btn' to='/profile/evals'>Manage my Evals</Link>)}
        {!incomplete && (<hr />)}
        <div styleName='form-container'>
          <h5>Major(s)</h5>
          <Field
            name='majors'
            component={this.renderMajors}
            majorsList={majorsList ? majorsList.array : null}
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
        <button disabled={submitting} style={{ marginTop: '35px' }} type='submit' className='btn'>{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    );
  }
}


const validate = (values) => {
  const currentYear = new Date().getFullYear();
  const errors = {};
  if (!values.gender || (values.gender !== 'm' && values.gender !== 'f' && values.gender !== 'o')) errors.gender = true;
  if (!values.graduation_year || (values.graduation_year < currentYear || values.graduation_year > currentYear + 5)) errors.graduation_year = true;

  // simpleValue only gives string, so convert to array. Without simpleValue, entire object passed, making comparisons more difficult
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

export default connect(mapStateToProps, { setUserInfo, setMajorsList })(reduxForm({
  validate,
  form: 'profile',
})(Profile));
