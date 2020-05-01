var http = require("http");
var log = require("log");
var cache = require("lib/cache");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
log.debug(request.queryString);
var frames =[];
var defaultIcon = "i10765";
var serial = request.parameters.serial || "";
var res = "";

function fliprRequest () {
    auth_request = http.request({
        "url": "https://apis.goflipr.com/OAuth2/token",
        "method": "POST",
        "params": {"password": request.parameters.password, "username": request.parameters.username, "grant_type": "password"}
    });
    if (auth_request.status != 200) {
        frames.push({"text": "Goflipr API oAuth2 error " + auth_request.status, "icon": defaultIcon});
        return auth_request;
    } else {
        return http.request({
            "url": "https://apis.goflipr.com/modules/" + serial + "/survey/last",
            "params": {},
            "headers": {"Authorization": "Bearer " + JSON.parse(auth_request.body).access_token},
        });
    }
}

function addHiLowFrame(testValue, value, icon) {
  if (testValue > 0) {
    frames.push({"text": value.toFixed(1) + " HI", "icon": icon});
  } else {
    frames.push({"text": value.toFixed(1) + " LOW", "icon": icon});
  }
}

if (! serial) {
    frames.push({"text": "missing Flipr Serial Number", "icon": defaultIcon});
} else {
    var api = cache.getCache(fliprRequest, "flipr_" + serial, 1800, 300);
	if (api.status != 200) {
    	frames.push({"text": "Goflipr API returns error"  + api.status, "icon": defaultIcon});
	} else {
        res = JSON.parse(api.body);
        if (res) {
            res.TIME = api.timestamp;
            log.debug(res);
            frames.push({"text": res.Temperature.toFixed(0) + "°", "icon": defaultIcon});
            if(res.PH.Message !== "Bon" && res.PH.Message !== "Parfait"){
                addHiLowFrame(res.PH.Deviation, res.PH.Value, "i10775");
            } else {
                if (res.PH.Value < 7 || res.PH.Value > 7.2) {
                    frames.push({"text": res.PH.Value.toFixed(1), "icon": "i10767"});
                }
            }
            if(res.Desinfectant.Message !== "Parfait" && res.Desinfectant.Message !== "Bon"){
                addHiLowFrame(res.Desinfectant.Deviation, res.Desinfectant.Deviation, "i10776");
            } else {
                // frames.push({"text": res.Desinfectant.Message, "icon": "i10777"});
            }
        }
    }
}

response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames, "raw": res || '', "fromCache": api.isCached}));
response.close(); 