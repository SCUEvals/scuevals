import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';

import API from '../services/api';
import '../styles/home.scss';

import { setUserInfo } from '../actions';

class Home extends Component {

  static defaultProps = {
    setUserInfo: PropTypes.func,
    history: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  authWithBackEnd(token) {
    this.setState({loading: true});
    const client = new API();
    client.post('/auth', {id_token: token}, responseData =>  {
      let decodedJwt = jwtDecode(responseData.jwt);
      ReactGA.set({ userId: decodedJwt.sub.id });
      try {
        localStorage.setItem("jwt", responseData.jwt);
      } catch(err) {
        console.error("Cannot execute localStorage.setItem (perhaps private mode is enabled). Error:", err);
      }
      this.props.setUserInfo(responseData.jwt);
      if (decodedJwt.sub.roles.includes(0)) this.props.history.push('/profile');
      this.setState({loading: false});
    });
  }

  render() {
    if (!this.props.userInfo && this.state.loading) { //if Google login succeeded, and in process of sending to backend
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
        </div>
      );
    }
    else if (this.props.userInfo) {
      return(
        <div className='content'>
          <h3>SCU Evals</h3>
          <p>Welcome to SCU Evals, the best platform for rating and reviewing professors and courses at Santa Clara University.</p>
          <hr />
          <br />
          <Link to='/post' className='btn'>Quick post</Link>
        </div>
      );
    }
    else { //if not logged in
      return (
        <div styleName="login">
          <h1>SCU Evals</h1>
          <GoogleLogin
            hostedDomain="scu.edu"
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText=''
            onSuccess={info => this.authWithBackEnd(info.tokenObj.id_token)}
            onFailure={err => console.error('Google Login Error: ', err)}
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
