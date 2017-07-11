import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { getSearchData } from '../actions';

class Searchbar extends Component {

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
            placeholder='Search for lecturers or classes'
            {...field.input}
          />
          <div className="input-group-btn">
            <button type="submit" className="btn btn-primary"><i className="fa fa-search" /></button>
          </div>
          <div className="btn">
            Sign in
          </div>
        </div>
        <div className="text-help">
          {touched ? error : ''}
        </div>
      </div>
    );
  }

  onSubmit(values) {
    //values is object with searchbar: <input>
    //console.log(values);
    this.props.getSearchData(values, () => {
      this.props.history.push('/');
    });
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <div className="searchBackground">
      <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          label="Find or write SCU Evaluations"
          name="searchbar" //responsible for object's key name for values
          component={this.renderField}
        />
      </form>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};
  if (!values.searchbar || values.searchbar.length < 3) {
    errors.searchbar = "Enter at least 3 characters";
  }
  return errors;
}

export default reduxForm({
  validate,
  form: 'searchbar'
})(
  connect(null,{ getSearchData })(Searchbar)
);
