import React from 'react';
import D3ForceHierarchyLevel from './context-switch-graph/d3-force-hierarchy-level';
import './graph-svg.scss';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import sizeMe from 'react-sizeme';
import SVGPanZoom from 'App/SVGPanZoom';

interface IGraphVisProps {
    rootNode?: CustomHierarchyNode;
}

class GraphSVG extends React.Component<IGraphVisProps & sizeMe.SizeMeProps> {
    constructor(props: IGraphVisProps & sizeMe.SizeMeProps) {
        super(props);
    }

    public render() {
        const vis = this.props.rootNode && <D3ForceHierarchyLevel rootNode={this.props.rootNode} />;

        return (
            <div className={'graph-vis-wrapper'}>
                <SVGPanZoom className={'content-svg noselect'} width={'100%'} height={'100%'}>
                    {vis}
                </SVGPanZoom>
            </div>
        );
    }
}

export default sizeMe({ monitorHeight: true })(GraphSVG);
