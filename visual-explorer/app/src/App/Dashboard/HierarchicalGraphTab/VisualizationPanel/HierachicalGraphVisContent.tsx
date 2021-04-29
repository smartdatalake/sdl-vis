import React from 'react';
import { Margin } from 'types/Margin';

const DEFAULT_MARGIN: Margin = { top: 10, right: 25, bottom: 35, left: 45 };

interface Props {
    data: unknown;
    margin?: Margin;
}

const HierachicalGraphVisContent: React.FunctionComponent<Props> = ({ data, margin = DEFAULT_MARGIN }: Props) => {
    // const timeAccessor = (tp: TimePoint) => tp.time.valueOf();
    // const valueAccessor = (tp: TimePoint) => tp.payload.value;
    //
    // const xMax = width - margin.left - margin.right;
    // const yMax = height - margin.top - margin.bottom;
    //
    // const timeScale = scaleTime<number>({
    //     domain: [tsArrayReducer(tsArray, timeAccessor, Math.min), tsArrayReducer(tsArray, timeAccessor, Math.max)],
    //     range: [0, xMax],
    // });
    // const valueScale = scaleTime<number>({
    //     domain: [tsArrayReducer(tsArray, valueAccessor, Math.min), tsArrayReducer(tsArray, valueAccessor, Math.max)],
    //     range: [yMax, 0],
    // });
    //
    // const colorScale = scaleOrdinal({
    //     domain: tsArray.map((ts) => ts.id),
    //     range: [...schemeTableau10],
    // });
    //
    // return (
    //     <>
    //         <Group left={margin.left} top={margin.top}>
    //             <AxisLeft
    //                 tickClassName={'ts-tick'}
    //                 axisClassName={'ts-axis'}
    //                 tickFormat={getNumberFormatter(3)}
    //                 scale={valueScale}
    //                 numTicks={5}
    //             />
    //             <AxisBottom
    //                 tickClassName={'ts-tick'}
    //                 axisClassName={'ts-axis'}
    //                 top={yMax}
    //                 scale={timeScale}
    //                 numTicks={5}
    //             />
    //             {tsArray.map((ts) => {
    //                 return (
    //                     <LinePath
    //                         key={ts.id}
    //                         data={ts.timePoints}
    //                         curve={curveBasis}
    //                         x={(tp) => timeScale(timeAccessor(tp)) ?? 0}
    //                         y={(tp) => valueScale(valueAccessor(tp)) ?? 0}
    //                         stroke={colorScale(ts.id) ?? '#000'}
    //                         strokeWidth={1}
    //                     />
    //                 );
    //             })}
    //         </Group>
    //     </>
    // );

    return <rect x={100} y={100} width={100} height={100} style={{ fill: 'gray' }} />;
};

export default HierachicalGraphVisContent;
