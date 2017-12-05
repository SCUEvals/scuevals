import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import promise from 'redux-promise';
import ReactGA from 'react-ga';
import jwtDecode from 'jwt-decode';

import style from '../public/styles/style.scss';

import reducers from './reducers';
import Header from './containers/header';
import SearchContent from './containers/searchContent';
import About from './containers/about';
import Footer from './components/footer';
import Home from './containers/home';
import PostEval from './containers/postEval';
import Privacy from './containers/privacy';
import GAListener from './components/gaListener';
import Profile from './containers/profile';
import ViewEvals from './containers/viewEvals';

import requireAuth from './components/requireAuth';
import API from '../public/scripts/api_service';

ReactGA.initialize('UA-102751367-1');

export const storeWithMiddleware = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), //for browser's Redux DevTools add-on to work for development
  applyMiddleware(promise)
);


//const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

if (localStorage.jwt) {
  if (new Date().getTime() / 1000 > jwtDecode(localStorage.jwt).exp) { //if token expired, delete it
    localStorage.removeItem('jwt');
    renderDOM();
  }
  else { //else verify with back end
    const client = new API();
    client.get('auth/validate', responseData => {
      localStorage.jwt = responseData.jwt;
      renderDOM();
    });
  }
}
else {
  renderDOM();
}

function renderDOM () {
  ReactDOM.render(
    <Provider store={storeWithMiddleware}>
      <BrowserRouter>
        <GAListener>
          <div id='push-footer'>
            <Header />
            <div className='container'>
              <Switch>
                <Route path="/about" component={About} />
                <Route path="/search/:search" component={requireAuth(SearchContent)} />
                <Route path="/post/:quarter_id(\d+)/:course_id(\d+)/:professor_id(\d+)" component={requireAuth(PostEval)} />
                <Route path="/professors/:professor_id(\d+)" component={requireAuth(ViewEvals, {type: "professors"})} />
                <Route path="/courses/:course_id(\d+)" component={requireAuth(ViewEvals, {type: "courses"})} />
                <Route path="/privacy" component={Privacy} />
                <Route path="/profile" component={requireAuth(Profile)} />
                <Route exact path="/" component={requireAuth(Home)} />
                <Redirect to="/" />
              </Switch>
            </div>
          </div>
          <Footer />
        </GAListener>
      </BrowserRouter>
    </Provider>,
    document.getElementById('app')
  )
}
