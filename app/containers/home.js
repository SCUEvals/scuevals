import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleLogin from 'react-google-login';
import jwtDecode from 'jwt-decode';

import { setUserInfo } from '../actions';

class Home extends Component {

  render() {
    return (
      <div className="login">
        <h1>SCU Evals</h1>
        <GoogleLogin
          tag='div'
          hostedDomain="scu.edu"
          clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
          buttonText=''
          onSuccess={props => this.props.setUserInfo(props, () => this.props.history.push('/profile'))}
          onFailure={err => console.error('Error: ', err)}
          className='oauth-btn'
        >
          <div className='loginBtn'>
            <img className='pull-left' alt='Google "G" logo' src='/images/googleG.jpg' />
            <div>Sign in with Google</div>
          </div>
        </GoogleLogin>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, { setUserInfo })(Home);
