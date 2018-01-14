
// --------------- SVG

// COMMAND (CTRL) + CLICK
// COMMAND + D
// COMMAND + CTRL + G
const dataSet = [
  [ 0.5       ,  0.5       ],
  [ 0.525     ,  0.475     ],
  [ 0.54987531,  0.45012469],
  [ 0.57450372,  0.42549628],
  [ 0.59876786,  0.40123214],
  [ 0.62255739,  0.37744261],
  [ 0.64577086,  0.35422914],
  [ 0.66831729,  0.33168271]
];

// setup
const svg = d3.select('svg');

const height = 400;
const width = 600;
const leftGutter = 30;
const bottomGutter = 20;

svg.attr('height', height);
svg.attr('width', width);

// scales
const heights = dataSet.map(function (level) {
  return level[0];
});

const yScale = d3.scaleLinear()
.domain([
  d3.max(heights),
  d3.min(heights)
])
.range([20, height - bottomGutter - 20]);

const levels = dataSet.map(function (level, i) {
  return i;
});

const xScale = d3.scaleBand()
.domain(levels)
.range([0 + leftGutter, width - 20])
.padding(20);

// data join
const bars = svg.selectAll('rect').data(dataSet);

bars.enter()
  .append('rect')
  .attr('width', 30)
  .attr('height', 50)
  .attr('transform', function (d) {
    return 'translate(0, ' + yScale(height) + ')';
  });
  // .attr('height', function (level) {
  //   return level[0];
  // });

// axes
svg
.append('g')
.call(d3.axisLeft(yScale))
.attr('transform', 'translate(' + leftGutter + ', 0)');

svg
.append('g')
.call(d3.axisBottom(xScale))
.attr('transform', 'translate(0, ' + (height - bottomGutter) + ')');

console.log(getData());
