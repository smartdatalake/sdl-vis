import React from 'react';
import { Modal } from 'react-bootstrap';
import ForceGraph2D from 'react-force-graph-2d';
import { Button, FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { withStyles } from '@material-ui/core/styles';

interface TargetGraphProps {
    graph1: string;
    graph2: string;
    targetgraph: string;
    schemaGraph: {
        nodes: [];
        links: [];
    };
    vars: string[];
    //callback funtion for getting the target graph submission
    submitTarget: any;
}

interface TargetGraphState {
    name: string;
    node1: any;
    node2: any;
    modalShow: boolean;
    edges: {
        fromLabel: string;
        fromVariable: string;
        toVariable: string;
        variable: string;
        label: string;
        toLabel: string;
        id: string;
    }[];
    fromVariable: any;
    fromLabel: any;
    toLabel: any;
    toVariable: any;
    label: any;
}

const StyledSelect = withStyles({
    root: {
        borderRadius: 3,
        border: 0,
        height: 30,
        width: 180,
        align: 'center',
    },
})(Select);

const StyledInput = withStyles({
    root: {
        border: 0,
        height: 43,
        width: 180,
        align: 'center',
    },
})(Input);

/**
 * App
 *
 * Simple react js fetch example
 */
class TargetGraph extends React.Component<TargetGraphProps, TargetGraphState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: TargetGraphProps) {
        super(props);

        this.state = {
            name: '',
            node1: null,
            node2: null,
            modalShow: false,
            edges: [{ fromVariable: '', toVariable: '', variable: '', label: '', fromLabel: '', toLabel: '', id: '' }],
            fromLabel: '',
            fromVariable: '',
            toVariable: '',
            label: '',
            toLabel: '',
        };
    }

    checkNodes = (node: any): boolean => {
        if (this.state.node1 != null && node['id'] == this.state.node1['id']) return true;
        if (this.state.node2 != null && node['id'] == this.state.node2['id']) return true;
        return false;
    };

    handleNodeClick = (node: any) => {
        if (this.state.node1 != null && node['id'] == this.state.node1['id']) {
            this.setState({
                node1: null,
            });
            return;
        }
        if (this.state.node2 != null && node['id'] == this.state.node2['id']) {
            this.setState({
                node2: null,
            });
            return;
        } else if (this.state.node1 == null) {
            this.setState({
                node1: node,
            });
            return;
        } else if (this.state.node2 == null) {
            this.setState({
                node2: node,
            });
            return;
        }
    };

    submitTargetGraph = (e: any) => {
        const nodesDistinct: [{ label: string; variable: string }] = [{ label: '', variable: '' }];
        const edges: [{ label: string; variable: string; fromVariable: string; toVariable: string }] = [
            { label: '', variable: '', fromVariable: '', toVariable: '' },
        ];
        this.state.edges.forEach((x) => {
            nodesDistinct.push({ label: x.fromLabel, variable: x.fromVariable });
            nodesDistinct.push({ label: x.toLabel, variable: x.toVariable });
        });
        //filter the empty and repeated values in node distinct
        const nodesD = nodesDistinct.filter((x) => x.label != '');
        this.state.edges.forEach((x) => {
            edges.push({
                label: x.label,
                variable: x.variable,
                fromVariable: x.fromVariable,
                toVariable: x.toVariable,
            });
        });
        const edgesD = edges.filter((x) => x.label != '');
        console.log(nodesD);
        console.log(edgesD);
        this.props.submitTarget({ vertices: nodesD, edges: edgesD });
        //clear edge state
        this.setState({
            edges: [],
        });
    };

    submitEdge = (e: any) => {
        const randomStr: string = Math.random().toString(36).substring(3);
        const vari: string = randomStr.concat('_').concat(this.state.label.substr(0, 2));
        this.setState({
            edges: this.state.edges.concat({
                fromLabel: this.state.fromLabel,
                fromVariable: this.state.fromVariable,
                toVariable: this.state.toVariable,
                variable: vari,
                label: this.state.label,
                toLabel: this.state.toLabel,
                id: vari,
            }),
            modalShow: false,
            node1: null,
            node2: null,
        });
    };


    render() {
        const columnsEdges: GridColDef[] = [
            { field: 'fromLabel', headerName: 'Source Label', width: 245 },
            { field: 'from Variable', headerName: 'Source Variable', width: 245 },
            { field: 'label', headerName: 'Edge Label', width: 245 },
            { field: 'variable', headerName: 'Edge Variable', width: 245 },
            { field: 'toLabel', headerName: 'Target Label', width: 245 },
            { field: 'toVariable', headerName: 'Target Variable', width: 245 },
        ];

        return (
            <div>
                {this.props.targetgraph}
                {
                    <ForceGraph2D
                        graphData={this.props.schemaGraph}
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.25}
                        nodeColor={(node) => (this.checkNodes(node) ? 'red' : 'blue')}
                        nodeLabel={'label'}
                        linkLabel={'label'}
                        onNodeClick={this.handleNodeClick}
                        width={innerWidth}
                        height={innerHeight/2}
                    />
                }
                {this.state.node1 != null && this.state.node2 != null && (
                    <div>
                        <Button onClick={(e) => this.setState({ modalShow: true })}>Click to Set New Edge</Button>
                        <Modal
                            size="lg"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            show={this.state.modalShow}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">Modal heading</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h4>Set new edge</h4>
                                <form>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">From Label</InputLabel>
                                        <StyledSelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.fromLabel}
                                            onChange={(e) => this.setState({ fromLabel: e.target.value })}
                                        >
                                            <MenuItem value={this.state.node1['label']} key={this.state.node1['label']}>
                                                {this.state.node1['label']}
                                            </MenuItem>
                                            <MenuItem value={this.state.node2['label']} key={this.state.node2['label']}>
                                                {this.state.node2['label']}
                                            </MenuItem>
                                        </StyledSelect>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">From Variable</InputLabel>
                                        <StyledSelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.fromVariable}
                                            onChange={(e) => this.setState({ fromVariable: e.target.value })}
                                        >
                                            {this.props.vars.map((g) => (
                                                <MenuItem value={g} key={g}>
                                                    {g}
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">To Label</InputLabel>
                                        <StyledSelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.toLabel}
                                            onChange={(e) => this.setState({ toLabel: e.target.value })}
                                        >
                                            <MenuItem value={this.state.node1['label']} key={this.state.node1['label']}>
                                                {this.state.node1['label']}
                                            </MenuItem>
                                            <MenuItem value={this.state.node2['label']} key={this.state.node2['label']}>
                                                {this.state.node2['label']}
                                            </MenuItem>
                                        </StyledSelect>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel id="demo-simple-select-label">To Variable</InputLabel>
                                        <StyledSelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.toVariable}
                                            onChange={(e) => this.setState({ toVariable: e.target.value })}
                                        >
                                            {this.props.vars.map((g) => (
                                                <MenuItem value={g} key={g}>
                                                    {g}
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel>{`New edge label`}</InputLabel>
                                        <StyledInput
                                            type="text"
                                            value={this.state.label}
                                            className="new edge"
                                            onChange={(e) => this.setState({ label: e.target.value })}
                                        />
                                    </FormControl>
                                    <Button onClick={this.submitEdge}>Submit and Close</Button>
                                </form>
                            </Modal.Body>
                            <Modal.Footer></Modal.Footer>
                        </Modal>
                    </div>
                )}
                <DataGrid autoHeight={true} rows={this.state.edges} columns={columnsEdges} pageSize={5} />
                <Button className="btn btn-primary" onClick={this.submitTargetGraph}>
                    Click to Set the Target Graph
                </Button>
            </div>
        );
    }
}

export default TargetGraph;
