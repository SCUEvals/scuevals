import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { setDepartmentsList, setQuartersList, setMajorsList } from '../actions';

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
    if (!this.props.departmentsList) client.get('/departments', departmentsList => this.props.setDepartmentsList(departmentsList));
    if (!this.props.quartersList) client.get('/quarters', quartersList => this.props.setQuartersList(quartersList));
    if (!this.props.majorsList) client.get('/majors', majorsList => this.props.setMajorsList(majorsList));
  }

  componentWillUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({info: null}, () => {
        let client = new API();
        client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info, orderedInfo: info }));
      });
    }
  }

  calculatePath(n) { //n in range 1-4
    //circumference r=25, 25*2*pi = 157.080
    return  157.08 - (n / 4 * 157.08);
  }

  render() { //1-1.74 score1, 1.75-2.49 score2, 2.50-3.24 score3, 3.25-4 score4
    const { info, orderedInfo, modalOpen } = this.state;
    const { majorsList, quartersList, departmentsList } = this.props;
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
        <h2>
          {info ?
            this.props.type === 'professors' ?
              info.first_name + ' ' + info.last_name
              : departmentsList ?
                departmentsList[info.department_id].abbr + ' ' + info.number + ': ' + info.title
              : 'Loading...'
            : 'Loading...'
          }
        </h2>
        <div className='row' styleName='scores'>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Average</div>
            <svg styleName='score1'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(1.3)}} />
              <text x='50%' y='50%'>
                1.3
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Recommend?</div>
            <svg styleName='score3'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(2.6)}} />
              <text x='50%' y='50%'>
                2.6
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Difficulty</div>
            <svg styleName='score4'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(3.8)}} />
              <text x='50%' y='50%'>
                3.8
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Workload</div>
            <svg styleName='score2'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(2.1)}} />
              <text x='50%' y='50%'>
                2.1
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Grading Speed</div>
            <svg styleName='score4'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(3.4)}} />
              <text x='50%' y='50%'>
                3.4
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Clarity</div>
            <svg styleName='score2'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(1.9)}} />
              <text x='50%' y='50%'>
                1.9
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Resourcefulness</div>
            <svg styleName='score3'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(2.5)}} />
              <text x='50%' y='50%'>
                2.5
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Attitude</div>
            <svg styleName='score3'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(3.1)}} />
              <text x='50%' y='50%'>
                3.1
              </text>
            </svg>
          </div>
          <div styleName='avgScore'>
            <div styleName='scoreTitle'>Availability</div>
            <svg styleName='score1'>
              <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(1.7)}} />
              <text x='50%' y='50%'>
                1.7
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
        {info ? info.evaluations.map(evaluation => {
          return <Eval  key={evaluation.id}
                        majorsList={majorsList}
                        quartersList={quartersList}
                        departmentsList={departmentsList}
                        evaluation={evaluation} openModal={() => this.setState({modalOpen: true})}
                  />
        }) : ''}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    departmentsList: state.departmentsList,
    quartersList: state.quartersList,
    majorsList: state.majorsList
  };
}

export default connect(mapStateToProps, { setDepartmentsList, setQuartersList, setMajorsList })(ViewEvals);
