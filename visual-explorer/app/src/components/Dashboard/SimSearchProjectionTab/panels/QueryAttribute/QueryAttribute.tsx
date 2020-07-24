import * as React from 'react';
import './QueryAttribute.scss';
import { Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Slider from 'rc-slider';
import 'rc-slider/dist/rc-slider.css';
import * as d3 from 'd3';

interface Props {
    attribute: {
        weight: number;
        value: number | string;
        active: boolean;
    };
    name: string;
    changeFn: any;
}

class QueryAttribute extends React.Component<Props> {
    public render() {
        const chWeightFn = (e: number) => {
            this.props.changeFn(this.props.name, 'weight', e);
        };

        const removeAttributeFn = (e: any) => {
            this.props.changeFn(this.props.name, 'active', false);
        };

        const chValueFn = (e: any) => {
            this.props.changeFn(this.props.name, 'value', e.target.value);
        };

        const mouseEnterSliderFn = (e: any) => {
            d3.select('#slider-' + this.props.name)
                .selectAll('.rc-slider-step')
                .style('box-shadow', '0px 0px 5px 2px rgba(255, 0, 0, 0.5)');

            d3.selectAll('.prediction-' + this.props.name).style(
                'opacity',
                0.3
            );
        };

        const mouseLeaveSliderFn = (e: any) => {
            d3.select('#slider-' + this.props.name)
                .selectAll('.rc-slider-step')
                .transition()
                .style('box-shadow', 'unset');

            d3.selectAll('.prediction-' + this.props.name).style('opacity', 0);
        };

        return (
            <div className={'query-attribute'}>
                <Form>
                    <Form.Group>
                        <Form.Row>
                            <Form.Label
                                column={true}
                                lg={0}
                                style={{ fontStyle: 'italic' }}
                            >
                                {this.props.attribute.weight} ⨯
                            </Form.Label>
                            <Col style={{ width: 120 }}>
                                <Form.Control
                                    readOnly={true}
                                    type="text"
                                    defaultValue={this.props.name.toUpperCase()}
                                />
                            </Col>
                            <Form.Label column={true} lg={0}>
                                =
                            </Form.Label>
                            <Col style={{ width: 200 }}>
                                <Form.Control
                                    name={this.props.name}
                                    type="text"
                                    defaultValue={this.props.attribute.value.toString()}
                                    onBlur={chValueFn}
                                />
                            </Col>
                            <div
                                id={'r-att-' + this.props.name}
                                className={'remove-attribute-button'}
                                onClick={removeAttributeFn}
                            >
                                x
                            </div>
                        </Form.Row>
                        <div
                            id={'slider-' + this.props.name}
                            onMouseEnter={mouseEnterSliderFn}
                            onMouseLeave={mouseLeaveSliderFn}
                        >
                            <Slider
                                onAfterChange={chWeightFn}
                                min={0}
                                max={1}
                                step={0.05}
                                defaultValue={this.props.attribute.weight}
                            />
                        </div>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

export default QueryAttribute;
