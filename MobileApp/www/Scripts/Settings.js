var ds;
var smpMobileApi;
var bluetoothPrintersList=[];
$(document).ready(function(){
    smpMobileApi = new SMPMobileAPI();
    ds = new SettingsPage();
    document.addEventListener("deviceready", ds.LoadPrintersList, false);
});
function onDeviceReady() {
    console.log(starprnt);
}
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
            $('#serverEndpointInput').val(GetCacheValue(CacheIds.serverEndpoint)?GetCacheValue(CacheIds.serverEndpoint):"");
        }
        
        $('#lookupTimeoutInput').val(GetCacheValue(CacheIds.lookUpTimeOut)?GetCacheValue(CacheIds.lookUpTimeOut):1000);
        $('#lookupCountInput').val(GetCacheValue(CacheIds.lookUpCount)?GetCacheValue(CacheIds.lookUpCount):1000);
        $('#showTaskExtendedInfo').prop('checked',GetCacheValue(CacheIds.showTaskExtendedInfo)?(GetCacheValue(CacheIds.showTaskExtendedInfo)=='1'?true:false):false);
        if(GetCacheValue(CacheIds.paperSize))
        {
            $('#paperSize option').prop('selected',false);
            $('#paperSize option[value="'+GetCacheValue(CacheIds.paperSize)+'"]').prop('selected',true);
        }
        if(GetCacheValue(CacheIds.printerMode))
        {
            $('#printerMode option').prop('selected',false);
            $('#printerMode option[value="'+GetCacheValue(CacheIds.printerMode)+'"]').prop('selected',true);
        }
        $('[data-toggle="popover"]').popover();
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
            if($("#printersList").val()!="NONE")
            {
                var printerRecord = FindRecordsByParams(bluetoothPrintersList,true,[{Name:"modelName",Value:$("#printersList").val()}])[0];
                if(printerRecord)
                {
                    SetCacheValue(CacheIds.printerAddress,printerRecord.portName);
                }
            }
            SetCacheValue(CacheIds.paperSize, $('#paperSize').val());
            SetCacheValue(CacheIds.printerMode,$('#printerMode').val());
            smpMobileApi.ShowModal("Success","Settings saved.",'success',3000);
            e.preventDefault();
        });
        $('#backBtn').click(function(e){
            var prevPage = GetCacheValue(CacheIds.previousPage);
            window.location.replace(prevPage);
            e.preventDefault();
        })
    }
    LoadPrintersList(){
        starprnt.portDiscovery('Bluetooth', function(result) {
            bluetoothPrintersList = result;
            $('#printersList option').remove();
            $('#printersList').append('<option value="NONE">NONE</option>');
            result.forEach(printer => {
                var isSelected ="";
                if(GetCacheValue(CacheIds.printerAddress) && printer.portName == GetCacheValue(CacheIds.printerAddress))
                {
                    isSelected="selected"
                }
                $('#printersList').append('<option value="'+printer.modelName+'" '+isSelected+'>'+printer.modelName+'</option>');

            });
        },
        function(error){
            smpMobileApi.ShowModal(
                "Issue",
                "Issue during loading <strong>Printers List</strong>."+error,
                "danger",
                15000
              );
        });
    }
}

