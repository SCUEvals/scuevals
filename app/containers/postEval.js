  import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { postEval } from '../actions';

class PostEval extends Component {

  renderRadios(name) {
    return (
      <div>
      <div className="form-check form-check-inline">
        <label className="form-check-label">
          <Field name={name} component="input" type="radio" value="1" />
          {' 1'}
        </label>
      </div>
      <div className="form-check form-check-inline">
        <label className="form-check-label">
          <Field name={name} component="input" type="radio" value="2" />
          {' 2'}
        </label>
      </div>
      <div className="form-check form-check-inline">
        <label className="form-check-label">
          <Field name={name} component="input" type="radio" value="3" />
          {' 3'}
        </label>
      </div>
      <div className="form-check form-check-inline">
        <label className="form-check-label">
          <Field name={name} component="input" type="radio" value="4" />
          {' 4'}
        </label>
      </div>
      <hr />
    </div>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    //console.log(values);
    this.props.postEval(values, () => {
      this.props.history.push('/');
    });
  }
  render() {
    const { handleSubmit } = this.props;

    return (
      <div className="container">
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
        Overall difficulty {this.renderRadios("difficulty")}
        Overall satisfaction with the course {this.renderRadios("satisfcation")}
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
    );
  }
}

export default reduxForm({
  form: 'postEval'
})(
  connect(null,{ postEval })(PostEval)
);
