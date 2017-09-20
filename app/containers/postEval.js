import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { postEval } from '../actions';
import TextareaAutoSize from 'react-textarea-autosize';

class PostEval extends Component {

  constructor(props) {
    super(props);

    this.state = { term: '' };
  }

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
        <div className="form-check form-check-inline">
          <label className="form-check-label">
            <Field name={name} component="input" type="radio" value="5" />
            {' 5'}
          </label>
        </div>
      </div>
      <hr />
    </div>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    console.log(values);
    this.props.postEval(values, () => {
      this.props.history.push('/');
    });
  }

  renderTextArea(field) {
    return (
      <TextareaAutoSize minRows={3} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  render() {
    const { handleSubmit } = this.props;

    return (
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
          <h6>Handwriting</h6>
          {this.renderRadios("handwriting")}
          <h6>Easy to Understand</h6>
          {this.renderRadios("clarity")}
          <h6>Availability</h6>
          {this.renderRadios("availability")}
          <h6>Timeliness</h6>
          {this.renderRadios("timeliness")}
          <h6>Online Accessibility</h6>
          {this.renderRadios("accessibility")}
          <h6>Would you take this professor again?</h6>
          {this.renderRadios("retakeability")}
          <h6>Comments</h6>
          <Field name="comments" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
          <p>Max characters: {this.state.term.length} / 750</p>
          <hr />
          <button type="submit" className="btn">Submit</button>
        </form>
    );
  }
}

export default reduxForm({
  form: 'postEval'
})(
  connect(null,{ postEval })(PostEval)
);
