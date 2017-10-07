import React, {Component} from 'react';
import { withRouter } from 'react-router';

export default function requireAuth(Component) {

  class AuthenticatedComponent extends Component {

    componentWillMount() {
      this.checkAuth();
    }

    checkAuth() {
      if (!localStorage.jwt) this.props.history.push('/');
    }

    render() {
      return localStorage.jwt
        ? <Component { ...this.props } />
        : null;
    }

  }

  return withRouter(AuthenticatedComponent);
}
