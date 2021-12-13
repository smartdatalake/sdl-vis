import React from 'react';
import { Button, FormControl, Input, InputLabel, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

interface ConstraintFormProps {
    var1: string[];
    var2: string[];
    attr1: string[];
    attr2: string[];
    operator: string[];
    handleSubmitCons: any;
}

interface ConstraintFormState {
    constraints: {
        var1: string;
        var2: string;
        attr1: string;
        attr2: string;
        distance: string;
        operator: string;
        threshold: number;
    }[];
}

const StyledSelect = withStyles({
    root: {
        borderRadius: 3,
        border: 0,
        height: 30,
        width: 180,
        align: 'center',
    },
})(Select);

const StyledInput = withStyles({
    root: {
        border: 0,
        height: 43,
        width: 180,
        align: 'center',
    },
})(Input);

/**
 * App
 *
 * Simple react js fetch example
 */
class ConstraintForm extends React.Component<ConstraintFormProps, ConstraintFormState> {
    /**
     * constructor
     *
     * @object  @props  parent props
     * @object  @state  component state
     */
    constructor(props: ConstraintFormProps) {
        super(props);

        this.state = {
            constraints: [{ var1: '', var2: '', attr1: '', attr2: '', distance: '', threshold: 0, operator: '' }],
        };
    }

    handleSubmit = (event: any) => {
        event.preventDefault();
        this.props.handleSubmitCons(this.state.constraints);
        alert('Constraints submitted');
    };

    handleChange = (e: any, id: number) => {
        const target = e.target;
        const value = target.value;
        console.log(value);
    };

    updateFieldChanged = (name: string, index: number) => (event: any) => {
        const newArr = this.state.constraints.map((item, i) => {
            if (index == i) {
                return { ...item, [name]: event.target.value };
            } else {
                return item;
            }
        });
        this.setState({
            constraints: newArr,
        });
    };

    addNewConstraints = (e: any) => {
        const values = [...this.state.constraints];
        this.setState({
            constraints: this.state.constraints.concat(values),
        }),
            function () {
                return;
            };
        console.log(this.state.constraints);
    };

    render() {
        return (
            <form>
                {this.state.constraints.map((val, idx) => {
                    return (
                        <div key={idx}>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Constraint ${idx + 1}`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].distance}
                                    onChange={this.updateFieldChanged('distance', idx)}
                                >
                                    <MenuItem value={'edit'}>{'Edit Distance'}</MenuItem>
                                    <MenuItem value={'jaccard'}>{'Jaccard'}</MenuItem>
                                    <MenuItem value={'diff'}>{'Difference'}</MenuItem>
                                    <MenuItem value={'euclidean'}>{'Euclidean Distance'}</MenuItem>
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Variable 1`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].attr1}
                                    onChange={this.updateFieldChanged('var1', idx)}
                                >
                                    {this.props.var1.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Attribute 1`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].attr1}
                                    onChange={this.updateFieldChanged('attr1', idx)}
                                >
                                    {this.props.attr1.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Variable 2`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].var2}
                                    onChange={this.updateFieldChanged('var2', idx)}
                                >
                                    {this.props.var2.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Attribute 2`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].attr2}
                                    onChange={this.updateFieldChanged('attr2', idx)}
                                >
                                    {this.props.attr2.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel id="demo-simple-select-label">{`Operator`}</InputLabel>
                                <StyledSelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.constraints[idx].operator}
                                    onChange={this.updateFieldChanged('operator', idx)}
                                >
                                    {this.props.operator.map((g) => (
                                        <MenuItem value={g} key={g}>
                                            {g}
                                        </MenuItem>
                                    ))}
                                </StyledSelect>
                            </FormControl>
                            <FormControl>
                                <InputLabel shrink>{`Threshold`}</InputLabel>
                                <StyledInput
                                    type="text"
                                    data-id={idx}
                                    value={this.state.constraints[idx].threshold}
                                    className="threshold"
                                    onChange={this.updateFieldChanged('threshold', idx)}
                                />
                            </FormControl>
                        </div>
                    );
                })}
                <Button className="btn btn-primary" onClick={this.addNewConstraints}>
                    Add New Constraint
                </Button>
                <Button className="btn btn-primary" type="submit" onClick={this.handleSubmit}>
                    Submit Constraints
                </Button>
            </form>
        );
    }
}

export default ConstraintForm;
