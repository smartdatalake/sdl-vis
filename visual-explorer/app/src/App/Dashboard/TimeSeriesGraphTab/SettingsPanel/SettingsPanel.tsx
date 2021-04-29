import React from 'react';
import styled from 'styled-components';
import { Button, Card, Form } from 'react-bootstrap';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import produce from 'immer';
import {
    DEFAULT_TIME_SERIES_GRAPH_SETTINGS,
    TimeSeriesGraphSettings,
} from 'types/TimeSeriesGraph/TimeSeriesGraphSettings';
import _ from 'lodash';
import { TimeSeriesCatalog } from 'types/TimeSeriesGraph/TimeSeriesCatalog';

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
    padding: 20px 10px 10px;

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
    onSettingsApply: (settings: TimeSeriesGraphSettings) => void;
}

const SettingsPanel = ({ onSettingsApply }: Props) => {
    const [filterText, setFilterText] = React.useState<string>('');
    const [matchingTimeseries, setMatchingTimeseries] = React.useState<TimeSeriesCatalog>({});
    const [algorithmSettings, setAlgorithmSettings] = React.useState<TimeSeriesGraphSettings>(
        DEFAULT_TIME_SERIES_GRAPH_SETTINGS
    );

    React.useEffect(() => {
        // See: https://stackoverflow.com/a/60907638
        let isMounted = true;

        BackendQueryEngine.timeseriesCatalogSearch(filterText).then((tsCatalog) => {
            if (isMounted) {
                setMatchingTimeseries(tsCatalog);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [filterText]);

    const changeActivateTimeseries = (ts: string, action: 'ACTIVATE' | 'DEACTIVATE') => {
        setAlgorithmSettings((prevState) =>
            produce(prevState, (draftState) => {
                const activeTimeseriesSet = new Set(draftState.timeseries);

                switch (action) {
                    case 'DEACTIVATE':
                        activeTimeseriesSet.delete(ts);
                        break;
                    default:
                        activeTimeseriesSet.add(ts);
                }

                draftState.timeseries = [...activeTimeseriesSet];
            })
        );
    };

    const onIntegerChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAlgorithmSettings((prevState) =>
            produce(prevState, (draftState) => {
                const v: string = e.target.value;
                draftState[e.target.id] = _.toInteger(v.replace(/[^\d]/g, ''));
            })
        );
    };

    const onStringChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAlgorithmSettings((prevState) =>
            produce(prevState, (draftState) => {
                draftState[e.target.id] = e.target.value;
            })
        );
    };

    const onApplyHandler = () => {
        onSettingsApply(algorithmSettings);
    };

    return (
        <ScrollContainer>
            <PanelContainer className={'no-select'}>
                <Form>
                    <SettingsCard>
                        <SettingsCardHeader>Time-Series Selection</SettingsCardHeader>
                        <SettingsCardBody>
                            <Form.Group>
                                <Form.Control
                                    custom
                                    type="text"
                                    placeholder="Search for Time-Series"
                                    onChange={(e) => setFilterText(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                                <Form.Text className="text-muted">
                                    Search the time-series catalog by matching its starting sequence
                                </Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Available Time-Series</Form.Label>
                                <Form.Control
                                    custom
                                    multiple
                                    size={'sm'}
                                    id="graphSettings.graphName"
                                    as="select"
                                    style={{ height: '10em' }}
                                    onChange={(e) => changeActivateTimeseries(e.target.value, 'ACTIVATE')}
                                >
                                    {Object.entries(matchingTimeseries)
                                        .filter(([tsName, tsInfo]) => !algorithmSettings.timeseries.includes(tsName))
                                        .map(([tsName, tsInfo]) => (
                                            <option key={tsName} value={tsName}>
                                                {`${tsName} (${tsInfo.startDate.toDateString()} - ${tsInfo.endDate.toDateString()})`}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Active Time-Series</Form.Label>
                                <Form.Control
                                    custom
                                    multiple
                                    size={'sm'}
                                    id="graphSettings.graphName"
                                    as="select"
                                    style={{ height: '10em' }}
                                    onChange={(e) => changeActivateTimeseries(e.target.value, 'DEACTIVATE')}
                                >
                                    {algorithmSettings.timeseries.map((tsName) => (
                                        <option key={tsName} value={tsName}>
                                            {tsName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </SettingsCardBody>
                    </SettingsCard>
                    <SettingsCard>
                        <SettingsCardHeader>Correlation-Algorithm</SettingsCardHeader>
                        <SettingsCardBody>
                            {['start', 'windowSize', 'stepSize', 'steps'].map((attr) => (
                                <Form.Group key={attr}>
                                    <Form.Label>{attr}</Form.Label>
                                    <Form.Control
                                        id={attr}
                                        onChange={onIntegerChangeHandler}
                                        value={algorithmSettings[attr] + ''}
                                    />
                                </Form.Group>
                            ))}
                            <Form.Group>
                                <Form.Label>Algorithm</Form.Label>
                                <Form.Control
                                    id="correlationMethod"
                                    as="select"
                                    onChange={onStringChangeHandler}
                                    defaultValue={algorithmSettings['correlationMethod']}
                                >
                                    <option value="pearson">Pearson</option>
                                    <option value="kendall">Kendall</option>
                                    <option value="spearman">Spearman</option>
                                </Form.Control>
                            </Form.Group>
                        </SettingsCardBody>
                    </SettingsCard>
                    <Button variant="primary" onClick={onApplyHandler}>
                        Apply
                    </Button>
                </Form>
            </PanelContainer>
        </ScrollContainer>
    );
};

export default SettingsPanel;
