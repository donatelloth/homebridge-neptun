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
     .on('get', this.getInUse.bind(this))
 //    .on('set', this.setInUse.bind(this));
}


NeptunAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current state...");
  
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
      this.log.debug("The key is %s", key);
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
              this.log.debug("Your houses are %s", house);
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
                            var state = parsed_configuration.settings.valve_settings
                            var locked = state === "opened"
                            callback(null, locked); // success
                            this.log.debug("Current state is %s", parsed_configuration.settings.valve_settings);
                        }
                      }
                      this.log.debug("Parsed configuration is %s", JSON.stringify(parsed_configuration));
                    }
                    else {
                      this.log.debug("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
            }
            else {
              this.log.debug("Error getting house (status code %s): %s", response.statusCode, err);
              callback(err);
            }
        }.bind(this));
    }
    else {
      this.log.debug("Error getting key (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

NeptunAccessory.prototype.getInUse = function(callback) {
  this.log.debug("Getting current state...");
  
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
      this.log.debug("The key is %s", key);
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
              this.log.debug("Your houses are %s", house);
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
                            var state = parsed_configuration.settings.valve_settings
                            var locked = state === "opened"
                            callback(null, locked); // success
                            this.log.debug("Current state is %s", parsed_configuration.settings.valve_settings);
                        }
                      }
                      this.log.debug("Parsed configuration is %s", JSON.stringify(parsed_configuration));
                    }
                    else {
                      this.log.debug("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
            }
            else {
              this.log.debug("Error getting house (status code %s): %s", response.statusCode, err);
              callback(err);
            }
        }.bind(this));
    }
    else {
      this.log.debug("Error getting key (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

NeptunAccessory.prototype.setInUse = function(callback) {
  this.log.debug("Getting current state...");
  
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
      this.log.debug("The key is %s", key);
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
              this.log.debug("Your houses are %s", house);
                  request.get({
                    url: "https://api.sst-cloud.com/houses/" + house + "/devices/",
                    headers: {
                      'content-type': 'application/x-www-form-urlencoded',
                      'Authorization': 'Token ' + key
                    },
                  }, function(err, response, body) {
                      
                    if (!err && response.statusCode == 200) {
                      var neptunState
                      // = (state == Characteristic.Active.SECURED) ? "opened" : "closed";
                      if (state !== Characteristic.Active.SECURED) {
                        neptunState = 1
                      }
                      else {
                        neptunState = 0
                      }
                      //var neptunState = "closed"
                      this.log.debug("Set state to %s", neptunState);
                      var json = JSON.parse(body);
                      for (i=0; i<json.length; i++) {
                        if (json[i].type == 2) {
                            var deviceIdSensors = json[i].id
                            var parsed_configuration = JSON.parse(json[i].parsed_configuration)
                            request.post({
                                url: "https://api.sst-cloud.com/houses/" + house + "/devices/" + deviceIdSensors + "/valve_settings/",
                                headers: {
                                  'content-type': 'application/x-www-form-urlencoded',
                                  'Authorization': 'Token ' + key
                                },
                                form: {house: house, deviceIdSensors: deviceIdSensors, valve_settings: neptunState }
                              }, function(err, response, body) {

                                if (!err && response.statusCode == 200) {
                                  this.log.debug("State change processing to %s", neptunState);
                                }
                                else {
                                  this.log.debug("Error '%s' setting lock state. Response: %s", err, body);
                                  callback(err || new Error("Error setting lock state."));
                                }
                            }.bind(this));
                        }
                      }
                      this.log.debug("Parsed configuration is %s", JSON.stringify(parsed_configuration));
                    }
                    else {
                      this.log.debug("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
            }
            else {
              this.log.debug("Error getting house (status code %s): %s", response.statusCode, err);
              callback(err);
            }
        }.bind(this));
    }
    else {
      this.log.debug("Error getting key (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}
  
NeptunAccessory.prototype.setState = function(state, callback) {
  this.log.debug("Getting current state...");
  
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
      this.log.debug("The key is %s", key);
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
              this.log.debug("Your houses are %s", house);
                  request.get({
                    url: "https://api.sst-cloud.com/houses/" + house + "/devices/",
                    headers: {
                      'content-type': 'application/x-www-form-urlencoded',
                      'Authorization': 'Token ' + key
                    },
                  }, function(err, response, body) {
                      
                    if (!err && response.statusCode == 200) {
                      //var neptunState = (state == Characteristic.Active.UNSECURED) ? "opened" : "closed";
                      if (state == 1) {
                        neptunState = "opened"
                      }
                      else {
                        neptunState = "closed"
                      }
                      //var neptunState = "closed"
                      this.log.debug("Set state to %s", neptunState);
                      var json = JSON.parse(body);
                      for (i=0; i<json.length; i++) {
                        if (json[i].type == 2) {
                            var deviceIdSensors = json[i].id
                            var parsed_configuration = JSON.parse(json[i].parsed_configuration)
                            request.post({
                                url: "https://api.sst-cloud.com/houses/" + house + "/devices/" + deviceIdSensors + "/valve_settings/",
                                headers: {
                                  'content-type': 'application/x-www-form-urlencoded',
                                  'Authorization': 'Token ' + key
                                },
                                form: {house: house, deviceIdSensors: deviceIdSensors, valve_settings: neptunState }
                              }, function(err, response, body) {

                                if (!err && response.statusCode == 200) {
                                  this.log.debug("State change processing to %s", neptunState);
                                  var currentState = state
                                  //this.service.setCharacteristic(Characteristic.Active, currentState);
                                  this.service.setCharacteristic(Characteristic.InUse, currentState);
                                  callback(null); // success
                                }
                                else {
                                  this.log.debug("Error '%s' setting lock state. Response: %s", err, body);
                                  callback(err || new Error("Error setting lock state."));
                                }
                            }.bind(this));
                        }
                      }
                      this.log.debug("Parsed configuration is %s", JSON.stringify(parsed_configuration));
                    }
                    else {
                      this.log.debug("Error getting configuration (status code %s): %s", response.statusCode, err);
                      callback(err);
                    }
                  }.bind(this));
            }
            else {
              this.log.debug("Error getting house (status code %s): %s", response.statusCode, err);
              callback(err);
            }
        }.bind(this));
    }
    else {
      this.log.debug("Error getting key (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

NeptunAccessory.prototype.getServices = function() {
  return [this.service];
}