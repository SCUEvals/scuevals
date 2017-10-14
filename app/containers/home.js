import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleLogin from 'react-google-login';
import jwtDecode from 'jwt-decode';

import { setUserInfo } from '../actions';
import NewUser from './newUser'

class Home extends Component {

  render() {
    if (localStorage.jwt) {
      const subInfo = jwtDecode(localStorage.jwt).sub;
      return (
        <NewUser firstName={subInfo.first_name} studentID={subInfo.id} />
      );
    }
    else {
      return (
        <div className="login">
          <h1>SCU Evals</h1>
          <GoogleLogin
            tag='div'
            hostedDomain="scu.edu"
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText=''
            onSuccess={props => this.props.setUserInfo(props, () => this.props.history.push('/'))}
            onFailure={err => console.error('Error: ', err)}
            className='oauth-btn'
          >
            <div className='loginBtn'>
              <img className='pull-left' src='/images/googleG.jpg' />
              <div>Sign in with Google</div>
            </div>
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
