import 'bootstrap/scss/bootstrap.scss';
import Slider from 'rc-slider';
import React, { useContext, useState } from 'react';
import { Card, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import styled from 'styled-components';
import SimilaritySearchContext from '../Context';
import { ProjectionAlgorithm, ProjectionParameters } from '../ProjectionParameters';
import { defaultProjectionParameters } from '../Provider';
import { SearchParameterName } from '../SearchParameters';
import SearchParameter from './SearchParameter';

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

const ProjectionPanel = () => {
    const [algorithm, setAlgorithm] = useState<ProjectionAlgorithm>(ProjectionAlgorithm.PCA);
    const { isLoading, projectionParameters, searchParameters, setProjectionParameters } = useContext(SimilaritySearchContext);

    const onAlgorithmChanged = (selectedAlgorithm: string) => {
        setAlgorithm(selectedAlgorithm as ProjectionAlgorithm);

        setProjectionParameters({
            ...projectionParameters,
            algorithm: selectedAlgorithm as ProjectionAlgorithm,
        });
    };

    return (
        <FloatingCard>
            {isLoading ? <LoadingIndicator><Spinner animation="grow" /></LoadingIndicator> : null}
            <Card.Header>Projection</Card.Header>
            <Card.Body>
                <Card.Title>Algorithm</Card.Title>
                <IndentedParagraph>
                    <ToggleButtonGroup
                        defaultValue={ProjectionAlgorithm.PCA} name="projectionAlgorithm" onChange={onAlgorithmChanged}
                        type="radio"
                    >
                        {Object.entries(ProjectionAlgorithm).map(([displayName, value]: [string, string], index) => {
                            return (
                                <ToggleButton key={index} value={value}>{displayName}</ToggleButton>
                            );
                        })}
                    </ToggleButtonGroup>
                </IndentedParagraph>
                {algorithm === ProjectionAlgorithm.MDS ? <MDSProjectionPanel /> : null}
                <Card.Title>Attributes</Card.Title>
                <IndentedParagraphWithoutTopMargin>
                    {Object.entries(searchParameters!).map(([name, value], index) => {
                        return (
                            <SearchParameter
                                key={index} parameterName={name as SearchParameterName} searchParameter={value}
                            />
                        );
                    })}
                </IndentedParagraphWithoutTopMargin>
            </Card.Body>
        </FloatingCard>
    );
};

const MDSProjectionPanel = () => {
    const { projectionParameters, setProjectionParameters } = useContext(SimilaritySearchContext);

    const [epsilon, setEpsilon] = useState<number>(projectionParameters!.epsilon as number);
    const [maximumIterations, setMaximumIterations] = useState<number>(projectionParameters!.maximumIterations as number);

    const onEpsilonChanged = (currentEpsilon: number) => setEpsilon(currentEpsilon);

    const onEpsilonSet = (currentEpsilon: number) => {
        setEpsilon(currentEpsilon);
        setProjectionParameters({
            ...projectionParameters,
            epsilon: currentEpsilon,
        } as unknown as ProjectionParameters);
    };

    const onMaximumIterationsChanged = (currentMaximumIterations: number) => setMaximumIterations(currentMaximumIterations);

    const onMaximumIterationsSet = (currentMaximumIterations: number) => {
        setMaximumIterations(currentMaximumIterations);
        setProjectionParameters({
            ...projectionParameters,
            maximumIterations: currentMaximumIterations,
        } as unknown as ProjectionParameters);
    };

    return (
        <>
            <Subtitle className="mb-2 text-muted">Hyperparameters</Subtitle>
            <IndentedParagraph>
                <div><span>Epsilon:</span><SalientValue>{epsilon}</SalientValue></div>
                <Slider
                    defaultValue={epsilon}
                    min={0}
                    max={1}
                    onAfterChange={onEpsilonSet}
                    onChange={onEpsilonChanged}
                    step={defaultProjectionParameters.epsilon}
                />
                <TopMargin>
                    <span>Maximum Number of Iterations:</span><SalientValue>{maximumIterations}</SalientValue>
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
