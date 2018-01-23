 import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'; //want to check if multiple majors

import API from '../services/api';
import '../../node_modules/rc-slider/dist/rc-slider.min.css?global';
import '../styles/postEval.scss';

const Handle = Slider.Handle;
// \xA0 is used for non-breaking whitespace,
const textOptions = {
  attitude: {
    one: 'Unapproachable',
    two: 'Negative or mean',
    three: 'Nice enough',
    four: 'Fantastic',
    info: 'How did you feel the professor acted towards students?'
  },
  availability: {
    one: 'Impossible to reach',
    two: 'Barely available',
    three: 'Usually reachable',
    four: 'Super flexible',
    info: 'How easy is it to contact or meet with the professor?'
  },
  clarity: {
    one: 'Cannot understand',
    two: 'Often unclear',
    three: 'Usually get it',
    four: 'Great explainer',
    info: 'Were the professor\'s notes and explanations clear (word choice, handwriting, etc.)?'
  },
  grading_speed: {
    one: 'Not\xA0until end of quarter',
    two: 'Extremely slow',
    three: 'After a few classes',
    four: 'By\xA0next class',
    info: 'How quickly does the professor grade assignments?'
  },
  resourcefulness: {
    one: 'Provides nothing',
    two: 'Occasional handouts',
    three: 'Shares most things',
    four: 'Shares everything',
    info: 'How much material does the professor share to help students learn?'
  },
  workload: {
    one: 'There\'s work?',
    two: 'Easy stuff',
    three: 'You\'ll survive',
    four: 'Good luck',
    info: 'How much work was assigned compared to other classes?'
  },
  difficulty: {
    one: 'Easy\xA0"A"',
    two: 'Study the\xA0week before',
    three: 'Challenging',
    four: 'You\xA0will suffer',
    info: 'How hard was the material for this course?'
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

const infoTooltip = (info) => {
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
  let managerStyle = {};
  managerStyle.left = props.offset + '%'; //to fix transitions with popper
  managerStyle.position = 'absolute';

  let popperStyle = {};
  if (value === 0) {
    popperStyle.visibility = 'hidden';
    popperStyle.opacity = '0'; //needed for transition animation
  }

  return (
    <Manager style={managerStyle} styleName='popper-manager'>
      <Target>
        {({ targetProps }) => (
          <Handle value={value} {...restProps}>
            <div {...targetProps} styleName='handleNum'>
              {value !== 0 ? value : ''}
            </div>
          </Handle>
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
    this.state = { term: '' };
  }

  onSubmit(values) {
    console.log('values:', values);
    this.props.match.params.evaluation = values; //typically don't want to alter params, but submission redirects after post so OK. No need to make deep copy to preserve params
    let client = new API();
    return client.post('/evaluations', this.props.match.params, () => this.props.history.push('/'));
  };


  renderTextArea(field) {
    return (
      <TextareaAutoSize minRows={5} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  renderSlider(props) {
    let track = $('.' + props.input.name + ' .rc-slider-track');
    if (track.length === 1) { //if exists
      track = track[0];
      switch(props.input.value) {
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

    return (
        <Slider
          onBeforeChange={() => $('.' + props.input.name + ' div[role="slider"]').focus()}
          className={props.input.name} //used to change track colors on changes
          name={props.input.name}
          {...props.input}
          dots
          handle={passedProps => handle(passedProps, props.textProps)}
          max={4}
          defaultValue={0}
          />
    );
  }

  render() {
    const { handleSubmit, submitting, userInfo } = this.props;
    const required = value => {};

    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
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
        <Field name='attitude' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.attitude} component={this.renderSlider} validate={[required]} />
        <h6>Availability {infoTooltip(textOptions.availability.info)}</h6>
        <Field name='availability' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.availability} component={this.renderSlider} />
        <h6>Clarity {infoTooltip(textOptions.clarity.info)}</h6>
        <Field name='clarity' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.clarity} component={this.renderSlider} />
        <h6>Grading Speed {infoTooltip(textOptions.grading_speed.info)}</h6>
        <Field name='grading_speed' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.grading_speed} component={this.renderSlider} />
        <h6>Resourcefulness {infoTooltip(textOptions.resourcefulness.info)}</h6>
        <Field name='resourcefulness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.resourcefulness} component={this.renderSlider} />

        <h3>Class</h3>
        <h6>Difficulty {infoTooltip(textOptions.difficulty.info)}</h6>
        <Field name='difficulty' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.difficulty} component={this.renderSlider} />
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
          <Field name='displayMajors' component='input' type='checkbox' />
        </label>
        <label>
          Display graduation year
          <Field name='displayGradYear' component='input' type='checkbox' />
        </label>
        <br />
        <button disabled={submitting} type="submit" className="btn">{submitting ? 'Submitting...' : 'Submit'}</button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default reduxForm({
  form: 'postEval',
  initialValues: { displayMajors: true, displayGradYear: true }
})
(connect(mapStateToProps, null)(PostEval));
