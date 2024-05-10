import Heatmap from 'heatmap.js'
import * as d3 from 'd3'
import {
  cardinalityLayer,
  removeCardinalityLayers
} from '@/javascripts/privacy_layers'

let heatmap = false
const heatmapInstances = []

function removeHeatmap () {
  for (let i = 1; i <= 4; i++) {
    heatmapInstances[i].setData({ data: [] })
    heatmapInstances[i].repaint()
  }
  heatmap = false

  const button = d3.select('#heatmapbtn')
  button.text('Enable Heatmap')

  const legend = d3.select('#legend-container')
  legend.style('visibility', 'hidden')
}

function applyHeatmap (newDataPoints) {
  // if (cardinalityLayer === true) {
  //   removeCardinalityLayers()
  // }
  // if (heatmap === true) {
  //   removeHeatmap()
  // } else {
    if(newDataPoints.length){
       initHeatmapForFloor(1, newDataPoints[0]);
       initHeatmapForFloor(2, newDataPoints[1]);
       initHeatmapForFloor(3, newDataPoints[2]);
       initHeatmapForFloor(4, newDataPoints[3]);
    }

//    heatmap = true

    // const button = d3.select('#heatmapbtn')
    // button.text('Disable Heatmap')

    // const legend = d3.select('#legend-container')
    // legend.style('visibility', 'visible')
//  }
}

function applyHeatmapLive(){
  for(let i = 1; i <= 4; i++){
    const url = `src/assets/mites_coordinates_floor${i}_updated.json`;
  
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let newDataPoints = Object.values(data);
        initHeatmapForFloor(i, newDataPoints);
      });
  }
}

function applyHeatmapInterval () {
  if (heatmap === true) {
    initHeatmapForFloor(1)
    initHeatmapForFloor(2)
    initHeatmapForFloor(3)
    initHeatmapForFloor(4)
  }
}

function processAndAddDataPoints (dataPoints, setData, scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor) {
  dataPoints.forEach(dataPoint => {
    const tempDataPoint = {
      x: scaleXFactor * dataPoint.x - subtractXFactor,
      y: scaleYFactor * dataPoint.y - subtractYFactor,
      value: dataPoint.value + Math.random() * 10
    }
    setData.push(tempDataPoint)
  })
}

function fetchDummyData (setData, floorNumber, scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor) {
  fetch('src/assets/dummy_coordinates_floor1.json') // Assuming a generic path; adjust as necessary
    .then(response => response.json())
    .then(dummyData => {
      const dummyDataPoints = Object.values(dummyData)
      processAndAddDataPoints(dummyDataPoints, setData, scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor)

      const heatmapData = { max: 65, min: 0, data: setData }
      heatmapInstances[floorNumber].setData(heatmapData)
      heatmapInstances[floorNumber].repaint()
    })
    .catch(error => console.error('Error loading dummy data:', error))
}

function calculateScaleFactors (floorNumber) {
  const viewportWidth = window.innerWidth
  let scaleXFactor = 1; let scaleYFactor = 1; let subtractXFactor = 0; let subtractYFactor = 0

  if (viewportWidth > 992) {
    scaleXFactor = scaleYFactor = 1
  } else if (viewportWidth > 768) {
    const adjustments = getFloorAdjustments(floorNumber, 'mid');
    ({ scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor } = adjustments)
  } else {
    const adjustments = getFloorAdjustments(floorNumber, 'default');
    ({ scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor } = adjustments)
  }

  return { scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor }
}

function getFloorAdjustments (floorNumber, viewportCategory) {
  const floorAdjustments = {
    1: {
      default: { scaleXFactor: 0.42, scaleYFactor: 0.41, subtractXFactor: 15, subtractYFactor: 5 },
      mid: { scaleXFactor: 0.55, scaleYFactor: 0.52, subtractXFactor: 25, subtractYFactor: 10 }
    },
    2: {
      default: { scaleXFactor: 0.395, scaleYFactor: 0.395, subtractXFactor: 0, subtractYFactor: 0 },
      mid: { scaleXFactor: 0.505, scaleYFactor: 0.5, subtractXFactor: 5, subtractYFactor: 5 }
    },
    3: {
      default: { scaleXFactor: 0.45, scaleYFactor: 0.44, subtractXFactor: 25, subtractYFactor: 10 },
      mid: { scaleXFactor: 0.56, scaleYFactor: 0.54, subtractXFactor: 30, subtractYFactor: 10 }
    },
    4: {
      default: { scaleXFactor: 0.45, scaleYFactor: 0.44, subtractXFactor: 22, subtractYFactor: 10 },
      mid: { scaleXFactor: 0.54, scaleYFactor: 0.53, subtractXFactor: 20, subtractYFactor: 5 }
    }
  }

  return floorAdjustments[floorNumber]?.[viewportCategory] || {
    scaleXFactor: 0, scaleYFactor: 0, subtractXFactor: 0, subtractYFactor: 0
  }
}

function initHeatmapForFloor(floorNumber, newDataPoints) {
 // const url = `src/assets/mites_coordinates_floor${floorNumber}_updated.json`;

  // fetch(url)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     const newDataPoints = Object.values(data);
      const container = document.getElementById(`heatmapContainer${floorNumber}`);

      const { scaleXFactor, scaleYFactor, subtractXFactor, subtractYFactor } =
        calculateScaleFactors(floorNumber);

      if (!heatmapInstances[floorNumber]) {
        heatmapInstances[floorNumber] = Heatmap.create({
          container,
          radius: scaleXFactor * 36,
          maxOpacity: 1,
          minOpacity: 0.5,
          blur: 0.8,
        });
      }

      const setData = [];
      processAndAddDataPoints(
        newDataPoints,
        setData,
        scaleXFactor,
        scaleYFactor,
        subtractXFactor,
        subtractYFactor
      );
      fetchDummyData(
        setData,
        floorNumber,
        scaleXFactor,
        scaleYFactor,
        subtractXFactor,
        subtractYFactor
      );
    // })
    // .catch((error) =>
    //   console.error(`Error loading JSON for floor ${floorNumber}:`, error)
    // );
}

export {
  heatmap,
  applyHeatmap,
  removeHeatmap,
  applyHeatmapInterval,
  initHeatmapForFloor,
  applyHeatmapLive,
};
