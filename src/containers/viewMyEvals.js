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

  // componentWillMount() {
  //   let client = new API();
  //   client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info, orderedInfo: info }));
  // }

  render() {
    const { info, orderedInfo, modalOpen } = this.state;
    const { userInfo } = this.props;
    return (
      <div className="content">
        <ReactModal isOpen={modalOpen} className='Modal' appElement={document.getElementById('app')}>
          <div className='container'>
          <div className='modalPanel'>
            <div className='modalHeader'>
              <h5>Flag comment</h5>
              <i tabIndex='0' className='fa fa-times'
                onClick={() => this.setState({modalOpen: false})}
                onKeyPress={event => {
                  if (event.key === 'Enter') this.setState({modalOpen: false});
                }}
              />
            </div>
            <div className='modalBlock'>
              Content
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
        <br/>
        {info ? info.evaluations.map(evaluation => { return <Eval key={evaluation.id} evaluation={evaluation} openModal={() => this.setState({modalOpen: true})}/> }) : ''}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, null)(ViewMyEvals);
