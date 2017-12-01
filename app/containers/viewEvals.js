import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Eval from '../components/eval';
import API from '../../public/scripts/api_service';

class ViewEvals extends Component {
  componentWillMount() {
    let client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.course_id, response => console.log(response));
  }
  render() {
    return (
      <div className="content">
        <h5>Showing evaluations for (Course/Professor)</h5>
        <br/>
        <Eval />
        <br/>
        <br/>
        <Eval />
        <br/>
        <br/>
        <Eval />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, null)(ViewEvals);
