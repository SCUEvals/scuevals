import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Eval from '../components/eval';
import API from '../services/api';

class ViewEvals extends Component {

  static defaultProps = {
    type: PropTypes.string,
    match: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = { info: null };
  }

  componentWillMount() {
    let client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info }));
  }

  render() {
    const { info } = this.state;
    return (
      <div className="content">
        <h5>{info ? `Showing evaluations for
                    ${this.props.type === 'professors' ?
                      info.first_name + ' ' + info.last_name
                    : info.department.abbreviation + ' ' + info.name + ': ' + info.title
                    }`
            : 'Loading...'
            }
        </h5>
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
