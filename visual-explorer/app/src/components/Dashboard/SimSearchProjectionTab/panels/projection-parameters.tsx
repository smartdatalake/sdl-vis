import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import { connect } from 'react-redux';
import {
    Card,
    Container,
    Row,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap';
import './panels.scss';
import { IApplicationState } from 'redux-types';
import { Store } from 'redux';
import {
    IProjParametersState,
    setType,
    modifyQueryAttribute,
} from 'redux-types/proj-parameters';
import QueryAttribute from 'components/Dashboard/SimSearchProjectionTab/panels/QueryAttribute';

interface IProjPanelProps {
    store: Store<IApplicationState>;
}

interface IProjPanelReduxProps {
    setType: typeof setType;
    modifyQueryAttribute: typeof modifyQueryAttribute;

    type: IProjParametersState['type'];
    queryAttributes: IProjParametersState['queryAttributes'];
}

interface IQueryBuilderState {
    isHoverOnAddButton: boolean;
}

class ProjectionPanel extends React.Component<
    IProjPanelProps & IProjPanelReduxProps,
    IQueryBuilderState
> {
    constructor(props: IProjPanelProps & IProjPanelReduxProps) {
        super(props);

        this.state = {
            isHoverOnAddButton: false,
        };
    }

    public componentDidUpdate() {
        console.log('proj-param props update', this.props);
    }

    public render() {
        const onTypeChangeFn = (e: any) => {
            console.log(e.target.value);
            if (e.target.value) this.props.setType(e.target.value);
        };

        const addAttrButtonMouseEnterFn = () => {
            this.setState({
                isHoverOnAddButton: true,
            });
        };
        const addAttrButtonMouseLeaveFn = () => {
            this.setState({
                isHoverOnAddButton: false,
            });
        };

        const activateAttrFn = (attrName: string) => (event: any) => {
            this.props.modifyQueryAttribute(attrName, {
                value: true,
                key: 'active',
            });
            this.setState({
                isHoverOnAddButton: false,
            });
        };

        const attributeChangeFn = (
            attrName: string,
            key: string,
            value: string | number | boolean
        ) => {
            this.props.modifyQueryAttribute(attrName, { value, key });
        };

        return (
            <div className={'panel left'}>
                <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Projection</Card.Title>
                        <Container>
                            <Row className="mb-2">
                                <ToggleButtonGroup
                                    aria-label="Basic example"
                                    type="radio"
                                    name="projToggleButton"
                                    onClick={onTypeChangeFn}
                                    defaultValue={this.props.type}
                                >
                                    <ToggleButton value="pca" variant="primary">
                                        PCA
                                    </ToggleButton>
                                    <ToggleButton value="mds" variant="primary">
                                        MDS
                                    </ToggleButton>
                                    <ToggleButton
                                        value="umap"
                                        variant="primary"
                                    >
                                        UMAP
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Row>

                            <Row className="mb-2">
                                {Object.entries(this.props.queryAttributes).map(
                                    ([aName, aObject], idx) => {
                                        if (aObject.active) {
                                            return (
                                                <QueryAttribute
                                                    key={idx}
                                                    name={aName}
                                                    attribute={aObject}
                                                    changeFn={attributeChangeFn}
                                                />
                                            );
                                        }
                                    }
                                )}
                            </Row>
                            <Row className="mb-2 query-buttons">
                                <div
                                    className={'add-attribute-button'}
                                    onMouseEnter={addAttrButtonMouseEnterFn}
                                    onMouseLeave={addAttrButtonMouseLeaveFn}
                                >
                                    {this.state.isHoverOnAddButton
                                        ? Object.entries(
                                              this.props.queryAttributes
                                          ).map(([aName, aObject], idx) => {
                                              console.log(aName, aObject);
                                              if (!aObject.active) {
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              'add-attribute-col'
                                                          }
                                                          onClick={activateAttrFn(
                                                              aName
                                                          )}
                                                      >
                                                          {aName}
                                                      </div>
                                                  );
                                              }
                                          })
                                        : '+'}
                                </div>
                            </Row>
                        </Container>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

const mapDispatchToProps = {
    setType,
    modifyQueryAttribute,
};

const mapStateToProps = ({ projParametersState }: IApplicationState) => ({
    type: projParametersState.type,
    queryAttributes: projParametersState.queryAttributes,
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectionPanel);
