import React from 'react';
import { Vector2D } from 'types/Vector2D';
import { polygonHull } from 'd3';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import 'js-clipper';
import './D3ConvexHull.scss';

interface ID3ConvexHullProps {
    points: Vector2D[];
    parentNode: CustomHierarchyNode;
    onDoubleClick: () => void;
    delta?: number;
}

const D3ConvexHull = (props: ID3ConvexHullProps) => {
    let polygonElement: JSX.Element | null = null;

    const delta = props.delta ? props.delta : 0;

    const convexHull = polygonHull(props.points.map(n => [n.x, n.y]));

    if (convexHull && convexHull.length > 2) {
        const clipper = new ClipperLib.Clipper();
        const convexHullIntPoints = convexHull.map(
            p => new ClipperLib.IntPoint(p[0], p[1])
        );

        const offsetPolygons = clipper.OffsetPolygons(
            [convexHullIntPoints],
            delta,
            ClipperLib.JoinType.jtRound,
            2,
            true
        ) as ClipperLib.IntPoint[][];

        const convexHullString = offsetPolygons[0].reduce((acc, curr) => {
            return `${acc} ${curr.X},${curr.Y}`;
        }, '');

        polygonElement = (
            <polygon
                points={convexHullString}
                style={{
                    stroke: props.parentNode.color,
                    fill: props.parentNode.color,
                }}
            />
        );
    }

    return (
        <g className={'d3-convex-hull'} onDoubleClick={props.onDoubleClick}>
            {polygonElement}
        </g>
    );
};

export default D3ConvexHull;
