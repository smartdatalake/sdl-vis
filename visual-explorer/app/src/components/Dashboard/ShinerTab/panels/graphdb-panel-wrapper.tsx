import React, {Component} from 'react';
import {Store} from "redux";
import * as d3 from 'd3';
import {IApplicationState} from "../../../../redux-types";
import {Alert, Row, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import VisNetwork from "../graph/visNetwork";

interface GraphdbPanelWrapperProps {
    store: Store<IApplicationState>;
}

interface GraphdbPanelWrapperState {
    graphs: [],
    graph: string,
    isLoaded: boolean,
    nodes?: {
            label: string
            property: []
        }[]
    links?: {
            label: string
            property: []
            source: string
            target: string
        }[]
}


/**
 * App
 *
 * Simple react js fetch example
 */
class GraphdbPanelWrapper extends React.Component<GraphdbPanelWrapperProps, GraphdbPanelWrapperState> {

    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: GraphdbPanelWrapperProps) {

        super(props);

        this.state = {
            graphs: [],
            isLoaded: false,
            graph: "schema-graph",
            // schema : undefined
            nodes: undefined,
            links: undefined
        }

    }

    /**
     * componentDidMount
     *
     * Fetch json array of objects from given url and update state.
     */
    componentDidMount() {

        fetch('http://127.0.0.1:3001/gcore/availableGraphs')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    graphs: json,
                    isLoaded: true,
                })
            }).catch((err) => {
            console.log(err);
        });

    }

    /**
     * render
     *
     * Render UI
     */
    render() {

        const onGraphChangeFn = (e: any) => {
            console.log(e.target.value); // graph name
           // if (e.target.value) this.props.setType(e.target.value);
            const graphValue = e.target.value;
            fetch('http://127.0.0.1:3001/gcore/schema/' + e.target.value)
            .then(res => res.json())
            .then(json => {
                this.setState({
                    nodes: json.nodes,
                    links: json.links
                })
                console.log(json)
            }).catch((err) => {
            console.log(err);
        });
            this.setState({
                graph: graphValue
            })
        };// make component to render graph schemas

        const {isLoaded, graphs} = this.state;

        if (!isLoaded)
            return <div>  <Alert variant="warning"> Loading...(check for connection or load database error)
  </Alert></div>;

        return (
            <div className="GraphDB" >
                <ToggleButtonGroup
                    type="radio"
                    name="schemaToggleButton"
                    onClick={onGraphChangeFn}
                    defaultValue={graphs.entries().next()}
                >
                    {graphs.map(graph => (
                        <ToggleButton value={graph} variant="primary">
                            {graph}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                    {this.state.nodes &&
                    this.state.links &&
                    <VisNetwork nodes={this.state.nodes} edges={this.state.links} name={this.state.graph}/>}
            </div>
        );

    }

}

export default GraphdbPanelWrapper;
