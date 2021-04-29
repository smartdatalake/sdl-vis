import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import { Card } from 'react-bootstrap';
import './panels.scss';

class DataPofilingPanel extends React.Component {
    public render() {
        return (
            <div className={'panel left'}>
                <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Data Profiling</Card.Title>
                        <Card.Text>
                            Some quick example text to build on the card title and make up the bulk of the card&apos;s
                            content.
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default DataPofilingPanel;
