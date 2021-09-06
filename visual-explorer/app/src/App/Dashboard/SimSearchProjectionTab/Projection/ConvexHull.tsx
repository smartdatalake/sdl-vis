import React from 'react';
import Shape, { Point } from '@doodle3d/clipper-js';
import { hsl } from 'd3-color';
import { mean } from 'd3-array';
import { ScaleLinear } from 'd3-scale';
import { curveBasisClosed, line } from 'd3-shape';
import { polygonHull } from 'd3-polygon';
import { SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';

interface IConvexHullProps {
    points: SimilarityGraphNode[];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}

const ConvexHull = (props: IConvexHullProps) => {
    const delta = 20;

    // k needs to be known
    const kArr = Array.from(new Set(props.points.map((o) => o.cluster)));
    const hullPoints: SimilarityGraphNode[][] = [];
    kArr.forEach((k) => {
        hullPoints.push(props.points.filter((p) => p.cluster === k));
    });

    const polygonColor: string[] = [];

    const offsetPolygons: Point[][] = hullPoints.map((hull, idx) => {
        // Compute average color of all points in cluster
        const averageHue = mean(hull.map((p) => hsl(p.fillColor).h)) ?? 0;
        const averageSaturation = mean(hull.map((p) => hsl(p.fillColor).s)) ?? 0;
        const averageLightness = mean(hull.map((p) => hsl(p.fillColor).l)) ?? 0;
        polygonColor.push(hsl(averageHue, averageSaturation, averageLightness).formatHex());

        // If there are less than 3 points in cluster, add dummy points to allow computation of complex hull
        if (hull.length < 3) {
            const p0 = hull[0];

            hull.push({
                ...p0,
                x: p0.x + 0.0001,
                y: p0.y + 0.0001,
            });

            hull.push({
                ...p0,
                x: p0.x - 0.0001,
                y: p0.y - 0.0001,
            });
        }

        const convexHull: Point[] | undefined = polygonHull(hull.map((p) => [p.x, p.y]))?.map(([X, Y]) => ({
            X: props.xScale(X),
            Y: props.yScale(Y),
        }));

        if (convexHull) {
            let convexHullShape = new Shape([convexHull], true);

            convexHullShape = convexHullShape.offset(delta, {
                jointType: 'jtRound',
            });

            if (convexHullShape.paths[0]) {
                return convexHullShape.paths[0];
            }
        }

        return [];
    });

    const curveGenerator = line<Point>()
        .curve(curveBasisClosed)
        .x((d) => d.X)
        .y((d) => d.Y);

    return (
        <g className={'convex-hulls'}>
            {offsetPolygons.map((offsetPolygon, idx) => {
                return (
                    <path
                        key={String(idx)}
                        d={curveGenerator(offsetPolygon) as string}
                        style={{
                            stroke: polygonColor[idx],
                            fill: 'none',
                        }}
                    />
                );
            })}
        </g>
    );
};

export default ConvexHull;
