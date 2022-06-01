var http = require("http");
var log = require("log");
var cache = require("lib/cache");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
log.debug(request.queryString);
var frames =[];
var defaultIcon = "i10765";
var poolID = request.parameters.poolID || "";
var res = "";
function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}
function icoRequest () {
    redirect_uri = 'https://your.app.url/authorize';
    login = encodeURIComponent(request.parameters.username);
    password = encodeURIComponent(request.parameters.password);
    requestObj = {
        "url": "https://interop.ondilo.com/oauth2/authorize?client_id=customer_api&response_type=code&scope=api&state=12345&redirect_uri="+encodeURIComponent(redirect_uri),
        "method": "POST",
        "headers": {
            "Accept": "application/json",
            "Accept-Charset": "UTF-8",
            "Accept-Encoding": "gzip-deflate",
            "Content-Type": "application/x-www-form-urlencoded"
      	},
        "bodyString": 'login='+login+'&password='+password+'&locale=fr&proceed=Authorize'

    };
    auth_request = http.request(requestObj);
    if (auth_request.status == 302) {
        location = auth_request.headers['Location'];
        log.debug(location);
        if (location) {
          code = getAllUrlParams(location).code;
          log.debug(code);
          if (code) {
            token_request = http.request({
              "url": "https://interop.ondilo.com/oauth2/token",
              "method": "POST",
              "headers": {
                  "Accept": "application/json",
                  "Accept-Charset": "UTF-8",
                  "Accept-Encoding": "gzip-deflate",
                  "Content-Type": "application/x-www-form-urlencoded"
              },
              "bodyString": 'code='+code+'&grant_type=authorization_code&client_id=customer_api&redirect_uri='+encodeURIComponent(redirect_uri)
            });
            if (token_request.status == 200) {
                access_token = JSON.parse(token_request.body).access_token;
                log.debug(access_token);
              	return http.request({
                	"url": 'https://interop.ondilo.com/api/customer/v1/pools/'+poolID+'/lastmeasures',
                	"params": {},
                	"headers": {"Authorization": "Bearer " + access_token},
            	});
            }
          }
        }
    }
    return auth_request;
}

function addHiLowFrame(testValue, value, icon) {
  if (testValue > 0) {
    frames.push({"text": value.toFixed(1) + " HI", "icon": icon});
  } else {
    frames.push({"text": value.toFixed(1) + " LOW", "icon": icon});
  }
}

if (! poolID) {
    frames.push({"text": "missing poolID", "icon": defaultIcon});
} else {
    var api = cache.getCache(icoRequest, "ico_" + poolID, 1800, 300);
	if (api.status != 200) {
    	frames.push({"text": "Ondilo API returns error "  + api.status, "icon": defaultIcon});
	} else {
        res = JSON.parse(api.body);
        if (res) {
            //res.TIME = api.timestamp;
            log.debug(res);
            frames.push({"text": res[0].value.toFixed(0) + "°", "icon": defaultIcon});
            ph = res[2].value;
            phMin = 7;
            phMax = 7.6;
            if (ph < phMin) {
              addHiLowFrame(-1, ph, "i10775");
            }
            if (ph >  phMax) {
              addHiLowFrame(1, ph, "i10775");
            }
            if (ph < phMin || ph > phMax) {
              frames.push({"text": ph.toFixed(1), "icon": "i10767"});
            }
            // if(res.Desinfectant.Message !== "Parfait" && res.Desinfectant.Message !== "Bon"){
            //     addHiLowFrame(res.Desinfectant.Deviation, res.Desinfectant.Deviation, "i10776");
            // } else {
            //     // frames.push({"text": res.Desinfectant.Message, "icon": "i10777"});
            // }
        }
    }
}

response.addHeaders(configuration.crossDomainHeaders);
response.write(JSON.stringify({"frames": frames, "raw": res || '', "fromCache": api.isCached}));
response.close();
