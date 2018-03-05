import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';

class RelatedInfo extends Component {

  static propTypes = {
    departmentsList: PropTypes.object.isRequired,
    info: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired
  }

  render() {
    const { type, desc, info, departmentsList } = this.props;
    const professorsColumns = [
      {
        dataField: 'course',
        text: 'Course',
        sort: true,
        dataAlign: 'center'
      },
      {
        dataField: 'title',
        text: 'Title',
        sort: true,
        dataAlign: 'center'
      }
    ];
    const coursesColumns = [
      {
        dataField: 'name',
        text: 'Name',
        sort: true,
        dataAlign: 'center'
      }
    ];
    const labeledInfo = info.slice();
    labeledInfo.map(obj => {
      if (type === 'professors') {
        obj.course = departmentsList[obj.department_id].abbr + ' ' + obj.number;
        obj.title = obj.title;
        obj.key = obj.course + obj.title;
      }
      else {
        obj.name = obj.last_name + ', ' + obj.first_name;
      }
    });
    return (
      <div>
        <h5>{type === 'professors' ? 'Courses taught by ' + desc + ':' : 'Professors who taught ' + desc + ':'}</h5>
          {type === 'professors' ?
            <BootstrapTable
              ref={node => this.table = node}
              data={labeledInfo}
              columns={professorsColumns}
              keyField='key'
              withoutTabIndex
              version='4'
              striped
              hover
            />
          : <BootstrapTable
              ref={node => this.table = node}
              data={labeledInfo}
              columns={coursesColumns}
              keyField='name'
              withoutTabIndex
              version='4'
              striped
              hover
            />
          }
      </div>
    );
  }
}

function nameFormatter(cell, row) {
  return <Link to={`/professors/${row.id}`}>{`${row.last_name}, ${row.first_name}`}</Link>;
}

function courseNumberFormatter(cell, row, departmentsList) {
  return  <Link to={`/courses/${row.id}`}>{departmentsList[row.department_id].abbr} {row.number}</Link>;
}

function courseTitleFormatter(cell, row) {
  return  <Link to={`/courses/${row.id}`}>{row.title}</Link>;
}

export default RelatedInfo;
