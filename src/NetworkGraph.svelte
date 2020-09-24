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
    import { networkVisibility } from './stores';

    export let nodesInput;
    export let linksInput;

    let width = 600;
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

<div class="modal" class:is-active={$networkVisibility}>
    <div class="modal-background" on:click={() => $networkVisibility = false}></div>
  <div class="modal-card">
    <section class="modal-card-body">
      <div class="chart">
        <div class='chartdiv'></div>
      </div>
    </section>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => $networkVisibility = false}></button>
</div>

<style>
  .modal, .modal-background {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .modal-close {
    -moz-appearance: none;
    -webkit-appearance: none;
    background-color: rgba(10, 10, 10, 0.2);
    border: none;
    border-radius: 290486px;
    cursor: pointer;
    pointer-events: auto;
    display: inline-block;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 0;
    height: 20px;
    max-height: 20px;
    max-width: 20px;
    min-height: 20px;
    min-width: 20px;
    outline: none;
    position: relative;
    vertical-align: top;
    width: 20px;
  }

  .modal-close::before, .modal-close::after {
    background-color: white;
    content: "";
    display: block;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%) rotate(45deg);
    transform-origin: center center;
  }

  .modal-close::before {
    height: 2px;
    width: 50%;
  }

  .modal-close::after {
    height: 50%;
    width: 2px;
  }

  .modal-close:hover, .modal-close:focus {
    background-color: rgba(10, 10, 10, 0.3);
  }

  .modal-close:active {
    background-color: rgba(10, 10, 10, 0.4);
  }

  .is-large.modal-close {
    height: 32px;
    max-height: 32px;
    max-width: 32px;
    min-height: 32px;
    min-width: 32px;
    width: 32px;
  }

  .modal {
    align-items: center;
    display: none;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    position: fixed;
    z-index: 40;
  }

  .modal.is-active {
    display: flex;
  }


  .modal-background {
    background-color: rgba(10, 10, 10, 0.86);
  }

  .modal-card {
    margin: 0 20px;
    max-height: calc(100vh - 160px);
    overflow: auto;
    position: relative;
    width: 100%;
  }

  @media screen and (min-width: 769px), print {
    .modal-card {
      margin: 0 auto;
      max-height: calc(100vh - 40px);
      width: 640px;
    }
  }

  .modal-close {
    background: none;
    height: 40px;
    position: fixed;
    right: 20px;
    top: 20px;
    width: 40px;
  }

  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
    overflow: hidden;
    -ms-overflow-y: visible;
  }

  .modal-card-body {
    -webkit-overflow-scrolling: touch;
    background-color: white;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
    padding: 20px;
  }
</style>


