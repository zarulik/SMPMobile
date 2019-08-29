import CoreLocation

@objc(Geolocation) class Geolocation : CDVPlugin , CLLocationManagerDelegate {
    var callbackID:String!
    var locationManager: CLLocationManager!
    override func pluginInitialize(){
        callbackID=""
        locationManager = CLLocationManager()
        locationManager.delegate = self
    }
  @objc(isLocationEnabled:)
  func isLocationEnabled(command: CDVInvokedUrlCommand){
    self.callbackID = command.callbackId
    var pluginResult = CDVPluginResult(
      status: CDVCommandStatus_ERROR
    )
    if !CLLocationManager.locationServicesEnabled(){
        pluginResult = CDVPluginResult(
            status: CDVCommandStatus_ERROR,
            messageAs: "Location Services are not enabled."
        )
    }
    else{
        pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: "OK"
        )
    }
    self.commandDelegate!.send(
        pluginResult,
        callbackId: command.callbackId
    )
  }
    
  @objc(enableLocation:)
  func enableLocation(command: CDVInvokedUrlCommand) {
    self.callbackID = command.callbackId
    var pluginResult = CDVPluginResult(
      status: CDVCommandStatus_ERROR
    )
    let infoDictionary: NSDictionary = Bundle.main.infoDictionary! as NSDictionary
    let appName: NSString = infoDictionary.object(forKey: "CFBundleName") as! NSString
    if !CLLocationManager.locationServicesEnabled() || !(CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedWhenInUse || CLLocationManager.authorizationStatus() != CLAuthorizationStatus.authorizedAlways){
        let controller = UIAlertController(title: "Turn On Location Services to Allow \(appName as String) to Determine Your Location", message: "", preferredStyle: .alert)
        
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", comment:"" ), style: .cancel, handler: {action in
            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: "User refused to modify Settings"
            )
            
            self.commandDelegate!.send(
                pluginResult,
                callbackId: command.callbackId
            )
        })
        let settingsAction = UIAlertAction(title: NSLocalizedString("Settings", comment:"" ), style: .default, handler: { action in
            UIApplication.shared.openURL(URL(string: UIApplication.openSettingsURLString)!)
            NotificationCenter.default.addObserver(self, selector: #selector(self.settingChanged), name: UIApplication.willEnterForegroundNotification, object: UIApplication.shared)
        })
        controller.addAction(cancelAction)
        controller.addAction(settingsAction)
        
        self.viewController.present(controller, animated: true, completion: nil)
    }
    else {
        pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: "OK"
        )
        
        self.commandDelegate!.send(
            pluginResult,
            callbackId: command.callbackId
        )
    }
  }
    @objc func settingChanged() {
        var pluginResult = CDVPluginResult(
            status: CDVCommandStatus_ERROR
        )
        if !CLLocationManager.locationServicesEnabled(){
            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_ERROR,
                messageAs: "User refused to modify Settings"
            )
        }
        else{
            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: "OK"
            )
        }
        self.commandDelegate!.send(
            pluginResult,
            callbackId: self.callbackID
        )
        NotificationCenter.default.removeObserver(self)
    }
    func checkAccess() -> Bool {
        return CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedAlways || CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedWhenInUse
    }

    func SYSTEM_VERSION_LESS_THAN(version: String) -> Bool {
        return UIDevice.current.systemVersion.compare(version, options: NSString.CompareOptions.numeric) == ComparisonResult.orderedAscending
    }
}
