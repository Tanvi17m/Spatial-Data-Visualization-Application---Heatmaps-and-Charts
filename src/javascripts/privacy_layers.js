import * as d3 from 'd3'
import { heatmap, removeHeatmap } from '@/javascripts/heatmap_utils'

const colors = generateColorPalette('#FA0101', '#3966EB', 10)
let cardinalityLayer = false

function generateGradientColors (startColor, endColor, weight) {
  const startRGB = parseInt(startColor.slice(1), 16)
  const endRGB = parseInt(endColor.slice(1), 16)
  const [r1, g1, b1] = [
    (startRGB >> 16) & 0xff,
    (startRGB >> 8) & 0xff,
    startRGB & 0xff
  ]
  const [r2, g2, b2] = [
    (endRGB >> 16) & 0xff,
    (endRGB >> 8) & 0xff,
    endRGB & 0xff
  ]

  const r = Math.round(r1 + (r2 - r1) * (weight / 100))
  const g = Math.round(g1 + (g2 - g1) * (weight / 100))
  const b = Math.round(b1 + (b2 - b1) * (weight / 100))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function generateColorPalette (startColor, endColor, numberOfBuckets) {
  const gradientColors = []
  for (let i = 0; i < numberOfBuckets; i++) {
    const weight = (i / (numberOfBuckets - 1)) * 100
    gradientColors.push(generateGradientColors(startColor, endColor, weight))
  }
  return gradientColors
}

function removeCardinalityLayers () {
  d3.selectAll('.cardinality').style('fill', 'none')
  cardinalityLayer = false
  d3.select('#cardinalitybtn').text('Enable Privacy Layers')
}

function applyCardinalityLayers () {
  if (heatmap === true) {
    //removeHeatmap()
  }
  const button = d3.select('#cardinalitybtn')
  if (cardinalityLayer === true) {
    removeCardinalityLayers()
  } else {
    const cardinalities = d3.selectAll('.cardinality')

    cardinalities.each(function () {
      const weight = Math.random() * 100
      let bucket = Math.floor(weight / 10)
      bucket = bucket === 10 ? 9 : bucket
      d3.select(this).style('fill', colors[bucket]).style('opacity', '0.6')
    })

    cardinalityLayer = true
    button.text('Disable Privacy Layers')
  }
}

export { cardinalityLayer, applyCardinalityLayers, removeCardinalityLayers }
