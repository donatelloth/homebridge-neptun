var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-neptun", "Neptun", NeptunAccessory);
}

function NeptunAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.username = config["username"];
  this.password  = config["password"];
  
  this.service = new Service.Valve(this.name);
  
  this.service
    .getCharacteristic(Characteristic.Active)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));
  
  this.service
    .getCharacteristic(Characteristic.InUse)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));
}

NeptunAccessory.prototype.getState = function(callback) {
  this.log("Getting current state...");
  
  request.post({
    url: "https://api.sst-cloud.com/auth/login/",
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: { username: this.username, password: this.password, email: this.username, language: "ru" }
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var key = json.key; // "key what we find"
      this.log("The key is %s", key);
        request.get({
            url: "https://api.sst-cloud.com/houses",
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'Authorization': 'Token ' + key
            },
          }, function(err, response, body) {
            
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              var house = json[0].id; // "getting the house"
              this.log("Your houses are %s", house);
                  request.get({
                    url: "https://api.sst-cloud.com/houses/" + house + "/devices/",
                    headers: {
                      'content-type': 'application/x-www-form-urlencoded',
                      'Authorization': 'Token ' + key
                    },
                  }, function(err, response, body) {
                    
                    if (!err && response.statusCode == 200) {
                      var json = JSON.parse(body);
                      for (i=0; i<json.length; i++) {
                        if (json[i].type == 2) {
                            var deviceIdSensors = json[i].id
                            var parsed_configuration = JSON.parse(json[i].parsed_configuration)
                        }
                        else if (json[i].type == 5) {
                            var deviceIdThermo = json[i].id
                            // characteristic.Thermo.parsed_configuration = JSON.parse(msg.payload[i].parsed_configuration)
                            // characteristic.Thermo.chart_temperature_comfort = msg.payload[i].chart_temperature_comfort
                            // characteristic.Thermo.chart_temperature_economical = msg.payload[i].chart_temperature_economical
                            // characteristic.Thermo.time_setting = msg.payload[i].time_setting
                        }
                      }
                      this.log("Parsed configuration is %s", JSON.stringify(parsed_configuration));
                  request.get({
                    url: "https://api.sst-cloud.com/houses/" + house + "/devices/",
                    headers: {
                      'content-type': 'application/x-www-form-urlencoded',
                      'Authorization': 'Token ' + key
                    },
                  }, function(err, response, body) {
                    
                    if (!err && response.statusCode == 200) {
                      var json = JSON.parse(body);
                      for (i=0; i<json.length; i++) {
                        if (json[i].type == 2) {
                            //var deviceIdSensors = json[i].id
                            var parsed_configuration = JSON.parse(json[i].parsed_configuration)
                            var locked = parsed_configuration.settings.valve_settings === "opened"
                            callback(null, locked); // success
                        }
                        else if (json[i].type == 5) {
                            //var deviceIdThermo = json[i].id
                            // characteristic.Thermo.parsed_configuration = JSON.parse(msg.payload[i].parsed_configuration)
                            // characteristic.Thermo.chart_temperature_comfort = msg.payload[i].chart_temperature_comfort
                            // characteristic.Thermo.chart_temperature_economical = msg.payload[i].chart_temperature_economical
                            // characteristic.Thermo.time_setting = msg.payload[i].time_setting
                        }
                      }
                    }
                    else {
                      this.log("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
                      //var locked = state == "lock"
                      //callback(null, locked); // success
                    }
                    else {
                      this.log("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
            }
            else {
              this.log("Error getting house (status code %s): %s", response.statusCode, err);
              callback(err);
            }
        }.bind(this));
    }
    else {
      this.log("Error getting key (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}
  
NeptunAccessory.prototype.setState = function(state, callback) {
  var lockitronState = (state == Characteristic.LockTargetState.SECURED) ? "lock" : "unlock";

  this.log("Set state to %s", lockitronState);

  request.put({
    url: "https://api.lockitron.com/v2/locks/"+this.lockID,
    qs: { access_token: this.accessToken, state: lockitronState }
  }, function(err, response, body) {

    if (!err && response.statusCode == 200) {
      this.log("State change complete.");
      
      // we succeeded, so update the "current" state as well
      var currentState = (state == Characteristic.LockTargetState.SECURED) ?
        Characteristic.LockCurrentState.SECURED : Characteristic.LockCurrentState.UNSECURED;
      
      this.service
        .setCharacteristic(Characteristic.LockCurrentState, currentState);
      
      callback(null); // success
    }
    else {
      this.log("Error '%s' setting lock state. Response: %s", err, body);
      callback(err || new Error("Error setting lock state."));
    }
  }.bind(this));
}

NeptunAccessory.prototype.getServices = function() {
  return [this.service];
}