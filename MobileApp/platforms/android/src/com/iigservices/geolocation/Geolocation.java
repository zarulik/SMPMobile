package com.iigservices.geolocation;

import android.Manifest;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.location.Location;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AlertDialog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.json.JSONArray;
import org.json.JSONException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.*;

import java.util.List;

public class Geolocation extends CordovaPlugin {

    String TAG = "GeolocationPlugin";
    CallbackContext context;
    private GoogleApiClient googleApiClient;
    final static int REQUEST_LOCATION = 199;

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        LOG.d(TAG, "We are entering execute");
        context = callbackContext;
        if(action.equals("enableLocation"))
        {
            final LocationManager manager = (LocationManager) cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
            if (manager.isProviderEnabled(LocationManager.GPS_PROVIDER) && hasGPSDevice(cordova.getActivity())) {
                callbackContext.success("OK");
                return true;
            }
            else if(!hasGPSDevice(cordova.getActivity())){
                callbackContext.error("Gps is not supported");
                return true;
            }
            else if (!manager.isProviderEnabled(LocationManager.GPS_PROVIDER) && hasGPSDevice(cordova.getActivity())) {
                enableLoc();
                return true;
            }
        }
        else if(action.equals("isLocationEnabled"))
        {
            final LocationManager manager1 = (LocationManager) cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
            if (manager1.isProviderEnabled(LocationManager.GPS_PROVIDER) && hasGPSDevice(cordova.getActivity())) {
                callbackContext.success("OK");
                return true;
            }
            else if(!hasGPSDevice(cordova.getActivity())){
                callbackContext.error("Gps is not supported");
                return true;
            }
            else if (!manager1.isProviderEnabled(LocationManager.GPS_PROVIDER) && hasGPSDevice(cordova.getActivity())) {
                callbackContext.error("Location Services are not enabled.");
                return true;
            }
        }

        return false;
    }
    private void enableLoc() {

        if (googleApiClient == null) {
            googleApiClient = new GoogleApiClient.Builder(cordova.getActivity())
                    .addApi(LocationServices.API)
                    .addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks() {
                        @Override
                        public void onConnected(Bundle bundle) {
     
                        }
     
                        @Override
                        public void onConnectionSuspended(int i) {
                            googleApiClient.connect();
                        }
                    })
                    .addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener() {
                        @Override
                        public void onConnectionFailed(ConnectionResult connectionResult) {
                            context.error("Location error " + connectionResult.getErrorCode());
                            Log.d("Location error","Location error " + connectionResult.getErrorCode());
                        }
                    }).build();
            googleApiClient.connect();
        }
     
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        locationRequest.setInterval(30 * 1000);
        locationRequest.setFastestInterval(5 * 1000);
        LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest);
     
        builder.setAlwaysShow(true);
     
        PendingResult<LocationSettingsResult> result =
                LocationServices.SettingsApi.checkLocationSettings(googleApiClient, builder.build());
        result.setResultCallback(new ResultCallback<LocationSettingsResult>() {
            @Override
            public void onResult(LocationSettingsResult result) {
                final Status status = result.getStatus();
                switch (status.getStatusCode()) {
                    case LocationSettingsStatusCodes.RESOLUTION_REQUIRED:
                        try {
                            // Show the dialog by calling startResolutionForResult(),
                            // and check the result in onActivityResult().
                            cordova.setActivityResultCallback(Geolocation.this);
                            status.startResolutionForResult(cordova.getActivity(), REQUEST_LOCATION);
                        } catch (IntentSender.SendIntentException e) {
                            // Ignore the error.
                        }
                        break;
                }
            }
        });
     }
     @Override
     public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
         if(resultCode == cordova.getActivity().RESULT_OK){
             context.success("OK");
             return;
         }else if(resultCode == cordova.getActivity().RESULT_CANCELED){
             context.error("User refused to modify Settings");
             return;
         }
         // Handle other results if exists.
         super.onActivityResult(requestCode, resultCode, data);
     }
     private boolean hasGPSDevice(Context context) {
        final LocationManager mgr = (LocationManager) context
                .getSystemService(Context.LOCATION_SERVICE);
        if (mgr == null)
            return false;
        final List<String> providers = mgr.getAllProviders();
        if (providers == null)
            return false;
        return providers.contains(LocationManager.GPS_PROVIDER);
     }
     
}