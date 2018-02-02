import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';

class ViewMyEvals extends Component {

  static defaultProps = {
    type: PropTypes.string,
    match: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      info: null,
      orderedInfo: null,
      modalOpen: false
    };
  }

  render() {
    const { info, orderedInfo, modalOpen } = this.state;
    const { userInfo, myEvalsList, departmentsList, quartersList } = this.props;
    return (
      <div className="content">
        <ReactModal isOpen={modalOpen} className='Modal' appElement={document.getElementById('app')}>
          <div className='container'>
          <div className='modalPanel'>
            <div className='modalHeader'>
              <h5>Are you sure?</h5>
              <i tabIndex='0' className='fa fa-times'
                onClick={() => this.setState({modalOpen: false})}
                onKeyPress={event => {
                  if (event.key === 'Enter') this.setState({modalOpen: false});
                }}
              />
            </div>
            <div className='modalBlock'>
              Are you sure you want to delete this post?
            </div>
          </div>
        </div>
        </ReactModal>
        <h4 className='banner'>{userInfo.first_name}'s Evals</h4>
        <Select
          className='sort'
          simpleValue
          options={null}
          placeholder="Sort"
        />
        {myEvalsList ?
           myEvalsList.length === 0 ?
            'You haven\'t posted anything yet.'
          : myEvalsList.map(evaluation => { return <Eval key={evaluation.id} evaluation={evaluation} quartersList={quartersList} departmentsList={departmentsList} openModal={() => this.setState({modalOpen: true})}/> })
        : <h5>Loading...</h5>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    myEvalsList: state.myEvalsList,
    departmentsList: state.departmentsList,
    quartersList: state.quartersList
  };
}

export default connect(mapStateToProps, null)(ViewMyEvals);
