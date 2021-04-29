import React from 'react';
import { GraphSettings } from 'types/GCoreHierachicalGraph/GraphSettings';
import HierachicalGraphVisContent from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVisContent';
import BackendQueryEngine from 'backend/BackendQueryEngine';

interface Props {
    graphSettings: GraphSettings;
}

const HierachicalGraphVis: React.FunctionComponent<Props> = ({ graphSettings }: Props) => {
    // const [graphData, setGraphData] = React.useState();

    React.useEffect(() => {
        BackendQueryEngine.gcoreGraphvisInit(graphSettings).then((graph) => {
            console.log(graph);
        });
    }, [graphSettings]);

    return (
        <>
            <HierachicalGraphVisContent data={[]} />
        </>
    );
};

export default HierachicalGraphVis;
