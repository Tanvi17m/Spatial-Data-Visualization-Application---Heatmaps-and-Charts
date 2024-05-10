import * as d3 from 'd3'
import {selectedContainer} from "@/javascripts/rotation";

let activityTooltip = false
let viewportWidth = window.innerWidth

function applyActivityTooltips () {
  const button = d3.select('#activitybtn')

  if (activityTooltip === true) {
    try {
      d3.selectAll('.d3-tip_new').remove()
      const centroids = document.querySelectorAll('.centroid')
      centroids.forEach((centroid) => {
        d3.select(centroid).style('fill', 'none')
      })
      activityTooltip = false
      button.text('Enable Activity Tooltip')
    } catch (error) {
      console.error('Error while disabling activity tooltips:', error)
    }
  } else {
    try {
      const centroids = document.querySelectorAll('.centroid')

      centroids.forEach((centroid) => {
     //   d3.select(centroid).style('fill', 'black')

        const centroidID = centroid.id

        const regex = /tcs_(\d+)[fF]_/i
        const match = centroidID.match(regex)
        const floorNumber = match ? parseInt(match[1], 10) : null

        const tip = d3
          .select(`#container1`)
          .append('div')
          .attr('id', `tooltip-for-${centroidID}`)
          .attr('class', 'd3-tip_new')

        fillActivityTooltip(tip, centroidID)
        calculateTooltipPositions(centroid, floorNumber)
        const numberPart = selectedContainer.slice("visualization-container".length );
        if (floorNumber != numberPart) {
          tip.style("visibility", "hidden");
        } else {
          d3.select(centroid).style("fill", "black");
        }
      })
      activityTooltip = true
      button.text('Disable Activity Layers')
    } catch (error) {
      console.error('Error while enabling activity tooltips:', error)
    }
  }
}

function calculateTooltipPositions (centroid, floorNumber) {
  try {
    const centroidID = centroid.id
    const rect = centroid.getBoundingClientRect()

    const container = d3.select(`#container1`)
    if (container.empty()) {
      throw new Error(`Container for floor number ${floorNumber} not found.`)
    }

    const containerRectangle = container.node().getBoundingClientRect()

    const position = {
      x: rect.left - containerRectangle.left,
      y: rect.top - containerRectangle.top
    }

    const tooltipId = `tooltip-for-${centroidID}`
    const tooltip = d3.select(`#${tooltipId}`)

    if (!tooltip.empty()) {
      const tooltipHeight = tooltip.node().offsetHeight
      viewportWidth = window.innerWidth

      if (viewportWidth > 768) {
        if (viewportWidth > 992) {
          tooltip
            .style('top', `${position.y - tooltipHeight / 2 - 25}px`)
            .style('left', `${position.x + 33}px`)
        } else {
          tooltip
            .style('top', `${position.y - tooltipHeight / 2 - 18}px`)
            .style('left', `${position.x + 33}px`)
        }
      } else {
        tooltip
          .style('top', `${position.y - tooltipHeight / 2 - 12}px`)
          .style('left', `${position.x + 20}px`)
      }
    }
  } catch (error) {
    console.error('Error calculating tooltip positions:', error.message)
  }
}

function updateTooltipPositions (containerId) {
  const centroids = document.querySelectorAll('.centroid')

  centroids.forEach((centroid) => {
    const centroidID = centroid.id

    let regex = /tcs_(\d+)[fF]_/i
    let match = centroidID.match(regex)
    const floorNumberfromCentroidID = match ? parseInt(match[1], 10) : null

    regex = /(\d+)$/
    match = containerId.match(regex)
    const floorNumberfromContainer = match ? parseInt(match[1], 10) : null

    if (floorNumberfromCentroidID === floorNumberfromContainer) {
      try {
        calculateTooltipPositions(centroid, floorNumberfromContainer)
      } catch (error) {
        console.error(
          `Error updating tooltip position for centroid ${centroidID}:`,
          error
        )
      }
    }
  })
}

function hideTooltipsExcept( containerId ){
    var centroids = document.querySelectorAll(".centroid");
    centroids.forEach((centroid) => {
      const rect = centroid.getBoundingClientRect();

      var centroid_id = centroid.id;

      const regex = /tcs_(\d+)[fF]_/i;
      const match = centroid_id.match(regex);
      var floorNumber = match ? parseInt(match[1], 10) : null;

      const numberPart = containerId.slice(
        "visualization-container".length
      );
      if (floorNumber != numberPart) {
        const tooltipId = `tooltip-for-${centroid_id}`;
        const tooltip = d3.select(`#${tooltipId}`);
        tooltip.style("visibility", "hidden");
        d3.select(centroid).style("fill", "none");
      } else {
        const tooltipId = `tooltip-for-${centroid_id}`;
        const tooltip = d3.select(`#${tooltipId}`);
        tooltip.style("visibility", "visible");
        d3.select(centroid).style("fill", "black");
      }
    });
}

function fillActivityTooltip (tip, centroidID) {
  const words2 = tip.append('p')
  words2.append('p').text(centroidID)
  // words2.append("p").text("Security: ...");
  // words2.append("p").text("Security: ...");
  // words2.append("p").text("Security: ...");
  // words2.append("p").text("Security: ...");
}

export {
  activityTooltip,
  applyActivityTooltips,
  updateTooltipPositions,
  hideTooltipsExcept,
};
