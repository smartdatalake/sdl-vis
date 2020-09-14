import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import {Button, Card, Form, FormGroup} from 'react-bootstrap';
import './panels.scss';
import {Store} from "redux";
import {IApplicationState} from "../../../../redux-types";
import {getBindingElementVariableDeclaration} from "tslint";

interface SetGGDsPanelProps {
    store: Store<IApplicationState>;
}

interface SetGGDsPanelState {
    ggds: string
    file: any
}

class SetGGDsPanel extends React.Component<SetGGDsPanelProps, SetGGDsPanelState> {

    constructor(props: SetGGDsPanelProps) {
        super(props);
        this.state = {
            ggds: 'Please write your GGDs here',
            file: null
        }
        this.file = this.file.bind(this)
    }

    handleChange = (event: any) => {
        const target = event.target
        const value = target.value
        this.setState({ggds: value});
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
          this.setState({ ggds: contents });
          // alert(contents);
      }
      r.readAsText(f);
      } else{
      alert("Failed to load file");
    }
  }

    handleSubmit = (event: any) => {
        alert("GGDs submitted!");
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/er/setggds', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                "Content-Type": "application/json"
            },
            body: this.state.ggds// JSON.stringify(this.state.ggds)
        }).then(res => res.text())
            .then(json => {
                console.log(JSON.stringify(json))
                alert(JSON.stringify(json))
                // alert("Graph Generating Dependencies submitted!")
            }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                  <FormGroup role="form">
                      <Form.Label>Upload you GGDs JSON file here:</Form.Label>
                       <input type="file" onChange={this.file} />
                      {/*<Form.Control as="textarea" rows="6" value={this.state.ggds} onChange={this.handleChange}/>*/}
                    <Button className="btn btn-primary btn-large centerButton" type="submit" value="Submit" block>Submit</Button>
                    </FormGroup>
            </Form>
                /*<form onSubmit={this.handleSubmit}>
                    <label>
                    GGDs:
                    <textarea value={this.state.ggds} onChange={this.handleChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>*/
        );
    }
}

export default SetGGDsPanel;