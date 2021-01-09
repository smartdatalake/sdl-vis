import * as React from 'react';
import sizeMe from 'react-sizeme';

interface Props {
    centeredAtStart?: boolean;
    className?: string;
    contentHeight?: number;
    contentWidth?: number;
    height?: number | string;
    id?: string;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onDoubleClick?: React.MouseEventHandler<SVGSVGElement>;
    width?: number | string;
}

interface State {
    zoomFactor: number;
    panningOffset: { x: number; y: number };
}

class SVGPanZoom extends React.Component<Props & sizeMe.SizeMeProps, State> {
    private svgNodeRef: SVGSVGElement | null = null;

    private dragging = false;
    private hasDragged = false;

    constructor(props: Props & sizeMe.SizeMeProps) {
        super(props);

        this.state = {
            zoomFactor: 1.0,
            panningOffset: { x: 0, y: 0 },
        };

        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const centeredAtStart = this.props.centeredAtStart;
        const contentHeight = this.props.contentHeight || 0;
        const contentWidth = this.props.contentWidth || 0;
        const height = this.props.size.height as number;
        const width = this.props.size.width as number;

        if (centeredAtStart && height && width) {
            this.setState({
                panningOffset: {
                    x: -(width / 2) + contentWidth / 2,
                    y: -(height / 2) + contentHeight / 2,
                },
            });
        }
    }

    componentDidUpdate(prevProps: any) {
        // if SVG was invisible at load time, width & height will be 0
        // this ensures the content is displayed at the center of the screen
        if (
            prevProps.size.width === 0 &&
            prevProps.size.height === 0 &&
            this.props.size.width !== 0 &&
            this.props.size.height !== 0
        ) {
            this.setState({
                panningOffset: {
                    x: -(this.props.size.width || 0) / 2,
                    y: -(this.props.size.height || 0) / 2,
                },
            });
        }
    }

    public render() {
        const { zoomFactor, panningOffset } = this.state;

        const actualWidth = this.props.size.width as number;
        const actualHeight = this.props.size.height as number;

        return (
            <div style={{ width: '100%', height: '100%' }}>
                <svg
                    viewBox={`${panningOffset.x} ${
                        panningOffset.y
                    } ${actualWidth * zoomFactor} ${actualHeight * zoomFactor}`}
                    width={this.props.width}
                    height={this.props.height}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onWheel={this.handleMouseWheel}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove}
                    onClick={this.handleClick}
                    onDoubleClick={this.props.onDoubleClick}
                    id={this.props.id}
                    className={this.props.className}
                    ref={node => (this.svgNodeRef = node)}
                >
                    {this.props.children}
                </svg>
            </div>
        );
    }

    private handleMouseWheel(e: React.WheelEvent<SVGSVGElement>) {
        if (this.svgNodeRef !== null) {
            const { panningOffset, zoomFactor } = this.state;

            let zoomFactorNew: number;
            const panningOffsetNew = { x: 0, y: 0 };

            const rect = this.svgNodeRef.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (e.deltaY > 0) {
                zoomFactorNew = zoomFactor * Math.abs(1.1);

                panningOffsetNew.x =
                    panningOffset.x -
                    mouseX * zoomFactorNew +
                    mouseX * zoomFactor;
                panningOffsetNew.y =
                    panningOffset.y -
                    mouseY * zoomFactorNew +
                    mouseY * zoomFactor;
            } else {
                zoomFactorNew = zoomFactor / Math.abs(1.1);

                panningOffsetNew.x =
                    panningOffset.x +
                    mouseX * zoomFactor -
                    mouseX * zoomFactorNew;
                panningOffsetNew.y =
                    panningOffset.y +
                    mouseY * zoomFactor -
                    mouseY * zoomFactorNew;
            }

            this.setState({
                zoomFactor: zoomFactorNew,
                panningOffset: panningOffsetNew,
            });
        }
    }

    private handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
        if (e.buttons === 1) this.dragging = true;
        this.hasDragged = false;
    }

    private handleMouseUp(e: React.MouseEvent<SVGSVGElement>) {
        this.dragging = false;
    }

    private handleClick(e: React.MouseEvent<SVGSVGElement>) {
        // Do not react on click if this was a dragging operation
        if (!this.hasDragged && this.props.onClick) {
            this.props.onClick(e);
        }
    }

    private handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
        // Exit dragging if cursor was not in window during MouseUp event
        if (e.buttons !== 1) {
            this.dragging = false;
        }

        if (this.dragging) {
            const { x, y } = this.state.panningOffset;
            this.hasDragged = true;

            this.setState({
                panningOffset: {
                    x: x - e.movementX * this.state.zoomFactor,
                    y: y - e.movementY * this.state.zoomFactor,
                },
            });

            e.stopPropagation();
        }
    }
}

export default sizeMe({ monitorHeight: true })(SVGPanZoom);
