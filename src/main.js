import './assets/css/main.css'
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// import './assets/js/main';
// import './assets/js/chartandslider';
// import './assets/js/svgediting';
// import './assets/js/heatmap';
// import './assets/js/reboots';
// import './assets/js/rabbitmqconnection';
// import './assets/js/randomized';
// import './assets/js/stomp';
// import './assets/js/tcs';

import { createApp } from 'vue'
import App from './App.vue'
import SpatialGraph from './SpatialGraph_2.vue'

import heatmap from 'vue-heatmapjs';

// createApp(App).mount('#app')
// app.use(heatmap, {
//     heatmapPreload: [{ x: 10, y: 10, value: 100 }],
// });

const app = createApp(SpatialGraph);
app.use(heatmap, {
  heatmapPreload: [
    { x: 100, y: 100, value: 100 },
    { x: 200, y: 200, value: 1000 },
    { x: 1000, y: 100, value: 100 },
    { x: 2000, y: 200, value: 1000 },
    // Add more points as needed
  ],
  
  // Optional: You can also configure other plugin options if available
});

app.mount('#app');