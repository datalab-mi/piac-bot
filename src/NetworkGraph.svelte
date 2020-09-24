<script>
    import { onMount } from 'svelte';

    import { scaleLinear, scaleOrdinal } from 'd3-scale';
    import { zoom, zoomIdentity } from 'd3-zoom';
    import { schemeCategory10 } from 'd3-scale-chromatic';
    import { select, selectAll } from 'd3-selection';
    import { drag } from 'd3-drag';
    import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
    import {event as currentEvent} from 'd3-selection'
    let d3 = { zoom, zoomIdentity, scaleLinear, scaleOrdinal, schemeCategory10, select, selectAll, drag,  forceSimulation, forceLink, forceManyBody, forceCenter }

    export let nodesInput;
    export let linksInput;

    let width = 1200;
    let height = 600;

    $: links = linksInput.map(d => Object.create(d));
    $: nodes = nodesInput.map(d => Object.create(d));  

    const colourScale = d3.scaleOrdinal(d3.schemeCategory10);

    let simulation, svg;
    onMount(() => {
      simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
      // .force("charge", d3.forceManyBody())
        .force('charge', d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))

      svg = d3.select(".chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      const g = svg.append("g");    // Need container when combininig drag and zoom
      // See example: https://observablehq.com/@d3/drag-zoom

      const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));




      var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")

      var circles = node.append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return colourScale(d.group); })
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      var lables = node.append("text")
        .text((d) => d.id)
        .attr('x', 6)
        .attr('y', 3);

      node.append("title")
        .text(function(d) { return d.id; });

      simulation
        .nodes(nodes)
        .on("tick", ticked);

      simulation.force("link")
        .links(links);


      function ticked() {
        link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        node
          .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          })
      }

    });

    function dragstarted() {
        if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
        currentEvent.subject.fx = currentEvent.x;
        currentEvent.subject.fy = currentEvent.y;
    }

    function dragged() {
        currentEvent.subject.fx = currentEvent.x;
        currentEvent.subject.fy = currentEvent.y;
    }

    function dragended() {
        if (!currentEvent.active) simulation.alphaTarget(0);
        currentEvent.subject.fx = null;
        currentEvent.subject.fy = null;
    }

</script>

<svelte:window />

<div class='chartdiv'></div>
