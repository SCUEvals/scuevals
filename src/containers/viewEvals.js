import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';

import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';

class ViewEvals extends Component {

  static defaultProps = {
    type: PropTypes.string,
    match: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      info: null,
      orderedInfo: null
    };
  }

  componentWillMount() {
    let client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info, orderedInfo: info }));
  }

  render() {
    const { info, orderedInfo } = this.state;
    return (
      <div className="content">
        <h2>
          {info ?
            this.props.type === 'professors' ?
              info.first_name + ' ' + info.last_name
              : info.department.abbreviation + ' ' + info.name + ': ' + info.title
            : 'Loading...'
          }
        </h2>
          <div className='row'>
          <div className='col-xs-12 col-sm-4 col-md-3 col-lg-2'>
            <div styleName='scoreTitle'>Average</div>
            <svg styleName='score1'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                1
              </text>
            </svg>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-3 col-lg-2'>
            <div styleName='scoreTitle'>Attitude</div>
            <svg styleName='score2'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                2
              </text>
            </svg>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-3 col-lg-2'>
            <div styleName='scoreTitle'>Availability</div>
            <svg styleName='score3'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                3
              </text>
            </svg>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-3 col-lg-2'>
            <div styleName='scoreTitle'>Clarity</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
      </div>
        <Select
          className='sort'
          simpleValue
          options={null}
          placeholder="Sort"
        />
        <br/>
        <Eval info={info} />
        <br/>
        <br/>
        <Eval info={info} />
        <br/>
        <br/>
        <Eval info={info} />
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
