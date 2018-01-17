import React, {Component} from 'react';
import { withRouter } from 'react-router';
import jwtDecode from 'jwt-decode';
import Profile from '../containers/profile';
import Home from '../containers/home';
import PropTypes from 'prop-types';

export default function requireAuth(PassedComponent, extraProps={}) {

  class AuthenticatedPassedComponent extends Component {

    static defaultProps = {
      history: PropTypes.object
    }

    componentWillMount() { //check auth
      if (!localStorage.jwt) {
        if (this.props.location.pathname != '/') {
          this.props.history.push('/', {referrer: this.props.location.pathname});
        }
      }
      else if (jwtDecode(localStorage.jwt).sub.roles.includes(0) && this.props.location.pathname != 'profile') {
        this.props.history.push('/profile', {referrer: this.props.location.pathname});
      }
    }

    render() {
      return localStorage.jwt ?
        jwtDecode(localStorage.jwt).sub.roles.includes(0) ?
          PassedComponent === Profile ? <PassedComponent {...this.props} {...extraProps} /> : null
        :
         <PassedComponent { ...this.props }  {...extraProps} />
      : PassedComponent === Home ? <PassedComponent {...this.props} {...extraProps} /> : null
    }
  }

  return withRouter(AuthenticatedPassedComponent);
}
