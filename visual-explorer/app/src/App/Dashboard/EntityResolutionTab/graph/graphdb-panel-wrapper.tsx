import React from 'react';
import { Alert } from 'react-bootstrap';
import { withStyles } from '@material-ui/core/styles';
import ForceGraph2D from 'react-force-graph-2d';
import {
    List,
    ListItemText,
    ListItem,
    ListSubheader,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Box,
} from '@material-ui/core';

const StyledSelect = withStyles({
    root: {
        borderRadius: 3,
        border: 0,
        height: 30,
        width: 180,
        align: 'center',
    },
})(Select);

interface GraphdbPanelWrapperProps {}

interface GraphdbPanelWrapperState {
    graphs: [];
    graph: string;
    isLoaded: boolean;
    graphvis?: {
        nodes: [];
        links: [];
    };
    label: string;
    properties: [];
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
            graph: 'schema-graph', // schema : undefined
            graphvis: {
                nodes: [],
                links: [],
            },
            label: 'label',
            properties: [],
        };
    }

    /**
     * componentDidMount
     *
     * Fetch json array of objects from given url and update state.
     */
    componentDidMount() {
        fetch('http://127.0.0.1:3001/gcore/availableGraphs')
            .then((res) => res.json())
            .then((json) => {
                this.setState({
                    graphs: JSON.parse(json),
                    //graphs: json,
                    isLoaded: true,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * render
     *
     * Render UI
     */
    render() {
        /*function renameKey(obj: any, oldKey: any, newKey: any) {
            obj[newKey] = obj[oldKey];
            delete obj[oldKey];
        }*/

        const onGraphChangeFn = (e: any) => {
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
                    console.log(JSON.stringify(obj2));
                    this.setState({
                        graphvis: {
                            nodes: JSON.parse(json.nodes),
                            links: obj2,
                        },
                    });
                    console.log(this.state.graphvis?.links);
                })
                .catch((err) => {
                    console.log(err);
                });
            this.setState({
                graph: graphValue,
            });
        }; // make component to render graph schemas

        const { isLoaded, graphs } = this.state;

        const handleNodeProperties = (node: any) => {
            this.setState({
                label: node['label'],
                properties: node['property'],
            });
        };

        const handleLinkProperties = (link: any) => {
            this.setState({
                label: link['label'],
                properties: link['property'],
            });
        };

        if (!isLoaded)
            return (
                <div>
                    {' '}
                    <Alert variant="warning"> Loading...(check for connection or load database error)</Alert>
                </div>
            );

        return (
            <div className="GraphDB">
                <FormControl variant="filled">
                    <InputLabel>{`Schema Graph`}</InputLabel>
                    <StyledSelect value={this.state.graph} onChange={onGraphChangeFn}>
                        {this.state.graphs.map((g) => (
                            <MenuItem value={g} key={g}>
                                {g}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </FormControl>
                <Box border={1}>
                    <List subheader={<ListSubheader />}>
                        <ListSubheader key={`section-label`}>{`Label ${this.state.label}`}</ListSubheader>
                        <hr></hr>
                        <ListSubheader>{`Properties`}</ListSubheader>
                        {this.state.properties.map((item) => (
                            <ListItem key={`item-${this.state.label}-${item}`} alignItems="flex-start" divider>
                                <ListItemText primary={item} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <ForceGraph2D
                    graphData={this.state.graphvis}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}
                    nodeLabel={'label'}
                    linkLabel={'label'}
                    onNodeClick={handleNodeProperties}
                    onLinkClick={handleLinkProperties}
                    width={200}
                    height={600}
                />
            </div>
        );
    }
}

export default GraphdbPanelWrapper;
