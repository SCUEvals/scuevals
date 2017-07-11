import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import promise from 'redux-promise';

import reducers from './reducers';
import Searchbar from './containers/searchbar';
import SearchContent from './containers/searchContent';
import About from './components/about';
import Footer from './components/footer';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
      <div>
        <Searchbar />
        <BrowserRouter>
            <Switch>
              <Route path="/about" component={About} />
              <Route path="/:id" component={SearchContent} />
					    <Route path="/" component={SearchContent} />
				    </Switch>
        </BrowserRouter>
        <Footer />
      </div>
  </Provider>,
	document.getElementById('app')
);

//window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() for browser extension to work for development
