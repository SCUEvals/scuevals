import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

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
      orderedInfo: null,
      modalOpen: false
    };
  }

  componentWillMount() {
    let client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info, orderedInfo: info }));
  }

  render() {
    const { info, orderedInfo, modalOpen } = this.state;
    return (
      <div className="content">
        <ReactModal isOpen={modalOpen} className='Modal'>
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
        <Eval
          info={info}
          openModal={() => this.setState({modalOpen: true})}
        />
        <br/>
        <br/>
        <Eval
          info={info}
          openModal={() => this.setState({modalOpen: true})}
        />
        <br/>
        <br/>
        <Eval
          info={info}
          openModal={() => this.setState({modalOpen: true})}
        />
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
