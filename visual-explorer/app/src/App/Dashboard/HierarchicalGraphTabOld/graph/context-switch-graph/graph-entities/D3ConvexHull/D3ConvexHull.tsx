import React from 'react';
import { Vector2D } from 'types/Vector2D';
import { polygonHull } from 'd3';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import './D3ConvexHull.scss';
import Shape, { Point } from '@doodle3d/clipper-js';

interface ID3ConvexHullProps {
    points: Vector2D[];
    parentNode: CustomHierarchyNode;
    onDoubleClick: () => void;
    delta?: number;
}

const D3ConvexHull = (props: ID3ConvexHullProps) => {
    let polygonElement: JSX.Element | null = null;

    const delta = props.delta ? props.delta : 0;

    const convexHull: Point[] | undefined = polygonHull(props.points.map((p) => [p.x, p.y]))?.map(([X, Y]) => ({
        X,
        Y,
    }));

    if (convexHull) {
        let convexHullShape = new Shape([convexHull], true);

        convexHullShape = convexHullShape.offset(delta, {
            jointType: 'jtSquare',
        });

        if (convexHullShape.paths[0]) {
            const convexHullString = convexHullShape.paths[0].reduce((acc, curr) => {
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
    }

    return (
        <g className={'d3-convex-hull'} onDoubleClick={props.onDoubleClick}>
            {polygonElement}
        </g>
    );
};

export default D3ConvexHull;
