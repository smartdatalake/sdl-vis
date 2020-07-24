import React from 'react';
import './proj-svg.scss';
import Circle from './D3Circle/D3Circle';
import * as d3 from 'd3';
import sizeMe from 'react-sizeme';
import SVGPanZoom from 'components/SVGPanZoom';

interface IProjVisProps {
    data?: {
        x: number;
        y: number;
        oldX: number;
        oldY: number;
        color: string;
        id: string;
        keywords: string;
        numEmployees: string;
        revenue: string;
        keywordsScore: number;
        employeesScore: number;
        revenueScore: number;
    }[];

    hoverData?: {
        x: number;
        y: number;
        id: string;
        color: string;
        attribute: string;
    }[][];

    adjMat?: { left: string; right: string; score: number }[];
}

class ProjSVG extends React.Component<IProjVisProps & sizeMe.SizeMeProps> {
    private plot = {
        x: d3.scaleLinear(),
        y: d3.scaleLinear(),
        size: 400,
    };
    private prevPoints: { id: string; x: number; y: number }[];
    private update = { projection: false, prediction: false };
    private htmlEl = { points: [], matrix: [], hoverDots: [] };

    constructor(props: IProjVisProps & sizeMe.SizeMeProps) {
        super(props);

        this.prevPoints = [];
    }

    // onlny redraw the plot when data has changed
    public shouldComponentUpdate(nextProps: any) {
        if (this.props.data !== nextProps.data) this.update.projection = true;
        if (this.props.hoverData !== nextProps.hoverData)
            this.update.prediction = true;

        if (this.update.projection || this.update.prediction) {
            return true;
        } else return false;
    }

    public render() {
        this.prepareVis();

        let vis: React.ReactElement | null = null;
        vis = (
            <g id={'pca-plot'}>
                <g className={'hover-dots'}>{this.htmlEl.hoverDots}</g>
                <g className={'adj-mat'}>{this.htmlEl.matrix}</g>
                <g className={'pca-dots'}>{this.htmlEl.points}</g>
            </g>
        );

        return (
            <div className={'proj-vis-wrapper'}>
                <SVGPanZoom
                    className={'content-svg noselect'}
                    width={'100%'}
                    height={'100%'}
                >
                    {vis}
                </SVGPanZoom>
            </div>
        );
    }

    private prepareVis() {
        console.log('render');

        if (this.props.data && this.props.adjMat && this.update.projection) {
            d3.select('#pca-plot')
                .selectAll('.pca-axes')
                .remove();

            const canvas = d3
                .select('#pca-plot')
                .style(
                    'transform',
                    'translate(-' +
                        this.plot.size / 2 +
                        'px,-' +
                        this.plot.size / 2 +
                        'px)'
                )
                .append('g')
                .attr('class', 'pca-axes');

            this.plot.x = d3
                .scaleLinear()
                .domain([
                    Math.min(
                        d3.min(this.prevPoints, d => {
                            return d.x;
                        }) || Infinity,
                        d3.min(this.props.data, d => {
                            return d.x;
                        }) as number
                    ),
                    Math.max(
                        d3.max(this.prevPoints, d => {
                            return d.x;
                        }) || 0,
                        d3.max(this.props.data, d => {
                            return d.x;
                        }) as number
                    ),
                ])
                .range([0, this.plot.size]);
            canvas
                .append('g')
                .attr('transform', 'translate(0,' + this.plot.size + ')')
                .call(d3.axisBottom(this.plot.x));

            this.plot.y = d3
                .scaleLinear()
                .domain([
                    Math.min(
                        d3.min(this.prevPoints, d => {
                            return d.y;
                        }) || Infinity,
                        d3.min(this.props.data, d => {
                            return d.y;
                        }) as number
                    ),
                    Math.max(
                        d3.max(this.prevPoints, d => {
                            return d.y;
                        }) || 0,
                        d3.max(this.props.data, d => {
                            return d.y;
                        }) as number
                    ),
                ])
                .range([this.plot.size, 0]);
            canvas.append('g').call(d3.axisLeft(this.plot.y));

            // scale for the width of the adjacency lines
            const adjWidth = d3
                .scaleLog()
                .domain(
                    d3.extent(this.props.adjMat, d => {
                        return d.score;
                    }) as any
                )
                .range([0.001, 2]);

            // @ts-ignore
            this.htmlEl.matrix = this.props.adjMat.map(entry => {
                if (this.props.data) {
                    // no line between same object
                    if (entry.left === entry.right) return null;
                    // find left id in data
                    const leftc = this.props.data.find(
                        x => x.id === entry.left
                    );
                    // find right id in data
                    const rightc = this.props.data.find(
                        x => x.id === entry.right
                    );

                    return (
                        <line
                            className={'adj-line'}
                            key={entry.left + entry.right}
                            // @ts-ignore
                            x1={+this.plot.x(leftc.x)}
                            // @ts-ignore
                            y1={+this.plot.y(leftc.y)}
                            // @ts-ignore
                            x2={+this.plot.x(rightc.x)}
                            // @ts-ignore
                            y2={+this.plot.y(rightc.y)}
                            style={{
                                stroke: 'gray',
                                strokeWidth: adjWidth(entry.score),
                                opacity: adjWidth(entry.score) / 4,
                            }}
                        />
                    );
                }

                return null;
            });

            // @ts-ignore
            this.htmlEl.points = this.props.data.map(circle => {
                let rad = 3;
                if (circle.id === 'rootSearch') {
                    rad = 5;
                }

                let oldx = circle.x;
                let oldy = circle.y;

                const obj = this.prevPoints.find(o => o.id === circle.id);
                if (obj) {
                    oldx = obj.x;
                    oldy = obj.y;
                }

                return (
                    <Circle
                        x={this.plot.x(circle.x)}
                        y={this.plot.y(circle.y)}
                        oldX={this.plot.x(oldx)}
                        oldY={this.plot.y(oldy)}
                        r={rad}
                        color={circle.color}
                        key={circle.id}
                        keywords={circle.keywords}
                        numEmployees={circle.numEmployees}
                        revenue={circle.revenue}
                        keywordsScore={circle.keywordsScore}
                        employeesScore={circle.employeesScore}
                        revenueScore={circle.revenueScore}
                        id={circle.id}
                        class={'projection'}
                    />
                );
            });

            // store new points as old for next render call
            this.prevPoints = [];
            this.props.data.forEach(dot => {
                this.prevPoints.push({
                    id: dot.id,
                    x: dot.x,
                    y: dot.y,
                });
            });
            this.update.projection = false;
        }

        if (this.props.hoverData && this.update.prediction) {
            let i = 0;
            // @ts-ignore
            this.htmlEl.hoverDots = this.props.hoverData.map(search => {
                i++;
                return search.map(dot => {
                    // probably more reasonable in the backend
                    // @ts-ignore
                    const realP = this.props.data.find(o => o.id === dot.id);
                    let ox = dot.x;
                    let oy = dot.y;
                    if (realP) {
                        ox = realP.x;
                        oy = realP.y;
                    } // we dont need new points here
                    else return null;

                    //                    let sliderClass = 'prediction-location';
                    //                    if (i < 3) sliderClass = 'prediction-keywords';
                    //                    else if (i > 2 && i < 5) sliderClass = 'prediction-revenue';
                    //                    else if (i > 4 && i < 7) sliderClass = 'prediction-employees';

                    return (
                        <Circle
                            x={this.plot.x(dot.x)}
                            y={this.plot.y(dot.y)}
                            oldX={this.plot.x(ox)}
                            oldY={this.plot.y(oy)}
                            r={5}
                            color={dot.color}
                            key={dot.id}
                            id={dot.id}
                            class={'prediction-' + dot.attribute}
                        />
                    );
                });
            });
            this.update.prediction = false;
        }
    }
}

export default sizeMe({ monitorHeight: true, refreshRate: 20 })(ProjSVG);
