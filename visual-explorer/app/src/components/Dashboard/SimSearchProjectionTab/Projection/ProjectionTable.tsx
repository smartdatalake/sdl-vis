import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Card, Spinner, Table } from 'react-bootstrap';
import {
    SimilarityGraph,
    SimilaritySearchStates,
} from '../useSimilaritySearch';
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
    display: inline-grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    width: 100%;
    font-size: smaller;
    max-height: 3em;
    overflow: hidden;
`;

const TData = styled.td`
    overflow: hidden;
    text-align: center;
`;

const THead = styled.td`
    overflow: hidden;
    text-align: center;
    font-weight: bold;
`;

const ProjectionTable = ({
    similaritySearchStates,
}: {
    similaritySearchStates: SimilaritySearchStates;
}) => {
    const { isLoading, searchParameters } = useContext(SimilaritySearchContext);
    const { highlightedNode, setHighlightedNode } = useContext(
        SimilaritySearchContext
    );
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
        <TRow key="head">
            {attributeToPreview && (
                <>
                    <THead>{'w\u207B'}</THead>
                    <THead>{'w\u207A'}</THead>
                </>
            )}
            <THead> ID </THead>

            {/* Todo: Generate the following columns automatically (map over attributes) */}
            <THead> Total Score </THead>
            {searchParameters.employees.active && (
                <>
                    <THead> # Employees </THead>
                    <THead> Employees Score </THead>
                </>
            )}
            {searchParameters.keywords.active && (
                <>
                    <THead> Keywords </THead>
                    <THead> Keywords Score </THead>
                </>
            )}
            {searchParameters.location.active && (
                <>
                    <THead> Location </THead>
                    <THead> Location Score </THead>
                </>
            )}
            {searchParameters.revenue.active && (
                <>
                    <THead> Revenue </THead>
                    <THead> Revenue Score </THead>
                </>
            )}
        </TRow>
    );

    const tableRows = Object.entries(similaritySearchStates.current.points).map(
        (entry, index) => {
            const onClickHandler = () => linkToAtoka(entry[1].id);

            const onMouseOverRow = () => {
                setHighlightedNode(entry[1]);
            };

            const onMouseOutRow = () => {
                setHighlightedNode(null);
            };

            const getPositionChange = (
                id: string,
                posi: number,
                sim: SimilarityGraph | undefined
            ) => {
                if (!sim) return '\u274C';
                else {
                    if (sim.points.findIndex(x => x.id === id) === -1)
                        return '\u2A2F';

                    const diff = index - sim.points.findIndex(x => x.id === id);
                    if (diff === 0) return '\u2192';
                    else if (diff > 5) return '\u2191';
                    else if (diff < -5) return '\u2193';
                    else if (diff > 0 && diff <= 5) return '\u2197';
                    else if (diff < 0 && diff >= -5) return '\u2198';
                }
            };

            return (
                <TRow
                    key={entry[1].id}
                    onMouseOver={onMouseOverRow}
                    onMouseOut={onMouseOutRow}
                    style={{
                        opacity:
                            !highlightedNode ||
                            highlightedNode.id === entry[1].id
                                ? 1
                                : 0.3,
                        color: entry[1].fillColor,
                    }}
                >
                    {attributeToPreview &&
                        similaritySearchStates[attributeToPreview]
                            .decreased && (
                            <>
                                <TData
                                    style={{ color: 'red', fontSize: '1.5em' }}
                                >
                                    {getPositionChange(
                                        entry[1].id,
                                        index,
                                        similaritySearchStates[
                                            attributeToPreview
                                        ].decreased
                                    )}
                                </TData>
                                <TData
                                    style={{
                                        color: 'green',
                                        fontSize: '1.5em',
                                    }}
                                >
                                    {getPositionChange(
                                        entry[1].id,
                                        index,
                                        similaritySearchStates[
                                            attributeToPreview
                                        ].increased
                                    )}
                                </TData>
                            </>
                        )}
                    <TData
                        style={{ cursor: 'pointer' }}
                        onClick={onClickHandler}
                    >
                        {' '}
                        {
                            entry[1].id.split('/')[
                                entry[1].id.split('/').length - 1
                            ]
                        }{' '}
                    </TData>

                    {/* Todo: Generate the following columns automatically (map over attributes) */}
                    <TData> {entry[1].totalScore.toFixed(4)} </TData>
                    {entry[1].numEmployees && entry[1].employeesScore && (
                        <>
                            <TData> {entry[1].numEmployees} </TData>
                            <TData>
                                {' '}
                                {entry[1].employeesScore.toFixed(4)}{' '}
                            </TData>
                        </>
                    )}
                    {entry[1].keywords && entry[1].keywordsScore && (
                        <>
                            <TData> {entry[1].keywords} </TData>
                            <TData> {entry[1].keywordsScore.toFixed(4)} </TData>
                        </>
                    )}
                    {entry[1].location && entry[1].locationScore && (
                        <>
                            <TData> {entry[1].location} </TData>
                            <TData> {entry[1].locationScore} </TData>
                        </>
                    )}
                    {entry[1].revenue && entry[1].revenueScore && (
                        <>
                            <TData> {entry[1].revenue} </TData>
                            <TData> {entry[1].revenueScore.toFixed(4)} </TData>
                        </>
                    )}
                </TRow>
            );
        }
    );

    return (
        <FloatingCard>
            {isLoading ? (
                <LoadingIndicator>
                    <Spinner animation="grow" />
                </LoadingIndicator>
            ) : null}
            <CardHead>
                Results
                {isMinimized ? (
                    <ArrowDown onClick={toggleMinimize} />
                ) : (
                    <ArrowUp onClick={toggleMinimize} />
                )}
            </CardHead>
            {!isMinimized && (
                <Card.Body>
                    <Table
                        striped={true}
                        bordered={true}
                        hover={true}
                        size="sm"
                    >
                        <thead>{tableHead}</thead>
                        <tbody>{tableRows}</tbody>
                    </Table>
                </Card.Body>
            )}
        </FloatingCard>
    );
};

export default ProjectionTable;
