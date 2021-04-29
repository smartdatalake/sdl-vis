import CustomHierarchyNode from 'types/CustomHierarchyNode';
import { getRadiusForCircleOfArea } from './geometry';

export function colorHierarchy(rootNode: CustomHierarchyNode, colorScale: (t: number) => string): void {
    colorHierarchyRecursive(rootNode, colorScale, 0, 1);
}

function colorHierarchyRecursive(
    node: CustomHierarchyNode,
    colorScale: (t: number) => string,
    tMin: number,
    tMax: number
): void {
    if (node.children) {
        const numChildren = node.children.length;
        const deltaT = Math.abs(tMax - tMin) / numChildren;

        node.children.forEach((c, idx) => {
            colorHierarchyRecursive(c, colorScale, tMin + deltaT * idx, tMin + deltaT * (idx + 1));
        });
    }

    node.color = colorScale((tMin + tMax) / 2);
}

export function assignRadius(rootNode: CustomHierarchyNode, baseSize = 20): void {
    rootNode.each((n) => {
        n.radius = getRadiusForCircleOfArea(n.value) * baseSize;
    });
}
