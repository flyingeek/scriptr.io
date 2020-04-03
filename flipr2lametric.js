var http = require("http");
var log = require("log");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
log.debug(request.queryString);
var frames =[];
var defaultIcon = "i10765";

function fetchFliprData(serial, username, password) {
  var res;
  var ts = Math.floor((new Date).getTime()/1000);
  var timeout = 300;
  var apiErrorText = "Goflipr API returns error ";
  if(serial){
    if(storage.local.apiStatus && storage.local.apiStatus==200){
      timeout = 1800;
    }
    if(storage.local.apiStatus && storage.local.jsonTime && ts < (storage.local.jsonTime + timeout)){
      isCached = true;
      if (storage.local.apiStatus == 200 && storage.local.jsonResults){
        return storage.local.jsonResults;
      } else {
        frames.push({"text": apiErrorText + storage.local.apiStatus, "icon": defaultIcon});
      }
    } else {
      isCached = false;
      auth_request = http.request({
        "url": "https://apis.goflipr.com/OAuth2/token",
        "method": "POST",
        "params": {"password": password, "username": username, "grant_type": "password"}
      });
      if (auth_request.status != 200) {
        frames.push({"text": apiErrorText + auth_request.status, "icon": defaultIcon});
      } else {
        res = JSON.parse(auth_request.body);
        token = res.access_token;
      }
      var api = http.request({
        "url": "https://apis.goflipr.com/modules/" + serial + "/survey/last",
        "params": {},
        "headers": {"Authorization": "Bearer " + token},
      });
      storage.local.apiStatus = api.status;
      storage.local.jsonTime = ts;
      if (api.status != 200) {
        frames.push({"text": apiErrorText + api.status, "icon": defaultIcon});
      } else {
        res = JSON.parse(api.body);
        res.TIME = ts;
        storage.local.jsonResults = res;
        return res;
      }
    }
  }else{
    frames.push({"text": "missing Flipr Serial Number", "icon": defaultIcon});
  }
}

function addHiLowFrame(testValue, value, icon) {
  if (testValue > 0) {
    frames.push({"text": value.toFixed(1) + " HI", "icon": icon});
  } else {
    frames.push({"text": value.toFixed(1) + " LOW", "icon": icon});
  }
}

res = fetchFliprData(request.parameters.serial, request.parameters.username, request.parameters.password);
if (res) {
  log.debug(res);
  frames.push({"text": res.Temperature.toFixed(0) + "°", "icon": defaultIcon});
  if(res.PH.Message !== "Bon" && res.PH.Message !== "Parfait"){
    addHiLowFrame(res.PH.Deviation, res.PH.Value, "i10775");
  } else {
    frames.push({"text": res.PH.Value.toFixed(1), "icon": "i10767"});
  }
  if(res.Desinfectant.Message !== "Parfait" && res.Desinfectant.Message !== "Bon"){
    addHiLowFrame(res.Desinfectant.Deviation, res.Desinfectant.Deviation, "i10776");
  } else {
    frames.push({"text": res.Desinfectant.Message, "icon": "i10777"});
  }
}

response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames, "raw": storage.local.jsonResults || '', "fromCache": isCached}));
response.close(); 