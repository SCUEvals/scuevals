import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DeleteModal from '../components/deleteModal';

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
      orderedInfo: null,
      deleteModal: { open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined },
      myEvalsList: null
    };
  }

  componentDidMount() {
    let client = new API();
    client.get('/evaluations', myEvalsList => this.setState({myEvalsList}));
  }

  render() {
    const { info, orderedInfo, deleteModal, myEvalsList } = this.state;
    const { userInfo, quartersList, coursesList, departmentsList, professorsList } = this.props;
    return (
      <div className="content">
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({deleteModal: {open: false}})}
          quarter={quartersList && deleteModal.quarter_id ? quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null }
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          eval_id={deleteModal.eval_id}
          deletePost={() => {
            let client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`,  ReactGA.event({category: 'Evaluation', action: 'Deleted'}));
            myEvalsList.map((obj, key) => {
              if (obj.id === deleteModal.eval_id) {
                let newList = myEvalsList.slice();
                newList.splice(myEvalsList[key], 1);
                this.setState({ myEvalsList: newList });
              };
            });
          }}
        />
        <h4 className='banner'>{userInfo.first_name}'s Evals</h4>
        {myEvalsList ?
           myEvalsList.length === 0 ?
            <h5>You haven't posted anything yet.</h5>
            : <div>
                <Select
                  className='sort'
                  simpleValue
                  options={null}
                  placeholder="Sort"
                />
                {myEvalsList.map(evaluation => {
                  return <Eval
                    key={evaluation.id}
                    evaluation={evaluation}
                    quartersList={quartersList}
                    departmentsList={departmentsList}
                    openModal={() => { //type, quarter_id, secondId, eval_id passed in, but not needed in viewMyEvals
                      this.setState({deleteModal: {open: true, quarter_id: evaluation.quarter_id, course_id: evaluation.course.id, professor_id: evaluation.professor.id, eval_id: evaluation.id}});
                    }}
                  />
                })}
            </div>
        : <h5>Loading...</h5>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    departmentsList: state.departmentsList,
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList
  };
}

export default connect(mapStateToProps, null)(ViewMyEvals);
