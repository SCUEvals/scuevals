import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import ReactGA from 'react-ga';

import { setUserInfo, setSearchResults } from '../actions';
import SearchBar from './searchBar';
import '../styles/header.scss';
import { INCOMPLETE, STUDENT_READ } from '../index';

class Header extends Component {

  static propTypes = {
    userInfo: PropTypes.object,
    setUserInfo: PropTypes.func.isRequired,
    setSearchResults: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { userInfo } = this.props;
    let pushFooter = document.getElementById('push-footer');
    if (userInfo && !userInfo.roles.includes(INCOMPLETE) && userInfo.roles.includes(STUDENT_READ)) pushFooter.classList.remove('flex');
    else pushFooter.classList.add('flex');
  }

  componentWillUpdate(nextProps) {
    if (nextProps.userInfo !== this.props.userInfo) {
      let pushFooter = document.getElementById('push-footer');
      if (nextProps.userInfo && !nextProps.userInfo.roles.includes(INCOMPLETE) && nextProps.userInfo.roles.includes(STUDENT_READ)) pushFooter.classList.remove('flex');
      else pushFooter.classList.add('flex');
    }
  }

  render() {
    const { setUserInfo, userInfo, setSearchResults } = this.props;
    if (userInfo && !userInfo.roles.includes(INCOMPLETE) && userInfo.roles.includes(STUDENT_READ)) {
      return (
        <header>
          <SearchBar location={this.props.location} history={this.props.history} />
          <div styleName='header-items' className='container'>
            <Link to={'/'} className='homeBtn' styleName='headerHomeBtn'>
              <i className='fa fa-home' />
            </Link>
            <Link className='btn' styleName='profileBtn' to={'/profile'}>
              <img styleName='profile-img' src={userInfo.picture} alt='Profile picture' />
              {userInfo.first_name}
            </Link>
            <button className='btn' styleName='signOutBtn' type='button' onClick={() => {
              setSearchResults(null);
              localStorage.removeItem('jwt');
              setUserInfo(null);
              ReactGA.set({ userId: undefined });
              if (this.props.history.location.pathname !== '/') this.props.history.push('/');
            }} >
              Sign Out
            </button>
          </div>
        </header>
      );
    }
    else return null;
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    searchResults: state.searchResults,
    departmentsList: state.departmentsList
  };
}

export default withRouter(connect(mapStateToProps, { setUserInfo, setSearchResults })(Header));
