import React, { useCallback, useEffect, useRef, useState } from 'react';
import ClusterHull from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/Cluster/ClusterHull';
import DataPoint from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/Cluster/DataPoint';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import produce from 'immer';
import _ from 'lodash';
import { HierarchicalGraphNode } from 'types/HierarchicalGraphLevel';
import { relativeLocalPoint, sortByEuclideanDistance } from 'tools/helpers';
import { ToLocalFunction } from 'types/ToLocalFunction';

type ExpandFunction = (
    transactionId: string,
    level: number,
    clusterId: number | string,
    numPoints: number,
    idOfClosestNeighbor: number
) => void;

const useClusterExpand = (): [Array<HierarchicalGraphNode>, ExpandFunction] => {
    const [innerDataPoints, setInnerClusters] = useState<Array<HierarchicalGraphNode>>([]);

    const expand = useCallback((transactionId, level, clusterId, numNeighbors, idOfClosestNeighbor) => {
        BackendQueryEngine.gcoreGraphvisCluster(
            transactionId,
            level,
            clusterId,
            numNeighbors,
            idOfClosestNeighbor
        ).then((graphDataResponse) => {
            setInnerClusters(graphDataResponse.nodes.sort((a, b) => (a.cluster + '').localeCompare(b.cluster + '')));
        });
    }, []);

    return [innerDataPoints, expand];
};

interface Props {
    transactionId: string;
    clusterId: number | string;
    level: number;
    toLocal: ToLocalFunction;
    dataPoints: HierarchicalGraphNode[];
    colorScale: (t: number) => string;
    onBoundariesUpdate?: (points: HierarchicalGraphNode[]) => void;
}

const Cluster: React.FunctionComponent<Props> = ({
    transactionId,
    level,
    clusterId,
    dataPoints,
    toLocal,
    colorScale,
    onBoundariesUpdate,
}: Props) => {
    const [childrenPoints, expand] = useClusterExpand();
    const [descendantPoints, setDescendantPoints] = useState<Record<number | string, HierarchicalGraphNode[]>>({});

    const gRef = useRef<SVGGElement>(null);

    const allPoints = [...dataPoints, ...childrenPoints, ..._.flatten(Object.values(descendantPoints))];

    useEffect(() => {
        if (childrenPoints && onBoundariesUpdate) {
            onBoundariesUpdate([...childrenPoints, ..._.flatten(Object.values(descendantPoints))]);
        }
    }, [childrenPoints, descendantPoints]);

    let innerClusterElements: JSX.Element[] | null = null;
    if (childrenPoints) {
        const distinctClusterLabels = [...new Set(childrenPoints.map((d) => d.cluster))].sort();

        innerClusterElements = distinctClusterLabels.map((l, idx) => {
            const onBoundariesUpdateHandler = (points: HierarchicalGraphNode[]) => {
                setDescendantPoints((prevState) =>
                    produce(prevState, (draftState) => {
                        draftState[l] = points;
                    })
                );
            };

            const clusterDataPoints = childrenPoints.filter((p) => p.cluster == l);

            return (
                <Cluster
                    key={`cluster_l${level}_c${l}`}
                    transactionId={transactionId}
                    clusterId={l}
                    level={level + 1}
                    toLocal={toLocal}
                    dataPoints={clusterDataPoints}
                    onBoundariesUpdate={onBoundariesUpdateHandler}
                    colorScale={(t: number) =>
                        colorScale(t / distinctClusterLabels.length + idx / distinctClusterLabels.length)
                    }
                />
            );
        });
    }

    const onClusterClickHandler = useCallback(
        (e: React.MouseEvent<SVGGElement>) => {
            if (gRef.current) {
                const clickPos = relativeLocalPoint(gRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                });

                if (clickPos) {
                    const dataDomainClickPos = toLocal.invert(clickPos);
                    const neighborsSortedByDistance = sortByEuclideanDistance(dataDomainClickPos, dataPoints);
                    const nearestNeighbor = neighborsSortedByDistance[0];

                    expand(transactionId, level + 1, clusterId, 0, nearestNeighbor.id);
                }
            }
        },
        [gRef.current, dataPoints, toLocal]
    );

    return (
        <>
            <g ref={gRef} onDoubleClick={onClusterClickHandler}>
                <ClusterHull
                    delta={40 - level * 5}
                    strokeWidth={Math.max(2 - level, 1)}
                    dataPoints={allPoints.map(toLocal)}
                    color={colorScale(0.5)}
                />

                {innerClusterElements}

                {dataPoints.map((p, idx) => {
                    const pLocal = toLocal(p);

                    return (
                        <React.Fragment key={idx}>
                            <DataPoint key={idx} x={pLocal.x} y={pLocal.y} color={colorScale(0.5)} dataPoint={p} />
                        </React.Fragment>
                    );
                })}
            </g>
        </>
    );
};

export default Cluster;
