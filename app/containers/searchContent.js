import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import axios from 'axios';
import { setSearchResults, postConfig, ROOT_URL } from '../actions';

class searchContent extends Component {

  shouldComponentUpdate(nextProps) {
    if (this.props.searchResults !== nextProps.searchResults) return false; //don't update on new search results, only want 1st instance of it
    else return true;
  }

  componentWillMount() {
    if (!this.props.searchResults && this.props.match.params.search.length > 2) { //if loading this component straight from GET request (rather than being routed with React Router)
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.jwt
        },
        params: {
          q: this.props.match.params.search,
          university_id: 1
        }
      };

      axios.get(`${ROOT_URL}/search`, options, postConfig)
      .then(
        response => {
          console.log('response:', response);
          this.props.setSearchResults(response.data);
          console.log('search', this.props.searchResults);
          $('#searchBarResults').remove(); //remove results dropdown when submitting until new input entered after
          this.forceUpdate(); //passes shouldComponentUpdate, ensures that new state read by component
        }
      )
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      })
    }
  }

  render() {
    if (this.props.searchResults) {
      return (
        <div className="content results">
          {this.props.searchResults.professors.length === 0 && this.props.searchResults.courses.length === 0 ?
            <h5>No results found for "{this.props.match.params.search}"</h5>
            :
            <h5>Showing results for "{this.props.match.params.search}"</h5>
          }
          {this.props.searchResults.professors.length > 0 ?
            <div>
              <h4>Professors</h4>
              <BootstrapTable version='4' data={this.props.searchResults.professors} striped={true} hover={true}>
                <TableHeaderColumn dataFormat={nameFormatter} dataField="first_name" isKey={true} dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
              </BootstrapTable>
            </div>
            : ''
          }
          {this.props.searchResults.courses.length > 0 ?
          <div>
            <h4>Classes</h4>
            <BootstrapTable version='4' data={this.props.searchResults.courses} striped={true} hover={true}>
              <TableHeaderColumn dataField="department" dataAlign="center" dataSort={true}>Department</TableHeaderColumn>
              <TableHeaderColumn dataField="number" dataSort={true}>Number</TableHeaderColumn>
              <TableHeaderColumn dataField="title" isKey={true} dataSort={true}>Title</TableHeaderColumn>
            </BootstrapTable>
          </div>
          : ''
        }
        </div>
      ); /* note: isKey={true} is not correctly set since there is no column displayed that is entirely unique,
            but it is needed to render. However, \ is does not affect functionality for what we are using it for*/
    } else if (this.props.match.params.search.length > 2){
      return (
        <div className="loadingWrapper">
  				<i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
  			</div>
      );
    } else {
      return (
        <div className='content results'>
          <h5>Please search with at least 3 characters.</h5>
        </div>
      );
    }
  }
}

function nameFormatter(cell, row) {
  return row.first_name + ' ' + row.last_name;
}

function mapStateToProps(state) {
  return {
    searchResults: state.searchResults
  };
}
//
// function priceFormatter(cell, row){
//   return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
// } <TableHeaderColumn dataField="price" dataFormat={priceFormatter}

export default connect(mapStateToProps, { setSearchResults })(searchContent);
