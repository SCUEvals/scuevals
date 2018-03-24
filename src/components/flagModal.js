import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';

import API from '../services/api';

class FlagModal extends Component {

  static propTypes = {
    flagModalOpen: PropTypes.bool.isRequired,
    closeFlagModal: PropTypes.func.isRequired,
    evalId: PropTypes.number,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitFailed: PropTypes.bool.isRequired,
    comment: PropTypes.string,
    error: PropTypes.string
  }

  //inputs with only numbers as strings breaks redux form, so add "_val" at end (removed when using parseInt)
  static OTHER = '0_val';
  static SPAM = '1_val';
  static OFFENSIVE = '2_val';
  static SENSITIVE_INFO = '3_val';

  onSubmit(values) {
    const {OTHER, SPAM, OFFENSIVE, SENSITIVE_INFO} = this.constructor;
    const client = new API();
    const arr = [];
    if (values[OTHER]) arr.push(parseInt(OTHER));
    if (values[SPAM]) arr.push(parseInt(SPAM));
    if (values[OFFENSIVE]) arr.push(parseInt(OFFENSIVE));
    if (values[SENSITIVE_INFO]) arr.push(parseInt(SENSITIVE_INFO));
    const sendingObj = {reason_ids: arr};
    return client.post(`/evaluations/${this.props.evalId}/flag`, sendingObj, this.props.closeFlagModal);
  }

  renderTextArea(field) {
    const { meta: {submitFailed, error} } = field;
    return (
      <TextareaAutoSize
        style={{margin: '0 auto', display: 'block'}}
        className={submitFailed && error ? 'comment-error' : ''}
        minRows={2} {...field.input}
        placeholder='Write your reasons here'
      />
    )
  }

  render() {
    const { flagModalOpen, closeFlagModal, handleSubmit, submitting, submitFailed, comment, evalId, error } = this.props;
    const {OTHER, SPAM, OFFENSIVE, SENSITIVE_INFO} = this.constructor;
    return (
      <ReactModal isOpen={flagModalOpen} className='reactModal container' appElement={document.getElementById('app')}>
        <div className='modalWrapper'>
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
            <p style={{fontStyle: 'italic', maxHeight: '53px', overflow: 'auto', padding: '0 15px'}}>{comment}</p>
            <hr />
            <p>To flag an evaluation, please fill the form below and we will do our best to take appropriate action if deemed necessary.</p>
            <hr />
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
              <div style={{marginBottom: '15px'}}>
                <span style={{fontSize: '1.1rem', padding: '5px', marginBottom: '5px'}} className={error && submitFailed ? 'error' : 'no-error'}>
                  Check all boxes that apply
                </span>
              </div>
              <label>
                Spam
                <Field name={SPAM} component='input' type='checkbox' />
              </label>
              <br />
              <label>
                Offensive
                <Field name={OFFENSIVE} component='input' type='checkbox' />
              </label>
              <br />
              <label>
                Sensitive Info
                <Field name={SENSITIVE_INFO} component='input' type='checkbox' />
              </label>
              <br />
              <label>
                Other
                <Field name={OTHER} component='input' type='checkbox' />
              </label>
              <br />
              <Field name='comment' onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
              <button disabled={submitting} type='submit' className='btn'>{submitting ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        </div>
      </ReactModal>
    );
  }
}

const validate = values => {
  const errors = {};
  if (Object.keys(values).length === 0 && values.constructor === Object) errors._error = 'Must select at least one'; //must be _error (supported in redux form API)
  else if (values[FlagModal.OTHER] && !values.comment) errors.comment = 'Must describe other reason';
  return errors;
}

export default reduxForm({
  validate,
  form: 'flagEval'
})(FlagModal);
