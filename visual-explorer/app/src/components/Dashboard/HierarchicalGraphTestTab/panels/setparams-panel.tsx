import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import {Button, Card, Form, FormGroup} from 'react-bootstrap';
import './panels.scss';
import {Store} from "redux";
import {IApplicationState} from "../../../../redux-types";
import {getBindingElementVariableDeclaration} from "tslint";
import VisNetwork from "../../ShinerTab/graph/visNetwork";

interface SetParamsPanelProps {
    store: Store<IApplicationState>;
}

interface SetParamsPanelState {
    params: string
    file: any
    nodes: any
    links: any
    sim: any
}

class SetParamsPanel extends React.Component<SetParamsPanelProps, SetParamsPanelState> {

    constructor(props: SetParamsPanelProps) {
        super(props);
        this.state = {
            params: 'Please write your initial params here',
            file: null,
            nodes: undefined,
            links: undefined,
            sim: undefined
        }
        this.file = this.file.bind(this)
    }

    handleChange = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({params: value});
    }

file = (evt: any) => {
    // Retrieve the first (and only!) File from the FileList object
    let f = evt.target.files[0];
    this.setState({file:evt.target.files[0]})
    if (f) {
      let r = new FileReader();
      r.onload = (e:any) =>{
          // tslint:disable-next-line:prefer-const
          var contents = e.target.result;
          this.setState({ params: contents });
          // alert(contents);
      }
      r.readAsText(f);
      } else{
      alert("Failed to load file");
    }
  }

    handleSubmit = (event: any) => {
        alert("Params submitted!");
        event.preventDefault();
        fetch('http://127.0.0.1:3001/graphvis/initialvis', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                "Content-Type": "application/json"
            },
            body: this.state.params// JSON.stringify(this.state.ggds)
        }).then(res => res.text())
            .then(json => {
                console.log(JSON.parse(json))
                console.log(this.state.nodes)
                console.log(this.state.links)
                this.setState({
                    nodes: JSON.parse(json)['graph']['nodes'],
                    links: JSON.parse(json)['graph']['links'],
                    sim: JSON.parse(json)['similarity']
                })
                console.log(this.state.sim)
                //alert(JSON.parse(json))
            }).catch((err) => {
            console.log(err);
        });
    }

    handleSubmitNextLevel = (event: any) => {
                alert("Next level params submitted!");
        event.preventDefault();
        fetch('http://127.0.0.1:3001/graphvis/nextlevel', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                "Content-Type": "application/json"
            },
            body: this.state.params// JSON.stringify(this.state.ggds)
        }).then(res => res.text())
            .then(json => {
                console.log(JSON.parse(json))
                console.log(this.state.nodes)
                console.log(this.state.links)
                this.setState({
                    nodes: JSON.parse(json)['graph']['nodes'],
                    links: JSON.parse(json)['graph']['links'],
                    sim: JSON.parse(json)['similarity']
                })
                console.log(this.state.sim)
                //alert(JSON.parse(json))
            }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div>
            <Form onSubmit={this.handleSubmit}>
                  <FormGroup role="form">
                      <Form.Label>Upload your params JSON file here:</Form.Label>
                       <input type="file" onChange={this.file} />
                      {/*<Form.Control as="textarea" rows="6" value={this.state.ggds} onChange={this.handleChange}/>*/}
                    <Button className="btn btn-primary btn-large centerButton" type="submit" value="Submit" >Submit</Button>
                    </FormGroup>
            </Form>
            <Form onSubmit={this.handleSubmitNextLevel}>
                  <FormGroup role="form">
                      <Form.Label>Upload your next level params JSON file here:</Form.Label>
                       <input type="file" onChange={this.file} />
                      {/*<Form.Control as="textarea" rows="6" value={this.state.ggds} onChange={this.handleChange}/>*/}
                    <Button className="btn btn-primary btn-large centerButton" type="submit" value="Submit" >Submit</Button>
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

export default SetParamsPanel;