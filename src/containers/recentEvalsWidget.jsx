import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import API from '../services/api';
import calcTotalScore from '../utils/calcTotalScore';
import { quartersListPT, coursesListPT, departmentsListPT, professorsListPT } from '../utils/propTypes';

class RecentEvalsWidget extends Component {
  static propTypes = {
    quartersList: quartersListPT,
    coursesList: coursesListPT,
    departmentsList: departmentsListPT,
    professorsList: professorsListPT,
    count: PropTypes.number.isRequired,
  }

  static calculatePath(n) { // circumference = 100.53
    return 100.53 - ((n / 4) * 100.53);
  }

  constructor(props) {
    super(props);
    this.state = {
      evals: undefined,
    };
  }

  componentDidMount() {
    const client = new API();
    client.get(
      '/evaluations/recent', (evals) => {
        if (this.recentEvalsWidget) this.setState({ evals });
      },
      { count: this.props.count },
    );
  }

  render() {
    const { evals } = this.state;
    const {
      quartersList, coursesList, professorsList, departmentsList,
    } = this.props;
    if (evals
       && quartersList
       && coursesList
       && coursesList.departmentsListLoaded
       && professorsList
    ) {
      return (
        <div ref={node => (this.recentEvalsWidget = node)} className="widgetWrapper">
          <div className="widget">
            <h5>Recent Evaluations</h5>
            <small style={{ textAlign: 'right', marginRight: '2%' }}>Scale is 1-4</small>
            <ul className="list-group">
              {evals.map((evaluation) => {
                const totalScore = calcTotalScore(evaluation.data);
                const totalScoreStyle = {
                  strokeDashoffset: RecentEvalsWidget.calculatePath(totalScore),
                };
                return (
                  <li key={evaluation.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="flex col-2">
                      {quartersList.object[evaluation.quarter_id].label}
                    </div>
                    <div className="flex col-4">
                      <Link to={`/courses/${evaluation.course.id}`} >
                        {`${departmentsList.object[coursesList.object[evaluation.course.id].department_id].abbr} ${coursesList.object[evaluation.course.id].number}`}
                      </Link>
                    </div>
                    <div className="flex col-4">
                      <Link to={`/professors/${evaluation.professor.id}`} >
                        {professorsList.object[evaluation.professor.id].label}
                      </Link>
                    </div>
                    <div className="flex col-2">
                      <svg className="score">
                        <circle
                          style={totalScoreStyle}
                          cx="18"
                          cy="18"
                          r="16"
                          className={`score${totalScore < 1.75 ? '1' : totalScore < 2.5 ? '2' : totalScore < 3.25 ? '3' : '4'}`}
                        />
                        <text x="50%" y="50%">
                          {totalScore}
                        </text>
                      </svg>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      );
    }
    return (
      <h5 ref={node => (this.recentEvalsWidget = node)}>Loading Most Recent Evaluations...</h5>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  quartersList: state.quartersList,
  coursesList: state.coursesList,
  professorsList: state.professorsList,
  departmentsList: state.departmentsList,
});

export default connect(mapStateToProps, null)(RecentEvalsWidget);
