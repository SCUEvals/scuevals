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

  renderAverage(name, value) {
    let style = value < 1.75 ? 'score1' : value < 2.5 ? 'score2' : value < 3.25 ? 'score3' : 'score4';
    if (value) {
      return (
        <div styleName='avgScore'>
          <div styleName='scoreTitle'>{name}</div>
          <svg styleName={style}>
            <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(value)}} />
            <text x='50%' y='50%'>
              {value}
            </text>
          </svg>
        </div>
      );
    }
  }

  render() { //1-1.74 score1, 1.75-2.49 score2, 2.50-3.24 score3, 3.25-4 score4
    const { info, orderedInfo, flagModal, deleteModal } = this.state;
    const { majorsList, quartersList, coursesList, professorsList, departmentsList } = this.props;
    let average, attitude, availability, clarity, easiness, grading_speed, recommended, resourcefulness, workload;
    if (info && info.evaluations.length > 0) {
      average = attitude = availability = clarity = easiness = grading_speed = recommended = resourcefulness = workload = 0;
      const avgDivideNum = Object.values(info.evaluations[0].data).length - 1; //comment not part of average
      const divideNum = info.evaluations.length;
      info.evaluations.map(evaluation => {
        const { data } = evaluation;
        attitude += data.attitude;
        availability += data.availability;
        clarity += data.clarity;
        easiness += data.easiness;
        grading_speed += data.grading_speed;
        recommended += data.recommended;
        resourcefulness += data.resourcefulness;
        workload += data.workload;
        average += (data.attitude + data.availability + data.clarity + data.easiness + data.grading_speed + data.recommended + data.resourcefulness + data.workload) / avgDivideNum;
      });
      average = Number((average / divideNum * 10) / 10).toFixed(1);
      attitude = Number((attitude / divideNum * 10) / 10).toFixed(1);
      availability = Number((availability / divideNum * 10) / 10).toFixed(1);
      clarity = Number((clarity / divideNum * 10) / 10).toFixed(1);
      easiness = Number((easiness / divideNum * 10) / 10).toFixed(1);
      grading_speed = Number((grading_speed / divideNum * 10) / 10).toFixed(1);
      recommended = Number((recommended / divideNum * 10) / 10).toFixed(1);
      resourcefulness = Number((resourcefulness / divideNum * 10) / 10).toFixed(1);
      workload = Number((workload / divideNum * 10) / 10).toFixed(1);
    };
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
        {info && info.evaluations.length > 0 ?
          <div className='row' styleName='scores'>
            {this.renderAverage('Average', average)}
            {this.renderAverage('Recommend?', recommended)}
            {this.renderAverage('Easiness', easiness)}
            {this.renderAverage('Workload', workload)}
            {this.renderAverage('Grading Speed', grading_speed)}
            {this.renderAverage('Clarity', clarity)}
            {this.renderAverage('Resourcefulness', resourcefulness)}
            {this.renderAverage('Attitude', attitude)}
            {this.renderAverage('Availability', availability)}
          </div>
          : ''
        }
        <Link styleName='quickPost' className='btn' to={this.props.type === 'professors' ?
          `/professors/${this.props.match.params.id}/post`
          :`/courses/${this.props.match.params.id}/post`}>
          Quick Post
        </Link>
        {info && info.evaluations.length > 0 ?
          <div>
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
           </div>
        : ''}
        {info ?
          info.evaluations.length === 0 ?
            <h5>No evaluations posted yet.</h5>
          : info.evaluations.map(evaluation => {
              return (
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
