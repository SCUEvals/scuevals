import React, { Component } from 'react';
import ReactModal from 'react-modal';
import API from '../services/api';
import PropTypes from 'prop-types';

import '../styles/deleteModal.scss';

class DeleteModal extends Component {

  render() {
    const { deleteModalOpen, closeDeleteModal, quarter, course, professor, eval_id, deletePost } = this.props;
    return (
      <ReactModal isOpen={deleteModalOpen} className='Modal' appElement={document.getElementById('app')}>
        <div className='container'>
        <div className='modalPanel'>
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
            <button type='button'
               className='btn'
               onClick={() => {deletePost(); closeDeleteModal();}}
               onKeyPress={event => {
                 if (event.key === 'Enter') event.target.click();
               }}
            >Yes</button>
            <button type='button'
              className='btn'
              onClick={closeDeleteModal}
              onKeyPress={event => {
                if (event.key === 'Enter') event.target.click();
              }}
            >No</button>
          </div>
        </div>
      </div>
      </ReactModal>
    );
  }
}

export default DeleteModal;
