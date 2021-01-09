import React from 'react';
import { curveBasisClosed, line, polygonHull, ScaleLinear } from 'd3';
import { Node } from './ProjectionSVG';
import 'js-clipper';

interface IConvexHullProps {
    points: Node[];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}

const ConvexHull = (props: IConvexHullProps) => {
    const delta = 20;

    // k needs to be known
    const kArr = Array.from(new Set(props.points.map(o => o.cluster)));
    const hullPoints: Node[][] = [];
    kArr.forEach(k => {
        hullPoints.push(props.points.filter(p => p.cluster === k));
    });

    const polyColor: string[] = [];

    const offsetPolygons: ClipperLib.IntPoint[][] = hullPoints
        .map((hull, idx) => {
            // compute average angle of hsl colors of all points
            const avgAngle =
                (180 / Math.PI) *
                Math.atan2(
                    (1 / hull.length) *
                        hull
                            .map(p => p.fillColor)
                            .reduce(
                                (acc, curr) =>
                                    acc +
                                    Math.sin(
                                        (Math.PI / 180) *
                                            +curr
                                                .replace(/[^\d.,]/g, '')
                                                .split(',')[0]
                                    ),
                                0
                            ),
                    (1 / hull.length) *
                        hull
                            .map(p => p.fillColor)
                            .reduce(
                                (acc, curr) =>
                                    acc +
                                    Math.cos(
                                        (Math.PI / 180) *
                                            +curr
                                                .replace(/[^\d.,]/g, '')
                                                .split(',')[0]
                                    ),
                                0
                            )
                );
            polyColor.push(
                'hsl(' +
                    avgAngle +
                    ',' +
                    hull
                        .map(p => p.fillColor)
                        .reduce(
                            (acc, curr) =>
                                acc +
                                +curr.replace(/[^\d.,]/g, '').split(',')[1],
                            0
                        ) /
                        hull.length +
                    '%,50%)'
            );

            if (hull.length < 3) {
                const add = hull[0];
                add.x += 0.00001;
                hull.push(add);
                add.y += 0.00001;
                hull.push(add);
            }

            const convexHull = polygonHull(
                hull.map(n => [props.xScale(n.x) || 0, props.yScale(n.y) || 0])
            );

            if (convexHull) {
                const clipper = new ClipperLib.Clipper();

                const convexHullIntPoints = convexHull.map(
                    p => new ClipperLib.IntPoint(p[0], p[1])
                );

                const offsetPolygon = clipper.OffsetPolygons(
                    [convexHullIntPoints],
                    delta,
                    ClipperLib.JoinType.jtRound,
                    2,
                    true
                )[0];

                return Array.from(offsetPolygon);
            }

            return [];
        })
        .filter(p => p.length > 0); // Filter empty arrays (no convex hull)

    const curveGenerator = line<ClipperLib.IntPoint>()
        .curve(curveBasisClosed)
        .x(d => d.X)
        .y(d => d.Y);

    return (
        <g className={'convex-hulls'}>
            {offsetPolygons.map((offsetPolygon, idx) => {
                return (
                    <path
                        key={String(idx)}
                        d={curveGenerator(offsetPolygon) as string}
                        style={{
                            stroke: polyColor[idx],
                            fill: 'none',
                        }}
                    />
                );
            })}
        </g>
    );
};

export default ConvexHull;
