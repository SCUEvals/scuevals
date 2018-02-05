 import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RedirectModal from '../components/redirectModal';

import API from '../services/api';
import '../../node_modules/rc-slider/dist/rc-slider.min.css?global';
import '../styles/postEval.scss';

const Handle = Slider.Handle;
// \xA0 is used for non-breaking whitespace,
const textOptions = {
  attitude: {
    one: 'Unapproachable',
    two: 'Generally negative',
    three: 'Nice enough',
    four: 'Fantastic',
    info: 'How did you feel the professor acted towards students?'
  },
  availability: {
    one: 'Impossible to reach',
    two: 'Barely available',
    three: 'Usually reachable',
    four: 'Super flexible',
    info: 'How easy was it to contact or meet with the professor?'
  },
  clarity: {
    one: 'Could not understand',
    two: 'Often unclear',
    three: 'Usually understood',
    four: 'Great explainer',
    info: 'Were the professor\'s notes and explanations clear (word choice, handwriting, etc.)?'
  },
  grading_speed: {
    one: 'Not\xA0until end of quarter',
    two: 'Extremely slow',
    three: 'After a few classes',
    four: 'By\xA0next class',
    info: 'How quickly did the professor grade assignments?'
  },
  resourcefulness: {
    one: 'Provided nothing',
    two: 'Occasional handouts',
    three: 'Shared most things',
    four: 'Shared everything',
    info: 'How much material did the professor share to help students learn?'
  },
  workload: {
    one: 'Constantly busy',
    two: 'You\'ll survive',
    three: 'Easy stuff',
    four: 'There\'s work?',
    info: 'How much work was assigned compared to other classes?'
  },
  easiness: {
    one: 'Extremely difficult',
    two: 'Challenging',
    three: 'Study the\xA0week before',
    four: 'Easy\xA0"A"',
    info: 'How easy was the material for this course?'
  },
  recommend: {
    one: 'No,\xA0avoid\xA0at all costs',
    two: 'I do not recommend',
    three: 'Yes, but\xA0it could\xA0be better',
    four: 'Absolutely',
    info: 'Overall, was this course with this professor a good option to take?'
  },
  comment: {
    info: 'Write anything you feel other students would benefit from knowing that the questions above left unanswered.'
  }
};

const infoTooltip = info => {
  return (
    <Manager styleName='popper-manager'>
      <Target tabIndex='0' styleName='popper-target'>
      <i className='fa fa-question'/>
      </Target>
      <Popper placement="top" styleName="popper tooltip-popper">
        {info}
        <Arrow styleName="popper__arrow"/>
      </Popper>
    </Manager>
  );
};

const handle = (props, textProps) => {
  const { value, dragging, ...restProps } = props;
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
      <Target styleName='popper-target'>
        {({ targetProps }) => (
          <div style={trackerStyle} {...targetProps}/>
        )}
      </Target>
      <Popper style={popperStyle} placement="top" styleName="popper">
          {value === 0 || value === 1 ? textProps.one : value === 2 ? textProps.two : value === 3 ? textProps.three : value === 4 ? textProps.four : ''}
        <Arrow styleName="popper__arrow"/>
      </Popper>
    </Manager>
  );
};

class PostEval extends Component {

  static defaultProps = {
    userInfo: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      term: '',
      classInfo: undefined
    };
    let client = new API();
    //course and professor swapped because API currently has different order than site
    client.get(`/classes/${props.match.params.quarter_id}/${props.match.params.professor_id}/${props.match.params.course_id}`, classInfo => this.setState({classInfo}))
    .catch(e => this.setState({classInfo: null}));
  }


  onSubmit(values) {
    const { quarter_id, course_id, professor_id } = this.props.match.params;
    const { display_majors, display_grad_year } = values;
    let evaluation = {...values};
    let returnedObj = { quarter_id, course_id, professor_id, display_majors, display_grad_year, evaluation };
    let client = new API();
    return client.post('/evaluations', returnedObj, () => this.props.history.push('/'));
  };


  renderTextArea(field) {
    const { meta: {submitFailed, error} } = field;
    return (
      <TextareaAutoSize className={submitFailed && error ? 'comment-error' : ''} minRows={5} {...field.input} placeholder="Write your constructive review here"/>
    )
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
    return (
      <Slider
        onBeforeChange={() => $('.' + input.name + ' div[role="slider"]').focus()}
        className={sliderClass} //used to change track colors on changes
        name={input.name}
        {...input}
        dots
        handle={passedProps => handle(passedProps, textProps)}
        max={4}
        defaultValue={0}
      />
    );
  }

  render() {
    const { quartersList, coursesList, professorsList, handleSubmit, submitting, userInfo, location, history } = this.props;
    const { classInfo } = this.state;
    let quarter, course, professor;
    if (quartersList && coursesList && coursesList.departmentsListLoaded && professorsList) {
      if (location.state) {
        quarter = quartersList.object[location.state.quarter_id].label;
        course = coursesList.object[location.state.course_id].label;
        professor = professorsList.object[location.state.professor_id].label;
      }
      else if (classInfo) {
        quarter = quartersList.object[classInfo.quarter.id].label;
        course = coursesList.object[classInfo.course.id].label;
        professor = professorsList.object[classInfo.professor.id].label;
      }
    }
    if (location.state || classInfo !== undefined) { //passed values from postSearch
      return (
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
          <RedirectModal history={history} redirectModalOpen={classInfo === null || classInfo && classInfo.user_posted} classInfoExists={classInfo && classInfo.user_posted ? true : false} />
          <div styleName='postInfo'>
            <h3>{quarter}</h3>
            <h3>{course ? course : classInfo === null ? 'No class exists for this page.': 'Loading...'}</h3>
            <h3>{professor}</h3>
          </div>
          <div styleName='postGuidelines' className='row'>
            <div className='col-12 col-md-6'>
              <div className='card'>
                <div className='card-header'>GUIDELINES TO FOLLOW</div>
                  <div className='card-body'>
                    <ul>
                      <li>When moving the sliders, refer to the pop-up texts</li>
                      <li>If unsure about a question, select <div tabIndex='0' styleName='popper-target-guidelines'><i className='fa fa-question'/></div> for more details</li>
                      <li>Remove unfair bias from your review</li>
                      <li>Proofread your comments before submission</li>
                      <li>Make respectful comments</li>
                      <li>Give useful feedback that you would have liked to know before taking the class</li>
                    </ul>
                </div>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='card'>
                <div className='card-header'>THINGS TO AVOID</div>
                <div className='card-body'>
                  <ul >
                    <li>Using hate speech or excessive profanity</li>
                    <li>Speaking on behalf of others</li>
                    <li>Using personally identfiable information of yourself or other students or faculty</li>
                    <li>Sharing links</li>
                    <li>Sharing names other than the professor being rated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <h3>Professor</h3>
          <h6>Attitude {infoTooltip(textOptions.attitude.info)}</h6>
          <Field name='attitude' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.attitude} component={this.renderSlider} />
          <h6>Availability {infoTooltip(textOptions.availability.info)}</h6>
          <Field name='availability' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.availability} component={this.renderSlider} />
          <h6>Clarity {infoTooltip(textOptions.clarity.info)}</h6>
          <Field name='clarity' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.clarity} component={this.renderSlider} />
          <h6>Grading Speed {infoTooltip(textOptions.grading_speed.info)}</h6>
          <Field name='grading_speed' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.grading_speed} component={this.renderSlider} />
          <h6>Resourcefulness {infoTooltip(textOptions.resourcefulness.info)}</h6>
          <Field name='resourcefulness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.resourcefulness} component={this.renderSlider} />

          <h3>Class</h3>
          <h6>Easiness {infoTooltip(textOptions.easiness.info)}</h6>
          <Field name='easiness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.easiness} component={this.renderSlider} />
          <h6>Workload {infoTooltip(textOptions.workload.info)}</h6>
          <Field name='workload' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.workload} component={this.renderSlider} />

          <h3>General</h3>
          <h6>Would you recommend this course with this professor? {infoTooltip(textOptions.recommend.info)}</h6>
          <Field name='recommended' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.recommend} component={this.renderSlider} />
          <h6>Comments {infoTooltip(textOptions.comment.info)}</h6>
          <Field name="comment" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
          <p>Max characters: {this.state.term.length} / 750</p>
          <label>
            {`Display ${userInfo.majors.length > 1 ? 'majors' : 'major'}`}
            <Field name='display_majors' component='input' type='checkbox' />
          </label>
          <label>
            Display graduation year
            <Field name='display_grad_year' component='input' type='checkbox' />
          </label>
          <br />
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
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList
  };
}

export default reduxForm({
  validate,
  form: 'postEval',
  initialValues: { display_majors: true, display_grad_year: true }
})
(connect(mapStateToProps, null)(PostEval));
