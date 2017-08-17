import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const searchContent = () => {
  var products = [{
        id: 1,
        name: "Item name 1",
        price: 100
    },{
        id: 2,
        name: "Item name 2",
        price: 100
    }];
  // It's a data format example.
  function priceFormatter(cell, row){
    return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
  }
  return (
    <div className="content">
      <BootstrapTable version='4' data={products} search={true} striped={true} hover={true}>
          <TableHeaderColumn dataField="id" isKey={true} dataAlign="center" dataSort={true}>Product ID</TableHeaderColumn>
          <TableHeaderColumn dataField="name" dataSort={true}>Product Name</TableHeaderColumn>
          <TableHeaderColumn dataField="price" dataFormat={priceFormatter}>Product Price</TableHeaderColumn>
      </BootstrapTable>
    </div>
  );
}

export default searchContent;
