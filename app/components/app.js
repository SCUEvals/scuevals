import React from 'react';

import Searchbar from '../containers/searchbar';
import Content from './content';
import Footer from './footer';

const App = () => {
  return (
    <div>
    <Searchbar />
    <div className="container content">
      Test
    </div>
    <Footer />
    </div>
  );
}

export default App;
