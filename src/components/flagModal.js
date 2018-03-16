import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';

import API from '../services/api';

class FlagModal extends Component {

  static propTypes = {
    flagModalOpen: PropTypes.bool.isRequired,
    closeFlagModal: PropTypes.func.isRequired
  }

  onSubmit(values) {
    const { quarter_id, course_id, professor_id } = this.props.match.params;
    const { display_majors, display_grad_year } = values;
    let evaluation = {...values};
    let sendingObj = { quarter_id, course_id, professor_id, display_majors, display_grad_year, evaluation };
    const client = new API();
    return client.post('/evaluations', sendingObj, responseData => {
      this.setState({submitted: true});
      ReactGA.event({category: 'Evaluation', action: 'Submitted'});
    });
  }

  renderTextArea(field) {
    const { meta: {submitFailed, error} } = field;
    return (
      <TextareaAutoSize className={submitFailed && error ? 'comment-error' : ''} minRows={2} {...field.input} placeholder="Write your reasons here"/>
    )
  }

  render() {
    const { flagModalOpen, closeFlagModal, handleSubmit, submitting } = this.props;
    return (
      <ReactModal isOpen={flagModalOpen} className='Modal' appElement={document.getElementById('app')}>
        <div className='modalHeader'>
          <h5>Flag comment</h5>
          <i tabIndex='0' className='fa fa-times'
            onClick={closeFlagModal}
            onKeyPress={event => {
              if (event.key === 'Enter') closeFlagModal();
            }}
          />
        </div>
        <div className='modalBlock'>
          <p>To flag an evaluation, please fill the form below and we will do our best to take appropriate action if deemed necessary.</p>
          <hr />
          <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <p style={{fontSize: '1.1rem'}}>Check all boxes that apply</p>
            <label>
              Offensive
              <Field name='offensive' component='input' type='checkbox' />
            </label>
            <Field name="comment" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
            <button disabled={submitting} type="submit" className="btn">{submitting ? 'Submitting...' : 'Submit'}</button>
          </form>
        </div>
      </ReactModal>
    );
  }
}

const validate = values => {
  const errors = {};
  if (!values.attitude) errors.attitude = 'Required';
  if (!values.availability) errors.availability = 'Required';
  if (!values.clarity) errors.clarity = 'Required';
  if (!values.comment) errors.comment = 'Required';
  if (values.comment && values.comment.length > 1000) 'Message longer than 1000 characters.';
  if (!values.easiness) errors.easiness = 'Required';
  if (!values.grading_speed) errors.grading_speed = 'Required';
  if (!values.recommended) errors.recommended = 'Required';
  if (!values.resourcefulness) errors.resourcefulness = 'Required';
  if (!values.workload) errors.workload = 'Required';
  return errors;
}

export default reduxForm({
  validate,
  form: 'flagEval'
})(FlagModal);
