import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { storeWithMiddleware, INCOMPLETE } from '../index';

export default function requireAuth(PassedComponent, extraProps = {}, reqPermissions) {
  // note that each time new route accessed, this class will be re-mounted
  class AuthenticatedPassedComponent extends Component {
    static propTypes = {
      location: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);
      this.userInfo = storeWithMiddleware.getState().userInfo;
      this.permissionsSatisfied = !reqPermissions || this.userInfo && reqPermissions.some(reqRole => this.userInfo.permissions.includes(reqRole));
    }

    componentWillMount() { // check auth
      const { location, history } = this.props;
      if (!this.userInfo) {
        if (location.pathname !== '/') history.push('/', { referrer: location.pathname });
      } else {
        if (this.userInfo.permissions.includes(INCOMPLETE) && location.pathname !== '/profile') history.push('/profile', { referrer: location.pathname });
        else if (!this.permissionsSatisfied && location.pathname !== '/') history.push('/'); // in this case, don't want to pass referrer
      }
    }

    render() {
      if (this.permissionsSatisfied) return <PassedComponent {...this.props} {...extraProps} />;
      return null;
    }
  }

  return withRouter(AuthenticatedPassedComponent);
}
