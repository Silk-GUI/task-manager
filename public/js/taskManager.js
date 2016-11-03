var methods = null;

var eurecaClient = new Eureca.Client({
  transport: 'sockjs'
});

function sort(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

var taskManager = new Vue({
  el: '#apps',
  data: {
    apps: []
  },
  methods: {
    'restart': function (app) {
      methods.restart({
        path: app.path
      }).onReady(function (err, data) {
      });
    }
  }
});

eurecaClient.ready(function (serverProxy) {
  console.dir(serverProxy);
  methods = serverProxy;
  serverProxy.apps().onReady(function (data) {
    data.sort(sort);
    console.log('received apps', data);
    taskManager.$data.apps = data;
  });

  start(serverProxy);
});

$('.reload').click(function () {
  location.reload();
});

function start(methods) {
  /* Processes list */
  var processes = new Vue({
    el: '#processes',
    data: {
      processes: []
    },
    methods: {
      kill: function (process) {
        // TODO: implement
      }
    }
  });

  function updateProcesses() {
    methods.processes().onReady(function (data) {
      processes.$data.processes = data;
      setTimeout(updateProcesses, 5000);
    });
  }
  updateProcesses();

  Chart.defaults.global.animation = false;
  Chart.defaults.global.showTooltips = false;
  //Chart.defaults.global.responsive = true;
  /* cpu usage */
  var cpuUsage = memUsage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var ctx = $("#cpuUsageChart").get(0).getContext("2d");
  var data = {
    labels: [" ", " ", " ", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    datasets: [{
      label: "CPU",
      fillColor: "rgba(83, 210, 30, 0.35)",
      strokeColor: "rgba(220,220,220,0)",
      pointColor: "rgba(220,220,220,0)",
      pointStrokeColor: "rgba(0,0,0,0)",
      pointHighlightFill: "rgba(0,0,0,0)",
      pointHighlightStroke: "rgba(220,220,220,0)",
      data: cpuUsage
    }]
  };
  var cpuChart = new Chart(ctx).Line(data, {
    bezierCurve: false,
    scaleOverride: true,
    scaleSteps: 5,
    scaleStepWidth: 20,
    scaleStartValue: 0
  });
  var getCpu = function () {
    methods.cpuUsage().onReady(function (data) {
      data = data * 100;
      data = Math.floor(data);
      cpuUsage.push(data);
      cpuUsage.shift();
      //console.log(cpuUsage);
      cpuChart.removeData();
      cpuChart.addData([data], " ");
      //cpuChart.datasets[0].data = cpuUsage;
      //cpuChart.update();
      $('.cpu-used').text(data + '%');
      setTimeout(getCpu, 1);
    });
  };
  getCpu();

  // memory
  var totalMem = 0;
  var memChart;

  function initMem() {
    methods.totalMem().onReady(function (data) {
      totalMem = data;
      $('.mem-total').text(totalMem);
      var chartData = {
        labels: [" ", " ", " ", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        datasets: [{
          label: "Memory",
          fillColor: "rgba(37, 101, 212, 0.35)",
          strokeColor: "rgba(220,220,220,0)",
          pointColor: "rgba(220,220,220,0)",
          pointStrokeColor: "rgba(0,0,0,0)",
          pointHighlightFill: "rgba(0,0,0,0)",
          pointHighlightStroke: "rgba(220,220,220,0)",
          data: memUsage
        }]
      };
      var memContext = $("#memUsageChart").get(0).getContext("2d");

      // calculate number of steps
      var amount = 500;
      var steps = data / 500;
      if (steps > 20) {
        amount = 5000;
        steps = data / 5000;
      } else if (steps > 8) {
        amount = 2000;
        steps = data / 2000;
      }
      // add another step if there is a remainder
      if ((data % amount) > 0) {
        steps += 1;
      }
      memChart = new Chart(memContext).Line(chartData, {
        bezierCurve: false,
        scaleOverride: true,
        scaleSteps: steps,
        scaleStepWidth: amount,
        scaleStartValue: 0
      });
      // if we don't do this, the memory chart isn't shown.
      $('.tabs').tabs('select_tab', 'apps');
      getMem();
      console.log('init mem');
    });
  }

  function getMem() {
    methods.freeMem().onReady(function (data) {
      memChart.removeData();
      memChart.addData([totalMem - data], " ");
      $('.mem-used').text(totalMem - Math.round(data));
      setTimeout(getMem, 1000);
    });
  }

  initMem();
}



//     return;
//      methods.call("taskManager/apps", {}, function (err, data) {
//       if (err) {
//         console.log(err);
//       }
//       data.sort(sort);
//     //  alert(JSON.stringify(data));
//       taskManager.$data.apps = data;
//     });
//     $(".reload").click(function () {
//       location.reload();
//     });
//     /* processes */
//     // refreshed every 5 seconds since it is a little slow
//     var processes = new Vue({
//       el: "#processes",
//       data: {
//         processes: []
//       },
//       methods: {
//         kill: function (process) {

//         }
//       }
//     });
//     function updateProcesses () {
//       methods.call("taskManager/processes", null, function (err, data) {
//         //console.log(data);
//         var result = 0;
//         data.forEach(function (item, index) {
//           if(item.command === "Google Chrome Helper" || item.command === "Google Chrome") {
//             result += 1;
//           }
//         });
//         //console.log('data', result);
//         result = 0;
//         processes.$data.processes = data;
//         processes.$data.processes.forEach(function (item, index) {
//           if(item.command === "Google Chrome Helper" || item.command === "Google Chrome") {
//             result += 1;
//           }
//         });
//         //console.log('vue data',result);
//         setTimeout(updateProcesses, 5000);
//       });
//     }
//     updateProcesses();
//     /* performance */

//     Chart.defaults.global.animation = false;
//     Chart.defaults.global.showTooltips = false;
//     //Chart.defaults.global.responsive = true;
//     /* cpu usage */
//     var cpuUsage = memUsage = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
//     var ctx = $("#cpuUsageChart").get(0).getContext("2d");
//     var data = {
//     labels: [" ", " ", " ", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
//     datasets: [
//         {
//             label: "CPU",
//             fillColor: "rgba(83, 210, 30, 0.35)",
//             strokeColor: "rgba(220,220,220,0)",
//             pointColor: "rgba(220,220,220,0)",
//             pointStrokeColor: "rgba(0,0,0,0)",
//             pointHighlightFill: "rgba(0,0,0,0)",
//             pointHighlightStroke: "rgba(220,220,220,0)",
//             data: cpuUsage
//         }
//     ]
// };
//     var cpuChart = new Chart(ctx).Line(data, {bezierCurve: false,
//         scaleOverride: true,
//           scaleSteps: 5,
//           scaleStepWidth: 20,
//           scaleStartValue: 0
//     });
//     var getCpu = function () {
//       methods.listen("taskManager/cpuUsage", {}, function (err, data) {
//       data = data * 100;
//       data = Math.floor(data);
//       cpuUsage.push(data);
//       cpuUsage.shift();
//       //console.log(cpuUsage);
//       cpuChart.removeData();
//       cpuChart.addData([data], " ");
//       //cpuChart.datasets[0].data = cpuUsage;
//       //cpuChart.update();
//       $('.cpu-used').text(data + '%');
//       setTimeout(getCpu, 1);

//     });
//   };
//   getCpu();

//   // memory
//   var totalMem = 0;
//   var memChart;
//   function initMem () {
//     methods.call("taskManager/totalMemory", {}, function (err, data) {
//       if(err) {
//         alert(err);
//       }
//       totalMem = data;
//       $('.mem-total').text(totalMem);
//           var chartData = {
//           labels: [" ", " ", " ", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
//           datasets: [
//               {
//                   label: "Memory",
//                   fillColor: "rgba(37, 101, 212, 0.35)",
//                   strokeColor: "rgba(220,220,220,0)",
//                   pointColor: "rgba(220,220,220,0)",
//                   pointStrokeColor: "rgba(0,0,0,0)",
//                   pointHighlightFill: "rgba(0,0,0,0)",
//                   pointHighlightStroke: "rgba(220,220,220,0)",
//                   data: memUsage
//               }
//           ]
//       };
//       var memContext = $("#memUsageChart").get(0).getContext("2d");

//       // calculate number of steps
//       var amount = 500;
//       var steps = data / 500;
//      if (steps > 20) {
//         amount = 5000;
//         steps = data / 5000;
//       } else if(steps > 8) {
//           amount = 2000;
//           steps = data / 2000;
//         }
//       // add another step if there is a remainder
//       if((data % amount) > 0) {
//         steps += 1;
//       }
//       memChart = new Chart(memContext).Line(chartData, {bezierCurve: false,
//         scaleOverride: true,
//         scaleSteps: steps,
//         scaleStepWidth: amount,
//         scaleStartValue: 0
//           });
//       // if we don't do this, the memory chart isn't shown.
//       $('.tabs').tabs('select_tab', 'apps');
//       getMem();
//       console.log('init mem');
//     });
//   }
//   function getMem () {
//     methods.call('taskManager/freeMemory', {}, function (err, data) {
//       if(err) {
//         alert(err);
//       }
//       //console.log(data);
//       memChart.removeData();
//       memChart.addData([totalMem - data], " ");
//       $('.mem-used').text(totalMem - Math.round(data));
//       setTimeout(getMem, 1000);
//     });
//   }

//   initMem();