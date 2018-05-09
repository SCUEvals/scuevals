import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';

import API from '../services/api';
import Checkbox from '../components/checkbox';

class FlagModal extends Component {
  static propTypes = {
    flagModalOpen: PropTypes.bool.isRequired,
    closeFlagModal: PropTypes.func.isRequired,
    evalID: PropTypes.number,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitFailed: PropTypes.bool.isRequired,
    comment: PropTypes.string,
    error: PropTypes.string,
    setUserFlagged: PropTypes.func,
    userFlagged: PropTypes.bool,
  }

  /* inputs with only numbers as strings breaks redux form, so add '_val' at end (removed when using
     parseInt) */
  static OTHER = '0_val';
  static SPAM = '1_val';
  static OFFENSIVE = '2_val';
  static SENSITIVE_INFO = '3_val';

  static renderTextArea(field) {
    const { meta: { submitFailed, error } } = field;
    return (
      <TextareaAutoSize
        style={{ margin: '0 auto', display: 'block' }}
        className={submitFailed && error ? 'comment-error' : ''}
        minRows={2}
        {...field.input}
        placeholder="Write your reasons here"
      />
    );
  }

  static renderCheckbox(field) {
    const onKeyDown = (event) => {
      switch (event.keyCode) {
      case 38: { // up
        event.preventDefault(); // stop scrolling
        const nodes = $('#flagModal input[type="checkbox"]');
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === event.target) {
            if (i - 1 >= 0) nodes[i - 1].focus();
            break;
          }
        }
        break;
      }

      case 40: { // down
        event.preventDefault(); // stop scrolling
        const nodes = $('#flagModal input[type="checkbox"]');
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === event.target) {
            if (i + 1 < nodes.length) nodes[i + 1].focus();
            else $('#flagModal textarea').focus();
            break;
          }
        }
        break;
      }
      default:
        break;
      }
    };
    return (
      <Checkbox field={field} onKeyDown={onKeyDown} />
    );
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.flagModalOpen && this.props.flagModalOpen) {
      $('#flagModal input[type="checkbox"]').first().focus();
    }
  }

  onSubmit(values) {
    const {
      OTHER, SPAM, OFFENSIVE, SENSITIVE_INFO,
    } = this.constructor;
    const { setUserFlagged, closeFlagModal, evalID } = this.props;
    const client = new API();
    const arr = [];
    if (values[OTHER]) arr.push(parseInt(OTHER, 10));
    if (values[SPAM]) arr.push(parseInt(SPAM, 10));
    if (values[OFFENSIVE]) arr.push(parseInt(OFFENSIVE, 10));
    if (values[SENSITIVE_INFO]) arr.push(parseInt(SENSITIVE_INFO, 10));
    const sendingObj = { reason_ids: arr, comment: values.comment };
    return client.post(`/evaluations/${evalID}/flag`, sendingObj, () => {
      setUserFlagged();
      closeFlagModal();
    });
  }

  render() {
    const {
      flagModalOpen,
      closeFlagModal,
      handleSubmit,
      submitting,
      submitFailed,
      comment,
      error,
      userFlagged,
    } = this.props;
    const {
      OTHER, SPAM, OFFENSIVE, SENSITIVE_INFO,
    } = this.constructor;
    return (
      <ReactModal
        isOpen={flagModalOpen}
        className="reactModal container"
        appElement={document.getElementById('app')}
      >
        <div id="flagModal" className="modalWrapper">
          <div className="modalHeader">
            <h5>Flag comment</h5>
            <i
              role="button"
              tabIndex="0"
              className="fa fa-times"
              onClick={closeFlagModal}
              onKeyPress={(event) => {
                if (event.key === 'Enter') closeFlagModal();
              }}
            />
          </div>
          <div className="modalBlock">
            <p
              style={{
                fontStyle: 'italic',
                maxHeight: '53px',
                overflow: 'auto',
                padding: '0 15px',
              }}
            >
              {comment}
            </p>
            <hr />
            {userFlagged ?
              'You have already flagged this evaluation.'
              :
              <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <p>
                  To flag an evaluation, please fill the form below and we will do our best to take
                  appropriate action if deemed necessary.
                </p>
                <hr />
                <div style={{ marginBottom: '15px' }}>
                  <span
                    style={{ fontSize: '1.1rem', padding: '5px', marginBottom: '5px' }}
                    className={error && submitFailed ? 'error' : 'no-error'}
                  >
                    Check all boxes that apply
                  </span>
                </div>
                <div className="checkbox-group">
                  <Field name={SPAM} component={FlagModal.renderCheckbox} text="Spam" />
                  <br />
                  <Field name={OFFENSIVE} component={FlagModal.renderCheckbox} text="Offensive" />
                  <br />
                  <Field name={SENSITIVE_INFO} component={FlagModal.renderCheckbox} text="Sensitive Info" />
                  <br />
                  <Field name={OTHER} component={FlagModal.renderCheckbox} text="Other" />
                </div>
                <br />
                <Field
                  name="comment"
                  component={FlagModal.renderTextArea}
                />
                <button
                  disabled={submitting}
                  type="submit"
                  className="btn"
                  onKeyDown={(event) => {
                    // up
                    if (event.keyCode === 38) $('#flagModal textarea').focus();
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            }
          </div>
        </div>
      </ReactModal>
    );
  }
}

const validate = (values) => {
  const errors = {};
  if (
    !values[FlagModal.OTHER]
    && !values[FlagModal.SPAM]
    && !values[FlagModal.OFFENSIVE]
    && !values[FlagModal.SENSITIVE_INFO]
    // eslint-disable-next-line no-underscore-dangle
  ) errors._error = 'Must select at least one'; // must be _error (supported in redux form API)
  else if (values[FlagModal.OTHER] && !values.comment) errors.comment = 'Must describe other reason';
  return errors;
};

export default reduxForm({
  validate,
  form: 'flagEval',
})(FlagModal);
