import React from 'react';
import SetGgdsPanel from './set-ggds-panel';
import { Button } from '@material-ui/core';

interface GGDsPanelWrapperProps {}

interface GGDsPanelWrapperState {
    id: number;
    ggds: any[];
}

/**
 * App
 *
 * Simple react js fetch example
 */
class GGDsPanelWrapper extends React.Component<GGDsPanelWrapperProps, GGDsPanelWrapperState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: GGDsPanelWrapperProps) {
        super(props);

        this.state = {
            id: 0,
            ggds: [],
        };
    }

    sendGGDs = (event: any) => {
        event.preventDefault();
        const str = JSON.stringify(this.state.ggds).replace(/'/g, '"');
        fetch('http://127.0.0.1:3001/gcore/er/setggds', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state.ggds)//JSON.stringify(this.state.ggds),
        })
            .then((res) => res.text())
            .then((json) => {
                console.log(JSON.stringify(json));
                alert(JSON.stringify(json));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    setGGD = (e: any) => {
        console.log('ggd from wrapper:' + JSON.stringify(e));
        this.setState(
            {
                ggds: this.state.ggds.concat(e),
                id: this.state.id + 1,
            },
            () => {
                console.log(this.state.ggds);
            }
        );
        console.log(this.state.ggds);
    };

    render() {
        return (
            <div>
                <SetGgdsPanel id={this.state.id} setGGDs={this.setGGD} />
                <Button className="btn btn-primary" onClick={this.sendGGDs}>
                    Send GGDs to sHINNER
                </Button>
            </div>
        );
    }
}

export default GGDsPanelWrapper;
