import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { matrix } from 'mathjs';

export const DEFAULT_CORRELATION_RESPONSE: CorrelationResponse = {
    timeseries: [
        {
            startDate: new Date('2006-12-31T23:00:00.000Z'),
            endDate: new Date('2012-12-30T23:00:00.000Z'),
            numDatapoints: 1566,
            tsName: 'US- Butter Future_00110E.txt',
            rawDatapoints: [
                {
                    date: new Date('2006-12-31T23:00:00.000Z'),
                    value: 128.5,
                },
                {
                    date: new Date('2007-01-01T23:00:00.000Z'),
                    value: 128.5,
                },
                {
                    date: new Date('2007-01-02T23:00:00.000Z'),
                    value: 127.5,
                },
                {
                    date: new Date('2007-01-03T23:00:00.000Z'),
                    value: 127.5,
                },
            ],
        },
        {
            startDate: new Date('2006-12-31T23:00:00.000Z'),
            endDate: new Date('2012-12-30T23:00:00.000Z'),
            numDatapoints: 1566,
            tsName: 'US- Coffee -C- Future_000654.txt',
            rawDatapoints: [
                {
                    date: new Date('2006-12-31T23:00:00.000Z'),
                    value: 126.2,
                },
                {
                    date: new Date('2007-01-01T23:00:00.000Z'),
                    value: 126.2,
                },
                {
                    date: new Date('2007-01-02T23:00:00.000Z'),
                    value: 123.6,
                },
                {
                    date: new Date('2007-01-03T23:00:00.000Z'),
                    value: 125,
                },
            ],
        },
        {
            startDate: new Date('2006-12-31T23:00:00.000Z'),
            endDate: new Date('2012-12-30T23:00:00.000Z'),
            numDatapoints: 1566,
            tsName: 'US- Corn-Future_001047.txt',
            rawDatapoints: [
                {
                    date: new Date('2006-12-31T23:00:00.000Z'),
                    value: 390.25,
                },
                {
                    date: new Date('2007-01-01T23:00:00.000Z'),
                    value: 390.25,
                },
                {
                    date: new Date('2007-01-02T23:00:00.000Z'),
                    value: 370.5,
                },
                {
                    date: new Date('2007-01-03T23:00:00.000Z'),
                    value: 362.25,
                },
            ],
        },
        {
            startDate: new Date('2006-12-31T23:00:00.000Z'),
            endDate: new Date('2012-12-30T23:00:00.000Z'),
            numDatapoints: 1566,
            tsName: 'US- Cotton No.2 Future_000655.txt',
            rawDatapoints: [
                {
                    date: new Date('2006-12-31T23:00:00.000Z'),
                    value: 56.19,
                },
                {
                    date: new Date('2007-01-01T23:00:00.000Z'),
                    value: 56.19,
                },
                {
                    date: new Date('2007-01-02T23:00:00.000Z'),
                    value: 54.89,
                },
                {
                    date: new Date('2007-01-03T23:00:00.000Z'),
                    value: 54.56,
                },
            ],
        },
    ],
    correlations: [
        matrix([
            [1, 0.8429886839453135, 0.9580225390183607, 0.9814988112643394],
            [0.8429886839453135, 1, 0.6533810801521739, 0.724395637635467],
            [0.9580225390183607, 0.6533810801521739, 1, 0.9951905642225269],
            [0.9814988112643394, 0.724395637635467, 0.9951905642225269, 1],
        ]),
        matrix([
            [1, -0.6317977517912003, -0.7647174795829337, -0.2713803504109685],
            [-0.6317977517912003, 1, 0.9826160952103451, 0.9175017157600426],
            [-0.7647174795829337, 0.9826160952103451, 1, 0.8277133760408024],
            [-0.2713803504109685, 0.9175017157600426, 0.8277133760408024, 1],
        ]),
        matrix([
            [1, -0.9773555548504375, 0.8942947127068114, 0.8782998231498775],
            [-0.9773555548504375, 1, -0.9687319948606014, -0.9595811037023017],
            [0.8942947127068114, -0.9687319948606014, 1, 0.9994029279876662],
            [0.8782998231498775, -0.9595811037023017, 0.9994029279876662, 1],
        ]),
    ],
    meanCorrelation: matrix([
        [1, -0.25538820756544145, 0.3625332573807461, 0.5294727613344161],
        [-0.25538820756544145, 1, 0.22242172683397252, 0.22743874989773594],
        [0.3625332573807461, 0.22242172683397252, 1, 0.9407689560836653],
        [0.5294727613344161, 0.22743874989773594, 0.9407689560836653, 1],
    ]),
    meanAbsCorrelation: matrix([
        [1, 0.8173806635289838, 0.8723449104360351, 0.7103929949417284],
        [0.8173806635289838, 1, 0.8682430567410401, 0.8671594856992705],
        [0.8723449104360351, 0.8682430567410401, 1, 0.9407689560836653],
        [0.7103929949417284, 0.8671594856992705, 0.9407689560836653, 1],
    ]),
};
