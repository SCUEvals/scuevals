import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

class NonStudentModal extends Component {

  static propTypes = {
    nonStudentModalOpen: PropTypes.bool.isRequired,
    closeNonStudentModal: PropTypes.func.isRequired
  }

  render() {
    const { nonStudentModalOpen, closeNonStudentModal } = this.props;
    return (
      <ReactModal isOpen={nonStudentModalOpen} className='reactModal container' appElement={document.getElementById('app')}>
        <div className='modalWrapper'>
          <div className='modalHeader'>
            <h5>Notice!</h5>
            <i tabIndex='0' className='fa fa-times'
              onClick={closeNonStudentModal}
              onKeyPress={event => {
                if (event.key === 'Enter') closeNonStudentModal();
              }}
            />
          </div>
          <div className='modalBlock'>
            We noticed that you {`aren't`} a student at SCU, but you still have an SCU email account. Therefore, you will be given
            full reading rights to the website, but you will not be able to manipulate data shared by students.
          </div>
        </div>
      </ReactModal>
    );
  }
}

export default NonStudentModal;
