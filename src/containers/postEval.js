 import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';

import API from '../services/api';
import '../../node_modules/rc-slider/dist/rc-slider.min.css?global';
import '../styles/postEval.scss';

const Handle = Slider.Handle;

const textOptions = {
  attitude: {
    one: 'Unapproachable',
    two: 'Negative or mean',
    three: 'Nice enough',
    four: 'Fantastic',
    info: 'How did you feel the professor acted towards students?'
  },
  availability: {
    one: 'Misses own office hours',
    two: 'Only during office hours',
    three: 'Hard to schedule',
    four: 'Super flexible',
    info: 'How easy was it to meet with the professor?'
  },
  clarity: {
    one: 'Impossible to understand',
    two: 'Often unclear',
    three: 'Usually get it',
    four: 'Great explainer',
    info: 'Was the professor\'s notes and explanations clear (word choice, handwriting, etc.)?'
  },
  timeliness: {
    one: 'Won\'t know grade\nuntil end of quarter',
    two: 'Extremely slow grader',
    three: 'Takes a week or two',
    four: 'Typically know\ngrade next class',
    info: 'How quickly does the professor grade assignments?'
  },
  resourcefulness: {
    one: 'Provides nothing',
    two: 'Occasional handouts',
    three: 'Shares most things',
    four: 'Shares everything\nfrom class',
    info: 'How much does the professor share to help students learn?'
  },
  workload: {
    one: 'There\'s work?',
    two: 'Easy stuff',
    three: 'You\'ll survive',
    four: 'Good luck',
    info: 'How much work was assigned compared to other classes?'
  },
  difficulty: {
    one: 'Easy "A"',
    two: 'Study the week before',
    three: 'Challenging',
    four: 'You will suffer',
    info: 'How hard was the material for this course?'
  },
  recommend: {
    one: 'No, avoid at all costs',
    two: 'Only as a last option',
    three: 'Yes, but it could be better',
    four: 'Absolutely',
    info: 'Overall, was this course a good option to take?'
  },
  comment: {
    info: 'Write anything you feel other students would benefit from knowing that the questions above left unanswered.'
  }
};

const infoTooltip = (info) => {
  return (
    <Manager styleName='popper-manager'>
      <Target styleName='popper-target'>
      <i className='fa fa-question-circle'/>
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
    popperStyle.opacity = '0';
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
    this.props.match.params.evaluation = values; //typically don't want to alter params, but submission redirects after post so OK. No need to make deep copy to preserve params
    let client = new API();
    client.post('/evaluations', this.props.match.params, () => this.props.history.push('/'));
  };


  renderTextArea(field) {
    return (
      <TextareaAutoSize minRows={5} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  renderSlider(props) {
    let track = $('.' + props.input.name + ' .rc-slider-track');

    if (track.length === 1) {
      track = track[0];
      if (props.input.value === 1) track.className = 'rc-slider-track track1';
      else if (props.input.value === 2) track.className = 'rc-slider-track track2';
      else if (props.input.value === 3) track.className = 'rc-slider-track track3';
      else if (props.input.value === 4) track.className = 'rc-slider-track track4';
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
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
        <div styleName='postGuidelines' className='row'>
          <div className='col-12 col-md-6'>
            <div className='card'>
              <div className='card-header'>GUIDELINES TO FOLLOW</div>
                <div className='card-body'>
                  <ul>
                    <li>Refer to the rating chart for each question</li>
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
                  <li>Using profanity or hate speech</li>
                  <li>Speaking on behalf of others</li>
                  <li>Using personally identfiable information of yourself or other students or faculty</li>
                  <li>Share links</li>
                  <li>Share names other than the professor being rated</li>
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
        <h6>Grading Timeliness {infoTooltip(textOptions.timeliness.info)}</h6>
        <Field name='timeliness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.timeliness} component={this.renderSlider} />
        <h6>Resourcefulness {infoTooltip(textOptions.resourcefulness.info)}</h6>
        <Field name='resourcefulness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.resourcefulness} component={this.renderSlider} />

        <h3>Class</h3>
        <h6>Workload {infoTooltip(textOptions.workload.info)}</h6>
        <Field name='workload' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.workload} component={this.renderSlider} />
        <h6>Difficulty {infoTooltip(textOptions.difficulty.info)}</h6>
        <Field name='difficulty' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.difficulty} component={this.renderSlider} />

        <h3>General</h3>
        <h6>Would you recommend this course with this professor? {infoTooltip(textOptions.recommend.info)}</h6>
        <Field name='recommended' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.recommend} component={this.renderSlider} />
        <h6>Comments {infoTooltip(textOptions.comment.info)}</h6>
        <Field name="comment" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
        <p>Max characters: {this.state.term.length} / 750</p>
        <br />
        <button type="submit" className="btn">Submit</button>
      </form>
    );
  }
}

export default reduxForm({
  form: 'postEval'
})
(PostEval);
