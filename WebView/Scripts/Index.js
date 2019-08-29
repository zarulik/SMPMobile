var ds;
var smpMobileApi;
$(document).ready(function(){
    smpMobileApi = new SMPMobileAPI();
    ds = new IndexPage();
});

class IndexPage{
    constructor()
    {
        this.InitializeControls();
    }
    InitializeControls()
    {
        this.InitializeMenu();
        this.InitializeControlsEvents();
    }
    InitializeMenu() {
        $('#toggleMenu').click(function () {
            $('.toggle-menu-inner').css('top', $('nav')[0].scrollHeight + 2 + 'px');
            $('#toggle-menu').show();
            $('#toggle-menu').off('click').click(function (e) {
                $('#toggle-menu').hide();
            })
        });
        $('#settingsPage').click(function(e){
            SetCacheValue(CacheIds.previousPage,"../Index.html");
            window.location.replace("Pages/Settings.html");
            e.preventDefault();
        });
    }
    InitializeControlsEvents() {
        if(GetCacheValue(CacheIds.lastCredentials) && SMPMobileAPI.IsOnline)
        {
            smpMobileApi.Login(SMPMobileAPI.company,SMPMobileAPI.username,SMPMobileAPI.password,function(res){
                if(res){
                    SetCacheValue(CacheIds.token,res);
                    window.location.replace('Pages/Dispatches.html');
                }
            },function(err){})
        }
        $('#submitCredentials').click(function(){
            smpMobileApi.Login($('#companyInput').val(),$('#userNameInput').val(),$('#passwordInput').val(),function(res){
                if(res){
                    smpMobileApi.ShowModal('Success','Successfully sign in','info',3000);
                    SetCacheValue(CacheIds.lastCredentials,btoa(SMPMobileAPI.company.toLowerCase() + ":" + SMPMobileAPI.username.toLowerCase() + ":" + SMPMobileAPI.password, true));
                    SetCacheValue(CacheIds.token,res);
                    window.location.replace('Pages/Dispatches.html');
                }                    
                else{
                    smpMobileApi.ShowModal('Issue','Invalid credentials.',"danger",3000);
                }
            },function(err){
                if(err.status='401'){
                    smpMobileApi.ShowModal('Issue','Invalid credentials.',"danger",3000);    
                }
                else{
                    smpMobileApi.ShowModal('Issue','Sign in request failed.',"danger",3000);
                }
            });
            return false;
        });
    }
}