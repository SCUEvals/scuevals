import React, { Component } from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';

class NonStudentModal extends Component {

  render() {
    const { nonStudentModalOpen, closeNonStudentModal } = this.props;
    return (
      <ReactModal isOpen={nonStudentModalOpen} className='Modal' appElement={document.getElementById('app')}>
        <div className='container'>
        <div className='modalPanel'>
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
            We noticed that you aren't a student at SCU. Temporarily, we are only allowing SCU students
            access to the platform, but we will soon grant viewing access to non-SCU students with an SCU
            email. If you feel this was a mistake, please contact us at <a href='mailto:scuevalsteam@gmail.com'>scuevalsteam@gmail.com</a>.
            Sorry for the inconvenience.
          </div>
        </div>
      </div>
      </ReactModal>
    );
  }
}

export default NonStudentModal;
