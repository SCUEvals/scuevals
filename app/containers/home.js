import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import jwtDecode from 'jwt-decode';
import API from '../../public/scripts/api_service';

import { setUserInfo } from '../actions';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  authWithBackEnd(token) {
    this.setState({loading: true});
    const client = new API();
    client.post('/auth', {id_token: token}, responseData =>  {
      localStorage.setItem("jwt", responseData.jwt);
      this.props.setUserInfo(responseData.jwt);
      if (jwtDecode(responseData.jwt).sub.roles.includes(0)) this.props.history.push('/profile');
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
          Home
        </div>
      );
    }
    else { //if not logged in
      return (
        <div className="login">
          <h1>SCU Evals</h1>
          <GoogleLogin
            tag='div'
            hostedDomain="scu.edu"
            clientId="471296732031-0hqhs9au11ro6mt87cpv1gog7kbdruer.apps.googleusercontent.com"
            buttonText=''
            onSuccess={info => this.authWithBackEnd(info.tokenObj.id_token)}
            onFailure={err => console.error('Google Login Error: ', err)}
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
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, { setUserInfo })(Home);
