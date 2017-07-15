import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { fetchSearch } from '../actions';

class SearchBar extends Component {

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
          <div className="btn" id="myAccount">
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
    //values is object with searchBar: <input>
    //console.log(values);
    this.props.fetchSearch(values, () => {
      this.props.history.push('/');
    });
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <div className="searchBackground">
      <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          label="Read &amp; write SCU Evaluations"
          name="searchBar" //responsible for object's key name for values
          component={this.renderField}
        />
      </form>
      </div>
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

export default reduxForm({
  validate,
  form: 'searchBar'
})(
  connect(null,{ fetchSearch })(SearchBar)
);
