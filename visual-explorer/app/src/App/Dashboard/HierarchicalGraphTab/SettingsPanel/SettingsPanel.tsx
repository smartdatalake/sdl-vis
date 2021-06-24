import React from 'react';
import styled from 'styled-components';
import { Button, Card, Form } from 'react-bootstrap';
import { DEFAULT_GRAPH_SETTINGS, GraphSettings, value } from 'types/GCoreHierachicalGraph/GraphSettings';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import { GCoreGraphCatalog } from 'types/GCoreHierachicalGraph/GCoreGraphCatalog';
import produce from 'immer';

const ScrollContainer = styled.div`
    flex: 0 0 500px;

    display: block;
    position: relative;
    overflow-y: auto;

    box-shadow: 0 0 10px var(--dark);
    z-index: 1000;

    background: var(--light);
`;

const PanelContainer = styled.div`
    padding: 30px 20px 20px;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`;

const SettingsCard = styled(Card)`
    margin-bottom: 20px !important;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SettingsCardHeader = styled(Card.Header)`
    justify-content: center;
`;

const SettingsCardBody = styled(Card.Body)``;

interface Props {
    applySettings: (graphSettings: GraphSettings) => void;
}

const SettingsPanel = (props: Props) => {
    const [graphCatalog, setGraphCatalog] = React.useState<GCoreGraphCatalog>();

    React.useEffect(() => {
        BackendQueryEngine.gcoreGraphs().then((graphCatalog) => {
            setGraphCatalog(graphCatalog);
        });
    }, []);

    if (graphCatalog) {
        return <SettingsPanelContent graphCatalog={graphCatalog} {...props} />;
    }

    return <h4>No connection to backend.</h4>;
};

type ContentProps = Props & {
    graphCatalog: GCoreGraphCatalog;
};

const SettingsPanelContent = ({ graphCatalog, applySettings }: ContentProps) => {
    const [settings, setSettings] = React.useState<GraphSettings>(DEFAULT_GRAPH_SETTINGS);

    const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings((prevState) =>
            produce(prevState, (draftState) => {
                let v: string | string[] = e.target.value;

                // If the target is of type "select" and has the attribute "multiple" set, take the list of selected options
                if (e.target.tagName.toLowerCase() === 'select' && e.target.getAttribute('multiple') !== null) {
                    v = [...e.target.options].filter((o) => o.selected).map((o) => o.value);
                }

                if (typeof value(draftState, e.target.id) === 'number' && typeof v === 'string') {
                    value(draftState, e.target.id, parseInt(v));
                } else {
                    value(draftState, e.target.id, v);
                }
            })
        );
    };

    const onClickHandler = () => {
        applySettings(settings);
    };

    return (
        <ScrollContainer>
            <PanelContainer className={'no-select'}>
                <Form>
                    <SettingsCard>
                        <SettingsCardHeader>Graph Settings</SettingsCardHeader>
                        <SettingsCardBody>
                            <Form.Group>
                                <Form.Label>Graph</Form.Label>
                                <Form.Control
                                    id="graphSettings.graphName"
                                    as="select"
                                    onChange={onChangeHandler}
                                    defaultValue={value(settings, 'graphSettings.graphName')}
                                >
                                    {Object.keys(graphCatalog).map((graphName) => (
                                        <option key={graphName} value={graphName}>
                                            {graphName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Attributes</Form.Label>
                                <Form.Control
                                    multiple
                                    id="graphSettings.graphAttributes"
                                    as="select"
                                    onChange={onChangeHandler}
                                >
                                    {graphCatalog[settings.graphSettings.graphName].nodes.map((node) =>
                                        node.property
                                            .filter((a) => a !== 'id')
                                            .map((nodeAttr) => {
                                                const value = nodeAttr;

                                                return (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                );
                                            })
                                    )}
                                </Form.Control>
                            </Form.Group>
                        </SettingsCardBody>
                    </SettingsCard>
                    <SettingsCard>
                        <SettingsCardHeader>Algorithm</SettingsCardHeader>
                        <SettingsCardBody>
                            <Form.Group>
                                <Form.Label>Algorithm</Form.Label>
                                <Form.Control
                                    id="algorithmSettings.algorithm"
                                    as="select"
                                    onChange={onChangeHandler}
                                    defaultValue={value(settings, 'algorithmSettings.algorithm')}
                                >
                                    <option value="kmeans">k-Means</option>
                                    <option value="single">Single</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Feature Extractor</Form.Label>
                                <Form.Control
                                    id="algorithmSettings.featureExtractor"
                                    as="select"
                                    onChange={onChangeHandler}
                                    defaultValue={value(settings, 'algorithmSettings.featureExtractor')}
                                >
                                    <option value="null">-- None --</option>
                                    <option value="word2vec">Word2vec</option>
                                    <option value="tfidf">TFIDF</option>
                                </Form.Control>
                            </Form.Group>
                        </SettingsCardBody>
                    </SettingsCard>
                    <SettingsCard>
                        <SettingsCardHeader>Algorithm Parameters</SettingsCardHeader>
                        <SettingsCardBody>
                            {value(settings, 'algorithmSettings.algorithm') === 'kmeans' && (
                                <>
                                    <Form.Group>
                                        <Form.Label>k</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsKMeans.k'}
                                            onChange={onChangeHandler}
                                            defaultValue={value(settings, 'algorithmSettings.algorithmParamsKMeans.k')}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label># of Representatives</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsKMeans.reps'}
                                            onChange={onChangeHandler}
                                            defaultValue={value(
                                                settings,
                                                'algorithmSettings.algorithmParamsKMeans.reps'
                                            )}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Algorithm for Representatives</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsKMeans.reps'}
                                            as="select"
                                            onChange={onChangeHandler}
                                            defaultValue={value(
                                                settings,
                                                'algorithmSettings.algorithmParamsKMeans.reps'
                                            )}
                                        >
                                            <option value="topk">Top-k</option>
                                            <option value="revtopk">Reverse Top-k</option>
                                        </Form.Control>
                                    </Form.Group>
                                </>
                            )}
                            {value(settings, 'algorithmSettings.algorithm') === 'single' && (
                                <>
                                    <Form.Group>
                                        <Form.Label>k</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsSingle.k'}
                                            onChange={onChangeHandler}
                                            defaultValue={value(settings, 'algorithmSettings.algorithmParamsSingle.k')}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label># of Representatives</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsSingle.k'}
                                            onChange={onChangeHandler}
                                            defaultValue={value(
                                                settings,
                                                'algorithmSettings.algorithmParamsSingle.reps'
                                            )}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label># of Partitions</Form.Label>
                                        <Form.Control
                                            id={'algorithmSettings.algorithmParamsSingle.splits'}
                                            onChange={onChangeHandler}
                                            defaultValue={value(
                                                settings,
                                                'algorithmSettings.algorithmParamsSingle.splits'
                                            )}
                                        />
                                    </Form.Group>
                                </>
                            )}
                        </SettingsCardBody>
                    </SettingsCard>
                    <Button variant="primary" onClick={onClickHandler}>
                        Initialize Graph
                    </Button>
                </Form>
            </PanelContainer>
        </ScrollContainer>
    );
};

export default SettingsPanel;
