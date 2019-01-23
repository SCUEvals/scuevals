import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

const getErrorMsg = (status) => {
  switch (status) {
  case 403:
    return (
      `This email is not associated with SCU and is not currently whitelisted.
      Please try again with either a student, alumni, or faculty email address.`
    );
  default:
    // including 500
    return (
      `Looks like something happened that caused an error.
      We're sorry we couldn't process it, but we've been notified and will try to resolve it in the future.`
    );
  }
};

const ErrorModal = (props) => {
  const { closeErrorModal, error } = props;
  return (
    <ReactModal isOpen={!!error} className="reactModal container" appElement={document.getElementById('app')}>
      <div className="modalWrapper">
        <div className="modalHeader">
          <h5>Oops!</h5>
          <i
            role="button"
            tabIndex="0"
            className="fa fa-times"
            onClick={closeErrorModal}
            onKeyPress={(event) => {
              if (event.key === 'Enter') closeErrorModal();
            }}
          />
        </div>
        <div className="modalBlock">
          {getErrorMsg(error && error.response && error.response.status)}
        </div>
      </div>
    </ReactModal>
  );
};

ErrorModal.propTypes = {
  error: PropTypes.instanceOf(Error),
  closeErrorModal: PropTypes.func.isRequired,
};

export default ErrorModal;
