/* Define global constants */
const JSON_URL = "https://raw.githubusercontent.com/ilixandr/iwannaweb.ro/master/projects/rawdata/movie-data.json"
const SVG = {"WIDTH": 1280, "HEIGHT": 960, "PADDING": 100}
const INNER_PADDING = 0.5
const ANIMATION_DURATION = 200
const OPACITY_VISIBLE = 0.85
const OPACITY_INVISIBLE = 0
const COLOR_ARRAY = ["#FF4000", "#FF8000", "#FFFF00", "#40FF00", "#00FF80", "#00BFFF", "#FF00BF"]
const GENRE_ARRAY = ["Action", "Adventure", "Comedy", "Drama", "Animation", "Family", "Biography"]
const LEGEND_DIM = {"WIDTH": 700, "HEIGHT": 50, "CELL_WIDTH": 100, "CELL_HEIGHT": 50}
/* Helper functions */
const colorize = (genre) => {
  switch(genre) {
    case "Action": return COLOR_ARRAY[0];
    case "Adventure": return COLOR_ARRAY[1];
    case "Comedy": return COLOR_ARRAY[2];
    case "Drama": return COLOR_ARRAY[3];
    case "Animation": return COLOR_ARRAY[4];
    case "Family": return COLOR_ARRAY[5];
    default: return COLOR_ARRAY[6];
  }
};
/* Define svg components */
const canvas = d3.select("#canvas")
                 .append("svg")
                 .attr("width", SVG.WIDTH + SVG.PADDING)
                 .attr("height", SVG.HEIGHT + SVG.PADDING);
const tooltip = d3.select("#tooltip");
const legend = d3.select("#legend")
                 .append("svg")
                 .attr("width", LEGEND_DIM.WIDTH)
                 .attr("height", LEGEND_DIM.HEIGHT);
/* Read data from JSON */
d3.json(JSON_URL).then((dataset) => {
  const treemap = d3.treemap()
                    .size([SVG.WIDTH, SVG.HEIGHT])
                    .paddingInner(INNER_PADDING);
  const rootNode = d3.hierarchy(dataset)
                     .sum((d) => d.value)
                     .sort((a, b) => b.height - a.height || b.value - a.value);
  treemap(rootNode);
  const cells = canvas.selectAll("g")
                      .data(rootNode.leaves())
                      .enter()
                      .append("g")
                      .attr("class", "cell")
                      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");
  cells.append("rect")
       .attr("class", "tile")
       .attr("width", (d) => d.x1 - d.x0)
       .attr("height", (d) => d.y1 - d.y0)
       .attr("stroke", "white")
       .attr("data-name", (d) => d.data.name)
       .attr("data-category", (d) => d.data.category)
       .attr("data-value", (d) => d.data.value)
       .attr("fill", (d) => colorize(d.data.category))
       .on("mouseover", (d) => {
      tooltip.transition()
             .duration(ANIMATION_DURATION)
             .style("opacity", OPACITY_VISIBLE);
      tooltip.html("Name: " + d.data.name + "<br/>Genre: " + d.data.category + "<br/><hr>Value: " + d.data.value)
             .attr("data-value", d.data.value)
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY - 25) + "px");
    })
       .on("mouseout", () => {
      tooltip.transition()
             .duration(ANIMATION_DURATION)
             .style("opacity", OPACITY_INVISIBLE);
    });
  cells.append("text")
       .attr('class', 'text')
       .selectAll("tspan")
       .data((d) => d.data.name.split(/(\w*\s*[:\-\.]?\w*\s*[:\-\.]?)/g))
       .enter().append("tspan")
       .attr("x", 2)
       .attr("y", (d, i) => 10 * (1 + i))
       .text((d) => d);
});

legend.selectAll("rect")
      .data(COLOR_ARRAY)
      .enter()
      .append("rect")
      .attr("width", LEGEND_DIM.CELL_WIDTH)
      .attr("height", LEGEND_DIM.CELL_HEIGHT)
      .attr("x", (d, i) => i * LEGEND_DIM.CELL_WIDTH)
      .attr("y", 0)
      .attr("class", "legend-item")
      .attr("stroke", "black")
      .attr("fill", (d) => d);
legend.selectAll("text")
      .data(GENRE_ARRAY)
      .enter()
      .append("text")
      .attr("x", (d, i) => LEGEND_DIM.CELL_WIDTH / 2 + i * LEGEND_DIM.CELL_WIDTH)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text((d) => d)