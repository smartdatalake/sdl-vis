import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import {Alert, Button, Card, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import './panels.scss';
import {Store} from "redux";
import {IApplicationState} from "../../../../redux-types";
import TableDyn from "../gcore/Table";

interface RunerPanelProps {
    store: Store<IApplicationState>;
}

interface RunerPanelState {
    status: string
    info: any
}

class RunERPanel extends React.Component<RunerPanelProps, RunerPanelState> {

    constructor(props: RunerPanelProps) {
        super(props);
        this.state = {
            status: 'Click to run',
            info: [{'name': 'Label', 'number': 0}]
        }
    }

    render() {

        const onClickRun = (e: any) => {
            this.setState({
                status: 'Running....'
            })
            // if (e.target.value) this.props.setType(e.target.value);
            fetch('http://127.0.0.1:3001/gcore/er/run',{
             //   mode: 'cors'
             /*   method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            //body: JSON.stringify(this.state)*/
            headers: {
                 'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                "Content-Type": "application/json"
            }
            })
                .then(res => res.text())
                .then(json => {
                    this.setState({
                        status: "Resulting graph name:" + JSON.parse(json)['graphName'],
                        info: JSON.parse(json)['resultInfo']
                    })
                    console.log(json)
                }).catch((err) => {
                console.log(err);
            });
        };//make component to render graph schemas


        return (
            <div className="RunER">
                <Button
                    aria-label="Basic example"
                    size='lg'
                    //type="radio"
                    //name="schemaToggleButton"
                    block
                    onClick={onClickRun}
                >
                    Run ER!
                </Button>
                <Alert variant="info">
                    {this.state.status}
                </Alert>
                <TableDyn data={this.state.info}/>
            </div>
        );
    }
}

export default RunERPanel;