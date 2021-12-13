import React, {useRef} from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import SampleGraphVis from './sample-graph-vis';

interface ConstructQueryPanelWrapperProps {}

interface ConstructQueryPanelWrapperState {
    query: string;
    //answer: any
    graphvis: {
        nodes: [];
        links: [];
    };
}

/**
 * App
 *
 * Simple react js fetch example
 */
class ConstructQueryPanelWrapper extends React.Component<
    ConstructQueryPanelWrapperProps,
    ConstructQueryPanelWrapperState
> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: ConstructQueryPanelWrapperProps) {
        super(props);

        this.state = {
            query: 'CONSTRUCT (p) MATCH (p:Person) ON people_graph',
            //answer:  undefined
            graphvis: {
                nodes: [],
                links: [],
            },
        };
    }

    handleChangeQuery = (event: any) => {
        const target = event.target;
        const value = target.value;
        this.setState({ query: value });
    };

    handleSubmit = (event: any) => {
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/query/construct', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: this.state.query, limit: 50 }),
        })
            .then((res) => res.json())
            .then((json) => {
                const obj1 = JSON.parse(json.links, function (k, v) {
                    if (k === 'from') {
                        this.source = v;
                        return; //# if return  undefined, orignal property will be removed
                    }
                    return v;
                });
                const obj2 = JSON.parse(JSON.stringify(obj1), function (k, v) {
                    if (k === 'to') {
                        this.target = v;
                        return; //# if return  undefined, orignal property will be removed
                    }
                    return v;
                });
                console.log(JSON.stringify(obj2));
                this.setState({
                    graphvis: {
                        nodes: JSON.parse(json.nodes),
                        links: obj2,
                    },
                });
                console.log(JSON.parse(json));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup role="form">
                        <Form.Control type="text" value={this.state.query} onChange={this.handleChangeQuery} />
                        <Button className="btn btn-secondary btn-large" type="submit" value="Submit">
                            Submit
                        </Button>
                    </FormGroup>
                </Form>
                <SampleGraphVis graphvis={this.state.graphvis} width={window.innerWidth - 500} height={window.innerHeight/2}/>
            </div>
        );
    }
}

export default ConstructQueryPanelWrapper;
