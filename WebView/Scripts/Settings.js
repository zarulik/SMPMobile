var ds;
var smpMobileApi;
$(document).ready(function(){
    smpMobileApi = new SMPMobileAPI();
    ds = new SettingsPage();
});
class SettingsPage{
    constructor(){
        this.InitializeSettings();
        this.InitializeControlsEvents();
    }
    InitializeSettings()
    {
        if(SMPMobileAPI.IsMobileVersion)
        {
            $('#serverEndpointFormGroup').toggleClass('d-none');
            $('#serverEndpointInput').val(GetCacheValue(CacheIds.serverEndpoint)?GetCacheValue(CacheIds.serverEndpoint):"http://192.168.1.94/SMPMobile");
        }
        
        $('#lookupTimeoutInput').val(GetCacheValue(CacheIds.lookUpTimeOut)?GetCacheValue(CacheIds.lookUpTimeOut):1000);
        $('#lookupCountInput').val(GetCacheValue(CacheIds.lookUpCount)?GetCacheValue(CacheIds.lookUpCount):1000);
        $('#showTaskExtendedInfo').prop('checked',GetCacheValue(CacheIds.showTaskExtendedInfo)?(GetCacheValue(CacheIds.showTaskExtendedInfo)=='1'?true:false):false);
    }
    InitializeControlsEvents(){
        $('#submitSettingsBtn').click(function(e){
            if(SMPMobileAPI.IsMobileVersion)
            {
                SetCacheValue(CacheIds.serverEndpoint,$('#serverEndpointInput').val().endsWith('/')?$('#serverEndpointInput').val(): ($('#serverEndpointInput').val()+"/"));
            }
            SetCacheValue(CacheIds.lookUpTimeOut,$('#lookupTimeoutInput').val());
            SetCacheValue(CacheIds.lookUpCount,$('#lookupCountInput').val());
            SetCacheValue(CacheIds.showTaskExtendedInfo,$('#showTaskExtendedInfo').prop('checked')?1:0);
            smpMobileApi.ShowModal("Success","Settings saved.",'success',3000);
            e.preventDefault();
        });
        $('#backBtn').click(function(e){
            var prevPage = GetCacheValue(CacheIds.previousPage);
            window.location.replace(prevPage);
            e.preventDefault();
        })
    }
}

