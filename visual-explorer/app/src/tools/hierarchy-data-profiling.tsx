import CustomHierarchyNode from 'types/CustomHierarchyNode';

export function getInnerLinkage(node: CustomHierarchyNode) {
    const { linkage } = node.data;
    const numChildren = node.children ? node.children.length : 0;

    let numLinks = 0;

    for (let i = 0; i < numChildren; i++) {
        for (let j = 0; j < i; j++) {
            if (linkage[i][j] > 0) {
                numLinks++;
            }
        }
    }

    const numLinksCompleteGraph = (numChildren * (numChildren - 1)) / 2;

    return numLinks / numLinksCompleteGraph;
}
