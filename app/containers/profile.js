import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';

import { ROOT_URL, requestConfig } from '../actions';

class Profile extends Component {

  componentWillMount() {
    const getMajors = () => {
      axios.get(`${ROOT_URL}/majors`, requestConfig)
      .then(response => {
        for (var i = 0; i < response.data.length; i++) {
          response.data[i].value = response.data[i].id;
          delete response.data[i].id;
          response.data[i].label = response.data[i].name;
          delete response.data[i].name;
        }
        this.setState({majors: response.data});
      });
    }
    getMajors();
  }

  constructor(props) {
    super(props);

    this.state = {
      majors: null,
      gradYear: null
    };
  }

  renderMajor(field) {
    const { input, majors } = field;
    const { meta: { touched, error } } = field;
    return (
      <Select
        name='majors'
        joinValues
        multi
        value={input.value}
        options={majors}
        onChange={val => input.onChange(val)}
        isLoading={majors ? false : true}
        placeholder="Select your major(s)"
        onBlur={() => input.onBlur(input.value)}
      />
    );
  }

  renderGradYear(field) {
    const { input, majors, gradYear, setGradYear, error } = field;
    var options = [];
    const currentYear = new Date().getFullYear();
    for (var i = currentYear; i < currentYear + 6; i ++) {
      options.push({value: i, label: i});
    }
    return (
      <Select
        value={gradYear}
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
    const { error } = field;
    return (
      <div>
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
    var majorIDs = [];
    values.majors.map(obj => majorIDs.push(obj.value));
    values.majors = majorIDs;
    console.log('submitting:', values);
    axios.patch(`${ROOT_URL}/students/${this.props.userInfo.jwt}`, values, requestConfig)
    //.then(this.props.history.push('/'))
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

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
        <h4 className='banner'>Welcome to SCU Evals, {this.props.userInfo.first_name}!</h4>
        <p>Before we start, we need to know a few things about you.</p>
        <small>*This information will help us analyze data for the types of students posting evaluations.</small>
        <hr/>
        <div className='row'>
          <div className='col-12 col-md-6 mx-auto'>
            <h5>Major(s)</h5>
            <Field
              name='majors' //responsible for object's key name for values
              component={this.renderMajor}
              majors={this.state.majors}
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
        </div>
        <button style={{marginTop: '35px'}} type="submit" className="btn">Submit</button>
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
  return errors;
}


function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
  };
}

export default reduxForm({
  validate,
  form: 'searchBar'
})(
  connect(mapStateToProps, null)(Profile)
);
