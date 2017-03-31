const React = require('react');
const IdyllComponent = require('idyll-component');
const Animate = require('victory-core').VictoryAnimation;
const Line = require('victory').VictoryLine;
const d3 = require('d3-scale');
const d3Shape = require('d3-shape');
const d3Arr = require('d3-array');

const polarToCartesian = (centerX, centerY, radius, angle) => {
  return {
    x: centerX + (radius * Math.cos(angle)),
    y: centerY + (radius * Math.sin(angle))
  };
}

const describeArc = (x, y, radius, startAngle, endAngle) => {
    var start = polarToCartesian(x, y, radius, startAngle);
    var end = polarToCartesian(x, y, radius, endAngle);

    var largeArcFlag = startAngle < -Math.PI ? 1 : 0;
    var sweepFlag = startAngle < -Math.PI ? 1 : 1;

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
    ].join(" ");

    return d;
}

const getPath = (f) => {
  const line = d3Shape.line().x((d) => d).y((d) =>  f(d));
  return line(d3Arr.range(-Math.PI, Math.PI, 0.001));
}

const functionDisplay = (f, theta, scaleY) => {
  return null;
  scaleY = scaleY || 1;
  return (
    <svg viewBox={`${-Math.PI} ${-1.01 * scaleY} ${2 * Math.PI} ${2 * 1.01 * scaleY}`} preserveAspectRatio={'none'}>
      <path d={getPath(f)}  />
      <line x1={theta} x2={theta} y1={-1} y2={1} />
    </svg>
  );
}

const WIDTH = 3;
const CENTER = WIDTH / 2;

const formatNumber = (x, n) => {
  return x.toFixed(n);
};

class TrigDisplay extends IdyllComponent {

  constructor(props) {
    super(props);
    this.state = {
      thetaFixed: false,
      fFixed: false
    }
  }

  renderStage(stage) {
    const theta = this.state.thetaFixed || this.props.theta;
    switch(stage) {
      case 'sin':
        return <SinOverlay theta={theta} />;
      case 'cos':
        return <CosOverlay theta={theta} />;
      case 'tan':
        return <TanOverlay theta={theta} />;
      case 'cotan':
        return <CotanOverlay theta={theta} />;
      case 'sec':
        return <SecOverlay theta={theta} />;
      case 'cosec':
        return <CosecOverlay theta={theta} />;
      case 'chord':
        return <ChordOverlay theta={theta} />;
    }
  }

  handleClick(evt) {
    if (this.state.thetaFixed) {
      this.setState({
        thetaFixed: false
      })
    } else {
      this.pt.x = evt.clientX;
      this.pt.y = evt.clientY;
      const loc =  this.pt.matrixTransform(this.svg.getScreenCTM().inverse());
      loc.x -= CENTER;
      loc.y = CENTER - loc.y;
      const theta = Math.atan2(loc.y, loc.x);
      this.setState({
        thetaFixed: theta
      });
    }
  }

  handleMouseMove(evt) {
    if (this.state.thetaFixed) {
      return;
    }
    this.pt.x = evt.clientX;
    this.pt.y = evt.clientY;
    const loc =  this.pt.matrixTransform(this.svg.getScreenCTM().inverse());
    loc.x -= CENTER;
    loc.y = CENTER - loc.y;
    const theta = Math.atan2(loc.y, loc.x);
    this.updateProps({
      theta: theta
    });
  }

  handleStatMouseover(name) {
    return (evt) => {
      this.updateProps({
        stage: name
      });
    }
  }

  handleStatClick(name) {
    return (evt) => {
      if (this.state.fFixed === name) {
        this.setState({
          fFixed: false
        });
      } else {
        this.setState({
          fFixed: name
        });
      }
    }
  }

  handleMouseLeaveStates(evt) {
    this.updateProps({
      stage: this.state.fFixed
    });
  }

  render() {
    const { stage } = this.props;

    const stats = [
      {name: 'sin', f: Math.sin},
      {name: 'cos', f: Math.cos},
      {name: 'tan', f: Math.tan},
      {name: 'cotan', f: (x) => 1 / Math.tan(x)},
      {name: 'sec', f: (x) => 1 / Math.cos(x)},
      {name: 'cosec', f: (x) => 1 / Math.sin(x)}
    ]

    const theta = this.state.thetaFixed || this.props.theta;
    const arcTheta = theta > 0 ? theta : (theta + 2 * Math.PI);

    return (
      <div style={{maxWidth: 600, margin: '0 auto'}}>
        <svg viewBox={`0 0 ${WIDTH} ${WIDTH}`} className={'trig-display'} onClick={this.handleClick.bind(this)} onMouseMove={this.handleMouseMove.bind(this)} ref={(svg) => {if (!svg) return; this.svg = svg; this.pt = svg.createSVGPoint()}}>
          <g>
            <g>
              <line x1={0} y1={CENTER} x2={WIDTH} y2={CENTER} style={{strokeWidth: 1, stroke:'#ddd'}} />
              <line x1={CENTER} y1={0} x2={CENTER} y2={WIDTH} style={{strokeWidth: 1, stroke:'#ddd'}} />
              <path d={describeArc(CENTER, CENTER, 0.15, -arcTheta, 0)} style={{strokeWidth: 1, stroke: 'black'}} strokeDasharray='3, 3' />
            </g>
            <circle cx={CENTER} cy={CENTER} r={1} />
            <text x={CENTER} y={CENTER} >θ</text>
            <line x1={CENTER} y1={CENTER} x2={CENTER + Math.cos(theta)} y2={CENTER - Math.sin(theta)} style={{strokeWidth: 1}} />
            {
              this.state.thetaFixed ?
                (<circle cx={CENTER + Math.cos(theta)} cy={CENTER - Math.sin(theta)} r={0.02} style={{fill: 'black'}} />) : null
            }
            <g>
              {this.renderStage(stage)}
            </g>
          </g>
        </svg>
        <div className={'stats-container'} onMouseLeave={this.handleMouseLeaveStates.bind(this)}>
          {stats.map((stat) => {
            let className = '';
            if (stage === stat.name) {
              className += 'selected';
            }
            if (this.state.fFixed && stage === this.state.fFixed && stat.name === this.state.fFixed) {
              className += ' sticky';
            }
            return (
              <div
                onMouseEnter={this.handleStatMouseover(stat.name)}
                onClick={this.handleStatClick(stat.name)}
                className={className}
                >
                  {stat.name}({formatNumber(theta, 2)}) = {formatNumber(stat.f(theta), 4)}
              </div>
            );
          })
          }
        </div>
        <div className={'instructions'}>
          Click to select angle or function
        </div>
      </div>
    );
  }
}

const overlayGenerator = (defaultState, initial, end, color) => {
  const initialState = Object.assign({}, defaultState, initial);
  const endState = Object.assign({}, defaultState, end);

  class Overlay extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        progress: 0
      };
    }

    render() {
      const { theta } = this.props;
      const scales = {
        x1: d3.scaleLinear().range([initialState.x1(theta), endState.x1(theta)]),
        x2: d3.scaleLinear().range([initialState.x2(theta), endState.x2(theta)]),
        y1: d3.scaleLinear().range([initialState.y1(theta), endState.y1(theta)]),
        y2: d3.scaleLinear().range([initialState.y2(theta), endState.y2(theta)])
      };
      return (
        <Animate data={{progress: this.state.progress}}>
          {
            ((tweenedProps, animationInfo) => {
              const { progress } = tweenedProps;
              return (
                <g ref={() => { this.setState({progress: 1}) }}>
                  <line  style={{stroke: color}} x1={scales.x1(progress)} y1={scales.y1(progress)} x2={scales.x2(progress)} y2={scales.y2(progress)} />
                  <circle style={{fill: color}} cx={scales.x1(progress)} cy={scales.y1(progress)} r={0.01} />
                  <circle style={{fill: color}} cx={scales.x2(progress)} cy={scales.y2(progress)} r={0.01} />
                </g>
              );
            })
          }
        </Animate>
      );
    }
  }
  return Overlay;
}

const SinOverlay = overlayGenerator({
  x1: (x) => CENTER + Math.cos(x),
  x2: (x) => CENTER + Math.cos(x),
  y1: (x) => CENTER
}, {
  y2: (x) => CENTER
}, {
  y2: (x) => CENTER - Math.sin(x)
}, 'red');

const CosOverlay = overlayGenerator({
  x1: (x) => CENTER,
  y1: (x) => CENTER - Math.sin(x),
  y2: (x) => CENTER - Math.sin(x),
}, {
  x2: (x) => CENTER
}, {
  x2: (x) => CENTER + Math.cos(x)
}, 'blue');

const TanOverlay = overlayGenerator({
  x1: (x) => CENTER + Math.cos(x),
  y1: (x) => CENTER - Math.sin(x)
}, {
  x2: (x) => CENTER + Math.cos(x),
  y2: (x) => CENTER - Math.sin(x)
}, {
  x2: (x) => CENTER + 1 / Math.cos(x),
  y2: (x) => CENTER
}, 'green');

const CotanOverlay = overlayGenerator({
  x1: (x) => CENTER + Math.cos(x),
  y1: (x) => CENTER - Math.sin(x)
}, {
  x2: (x) => CENTER + Math.cos(x),
  y2: (x) => CENTER - Math.sin(x)
}, {
  x2: (x) => CENTER,
  y2: (x) => CENTER - 1 / Math.sin(x)
}, 'green');

const SecOverlay = overlayGenerator({
  x1: (x) => CENTER,
  y1: (x) => CENTER,
  y2: (x) => CENTER
}, {
  x2: (x) => CENTER
}, {
  x2: (x) => CENTER + 1 / Math.cos(x)
}, 'red');

const CosecOverlay = overlayGenerator({
  x1: (x) => CENTER,
  y1: (x) => CENTER,
  x2: (x) => CENTER
}, {
  y2: (x) => CENTER
}, {
  y2: (x) => CENTER - 1 / Math.sin(x)
}, 'green');


class ChordOverlay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    };
  }

  render() {
    const { theta } = this.props;
    const defaultState =  {
      x1: (x) => CENTER + Math.cos(x),
      x2: (x) => CENTER + Math.cos(x),
      y1: (x) => CENTER - Math.sin(x)
    };
    const initialState = Object.assign({}, {
      y2: (x) => CENTER - Math.sin(x)
    }, defaultState);
    const endState = Object.assign({}, {
      y2: (x) => CENTER
    }, defaultState);

    const scales = {
      x1: d3.scaleLinear().range([initialState.x1(theta), endState.x1(theta)]),
      x2: d3.scaleLinear().range([initialState.x2(theta), endState.x2(theta)]),
      y1: d3.scaleLinear().range([initialState.y1(theta), endState.y1(theta)]),
      y2: d3.scaleLinear().range([initialState.y2(theta), endState.y2(theta)]),
      theta: d3.scaleLinear().range([0, theta]),
    };

    return (
      <g>
        <line x1={CENTER} y1={CENTER} x2={CENTER + Math.cos(theta)} y2={CENTER + Math.sin(theta)} style={{strokeWidth: 1}} />
        <line x1={CENTER + Math.cos(theta)} y1={CENTER - Math.sin(theta)} x2={CENTER + Math.cos(theta)} y2={CENTER + Math.sin(theta)} style={{strokeWidth: 1, stroke: 'gray'}} />

        <Animate data={{progress: this.state.progress}}>
          {
            ((tweenedProps, animationInfo) => {
              const { progress } = tweenedProps;

              return (
                <g ref={() => { this.setState({progress: 1}) }}>
                  <line  style={{stroke: 'orange'}} x1={scales.x1(progress)} y1={scales.y1(progress)} x2={scales.x2(progress)} y2={scales.y2(progress)} />
                  <circle style={{fill: 'orange'}} cx={scales.x1(progress)} cy={scales.y1(progress)} r={0.01} />
                  <circle style={{fill: 'orange'}} cx={scales.x2(progress)} cy={scales.y2(progress)} r={0.01} />
                </g>
              );
            })
          }
        </Animate>
      </g>
    );
  }
}

TrigDisplay.defaultProps = {
  theta: Math.PI / 4,
  overlays: ['cos']
};

module.exports = TrigDisplay;