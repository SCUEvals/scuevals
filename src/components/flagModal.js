import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

class FlagModal extends Component {

  static propTypes = {
    flagModalOpen: PropTypes.bool.isRequired,
    closeFlagModal: PropTypes.func.isRequired
  }

  render() {
    const { flagModalOpen, closeFlagModal } = this.props;
    return (
      <ReactModal isOpen={flagModalOpen} className='Modal' appElement={document.getElementById('app')}>
        <div className='container'>
        <div className='modalPanel'>
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
            Flagging options coming soon!
          </div>
        </div>
      </div>
      </ReactModal>
    );
  }
}

export default FlagModal;
