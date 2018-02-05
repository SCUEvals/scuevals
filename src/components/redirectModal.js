import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class RedirectModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      seconds: 3
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.seconds !== this.state.seconds) {
      if (this.state.seconds === 0) this.props.history.replace('/');
      else setTimeout(() => this.setState({seconds: this.state.seconds - 1}), 1000); //note debounce not appropriate here, new updates shouldn't cancel old debounced function
    }
  }

  render() {
    const { redirectModalOpen, classInfoExists } = this.props;
    const { seconds } = this.state;
    return (
      <ReactModal isOpen={redirectModalOpen} onAfterOpen={() => setTimeout(() => this.setState({seconds: seconds - 1}), 1000)} className='Modal' appElement={document.getElementById('app')}>
        <div className='container'>
          <div className='modalPanel'>
            <div className='modalHeader'>
              <h5>
                <Link className='homeBtn' to='/'><i className='fa fa-home' /></Link>
                {classInfoExists ? 'Oops, looks like you already posted for this class.' : 'Class does not exist for this page.'}
              </h5>
            </div>
          <div className='modalBlock'>
            Redirecting to home in {seconds}...
          </div>
        </div>
      </div>
      </ReactModal>
    );
  }
}

export default RedirectModal;
