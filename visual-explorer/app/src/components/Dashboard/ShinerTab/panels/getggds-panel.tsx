import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import {Alert, Button, Card, Col, Container, ListGroup, Row, ToggleButton, ToggleButtonGroup} from 'react-bootstrap';
import './panels.scss';
import {Store} from "redux";
import {IApplicationState} from "../../../../redux-types";
import VisNetwork from "../graph/visNetwork";
import TableDyn from "../gcore/Table";
import ConstraintTable from "../gcore/ConstraintTable";

interface GetGGDsPanelProps {
    store: Store<IApplicationState>;
}

interface GetGGDsPanelState {
    ggds: string
    json: any
}

function getNodes(gp: any) {
    const allVertices = gp.flatMap(function (gp: any) {
        return gp.vertices
    })
    const verticesString = JSON.stringify(allVertices).replace(/variable/g, "id")
    console.log(verticesString)
    return verticesString
    return JSON.parse(verticesString)
}

function getEdges(gp: any) {
    const allEdges = gp.flatMap(function (gp: any) {
        return gp.edges
    })
    const edgesString = JSON.stringify(allEdges).replace(/variable/g, "id")
        .replace(/fromVariable/g, "from")
        .replace(/toVariable/g, "to")
    console.log(edgesString)
    return edgesString
    return JSON.parse(edgesString)
}

class GetGGDsPanel extends React.Component<GetGGDsPanelProps, GetGGDsPanelState> {

    constructor(props: GetGGDsPanelProps) {
        super(props);
        this.state = {
            ggds: "",
            json: []
        }
    }

    render() {

        const onClickGGDs = (e: any) => {
            console.log(e.target.value); // graph name
            // if (e.target.value) this.props.setType(e.target.value);
            fetch('http://127.0.0.1:3001/gcore/er/getggds')
                .then(res => res.text())
                .then(json => {
                    if (JSON.parse(json).status === 'No ggds were uploaded in server!') {
                        alert('No ggds were uploaded in server!');
                    } else {
                        this.setState({
                            ggds: json,
                            json: JSON.parse(json)
                        })
                    }
                    console.log(json)
                    // console.log(json)
                }).catch((err) => {
                console.log(err);
            });
        };// make component to render graph schemas


        return (
            <div className="GGDs">
                <Button
                    aria-label="Basic example"
                    block={true}
                    // type="radio"
                    // name="schemaToggleButton"
                    onClick={onClickGGDs}
                >
                    Get GGDs!
                </Button>
                {this.state.json.map(function (ggd: any) {
                    return (
                        <div className='get-ggds'>
                            <h5>{"GGD"}</h5>
                            <Container fluid={true}>
                                <Row>
                                    <Col><VisNetwork nodes={getNodes(ggd.sourceGP)}
                                                     edges={getEdges(ggd.sourceGP)}/>
                                    <ConstraintTable data={ggd.sourceCons} />
                                    </Col>
                                    <Col><VisNetwork nodes={getNodes(ggd.targetGP)}
                                                     edges={getEdges(ggd.targetGP)}/>
                                    <ConstraintTable data={ggd.targetCons} />
                                    </Col>
                                </Row>
                            </Container>


                            {/*<VisNetwork nodes={getNodes(ggd.sourceGP)} edges={getEdges(ggd.sourceGP)}/>
                        <VisNetwork nodes={getNodes(ggd.targetGP)} edges={getEdges(ggd.targetGP)}/>*/}
                        </div>
                    )
                    // let visNetwork = <><VisNetwork nodes={getNodes(ggd.sourceGP)} edges={getEdges(ggd.sourceGP)}/></>;
                    // return visNetwork
                    //    <VisNetwork nodes={getNodes(ggd.targetGP)} edges={getEdges(ggd.targetGP)} />
                    // )
                })}
            </div>
        );
    }
}

export default GetGGDsPanel;

{/*<ListGroup>
                    {this.state.json.map(function(ggd: any){
                        return (
                            <ListGroup.Item>{ggd.sourceGP[0].vertices[0].label}</ListGroup.Item>
                        )
                        }

                    )}
                </ListGroup>*/
}