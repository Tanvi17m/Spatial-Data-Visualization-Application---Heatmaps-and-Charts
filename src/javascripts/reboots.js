//duplicated code from slider with expectation that this a specific desire and not an ongoing visualization
//Differences between this 'add slider' and the other are using ips instead of sids, the start and end date
//are hardcoded, and the updatecolor function is completely different. It would not be difficult to combine these
//into one function

//TODO: Streamline this process if we determine this is something worth doing

import * as d3 from "d3";
import $ from "jquery";
import { color } from "d3";
// var fs = require("fs");

var rebootdata = {};
var daysum = {};
var references = {};
var ref2 = {};
var ind = 0;
var timer = 0;
var pslider = false;

function format(file, month, date) {
  console.log("format function called", month, date);
  // let rebootdata = {};
  var ssv = d3.dsvFormat(" ");
  var times = 0,
    index = null;
  while (times < 9 && index !== -1) {
    index = file.indexOf("\n", index + 1);
    times++;
  }
  console.log("index:", index);
  file = file.substring(index);
  var end = file.indexOf(
    "*****************************************************"
  );
  file = file.substring(0, end);

  var head =
    "IP_address 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 total";
  file = head.concat(file);
  file = file.replace(/  +/g, " ");
  var formatted = ssv.parse(file);
  for (let i = 0; i < formatted.length; i++) {
    let d = [];
    for (let j = 0; j < 24; j++) {
      let l = {};
      l.date = new Date(2021, month, date, j);
      l.reboots = parseInt(formatted[i][j.toString()]);
      d.push(l);
    }
    if (formatted[i].IP_address in rebootdata) {
      rebootdata[formatted[i].IP_address] = rebootdata[
        formatted[i].IP_address
      ].concat(d);
    } else {
      rebootdata[formatted[i].IP_address] = d;
    }
  }
  console.log("format: ", rebootdata);
  return rebootdata;
}

function fillreboot(pathname, names) {
  console.log("fill reboot function");
  let months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
  };
  for (let i = 0; i < names.length; i++) {
    $.get(pathname + names[i], function(data) {
      //expects format of filename to be REBOOTS-Aug1 (for example)
      let m = months[names[i].substring(8, 11)];
      let d = parseInt(names[i].substring(11));
      format(data, m, d);
    });
  }
  console.log("#######HERE######: ", rebootdata);
}

function readyFill(rebootDataPath, names) {
  console.log("Ready Fill Called: ", rebootDataPath, names.length);

  if (names.length === 0) {
    setTimeout(readyFill, 30);
    console.log("Names length is " + names.length);
  } else {
    fillreboot(rebootDataPath, names);
  }
}

// function filenames(path) {
//   console.log("inside filenames function: ", path)
//   let names = []
//   $.ajax({
//     url: path,
//     method: 'GET',
//     success: function (data) {
//       console.log("data: ", data);
//       var items = $(data).find("li")
//       // var items = $(data).find("a");
//       console.log("Items: ",items);
//       for (let i = 0; i < items.length; i++) {
//         names.push(items[i].innerText)
//       }
//       if (names.length === 0) {
//         console.log('Reboots is empty')
//         return;
//       }
//     }
//   })
//   return names;
// }

function filenames(path) {
  console.log("inside filenames function: ", path);
  // var names = require.context(
  //   path,
  //   true,
  //   /^.*\$/
  // )

  // var names = fs.readdirSync(path);
  var names = "";
  console.log(names);
  return names;
}

async function readref(filename) {
  console.log("## read Ref references: " + JSON.stringify(filename));
  // d3.csv(filename).then(function (data) {
  //   console.log("d3 function: "+ data.length);
  //   console.log("d3 function: "+ JSON.stringify(data));
  //
  //   for (let i = 0; i < data.length; i++) {
  //     references[data[i]['IP Address']] = data[i]['Ethernet Jack #']
  //     ref2[data[i]['Ethernet Jack #']] = data[i]['IP Address']
  //   }
  //   console.log("inside d3 function: "+ JSON.stringify(references))
  // });
  let data = await d3.csv(filename);
  // let ref2 = {}
  console.log(references);
  console.log("d3 function awa: " + data.length);
  console.log("d3 function: " + JSON.stringify(data));
  console.log("before for call" + JSON.stringify(references));
  for (let i = 0; i < data.length; i++) {
    // console.log(data[i]['Ethernet Jack #'])
    references[data[i]["IP Address"]] = data[i]["Ethernet Jack #"];
    ref2[data[i]["Ethernet Jack #"]] = data[i]["IP Address"];
  }

  console.log("## read Ref references after d3: " + JSON.stringify(references));
  return references;
}

async function init(csvDataPath, rebootDataPath) {
  console.log("Init function is called!");
  references = await readref(csvDataPath);
  console.log("Init References: ");
  console.log(references);
  let names = [];
  console.log("before File Names Init References: ");
  console.log(names);
  // names = filenames(rebootDataPath)
  names = ["REBOOTS-Oct26", "REBOOTS-Oct27"];
  console.log("After File Names Init References: ");
  console.log(names);
  readyFill(rebootDataPath, names);
  console.log("#######HERE2######: ", rebootdata);
}

function sortByDateAscending(a, b) {
  // Dates will be cast to numbers automagically:
  return a.date - b.date;
}

function scale() {
  var svg = d3.select("#slider-svg");
  var defs = svg.append("defs");
  var linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");
  linearGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ffbf00");
  linearGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#ff4400");

  svg
    .append("rect")
    .attr("x", 1120)
    .attr("y", 80)
    .attr("width", 300)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)");

  var linearGradient2 = defs
    .append("linearGradient")
    .attr("id", "linear-gradient2")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");
  linearGradient2
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#003e00" },
      { offset: "50%", color: "#008500" },
      { offset: "100%", color: "#00ff00" }
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });

  svg
    .append("rect")
    .attr("x", 950)
    .attr("y", 80)
    .attr("width", 150)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient2)");

  var scale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([950, 1100]);

  // Add scales to axis
  var x_axis = d3
    .axisBottom()
    .scale(scale)
    .ticks(3);

  //Append group and insert axis
  svg
    .append("g")
    .call(x_axis)
    .attr("transform", "translate(0,100)");

  var scale = d3
    .scaleLinear()
    .domain([5, 500])
    .range([1120, 1420]);

  // Add scales to axis
  var x_axis = d3
    .axisBottom()
    .scale(scale)
    .ticks(5);

  //Append group and insert axis
  svg
    .append("g")
    .call(x_axis)
    .attr("transform", "translate(0,100)");
}

function delSlider() {
  pslider = false;
  d3.select("#totals").html("");
  let daysum = [];
  var vis = d3.select("#vis");
  vis.selectAll("*").remove();
  ranges.style("fill", "none");
}

async function rebootslider(csvDataPath, rebootDataPath, metricsSVGPath) {
  await init(csvDataPath, rebootDataPath);

  console.log("Called Reboot Slider");
  console.log(references);
  console.log("Reboot Data");
  console.log(rebootdata);

  var allmites = d3.selectAll(".mite");

  console.log("################# Rennoot Slider", allmites);

  if (pslider) {
    delSlider();
    return;
  }
  var formatDate = d3.timeFormat("%m/%d/%y, %H:%M:%S");
  var formatDate2 = d3.timeFormat("%m/%d %H:%M");
  var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");
  var redcolor = d3
    .scaleLinear()
    .domain([5, 500])
    .range(["#ffbf00", "#ff4400"]);
  var greencolor = d3
    .scaleLinear()
    .domain([0, 5])
    .range(["#003e00", "#00ff00"]);
  pslider = true;
  var ips = Object.keys(rebootdata);
  console.log("################# IPs", ips);
  var pvalue = 0;
  var colordict = {};

  for (let k in ips) {
    var dates = rebootdata[ips[k]];
    rebootdata[ips[k]] = dates.sort(sortByDateAscending);
  }

  var startDate = rebootdata[ips[1]][0].date;
  var endDate = rebootdata[ips[1]][rebootdata[ips[1]].length - 1].date;

  var moving = false;
  var currentValue = 0;

  var margin = { top: 50, right: 50, bottom: 0, left: 50 };
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  console.log("Before loading boxes for vista SVG", width, height, margin);

  var vis = d3.select("#vis");
  var svg = d3
    .select("#vis")
    .append("svg")
    .attr("id", "slider-svg")
    .attr("width", width + margin.left + margin.right + 500)
    .attr("height", height + margin.top + margin.bottom);

  vis.append("br");

  d3.xml(metricsSVGPath).then(data => {
    d3.select("#totals")
      .node()
      .append(data.documentElement);
  });

  console.log("After loading boxes for vista SVG");

  vis.append("br");
  var speed = 1;
  //buttons to control slider
  var playButton = vis
    .append("button")
    .attr("id", "#play-button")
    .text("Play");
  vis
    .append("button")
    .attr("id", "#b025x")
    .text("0.25x")
    .on("click", function() {
      var speed = 0.25;
      console.log("selected speed: " + speed);
      if (moving) {
        clearInterval(timer);
        timer = setInterval(step, 400);
      }
    });
  vis
    .append("button")
    .attr("id", "#b05x")
    .text("0.5x")
    .on("click", function() {
      var speed = 0.5;
      console.log("selected speed: " + speed);
      if (moving) {
        clearInterval(timer);
        timer = setInterval(step, 200);
      }
    });
  vis
    .append("button")
    .attr("id", "#b1x")
    .text("1x")
    .on("click", function() {
      var speed = 1;
      console.log("selected speed: " + speed);
      if (moving) {
        clearInterval(timer);
        timer = setInterval(step, 100);
      }
    });
  vis
    .append("button")
    .attr("id", "#b2x")
    .text("2x")
    .on("click", function() {
      var speed = 2;
      console.log("selected speed: " + speed);
      if (moving) {
        clearInterval(timer);
        timer = setInterval(step, 50);
      }
    });

  vis
    .append("button")
    .attr("id", "#b3x")
    .text("3x")
    .on("click", function() {
      var speed = 3;
      console.log("selected speed: " + speed);
      if (moving) {
        clearInterval(timer);
        timer = setInterval(step, 33);
      }
    });

  //vis.append('button').attr('id','zero').text('0').style('background-color','green');
  //vis.append('button').attr('id','thirty').text('0').style('background-color','yellow');
  //vis.append('button').attr('id','hund').text('0').style('background-color','orange');
  //vis.append('button').attr('id','five').text('0').style('background-color','darkorange');
  //vis.append('button').attr('id','max').text('0').style('background-color','red');

  var x = d3
    .scaleTime()
    .domain([startDate, endDate])
    .range([0, 860])
    .clamp(true);

  var margin = { top: 50, right: 50, bottom: 0, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var valsdict = {};
  var daystart = "";
  for (let i = 0; i < ips.length; i++) {
    let valdict = {};
    var ip = ips[i];
    if (ip in rebootdata) {
      var dataset = rebootdata[ip];
      var varsum = 0;
      var days = [];
      var lastday = 0;
      for (let e = 0; e < dataset.length; e++) {
        var index = x(dataset[e].date);
        var sum = sum + dataset[e].reboots;
        if (dataset[e].date.getHours() == 0) {
          days = [];
          daystart = x(dataset[e].date);
        }
        days.push(x(dataset[e].date));
        if (dataset[e].date.getHours() == 23) {
          var daytotal = 0;

          if (sum == 0) {
            //  daysum[daystart].zero ++;
            daytotal = 2;
          } else if (sum < 31) {
            //  daysum[daystart].thirty ++;
            daytotal = 3;
          } else if (sum < 101) {
            //  daysum[daystart].hund ++;
            daytotal = 4;
          } else if (sum < 501) {
            //  daysum[daystart].fihund ++;
            daytotal = 5;
          } else {
            // daysum[daystart].max++;
            daytotal = 6;
          }

          for (let k = 0; k < days.length; k++) {
            if (days.length == 46) {
              var days2 = new Set(days);
              var days = Array.from(days2);
            }
            if (days.length == 24) {
              if (!(days[k] in daysum)) {
                daysum[days[k]] = {
                  zero: 0,
                  thirty: 0,
                  hund: 0,
                  fihund: 0,
                  max: 0,
                  total: 0
                };
              }
              daysum[days[k]].total++;

              switch (daytotal) {
                case 0:
                  console.log(days[k]);
                case 2:
                  daysum[days[k]].zero++;
                  break;
                case 3:
                  daysum[days[k]].thirty++;
                  break;
                case 4:
                  daysum[days[k]].hund++;
                  break;
                case 5:
                  daysum[days[k]].fihund++;
                  break;
                case 6:
                  daysum[days[k]].max++;
                  break;
              }
            }
          }

          days = [];

          sum = 0;
        }

        var val = dataset[e].reboots;
        valdict[index] = val;
      }
      valsdict[ip] = valdict;
    }
  }

  console.log("###### valsdict", valsdict);

  var steps = [];
  steps = Object.keys(valsdict[ips[0]]);
  steps.sort(function(a, b) {
    return a - b;
  });

  var slider = svg
    .append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 5 + ")");
  // .attr("transform", "scale(0.5)");
  slider
    .append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "track-inset")
    .select(function() {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "track-overlay")
    .call(
      d3
        .drag()
        .on("start.interrupt", function() {
          slider.interrupt();
        })
        .on("start drag", function() {
          currentValue = d3.event.x;
          dragged(currentValue);
        })
    );

  slider
    .insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks)
    .enter()
    .append("text")
    .style("font", "candara")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return formatDate2(d);
    });

  var handle = slider
    .insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

  var label = slider
    .append("text")
    .attr("class", "label")
    .style("font-size", "15px")
    .style("fill", "white")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + -25 + ")")
    .attr("fill", "white");

  playButton.attr("transform", "translate(0,100)").on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      // timer = 0;
      button.text("Play");
    } else {
      moving = true;
      if (speed == 0.5) {
        timer = setInterval(step, 200);
      } else if (speed == 0.25) {
        timer = setInterval(step, 400);
      } else if (speed == 2) {
        timer = setInterval(step, 50);
      } else if (speed == 3) {
        timer = setInterval(step, 33);
      } else if (speed == 8) {
        timer = setInterval(step, 0.1);
      } else {
        timer = setInterval(step, 100);
      }
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  });

  function dragged(value) {
    var x = value;
    var index = null;
    var midPoint;
    var xVal;
    console.log("Dragged was called!", value);

    //only check values higher than index
    if (x > steps[ind]) {
      // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
      for (var j = ind - 1; j < steps.length - 1; j++) {
        if (x >= steps[j] && x <= steps[j + 1]) {
          index = j;
          break;
        }
      }
    }
    //only check values less than index
    else if (x < steps[ind]) {
      for (var j = ind + 1; j > -1; j--) {
        if (x >= steps[j] && x <= steps[j + 1]) {
          index = j;
          break;
        }
      }
    }
    midPoint = (steps[index] + steps[index + 1]) / 2;
    if (x < midPoint) {
      xVal = steps[index];
      ind = index;
    } else {
      xVal = steps[index + 1];
      ind = index + 1;
    }

    update(xVal);
  }

  function round(value, exp) {
    if (typeof exp === "undefined" || +exp === 0) return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) return NaN;

    // Shift
    value = value.toString().split("e");
    value = Math.round(+(value[0] + "e" + (value[1] ? +value[1] + exp : exp)));

    // Shift back
    value = value.toString().split("e");
    return +(value[0] + "e" + (value[1] ? +value[1] - exp : -exp));
  }

  function updateColor(h) {
    if (h in daysum) {
      //var percentZero = (daysum[h].zero/daysum[h].total)*100;
      //var sudo = round(percentZero,1);
      //console.log(round(percentZero,4));
      d3.select("#zero_value").text(
        +((daysum[h].zero / daysum[h].total) * 100).toFixed(1) + "%"
      );
      d3.select("#thirty_value").text(
        +((daysum[h].thirty / daysum[h].total) * 100).toFixed(1) + "%"
      );
      d3.select("#hund_value").text(
        +((daysum[h].hund / daysum[h].total) * 100).toFixed(1) + "%"
      );
      d3.select("#fihund_value").text(
        +((daysum[h].fihund / daysum[h].total) * 100).toFixed(1) + "%"
      );
      d3.select("#max_value").text(
        +((daysum[h].max / daysum[h].total) * 100).toFixed(1) + "%"
      );
      d3.select("#total_value").text(daysum[h].total);
    }
    if (!(h in colordict)) {
      var dict = {};
      allmites.each(function() {
        var mite = d3.select(this);
        var id = mite.attr("id").slice(-6);

        if (id[0] == "3") {
          ip = ref2["114-03-" + id];
        } else if (id[0] == "1") {
          ip = ref2["114-01-" + id];
          if (ip == undefined) {
            ip = ref2["114-0-" + id];
          }
        } else if (id[0] == "2") {
          ip = ref2["114-02-" + id];
        } else if (id[0] == "4") {
          ip = ref2["114-04-" + id];
        }

        if (ip in valsdict) {
          if (h in valsdict[ip]) {
            val = valsdict[ip][h];
          } else {
            val = null;
          }
          let range = d3.select("#" + mite.attr("id") + "_range");
          if (val == null) {
            range.style("fill", "none");
            dict[id] = "none";
          } else if (val < 30) {
            range.style("fill", greencolor(val)).style("opacity", 0.8);
            dict[id] = greencolor(val);
          } else {
            range.style("fill", redcolor(val)).style("opacity", 0.8);
            dict[id] = redcolor(val);
          }
        } else {
          dict[id] = "none";
        }
      });
      colordict[h] = dict;
    } else {
      allmites.each(function() {
        var mite = d3.select(this);
        var id = mite.attr("id").slice(-6);
        var range = d3.select("#" + mite.attr("id") + "_range");
        range.style("fill", colordict[h][id]).style("opacity", 0.8);
      });
    }
  }

  function step() {
    update(currentValue);
    currentValue = steps[ind];
    ind++;
    if (ind >= steps.length + 1) {
      playButton.text("Play");
      moving = false;
      currentValue = 0;
      ind = 0;
      clearInterval(timer);
      // timer = 0;

      console.log("Slider moving: " + moving);
    }
  }

  function update(h) {
    // update position and text of label according to slider scale
    let p = 0;
    let e = 0;
    for (let i = 0; i < steps.length; i++) {
      if (currentValue > pvalue && steps[i] > pvalue) {
        p = i;
        break;
      }
    }
    if (currentValue < pvalue) {
      for (let i = p; i < steps.length; i++) {
        if (steps[i] > currentValue) {
          e = i;
          break;
        }
      }
    }
    for (let i = p; i < e; i++) {
      updateColor(steps[i]);
    }
    updateColor(h);
    let d = x.invert(h);
    handle.attr("cx", h);
    label.attr("x", h).text(formatDate(d));
    pvalue = currentValue;
  }

  svg.attr("height", 130);
  console.log("before scale: ", svg);
  scale();
}

export { rebootslider };
