 document.addEventListener("DOMContentLoaded", function(event) {

var width = document.body.clientWidth;
var height = document.body.clientHeight;


var svg = d3.select("body")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
        .append("g");

var color = d3.scaleOrdinal(d3.schemeCategory10);

function icon(type) {
    if (type === "bookmark") return "\uf1fa";
    if (type === "tag") return "\uf02b";
    return "";
}
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(1).strength(0.8))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));


// Access the bookmarks
// Unfortunately, no API to access tags :-/  cf https://bugzilla.mozilla.org/show_bug.cgi?id=1225916
//
//function makeIndent(indentLength) {
//  return ".".repeat(indentLength);
//}
//
//function logItems(bookmarkItem, indent) {
//  if (bookmarkItem.url) {
//    console.log(makeIndent(indent) + bookmarkItem.url);
//  } else {
//    console.log(makeIndent(indent) + "Folder");
//    indent++;
//  }
//  if (bookmarkItem.children) {
//    for (child of bookmarkItem.children) {
//      logItems(child, indent);
//    }
//  }
//  indent--;
//}
//
//function logTree(bookmarkItems) {
//  logItems(bookmarkItems[0], 0);
//}
//
//function onRejected(error) {
//  console.log(`An error: ${error}`);
//}
//
//var gettingTree = browser.bookmarks.getTree();
//gettingTree.then(logTree, onRejected);

d3.json(browser.extension.getURL("resources.d3.json"), function(error, graph) {
  if (error) throw error;

  var nodes = graph.nodes,
      nodeById = d3.map(nodes, function(d) { return d.id; }),
      links = graph.links,
      bilinks = [];

  links.forEach(function(link) {
    var s = link.source = nodeById.get(link.source),
        t = link.target = nodeById.get(link.target),
        i = {}; // intermediate node
    nodes.push(i);
    links.push({source: s, target: i}, {source: i, target: t});
    bilinks.push([s, i, t]);
  });

  var link = svg.selectAll(".link")
    .data(bilinks)
    .enter().append("path")
      .attr("class", "link")
      .attr('stroke', "#bbb")
      .attr('stroke-width', function(d) { return d.thickness; });

  var node = svg.selectAll(".node")
    //.data(nodes.filter(function(d) { return d.type === "bookmark"; }))
    .data(nodes.filter(function(d) { return d.id; }))
    .enter().append("text")
        .attr("class", "node")
        .attr('font-family', 'FontAwesome')
        //.attr('font-size', function(d) { return d.size+'em'} )
        .attr('font-size', '20pt')
        .attr("fill", function(d) { return color(d.group); })
        .text(function(d) { return icon(d.type)}) 
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
//  var node = svg.selectAll(".node")
//    //.data(nodes.filter(function(d) { return d.type === "bookmark"; }))
//    .data(nodes.filter(function(d) { return d.id; }))
//    .enter().append("circle")
//      .attr("class", "node")
//      .attr("r", 10)
//      .attr("fill", function(d) { return color(d.group); })
//      .call(d3.drag()
//          .on("start", dragstarted)
//          .on("drag", dragged)
//          .on("end", dragended));
//
//    node.data(nodes.filter(function(d) { return d.type === "tag"; }))
//    .enter().append("rect")
//      .attr("class", "node")
//      .attr("width", 30)
//      .attr("height", 20)
//      .attr("fill", function(d) { return color(d.group); })
//      .call(d3.drag()
//          .on("start", dragstarted)
//          .on("drag", dragged)
//          .on("end", dragended));
//

  node.append("title")
      .text(function(d) { return d.label; });

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

  function ticked() {
    link.attr("d", positionLink);
    node.attr("transform", positionNode);
  }
});

function positionLink(d) {
  return "M" + d[0].x + "," + d[0].y
       + "S" + d[1].x + "," + d[1].y
       + " " + d[2].x + "," + d[2].y;
}

function positionNode(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x, d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x, d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null, d.fy = null;
}

});
