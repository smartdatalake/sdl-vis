import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

interface SetGGDsFilePanelProps {}

interface SetGGDsFilePanelState {
    ggds: string;
    file: any;
}

class SetGGDsFilePanel extends React.Component<SetGGDsFilePanelProps, SetGGDsFilePanelState> {
    constructor(props: SetGGDsFilePanelProps) {
        super(props);
        this.state = {
            ggds: 'Please write your GGDs here',
            file: null,
        };
        this.file = this.file.bind(this);
    }

    handleChange = (event: any) => {
        const target = event.target;
        const value = target.value;
        this.setState({ ggds: value });
    };

    file = (evt: any) => {
        const f = evt.target.files[0];
        this.setState({ file: evt.target.files[0] });
        if (f) {
            const r = new FileReader();
            r.onload = (e: any) => {
                const contents = e.target.result;
                this.setState({ ggds: contents });
            };
            r.readAsText(f);
        } else {
            alert('Failed to load file');
        }
    };

    handleSubmit = (event: any) => {
        event.preventDefault();
        fetch('http://127.0.0.1:3001/gcore/er/setggds', {
            method: 'POST',
            // We convert the React state to JSON and send it as the POST body
            // body: JSON.stringify(this.state)
            headers: {
                'Content-Type': 'application/json',
            },
            body: this.state.ggds, // JSON.stringify(this.state.ggds)
        })
            .then((res) => res.text())
            .then((json) => {
                console.log(JSON.stringify(json));
                alert(JSON.stringify(json));
            })
            .catch((err) => {
                console.log(err);
            });
        alert('GGDs submitted!');
    };

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormGroup role="form">
                    <Form.Label>Upload your GGDs JSON file here:</Form.Label>
                    <input type="file" onChange={this.file} />
                    <Button className="btn btn-secondary" type="submit" value="Submit">
                        Submit
                    </Button>
                </FormGroup>
            </Form>
        );
    }
}

export default SetGGDsFilePanel;
