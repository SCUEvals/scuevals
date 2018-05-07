import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { Link, Prompt } from 'react-router-dom';

import API from '../services/api';
import TextOptions from '../components/textOptions';
// eslint-disable-next-line import/no-unresolved
import '../../node_modules/rc-slider/dist/rc-slider.min.css?global';
import '../styles/postEval.scss';
import RedirectModal from '../components/redirectModal';
import {
  setUserInfoAction,
  setDepartmentsListAction,
  setProfessorsListAction,
  setQuartersListAction,
  setCoursesListAction,
} from '../actions';
import { READ_EVALUATIONS } from '../index';
import Checkbox from '../components/checkbox';
import {
  userInfoPT,
  quartersListPT,
  coursesListPT,
  departmentsListPT,
  professorsListPT,
  locationPT,
  matchPT,
  historyPT,
} from '../utils/propTypes';

class PostEval extends Component {
  static propTypes = {
    userInfo: userInfoPT.isRequired,
    departmentsList: departmentsListPT,
    quartersList: quartersListPT,
    coursesList: coursesListPT,
    professorsList: professorsListPT,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    location: locationPT,
    history: historyPT,
    match: matchPT,
    setUserInfo: PropTypes.func.isRequired,
    setDepartmentsList: PropTypes.func.isRequired,
    setProfessorsList: PropTypes.func.isRequired,
    setQuartersList: PropTypes.func.isRequired,
    setCoursesList: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
  };

  static renderCheckbox(field) {
    let onKeyDown;
    if (field.input.name === 'displayMajors') {
      onKeyDown = (event) => {
        switch (event.keyCode) {
        case 38: // up
          event.preventDefault(); // stop scrolling
          $('textarea[name="comment"]').focus();
          break;
        case 40: // down
          event.preventDefault(); // stop scrolling
          $('input[name="displayGradYear"]').focus();
          break;
        default:
          break;
        }
      };
    } else if (field.input.name === 'displayGradYear') {
      onKeyDown = (event) => {
        switch (event.keyCode) {
        case 38: // up
          event.preventDefault(); // stop scrolling
          $('input[name="displayMajors"]').focus();
          break;
        case 40: // down
          event.preventDefault(); // stop scrolling
          $('button[type="submit"]').focus();
          break;
        default:
          break;
        }
      };
    }
    return <Checkbox field={field} onKeyDown={onKeyDown} defaultChecked />;
  }

  static renderSlider(field) {
    const { meta: { submitFailed, error }, input, textProps } = field;
    const track = $(`.${input.name} .rc-slider-track`)[0];
    if (track) { // if exists
      switch (input.value) {
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
      default:
        break;
      }
    }
    const sliderClass = submitFailed && error ? `${input.name} slider-error` : input.name;
    const { renderHandle } = field;
    return (
      <Slider
        onBeforeChange={() => $(`.${input.name} div[role="slider"]`).focus()}
        className={sliderClass} // used to change track colors on changes
        name={input.name}
        {...input}
        dots
        handle={passedProps => renderHandle(passedProps, textProps)}
        max={4}
        defaultValue={0}
      />
    );
  }

  static renderInfoToolTip(info) {
    return (
      <Manager className="popper-manager">
        <Target tabIndex="0" className="popper-target">
          <i className="fa fa-question" />
        </Target>
        <Popper placement="top" className="popper tooltip-popper">
          {info}
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  static renderHandle(props, textProps) {
    const { Handle } = Slider;
    const { value, ...restProps } = props;
    delete restProps.dragging; // don't include dragging prop, breaks Handle
    const trackerStyle = {
      top: '-12px',
      left: `calc(${props.offset}% - 2px)`,
      position: 'absolute',
    };

    const popperStyle = {};

    if (value === 0) {
      // disables highlighting/selecting, allows elements behind it to be selectable
      popperStyle.visibility = 'hidden';
      popperStyle.opacity = '0'; // needed for transition animation
    }

    return (
      <Manager tag={false}>
        <Handle
          value={value}
          {...restProps}
          onKeyDown={(event) => {
            switch (event.keyCode) {
            case 38: { // up
              event.stopPropagation(); // stop from moving slider up a value
              event.preventDefault(); // stop scrolling
              const nodes = $('.rc-slider-handle');
              for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] === event.target) {
                  if (i - 1 >= 0) nodes[i - 1].focus();
                  break;
                }
              }
              break;
            }
            case 40: { // down
              event.stopPropagation(); // stop from moving slider down a value
              event.preventDefault(); // stop scrolling
              const nodes = $('.rc-slider-handle');
              for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] === event.target) {
                  if (i + 1 < nodes.length) nodes[i + 1].focus();
                  else $('textarea[name="comment"]').focus();
                  break;
                }
              }
              break;
            }
            default:
              break;
            }
          }}
        >
          <div styleName="handleNum">
            {value !== 0 ? value : ''}
          </div>
        </Handle>
        <Target className="popper-target">
          {({ targetProps }) => (
            <div style={trackerStyle} {...targetProps} />
          )}
        </Target>
        <Popper style={popperStyle} placement="top" className="popper">
          {value === 0 || value === 1 ?
            textProps.one
            : value === 2 ?
              textProps.two
              : value === 3 ?
                textProps.three
                : value === 4 ?
                  textProps.four
                  : ''
          }
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  static renderTextArea(field) {
    const { meta: { submitFailed, error } } = field;
    return (
      <TextareaAutoSize
        className={submitFailed && error ? 'comment-error' : undefined}
        minRows={5}
        {...field.input}
        placeholder="Write your constructive review here"
      />
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      term: '',
      classInfo: props.location.state && props.location.state.quarterID ?
        {
          quarterID: props.location.state.quarterID,
          courseID: props.location.state.courseID,
          professorID: props.location.state.professorID,
          userPosted: false,
        }
        : undefined,
      submitted: false,
    };

    if (!this.state.classInfo) {
      const client = new API();
      // course and professor swapped because API currently has different order than site
      client.get(
        `/classes/${props.match.params.quarterID}/${props.match.params.professorID}/${props.match.params.courseID}`,
        classInfo => this.setState({
          classInfo: {
            quarterID: classInfo.quarter.id,
            courseID: classInfo.course.id,
            professorID: classInfo.professor.id,
            userPosted: classInfo.userPosted,
          },
        }),
      ).catch(() => this.setState({ classInfo: null }));
    }

    const {
      userInfo,
      departmentsList,
      quartersList,
      coursesList,
      professorsList,
      setDepartmentsList,
      setQuartersList,
      setCoursesList,
      setProfessorsList,
    } = props;
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
        // departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
        client.get('/courses', courses => setCoursesList(courses, departmentsList));
      }
      if (!professorsList) {
        const client = new API();
        client.get('/professors', professors => setProfessorsList(professors));
      }
    }
  }

  componentDidMount() {
    $('.rc-slider-handle').first().focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.classInfo === undefined
      && this.state.classInfo !== undefined
    ) $('.rc-slider-handle').first().focus();
    if (!this.props.userInfo.permissions.includes(READ_EVALUATIONS)) {
      if (this.props.coursesList
        && !this.props.coursesList.departmentsListLoaded
        && this.props.departmentsList
      ) {
        // make deep copy of current, state immutable
        this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList);
      }
    }
  }

  onSubmit(values) {
    const { quarterID, courseID, professorID } = this.props.match.params;
    const { displayMajors, displayGradYear } = values;
    const evaluation = { ...values };
    const sendingObj = {
      quarter_id: quarterID,
      course_id: courseID,
      professor_id: professorID,
      display_majors: displayMajors,
      display_grad_year: displayGradYear,
      evaluation,
    };
    const client = new API();
    return client.post('/evaluations', sendingObj, (responseData) => {
      this.setState({ submitted: true });
      ReactGA.event({ category: 'Evaluation', action: 'Submitted' });
      this.props.setUserInfo(responseData.jwt);
    });
  }

  render() {
    const {
      quartersList,
      coursesList,
      professorsList,
      handleSubmit,
      submitting,
      userInfo,
      history,
      dirty,
    } = this.props;
    const { classInfo, submitted } = this.state;
    const readAccess = userInfo.permissions.includes(READ_EVALUATIONS);
    let quarter;
    let course;
    let professor;
    if (quartersList && coursesList && coursesList.departmentsListLoaded && professorsList) {
      if (classInfo) {
        quarter = quartersList.object[classInfo.quarterID].label;
        course = coursesList.object[classInfo.courseID].label;
        professor = professorsList.object[classInfo.professorID].label;
      }
    }
    // passed values from postSearch
    if (classInfo !== undefined) {
      return (
        <form
          styleName="postEval"
          onSubmit={handleSubmit(this.onSubmit.bind(this))}
          className="content"
        >
          <Prompt
            when={dirty && !submitted}
            message="Are you sure you want to go to navigate away before submitting your evaluation?"
          />
          {!readAccess && (
            <div className="noWriteDiv">
              <Link className="homeBtn" to="/">
                <i className="fa fa-home" />
              </Link>
            </div>
          )}
          <RedirectModal
            redirectModalOpen={
              classInfo === null
              || (classInfo && classInfo.userPosted)
              || submitted
            }
            permissionsUpgrade={!readAccess}
            history={history}
            submitted={submitted}
            classInfoExists={classInfo && classInfo.userPosted}
          />
          {quarter && course && professor ?
            <div styleName="postInfo">
              <h5>{quarter}</h5>
              <h3>{course}</h3>
              <h3>{professor}</h3>
            </div>
            :
            classInfo === null ?
              <div styleName="postInfo">
                <h3>No class exists for this page.</h3>
              </div>
              :
              <div styleName="postInfo">
                <h3>Loading...</h3>
              </div>
          }
          <div styleName="postGuidelines" className="row">
            <div className="col-12 col-md-6">
              <div className="card">
                <div className="card-header">GUIDELINES TO FOLLOW</div>
                <div className="card-body">
                  <ul>
                    <li>
                      {'If unsure about a question, select '}
                      <div tabIndex="0" role="button" styleName="popper-target-guidelines">
                        <i className="fa fa-question" />
                      </div>
                      {' for more details'}
                    </li>
                    <li>Remove unfair bias</li>
                    <li>Proofread your comments</li>
                    <li>Write respectfully</li>
                    <li>Share information you wish you knew before taking this class</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card">
                <div className="card-header">THINGS TO AVOID</div>
                <div className="card-body">
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
          <h6>Attitude {PostEval.renderInfoToolTip(TextOptions.attitude.info)}</h6>
          <Field
            name="attitude"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.attitude}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Availability {PostEval.renderInfoToolTip(TextOptions.availability.info)}</h6>
          <Field
            name="availability"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.availability}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Clarity {PostEval.renderInfoToolTip(TextOptions.clarity.info)}</h6>
          <Field
            name="clarity"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.clarity}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Grading Speed {PostEval.renderInfoToolTip(TextOptions.grading_speed.info)}</h6>
          <Field
            name="grading_speed"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.grading_speed}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Resourcefulness {PostEval.renderInfoToolTip(TextOptions.resourcefulness.info)}</h6>
          <Field
            name="resourcefulness"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.resourcefulness}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h3>Class</h3>
          <h6>Easiness {PostEval.renderInfoToolTip(TextOptions.easiness.info)}</h6>
          <Field
            name="easiness"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.easiness}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Workload {PostEval.renderInfoToolTip(TextOptions.workload.info)}</h6>
          <Field
            name="workload"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.workload}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h3>General</h3>
          <h6>
            Would you recommend this course with this professor?
            {PostEval.renderInfoToolTip(TextOptions.recommended.info)}
          </h6>
          <Field
            name="recommended"
            format={value => (value === '' ? 0 : value)}
            textProps={TextOptions.recommended}
            renderHandle={PostEval.renderHandle}
            component={PostEval.renderSlider}
          />
          <h6>Comments {PostEval.renderInfoToolTip(TextOptions.comment.info)}</h6>
          <Field
            name="comment"
            onChange={e => this.setState({ term: e.target.value })}
            component={PostEval.renderTextArea}
          />
          <p>Max characters: {this.state.term.length} / 1000</p>
          <div className="checkbox-group">
            <Field
              name="displayMajors"
              component={PostEval.renderCheckbox}
              text={`Display ${userInfo.majors.length > 1 ? 'majors' : 'major'}`}
            />
            <br />
            <Field
              name="displayGradYear"
              component={PostEval.renderCheckbox}
              text="Display graduation year"
            />
          </div>
          <small>Your name and gender will always be kept hidden when posting.</small>
          <button
            disabled={submitting}
            type="submit"
            className="btn"
            onKeyDown={(event) => {
              switch (event.keyCode) {
              case 38: // up
                event.preventDefault(); // stop scrolling
                $('input[name="displayGradYear"]').focus();
                break;
              default:
                break;
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      );
    }

    return (
      <div className="loadingWrapper">
        <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
      </div>
    );
  }
}

const validate = (values) => {
  const errors = {};
  if (!values.attitude) errors.attitude = 'Required';
  if (!values.availability) errors.availability = 'Required';
  if (!values.clarity) errors.clarity = 'Required';
  if (!values.comment) errors.comment = 'Required';
  if (values.comment && values.comment.length > 1000) errors.comment = 'Message longer than 1000 characters.';
  if (!values.easiness) errors.easiness = 'Required';
  if (!values.grading_speed) errors.grading_speed = 'Required';
  if (!values.recommended) errors.recommended = 'Required';
  if (!values.resourcefulness) errors.resourcefulness = 'Required';
  if (!values.workload) errors.workload = 'Required';
  return errors;
};

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  departmentsList: state.departmentsList,
  quartersList: state.quartersList,
  coursesList: state.coursesList,
  professorsList: state.professorsList,
});

const mapDispatchToProps = {
  setUserInfo: setUserInfoAction,
  setDepartmentsList: setDepartmentsListAction,
  setQuartersList: setQuartersListAction,
  setCoursesList: setCoursesListAction,
  setProfessorsList: setProfessorsListAction,
};

export default reduxForm({
  validate,
  form: 'postEval',
  initialValues: { displayMajors: true, displayGradYear: true },
})(connect(mapStateToProps, mapDispatchToProps)(PostEval));
