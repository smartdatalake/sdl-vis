import React, {Component} from 'react';
import {Store} from "redux";
import * as d3 from 'd3';
import {IApplicationState} from "../../../../redux-types";
import {Row, ToggleButton, ToggleButtonGroup} from "react-bootstrap";

 /*   # json format for "passing node information"
    # {
    #        "nodeLabel": "ProductAmazon",
    #        "id": "1",
    #        "edgeLabel": "",
    #        "graphName": "Amazon",
    #        "limit": -1
    #    }
    #args for both select and graph neighbor*/


interface GetNeighborPanelWrapperProps {
    store: Store<IApplicationState>;
}

interface GetNeighborPanelWrapperState {
    graphName: string,
    nodeLabel: string,
    id: string,
    edgeLabel: string,
    limit: number
    answer: string
}


/**
 * App
 *
 * Simple react js fetch example
 */
class GetNeighborPanelWrapper extends React.Component<GetNeighborPanelWrapperProps, GetNeighborPanelWrapperState> {

    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: GetNeighborPanelWrapperProps) {

        super(props);

        this.state = {
    graphName: "AmazonGoogle",
    nodeLabel: "ProductGoogle",
    id: "1",
    edgeLabel: "",
    limit: -1,
            answer: "query answer"
        }
    }

    handleChangeGraph = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({graphName: value});
    }

    handleChangeNode = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({nodeLabel: value});
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/query/select-neighbor', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({graphName: this.state.graphName, nodeLabel: this.state.nodeLabel,
            edgeLabel: this.state.edgeLabel, id: this.state.id, limit: this.state.limit})
            // JSON.stringify(this.state)
        }).then(res => res.text())
            .then(json => {
                this.setState({
                    answer: JSON.stringify(json)
                })
                console.log(JSON.stringify(json))
            }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
            <form onSubmit={this.handleSubmit}>
                <label>
                    Select Query:
                    <input value={this.state.graphName} onChange={this.handleChangeGraph}/>
                    <input value={this.state.nodeLabel} onChange={this.handleChangeNode}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        Answer:{this.state.answer}
        </div>
        );
    }

}

export default GetNeighborPanelWrapper;
