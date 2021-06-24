import React from 'react';
import Shape, { Point } from '@doodle3d/clipper-js';
import { curveBasisClosed, interpolateRgb, line, polygonHull } from 'd3';
import { FormattedGraphDataRow } from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVis';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/**
 * Converts a ClipperJS Point instance to a D3 array point representation.
 * @param p A ClipperJS Point instance.
 */
const pta = (p: Point): [x: number, y: number] => [p.X, p.Y];

/**
 * Converts a D3 array point representation to a ClipperJS Point instance.
 * @param p A D3 array point representation.
 */
const atp = (p: [x: number, y: number]): Point => ({ X: p[0], Y: p[1] });

const curveGenerator = line<Point>()
    .curve(curveBasisClosed)
    .x((d) => d.X)
    .y((d) => d.Y);

interface Props {
    dataPoints: FormattedGraphDataRow[];
    color: string;
    delta?: number;
}

const ClusterHull: React.FunctionComponent<Props> = ({ dataPoints, color, delta = 20 }: Props) => {
    const points: Array<Point> = dataPoints.map((p) => ({ X: p.x, Y: p.y }));

    // If there are less than 3 points in cluster, add dummy points to allow computation of complex hull
    if (points.length < 3) {
        const p0 = points[0];

        points.push({
            X: p0.X + 0.0001,
            Y: p0.Y + 0.0001,
        });

        points.push({
            X: p0.X - 0.0001,
            Y: p0.Y - 0.0001,
        });
    }

    const convexHull: Point[] | undefined = polygonHull(points.map(pta))?.map(atp);

    if (convexHull) {
        let convexHullShape = new Shape([convexHull], true);

        convexHullShape = convexHullShape.offset(delta, {
            jointType: 'jtRound',
        });

        if (convexHullShape.paths[0]) {
            return (
                <>
                    <path
                        d={curveGenerator(convexHullShape.paths[0]) as string}
                        style={{
                            stroke: color,
                            fill: interpolateRgb(color, TRANSPARENT)(0.75),
                        }}
                    />
                </>
            );
        }
    }

    // In case something went wrong during computation of convex hull, render nothing.
    return null;
};

export default ClusterHull;
