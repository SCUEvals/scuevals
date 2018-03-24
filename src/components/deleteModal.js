import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

class DeleteModal extends Component {

  static propTypes = {
    deleteModalOpen: PropTypes.bool.isRequired,
    closeDeleteModal: PropTypes.func.isRequired,
    deletePost: PropTypes.func.isRequired,
    quarter: PropTypes.string,
    course: PropTypes.string,
    professor: PropTypes.string
  }

  render() {
    const { deleteModalOpen, closeDeleteModal, quarter, course, professor, deletePost } = this.props;
    return (
      <ReactModal isOpen={deleteModalOpen} className='reactModal container' appElement={document.getElementById('app')}>
        <div className='modalWrapper'>
          <div className='modalHeader'>
            <h5>Delete post</h5>
            <i tabIndex='0' className='fa fa-times'
              onClick={closeDeleteModal}
              onKeyPress={event => {
                if (event.key === 'Enter') closeDeleteModal();
              }}
            />
          </div>
          <div className='modalBlock'>
            <div>{quarter}</div>
            <div>{course}</div>
            <div>{professor}</div>
            <hr />
            <div>Are you sure you want to delete this post?</div>
            <button
              style={{width: "65px"}}
              type='button'
              className='btn'
              onClick={() => {deletePost(); closeDeleteModal();}}
              onKeyPress={event => {
                if (event.key === 'Enter') event.target.click();
              }}
            >Yes</button>
            <button
              style={{width: "65px"}}
              type='button'
              className='btn'
              onClick={closeDeleteModal}
              onKeyPress={event => {
                if (event.key === 'Enter') event.target.click();
              }}
            >No</button>
          </div>
        </div>
      </ReactModal>
    );
  }
}

export default DeleteModal;
