import React from 'react';
import styled from 'styled-components';
import { Button, Card, Form } from 'react-bootstrap';
import { constructDefaultGraphSettings, GraphSettings, value } from 'types/GCoreHierachicalGraph/GraphSettings';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import { GCoreGraphCatalog } from 'types/GCoreHierachicalGraph/GCoreGraphCatalog';
import produce from 'immer';
import _ from 'lodash';
import LoadingMessage from 'App/Dashboard/HierarchicalGraphTab/SettingsPanel/LoadingMessage';

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

    return <LoadingMessage />;
};

type ContentProps = Props & {
    graphCatalog: GCoreGraphCatalog;
};

const SettingsPanelContent = ({ graphCatalog, applySettings }: ContentProps) => {
    const [settings, setSettings] = React.useState<GraphSettings>(
        constructDefaultGraphSettings(graphCatalog.hasOwnProperty('Iris') ? 'Iris' : Object.keys(graphCatalog)[0])
    );

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
        applySettings(_.cloneDeep(settings));
    };

    const currentAlgorithm = value(settings, 'algorithmSettings.algorithm');

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
                                                const value = `${node.label}\$${nodeAttr}`;

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
                                    <option value="kmeansf">k-Means</option>
                                    <option value="kmeans">k-Means (Top-Down)</option>
                                    <option value="single">Single (Top-Down)</option>
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
                            {Object.entries(
                                value(settings, `algorithmSettings.algorithmParams.${currentAlgorithm}`)
                            ).map(([paramName, paramValue]) => (
                                <Form.Group key={`${currentAlgorithm}/${paramName}`}>
                                    <Form.Label>{paramName}</Form.Label>
                                    <Form.Control
                                        id={`algorithmSettings.algorithmParams.${currentAlgorithm}.${paramName}`}
                                        onChange={onChangeHandler}
                                        defaultValue={paramValue as string | number}
                                    />
                                </Form.Group>
                            ))}
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
