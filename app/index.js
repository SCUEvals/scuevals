import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import promise from 'redux-promise';

import reducers from './reducers';
import SearchBar from './containers/searchBar';
import SearchContent from './containers/searchContent';
import About from './components/about';
import Footer from './components/footer';
import Home from './components/home';
import PostEval from './containers/postEval';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <div>
        <SearchBar />
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/search" component={SearchContent} />
          <Route path="/post" component={PostEval} />
  		    <Route path="/" component={Home} />
  	    </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  </Provider>,
	document.getElementById('app')
);

//window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() for browser extension to work for development
