var http = require("http");
var log = require("log");
var cache = require("lib/cache");
log.setLevel("INFO"); //levels are ERROR | WARN | INFO | DEBUG | OFF
log.debug(request.queryString);
var frames =[];
var defaultIcon = "i10765";
var poolID = request.parameters.poolID || "";
var res = "";

function icoRequest () {
    redirect_uri = 'https://your.app.url/authorize';
    auth_request = http.request({
        "url": "https://interop.ondilo.com/oauth2/authorize",
        "method": "POST",
        "headers": {
            "Accept": "application/json",
            "Accept-Charset": "UTF-8",
            "Accept-Encoding": "gzip-deflate",
            "Content-Type": "application/x-www-form-urlencoded"
      },
      "params": {
          "client_id": 'customer_api',
          "response_type": 'code',
          redirect_uri,
          "scope": 'api',
          "state": '12345'
        },
        "bodyString": `login=${encodeURIComponent(request.parameters.username)}&password=${encodeURIComponent(request.parameters.password)}&locale=fr&proceed=Authorize`

    });
    if (auth_request.status === 302) {
        location = new URL(auth_request.headers.Location);
        if (location) {
          code = location.searchParams.get('code');
          if (code) {
            token_request = http.request({
              "url": "https://interop.ondilo.com/oauth2/authorize",
              "method": "POST",
              "headers": {
                  "Accept": "application/json",
                  "Accept-Charset": "UTF-8",
                  "Accept-Encoding": "gzip-deflate",
                  "Content-Type": "application/x-www-form-urlencoded"
              },
              "bodyString": `code=${code}&grant_type=authorization_code&client_id=customer_api&redirect_uri=${encodeURIComponent(redirect_uri)}`
            });
            if (token_request.status === 200) {
              return http.request({
                "url": `https://interop.ondilo.com/api/customer/v1/pools/${poolID}/lastmeasures`,
                "params": {},
                "headers": {"Authorization": "Bearer " + JSON.parse(token_request.body).access_token},
            });
            }
          }
        }
        frames.push({"text": "Ondilo API oAuth2 error " + auth_request.status, "icon": defaultIcon});
        return auth_request;
    }
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
    var api = cache.getCache(icoRequest, "ico_" + serial, 1800, 300);
	if (api.status != 200) {
    	frames.push({"text": "Ondilo API returns error"  + api.status, "icon": defaultIcon});
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
