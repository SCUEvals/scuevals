//Source: https://gist.github.com/paulsturgess/ebfae1d1ac1779f18487d3dee80d1258
import axios from 'axios';

import { storeWithMiddleware } from '../../app/index';

class API {

  constructor() {
    var headers = {'Content-Type': 'application/json'}; //Content-Type will be stripped in GET requests automatically by axios
    if (storeWithMiddleware.getState().userInfo) { //userInfo initial state looks for localStorage and initializes with it if exists. Assume jwt exists if userInfo exists
      headers.Authorization = 'Bearer ' + storeWithMiddleware.getState().userInfo.jwt;
      console.log(headers.Authorization);
    }

    let api = axios.create({
      headers: headers,
      baseURL: 'http://api.scuevals.com',
      //timeout: 100
    });
    //api.interceptors.response.use(this.handleSuccess, this.handleError);
    this.api = api;
  }

  handleError = error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with status code out of range of 2xx.\n',
        'Data:', error.response.data, '\n',
        'Status:', error.response.status, '\n',
        'Header:', error.response.headers, '\n\n',
        'Request config:', error.config,
      );
    }
    else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('Server didn\'t respond to request.\n',
      'Request config:', error.config
     );
    }
    else {
     // Something happened in setting up the request that triggered an Error
     console.error('Something happened in request setup that triggered an error.\n',
      'Message:', error.message, '\n\n',
      'Request config:', error.config
    );
    }
  }

    // switch (error.response.status) {
    //   case 500:
    //     this.redirectTo(document, '/500');
    //   case 401:
    //     this.redirectTo(document, '/')
    //     break;
    //   case 404:
    //     this.redirectTo(document, '/404')
    //     break;
    //   default:
    //     this.redirectTo(document, '/')
    //     break;
    // }
  //  return Promise.reject(error)

  // redirectTo = (document, path) => {
  //   document.location = path
  // }

  get(path, callback, params) { //params optional, may be null
    return this.api.get(path, params).then(response => callback(response.data)).catch(error => this.handleError(error));
  }

  patch(path, payload, callback) {
    return this.api.patch(path, payload).then(response => callback(response.data)).catch(error => this.handleError(error));
  }

  post(path, payload, callback) {
    return this.api.post(path, payload).then(response => callback(response.data)).catch(error => this.handleError(error));
  }

}

export default API;
