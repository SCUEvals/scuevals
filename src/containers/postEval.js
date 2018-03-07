import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import { connect } from 'react-redux';
import ReactGA from "react-ga";
import { Link } from 'react-router-dom';

import API from '../services/api';
import TextOptions from '../components/textOptions';
import '../../node_modules/rc-slider/dist/rc-slider.min.css?global';
import '../styles/postEval.scss';
import RedirectModal from '../components/redirectModal';
import { setUserInfo, setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList } from '../actions';
import { READ_EVALUATIONS } from '../index';

class PostEval extends Component {

  static propTypes = {
    userInfo: PropTypes.object.isRequired,
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    professorsList: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    setUserInfo: PropTypes.func.isRequired,
    setDepartmentsList: PropTypes.func.isRequired,
    setProfessorsList: PropTypes.func.isRequired,
    setQuartersList: PropTypes.func.isRequired,
    setCoursesList: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      term: '',
      classInfo: undefined,
      submitted: false,
      initial_read_access: !props.userInfo.permissions.includes(READ_EVALUATIONS)
    };
    const client = new API();
    //course and professor swapped because API currently has different order than site
    client.get(`/classes/${props.match.params.quarter_id}/${props.match.params.professor_id}/${props.match.params.course_id}`, classInfo => this.setState({classInfo}))
    .catch(() => this.setState({classInfo: null}));

    const { userInfo, departmentsList, quartersList, coursesList, professorsList, setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList } = props;
    if (!userInfo.permissions.includes(READ_EVALUATIONS)) {
      if (!departmentsList) {
        const client = new API();
        client.get('/departments', departments => setDepartmentsList(departments));
      }
      if (!quartersList) {
        const client = new API();
        client.get('/quarters', quarters => setQuartersList(quarters));
      }
      if (!coursesList) {
        const client = new API();
        client.get('/courses', courses => setCoursesList(courses, departmentsList)); //departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
      }
      if (!professorsList) {
        const client = new API();
        client.get('/professors', professors => setProfessorsList(professors));
      }
    }
  }

  componentDidUpdate() {
    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList)
      this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); //make deep copy of current, state immutable
  }

  onSubmit(values) {
    const { quarter_id, course_id, professor_id } = this.props.match.params;
    const { display_majors, display_grad_year } = values;
    let evaluation = {...values};
    let sendingObj = { quarter_id, course_id, professor_id, display_majors, display_grad_year, evaluation };
    const client = new API();
    return client.post('/evaluations', sendingObj, responseData => {
      this.setState({submitted: true});
      ReactGA.event({category: 'Evaluation', action: 'Submitted'});
      this.props.setUserInfo(responseData.jwt);
    });
  }

  renderTextArea(field) {
    const { meta: {submitFailed, error} } = field;
    return (
      <TextareaAutoSize className={submitFailed && error ? 'comment-error' : ''} minRows={5} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  renderHandle(props, textProps) {

    const Handle = Slider.Handle;
    const { value, ...restProps } = props;
    delete restProps.dragging; //don't include dragging prop, breaks Handle
    let trackerStyle = {
      top: '-12px',
      left: 'calc(' + props.offset + '% - 2px)',
      position: 'absolute'
    };

    let popperStyle = {};

    if (value === 0) {
      popperStyle.visibility = 'hidden';
      popperStyle.opacity = '0'; //needed for transition animation
    }

    return (
      <Manager tag={false}>
        <Handle value={value} {...restProps}>
          <div styleName='handleNum'>
            {value !== 0 ? value : ''}
          </div>
        </Handle>
        <Target className='popper-target'>
          {({ targetProps }) => (
            <div style={trackerStyle} {...targetProps}/>
          )}
        </Target>
        <Popper style={popperStyle} placement="top" className="popper">
            {value === 0 || value === 1 ? textProps.one : value === 2 ? textProps.two : value === 3 ? textProps.three : value === 4 ? textProps.four : ''}
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  renderInfoToolTip(info) {
    return (
      <Manager className='popper-manager'>
        <Target tabIndex='0' className='popper-target'>
        <i className='fa fa-question'/>
        </Target>
        <Popper placement="top" className="popper tooltip-popper">
          {info}
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  renderSlider(field) {
    const { meta: {submitFailed, error}, input, textProps } = field;
    let track = $('.' + input.name + ' .rc-slider-track');
    if (track.length === 1) { //if exists
      track = track[0];
      switch(input.value) {
        case 1:
          track.className = 'rc-slider-track track1';
          break;
        case 2:
          track.className = 'rc-slider-track track2';
          break;
        case 3:
          track.className = 'rc-slider-track track3';
          break;
        case 4:
          track.className = 'rc-slider-track track4';
          break;
      }
    }
    const sliderClass = submitFailed && error ? input.name + ' slider-error' : input.name;
    const { renderHandle } = field;
    return (
      <Slider
        onBeforeChange={() => $('.' + input.name + ' div[role="slider"]').focus()}
        className={sliderClass} //used to change track colors on changes
        name={input.name}
        {...input}
        dots
        handle={passedProps => renderHandle(passedProps, textProps)}
        max={4}
        defaultValue={0}
      />
    );
  }

  render() {
    const { quartersList, coursesList, professorsList, handleSubmit, submitting, userInfo, location, history } = this.props;
    const { classInfo, submitted, initial_read_access } = this.state;
    const read_access = userInfo.permissions.includes(READ_EVALUATIONS);
    let quarter, course, professor;
    if (quartersList && coursesList && coursesList.departmentsListLoaded && professorsList) {
      if (classInfo) {
        quarter = quartersList.object[classInfo.quarter.id].label;
        course = coursesList.object[classInfo.course.id].label;
        professor = professorsList.object[classInfo.professor.id].label;
      }
      else if (location.state) {
        quarter = quartersList.object[location.state.quarter_id].label;
        course = coursesList.object[location.state.course_id].label;
        professor = professorsList.object[location.state.professor_id].label;
      }
    }
    if (location.state || classInfo !== undefined) { //passed values from postSearch
      return (
        <form styleName='postEval' onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
          {!read_access && (
            <div className='noWriteDiv'>
            <Link className='homeBtn' to={'/'}>
              <i className="fa fa-home" />
            </Link>
          </div>
          )}
          <RedirectModal permissionsUpgrade={!initial_read_access} history={history} redirectModalOpen={classInfo === null || classInfo && classInfo.user_posted || submitted} submitted={submitted} classInfoExists={classInfo && classInfo.user_posted} />
          {quarter && course && professor ?
            <div styleName='postInfo'>
              <h5>{quarter}</h5>
              <h3>{course}</h3>
              <h3>{professor}</h3>
            </div>
          : classInfo === null ?
            <div styleName='postInfo'>
              <h3>No class exists for this page.</h3>
            </div>
          : <div styleName='postInfo'>
              <h3>Loading...</h3>
            </div>
          }
          <div styleName='postGuidelines' className='row'>
            <div className='col-12 col-md-6'>
              <div className='card'>
                <div className='card-header'>GUIDELINES TO FOLLOW</div>
                  <div className='card-body'>
                    <ul>
                      <li>If unsure about a question, select <div tabIndex='0' styleName='popper-target-guidelines'><i className='fa fa-question'/></div> for more details</li>
                      <li>Remove unfair bias</li>
                      <li>Proofread your comments</li>
                      <li>Write respectfully</li>
                      <li>Share information you wish you knew before taking this class</li>
                    </ul>
                </div>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='card'>
                <div className='card-header'>THINGS TO AVOID</div>
                <div className='card-body'>
                  <ul >
                    <li>Hate speech or excessive profanity</li>
                    <li>Speaking on behalf of others</li>
                    <li>Sharing personally identfiable information</li>
                    <li>Sharing links</li>
                    <li>Making accusations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <h3>Professor</h3>
          <h6>Attitude {this.renderInfoToolTip(TextOptions.attitude.info)}</h6>
          <Field name='attitude' format={value => value === '' ? 0 : value} textProps={TextOptions.attitude} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Availability {this.renderInfoToolTip(TextOptions.availability.info)}</h6>
          <Field name='availability' format={value => value === '' ? 0 : value} textProps={TextOptions.availability} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Clarity {this.renderInfoToolTip(TextOptions.clarity.info)}</h6>
          <Field name='clarity' format={value => value === '' ? 0 : value} textProps={TextOptions.clarity} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Grading Speed {this.renderInfoToolTip(TextOptions.grading_speed.info)}</h6>
          <Field name='grading_speed' format={value => value === '' ? 0 : value} textProps={TextOptions.grading_speed} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Resourcefulness {this.renderInfoToolTip(TextOptions.resourcefulness.info)}</h6>
          <Field name='resourcefulness' format={value => value === '' ? 0 : value} textProps={TextOptions.resourcefulness} renderHandle={this.renderHandle} component={this.renderSlider} />

          <h3>Class</h3>
          <h6>Easiness {this.renderInfoToolTip(TextOptions.easiness.info)}</h6>
          <Field name='easiness' format={value => value === '' ? 0 : value} textProps={TextOptions.easiness} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Workload {this.renderInfoToolTip(TextOptions.workload.info)}</h6>
          <Field name='workload' format={value => value === '' ? 0 : value} textProps={TextOptions.workload} renderHandle={this.renderHandle} component={this.renderSlider} />

          <h3>General</h3>
          <h6>Would you recommend this course with this professor? {this.renderInfoToolTip(TextOptions.recommended.info)}</h6>
          <Field name='recommended' format={value => value === '' ? 0 : value} textProps={TextOptions.recommended} renderHandle={this.renderHandle} component={this.renderSlider} />
          <h6>Comments {this.renderInfoToolTip(TextOptions.comment.info)}</h6>
          <Field name="comment" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
          <p>Max characters: {this.state.term.length} / 1000</p>
          <label>
            {`Display ${userInfo.majors.length > 1 ? 'majors' : 'major'}`}
            <Field name='display_majors' component='input' type='checkbox' />
          </label>
          <label>
            Display graduation year
            <Field name='display_grad_year' component='input' type='checkbox' />
          </label>
          <small>Your name and gender will always be kept hidden when posting.</small>
          <button disabled={submitting} type="submit" className="btn">{submitting ? 'Submitting...' : 'Submit'}</button>
        </form>
      );
    }
    else {
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        </div>
      );
    }
  }
}

const validate = values => {
  const errors = {};
  if (!values.attitude) errors.attitude = 'Required';
  if (!values.availability) errors.availability = 'Required';
  if (!values.clarity) errors.clarity = 'Required';
  if (!values.comment) errors.comment = 'Required';
  if (values.comment && values.comment.length > 1000) 'Message longer than 1000 characters.';
  if (!values.easiness) errors.easiness = 'Required';
  if (!values.grading_speed) errors.grading_speed = 'Required';
  if (!values.recommended) errors.recommended = 'Required';
  if (!values.resourcefulness) errors.resourcefulness = 'Required';
  if (!values.workload) errors.workload = 'Required';
  return errors;
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

export default reduxForm({
  validate,
  form: 'postEval',
  initialValues: { display_majors: true, display_grad_year: true }
})(connect(mapStateToProps, { setUserInfo, setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList })(PostEval));
