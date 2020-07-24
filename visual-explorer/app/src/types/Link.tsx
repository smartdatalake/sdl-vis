import CustomHierarchyNode from './CustomHierarchyNode';

export default interface Link {
    source: CustomHierarchyNode;
    target: CustomHierarchyNode;
    strength: number;
}
