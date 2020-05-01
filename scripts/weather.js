var http = require("http");
var log = require("log");
var cache = require("/lib/cache");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
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
var api = cache.getCache(owRequest, "openweather_" + zip, 900, 300);
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
var location = request.parameters.location || "333180";
var icon = "a3361";
function meteo1Request() {
    return http.request({
  		"url": "http://www.meteofrance.com/mf3-rpc-portlet/rest/pluie/" + location,
  		"params": {}
	});
}
api = cache.getCache(meteo1Request, "meteo1h_" + location, 300, 300);

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
        // frames.push({"text": "+ 1H", "icon": "i" + icon.substring(1)});
    } else {
        frames.push({"text": (delay * 5).toString(10) + " MN", "icon": icon});
        frames.push(chartFrame);
    }                             
}
response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames}));
response.close();