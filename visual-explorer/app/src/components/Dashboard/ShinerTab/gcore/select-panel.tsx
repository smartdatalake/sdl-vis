import React, {Component} from 'react';
import {Store} from "redux";
import * as d3 from 'd3';
import {IApplicationState} from "../../../../redux-types";
import {Alert, Button, Form, FormGroup, Row, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import TableDyn from "./Table";
import {JsonFormatter} from "tslint/lib/formatters";
// import JsonTable from 'react-json-table'

interface SelectQueryPanelWrapperProps {
    store: Store<IApplicationState>;
}

interface SelectQueryPanelWrapperState {
    // graph: string,
    // table: string
    query: string,
    answer: any// string
}


/**
 * App
 *
 * Simple react js fetch example
 */
class SelectQueryPanelWrapper extends React.Component<SelectQueryPanelWrapperProps, SelectQueryPanelWrapperState> {

    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: SelectQueryPanelWrapperProps) {

        super(props);

        this.state = {
            // graph : "Graph name",
            // table: "Label",
            query: "SELECT * MATCH (p:Person) ON people_graph",
            answer: [{'label': 'Label', 'id': 0}]
        }

    }

    /*handleChangeGraph = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({graph: value});
    }

    handleChangeTable = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({table: value});
    }*/

    handleChangeQuery = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({query: value});
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/query/select', {
            // mode: 'no-cors',
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                "Content-Type": "application/json"
            },
            // body: JSON.stringify({graph: this.state.graph, table: this.state.table})
            body: JSON.stringify({query: this.state.query, limit:50})
            // JSON.stringify(this.state)
        }).then(res => res.text())
            .then(json => {
                this.setState({
                    answer: JSON.parse(json)
                })
                console.log(JSON.parse(json))
            }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
                {/*<form onSubmit={this.handleSubmit}>
                <label>
                    Select Query:
                    <input value={this.state.graph} onChange={this.handleChangeGraph}/>
                    <input value={this.state.table} onChange={this.handleChangeTable}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>*/}
            <Form  onSubmit={this.handleSubmit}>
                <FormGroup role="form">
                      <Form.Label>Select Query</Form.Label>
                    {/*<Form.Control type="text" value={this.state.graph} onChange={this.handleChangeGraph} placeholder="Graph Name" />
                       <Form.Control type="text" value={this.state.table} onChange={this.handleChangeTable} placeholder="Label"/>*/}
                       <Form.Control type="text" value={this.state.query} onChange={this.handleChangeQuery} placeholder="construct query" />
                    <Button className="btn btn-primary btn-large centerButton" type="submit" value="Submit">Submit</Button>
                    </FormGroup>
            </Form>
                {/*Answer:{this.state.answer}*/}
         <Alert variant="info">ANSWER (Limit 50)</Alert>
         <TableDyn data={this.state.answer}/>
        </div>
        );
    }

}

export default SelectQueryPanelWrapper;
