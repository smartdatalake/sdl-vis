import {
    catalogSearchResponseDecoder,
    correlationResponseDecoder,
    dataArrayDecoder,
    gCoreGraphCatalogDecoder,
} from 'backend/json-decoders';
import { VISUAL_ANALYTICS_ENGINE } from 'backend-urls';
import { GCoreGraphCatalog } from 'types/GCoreHierachicalGraph/GCoreGraphCatalog';
import { GraphSettings } from 'types/GCoreHierachicalGraph/GraphSettings';
import { TimeSeriesGraphSettings } from 'types/TimeSeriesGraph/TimeSeriesGraphSettings';
import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { TimeSeriesCatalog } from 'types/TimeSeriesGraph/TimeSeriesCatalog';
import { DataArray } from 'types/DataArray';

enum ResponseType {
    JSON,
    BLOB,
    TEXT,
}

export type JSONType = string | number | boolean | null | { [property: string]: JSONType } | JSONType[];

class BackendQueryEngine {
    private static async queryBackend(
        route: string,
        parameters: JSONType = {},
        responseType: ResponseType = ResponseType.JSON
    ): Promise<unknown> {
        const requestURL = `${VISUAL_ANALYTICS_ENGINE}/${route}`;

        return fetch(requestURL, {
            body: JSON.stringify(parameters),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then((response) => {
            if (responseType === ResponseType.JSON) return response.json();
            if (responseType === ResponseType.BLOB) return response.blob();
            if (responseType === ResponseType.TEXT) return response.text();

            return null;
        });
    }

    public static async timeseriesCatalogSearch(filterStr: string, limit = 10): Promise<TimeSeriesCatalog> {
        const payload = {
            filterStr,
            limit,
        };
        const jsonResponse: unknown = await BackendQueryEngine.queryBackend(`timeseries/catalog-search`, payload);
        return catalogSearchResponseDecoder.decodeToPromise(jsonResponse);
    }

    public static async timeseriesCorrelation(payload: TimeSeriesGraphSettings): Promise<CorrelationResponse> {
        const jsonResponse: unknown = await BackendQueryEngine.queryBackend(
            `timeseries/correlate`,
            payload as JSONType
        );
        return correlationResponseDecoder.decodeToPromise(jsonResponse);
    }

    public static async gcoreGraphs(): Promise<GCoreGraphCatalog> {
        const jsonResponse: unknown = await BackendQueryEngine.queryBackend(`gcore/graphs`);
        return gCoreGraphCatalogDecoder.decodeToPromise(jsonResponse);
    }

    public static async gcoreGraphvisInit(graphSettings: GraphSettings): Promise<DataArray> {
        const jsonResponse: unknown = await BackendQueryEngine.queryBackend(
            `gcore/graphvis/init`,
            (graphSettings as unknown) as JSONType
        );

        return dataArrayDecoder.decodeToPromise(jsonResponse);
    }
}

export default BackendQueryEngine;
