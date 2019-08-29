var argscheck = require('cordova/argscheck');
var utils = require('cordova/utils');
var exec = require('cordova/exec');

var geolocation = {
    enableLocation: function (successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'geolocation.enableLocation', arguments);
        exec(successCallback, errorCallback, 'IIGGeolocation', 'enableLocation', []);
    },
    isLocationEnabled: function (successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'geolocation.isLocationEnabled', arguments);
        exec(successCallback, errorCallback, 'IIGGeolocation', 'isLocationEnabled', []);
    }
};

module.exports = geolocation;