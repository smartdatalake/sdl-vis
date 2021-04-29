import React from 'react';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import './D3Node.scss';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getInnerLinkage } from 'tools/hierarchy-data-profiling';
import { getColorVariations } from 'tools/color';

interface ID3NodeProps {
    node: CustomHierarchyNode;
    onDoubleClick: () => void;
}

const D3Node = (props: ID3NodeProps) => {
    return (
        <g>
            <OverlayTrigger
                placement={'right'}
                overlay={
                    <Tooltip id={`tooltip-node-${props.node.data.id}`}>
                        <table className={'tooltip-table'}>
                            <tbody>
                                <tr>
                                    <td>Id:</td>
                                    <td>&nbsp;</td>
                                    <td>{props.node.data.id}</td>
                                </tr>
                                <tr>
                                    <td>Depth:</td>
                                    <td>&nbsp;</td>
                                    <td>{props.node.depth}</td>
                                </tr>
                                <tr>
                                    <td>Leaf count:</td>
                                    <td>&nbsp;</td>
                                    <td>{props.node.data.count}</td>
                                </tr>
                                <tr>
                                    <td>Inner linkage:</td>
                                    <td>&nbsp;</td>
                                    <td>{(getInnerLinkage(props.node) * 100).toFixed(1)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </Tooltip>
                }
            >
                <circle
                    className={'d3-node'}
                    style={{
                        stroke: props.node.color,
                        fill: getColorVariations(props.node.color, 2)[1],
                    }}
                    cx={props.node.x}
                    cy={props.node.y}
                    r={props.node.radius}
                    onDoubleClick={props.onDoubleClick}
                />
            </OverlayTrigger>
        </g>
    );
};

export default D3Node;
