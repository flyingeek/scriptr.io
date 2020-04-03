var http = require("http");
var log = require("log");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
var frames = [];
var icon = "a3361";
var location = request.parameters.location || "333180";
api = http.request({
  "url": "http://www.meteofrance.com/mf3-rpc-portlet/rest/pluie/" + location,
  "params": {}
});
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
        frames.push({"text": "+ 1H", "icon": icon});
    } else {
        frames.push({"text": (delay * 5).toString(10) + " MN", "icon": icon});
        frames.push(chartFrame);
    }                             
}
response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames}));
response.close();

