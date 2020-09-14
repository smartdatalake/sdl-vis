import React, {Component} from 'react';
import {Store} from "redux";
import * as d3 from 'd3';
import {IApplicationState} from "../../../../redux-types";
import {Button, Form, FormGroup, Row, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import VisNetwork from "../graph/visNetwork";

interface ConstructQueryPanelWrapperProps {
    store: Store<IApplicationState>;
}

interface ConstructQueryPanelWrapperState {
    //graph: string,
    //match: string
    //construct: string
    query: string,
    //answer: any
    nodes: any,
    links: any
}


/**
 * App
 *
 * Simple react js fetch example
 */
class ConstructQueryPanelWrapper extends React.Component<ConstructQueryPanelWrapperProps, ConstructQueryPanelWrapperState> {

    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: ConstructQueryPanelWrapperProps) {

        super(props);

        this.state = {
            //graph : "Graph name, AmazonGoogle",
            //match: "Match clause, (p:ProductGoogle)",
            //construct: "Construct clause, (p)",
            query: "CONSTRUCT (p) MATCH (p:Person) ON people_graph",
            //answer:  undefined
            nodes: undefined,
            links: undefined
        }

    }

   /* handleChangeGraph = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({graph: value});
    }

    handleChangeMatch = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({match: value});
    }

    handleChangeConstruct = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({construct: value});
    }*/

    handleChangeQuery = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({query: value});
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/query/construct', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            //body: JSON.stringify(this.state)
            headers: {
                 'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                "Content-Type": "application/json"
            },
            //body: JSON.stringify({graph: this.state.graph, match: this.state.match, construct: this.state.construct})
            //body: JSON.stringify({query: this.state.query})
            body: JSON.stringify({query: this.state.query, limit:50})
            //JSON.stringify(this.state)
        }).then(res => res.text())
            .then(json => {
                this.setState({
                    //answer: JSON.parse(json)
                    nodes: JSON.parse(json)['nodes'],
                    links: JSON.parse(json)['links']
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
                    <input value={this.state.match} onChange={this.handleChangeMatch}/>
                    <input value={this.state.construct} onChange={this.handleChangeConstruct}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>*/}
                        <Form  onSubmit={this.handleSubmit}>
                <FormGroup role="form">
                      <Form.Label>Construct Query</Form.Label>
                    {/*<Form.Control type="text" value={this.state.construct} onChange={this.handleChangeConstruct}/>
                       <Form.Control type="text" value={this.state.match} onChange={this.handleChangeMatch}/>
                       <Form.Control type="text" value={this.state.graph} onChange={this.handleChangeGraph} />*/}
                       <Form.Control type="text" value={this.state.query} onChange={this.handleChangeQuery}/>
                    <Button className="btn btn-primary btn-large centerButton" type="submit" value="Submit">Submit</Button>
                    </FormGroup>
            </Form>
        Answer:
        {this.state.nodes &&
                    this.state.links &&
                    <VisNetwork nodes={this.state.nodes} edges={this.state.links} />}
        </div>
        );
    }

}

export default ConstructQueryPanelWrapper;
