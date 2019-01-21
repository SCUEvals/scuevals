import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import jwtDecode from 'jwt-decode';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';

import API from '../services/api';
import '../styles/home.scss';
import { setUserInfoAction } from '../actions';
import RecentEvalsWidget from './recentEvalsWidget';
import TopsWidget from './topsWidget';
import NonStudentModal from '../components/nonStudentModal';
import ErrorModal from '../components/errorModal';
import WriteOnly from '../components/writeOnly';
import { INCOMPLETE, READ_EVALUATIONS, WRITE_EVALUATIONS } from '../index';
import { userInfoPT, locationPT, historyPT } from '../utils/propTypes';

class Home extends Component {
  static propTypes = {
    userInfo: userInfoPT,
    setUserInfo: PropTypes.func.isRequired,
    history: historyPT,
    location: locationPT,
  };

  static signOut(props) {
    props.location.signOut = false; // eslint-disable-line no-param-reassign
    props.setUserInfo(null);
    ReactGA.set({ userId: undefined });
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      nonStudentModalOpen: false,
      error: null,
    };
    this.closeNonStudentModal = this.closeNonStudentModal.bind(this);
    this.closeErrorModal = this.closeErrorModal.bind(this);
  }

  componentDidMount() {
    if (this.props.location.signOut) {
      Home.signOut(this.props);
    }
  }

  componentWillReceiveProps(props) {
    if (props.location.signOut) {
      Home.signOut(props);
    }
  }

  authWithBackEnd(token, referrer) {
    const client = new API();
    client.post('/auth', { id_token: token }, (responseData) => {
      const decodedJwt = jwtDecode(responseData.jwt);
      ReactGA.set({ userId: decodedJwt.sub.id });

      if (responseData.status === 'new') {
        const { sub: { type, id: userId, alumni } } = decodedJwt;
        ReactGA.event({ category: 'User', action: 'Signed Up' });
        ReactGA.set({ userId });
        if (type === 'u' || alumni) this.setState({ nonStudentModalOpen: true });
      }

      this.setState({ loading: false }, () => {
        this.props.setUserInfo(responseData.jwt);
        // if (decodedJwt.sub.type === 's') {
        if (referrer) {
          if (decodedJwt.sub.permissions.includes(INCOMPLETE)) this.props.history.push('/profile', { referrer });
          else this.props.history.push(referrer, { referrer });
        } else if (decodedJwt.sub.permissions.includes(INCOMPLETE)) this.props.history.push('/profile');
        // }
      });
    })
      .catch((e) => {
        this.setState({ loading: false, error: e });
      });
  }

  closeNonStudentModal() {
    this.setState({ nonStudentModalOpen: false });
  }

  closeErrorModal() {
    this.setState({ error: null });
  }

  render() {
    const { userInfo, setUserInfo, location } = this.props;
    const referrer = location.state ? location.state.referrer : null;
    const readAccess = userInfo && userInfo.permissions.includes(READ_EVALUATIONS);
    const writeAccess = userInfo && userInfo.permissions.includes(WRITE_EVALUATIONS);

    // if Google login succeeded, and in process of sending to backend
    if (!userInfo && this.state.loading) {
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
        </div>
      );
    } else if (readAccess) {
      return (
        <div styleName="home" className="content">
          {this.state.nonStudentModalOpen && ( // don't want rendered in DOM at all unless true
            <NonStudentModal
              nonStudentModalOpen
              closeNonStudentModal={this.closeNonStudentModal}
              alumni
            />
          )}
          <section>
            <h3 styleName="title">SCU Evals</h3>
            <p>
              Welcome to the best platform for writing and reading evaluations for professors and
              courses at Santa Clara University!
            </p>
            {writeAccess && ( // && userInfo.type === 's'
              <p>
                You are probably here because you are wondering whether a professor or course will
                be a good choice for next quarter, or maybe because you want to share your thoughts
                on that awesome class you just finished. Either way, you have come to the right
                place. We are here to make it simpler for you to find classes that you would not
                only learn something useful from, but also enjoy.
              </p>
            )}
            <p>
              This platform aims to solve all of the issues where other platforms failed. For
              example, only verified SCU students are able to post evaluations here. In fact, only
              people affiliated with SCU can even use the website. Think of it as an extension of
              the SCU community with the goal to make your life easier.
            </p>
            {writeAccess ?
              <p>
              Use the search bar above to look for a specific course or professor, or, why not post
              an evaluation for a class {'you\'ve'} taken? In that case, hit the {'"Post Evaluation" '}
              button below and {'we\'ll'} get you started!
              </p>
              :
              <p>
              Since you {'aren\'t'} a student, you {'won\'t'} be able to vote on or post evaluations,
              but {'you\'re'} welcome to browse and read all of the evaluations.
              </p>
            }
          </section>
          <hr />
          <div styleName="linkBtns">
            {writeAccess && (
              <Link to="/post" className="btn">Post Evaluation</Link>
            )}
            <Link to="/evaluations" className="btn">Browse Evaluations</Link>
          </div>

          {writeAccess && (
            <hr />
          )}
          {!location.signOut && (
            <div className="row">
              <div className="col-lg-6">
                <RecentEvalsWidget count={10} />
              </div>
              <div className="col-lg-6">
                <TopsWidget count={10} />
              </div>
            </div>
          )}
        </div>
      );
    } else if (userInfo) {
      return (
        <WriteOnly setUserInfo={setUserInfo} />
      );
    }
    // if not logged in
    return (
      <div styleName="home login">
        {this.state.error && ( // don't want rendered in DOM at all unless true
          <ErrorModal
            error={this.state.error}
            closeErrorModal={this.closeErrorModal}
          />
        )}
        <h1 styleName="logo">SCU Evals</h1>
        <GoogleLogin
          clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
          buttonText=""
          onSuccess={(info) => {
            this.setState(
              { loading: true },
              this.authWithBackEnd(info.tokenObj.id_token, referrer),
            );
          }}
          // eslint-disable-next-line no-console
          onFailure={err => console.error('Google Login Error: ', err)}
          className="btn"
          styleName="loginBtn"
        >
          <img className="pull-left" alt='Google "G" logo' src="/images/googleG.jpg" />
          <span>Sign in with Google</span>
        </GoogleLogin>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  setUserInfo: setUserInfoAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
