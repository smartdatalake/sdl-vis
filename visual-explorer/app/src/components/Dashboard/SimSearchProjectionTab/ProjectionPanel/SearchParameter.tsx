import 'bootstrap/dist/css/bootstrap.css';
import Slider from 'rc-slider';
import 'rc-slider/dist/rc-slider.css';
import React, { FormEvent, useContext, useState } from 'react';
import { Badge, Form } from 'react-bootstrap';
import styled from 'styled-components';
import SimilaritySearchContext from '../Context';
import { SearchParameterName, SearchParameterValue } from '../SearchParameters';

const EqualSign = styled.span`
  align-items: center;
  color: gray;
  display: flex;
  font-size: small;
  justify-content: center;
  user-select: none;
`;

const Grid = styled.div`
  display: inline-grid;
  grid-template-columns: 45px 200px 30px auto 50px;
  width: 100%;
`;

const MultiplicationSign = styled.span`
  bottom: 0.1em;
  margin-left: 3px;
  position: relative;
`;

const PaddedBadge = styled(Badge)`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  user-select: none;
  width: 200px;
`;

const SpacedSlider = styled(Slider)`
  margin-top: 10px;
`;

const Switch = styled(Form.Check)`
  margin: auto 0 auto auto;
`;

const Weighting = styled.span`
  align-items: center;
  color: grey;
  display: flex;
  font-size: small;
  font-style: italic;
  user-select: none;
`;

const WideForm = styled(Form)`
  margin-top: 45px;
  width: 100%;
`;

const SearchParameter = ({ parameterName, searchParameter }: { parameterName: SearchParameterName, searchParameter: SearchParameterValue }) => {
    const [isDisabled, setIsDisabled] = useState<boolean>(!searchParameter.active);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const { searchParameters, setAttributeToPreview, setSearchParameters } = useContext(SimilaritySearchContext);

    const generateMarks = () => {
        const marks: { [n: number]: string } = {};
        const minimum = 0;
        const maximum = 1;
        const step = 0.1;

        for (let i = minimum; i < maximum; i += step) {
            marks[i] = String(Number(i.toFixed(1)));
        }

        return marks;
    };

    const onValueChanged = (event: FormEvent) => {
        searchParameter.value = (event.target as HTMLInputElement).value;

        setSearchParameters({
            ...searchParameters!,
            [parameterName]: searchParameter,
        });
    };

    const onWeightChanged = (weight: number) => {
        searchParameter.weights = [weight];

        setSearchParameters({
            ...searchParameters!,
            [parameterName]: searchParameter,
        });
    };

    const startsHovering = () => {
        if (isDisabled) return;

        setIsHovered(true);
        setAttributeToPreview(parameterName);
    };

    const stopsHovering = () => {
        setIsHovered(false);
        setAttributeToPreview(undefined);
    };

    const toggleSearchParameter = () => {
        searchParameter.active = !searchParameter.active;

        setIsDisabled(!searchParameter.active);

        setSearchParameters({
            ...searchParameters!,
            [parameterName]: searchParameter,
        });
    };

    let sliderStyle;

    if (isHovered) sliderStyle = { boxShadow: '0 0 5px 2px LightGray' };
    if (isDisabled) sliderStyle = { backgroundColor: '#ccc' };

    return (
        <WideForm>
            <Form.Group>
                <Grid>
                    <Weighting>{searchParameter.weights[0]}<MultiplicationSign>⨯</MultiplicationSign></Weighting>
                    <PaddedBadge variant="secondary">{parameterName.toUpperCase()}</PaddedBadge>
                    <EqualSign>=</EqualSign>
                    <Form.Control
                        defaultValue={searchParameter.value.toString()}
                        name={parameterName}
                        onChange={onValueChanged}
                        readOnly={isDisabled}
                        type="text"
                    />
                    <Switch id={`switch-${parameterName}`} inline={true} type="switch">
                        <Form.Check.Input
                            checked={searchParameter.active} onChange={toggleSearchParameter} type="checkbox"
                        />
                        <Form.Check.Label />
                    </Switch>
                </Grid>
                <div onMouseEnter={startsHovering} onMouseLeave={stopsHovering}>
                    <SpacedSlider
                        defaultValue={searchParameter.weights[0]}
                        dots={true}
                        disabled={isDisabled}
                        marks={generateMarks()}
                        min={0}
                        max={1}
                        onAfterChange={onWeightChanged}
                        railStyle={sliderStyle}
                        step={0.1}
                        trackStyle={sliderStyle}
                    />
                </div>
            </Form.Group>
        </WideForm>
    );
};

export default SearchParameter;
