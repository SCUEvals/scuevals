import React, {Component} from 'react';
import { withRouter } from 'react-router';
import jwtDecode from 'jwt-decode';
import Profile from '../containers/profile';
import Home from '../containers/home';

export default function requireAuth(Component) {

  class AuthenticatedComponent extends Component {

    componentWillMount() { //check auth
      if (!localStorage.jwt) this.props.history.push('/');
      else if (jwtDecode(localStorage.jwt).sub.roles.includes(0)) this.props.history.push('/profile'); //if incomplete user
    }

    render() {
      return localStorage.jwt ?
        jwtDecode(localStorage.jwt).sub.roles.includes(0) ?
          Component === Profile ? <Component {...this.props} /> : null
        :
         <Component { ...this.props } />
      : Component === Home ? <Component {...this.props} /> : null
    }
  }

  return withRouter(AuthenticatedComponent);
}
