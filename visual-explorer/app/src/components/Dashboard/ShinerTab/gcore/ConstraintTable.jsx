import React from 'react';
import {Table} from "react-bootstrap";
/*
code for quick testing tables from
https://plnkr.co/edit/ysN4Qb3lUp9mbqFhumWJ?p=preview&preview
https://medium.com/@subalerts/create-dynamic-table-from-json-in-react-js-1a4a7b1146ef
 */

export default class ConstraintTable extends React.Component {

    constructor(props) {
        super(props);
        /*this.state = {
            items: this.props.data
        }*/
        this.constraints = this.props.data
        this.keys = ["distance", "var1", "var2", "operator", "threshold"]
    }

          componentDidUpdate(prevProps, prevState, snapshot) {
      if(this.props.data !== prevProps.data ) // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
  {
      //alert("Change component!!!" + this.props.data)
      this.render();
  }
  }


    render() {
        return (
            <div>
                <Table responsive>
                    <thead>
                    <tr>
                        <th>Constraints</th>
                        {this.keys.map((_, index) => (
                            <th key={index}>{_}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                        {this.constraints.map((_, index) => (
                            <tr>
                                <td>{index}</td>
                            <td>{_['distance']}</td>
                            <td>{_['var1'].toString()+ "." + _['attr1'].toString()}</td>
                            <td>{_['var2'].toString() + "." + _['attr2'].toString()}</td>
                            <td>{_['operator']}</td>
                            <td>{_['threshold']}</td>
                                </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }


}