import React from 'react';
import '../styles/eval.scss';

const Eval = ()  => {
  return (
    <div styleName='eval'>
      <div styleName='vote'>
        <i className='fa fa-caret-up active' />
        <i className='fa fa-caret-down' />
      </div>
      <div styleName='evalContent'>
        <div styleName='evalInfo' className='row'>
          <div className='col-12 col-md-6'>
            Fall 2017
          </div>
          <div className='col-12 col-md-6'>
            Course/Professor
          </div>
        </div>
        <div styleName='scores' className='row'>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Average</div>
                <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
          <div styleName='scoreBlock' className='col-sm-4 col-md-2'>
            <div styleName='scoreTitle'>Easiness</div>
              <div styleName='scoreNum'>
                4.2
              </div>
          </div>
        </div>
        <div styleName='comment'>
          <div styleName='commentQuote'>
            "Great teacher"
          </div>
          <div styleName='commentReport'>
            Report post
          </div>
        </div>
      </div>
    </div>
  );
}

export default Eval;
