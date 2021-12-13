import React from 'react';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    InputBase,
    Button,
    InputLabel,
} from '@material-ui/core';
import styled from 'styled-components';
import { Alert } from 'react-bootstrap';
import InfoIcon from '@material-ui/icons/Info';

const InputSubmit = styled.div`
    margin: auto;
    width: 50%;
    padding: 10px;
    text-align: center;
`;

interface SetGraphsProps {}

interface SetGraphsState {
    graphs: [];
    selectedGraphs: {
        graph: any;
        checked: boolean;
    }[];
    newName: string;
    show: boolean;
    submissionStatus: string
}

/**
 * App
 *
 * Simple react js fetch example
 */
class SetGraphs extends React.Component<SetGraphsProps, SetGraphsState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: SetGraphsProps) {
        super(props);

        this.state = {
            graphs: [],
            selectedGraphs: [],
            newName: 'target-graph',
            show: false,
            submissionStatus: 'Submit the target graph configuration'
        };
    }

    componentDidMount() {
        fetch('http://127.0.0.1:3001/gcore/availableGraphs')
            .then((res) => res.json())
            .then((json) => {
                this.setState({
                    graphs: JSON.parse(json),
                    // isLoaded: true,
                });
                const result = this.state.graphs.map((person) => ({ graph: person, checked: false }));
                this.setState({
                    selectedGraphs: result,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    changeInput = (e: any) => {
        this.setState({
            newName: e.target.value,
        });
    };

    submitGraph = (e: any) => {
        const selectedTrueGraphs = this.state.selectedGraphs.filter((x) => x.checked == true).map((x) => x.graph);
       // alert(JSON.stringify({ graphName: this.state.newName, unionGraphs: selectedTrueGraphs }));
        fetch('http://127.0.0.1:3001/gcore/er/targetgraph', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            //body: JSON.stringify(this.state)
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ graphName: this.state.newName, unionGraphs: selectedTrueGraphs }),
        })
            .then((res) => res.text())
            .then((json) => {
                this.setState({
                    submissionStatus : json
                });
               // alert(json);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    onToggle = (e: any, index: number) => {
        const newItems = this.state.selectedGraphs.slice();
        newItems[index].checked = !newItems[index].checked;

        this.setState({ selectedGraphs: newItems });
    };

    render() {
        return (
            <div>
                <FormControl component="fieldset">
                    <FormLabel component="legend" text-align="center">
                        Graphs Available for Building a Target Graph{' '}
                        {!this.state.show && <InfoIcon onClick={() => this.setState({ show: true })}>Info</InfoIcon>}
                    </FormLabel>
                    <Alert show={this.state.show} variant="info">
                        Select the graphs that you are interested in applying Entity Resolution. It will generate a new
                        graph configuration in the backend with all the entities in the selected graphs, you can use
                        this new graph as the target graph for the GGDs.
                        <Button onClick={() => this.setState({ show: false })}>Close</Button>
                    </Alert>
                    <FormGroup aria-label="position" row>
                        {this.state.graphs.map((item, i) => (
                            <FormControlLabel
                                key={i}
                                value={item}
                                control={<Checkbox color="primary" />}
                                label={item}
                                labelPlacement="end"
                                onChange={(e) => this.onToggle(e, i)}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
                <InputSubmit>
                    <InputLabel id="demo-simple-select-label">{`Input name of new graph`}</InputLabel>
                    <InputBase type="text" value={this.state.newName} onChange={this.changeInput} />
                    <Button type="submit" className="btn btn-primary" onClick={this.submitGraph}>
                        Submit
                    </Button>
                </InputSubmit>
                <Alert variant="secondary">
                    {this.state.submissionStatus}
                </Alert>
            </div>
        );
    }
}

export default SetGraphs;
