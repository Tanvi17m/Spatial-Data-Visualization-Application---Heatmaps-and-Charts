import { applyHeatmap } from "./heatmap_utils";

let start = 0;
let start_day = "";
let start_slider = 0;

let data = [];
let dailyDataForAllFloors = [];
let hourlyData = [];

let chartEnabled = true;

async function generateAccessToken() {
  const client_id = import.meta.env.VITE_CLIENT_ID;
  const client_secret = import.meta.env.VITE_CLIENT_SECRET;

  const url = `https://bd-test.andrew.cmu.edu:81/oauth/access_token/client_id=${client_id}/client_secret=${client_secret}`;

  const headers = {
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Error obtaining access token: ${response.statusText}`);
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("There was an error:", error.message);
  }
}

function convertTimeToDate(timeStr) {
  const date = new Date();
  const matches = timeStr.match(/^(\d+)\s*(AM|PM)$/i);
  if (!matches) {
    throw new Error("Invalid time format");
  }

  let [_, hourStr, period] = matches;
  let hour = parseInt(hourStr, 10);

  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  date.setHours(hour, 0, 0, 0); // Set minutes, seconds, and milliseconds to 0

  return date;
}

function calculateAveragesUpTo(endDateStr) {
    const endDate = new Date(endDateStr);
    endDate.setMinutes(0, 0, 0);

    let hours = endDate.getHours();
    let isExactThreeHourMark = hours % 3 === 0;
    let startHour = isExactThreeHourMark ? hours - 3 : hours - (hours % 3);

    const startDate = new Date(endDate.getTime());
    startDate.setHours(startHour, 0, 0, 0);

    const allSensorAveragesArray = dailyDataForAllFloors.map((dailyData) => {

    const sensorAverages = {};

    dailyData.forEach((dayData) => {
        dayData.entries.forEach((entry) => {
        const entryTime = new Date(entry.time);
        if (entryTime >= startDate && entryTime <= endDate) {
            console.log(`Processing entry at ${entryTime}`);
            Object.entries(entry.sensorValues).forEach(
            ([sensorName, { x, y, value }]) => {
                if (!sensorAverages[sensorName]) {
                sensorAverages[sensorName] = { sum: 0, count: 0, x, y };
                }
                sensorAverages[sensorName].sum += value;
                sensorAverages[sensorName].count += 1;
            }
            );
        }
        });
    });

    return Object.entries(sensorAverages)
        .filter(([sensorName, _]) => sensorName.endsWith("_public"))
        .map(([sensorName, data]) => ({
        sensorName,
        x: data.x,
        y: data.y,
        value: data.sum / data.count,
        }));
    });

    console.log(allSensorAveragesArray)

    applyHeatmap(allSensorAveragesArray);
}

async function processSliderValueDaily(sliderValue) {
  start_slider = sliderValue;

  const hours = Math.floor(sliderValue / 3600);
  const minutes = Math.floor((sliderValue % 3600) / 60);
  const seconds = sliderValue % 60;

  const selectedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const startDate = new Date(start_day + "T00:00:00");
  const endDate = convertTimeToDate(sliderValue);

  calculateAveragesUpTo(endDate);
}

function timeLabelToMinutes(timeLabel) {
  let [timePart, amPm] = timeLabel.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  // Adjust hours for AM/PM
  if (hours === 12) hours = 0; // "12 AM" is 0 hours, and "12 PM" is treated as noon
  if (amPm === "PM") hours += 12;

  return hours * 60 + minutes;
}

function findMatchingEntries(dataArray, timeLabel) {
  const targetMinutes = timeLabelToMinutes(timeLabel);
  let lowerBoundMinutes = targetMinutes - (targetMinutes % 15);

  if (targetMinutes % 15 === 0) {
    lowerBoundMinutes -= 15;
  }

  return dataArray.filter(([timestamp]) => {
    const date = new Date(timestamp);
    const entryHours = date.getHours(); // Local hours
    const entryMinutes = date.getMinutes(); // Local minutes
    const entryTotalMinutes = entryHours * 60 + entryMinutes;

    return (
      entryTotalMinutes > lowerBoundMinutes &&
      entryTotalMinutes <= targetMinutes
    );
  });
}

async function processSliderValueHourly(sliderValue) {
  // Map over each array of hourly data to process them separately
  let sensorAveragesArrays = []
  sensorAveragesArrays = hourlyData.map((tempHourlyData) => {
    const matchingEntries = findMatchingEntries(tempHourlyData, sliderValue);
    console.log("Matching entries for a dataset:", matchingEntries);

    // Process each matching entry to compute sensor averages
    let sensorAverages = matchingEntries.flatMap(
      ([time, __, sensorDataJson]) => {
        // Parse the JSON string to get the sensor data object
        const sensorData = JSON.parse(sensorDataJson);

        // Filter and map the sensor data
        return Object.entries(sensorData)
          .filter(([sensorName, _]) => sensorName.endsWith("_public"))
          .map(([sensorName, data]) => ({
            sensorName,
            x: data.x,
            y: data.y,
            value: data.value,
          }));
      }
    );

    return sensorAverages;
  });
   console.log(sensorAveragesArrays)
   applyHeatmap(sensorAveragesArrays);
}

function calculateDailyAverages(data, start_Date, end_Date) {
  const startDate = new Date(start_Date);
  const endDate = new Date(end_Date);

  // Object to hold daily totals
  const dailyTotals = {};

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    let dateKey = currentDate.toISOString().split("T")[0];

    dailyTotals[dateKey] = { sum: 0, count: 0 };
  }

  if (data && data.data && data.data.series && data.data.series.length > 0) {
    data.data.series.forEach((series) => {
      if (series.values && series.values.length > 0) {
        series.values.forEach(([time, _, sensorValueStr]) => {
          const timestamp = new Date(time);
          const year = timestamp.getFullYear();
          const month = timestamp.getMonth() + 1;
          const day = timestamp.getDate();

          const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          if (dailyTotals.hasOwnProperty(dayKey)) {
            let sensorValues = JSON.parse(sensorValueStr);
            Object.values(sensorValues).forEach((sensor) => {
              dailyTotals[dayKey].sum += sensor.value;
              dailyTotals[dayKey].count += 1;
            });
          }
        });
      }
    });
  }

  let dailyAverages = {};
  for (let dayKey in dailyTotals) {
    if (dailyTotals[dayKey].count > 0) {
      dailyAverages[dayKey] =
        dailyTotals[dayKey].sum / dailyTotals[dayKey].count;
    } else {
      dailyAverages[dayKey] = 0;
    }
  }

  return dailyAverages;
}

async function getData(start, end, floor) {
  let start_time = start - 10;
  let end_time = end + 10;

  const access_token = await generateAccessToken();
  let url;
  if (floor == 1) {
    url = `https://bd-test.andrew.cmu.edu:82/api/sensor/5b5011bb-c5de-4e1c-bbff-2b766e7bd4fd/timeseries?start_time=${start_time}&end_time=${end_time}`;
  } else if (floor == 2) {
    url = `https://bd-test.andrew.cmu.edu:82/api/sensor/ccd2c1df-e081-4514-9fbc-0ae30daa7cef/timeseries?start_time=${start_time}&end_time=${end_time}`;
  } else if (floor == 3){
    url = `https://bd-test.andrew.cmu.edu:82/api/sensor/4d8dc564-94c4-46dc-812d-97124d7172bd/timeseries?start_time=${start_time}&end_time=${end_time}`;
  } else if (floor == 4){
    url = `https://bd-test.andrew.cmu.edu:82/api/sensor/01ee86a8-63ba-4cf4-b4a5-3a159ed5bd40/timeseries?start_time=${start_time}&end_time=${end_time}`;
  }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + access_token,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch data:", error);
    return [];
  }
}

function parseData(dataArray, start_Date, end_Date) {

  dailyDataForAllFloors = [];
  dataArray.forEach((data) => {
    let dailyData = [];
    const startDate = new Date(start_Date + "T00:00:00");
    const endDate = new Date(end_Date + "T23:59:59");

    startDate.setTime(
      startDate.getTime() + startDate.getTimezoneOffset() * 60 * 1000
    );
    endDate.setTime(
      endDate.getTime() + endDate.getTimezoneOffset() * 60 * 1000
    );

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      let dayKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      dailyData.push({
        date: dayKey,
        entries: [],
      });
    }

    if (data && data.data && data.data.series && data.data.series.length > 0) {
      data.data.series.forEach((series) => {
        if (series.values && series.values.length > 0) {
          series.values.forEach((value) => {
            const [time, insertedAt, sensorValueStr] = value;
            const timestamp = new Date(time);

            // Extract local date components
            const year = timestamp.getFullYear();
            const month = timestamp.getMonth() + 1;
            const day = timestamp.getDate();

            const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(
              day
            ).padStart(2, "0")}`;

            const dayObject = dailyData.find((day) => day.date === dayKey);
            if (dayObject) {
              dayObject.entries.push({
                time,
                insertedAt,
                sensorValues: JSON.parse(sensorValueStr),
              });
            }
          });
        }
      });
    }
    dailyDataForAllFloors.push(dailyData); // Add the dailyData for this data object to the results
  });
  //console.log(dailyDataForAllFloors)
}

function convertDatesToEpoch(startDateString, endDateString) {
  const [startYear, startMonth, startDay] = startDateString.split("-");
  const [endYear, endMonth, endDay] = endDateString.split("-");

  const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
  const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  return { startTimestamp, endTimestamp };
}

function processSensorAverages(data) {
  const sensorData = data.data.series[0].values;

  const calculateAverage = (chunk) => {
    const averages = {};
    chunk.forEach((entry) => {
      const time = entry[0];
      //console.log(entry[2]);
      const sensors = JSON.parse(entry[2]);
      Object.entries(sensors).forEach(([sensorName, sensorInfo]) => {
        if (!averages[sensorName]) {
          averages[sensorName] = { sum: 0, count: 0, ...sensorInfo };
        }
        averages[sensorName].sum += sensorInfo.value;
        averages[sensorName].count += 1;
      });
    });
    return Object.fromEntries(
      Object.entries(averages).map(([sensorName, info]) => [
        sensorName,
        { ...info, value: info.sum / info.count },
      ])
    );
  };

  const chunks = [];
  for (let i = 0; i < sensorData.length; i += 12) {
    // console.log(i)
    const chunkEndIndex = Math.min(i + 12, sensorData.length);
    const chunk = sensorData.slice(i, chunkEndIndex);
    chunks.push(calculateAverage(chunk));
  }

  const averagesArray = chunks.map((chunk) => {
    return Object.values(chunk).map((info) => info.value);
  });

  return averagesArray;
}

function calculateOverallAverages(averagesArray) {
  return averagesArray.map((chunk) => {
    const sum = chunk.reduce((acc, val) => acc + val, 0);
    return sum / chunk.length;
  });
}

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${period}`;
}

async function showGraphdaily(floor, isDataLoaded) {
  const currentTime = new Date();

  const endTime = new Date(currentTime);
  endTime.setHours(0, 0, 0, 0);

  const currentTimeStr = currentTime.toLocaleString("en-US", { hour12: false });
  const endTimeStr = endTime.toLocaleString("en-US", { hour12: false });

  const currentTimeEpoch = Math.floor(currentTime.getTime() / 1000);
  const endTimeEpoch = Math.floor(endTime.getTime() / 1000);

  // console.log("Current Time Epoch:", currentTimeEpoch);
  // console.log("End Time Epoch:", endTimeEpoch);

  if( !isDataLoaded){
    data = await getDataForAllFloorsDaily(endTimeEpoch, currentTimeEpoch)
  }
  let dataArray = [];
  //console.log(data)
  
  hourlyData = []
  data.forEach(temp_data => {
    if (temp_data.data.series && temp_data.data.series.length > 0) {
        let temp_hourlyData = temp_data.data.series[0].values;
        hourlyData.push(temp_hourlyData);
    }
})

let averagesArray = [];
let overallAverages = [];
if( floor == 5){
    let Averages = [];
    for( var i = 0; i <= 3; i++ ){
        averagesArray = processSensorAverages(data[i]);
        Averages.push(calculateOverallAverages(averagesArray));
    }
    const numArrays = Averages.length;
    const arrayLength = Averages[0].length; 

    for (let i = 0; i < arrayLength; i++) {
      let sum = 0;
      for (let j = 0; j < numArrays; j++) {
        sum += Averages[j][i];
      }
      overallAverages.push(sum / numArrays);
    }
    console.log(overallAverages);
      for (let i = 0; i < overallAverages.length; i++) {
        let startTime_ = new Date(endTime.getTime() + i * 3 * 60 * 60 * 1000);
        let endTime_ = new Date(startTime_.getTime() + 3 * 60 * 60 * 1000);

       if (i === overallAverages.length - 1) {
         endTime_ = currentTime;
       }

       let startTimeStr = formatTime(startTime_);
       let endTimeStr = formatTime(endTime_);

       let timeRangeStr = `${startTimeStr} - ${endTimeStr}`;
       dataArray.push([timeRangeStr, overallAverages[i]]);
     }
}else{
    if (data[floor-1].data.series) {
        averagesArray = processSensorAverages(data[floor-1]);
        overallAverages = calculateOverallAverages(averagesArray);
        //  console.log("Overall averages");
        //  console.log(overallAverages);

        for (let i = 0; i < overallAverages.length; i++) {
        let startTime_ = new Date(endTime.getTime() + i * 3 * 60 * 60 * 1000);
        let endTime_ = new Date(startTime_.getTime() + 3 * 60 * 60 * 1000);

        if (i === overallAverages.length - 1) {
            endTime_ = currentTime;
        }

        let startTimeStr = formatTime(startTime_);
        let endTimeStr = formatTime(endTime_);

        let timeRangeStr = `${startTimeStr} - ${endTimeStr}`;
        dataArray.push([timeRangeStr, overallAverages[i]]);
        }
        //  console.log(dataArray);
    }
}
  const dates = dataArray.map((item) => item[0]);
  const values = dataArray.map((item) => item[1]);
  return { dates, values };
}

async function getDataForAllFloorsDaily(endTimeEpoch, currentTimeEpoch) {
   var data = [];
   for (var i = 1; i <= 4; i++) {
     var temp_data = await getData(endTimeEpoch, currentTimeEpoch, i);
     data.push(temp_data);
   }
   return data;
}

async function getDataForAllFloorsWeekly(start, end) {
  var data = [];
  for (var i = 1; i <= 4; i++) {
    var temp_data = await getData(start - 10800, end, i);
    data.push(temp_data);
  }
  return data;
}

async function showGraphWeekly(start_Date, end_Date, start, end, floor, isDataLoaded) {
  
  if( !isDataLoaded ){
    data = await getDataForAllFloorsWeekly(start, end);
  }
  //console.log(data)
  const parts = start_Date.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const startDateObj = new Date(year, month, day);

  startDateObj.setDate(startDateObj.getDate() - 1);
  const adjustedStartDate = startDateObj.toISOString().split("T")[0];
  parseData(data, adjustedStartDate, end_Date);

  let dailyAverages = {}
  if( floor == 5){
      let Averages = [];
      for (var i = 0; i <= 3; i++) {
        Averages.push(calculateDailyAverages(data[i], start_Date, end_Date));
        console.log(Averages)
      }
       let count = Averages.length;

       if (count > 0) {
         Object.keys(Averages[0]).forEach((date) => {
           dailyAverages[date] = 0;
         });
       }
       Averages.forEach((obj) => {
         for (let date in obj) {
           dailyAverages[date] += obj[date];
         }
       });

       for (let date in dailyAverages) {
         dailyAverages[date] /= count;
       }
       console.log(dailyAverages)

  }else{
    dailyAverages = calculateDailyAverages(
      data[floor - 1],
      start_Date,
      end_Date
    );
  }
  const dataArray = [];

  Object.entries(dailyAverages).forEach(([date, value]) => {
    const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    dataArray.push([localDate, value]);
  });
  // console.log(dataArray);
  const dates = dataArray.map((item) => item[0]);
  const values = dataArray.map((item) => item[1]);

  return { dates, values };
}
function setStartDate() {
  const startDatePicker = document.getElementById("start_date");
  const endDatePicker = document.getElementById("end_date");

  const endDate = new Date(endDatePicker.value);
  const startDate = new Date(endDate.setDate(endDate.getDate() - 6));

  const formattedStartDate = startDate.toISOString().substr(0, 10);
  return formattedStartDate;
}

function handleDateSelection(selectedDate, currentDate) {
  let timeLabels = [
    "12 AM",
    "3 AM",
    "6 AM",
    "9 AM",
    "12 PM",
    "3 PM",
    "6 PM",
    "9 PM",
    "12 AM",
  ];

  if (selectedDate.toDateString() === currentDate.toDateString()) {
    const currentHour = currentDate.getHours();
    timeLabels = timeLabels.filter((_, index) => {
      const labelHour = (index * 3) % 24;
      return labelHour <= currentHour;
    });
    if (currentHour % 3 !== 0) {
      timeLabels.push(
        `${currentHour % 12 || 12} ${currentHour < 12 ? "AM" : "PM"}`
      );
    }
  }

  return timeLabels;
}

function updateTimeLabelsForToday(currentHour) {
  const labels = [];
  const times = [0, 3, 6, 9, 12, 15, 18, 21];

  times.forEach((time) => {
    if (time <= currentHour) {
      const label =
        time === 0
          ? "12 AM"
          : time === 12
          ? "12 PM"
          : time > 12
          ? `${time - 12} PM`
          : `${time} AM`;
      labels.push(label);
    }
  });

  if (currentHour % 3 !== 0) {
    const isPM = currentHour >= 12;
    const hourDisplay =
      currentHour > 12
        ? currentHour - 12
        : currentHour === 0
        ? 12
        : currentHour;
    const label = `${hourDisplay} ${isPM ? "PM" : "AM"}`;
    labels.push(label);
  }

  return labels;
}

function updateTimeLabelsForDaily(currentTimeStr) {
  const [currentHour, currentMinute] = currentTimeStr.split(":").map(Number);
  let currentTimeInMinutes = currentHour * 60 + currentMinute;

  let startHour = currentHour - (currentHour % 3);
  if (currentMinute === 0 && currentHour % 3 === 0) {
    startHour -= 3;
  }
  if (startHour < 0) startHour = 21;

  let startTimeInMinutes = startHour * 60;
  const labels = [];

  for (
    let timeInMinutes = startTimeInMinutes;
    timeInMinutes <= currentTimeInMinutes;
    timeInMinutes += 15
  ) {
    labels.push(formatTimeLabel(timeInMinutes));
  }

  if (currentTimeInMinutes % 15 !== 0) {
    labels.push(formatTimeLabel(currentTimeInMinutes));
  }

  return labels;
}

function formatTimeLabel(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const formattedMinute = minute.toString().padStart(2, "0");
  const amPm = hour < 12 ? "AM" : "PM";
  return `${formattedHour}:${formattedMinute} ${amPm}`;
}

function hideCharts() {
  const chartDiv = document.getElementById("chartDiv");
  if (chartEnabled == true) {
    chartDiv.style.visibility = "hidden";
    chartEnabled = false;
  } else {
    chartDiv.style.visibility = "visible";
    chartEnabled = true;
  }
}

function convertTimeRangeTo24Hour(timeRange) {
  const times = timeRange.split(" - ");
  if (times.length === 2) {
    const startTime24 = convertTo24Hour(times[0].trim());
    const endTime24 = convertTo24Hour(times[1].trim());
    return { startTime24, endTime24 };
  } else {
    throw new Error("Invalid time range format");
  }
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours, 10);

  if (hours === 12) {
    hours = 0;
  }
  if (modifier === "PM") {
    hours += 12;
  }

  hours = hours < 10 ? "0" + hours : hours;
  return `${hours}:${minutes}`;
}

function setDate(endDate) {
  if (endDate) {
    start_day = endDate;
  } else {
    start_day = getTodaysDateFormatted();
  }
}

function getTodaysDateFormatted() {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  return `${year}-${formattedMonth}-${formattedDay}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = [
    today.getFullYear(),
    (today.getMonth() + 1).toString().padStart(2, "0"),
    today.getDate().toString().padStart(2, "0"),
  ].join("-");
  document.getElementById("end_date").value = todayStr;

  const startDate = setStartDate();
});
export {
  processSliderValueDaily,
  processSliderValueHourly,
  setStartDate,
  convertDatesToEpoch,
  handleDateSelection,
  showGraphdaily,
  showGraphWeekly,
  updateTimeLabelsForDaily,
  updateTimeLabelsForToday,
  hideCharts,
  convertTo24Hour,
  convertTimeRangeTo24Hour,
  setDate,
  formatTime,
};
