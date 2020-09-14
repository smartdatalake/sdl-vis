import React, { Component, createRef } from "react";
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min';
import {Alert} from "react-bootstrap";
import TableDyn from "../gcore/Table";

// Create an array with nodes
const nodes = new DataSet([
    {id: 1, label: 'Node 1'},
    {id: 2, label: 'Node 2'},
    {id: 3, label: 'Node 3'},
    {id: 4, label: 'Node 4'},
    {id: 5, label: 'Node 5'}
]);

// Create an array with edges
const edges = new DataSet([
    {from: 1, to: 3},
    {from: 1, to: 2},
    {from: 2, to: 4},
    {from: 2, to: 5}
]);

// Provide the data in the vis format
const data = {
  nodes: nodes,
  edges: edges
};

const myHeight = Math.round(parseInt(window.innerHeight)*0.5) + 'px';

const options = {
    autoResize: true,
    height: myHeight,
     edges: {
         arrows: {
             to: {
                 enabled: true
             }
         }
     }
};

// Initialize your network!
export default class VisNetwork extends React.Component {

  constructor(props) {
    super(props);
    console.log("vis network component!!!" + this.props.name)
    //this.nodes = this.props.nodes;
    //console.log("props::" + this.props.nodes)
    //this.edges = this.props.edges;
    this.name = this.props.name;
    this.network = {};
    this.appRef = createRef();
    this.state = { info: [{'label': 'Label', 'id': 0}]}
    this.data = {
        nodes: JSON.parse(this.props.nodes),
        edges: JSON.parse(this.props.edges)
    }
  }

  componentDidMount() {
      this.name = this.props.name
      this.data.nodes = JSON.parse(this.props.nodes);
      this.data.edges = JSON.parse(this.props.edges);
    //console.log("data here network!!"+ this.data.nodes)
     if (this.data.nodes.length > 0) {
      // console.log("data here network dentro!!"+ this.data.nodes.length)
       this.network = new Network(this.appRef.current, this.data, options);
       this.network.on("click",this.handleChange)
      //   console.log(this.network)
     }
  }

  handleChange = (networkEvents) => {
      console.log(networkEvents)
      //var nodesEvent = networkEvents.nodes
      //var edgesEvent = networkEvents.edges
      if(networkEvents.nodes.length > 0){
          let id = networkEvents.nodes[0]
          let nodeInformation = JSON.parse(this.props.nodes).find(element => element['id'] === id)
          console.log(JSON.parse(this.props.nodes).find(element => element['id'] === id))
          this.setState({
              info: Array.of(JSON.parse(this.props.nodes).find(element => element['id'] === id))
              //info: JSON.parse(this.props.nodes).find(element => element['id'] === id)
          })
      }else if(networkEvents.edges.length > 0){
          let id = networkEvents.edges[0]
          let edgeInformation = JSON.parse(this.props.edges).find(element => element['id'] === id)
          let array = []
          this.setState({
              info:  Array.of(JSON.parse(this.props.edges).find(element => element['id'] === id))
              //info: JSON.parse(this.props.edges).find(element => element['id'] === id)
          })
      }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
      if(this.props.nodes !== prevProps.nodes && this.props.nodes.length > 0) // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
  {
    //  alert("Change component!!!" + this.props.nodes)
    this.componentDidMount();
  }
  }

    render(){
    return (
        <div className={'info-network'}>
          <Alert variant="info">
            {console.log("This is information data" + this.state.info)}
           <TableDyn data={this.state.info}/>
        </Alert>
        <div className={'vis-network'}>
      <div ref={this.appRef}/>
      </div>
                    </div>
    );
  }
}