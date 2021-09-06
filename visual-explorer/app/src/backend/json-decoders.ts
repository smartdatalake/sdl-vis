import { err, JsonDecoder, ok } from 'ts.data.json';
import { GCoreGraphLink, GCoreGraphNode, GCoreGraphSchema } from 'types/GCoreHierachicalGraph/GCoreGraphCatalog';
import { CorrelationResponse, CorrelationTimeSeriesEntry, TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';
import { map, matrix, Matrix } from 'mathjs';
import { $JsonDecoderErrors } from 'ts.data.json/dist/json-decoder';
import { TimeSeriesInformation } from 'types/TimeSeriesGraph/TimeSeriesCatalog';
import { DataRow, DataValue } from 'types/DataArray';
import { SearchColumn, SearchColumnDataType } from 'types/SimSearch/SearchColumn';
import { SimilarityGraph, SimilarityGraphEdge, SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';
import { HierarchicalGraphLevel, HierarchicalGraphNode } from 'types/HierarchicalGraphLevel';

/* *****************
 * number | string *
 ***************** */
const numberOrStringDecoder = JsonDecoder.oneOf<string | number>(
    [JsonDecoder.number, JsonDecoder.string],
    'number | string'
);

const numberOrStringDictDecoder = JsonDecoder.dictionary(numberOrStringDecoder, 'NumberOrStringDict');

/* ********
 * Arrays *
 ******** */
export const numberArrayDecoder = JsonDecoder.array<number>(JsonDecoder.number, 'number[]');
export const stringArrayDecoder = JsonDecoder.array<string>(JsonDecoder.string, 'string[]');

export const numberOrStringArrayDecoder = JsonDecoder.array<number | string>(
    numberOrStringDecoder,
    'Array<number | string>'
);

/* ******
 * Date *
 ****** */
const dateDecoder: JsonDecoder.Decoder<Date> = new JsonDecoder.Decoder<Date>((json: unknown) => {
    if (typeof json === 'string') {
        const isValidDate = !isNaN(Date.parse(json));

        if (isValidDate) {
            return ok<Date>(new Date(json));
        }
    }

    return err<Date>($JsonDecoderErrors.primitiveError(json, 'Date'));
});

/* *******************
 * GCoreGraphCatalog *
 ******************* */
const gCoreGraphNodeDecoder = JsonDecoder.object<GCoreGraphNode>(
    {
        id: JsonDecoder.number,
        label: JsonDecoder.string,
        property: stringArrayDecoder,
        title: JsonDecoder.string,
    },
    'GCoreGraphNode'
);

const gCoreGraphLinkDecoder = JsonDecoder.object<GCoreGraphLink>(
    {
        from: JsonDecoder.number,
        to: JsonDecoder.number,
        label: JsonDecoder.string,
        property: stringArrayDecoder,
        title: JsonDecoder.string,
    },
    'GCoreGraphLink'
);

const gCoreGraphSchemaDecoder = JsonDecoder.object<GCoreGraphSchema>(
    {
        nodes: JsonDecoder.array<GCoreGraphNode>(gCoreGraphNodeDecoder, 'GCoreGraphNode[]'),
        links: JsonDecoder.array<GCoreGraphLink>(gCoreGraphLinkDecoder, 'GCoreGraphLink[]'),
    },
    'GCoreGraphSchema'
);

export const gCoreGraphCatalogDecoder = JsonDecoder.dictionary<GCoreGraphSchema>(
    gCoreGraphSchemaDecoder,
    'GCoreGraphCatalog'
);

/* ************************
 * HierarchicalGraphLevel *
 ************************ */
const hierarchicalGraphNodeDecoder = JsonDecoder.object<HierarchicalGraphNode>(
    {
        label: JsonDecoder.string,
        cluster: JsonDecoder.number,
        id: JsonDecoder.number,
        level: JsonDecoder.number,
        x: JsonDecoder.number,
        y: JsonDecoder.number,
        attributes: numberOrStringDictDecoder,
    },
    'HierarchicalGraphNode'
);

const hierarchicalGraphNodeArrayDecoder = JsonDecoder.array<HierarchicalGraphNode>(
    hierarchicalGraphNodeDecoder,
    'HierarchicalGraphNode[]'
);

export const hierarchicalGraphLevelDecoder = JsonDecoder.object<HierarchicalGraphLevel>(
    {
        transactionId: JsonDecoder.string,
        nodes: hierarchicalGraphNodeArrayDecoder,
    },
    'HierarchicalGraphLevel'
);

/* *************************
 * TimeSeriesCatalogSearch *
 ************************* */
const timeSeriesInformationDecoder = JsonDecoder.object<TimeSeriesInformation>(
    {
        startDate: dateDecoder,
        endDate: dateDecoder,
        numDatapoints: JsonDecoder.number,
    },
    'TimeSeriesInformation'
);

export const catalogSearchResponseDecoder = JsonDecoder.dictionary<TimeSeriesInformation>(
    timeSeriesInformationDecoder,
    'CatalogSearchResponse'
);

/* *****************
 * TimeSeriesEntry *
 ***************** */
const timePointDecoder = JsonDecoder.object<TimePoint>(
    {
        date: dateDecoder,
        value: JsonDecoder.number,
    },
    'TimePoint'
);

const correlationTimeSeriesEntryDecoder = JsonDecoder.object<CorrelationTimeSeriesEntry>(
    {
        startDate: dateDecoder,
        endDate: dateDecoder,
        numDatapoints: JsonDecoder.number,
        tsName: JsonDecoder.string,
        rawDatapoints: JsonDecoder.array<TimePoint>(timePointDecoder, 'TimePoint[]'),
    },
    'CorrelationTimeSeriesEntry'
);

/* ***********************
 * TimeSeriesCorrelation *
 *********************** */
const matrixDecoder: JsonDecoder.Decoder<Matrix> = new JsonDecoder.Decoder<Matrix>((json: unknown) => {
    if (Array.isArray(json)) {
        // Create matrix and replace null values with NaN
        const m = map(matrix(json), (v) => (v === null ? NaN : v));
        return ok<Matrix>(m);
    }

    return err<Matrix>($JsonDecoderErrors.primitiveError(json, 'mathjs.Matrix'));
});

export const correlationResponseDecoder = JsonDecoder.object<CorrelationResponse>(
    {
        timeseries: JsonDecoder.array<CorrelationTimeSeriesEntry>(
            correlationTimeSeriesEntryDecoder,
            'CorrelationTimeSeriesEntry[]'
        ),
        correlations: JsonDecoder.array<Matrix>(matrixDecoder, 'Matrix[]'),
        meanCorrelation: matrixDecoder,
        meanAbsCorrelation: matrixDecoder,
    },
    'CorrelationResponse'
);

/* **************
 * DataArray.ts *
 ************** */
const matrixOrNumberDecoder = JsonDecoder.oneOf<DataValue>(
    [JsonDecoder.number, numberArrayDecoder, JsonDecoder.string],
    'DataValue'
);

export const dataArrayDecoder = JsonDecoder.array<DataRow>(
    JsonDecoder.dictionary(matrixOrNumberDecoder, 'DataRow'),
    'DataArray'
);

/* ***********
 * SimSearch *
 *********** */
const numberOrStringOrArrayOfNumberOrStringDecoder = JsonDecoder.oneOf<string | number | Array<number | string>>(
    [numberOrStringDecoder, numberOrStringArrayDecoder],
    'number | string | Array<number | string>'
);

const searchColumnDataTypeDecoder = JsonDecoder.enumeration<SearchColumnDataType>(
    SearchColumnDataType,
    'SearchColumnDataType'
);

const searchColumnDecoder = JsonDecoder.object<SearchColumn>(
    {
        column: JsonDecoder.string,
        datatype: searchColumnDataTypeDecoder,
        operation: JsonDecoder.string,
        sampleValue: numberOrStringOrArrayOfNumberOrStringDecoder,
    },
    'SearchColumn'
);

export const searchColumnArrayDecoder = JsonDecoder.array<SearchColumn>(searchColumnDecoder, 'SearchColumn[]');

const strictSimilarityGraphNodeDecoder = JsonDecoder.object<SimilarityGraphNode>(
    {
        x: JsonDecoder.number,
        y: JsonDecoder.number,
        id: JsonDecoder.string,
        totalScore: JsonDecoder.number,
        cluster: JsonDecoder.number,
        // Add default values for attributes that are used only in frontend
        size: JsonDecoder.constant(0),
        fillColor: JsonDecoder.constant('#000000'),
        rank: JsonDecoder.constant(0),
    },
    'StrictSimilarityGraphNode'
);

const similarityGraphNodeDecoder = JsonDecoder.combine(
    strictSimilarityGraphNodeDecoder,
    JsonDecoder.dictionary<number | string | Array<number | string>>(
        numberOrStringOrArrayOfNumberOrStringDecoder,
        'Dict<number | string | Array<number | string>>'
    )
);

const similarityGraphEdgeDecoder = JsonDecoder.object<SimilarityGraphEdge>(
    {
        left: JsonDecoder.string,
        right: JsonDecoder.string,
        score: JsonDecoder.number,
    },
    'SimilarityGraphEdge'
);

export const similarityGraphDecoder = JsonDecoder.object<SimilarityGraph>(
    {
        points: JsonDecoder.array<SimilarityGraphNode>(similarityGraphNodeDecoder, 'SimilarityGraphNode[]'),
        adjMat: JsonDecoder.array<SimilarityGraphEdge>(similarityGraphEdgeDecoder, 'SimilarityGraphEdge[]'),
    },
    'SimilarityGraph'
);

export const similarityGraphArrayDecoder = JsonDecoder.array<SimilarityGraph>(
    similarityGraphDecoder,
    'SimilarityGraph[]'
);
