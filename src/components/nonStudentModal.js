import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

class NonStudentModal extends Component {
  static propTypes = {
    nonStudentModalOpen: PropTypes.bool.isRequired,
    closeNonStudentModal: PropTypes.func.isRequired,
  }

  render() {
    const { nonStudentModalOpen, closeNonStudentModal } = this.props;
    return (
      <ReactModal isOpen={nonStudentModalOpen} className="reactModal container" appElement={document.getElementById('app')}>
        <div className="modalWrapper">
          <div className="modalHeader">
            <h5>Welcome to SCU Evals!</h5>
            <i
              tabIndex="0"
              className="fa fa-times"
              onClick={closeNonStudentModal}
              onKeyPress={(event) => {
                if (event.key === 'Enter') closeNonStudentModal();
              }}
            />
          </div>
          <div className="modalBlock">
            Since you {'aren\'t'} a student, you {'won\'t'} be able to vote on or post evaluations,
            but {'you\'re'} welcome to browse and read all of the evaluations.
          </div>
        </div>
      </ReactModal>
    );
  }
}

export default NonStudentModal;
