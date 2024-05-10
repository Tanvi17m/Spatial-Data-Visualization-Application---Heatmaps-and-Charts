// pslider = false
// function checkReady() {
//
//     if ($.find('svg').length != 4) {
//         setTimeout(checkReady, 30);
//     } else {
//         fillsvg()
//     }
//
//   }
// checkReady()
import * as d3 from 'd3'
import { activityTooltip } from '@/javascripts/tooltips.js'

let selectedMite = '---'
let selectedRoom = '---'
let selectedCardinality = '---'

let tip
let words

let mitesHidden = false;

function resetSelections () {
  if (selectedRoom) d3.select('#' + selectedRoom).style('fill', 'white')
  if (selectedMite) d3.select('#' + selectedMite).style('fill', 'lightseagreen')
  d3.selectAll('.cardinality').style('stroke', 'none').style('stroke-width', '0px')
}

function updateInfoPanel (elem) {
  words.text(elem.attr('id'))
  words.append('p').text('Security: ...') // Assuming 'words' is a d3 selection for an information panel
}

function updateElementStyles (elem, event) {
  const elemClass = elem.attr('class')
  const elemId = elem.attr('id')

  if (elemClass === 'mite' && elemId !== selectedMite) {
    elem.transition().duration(100).style('fill', 'red')
    selectedMite = elemId
  } else if (elemClass === 'room') {
    elem.transition().duration(100).style('fill', 'gray')
    selectedRoom = elemId
  } else if (elemClass === 'cardinality') {
    handleCardinalitySelection(elem)
  }

  updateTooltipPosition(event)
}

function handleCardinalitySelection (elem) {
  selectedCardinality = elem.attr('id')
  const borderWidth = getBorderWidthForFloor(selectedCardinality)
  elem.transition().duration(100).style('stroke', 'black').style('stroke-width', borderWidth)
}

function getBorderWidthForFloor (cardinalityId) {
  const floorClass = cardinalityId.split(' ').find(cls => cls.includes('f_'))
  const floor = floorClass.substring(0, floorClass.indexOf('f') + 1)

  switch (floor) {
    case '1f': return '5px'
    case '2f': return '20px'
    case '3f': return '4px'
    case '4f': return '7px'
    default: return '5px' // Default border width
  }
}

function updateTooltipPosition (event) {
  const viewportWidth = window.innerWidth
  const { top, left } = getTooltipPosition(event, viewportWidth)
  tip.style('top', top).style('left', left)
  tip.style('visibility', activityTooltip ? 'hidden' : 'visible')
}

function getTooltipPosition (event, viewportWidth) {
  const isTouchEvent = event.touches && event.touches.length > 0

  const pageX = isTouchEvent ? event.touches[0].pageX : event.pageX
  const pageY = isTouchEvent ? event.touches[0].pageY : event.pageY

  let yOffset = 40 // Default yOffset for small screens
  let xOffset = 25 // Default xOffset for small screens

  if (viewportWidth > 992) {
    yOffset = 75
    xOffset = 60
  } else if (viewportWidth > 768) {
    yOffset = 45
    xOffset = 30
  }
  // Calculate tooltip positions
  const top = `${pageY - yOffset}px`
  const left = `${pageX + xOffset}px`
  return { top, left }
}

function handleInteraction (event) {
  event.preventDefault()
  event.stopPropagation()

  resetSelections()

  const elem = d3.select(this)
  updateInfoPanel(elem)
  updateElementStyles(elem, event)
}

function fillFloor1 () {
  // mites in floor 1
  const mites2 = d3.select('#svg1').selectAll('.mite')
  const rangeLayer = d3.select('#svg1').append('g')
  // encircles each element with radius
  mites2.each(function () {
    const element = d3.select(this)
    rangeLayer
      .append('circle')
      .attr('cx', element.attr('cx'))
      .attr('cy', element.attr('cy'))
      .attr('r', 17)
      .attr('id', element.attr('id') + '_range')
      .attr('class', 'mite-range')
      .style('stroke', 'pink')
      .style('fill', 'none')
      .style('stroke-width', 1)
  })

  const centroidLayer = d3.select('#svg1').append('g')
  const url = 'src/assets/centroids_floor1.json'
  fetch(url)
    .then(response => response.json())
    .then(data => {
      Object.entries(data).forEach(([key, dataPoint]) => {
        centroidLayer
          .append('circle')
          .attr('cx', dataPoint.x + 55)
          .attr('cy', dataPoint.y + 30)
          .attr('r', 5)
          .attr('id', key)
          .attr('class', 'centroid')
          .style('stroke', 'none')
          .style('fill', 'none')
          .style('stroke-width', 1)
      })
    })
}

function fillFloor2 () {
  // mites in floor 2
  const mites2 = d3.select('#svg2').selectAll('.mite')
  const rangeLayer = d3.select('#svg2').append('g')
  // encircles each element with radius
  mites2.each(function () {
    const element = d3.select(this)
    rangeLayer
      .append('circle')
      .attr('cx', element.attr('cx'))
      .attr('cy', element.attr('cy'))
      .attr('r', 50)
      .attr('id', element.attr('id') + '_range')
      .attr('class', 'mite-range')
      .style('stroke', 'pink')
      .style('fill', 'none')
      .style('stroke-width', 4)
  })

  const centroidLayer2 = d3.select('#svg2').append('g')
  const url = 'src/assets/updated_centroids_floor2.json'
  fetch(url)
    .then(response => response.json())
    .then(data => {
      Object.entries(data).forEach(([key, dataPoint]) => {
        centroidLayer2
          .append('circle')
          .attr('cx', dataPoint.x)
          .attr('cy', dataPoint.y)
          .attr('r', 20)
          .attr('id', key)
          .attr('class', 'centroid')
          .style('stroke', 'none')
          .style('fill', 'none')
          .style('stroke-width', 1)
      })
    })
}

function fillFloor3 () {
  // mites in floor 3
  const mites2 = d3.select('#svg3').selectAll('.mite')
  const rangeLayer = d3.select('#svg3').append('g')
  // encircles each element with radius
  mites2.each(function () {
    const element = d3.select(this)
    rangeLayer
      .append('circle')
      .attr('cx', element.attr('cx'))
      .attr('cy', element.attr('cy'))
      .attr('r', 10)
      .attr('id', element.attr('id') + '_range')
      .attr('class', 'mite-range')
      .style('stroke', 'pink')
      .style('fill', 'none')
      .style('stroke-width', 1)
  })

  const centroidLayer3 = d3.select('#svg3').append('g')
  const url = 'src/assets/updated_centroids_floor3.json'
  fetch(url)
    .then(response => response.json())
    .then(data => {
      Object.entries(data).forEach(([key, dataPoint]) => {
        centroidLayer3
          .append('circle')
          .attr('cx', dataPoint.x)
          .attr('cy', dataPoint.y)
          .attr('r', 3)
          .attr('id', key)
          .attr('class', 'centroid')
          .style('stroke', 'none')
          .style('fill', 'none')
          .style('stroke-width', 1)
      })
    })
}

function fillFloor4 () {
  // mites in floor 4
  const mites2 = d3.select('#svg4').selectAll('.mite')
  const rangeLayer = d3.select('#svg4').append('g')
  // encircles each element with radius
  mites2.each(function () {
    const element = d3.select(this)
    rangeLayer
      .append('circle')
      .attr('cx', element.attr('cx'))
      .attr('cy', element.attr('cy'))
      .attr('r', 20)
      .attr('id', element.attr('id') + '_range')
      .attr('class', 'mite-range')
      .style('stroke', 'pink')
      .style('fill', 'none')
      .style('stroke-width', 1)
  })

  const centroidLayer4 = d3.select('#svg4').append('g')
  const url = 'src/assets/updated_centroids_floor4.json'
  fetch(url)
    .then(response => response.json())
    .then(data => {
      Object.entries(data).forEach(([key, dataPoint]) => {
        centroidLayer4
          .append('circle')
          .attr('cx', dataPoint.x)
          .attr('cy', dataPoint.y)
          .attr('r', 7)
          .attr('id', key)
          .attr('class', 'centroid')
          .style('stroke', 'none')
          .style('fill', 'none')
          .style('stroke-width', 1)
      })
    })
}

function transformSVGs () {
  // floor 1
  d3.select('#svg1')
  // .attr("transform", "scale(2)") //' translate(-230,-980)')
    .attr('transform', 'scale(1)')
  // .attr("viewBox", "469 -200 50 951")
    .attr('viewBox', '80 180 850 200')
    .style('background-color', 'white')
    .style('object-fit', 'cover')

  // floor 2
  d3.select('#svg2')
    .attr('viewBox', '50 -700 1100 1800')
    .attr('transform', 'scale(1) translate(0,0)')
    .style('background-color', 'white')
    .style('object-fit', 'cover')

  // floor 3
  d3.select('#svg3')
    .attr('transform', 'scale(2.1)') // ' translate(-40,270)')
    // .attr("viewBox", "80 180 850 200")
    .style('object-fit', 'cover')

  // floor 4
  d3.select('#svg4')
    .attr('transform', 'scale(1)') // ' translate(920,-2470)')
    .attr('viewBox', '-69 -69 1100 550')
    .style('background-color', 'white')
    .style('object-fit', 'cover')
}
function handleClickOutside(){
  tip = d3.select(".d3-tip");
  tip.style('visibility', 'hidden')

  const allmites = d3.selectAll(".mite");
  const rooms = d3.selectAll(".room");
  
  rooms.style("fill", "white");
  allmites.style("fill", "lightseagreen");
}

function fillsvg () {
  document.addEventListener("click",handleClickOutside);

  tip = d3.select('.d3-tip')
  words = tip.append('p')
  tip.append('div').attr('id', 'tipDiv')

  const svg = d3.select('#svg3')
  svg.attr('transform', 'scale(1.3)')

  const allmites = d3.selectAll('.mite')
  const rooms = d3.selectAll('.room')
  const cardinalities = d3.selectAll('.cardinality')

  // Change the input color for the room.
  rooms.style('fill', 'white')
  allmites.style('fill', 'lightseagreen')
  cardinalities.style('stroke', 'none').style('stroke-width', 0)

  tip
    .style('border', 'solid')
    .style('padding', '5px')
    .style('position', 'absolute')
    .style('z-index', '20')
    .style('color', 'black')

  // //highlights selected mite and selects it for any graphing visualizations
  rooms.on('click', handleInteraction)
  rooms.on('touchstart', handleInteraction)

  allmites.on('click', handleInteraction)
  allmites.on('touchstart', handleInteraction)

  cardinalities.on('click', handleInteraction)
  cardinalities.on('touchstart', handleInteraction)

  fillFloor1()
  fillFloor2()
  fillFloor3()
  fillFloor4()

  transformSVGs()
}

function hideMites(){
  if (mitesHidden == false) {
    const allmites = d3.selectAll(".mite");
    allmites.style("fill", "none");

    const ranges = d3.selectAll(".mite-range");
    ranges.style("stroke", "none");

    mitesHidden = true;
  } else {
    const allmites = d3.selectAll(".mite");
    allmites.style("fill", "lightseagreen");

    const ranges = d3.selectAll(".mite-range");
    ranges.style("stroke", "pink");

    mitesHidden = false;
  }
}

export {
  fillsvg,
  hideMites,
  tip
}
