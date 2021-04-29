import React from 'react';
import Link from 'types/Link';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import './D3Link.scss';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface ID3LinkProps {
    link: Link;
    parentNode: CustomHierarchyNode;
}

const D3Link = (props: ID3LinkProps) => {
    return (
        <g>
            <OverlayTrigger
                placement={'right'}
                overlay={
                    <Tooltip id={`tooltip-link-${props.link.source.data.id}-${props.link.target.data.id}`}>
                        <table className={'tooltip-table'}>
                            <tbody>
                                <tr>
                                    <td>Link strength:</td>
                                    <td>&nbsp;</td>
                                    <td>{props.link.strength}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Tooltip>
                }
            >
                <line
                    className={'d3-link'}
                    style={{
                        strokeWidth: props.link.strength,
                        stroke: props.parentNode.color,
                    }}
                    x1={props.link.source.x}
                    y1={props.link.source.y}
                    x2={props.link.target.x}
                    y2={props.link.target.y}
                />
            </OverlayTrigger>
        </g>
    );
};

export default D3Link;
