const request = require('request');
const config = require('./config.json');

// STARTS HERE: Retrieve and process all Developers within the org.
runRepeated();

function runRepeated() {
    const options = {
        url: 'https://apigee.googleapis.com/v1/organizations/bap-amer-south-demo1/developers',
        headers: {
          'Authorization': 'Bearer ' + config.token
        }
      };
            
    request(options, callbackForDevs);

    setTimeout(runRepeated, 20000)
}


var developer = function(email) {
    this.emailAddress = email;
    var self = this;
    
    this.deleteApps = function() {
        console.log('Deleting apps for dev:' + this.emailAddress);
        runRequest(
            'https://apigee.googleapis.com/v1/organizations/bap-amer-south-demo1/developers/' + self.emailAddress + "/apps",
            'GET', config.token, self.callbackForApps);
    }

    this.callbackForApps = function(error, response, body){
        if (!body) {
            console.log('Error retrieving apps: ' + error);
            return;
        }
        console.log('Apps for ' + self.emailAddress + ': ' + body);
    
        const devUrl = "https://apigee.googleapis.com/v1/organizations/bap-amer-south-demo1/developers/" + self.emailAddress;
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
    if (response.statusCode != 200) {
        console.log('Error retrieving devs: ' + error);
        return;
    }
    const responseJSON = JSON.parse(body);
    const devs = responseJSON.developer;
    console.log('devs found: ' + devs.length)
    devs.forEach(handleDev);
}