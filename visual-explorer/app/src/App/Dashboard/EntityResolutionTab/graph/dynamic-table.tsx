import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React from 'react';

interface DataTableProps {
    data: any[];
    headers: any[];
}

interface DataTableState {
    name: string;
}

/**
 * App
 *
 * Simple react js fetch example
 */
class DataTable extends React.Component<DataTableProps, DataTableState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: DataTableProps) {
        super(props);

        this.state = {
            name: '',
        };
    }

    render() {
        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            {this.props.headers.map((header) => (
                                <TableCell align="right" key={header}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.data.map((row, id) => (
                            <TableRow key={id}>
                                {this.props.headers.map((header) => (
                                    <TableCell align="right" key={id}>
                                        {row[header]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

export default DataTable;
