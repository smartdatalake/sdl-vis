import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './D3Circle.scss';

interface ID3CircleProps {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    r: number;
    color: string;
    id: string;
    keywords?: string;
    numEmployees?: string;
    revenue?: string;
    keywordsScore?: number;
    employeesScore?: number;
    revenueScore?: number;
    key: string;
    class?: string;
}

const D3Circle = (props: ID3CircleProps) => {
    // console.log("props", props)

    return (
        <OverlayTrigger
            placement={'right'}
            overlay={
                <Tooltip id={`tooltip-link-${props.id}`}>
                    <table className={'tooltip-table'}>
                        <tbody>
                            <tr>
                                <td>Id:</td>
                                <td>&nbsp;</td>
                                <td>{props.id}</td>
                            </tr>
                            <tr>
                                <td>Keywords:</td>
                                <td>&nbsp;</td>
                                <td>{props.keywords}</td>
                                <td>&nbsp;</td>
                                <td>{props.keywordsScore}</td>
                            </tr>
                            <tr>
                                <td>#Employees:</td>
                                <td>&nbsp;</td>
                                <td>{props.numEmployees}</td>
                                <td>&nbsp;</td>
                                <td>{props.employeesScore}</td>
                            </tr>
                            <tr>
                                <td>Revenue:</td>
                                <td>&nbsp;</td>
                                <td>{props.revenue}</td>
                                <td>&nbsp;</td>
                                <td>{props.revenueScore}</td>
                            </tr>
                        </tbody>
                    </table>
                </Tooltip>
            }
        >
            <g>
                <circle
                    className={'d3-circle' + ' ' + props.class}
                    cx={+props.x}
                    cy={+props.y}
                    r={props.r}
                    fill={props.color}
                />
                <line
                    className={'line' + ' ' + props.class}
                    stroke={props.color}
                    x1={+props.x}
                    y1={+props.y}
                    x2={+props.oldX}
                    y2={+props.oldY}
                />
            </g>
        </OverlayTrigger>
    );
};

export default D3Circle;
