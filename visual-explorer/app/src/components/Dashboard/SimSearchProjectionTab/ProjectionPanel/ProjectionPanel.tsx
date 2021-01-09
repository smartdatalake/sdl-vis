import 'bootstrap/scss/bootstrap.scss';
import Slider from 'rc-slider';
import React, { FormEvent, useContext, useState } from 'react';
import {
    Card,
    Dropdown,
    Form,
    Spinner,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap';
import styled from 'styled-components';
import SimilaritySearchContext from '../Context';
import {
    ProjectionAlgorithm,
    ProjectionParameters,
} from '../ProjectionParameters';
import { defaultProjectionParameters } from '../Provider';
import { SearchParameterName } from '../SearchParameters';
import SearchParameter from './SearchParameter';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const FloatingCard = styled(Card)`
    left: 15px;
    position: absolute;
    top: 15px;
    user-select: none;
    z-index: 2;
`;

const IndentedParagraph = styled.div`
    margin: 0 0 15px 15px;
`;

const IndentedParagraphWithoutTopMargin = styled(IndentedParagraph)`
    form:first-of-type {
        margin-top: 0;
    }
`;

const LoadingIndicator = styled.div`
    align-items: center;
    background-color: rgba(0, 0, 0, 0.12);
    cursor: not-allowed;
    display: flex;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
    z-index: 3;
`;

const SalientValue = styled.span`
    font-weight: bold;
    margin-left: 5px;
`;

const Subtitle = styled(Card.Subtitle)`
    margin-top: 10px;
`;

const TopMargin = styled.div`
    margin-top: 5px;
`;

const Grid = styled.div`
    display: inline-grid;
    grid-template-columns: auto auto;
    width: 100%;
`;

const KEquals = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const DropDownMenu = styled(Dropdown.Menu)`
    width: 100%;
`;

const DropDownButton = styled(Dropdown)`
    margin-top: 3em;
`;

const CardHead = styled(Card.Header)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
`;

const ArrowUp = styled(FaAngleUp)`
    margin: auto 0 auto auto;
    font-size: xx-large;
    cursor: pointer;
    pointer-events: auto;
`;

const ArrowDown = styled(FaAngleDown)`
    margin: auto 0 auto auto;
    font-size: xx-large;
    cursor: pointer;
    pointer-events: auto;
`;

const ProjectionPanel = () => {
    const [algorithm, setAlgorithm] = useState<ProjectionAlgorithm>(
        ProjectionAlgorithm.PCA
    );
    const {
        isLoading,
        projectionParameters,
        searchParameters,
        setProjectionParameters,
        setSearchParameters,
    } = useContext(SimilaritySearchContext);
    const [k, setK] = useState<number>(15);
    const [isMinimized, setIsMinimized] = useState<boolean>();

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const onAlgorithmChanged = (selectedAlgorithm: string) => {
        setAlgorithm(selectedAlgorithm as ProjectionAlgorithm);

        setProjectionParameters({
            ...projectionParameters,
            algorithm: selectedAlgorithm as ProjectionAlgorithm,
            k,
        });
    };

    const onKChanged = (event: FormEvent) => {
        const localK = parseInt((event.target as HTMLInputElement).value, 0);

        if (Number.isInteger(localK) && localK > 0) {
            setK(localK);

            setProjectionParameters({
                ...projectionParameters,
                algorithm,
                k: localK,
            });
        }
    };

    const activateAttribute = (searchParameter: any) => {
        searchParameter.active = true;

        setSearchParameters({
            ...searchParameters!,
        });
        setProjectionParameters({
            ...projectionParameters,
            algorithm,
            k,
        });
    };

    return (
        <FloatingCard>
            {isLoading ? (
                <LoadingIndicator>
                    <Spinner animation="grow" />
                </LoadingIndicator>
            ) : null}
            <CardHead>
                Projection
                {isMinimized ? (
                    <ArrowDown onClick={toggleMinimize} />
                ) : (
                    <ArrowUp onClick={toggleMinimize} />
                )}
            </CardHead>
            {!isMinimized && (
                <Card.Body>
                    <Grid>
                        <div>
                            <Card.Title>Algorithm</Card.Title>
                            <IndentedParagraph>
                                <ToggleButtonGroup
                                    defaultValue={ProjectionAlgorithm.PCA}
                                    name="projectionAlgorithm"
                                    onChange={onAlgorithmChanged}
                                    type="radio"
                                >
                                    {Object.entries(ProjectionAlgorithm).map(
                                        (
                                            [displayName, value]: [
                                                string,
                                                string
                                            ],
                                            index
                                        ) => {
                                            return (
                                                <ToggleButton
                                                    key={index}
                                                    value={value}
                                                >
                                                    {displayName}
                                                </ToggleButton>
                                            );
                                        }
                                    )}
                                </ToggleButtonGroup>
                            </IndentedParagraph>
                            {algorithm === ProjectionAlgorithm.MDS ? (
                                <MDSProjectionPanel />
                            ) : null}
                        </div>
                        <div>
                            <Card.Title># of results</Card.Title>
                            <IndentedParagraph>
                                <Grid>
                                    <KEquals>k =</KEquals>
                                    <Form.Control
                                        defaultValue={'15'}
                                        name={'k'}
                                        onBlur={onKChanged}
                                        type="text"
                                    />
                                </Grid>
                            </IndentedParagraph>
                        </div>
                    </Grid>
                    <Card.Title>Attributes</Card.Title>
                    <IndentedParagraphWithoutTopMargin>
                        {Object.entries(searchParameters!)
                            .filter(([name, value]) => value.active)
                            .map(([name, value], index) => {
                                return (
                                    <SearchParameter
                                        key={name}
                                        parameterName={
                                            name as SearchParameterName
                                        }
                                        searchParameter={value}
                                    />
                                );
                            })}
                        <DropDownButton>
                            <Dropdown.Toggle
                                id="dropdown-basic-button"
                                block={true}
                            >
                                Add Attribute
                            </Dropdown.Toggle>
                            <DropDownMenu>
                                {Object.entries(searchParameters!)
                                    .filter(([name, value]) => !value.active)
                                    .map(([name, value], index) => {
                                        const onClickHandler = () =>
                                            activateAttribute(value);

                                        return (
                                            <Dropdown.Item
                                                key={name}
                                                onClick={onClickHandler}
                                            >
                                                {name}
                                            </Dropdown.Item>
                                        );
                                    })}
                            </DropDownMenu>
                        </DropDownButton>
                    </IndentedParagraphWithoutTopMargin>
                </Card.Body>
            )}
        </FloatingCard>
    );
};

const MDSProjectionPanel = () => {
    const { projectionParameters, setProjectionParameters } = useContext(
        SimilaritySearchContext
    );

    const [epsilon, setEpsilon] = useState<number>(
        projectionParameters!.epsilon as number
    );
    const [maximumIterations, setMaximumIterations] = useState<number>(
        projectionParameters!.maximumIterations as number
    );

    const onEpsilonChanged = (currentEpsilon: number) =>
        setEpsilon(currentEpsilon);

    const onEpsilonSet = (currentEpsilon: number) => {
        setEpsilon(currentEpsilon);
        setProjectionParameters(({
            ...projectionParameters,
            epsilon: currentEpsilon,
        } as unknown) as ProjectionParameters);
    };

    const onMaximumIterationsChanged = (currentMaximumIterations: number) =>
        setMaximumIterations(currentMaximumIterations);

    const onMaximumIterationsSet = (currentMaximumIterations: number) => {
        setMaximumIterations(currentMaximumIterations);
        setProjectionParameters(({
            ...projectionParameters,
            maximumIterations: currentMaximumIterations,
        } as unknown) as ProjectionParameters);
    };

    return (
        <>
            <Subtitle className="mb-2 text-muted">Hyperparameters</Subtitle>
            <IndentedParagraph>
                <div>
                    <span>Epsilon:</span>
                    <SalientValue>{epsilon}</SalientValue>
                </div>
                <Slider
                    defaultValue={epsilon}
                    min={0}
                    max={1}
                    onAfterChange={onEpsilonSet}
                    onChange={onEpsilonChanged}
                    step={defaultProjectionParameters.epsilon}
                />
                <TopMargin>
                    <span>Maximum Number of Iterations:</span>
                    <SalientValue>{maximumIterations}</SalientValue>
                </TopMargin>
                <Slider
                    defaultValue={maximumIterations}
                    min={0}
                    max={1000}
                    onAfterChange={onMaximumIterationsSet}
                    onChange={onMaximumIterationsChanged}
                    step={1}
                />
            </IndentedParagraph>
        </>
    );
};

export default ProjectionPanel;
