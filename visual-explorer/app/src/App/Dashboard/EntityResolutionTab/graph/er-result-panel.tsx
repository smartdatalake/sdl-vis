import React from 'react';
import { Alert } from 'react-bootstrap';
import Button from '@material-ui/core/Button';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import SampleGraphVis from './sample-graph-vis';

interface GGDResultTableProps {}

interface GGDResultTableState {
    status: string;
    info: any;
    label: string;
    rowData: any;
    show: boolean;
    resultgraph: {
        nodes: [];
        links: [];
    };
}
/**
 * App
 *
 * Simple react js fetch example
 */
class GGDResultTable extends React.Component<GGDResultTableProps, GGDResultTableState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */

    constructor(props: GGDResultTableProps) {
        super(props);
        this.state = {
            status: 'Click to run',
            info: [
                { id: '0', ggd: 1, name: 'Label', number: 0, graphName: 'result' },
                { id: '2', ggd: 2, name: 'Label', number: 0, graphName: 'result' },
            ],
            label: 'sameAs',
            rowData: [],
            show: false,
            resultgraph: {
                nodes: [],
                links: [],
            },
        };
    }

    querySampleGraph = (label: string, graphname: string) => {
        //alert(label);
        const querytoSend = 'CONSTRUCT (p)-[e]->(c) MATCH (p)-[e:' + label + ']->(c) ON ' + graphname;
        fetch('http://127.0.0.1:3001/gcore/query/construct', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: querytoSend, limit: 50 }),
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
                this.setState(
                    {
                        resultgraph: {
                            nodes: JSON.parse(json.nodes),
                            links: obj2,
                        },
                    },
                    () => {
                        console.log(JSON.stringify(this.state.resultgraph));
                    }
                );
            })
            .catch((err) => {
                console.log(err);
            });
    };

    render() {
        const rows = [
            { id: '1', ggd: 1, name: 'sameAs_ggd1', number: 35 },
            { id: '2', ggd: 2, name: 'sameAs_ggd2', number: 35 },
            { id: '3', ggd: 3, name: 'sameAs_ggd3', number: 35 },
        ];

        const columns: GridColDef[] = [
            {
                field: '',
                headerName: 'Show',
                sortable: false,
                width: 100,
                renderCell: (params) => {
                    const onClick = () => {
                        const labelH = JSON.stringify(params.getValue(params.id, 'name'));
                        this.querySampleGraph(labelH, JSON.stringify(params.getValue(params.id, 'graphName')));
                        this.setState({
                            label: labelH,
                            show: true,
                        });
                    };
                    return <Button onClick={onClick}>Click</Button>;
                },
            },
            { field: 'id', headerName: 'ID', width: 100 },
            { field: 'ggd', headerName: 'GGD', width: 130 },
            { field: 'name', headerName: 'Label', width: 130 },
            { field: 'number', headerName: 'Number Generated', width: 140 },
            { field: 'graphName', headerName: 'Graph Name', width: 160 },
        ];

        const onClickRun = (e: any) => {
            this.setState({
                status: 'Running....',
            });
            fetch('http://127.0.0.1:3001/gcore/er/run', {
                //   mode: 'cors'
                /*   method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            //body: JSON.stringify(this.state)*/
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.text())
                .then((json) => {
                    this.setState({
                        status: 'Resulting graph name:' + JSON.parse(json)['graphName'],
                        info: JSON.parse(json)['resultInfo'],
                    });
                    console.log(json);
                })
                .catch((err) => {
                    console.log(err);
                });
        }; //make component to render graph schemas

        const onClickDrop = (e: any) => {
            /*format:
            [{"id":"0","ggd":1,"name":"Label","number":0,"graphname":"result"},{"id":"2","ggd":2,"name":"Label","number":0,"graphname":"result"}]
            */
            fetch('http://127.0.0.1:3001/gcore/er/drop-tables', {
                //   mode: 'cors'
                method: 'POST',
                body: JSON.stringify(this.state.rowData),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.text())
                .then((json) => {
                    alert(json);
                    console.log(json);
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        return (
            <div>
                <div>
                    <Button onClick={onClickRun}>Run sHINNER</Button>
                    <Alert variant="info">{this.state.status}</Alert>
                </div>
                <div style={{ height: 300, width: '100%' }}>
                    <DataGrid
                        rows={this.state.info}
                        columns={columns}
                        pageSize={3}
                        checkboxSelection
                        onRowClick={(e) => console.log('selected rowData:', e.row)}
                        onSelectionModelChange={(e) => {
                            const selectedIDs = new Set(e);
                            const selectedRowData = this.state.info.filter((row: any) => selectedIDs.has(row.id));
                            this.setState({
                                rowData: selectedRowData,
                            });
                        }}
                    />
                </div>
                                    <Button onClick={onClickDrop}> Submit </Button>
                <div>
                    <SampleGraphVis graphvis={this.state.resultgraph} width={window.innerWidth - 500} height={window.innerHeight/2}/>
                </div>
            </div>
        );
    }
}

export default GGDResultTable;
