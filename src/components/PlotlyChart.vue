<template>
  <div ref="plotlyChart"></div>
</template>

<script>
import Plotly from 'plotly.js-dist-min';

export default {
  name: 'PlotlyChart',
  props: {
    data: Array,
    layout: Object,
  },
  mounted() {
    this.plotChart();
  },
  methods: {
    plotChart() {
      Plotly.newPlot(this.$refs.plotlyChart, this.data, this.layout);
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.plotChart();
      }
    },
    layout: {
      deep: true,
      handler() {
        this.plotChart();
      }
    }
  }
}
</script>
