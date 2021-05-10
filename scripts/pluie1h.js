var http = require("http");
var log = require("log");
var cache = require("/lib/cache");
log.setLevel("DEBUG"); //levels are ERROR | WARN | INFO | DEBUG | OFF
var frames = [];
var icon = "a3361";
var location = request.parameters.location || "45, -0.6";
location = location.split(',');
function meteo1Request() {
    return http.request({
        "url": "https://rpcache-aa.meteofrance.com/internet2018client/2.0/nowcast/rain",
        "params": {'lat': location[0].trim(), 'lon': location[1].trim(), 'token': request.parameters.mfkey}
    });
}
var api = cache.getCache(meteo1Request, "meteo1hv2_" + location, 300, 300);
var api = meteo1Request();
if (api.status != 200) {
    console.warn(api);
    frames.push({"text": "ERROR", "icon": icon});
} else {
    var json = JSON.parse(api.body);
    var data = json["properties"]['forecast'];
    var data5 = [];
    data5.push(data[0].value);//0 0-5 5mn
    data5.push(data[1].value);//1 5-10 10mn
    data5.push(data[2].value);//2 10-15 15mn
    data5.push(data[3].value);//3 15-20 20mn
    data5.push(data[4].value);//4 20-25 25mn
    data5.push(data[5].value);//5 25-30 30mn
    data5.push(data[5].value);//6 30-35
    data5.push(data[6].value);//7 35-40 40mn
    data5.push(data[6].value);//8 40-45
    data5.push(data[7].value);//9 45-50 50mn
    data5.push(data[7].value);//10 50-55
    data5.push(data[8].value);//11 55-60 60mn
    var chartData = data5.map(function (v) {
        var level = parseInt(v, 10);
        return (level <= 1) ? 0 : level * 2;
    });
    var delay = chartData.findIndex(function (v) {
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

