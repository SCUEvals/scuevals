import React, { Component } from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';

import { setUserInfo, ROOT_URL } from '../actions';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  authWithBackEnd(token) {
    this.setState({loading: true});
    axios.post(`${ROOT_URL}/auth`, {id_token: token}, {headers: {'Content-Type': 'application/json'}})
    .then(response =>  {
      localStorage.setItem("jwt", response.data.jwt);
      this.props.setUserInfo(response.data.jwt, response.data.status); //Note: setting user info and then setting load state to false causes rendering twice, causing an unnecessary render, but needed for loading symbol during async request
      this.setState({loading: false});
    })
    .catch(err => {
      console.error('Failed to authenticate with back end. Error:', err);
      this.setState({loading: false});
    });
  }

  render() {
    if (this.props.userInfo) {
      return(
        <div className='content'>
          Home
        </div>
      );
    }
    else if (this.state.loading) { //if Google login succeeded, and in process of sending to backend
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
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
