import React from 'react';
import './timeseries-svg.scss';
import * as d3 from 'd3';
import sizeMe from 'react-sizeme';
import SVGPanZoom from 'components/SVGPanZoom';

interface ITimeSeriesVisProps {
    data?: Array<Array<{t: number, v: number, v_smoothed: number}>>
}

class TimeSeriesSVG extends React.Component<ITimeSeriesVisProps & sizeMe.SizeMeProps> {
    private plot = {
        x: d3.scaleLinear(),
        y: d3.scaleLinear(),
        c: d3.scaleOrdinal().range(d3.schemeCategory10),
        size: [400,800],
    }

    constructor(props: ITimeSeriesVisProps & sizeMe.SizeMeProps) {
        super(props);
    }

    public render() {

        let vis: React.ReactElement | null = null;
        //let lines = null;
        if(this.props.data){
            let canvas = d3.select('#timeseries-plot')
                .style(
                    'transform',
                    'translate(-' +
                        this.plot.size[1] / 2 +
                        'px,-' +
                        this.plot.size[0] / 2 +
                        'px)'
                );
            
            canvas
            .selectAll('*')
            .remove();

            //initiate scales
            let xDom = [Infinity, 0]
            let yDom = [Infinity, 0]

            this.props.data.forEach(series => {
                //@ts-ignore
                if(d3.min(series, d => {return d.t}) < xDom[0] )
                //@ts-ignore
                    xDom[0] = d3.min(series, d => {return d.t})

                //@ts-ignore
                if(d3.max(series, d => {return d.t}) > xDom[1] )
                //@ts-ignore
                    xDom[1] = d3.max(series, d => {return d.t})

                //@ts-ignore
                if(d3.min(series, d => {return d.v}) < yDom[0] )
                //@ts-ignore
                    yDom[0] = d3.min(series, d => {return d.v})
                    
                //@ts-ignore
                if(d3.max(series, d => {return d.v}) > yDom[1] )
                //@ts-ignore
                    yDom[1] = d3.max(series, d => {return d.v})            
            })

            console.log("dims", xDom, yDom)
            //@ts-ignore
            this.plot.c.domain([0, this.props.data.length])

            this.plot.x
            //@ts-ignore
                .domain(xDom)
                .range([0, this.plot.size[1]])

            canvas.append('g')
                .attr('transform', 'translate(0,' + this.plot.size[0] + ')')
                .call(d3.axisBottom(this.plot.x));

            this.plot.y
            //@ts-ignore
                .domain(yDom)
                .range([this.plot.size[0], 0])

            canvas.append('g').call(d3.axisLeft(this.plot.y));

            let lines = d3.line()
            //@ts-ignore
                .x(d =>{return this.plot.x(d.t)})
            //@ts-ignore
                .y(d =>{return this.plot.y(d.v)})
                .curve(d3.curveMonotoneX)

            let idx = 0
            this.props.data.forEach(series => {
                canvas.append('path')
                .datum(series)
                //@ts-ignore
                .attr('d', lines)
                .attr('class', 'tseries-line')
                //@ts-ignore
                .style('stroke', this.plot.c(idx) as string)
                .style('fill', 'none')

                idx++;
            })
            
        }

        vis = (<g id={'timeseries-plot'}>
{/*             <g className={'timeseries-lines'}>{lines}</g>
 */}        </g>)


        return (
            <div className={'timeseries-vis-wrapper'}>
                <SVGPanZoom
                    className={'content-svg noselect'}
                    width={'100%'}
                    height={'100%'}>
                            {vis}
                </SVGPanZoom>
            </div>
        )
    }
}

export default sizeMe({ monitorHeight: true, refreshRate: 20 })(TimeSeriesSVG);
