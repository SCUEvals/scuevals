import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Select from 'react-select';

import API from '../services/api';
import '../styles/topsWidget.scss';
import { departmentsListPT, majorsListPT, userInfoPT } from '../utils/propTypes';

class TopsWidget extends Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    departmentsList: departmentsListPT,
    majorsList: majorsListPT,
    userInfo: userInfoPT,
  }

  static calculatePath(n) { // circumference = 100.53
    return 100.53 - ((n / 4) * 100.53);
  }

  constructor(props) {
    super(props);
    this.state = {
      topProfessors: undefined,
      topCourses: undefined,
      deptID: props.majorsList ?
        props.majorsList.object[props.userInfo.majors[0]].departments[0]
        : undefined,
    };
  }

  componentDidMount() {
    if (this.props.majorsList) this.getDepartmentTops(this.state.deptID);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.majorsList && this.props.majorsList) {
      const deptID = this.props.majorsList.object[this.props.userInfo.majors[0]].departments[0];
      this.setState({ deptID }); // eslint-disable-line react/no-did-update-set-state
      this.getDepartmentTops(deptID);
    }
  }

  getDepartmentTops(deptID) {
    const client = new API();
    client.get('/courses/top', (topCourses) => {
      if (this.topsWidget) this.setState({ topCourses });
    }, { count: this.props.count, department_id: deptID });

    client.get('/professors/top', (topProfessors) => {
      if (this.topsWidget) this.setState({ topProfessors });
    }, { count: this.props.count, department_id: deptID });
  }

  render() {
    const { topProfessors, topCourses, deptID } = this.state;
    const { departmentsList, majorsList } = this.props;
    if (topProfessors !== undefined && topCourses !== undefined && departmentsList) {
      return (
        <div styleName="topsWidget" ref={node => (this.topsWidget = node)} className="widgetWrapper">
          <div className="widget">
            <h5>Top List</h5>
            <Select
              name="departments"
              simpleValue
              valueKey="id"
              labelKey="name"
              value={deptID}
              options={departmentsList.array}
              isLoading={!departmentsList || !majorsList}
              disabled={!departmentsList || !majorsList}
              placeholder="Select department"
              onChange={(dept) => {
                this.setState({
                  deptID: dept,
                  topProfessors: null,
                  topCourses: null,
                }, this.getDepartmentTops(dept));
              }}
            />
            <nav>
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <a className="nav-item nav-link active" id="nav-professors-tab" data-toggle="tab" href="#nav-professors" role="tab" aria-controls="nav-professors" aria-selected="true">Professors</a>
                <a className="nav-item nav-link" id="nav-courses-tab" data-toggle="tab" href="#nav-courses" role="tab" aria-controls="nav-courses" aria-selected="false">Courses</a>
              </div>
              <small>Scale is 1-4</small>
            </nav>
            <div className="tab-content" id="nav-tabContent">
              {topProfessors === null || topCourses === null ? // if null, then show loading
                <div className="flex" styleName="loadingWrapper">
                  <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
                </div>
                :
                <Fragment>
                  <ul className="list-group tab-pane fade show active" id="nav-professors" role="tabpanel" aria-labelledby="nav-professors-tab">
                    {topProfessors.map((obj) => {
                      const totalScore = obj.avg_score.toFixed(1);
                      const totalScoreStyle = { strokeDashoffset: TopsWidget.calculatePath(totalScore) };
                      const totalScoreClass = `score${totalScore < 1.75 ? '1' : totalScore < 2.5 ? '2' : totalScore < 3.25 ? '3' : '4'}`;
                      return (
                        <li key={obj.professor.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="flex col-10">
                            <Link to={`/professors/${obj.professor.id}`} >{obj.professor.last_name}, {obj.professor.first_name}</Link>
                          </div>
                          <div className="flex col-2">
                            <svg className="score">
                              <circle style={totalScoreStyle} cx="18" cy="18" r="16" className={totalScoreClass} />
                              <text x="50%" y="50%">
                                {totalScore}
                              </text>
                            </svg>
                          </div>
                        </li>
                      );
                    })}
                    {topProfessors.length === 0 && (<small>Not enough data</small>)}
                  </ul>
                  <ul className="list-group tab-pane fade" id="nav-courses" role="tabpanel" aria-labelledby="nav-courses-tab">
                    {topCourses.map((obj) => {
                      const totalScore = obj.avg_score.toFixed(1);
                      const totalScoreStyle = { strokeDashoffset: TopsWidget.calculatePath(totalScore) };
                      const totalScoreClass = `score${totalScore < 1.75 ? '1' : totalScore < 2.5 ? '2' : totalScore < 3.25 ? '3' : '4'}`;
                      return (
                        <li key={obj.course.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="flex col-10">
                            <Link to={`/courses/${obj.course.id}`}>{departmentsList.object[obj.course.department_id].abbr} {obj.course.number}</Link>
                          </div>
                          <div className="flex col-2">
                            <svg className="score">
                              <circle style={totalScoreStyle} cx="18" cy="18" r="16" className={totalScoreClass} />
                              <text x="50%" y="50%">
                                {totalScore}
                              </text>
                            </svg>
                          </div>
                        </li>
                      );
                    })}
                    {topCourses.length === 0 && (<small>Not enough data</small>)}
                  </ul>
                </Fragment>
              }

            </div>
          </div>
        </div>
      );
    }
    return (
      <h5 ref={node => (this.topsWidget = node)}>Loading Top Professors and Courses...</h5>
    );
  }
}

const mapStateToProps = state => ({
  departmentsList: state.departmentsList,
  userInfo: state.userInfo,
  majorsList: state.majorsList,
});

export default connect(mapStateToProps, null)(TopsWidget);
