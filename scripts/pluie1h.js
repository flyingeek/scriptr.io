var http = require("http");
var log = require("log");
var cache = require("/lib/cache");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
var frames = [];
var icon = "a3361";
var location = request.parameters.location || "333180";
function meteo1Request() {
  return http.request({
      "url": "http://www.meteofrance.com/mf3-rpc-portlet/rest/pluie/" + location,
      "params": {}
  });
}
var api = cache.getCache(meteo1Request, "meteo1h_" + location, 300, 300);
if (api.status != 200) {
    frames.push({"text": "ERROR", "icon": icon});
} else {
    var json = JSON.parse(api.body);
    var data = json["dataCadran"].map(function(v) {
        return v["niveauPluie"];
    });
    var chartData = json["dataCadran"].map(function(v) {
        var level = v["niveauPluie"];
        return (level <= 1) ? 0 : level * 2;
    });
    var delay = data.findIndex(function(v) {
       return v >= 2;
    });
    var chartFrame = {"index": 0, "chartData": chartData};
    if (delay === 0) {
        frames.push({"text": "NOW !", "icon": icon});
        frames.push(chartFrame);
    } else if (delay < 0) {
        frames.push({"text": "+ 1H", "icon": "i" + icon.substring(1)});
    } else {
        frames.push({"text": (delay * 5).toString(10) + " MN", "icon": icon});
        frames.push(chartFrame);
    }                             
}
response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames}));
response.close();

