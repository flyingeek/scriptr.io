var http = require("http");
var log = require("log");
var cache = require("/lib/cache");
log.setLevel("DEBUG"); //levels are ERROR | WARN | INFO | DEBUG | OFF
var frames = [];

// Current Weather based on OpenWeather
var icon = "i73";
var zip = request.parameters.zip || "33600,fr";
function owRequest () {
    return http.request({
    	"url" : "http://api.openweathermap.org/data/2.5/weather",
    	"params": {
        	"appid": request.parameters.owkey,
        	"zip": zip,
        	"units": "metric"
   		 }
	});
}
var api = cache.getCache(owRequest, "openweatherv3_" + zip, 900, 300);
if (api.status != 200) {
    frames.push({"text": "API ERROR", "icon": icon});
} else {
    var json, owIcon, temp;
    try {
    	json = JSON.parse(api.body);
    	owIcon = json["weather"][0]["icon"];
    	temp = Math.round(parseFloat(json["main"]["temp"]));
    } catch (error) {
        frames.push({"text": error, "icon": icon});
    }
    switch (owIcon) {
        case "01d":
        case "01n":
            icon = "i2155"; // clear sky
            break;
        case "02d":
        case "02n":
            icon = "i73"; // few clouds
            break;
        case "03d":
        case "03n":
            icon = "i876"; // scattered clouds
            break;
        case "04d":
        case "04n":
            icon = "i2152"; // broken clouds
            break;
        case "09d":
        case "09n":
            icon = "a72"; // shower rain
            break;
        case "10d":
        case "10n":
            icon = "i72"; // rain
            break;
        case "11d":
        case "11n":
            icon = "a11428"; // thunderstorm
            break;
        case "13d":
        case "13n":
            icon = "a2151"; // snow
            break;
        case "50d":
        case "50n":
            icon = "i676"; // mist
            break;
        default:
            icon = "i36546"; // unknown
    }
    frames.push({"text": temp.toString(10) + "°", "icon": icon});
}

// Rain at 1h frames
var icon = "a3361";
var location = request.parameters.location || "45, -0.6";
var locationArray = location.split(',');
function meteo1Request() {
    resp = http.request({
        "url": "https://rpcache-aa.meteofrance.com/internet2018client/2.0/nowcast/rain",
        "params": {'lat': locationArray[0].trim(), 'lon': locationArray[1].trim(), 'token': request.parameters.mfkey, 'timestamp': (Date.now()).toString()}
    });
    log.debug('X-Cache-Status:' + resp.headers["X-Cache-Status"]);
    return {
        "status": (resp.headers["X-Cache-Status"] === 'EXPIRED') ? 409 : resp.status,
        "body": resp.body          
    }
}
var api = cache.getCache(meteo1Request, "meteo1hv5_" + location, 120, 60);
if (api.status != 200) {
    log.warn(api);
    frames.push({"text": "ERROR", "icon": icon});
} else {
    var json = JSON.parse(api.body);
    var data = json["properties"]['forecast'];
    log.debug(data.map(function(o){return o.rain_intensity}));
    var data5 = [];
    data5.push(data[0].rain_intensity);//0 0-5 5mn
    data5.push(data[1].rain_intensity);//1 5-10 10mn
    data5.push(data[2].rain_intensity);//2 10-15 15mn
    data5.push(data[3].rain_intensity);//3 15-20 20mn
    data5.push(data[4].rain_intensity);//4 20-25 25mn
    data5.push(data[5].rain_intensity);//5 25-30 30mn
    data5.push(data[5].rain_intensity);//6 30-35
    data5.push(data[6].rain_intensity);//7 35-40 40mn
    data5.push(data[6].rain_intensity);//8 40-45
    data5.push(data[7].rain_intensity);//9 45-50 50mn
    data5.push(data[7].rain_intensity);//10 50-55
    data5.push(data[8].rain_intensity);//11 55-60 60mn
    log.debug(data5);
    var chartData = data5.map(function (v) {
        var level = parseInt(v, 10);
        return (level <= 1) ? 0 : level * 2;
    });
    log.debug(chartData);
    var delay = chartData.findIndex(function (v) {
        return v >= 2;
    });
    log.debug(delay);
    var chartFrame = {"index": 0, "chartData": chartData};
    if (delay === 0) {
        frames.push({"text": "NOW !", "icon": icon});
        frames.push(chartFrame);
    } else if (delay < 0) {
        //frames.push({"text": "+ 1H", "icon": "i" + icon.substring(1)});
    } else {
        frames.push({"text": (delay * 5).toString(10) + " MN", "icon": icon});
        frames.push(chartFrame);
    }
}

response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames}));
response.close();