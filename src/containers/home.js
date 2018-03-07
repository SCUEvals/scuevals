import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import jwtDecode from 'jwt-decode';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';

import API from '../services/api';
import '../styles/home.scss';
import { setUserInfo } from '../actions';
import RecentEvals from './recentEvals';
import NonStudentModal from '../components/nonStudentModal';
import WriteOnly from '../components/writeOnly';
import { INCOMPLETE, READ_EVALUATIONS, WRITE_EVALUATIONS } from '../index';

class Home extends Component {

  static propTypes = {
    userInfo: PropTypes.object,
    setUserInfo: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      nonStudentModalOpen: false
    };
  }

  authWithBackEnd(token, referrer) {
    const client = new API();
    client.post('/auth', {id_token: token}, responseData => {
      if (responseData.status === 'suspended') {

      }
      else if (responseData.status === 'non-student') {
        this.setState({nonStudentModalOpen: true});
      }
      else if (responseData.status === 'new') ReactGA.event({category: 'User', action: 'Signed Up'});
      let decodedJwt = jwtDecode(responseData.jwt);
      ReactGA.set({ userId: decodedJwt.sub.id });
      this.setState({loading: false}, () => {
        this.props.setUserInfo(responseData.jwt);
        try {
          localStorage.setItem("jwt", responseData.jwt);
        } catch(err) {
          /* eslint-disable no-console */
          console.error("Cannot execute localStorage.setItem (perhaps private mode is enabled). Error:", err);
          /* eslint-enable no-console */
        }
        if (referrer) {
          if (decodedJwt.sub.permissions.includes(INCOMPLETE)) this.props.history.push('/profile', { referrer });
          else this.props.history.push(referrer);
        }
        else if (decodedJwt.sub.permissions.includes(INCOMPLETE)) this.props.history.push('/profile');
      });
    });
  }

  render() {
    const { userInfo, setUserInfo, location } = this.props;
    const referrer = location.state ? location.state.referrer : null;
    const read_access = userInfo && userInfo.permissions.includes(READ_EVALUATIONS);
    const write_access = userInfo && userInfo.permissions.includes(WRITE_EVALUATIONS);
    if (!userInfo && this.state.loading) { //if Google login succeeded, and in process of sending to backend
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
        </div>
      );
    }
    else if (read_access) {
      return (
        <div className='content'>
          <section>
            <h3 styleName='title'>SCU Evals</h3>
            <p>
              Welcome to the best platform for writing and reading evaluations for professors and courses
              at Santa Clara University!
            </p>
            <p>
              You are probably here because you are wondering whether a professor or course will be a good choice for next quarter,
              or maybe because you want to share your thoughts on that awesome class you just finished. Either way, you have come to
              the right place. We are here to make it simpler for you to find classes that you
              would not only learn something useful from, but also enjoy.
            </p>
            <p>
              This platform aims to solve all of the issues where other platforms failed. For example, only verified
              SCU students are able to post evaluations here. In fact, only people affiliated with SCU can even use
              the website. Think of it as an extension of the SCU community with the goal to make your life easier.
            </p>
            <p>
              {`Use the search bar above to look for a specific course or professor, or, why not post an evaluation
              for a class you've taken? In that case, hit the "Post Evaluation" button below and we'll get you started!`}
            </p>
          </section>
          <hr />
          {write_access && (
            <Link to='/post' className='btn'>Post Evaluation</Link>
          )}
          {write_access && (
            <hr />
          )}
          <RecentEvals count={10} />
        </div>
      );
    }
    else if (userInfo) {
      return (
        <WriteOnly setUserInfo={setUserInfo} />
      );
    }
    else { //if not logged in
      return (
        <div styleName="login">
          {this.state.nonStudentModalOpen && (
            <NonStudentModal nonStudentModalOpen={true} closeNonStudentModal={() => this.setState({nonStudentModalOpen: false})} />
          )}
          <h1>SCU Evals</h1>
          <GoogleLogin
            hostedDomain="scu.edu"
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText=''
            onSuccess={info => this.setState({loading: true}, this.authWithBackEnd(info.tokenObj.id_token, referrer))}
            onFailure={err => /*eslint-disable no-console*/ console.error('Google Login Error: ', err) /*eslint-enable no-console*/}
            className='btn'
            styleName='loginBtn'
          >
            <img className='pull-left' alt='Google "G" logo' src='/images/googleG.jpg' />
            <span>Sign in with Google</span>
          </GoogleLogin>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, { setUserInfo })(Home);
