const request = require('request');
const config = require('./config.json');
const baseUrl = "https://apigee.googleapis.com/v1/organizations/" + config.org;

// STARTS HERE: Retrieve and process all Developers within the org.
runRepeated();

function runRepeated() {
    const options = {
        url: baseUrl + '/developers',
        headers: {
          'Authorization': 'Bearer ' + config.token
        }
      };
            
    request(options, callbackForDevs);
}

var developer = function(email) {
    this.emailAddress = email;
    var self = this;
    
    this.deleteApps = function() {
        console.log('Deleting apps for dev:' + this.emailAddress);
        runRequest(
            baseUrl + '/developers/' + self.emailAddress + "/apps",
            'GET', config.token, self.callbackForApps);
    }

    this.callbackForApps = function(error, response, body){
        if (!body) {
            console.log('Error retrieving apps: ' + error);
            return;
        }
        console.log('Apps for ' + self.emailAddress + ': ' + body);
    
        const devUrl = baseUrl + "/developers/" + self.emailAddress;
        const apps = JSON.parse(body).app;
        if (apps) {
            console.log('Apps found for dev "' + self.emailAddress + '": ' + apps.length);
            for (var i = 0; i < apps.length; i++) {
                runRequest(
                    devUrl + "/apps/" + apps[i].appId,
                    "DELETE", config.token, self.deleteAppCallback);
            }
        } else {
            console.log('No apps for dev ' + email);
            runRequest(devUrl, "DELETE", config.token, self.deleteDevCallback);           
        }
    }

    this.deleteDevCallback = function(error, response, body) {
        console.log('Delete dev response: ' + body);
    }
    

    this.deleteAppCallback = function(error, response, body) {
        console.log('delete app response: ' + body);
    }
}

function runRequest(url, method, token, callback) {
    var options = {
        url: url,
        method: method,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    console.log('request to ' + options.url);
    request(options, callback);
}

function handleDev(dev) {
    if (dev.email.startsWith('joe.developer-')) {
        var joeDev = new developer(dev.email);
        joeDev.deleteApps();
    }
}


function callbackForDevs(error, response, body) {
    if (response.statusCode == 401) {
        console.log('Invalid or expired token for Apigee API.');
    } else if (response.statusCode != 200) {
        console.log('Error retrieving devs: ' + response.statusCode);
        return;
    } else {
        const responseJSON = JSON.parse(body);
        const devs = responseJSON.developer;
        if (devs && devs.length  > 0) {
            console.log('devs found: ' + devs.length)
            devs.forEach(handleDev);
            // Run again after this batch has time to process.
            setTimeout(runRepeated, 20000);
        } else {
            console.log('No devs found.');
        }
    }
}
