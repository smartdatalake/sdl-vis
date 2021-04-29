import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Card, Spinner, Table } from 'react-bootstrap';
import { SimilarityGraph, SimilaritySearchStates } from '../useSimilaritySearch';
import SimilaritySearchContext from '../Context';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const FloatingCard = styled(Card)`
    right: 15px;
    position: absolute;
    top: 15px;
    z-index: 2;
    width: 35vw;
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

const TRow = styled.tr`
    font-size: smaller;
    max-height: 3em;
    overflow: hidden;
    user-select: none;
`;

const TData = styled.td`
    overflow: hidden;
    text-align: center;
    padding: 2px 20px !important;
`;

const THead = styled.th`
    overflow: hidden;
    text-align: center;
    font-weight: bold;
    padding: 10px 20px !important;
    text-transform: capitalize;
`;

const ProjectionTable = ({ similaritySearchStates }: { similaritySearchStates: SimilaritySearchStates }) => {
    const { isLoading, searchParameters } = useContext(SimilaritySearchContext);
    const { highlightedNode, setHighlightedNode } = useContext(SimilaritySearchContext);
    const [isMinimized, setIsMinimized] = useState<boolean>();
    const { attributeToPreview } = useContext(SimilaritySearchContext);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    if (!searchParameters) return <></>;

    const linkToAtoka = (atokaLink: string) => {
        window.open(atokaLink.split(';')[0], '_blank', 'noopener');
    };

    const tableHead = (
        <TRow className="align-middle">
            {attributeToPreview && similaritySearchStates[attributeToPreview] && (
                <>
                    <THead className="align-middle">{'w\u207B'}</THead>
                    <THead className="align-middle">{'w\u207A'}</THead>
                </>
            )}
            <THead className="align-middle">ID</THead>

            <THead>Total&nbsp;Score</THead>
            {searchParameters
                ? Object.entries(searchParameters)
                      .filter(([name, value]) => value.active)
                      .map(([name, value], idx) => {
                          return (
                              <React.Fragment key={idx}>
                                  <THead className="align-middle">&nbsp;{name}</THead>
                                  <THead className="align-middle">{name}&nbsp;Score</THead>
                              </React.Fragment>
                          );
                      })
                : null}
        </TRow>
    );

    const tableRows = Object.entries(similaritySearchStates.current.points).map((entry, idx) => {
        const onClickHandler = () => linkToAtoka(entry[1].id);

        const onMouseOverRow = () => {
            setHighlightedNode(entry[1]);
        };

        const onMouseOutRow = () => {
            setHighlightedNode(null);
        };

        const getPositionChange = (id: string, posi: number, sim: SimilarityGraph | undefined) => {
            if (!sim) return '\u274C';
            else {
                if (sim.points.findIndex((x) => x.id === id) === -1) return '\u2A2F';

                const diff = idx - sim.points.findIndex((x) => x.id === id);
                if (diff === 0) return '\u2192';
                else if (diff > 5) return '\u2191';
                else if (diff < -5) return '\u2193';
                else if (diff > 0 && diff <= 5) return '\u2197';
                else if (diff < 0 && diff >= -5) return '\u2198';
            }
        };

        return (
            <TRow
                key={idx}
                onMouseOver={onMouseOverRow}
                onMouseOut={onMouseOutRow}
                style={{
                    opacity: !highlightedNode || highlightedNode.id === entry[1].id ? 1 : 0.3,
                    color: entry[1].fillColor,
                }}
            >
                {attributeToPreview && similaritySearchStates[attributeToPreview] && (
                    <>
                        <TData
                            className="align-middle"
                            style={{
                                color: 'red',
                                fontSize: '1.5em',
                            }}
                        >
                            {getPositionChange(entry[1].id, idx, similaritySearchStates[attributeToPreview].decreased)}
                        </TData>
                        <TData
                            className="align-middle"
                            style={{
                                color: 'green',
                                fontSize: '1.5em',
                            }}
                        >
                            {getPositionChange(entry[1].id, idx, similaritySearchStates[attributeToPreview].increased)}
                        </TData>
                    </>
                )}
                <TData className="align-middle" style={{ cursor: 'pointer' }} onClick={onClickHandler}>
                    {' '}
                    {entry[1].id.split('/')[entry[1].id.split('/').length - 1]}{' '}
                </TData>

                <TData className="align-middle"> {entry[1].totalScore.toFixed(4)} </TData>
                {searchParameters
                    ? Object.entries(searchParameters)
                          .filter(([name, value]) => value.active)
                          .map(([name, value], idx) => {
                              return (
                                  <React.Fragment key={idx}>
                                      <TData className="align-middle">{entry[1][name]}</TData>
                                      <TData className="align-middle">{entry[1][name + 'Score']}</TData>
                                  </React.Fragment>
                              );
                          })
                    : null}
            </TRow>
        );
    });

    return (
        <FloatingCard>
            {isLoading ? (
                <LoadingIndicator>
                    <Spinner animation="grow" />
                </LoadingIndicator>
            ) : null}
            <CardHead style={{ userSelect: 'none' }}>
                Results
                {isMinimized ? <ArrowDown onClick={toggleMinimize} /> : <ArrowUp onClick={toggleMinimize} />}
            </CardHead>
            {!isMinimized && (
                <Card.Body>
                    <Table striped={true} bordered={true} hover={true} size="sm">
                        <thead>{tableHead}</thead>
                        <tbody>{tableRows}</tbody>
                    </Table>
                </Card.Body>
            )}
        </FloatingCard>
    );
};

export default ProjectionTable;
