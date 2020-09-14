import React from 'react';
import {Table} from "react-bootstrap";
/*
code for quick testing tables from
https://plnkr.co/edit/ysN4Qb3lUp9mbqFhumWJ?p=preview&preview
https://medium.com/@subalerts/create-dynamic-table-from-json-in-react-js-1a4a7b1146ef
 */

export default class TableDyn extends React.Component {

    constructor(props){
      super(props);
      /*this.state = {
          items: this.props.data
      }*/
      this.getHeader = this.getHeader.bind(this);
      this.getRowsData = this.getRowsData.bind(this);
      this.getKeys = this.getKeys.bind(this);
    }

    getKeys = function(){
      return Object.keys(this.props.data[0]);
    }

    getHeader = function(){
        const keys = this.getKeys();
        return keys.map((key, index)=>{
        return <th key={key}>{key.toUpperCase()}</th>
      })
    }

    getRowsData = function(){
        //this.items = this.props.data;
        const items = Array.from(this.props.data)//JSON.parse(this.props.data);//Array.from(this.props.data);
        const keys = this.getKeys();
        return items.map((row, index)=>{
        return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
      })
    }

    render() {
        return (
          <div>
            <Table>
            <thead>
              <tr>{this.getHeader()}</tr>
            </thead>
            <tbody>
              {this.getRowsData()}
            </tbody>
            </Table>
          </div>
        );
    }
}

const RenderRow = (props) =>{
  return props.keys.map((key, index)=>{
    return <td key={props.data[key]}>{props.data[key]}</td>
  })
}