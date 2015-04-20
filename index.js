var os = require('os-utils'),
    exec = require('child_process').exec;

Silk.methods.add({
  'taskManager/apps': function(data, call_obj, send){
    Silk.api.call('apps/list', {}, function(err, data){
      console.dir(err);
      send(err, data);
    });
  },
  'taskManager/restart': function(data, call_obj, send){
    console.log("will restart + " + data.name);
    Silk.api.call('apps/restart', data.name, function(err, result) {
      console.log(err);
      console.log(result);
    });
  },
  'taskManager/cpuUsage': function(data, call_obj, send) {
    os.cpuUsage(function(usage){
        send(null, usage);
    });
  },
  'taskManager/totalMemory': function(data, call_obj, send) {
    return os.totalmem();
  },
  'taskManager/freeMemory': function(data, call_obj, send) {
    return os.freemem();
  },
  'taskManager/processes': function(data, call_obj, send) {
    var startTime = new Date().getTime();
    exec('ps aux -c', function (err, data) {
      data = data.split('\n');
      data.splice(0, 1);
      // last line is blank
      data.splice(data.length - 1, 1);
      var processes = [];
      //console.dir(data);
      var dataLength = data.length;
      var command;
      //console.log('dataLength:', dataLength);
      // each line
      for(var i = 0; i < dataLength; ++i) {
        var item = data[i];
        item = item.split(" ");

        // remove empty strings
        var itemLength = item.length;
        for (var x = 0; x < itemLength; ++x) {
          if (item[x] === '') {
            item.splice(x, 1);
            x -= 1;
          }
        }

        if(item.length > 10) {
          // command name has spaces
          command = item.slice(10, item.length);
          command = command.join(' ');
        }

        item = {
          user: item[0],
          pid: item[1],
          cpu: item[2],
          mem: item[3],
          vsz: item[4],
          rss: item[5],
          tt: item[6],
          stat: item[7],
          started: item[8],
          time: item[9],
          command: command || item[10]
        };
        processes.push(item);
      }

      //console.dir(processes);
      var endTime = new Date().getTime();
      //console.log('found google chrome:', isTrue);
      console.log('took ' + (endTime - startTime));
      //console.log('finishing length', processes.length);

      //console.dir(processes);
      send(null, processes);
    });
  }
});