window["speechRecognition"] = {
    hasPermission: function(){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.hasPermission(function (isGranted){
                resolve(isGranted);
            }, function(err){
                reject(err);
            });
        });
    },
    requestPermission: function(){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.requestPermission(function (){
                resolve();
            }, function (err){
                reject();
            });
        });
    },
    startRecognition: function(settings){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.startListening(function(result){
                resolve(result);
            }, function(err){
                reject(err);
            }, settings);
        });
    },
    getSupportedLanguages: function(){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.getSupportedLanguages(function(result){
                resolve(result);
            }, function(err){
                reject(err);
            });
        });
    },
    isRecognitionAvailable: function(){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.isRecognitionAvailable(function(available){
                resolve(available);
            }, function(err){
                reject(err);
            });
        });
    },
    stopListening: function(){
        return new Promise(function(resolve, reject){
            window.plugins.speechRecognition.stopListening(function(){
                resolve();
            }, function(err){
                reject(err);
            });
        });
    }
};