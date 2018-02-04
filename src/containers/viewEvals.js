import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';

import { setMyEvalsList } from '..'
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
      flagModal: { open: false, comment: undefined, id: undefined },
      deleteModal: { open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined }
    };
  }

  componentWillMount() {
    let client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.id, info => this.setState({ info, orderedInfo: info }));
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
    const { info, orderedInfo, flagModal, deleteModal } = this.state;
    const { majorsList, quartersList, coursesList, professorsList, departmentsList } = this.props;
    return (
      <div className="content">
        <FlagModal
          flagModalOpen={flagModal.open}
          closeFlagModal={() => this.setState({flagModal: {open: false }})}
        />
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({deleteModal: {open: false}})}
          quarter={quartersList && deleteModal.quarter_id ? quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null }
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          eval_id={deleteModal.eval_id}
          deletePost={() => {
            let client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`);
            info.evaluations.map((obj, key) => {
              if (obj.id === deleteModal.eval_id) {
                info.evaluations.splice(info.evaluations[key], 1);
                this.setState({info});
              };
             });
          }}
        />
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
            <div styleName='scoreTitle'>Easiness</div>
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
        <Link className='btn' to={this.props.type === 'professors' ?
          `/professors/${this.props.match.params.id}/post`
          :`/courses/${this.props.match.params.id}/post`}>
          Quick Post
        </Link>
        {info ?
          info.evaluations.length === 0 ?
            <h5>No evaluations posted yet.</h5>
          : info.evaluations.map(evaluation => {
            return (
              <div key={evaluation.id}>
                <Select
                  className='sort'
                  simpleValue
                  options={null}
                  placeholder="Sort"
                />
                <i
                  tabIndex='0'
                  className='fa fa-sort'
                  onClick={e => {
                    if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc')
                      e.target.className = 'fa fa-sort-desc';
                    else e.target.className = 'fa fa-sort-asc';
                  }}
                  onKeyPress={event => {
                    if (event.key === 'Enter') event.target.click();
                  }}

                 />
                <Eval
                  key={evaluation.id}
                  majorsList={majorsList}
                  quartersList={quartersList}
                  departmentsList={departmentsList}
                  evaluation={evaluation}
                  openModal={(type, x, secondId, eval_id) => {
                    switch (type) {
                      case 'flag': //x = comment
                        this.setState({flagModal: {open: true, comment: x}});
                        break;
                      case 'delete': //x = quarter_id
                        switch(this.props.type) {
                          case 'courses':
                            this.setState({deleteModal: {open: true, quarter_id: x, course_id: info.id, professor_id: secondId, eval_id}})
                            break;
                          case 'professors':
                            this.setState({deleteModal: {open: true, quarter_id: x, course_id: secondId, professor_id: info.id, eval_id}});
                            break;
                        }
                        break;
                    }
                  }}
                />
              </div>
            );
          })
        : ''}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    departmentsList: state.departmentsList,
    majorsList: state.majorsList,
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList
  };
}

export default connect(mapStateToProps, null)(ViewEvals);
