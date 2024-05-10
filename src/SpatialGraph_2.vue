<template>
   <div >
        <div class="modal fade" id="vueModal" tabindex="-1" aria-labelledby="vueModalLabel" aria-hidden="true" ref="vueModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="vueModalLabel">Settings</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div v-if="showOptions" id="option-box">
                    <div v-for="option in options" :key="option.id" >
                        <input type="checkbox" :id="option.id" v-model="selectedOptions" :value="option.value" @change="handleCheckboxChange(option.value)" >
                        <label :for="option.id" style="color: black; font-size: 25px; padding-left: 5px;">{{ option.text }}</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
        <div id="gear-icon" @click="showModal" style="position: fixed; top: 10px; right: 10px; cursor: pointer; z-index: 10000">
          <i class="fa fa-gear"></i>
        </div>
        <div style="position: fixed; top: 10px; right: 10px; display: flex; align-items: center;">
      <!-- Container for checkboxes -->

      </div>
       <div class="dropdown-container">
          <label for="dataSelect" class="dropdown-label">Select Data:</label>
          <select id="dataSelect" class="dropdown-select" v-model="selectedOption">
            <option disabled value="">Please select one</option>
            <option value="noise">Noise</option>
            <option value="temperature">Temperature</option>
            <option value="occupancy">Occupancy</option>
          </select>
      </div>

        <div class="main-container">
          <div class="left-side">
            <div id="legend-container">
              <div id="legend-title">Heatmap Legend</div>
              <div id="legend"></div>
              <div id="legend-labels">
                <span class="label">0</span>
                <span class="label">100</span>
            </div>
            </div>
              <!-- Container 1 -->
              <div id="container1">
                 <div id="floorTooltip1" > Floor 1</div>
                <div id="floorTooltip2" > Floor 2</div>
                <div id="floorTooltip3" > Floor 3</div>
                <div id="floorTooltip4" > Floor 4</div>
                <div id="visualization-container1">
                  <div id="svgContainer1"></div>
                  <div ref="heatmapContainer1" id="heatmapContainer1"></div>
                </div>
                <div id="visualization-container2">
                  <div id="svgContainer2"></div>
                  <div ref="heatmapContainer2" id="heatmapContainer2"></div>
                </div>
                <div id="visualization-container3">
                  <div id="svgContainer3"></div>
                  <div ref="heatmapContainer3" id="heatmapContainer3"></div>
                </div>
                <div id="visualization-container4">
                  <div id="svgContainer4"></div>
                  <div ref="heatmapContainer4" id="heatmapContainer4"></div>
                </div>
                <div class="controls-container">
                  <div class="control-row">
                    <button
                      class="animation-on-hover"
                      size="lg"
                      id="zoom-in"
                      >+</button
                    >
                    <button
                      class="animation-on-hover"
                      size="lg"
                      id="zoom-out"
                    >
                      -
                    </button>
                  </div>
                  <div class="control-row">
                    <button id="reset">
                      Reset
                    </button>
                  </div>
                  <div class="control-row">
                    <button :disabled="isResetMode" id="rotate">
                      Rotate
                    </button>
                    <button :disabled="isResetMode" id="translate">
                      Translate
                    </button>
                  </div>
                </div>
              </div>
          </div>
          <div class="right-side">
            <div class="slider-container">
                <input
                  type="range"
                  v-model="sliderPosition"
                  :min="0"
                  :max="sliderMax"
                  step="1"
                  @input="updateSliderValue"
                />
                <div class="slider-labels">
                  <span
                    class="label"
                    v-for="(label, index) in timeLabels"
                    :key="index"
                    :style="{
                      left: `${index * (100 / (timeLabels.length - 1))}%`,
                      fontSize: '10px'  // Adjust font size here
                    }"
                    >{{ label }}</span
                  >
                </div>
              </div>
                  <div class="container">
                    <div class="selector-container">
                      <select @change="onChangeGranularity($event)">
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                      </select>
                      <select v-model="selectedFloor" @change="onChangeFloor($event)">
                        <option value=1>Floor 1</option>
                        <option value=2>Floor 2</option>
                        <option value=3>Floor 3</option>
                        <option value=4>Floor 4</option>
                        <option value=5>All Floors</option>
                      </select>
                    </div>
       
                  <div ref="toggleElement" class="input-group" style="display: none; justify-content: space-between;">
                      <div class="date-input">
                        <label for="start_date">Start date:</label>
                        <input type="date" id="start_date" name="trip-start" v-model="startDate" readonly />
                      </div>
                      <div class="date-input">
                        <label for="end_date">End date:</label>
                        <input type="date" id="end_date" name="trip-end" v-model="endDate" @change="updateEndDate"/>
                  </div>
        </div>
      </div>
                <div id="chartDiv"></div>
          </div>
    </div>
    <div class="d3-tip" style="visibility: hidden;"></div>
    </div>
    <!-- </div> -->
</template>
<script>
//import Slider from "src/components/Slider";
import * as d3 from "d3";

import {
  fillsvg,
  hideMites
} from "@/javascripts/SpatialGraphSVGEditing_2.js";
import { rebootslider } from "@/javascripts/reboots";
import { applyActivityTooltips } from "@/javascripts/tooltips"
import { applyCardinalityLayers } from "@/javascripts/privacy_layers"
import { applyHeatmap, applyHeatmapInterval, initHeatmapForFloor, applyHeatmapLive } from "@/javascripts/heatmap_utils"
import { addPanningAndZoomingToContainer } from "@/javascripts/rotation"
import {
  processSliderValueDaily,
  processSliderValueHourly,
  convertDatesToEpoch,
  showGraphdaily,
  showGraphWeekly,
  updateTimeLabelsForDaily,
  updateTimeLabelsForToday,
  hideCharts,
  convertTo24Hour,
  convertTimeRangeTo24Hour,
  setDate,
  formatTime
} from '@/javascripts/chart_utils.js'
import Plotly from 'plotly.js-dist-min';
import { eventBus } from '@/javascripts/eventBus';

export default {
  components: {
  //  PlotlyChart
    //Slider
    // TaskList,
    // CountryMapCard,
    // UserTable
  },
  data() {
    return {
      options: [
        { id: 'enableActivtiy', text: 'Enable Activtiy', value: 'enableActivity' },
        { id: 'enablePrivacy', text: 'Enable Privacy', value: 'enablePrivacy' },
        { id: 'hideMites', text: 'Hide Mites', value: 'hideMites' },
        { id: 'hideGraph', text: 'Hide Graph', value: 'hideGraph' }
      ],
      isResetMode: true,
      Loaded: false,
      selectedOptions: [],
      selectedOption: '',
      showOptions: true,
      sliderPosition: 0,
      sliderValue: 0,
      sliderMax: 8,
      timeLabels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'],
      date: null,
      startDate: '',
      endDate: '',
      granularity: 'hourly',
      floor: 1,
      selectedFloor: '1',
      floorPlanPath: "src/assets/TCS/",
      csvDataPath: "RebootFiles/Mite-Location-Logs.csv",
      rebootDataPath: "Reboots/",
      metricsSVGPath: "img/svgs/tcs/boxesforvista.svg",
      applyHeatmap: applyHeatmap,
      applyHeatmapInterval: applyHeatmapInterval,
      applyCardinalityLayers: applyCardinalityLayers,
      applyActivityTooltips: applyActivityTooltips,
      timer: null
    };
  },
  computed: {
    enableRTL() {
      return this.$route.query.enableRTL;
    },
    isRTL() {
      return this.$rtl.isRTL;
    },
    timeValues() {
        const startOfDay = new Date()
        startOfDay.setUTCHours(0, 0, 0, 0)

        const offsets = [0, 3, 6, 9, 12, 15, 18, 21]
        return offsets.map((offset) => offset * 3600)
    }
  },
  methods: {
    changeGraphs(data) {
      let floor = data.containerId
      this.floor = floor
      console.log(floor)
      if (this.granularity == 'hourly') {
        this.plotChartHourly(floor, true)
      } else {
        this.plotChartDaily(floor, true)
      }
      this.selectedFloor = floor
      //this.updateSliderValue()
    },
    enableButtons(){
      this.isResetMode = false;
    },
    disableButtons() {
      this.isResetMode = true;
    },
      showModal() {
      const modal = new bootstrap.Modal(this.$refs.vueModal);
      modal.show();
    },
    rebootSliderButton() {
      console.log("Reboot Slider Function in Vue is called!");

      rebootslider(this.csvDataPath, this.rebootDataPath, this.metricsSVGPath);
    },
    handleCheckboxChange(value) {
      console.log(`Checkbox for ${value} was changed.`);
      if( value == "enablePrivacy"){
        applyCardinalityLayers()
      }else if( value == "enableActivity"){
        applyActivityTooltips()
      }else if( value == "hideMites"){
        hideMites()
      }else{
        hideCharts()
      }
    },
     toggleOptions() {
      this.showOptions = !this.showOptions;
    },
    setStartDate() {
      const endDate = new Date(this.endDate)
      const startDate = new Date(endDate.setDate(endDate.getDate() - 6))

      const formattedStartDate = startDate.toISOString().substr(0, 10)
      return formattedStartDate
    },
    updateEndDate() {
      this.startDate = this.setStartDate() 
      const { startTimestamp, endTimestamp } = convertDatesToEpoch(this.startDate, this.endDate)
      this.plotChartDaily(this.floor, false)
    },
    onChangeFloor(event){
     this.floor = event.target.value
     console.log(this.floor)
     if( this.granularity == 'hourly'){
        this.plotChartHourly(this.floor, true)
      }else{
        this.plotChartDaily(this.floor, true)
      }
      this.updateSliderValue()

      const resetClickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      const clickEvent = new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      const unclickEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      clickEvent.isFloorChanged = true;

      const containerID = `visualization-container${this.floor}`
      const container = document.getElementById(containerID);
      const resetButton = document.getElementById('reset');

      if( this.floor < 5 ){
        resetButton.dispatchEvent(resetClickEvent);
        container.dispatchEvent(clickEvent);
        container.dispatchEvent(unclickEvent);
      }else{
        resetClickEvent.isAllFloor = true;
        resetButton.dispatchEvent(resetClickEvent);
      }
   }, 
   async onChangeGranularity(event) {
      const el = this.$refs.toggleElement
     // const heatmap_cont = this.$refs.container_heatmap

      this.granularity = event.target.value
      if (this.granularity == 'hourly') {
        this.plotChartHourly(this.floor,false)
        this.updateTimeLabelsForNow()
        el.style.display = 'none'
      } else {
        console.log(this.granularity)
        el.style.display = 'flex'

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayStr = [
          today.getFullYear(),
          (today.getMonth() + 1).toString().padStart(2, '0'), // Months are 0-indexed
          today.getDate().toString().padStart(2, '0')
        ].join('-')

        this.endDate = todayStr
        this.updateEndDate()
        setDate("")
        const currentHour = new Date().getHours()
        this.timeLabels = updateTimeLabelsForToday(currentHour)
        this.sliderMax = this.timeLabels.length - 1

        // Ensure sliderPosition is within the new bounds
        if (this.sliderPosition > this.sliderMax) {
          this.sliderPosition = this.sliderMax // Adjust if out of bounds
        }

        await this.plotChartDaily(this.floor, false)
        this.updateSliderValue()
      }
    },
    async plotChartHourly(floor, isDataLoaded) {
      const { dates, values } = await showGraphdaily(floor, isDataLoaded)
      let formattedValues = values.map(value => parseFloat(value.toFixed(2)));

      var originalColors = values.map(() => '#1f77b4');
      originalColors[values.length - 1] = 'blue';

      var data = [
        {
          y: dates,
          x: values,
          text: formattedValues, 
          textposition: 'inside', 
          type: 'bar',
          orientation: 'h',
          hovertemplate: 'Value: %{x}<br>Timestamp: %{y}<extra></extra>',
          marker: {
            color: originalColors.slice() // Use a copy of the original colors
          }
        }
      ]

      let floorTitle = this.floor;
      if( this.floor == 5){
        floorTitle = 'all floors'
      }
      var layout = {
        paper_bgcolor: 'black', // Sets the background color of the plotting area
        plot_bgcolor: 'black', // Sets the background color of the inside plot area
        font: {
          color: 'white' // Sets the text color for all text in the chart
        },
        title: `Sensor Values for Floor ${floorTitle}`,
        xaxis: { title: 'Average Value', rangemode: 'tozero', color: 'white' },
        yaxis: { title: 'Timestamp', color: 'white', tickangle: -45 }, 
        margin: { l:150, r: 50, b: 100, t: 100, pad: 4 }
      }

      Plotly.newPlot('chartDiv', data, layout, { displayModeBar: false })
      const myDiv = document.getElementById('chartDiv')

      myDiv.on('plotly_click', (data) => {
        console.log(data)

        const point = data.points[0]

        originalColors = values.map(() => '#1f77b4');
        var newColors = originalColors.slice(); // Copy original colors
        newColors[point.pointNumber] = 'blue'; // Change color of the clicked bar

        var update = {
          'marker.color': [newColors] // Update colors
        };

        Plotly.restyle('chartDiv', update);
        
        this.updateSliderValue()

        const { startTime24, endTime24 } = convertTimeRangeTo24Hour(point.y);
        if (window.handleBarSelectionDaily) {
          window.handleBarSelectionDaily(endTime24)
        }
      })
    },
    async plotChartDaily(floor, isDataLoaded) {
      this.startDate = this.setStartDate()
      const { startTimestamp, endTimestamp } = convertDatesToEpoch(this.startDate, this.endDate)
      const { dates, values } = await showGraphWeekly(
        this.startDate,
        this.endDate,
        startTimestamp,
        endTimestamp,
        floor,
        isDataLoaded
      )
      console.log(dates)
      const formattedDates = dates.map(date =>
        `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate().toString().padStart(2, '0')}`
      );

      let formattedValues = values.map(value => parseFloat(value.toFixed(2)));

      var originalColors = values.map(() => '#1f77b4');
      originalColors[values.length - 1] = 'blue';

      var data = [
        {
          y: dates,
          x: values,        
          text: formattedValues, 
          textposition: 'inside',
          type: 'bar',
          orientation: 'h',
          hovertemplate: 'Value: %{x}<br>Date: %{y}<extra></extra>',
          marker: {
            color: originalColors.slice() // Use a copy of the original colors
          } 
        }
      ]

      let floorTitle = this.floor;
      if (this.floor == 5) {
        floorTitle = 'all floors'
      }

      var layout = {
        paper_bgcolor: 'black', // Sets the background color of the plotting area
        plot_bgcolor: 'black', // Sets the background color of the inside plot area
        font: {
          color: 'white' // Sets the text color for all text in the chart
        },
        title: `Sensor Values for Floor ${floorTitle}`,
        xaxis: { title: 'Average Value', rangemode: 'tozero',  color: 'white' },
        yaxis: { title: 'Days',  color: 'white', tickangle: -45, tickpadding: 10  },
        margin: { l: 100, r: 50, b: 100, t: 100, pad: 4 } // Adjust margins if needed for better label display
      }

      Plotly.newPlot('chartDiv', data, layout, { displayModeBar: false });
      const myDiv = document.getElementById('chartDiv');

      myDiv.on('plotly_click', (data) => {
        console.log(data)
        const point = data.points[0];

       // console.log(point)
        originalColors = values.map(() => '#1f77b4');

        var newColors = originalColors.slice(); // Copy original colors
        newColors[point.pointNumber] = 'blue'; // Change color of the clicked bar

        var update = {
          'marker.color': [newColors] // Update colors
        };

        Plotly.restyle('chartDiv', update);

        this.updateSliderValue()

        if (window.handleBarSelectionWeekly) {
          window.handleBarSelectionWeekly(point.y) 
        }
      });
    },

    handleBarSelectionDaily(selectedDateStr) {
      this.timeLabels = updateTimeLabelsForDaily(selectedDateStr)
      console.log(this.timeLabels)

      this.sliderMax = this.timeLabels.length - 1

      if (this.sliderPosition > this.sliderMax) {
        this.sliderPosition = this.sliderMax 
      }

      console.log(this.sliderPosition)
      this.updateSliderValue()
    },
    handleBarSelectionWeekly(endTime) {
      const [year, month, day] = endTime.split('-').map((num) => parseInt(num, 10))
      const selectedDate = new Date(year, month - 1, day)
      const today = new Date()

      today.setHours(0, 0, 0, 0)
      setDate(endTime)
      if (selectedDate.toDateString() === today.toDateString()) {
        const currentHour = new Date().getHours()
        this.timeLabels = updateTimeLabelsForToday(currentHour)
      } else {
        this.timeLabels = [
          '12 AM',
          '3 AM',
          '6 AM',
          '9 AM',
          '12 PM',
          '3 PM',
          '6 PM',
          '9 PM',
          '12 AM'
        ]
      }
      this.sliderMax = this.timeLabels.length - 1

      if (this.sliderPosition > this.sliderMax) {
        this.sliderPosition = this.sliderMax 
      }
      this.updateSliderValue()
    },
    updateTimeLabelsForNow(){
        const currentTime = new Date();
        let endTimeStr = formatTime(currentTime);
        endTimeStr = convertTo24Hour(endTimeStr)
        this.timeLabels = updateTimeLabelsForDaily(endTimeStr)
         this.sliderMax = this.timeLabels.length - 1

        if (this.sliderPosition > this.sliderMax) {
          this.sliderPosition = this.sliderMax 
        }

        console.log(this.sliderPosition)
        this.updateSliderValue()
    },
    updateSliderValue() {
      const selectedLabel = this.timeLabels[this.sliderPosition]
      if (this.granularity == 'hourly') {
        processSliderValueHourly(selectedLabel)
      } else {
        processSliderValueDaily(selectedLabel)
      }
    },
    async initLoadFloorPlans() {
      console.log(this.floorPlanPath);
      let floor1 = await d3.xml(this.floorPlanPath + "floor1_new3.svg");
      let floor2 = await d3.xml(this.floorPlanPath + "floor2_new3.svg");
      let floor3 = await d3.xml(this.floorPlanPath + "floor3_new3.svg");
      let floor4 = await d3.xml(this.floorPlanPath + "floor4_new3.svg");

      d3.select("#svgContainer1")
        .node()
        .appendChild(floor1.documentElement);
      d3.select("#svgContainer2")
        .node()
        .appendChild(floor2.documentElement);
      d3.select("#svgContainer3")
        .node()
        .appendChild(floor3.documentElement);
      d3.select("#svgContainer4")
        .node()
        .appendChild(floor4.documentElement);

      fillsvg();
      [
        "visualization-container1",
        "visualization-container2",
        "visualization-container3",
        "visualization-container4"
      ].forEach(addPanningAndZoomingToContainer);

    },
    async initAllHeatmaps() {
      for (let floorNumber = 1; floorNumber <= 4; floorNumber++) {
        initHeatmapForFloor(floorNumber);
      }
    },
    onPageLoad() {
      // Get heatmap after every 3 seconds
      // this.timer = setInterval(() => {
      //   this.applyHeatmapInterval();
      // }, 3000);
    }
  },
  async mounted() {
      eventBus.on('changeGraphs', this.changeGraphs);
      eventBus.on('enableButtons', this.enableButtons);
      eventBus.on('disableButtons', this.disableButtons);
      await this.initLoadFloorPlans();
      console.log('mounted')
      applyHeatmapLive();
      window.handleBarSelectionDaily = this.handleBarSelectionDaily;
      window.handleBarSelectionWeekly = this.handleBarSelectionWeekly;
      this.plotChartHourly(this.floor, false);
      this.updateTimeLabelsForNow();
      this.Loaded = true;
  },
  // beforeMount(){
  //    console.log("created")
  //    console.log("beforeMount")
  //    applyHeatmapLive();
  // },
  beforeDestroy() {
    clearInterval(this.timer);
    delete window.handleBarSelectionDaily
    delete window.handleBarSelectionWeekly
  }
};
</script>

<style>
@import "../src/assets/css/style8.css";
</style>
