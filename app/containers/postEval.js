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
      <div className="container">
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
          <h6>Overall difficulty</h6>
          {this.renderRadios("difficulty")}
          <h6>Overall satisfaction with the course</h6>
          {this.renderRadios("satisfaction")}
          <h6>Comments</h6>
          <Field name="comments" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
          <p>Max characters: {this.state.term.length} / 750</p>
          <hr />
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
