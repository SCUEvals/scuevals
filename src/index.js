import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import promise from 'redux-promise';
import ReactGA from 'react-ga';
import jwtDecode from 'jwt-decode';

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
import PostSearch from './containers/postSearch';
import ViewMyEvals from './containers/viewMyEvals';

import requireAuth from './components/requireAuth';
import API from './services/api';
import { setUserInfo } from './actions';

import './styles/global.scss?global';
import './styles/index.scss';

export const INCOMPLETE = 0;
export const STUDENT_READ = 1;
export const STUDENT_WRITE = 2;
export const ADMINISTRATOR = 10;
export const API_KEY = 20;

ReactGA.initialize('UA-102751367-1');

export const storeWithMiddleware = createStore(
  reducers, //note: undecodeable jwt will be removed in userInfo reducer here if altered by user, so safe to assume next steps have decodeable jwt
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), //for browser's Redux DevTools add-on to work for development
  applyMiddleware(promise)
);

if (localStorage.getItem('jwt')) {
  let decodedJwt = jwtDecode(localStorage.getItem('jwt')); //won't fail, reducers above took care of undecodeable jwt (check note for reducers above)
  if (new Date().getTime() / 1000 > decodedJwt.exp) { //if token expired, delete it
    localStorage.removeItem('jwt');
    storeWithMiddleware.dispatch(setUserInfo(null)); //userInfo decoded from expired token, so delete it
    renderDOM();
  }
  else { //else verify with back end
    const client = new API();
    client.get('auth/validate',
      responseData => {
        if (responseData.jwt) {
          ReactGA.set({ userId: decodedJwt.sub.id }); //id will be same from prev json token, no need to decode new one from responseData and find id
          localStorage.setItem('jwt', responseData.jwt);
        }
        else localStorage.removeItem('jwt'); //else responseData.msg error msg occurs if not valid
        renderDOM();
      },
      null, //no passedParams
      () => { //custom handleError function, if error returned assume jwt invalid
        localStorage.removeItem('jwt');
        storeWithMiddleware.dispatch(setUserInfo(null)); //userInfo incorrect (decoded invalid jwt), so delete it
        renderDOM();
      }
    );
  }
}
else { //no jwt found
  renderDOM();
}

function renderDOM () {
  ReactDOM.render(
    <Provider store={storeWithMiddleware}>
      <BrowserRouter>
        <GAListener>
          <div id='push-footer' styleName='push-footer'>
            <Header />
            <div className='container'>
              <Switch>
                <Route exact path='/search/:search' component={requireAuth(SearchContent, null, [STUDENT_READ])} />
                <Route exact path='/post/:quarter_id(\d+)/:course_id(\d+)/:professor_id(\d+)' component={requireAuth(PostEval, null, [STUDENT_WRITE])} />
                <Route exact path='/professors/:id(\d+)/post' component={requireAuth(PostSearch, {type: 'professors'}, [STUDENT_WRITE])} />
                <Route exact path='/courses/:id(\d+)/post' component={requireAuth(PostSearch, {type: 'courses'}, [STUDENT_WRITE])} />
                <Route exact path='/professors/:id(\d+)' component={requireAuth(ViewEvals, {type: 'professors'}, [STUDENT_READ])} />
                <Route exact path='/courses/:id(\d+)' component={requireAuth(ViewEvals, {type: 'courses'}, [STUDENT_READ])} />
                <Route exact path='/about' component={About} />
                <Route exact path='/privacy' component={Privacy} />
                <Route exact path='/profile/evals' component={requireAuth(ViewMyEvals)} />
                <Route exact path='/profile' component={requireAuth(Profile)} />
                <Route exact path='/post' component={requireAuth(PostSearch, null, [STUDENT_WRITE])} />
                <Route exact path='/' component={requireAuth(Home)} />
                <Redirect to='/' />
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
