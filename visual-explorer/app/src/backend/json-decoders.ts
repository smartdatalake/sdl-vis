import { err, JsonDecoder, ok } from 'ts.data.json';
import { GCoreGraphLink, GCoreGraphNode, GCoreGraphSchema } from 'types/GCoreHierachicalGraph/GCoreGraphCatalog';
import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { Matrix, matrix, map } from 'mathjs';
import { $JsonDecoderErrors } from 'ts.data.json/dist/json-decoder';
import { TimeSeriesEntry, TimeSeriesInformation } from 'types/TimeSeriesGraph/TimeSeriesCatalog';

/* ********
 * Arrays *
 ******** */
export const numberArrayDecoder = JsonDecoder.array<number>(JsonDecoder.number, 'number[]');
export const stringArrayDecoder = JsonDecoder.array<string>(JsonDecoder.string, 'string[]');

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
const timeSeriesEntryDecoder = JsonDecoder.combine(
    timeSeriesInformationDecoder,
    JsonDecoder.object<Omit<TimeSeriesEntry, keyof TimeSeriesInformation>>(
        {
            tsName: JsonDecoder.string,
        },
        'TimeSeriesInformation'
    )
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
        timeseries: JsonDecoder.array<TimeSeriesEntry>(timeSeriesEntryDecoder, 'TimeSeriesInformation[]'),
        correlations: JsonDecoder.array<Matrix>(matrixDecoder, 'Matrix[]'),
        meanCorrelation: matrixDecoder,
        meanAbsCorrelation: matrixDecoder,
    },
    'CorrelationResponse'
);
