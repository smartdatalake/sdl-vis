import React, { useState } from 'react';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import ForceGraph2D, { LinkObject, NodeObject } from 'react-force-graph-2d';
import ConstraintForm from './constraint-form';
import TargetGraph from './target-graph';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { withStyles } from '@material-ui/core/styles';

const StyledSelect = withStyles({
    root: {
        borderRadius: 3,
        border: 0,
        height: 30,
        width: 180,
        align: 'center',
    },
})(Select);

interface SetGgdsPanelProps {
    id: number; //ggd id from father component
    setGGDs: any;
}

interface SetGgdsPanelState {
    props1: {
        graph: {
            nodes: [];
            links: [];
        };
        id: number;
        onSetGraphPattern: any;
    };
    props2: {
        graph: {
            nodes: [];
            links: [];
        };
        id: number;
        onSetGraphPattern: any;
    };
    propst: {
        graph: {
            nodes: [];
            links: [];
        };
        id: number;
    };
    graphs: [];
    graph1: string;
    graph2: string;
    graphPattern1: {
        nodes: [];
        links: [];
    };
    graphPattern2: {
        nodes: [];
        links: [];
    };
    targetPattern: {
        vertices: [];
        edges: [];
    };
    targetgraph: string;
    constraints: {
        var1: string;
        var2: string;
        attr1: string;
        attr2: string;
        distance: string;
        operator: string;
        threshold: number;
    }[];
}

/**
 * App
 *
 * Simple react js fetch example
 */
class SetGgdsPanel extends React.Component<SetGgdsPanelProps, SetGgdsPanelState> {
    private handleGraphPattern = (e: any) => {
        const id = e.id;
        if (id == 1) {
            //alert(JSON.stringify(e))
            this.setState({
                graphPattern1: e.graphPattern1,
            });
        }
        if (id == 2) {
            //alert(JSON.stringify(e))
            this.setState({
                graphPattern2: e.graphPattern1,
            });
        }
    };

    private submitConstraints = (e: any) => {
        this.setState(
            {
                constraints: e,
            },
            () => {
                console.log(JSON.stringify(this.state.constraints));
            }
        );
    };

    private submitTarget = (e: any) => {
        console.log('target graph' + JSON.stringify(e));
        this.setState(
            {
                targetPattern: {
                    vertices: e['vertices'],
                    edges: e['edges'],
                },
            },
            () => {
                console.log(JSON.stringify(this.state.targetPattern));
            }
        );
    };
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: SetGgdsPanelProps) {
        super(props);

        this.state = {
            props1: {
                graph: {
                    nodes: [],
                    links: [],
                },
                id: 0,
                onSetGraphPattern: this.handleGraphPattern,
            },
            props2: {
                graph: {
                    nodes: [],
                    links: [],
                },
                id: 0,
                onSetGraphPattern: this.handleGraphPattern,
            },
            propst: {
                graph: {
                    nodes: [],
                    links: [],
                },
                id: 3,
            },
            graphs: [],
            graph1: '',
            graph2: '',
            targetgraph: '',
            graphPattern1: {
                nodes: [],
                links: [],
            },
            graphPattern2: {
                nodes: [],
                links: [],
            },
            targetPattern: {
                vertices: [],
                edges: [],
            },
            constraints: [{ var1: '', var2: '', attr1: '', attr2: '', distance: '', threshold: 0, operator: '' }],
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
            })
            .catch((err) => {
                console.log(err);
            });
    }

    submitGGDs = (e: any) => {
        console.log('Submit GGDs function');
        e.preventDefault();
        const gp1Vertices = this.state.graphPattern1.nodes.map((x) => {
            return { label: x['label'], variable: x['variable'] };
        });
        const gp1Edges = this.state.graphPattern1.links.map((x) => {
            return {
                label: x['label'],
                variable: x['variable'],
                fromVariable: x['fromVariable'],
                toVariable: x['toVariable'],
            };
        });
        const gp1 = { name: this.state.graph1, vertices: gp1Vertices, edges: gp1Edges };

        ////gp2
        const gp2Vertices = this.state.graphPattern2.nodes.map((x) => {
            return { label: x['label'], variable: x['variable'] };
        });
        const gp2Edges = this.state.graphPattern2.links.map((x) => {
            return {
                label: x['label'],
                variable: x['variable'],
                fromVariable: x['fromVariable'],
                toVariable: x['toVariable'],
            };
        });
        const gp2 = { name: this.state.graph2, vertices: gp2Vertices, edges: gp2Edges };
        const sourceGP = [gp1, gp2];
        const targetGP = [
            {
                name: this.state.targetgraph,
                vertices: this.state.targetPattern.vertices,
                edges: this.state.targetPattern.edges,
            },
        ];
        const sourceCons = this.state.constraints.filter((x) => x['var1'] != '');
        const targetCons: any[] = [];
        const fullGGD = { sourceGP, sourceCons, targetGP, targetCons };
        console.log(JSON.stringify(fullGGD));
        this.props.setGGDs(fullGGD);
    };

    HighlightGraph = (props: { graph: { nodes: []; links: [] }; id: number; onSetGraphPattern: any }) => {
        const [highlightNodes1, setHighlightNodes1] = useState(new Set());
        const [highlightLinks1, setHighlightLinks1] = useState(new Set());
        let [graphPattern1, setGraphPattern1] = useState({
            nodes: [{ label: '', variable: '', id: '', property: [''] }],
            links: [{ label: '', variable: '', fromVariable: '', toVariable: '', property: [''] }],
        });
        const [showSubmit, setShowSubmit] = useState(false);
        const [variables, setVariables] = useState([{ id: 0, label: '', variable: '' }]);
        const NODE_R = 3;
        const vertexDict = new Map();
        const isLoaded: boolean[] = [false, false, false];
        let count = 1;
        const updateHighlight = () => {
            setHighlightNodes1(highlightNodes1);
            setHighlightLinks1(highlightLinks1);
        };

        const handleNodeHover = (node: NodeObject, id: number) => {
            if (node) {
                if (highlightNodes1.has(node)) {
                    highlightNodes1.delete(node);
                } else {
                    highlightNodes1.add(node);
                }
            }
            updateHighlight();
        };

        const handleLinkHover = (link: LinkObject, id: number) => {
            if (link) {
                if (highlightLinks1.has(link)) {
                    highlightLinks1.delete(link);
                } else {
                    highlightLinks1.add(link);
                }
            }
            updateHighlight();
        };

        const checkLinks = (link: LinkObject, id: number): boolean => {
            return highlightLinks1.has(link);
        };

        const checkNodes = (node: NodeObject, id: number): boolean => {
            return highlightNodes1.has(node);
        };

        const generateVariable = (label: string): string => {
            const randomStr: string = Math.random().toString(36).substring(2);
            return randomStr.concat('_').concat(label.substr(0, 3));
        };

        const onSetSubmitGraphPattern = (e: any, id: number) => {
            let nodes = new Set();
            let links = new Set();
            const vertexArray = []; //new Array()
            const edgesArray = []; //new Array()
            nodes = highlightNodes1;
            links = highlightLinks1;
            for (const item of nodes.values()) {
                const itemNode = JSON.stringify(item);
                const jsonNode = JSON.parse(itemNode);
                const variable = generateVariable(jsonNode.label);
                const id = jsonNode.id.Number;
                vertexDict.set(id, variable);
                const vertex = {
                    label: jsonNode.label,
                    variable: variable,
                    id: jsonNode.id,
                    property: jsonNode.property,
                };
                vertexArray.push(vertex);
                count = count + 1;
                variables.push({ id: count, label: jsonNode.label.toString(), variable: variable });
            }
            for (const link of links.values()) {
                const itemLink = JSON.stringify(link);
                const jsonLink = JSON.parse(itemLink);
                const variable = generateVariable(jsonLink.label);
                const fromVar = vertexDict.get(jsonLink.source.id.Number);
                const toVar = vertexDict.get(jsonLink.target.id.Number);
                const edge = {
                    label: jsonLink.label,
                    variable: variable,
                    fromVariable: fromVar,
                    toVariable: toVar,
                    property: jsonLink.property,
                };
                console.log(
                    jsonLink.id,
                    jsonLink.label,
                    jsonLink.source.id,
                    jsonLink.source.label,
                    jsonLink.target.id,
                    jsonLink.target.label,
                    jsonLink.property
                );
                edgesArray.push(edge);
                count = count + 1;
                variables.push({ id: count, label: jsonLink.label.toString(), variable: variable });
            }
            graphPattern1 = {
                nodes: vertexArray,
                links: edgesArray,
            };
            setGraphPattern1(graphPattern1);
            isLoaded[id - 1] = true;
            setVariables(variables.slice(1));
            props.onSetGraphPattern({ graphPattern1, id });
            alert('The Graph Pattern ' + id + ' has been setted!');
        };

        const columnsVariables: GridColDef[] = [
            {
                field: '',
                headerName: 'Show',
                sortable: false,
                width: 30,
            },
            { field: 'label', headerName: 'Label', width: 150 },
            { field: 'variable', headerName: 'Variable', width: 250 },
        ];

        return (
            <div>
                <ForceGraph2D
                    graphData={props.graph}
                    nodeRelSize={NODE_R}
                    //nodeCanvasObject={paintRing}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={(link) => (checkLinks(link, props.id) ? 5 : 1)}
                    nodeColor={(node) => (checkNodes(node, props.id) ? 'red' : 'blue')}
                    linkCurvature={0.25}
                    nodeLabel={'label'}
                    linkLabel={'label'}
                    onNodeClick={(e) => handleNodeHover(e, props.id)}
                    onLinkClick={(e) => handleLinkHover(e, props.id)}
                    width={innerWidth/2}
                    height={innerHeight/2}
                />
                <Button onClick={(e) => onSetSubmitGraphPattern(e, props.id)}>Click to Set Graph Pattern</Button>
                <Button onClick={(e) => setShowSubmit(true)}>Click to see the variable names</Button>
                {showSubmit && (
                    <div style={{ height: 300, width: '60%' }}>
                        <DataGrid rows={variables} columns={columnsVariables} pageSize={5} />{' '}
                    </div>
                )}
            </div>
        );
    };

    render() {
        const getVar = (): string[] => {
            const nodes1 = this.state.graphPattern1.nodes.map((x) => x['variable']);
            const nodes2 = this.state.graphPattern2.nodes.map((x) => x['variable']);
            const links1 = this.state.graphPattern1.links.map((x) => x['variable']);
            const links2 = this.state.graphPattern2.links.map((x) => x['variable']);
            return nodes1.concat(nodes2).concat(links1).concat(links2);
        };

        const getAttr = (): Array<any> => {
            const properties = new Set();
            const nodes1 = this.state.graphPattern1.nodes
                .map((x) => x['property'])
                .toString()
                .split(',');
            nodes1.forEach((x) => properties.add(x));
            const nodes2 = this.state.graphPattern2.nodes
                .map((x) => x['property'])
                .toString()
                .split(',');
            nodes2.forEach((x) => properties.add(x));
            const links1 = this.state.graphPattern1.links
                .map((x) => x['property'])
                .toString()
                .split(',');
            links1.forEach((x) => properties.add(x));
            const links2 = this.state.graphPattern2.links
                .map((x) => x['property'])
                .toString()
                .split(',');
            links2.forEach((x) => properties.add(x));
            const array = Array.from(properties);
            return array;
        };

        //#########################

        const graphSelect = (e: any, id: number) => {
            console.log(e.target.value); // graph name
            // if (e.target.value) this.props.setType(e.target.value);
            const graphValue = e.target.value;
            fetch('http://127.0.0.1:3001/gcore/schema/' + e.target.value)
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
                    if (id == 1) {
                        this.setState({
                            props1: {
                                graph: {
                                    nodes: JSON.parse(json.nodes),
                                    links: obj2,
                                },
                                id: 1,
                                onSetGraphPattern: this.handleGraphPattern,
                            },
                            graph1: graphValue,
                        });
                    }
                    if (id == 2) {
                        this.setState({
                            props2: {
                                graph: {
                                    nodes: JSON.parse(json.nodes),
                                    links: obj2,
                                },
                                id: 2,
                                onSetGraphPattern: this.handleGraphPattern,
                            },
                            graph2: graphValue,
                        });
                    }
                    if (id == 3) {
                        this.setState({
                            propst: {
                                graph: {
                                    nodes: JSON.parse(json.nodes),
                                    links: obj2,
                                },
                                id: 3,
                            },
                            targetgraph: graphValue,
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <div>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">Source Graph Pattern 1</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.graph1}
                                    onChange={(e) => graphSelect(e, 1)}
                                >
                                    {this.state.graphs.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            {this.state.props1.graph.nodes.length != 0 && (
                                <div>
                                    {' '}
                                    <this.HighlightGraph {...this.state.props1} />
                                </div>
                            )}
                            {this.state.props2.graph.nodes.length == 0 && <div>Select a graph</div>}
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <div>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">Source Graph Pattern 2</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.graph2}
                                    onChange={(e) => graphSelect(e, 2)}
                                >
                                    {this.state.graphs.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            {this.state.props2.graph.nodes.length != 0 && (
                                <div>
                                    {' '}
                                    <this.HighlightGraph {...this.state.props2} />
                                </div>
                            )}
                            {this.state.props2.graph.nodes.length == 0 && <div>Select a graph</div>}
                        </div>
                    </Grid>
                </Grid>
                <Box border={1}>
                    <div>
                        <ConstraintForm
                            var1={getVar()}
                            var2={getVar()}
                            attr1={getAttr()}
                            attr2={getAttr()}
                            operator={['<', '<=', '=']}
                            handleSubmitCons={this.submitConstraints}
                        />
                    </div>
                </Box>
                <div>
                    <FormControl>
                        <InputLabel id="demo-simple-select-label">Target Graph Pattern</InputLabel>
                        <StyledSelect
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.targetgraph}
                            onChange={(e) => graphSelect(e, 3)}
                        >
                            {this.state.graphs.map((g) => (
                                <MenuItem value={g} key={g}>
                                    {g}
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </FormControl>
                    <TargetGraph
                        graph1={this.state.graph1}
                        graph2={this.state.graph2}
                        submitTarget={this.submitTarget}
                        targetgraph={this.state.targetgraph}
                        schemaGraph={this.state.propst.graph}
                        vars={getVar()}
                    />
                </div>
                <Button className="btn btn-primary" onClick={this.submitGGDs}>
                    Submit GGDs
                </Button>
            </div>
        );
    }
}

export default SetGgdsPanel;
