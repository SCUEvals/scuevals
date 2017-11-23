import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ()  => {
  return (
    <div className='eval'>
      <div className='vote'>
        <i className='fa fa-caret-up active' />
        <i className='fa fa-caret-down' />
      </div>
      <div className='evalContent'>
        <div className='evalInfo row'>
          <div className='col-12 col-md-6'>
            Fall 2017
          </div>
          <div className='col-12 col-md-6'>
            Course/Professor
          </div>
        </div>
        <div className='row scores'>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Average</div>
                <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
          <div className='scoreBlock col-sm-4 col-md-2'>
            <div className='scoreTitle'>Easiness</div>
              <div className='scoreNum'>
                4.2
              </div>
          </div>
        </div>
        <div className='comment'>
          <div className='commentQuote'>
            "Great teacher"
          </div>
          <div className='commentReport'>
            Report post
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
