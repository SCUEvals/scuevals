import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom';

import { setSearchResults } from '../actions';
import API from '../services/api';
import '../styles/searchContent.scss';

class SearchContent extends Component {

  static propTypes = {
    searchResults: PropTypes.object,
    setSearchResults: PropTypes.func,
    departmentsList: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.searchResults && nextProps.searchResults.forceUpdate) return true;
    else if (this.props.searchResults !== nextProps.searchResults) return false; //don't update on new search results, only want 1st instance
    else return true;
  }

  componentWillMount() {
    if (this.props.match.params.search.length > 2 && this.props.history.action === 'POP') { //if loading this component straight from GET request (rather than being routed with React Router (action would be PUSH))
      let client = new API();
      client.get('/search', responseData => {
          this.sortResponseData(responseData);
          this.props.setSearchResults(responseData);
          $('#searchBarResults').hide(); //hide results dropdown when submitting until new input entered after
          this.forceUpdate(); //passes shouldComponentUpdate, ensures that new state read by component
        },
        {q: this.props.match.params.search}
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.departmentsList !== prevProps.departmentsList && this.props.searchResults) {
        let sortedSearchResults = JSON.parse(JSON.stringify(this.props.searchResults)); //make deep copy, state immutable
        this.sortResponseData(sortedSearchResults);
        this.props.setSearchResults(sortedSearchResults);
        $('#searchBarResults').hide(); //hide results dropdown when submitting until new input entered after
        this.forceUpdate(); //passes shouldComponentUpdate, ensures that new state read by component
    }
  }

  sortResponseData(responseData) {
    const { departmentsList } = this.props;
    responseData.professors.sort((a, b) => {
      return a.last_name > b.last_name ? 1 : a.last_name < b.last_name ? -1 : 0;
    });

    if (departmentsList) responseData.courses.sort((a, b) => {
      if (a.department_id == b.department_id) {
        //nums can have letters in them too (ex. 12L), so parse integers and compare
        let parsedANum = parseInt(a.number, 10);
        let parsedBNum = parseInt(b.number, 10);
        //if integers same, check for letters to decide
        if (parsedANum == parsedBNum) return a.number > b.number ? 1 : a.number < b.number ? -1 : 0;
        return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
      }
      else return departmentsList[a.department_id].abbr > departmentsList[b.department_id].abbr ? 1 : departmentsList[a.department_id].abbr < departmentsList[b.department_id].abbr ? -1 : 0;
    });
  }

  sortCourseTitles(a, b, order) {
    const splitA = a.split(' ');
    const splitB = b.split(' ');
    let aDepartment = splitA[0];
    let bDepartment = splitB[0];
    if (order === 'asc') {
      if (aDepartment === bDepartment) {
        //nums can have letters in them too (ex. 12L), so parse integers and compare
        let parsedANum = parseInt(splitA[1], 10);
        let parsedBNum = parseInt(splitB[1], 10);
        //if integers same, check for letters to decide
        if (parsedANum === parsedBNum) return a > b ? 1 : a < b ? -1 : 0;
        else return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
      }
      else return aDepartment > bDepartment ? 1 : aDepartment < bDepartment ? -1 : 0;
    }
    else {
      if (aDepartment === bDepartment) {
        //nums can have letters in them too (ex. 12L), so parse integers and compare
        let parsedANum = parseInt(splitA[1], 10);
        let parsedBNum = parseInt(splitB[1], 10);
        //if integers same, check for letters to decide
        if (parsedANum === parsedBNum) return a > b ? -1 : a < b ? 1 : 0;
        return parsedANum > parsedBNum ? -1 : parsedANum < parsedBNum ? 1 : 0;
      }
      else return aDepartment > bDepartment ? -1 : aDepartment < bDepartment ? 1 : 0;
    }
  }

  courseNumberFormatter(cell, row, departmentsList) {
    return <Link to={`/courses/${row.id}`}>{departmentsList[row.department_id].abbr} {row.number}</Link>;
  }

  courseTitleFormatter(cell, row) {
    return <Link to={`/courses/${row.id}`}>{row.title}</Link>;
  }

  nameFormatter(cell, row) {
    return <Link to={`/professors/${row.id}`}>{`${row.last_name}, ${row.first_name}`}</Link>;
  }

  render() {
    const { searchResults, departmentsList } = this.props;
    const coursesColumns = [
      {
        dataField: 'course',
        text: 'Course',
        formatter: (cell, row) => this.courseNumberFormatter(cell, row, departmentsList),
        sort: true,
        sortFunc: this.sortCourseTitles,
        dataAlign: 'center'
      },
      {
        dataField: 'title',
        text: 'Title',
        formatter: this.courseTitleFormatter,
        sort: true,
        dataAlign: 'center'
      }
    ];
    const professorsColumns = [
      {
        dataField: 'name',
        text: 'Name',
        formatter: this.nameFormatter,
        sort: true,
        dataAlign: 'center'
      }
    ];
    const labeledSearchResults = searchResults ? Object.assign({}, searchResults) : null;
    if (searchResults && departmentsList) {
      labeledSearchResults.courses.map(obj => {
        obj.course = departmentsList[obj.department_id].abbr + ' ' + obj.number;
        obj.title = obj.title;
        obj.key = obj.course + obj.title;
      });
      labeledSearchResults.professors.map(obj => obj.name = obj.last_name + ', ' + obj.first_name);
    }

    $('#searchBarResults').hide();

    if (searchResults && !searchResults.loading) {
      return (
        <div styleName= "results" className="content">
          {searchResults.professors.length === 0 && searchResults.courses.length === 0 ?
            <h5>{`No results found for "${this.props.match.params.search}"`}</h5>
            :
            <h5>{`Showing results for "${this.props.match.params.search}"`}</h5>
          }
          {searchResults.professors.length > 0 && (
            <div>
              <h4>Professors</h4>
              <BootstrapTable
                data={labeledSearchResults.professors}
                columns={professorsColumns}
                keyField='name'
                withoutTabIndex
                version='4'
                striped
                hover
              />
            </div>
          )}
          {searchResults.courses.length > 0  && departmentsList && (
            <div>
              <h4>Courses</h4>
              <BootstrapTable
                data={labeledSearchResults.courses}
                columns={coursesColumns}
                keyField='key'
                withoutTabIndex
                version='4'
                striped
                hover
              />
            </div>
          )}
        </div>
      );
    } else if (this.props.match.params.search.length > 2) {
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        </div>
      );
    } else {
      return (
        <div styleName="results" className="content">
          <h5>Please search with at least 3 characters.</h5>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    searchResults: state.searchResults,
    departmentsList: state.departmentsList
  };
}

export default connect(mapStateToProps, { setSearchResults })(SearchContent);
