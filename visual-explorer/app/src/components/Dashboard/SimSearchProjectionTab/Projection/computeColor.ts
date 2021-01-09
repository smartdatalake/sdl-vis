// hsl color of node depending on angle (h) and distance (s) to center of projection
import { Node } from 'components/Dashboard/SimSearchProjectionTab/Projection/ProjectionSVG';
import { ScaleLinear } from 'd3';

export const computeColor = (
    node: Node,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleLinear<number, number>
) => {
    const xNorm =
        (node.x - xScale.domain()[0]) /
        (xScale.domain()[1] - xScale.domain()[0]);
    const yNorm =
        (node.y - yScale.domain()[0]) /
        (yScale.domain()[1] - yScale.domain()[0]);

    const h = Math.atan2(xNorm - 0.5, yNorm - 0.5) * (180 / Math.PI) + 180;
    const s =
        100 *
        (Math.sqrt(Math.pow(xNorm - 0.5, 2) + Math.pow(yNorm - 0.5, 2)) /
            Math.sqrt(0.5));

    return 'hsl(' + h + ',' + s + '%,40%)';
};
