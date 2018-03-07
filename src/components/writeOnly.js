import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import '../styles/home.scss';

//component for Home when only write access
const WriteOnly = (props)  => {
  const { setUserInfo } = props;
  return (
    <div className='content'>
      <section>
        <h3 styleName='title'>SCU Evals</h3>
        <p>
          Welcome to the best platform for writing and reading evaluations for professors and courses
          at Santa Clara University!
        </p>
        <p>
          Congratulations on completing that last quarter! In order for us to stay relevant, we always need new evaluations.
          Therefore, {`we're`} asking users to spend a couple minutes writing at least one evaluation before you get continued
          unlimited access to the site. We promise it {`won't`} take long!
        </p>
          <Link to='/profile'>Go to profile</Link>
          <br />
          <button
            type='button'
            className='signOutBtn'
            onClick={() => {
              localStorage.removeItem('jwt');
              setUserInfo(null);
              //no need to push history to '/' since this component part of container Home with route path already '/'
            }}
          >
            Sign Out
          </button>
      </section>
      <hr />
      <Link to='/post' className='btn'>Post Evaluation</Link>
    </div>
  );
};

WriteOnly.propTypes = {
  setUserInfo: PropTypes.func.isRequired
};

export default WriteOnly;
