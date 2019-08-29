var CacheIds = {
  serverEndpoint: "SERVER_ENDPOINT",
  lookUpTimeOut: "LOOKUP_TIMEOUT",
  lookUpCount: "LOOKUP_COUNT",
  showTaskExtendedInfo: "SHOW_TASK_EXT_INFO",
  printerAddress: "PRINTER_ADDRESS",
  paperSize: "PAPER_SIZE",
  printerMode: "PRINTER_MODE",
  lastCredentials: "LAST_CREDENTIALS",
  token: "TOKENID",
  selectedTaskDispatch: "SELECTED_TASK_DISPATCH",
  previousPage : "PREV_PAGE",
  app_state: "APP_STATE"
};
var RowStates = {
  UNCHANGED: 0,
  INSERTED: 1,
  UPDATED: 2,
  DELETED: 3
}
Number.prototype.RoundTo = function (decimals){
  if(!decimals)
    decimals=0;
	return Number(Math.round(this+'e'+decimals)+'e-'+decimals).toFixed(decimals);
}
$.expr[":"].containsInsensitive = $.expr.createPseudo(function(arg) {
  return function( elem ) {
      return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
  };
});
function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
function beautifyRecords(modifiedRecs){
	var resultArray = [];
	modifiedRecs.forEach(item =>{
		let recordKeySplits = item.RecordKey.split(':');
		let rec = {CompanyCode: item.CompanyCode, TableName: item.TableName, TaskNo: recordKeySplits[0], State: 2};
		if(recordKeySplits.length>1)
        {
			if(recordKeySplits[1].indexOf('.')>0)
            {
				rec.DispatchNo =null;
				rec.AttachmentName = recordKeySplits[1];
            }
			else
            {
				rec.DispatchNo = recordKeySplits[1];
				rec.AttachmentName = null;
            }
        }
		else
		{
			rec.DispatchNo = null;
			rec.AttachmentName = null;
        }
		if(recordKeySplits.length>2)
        {
			rec.LineKey = recordKeySplits[2];
        }
		else
		{
			rec.LineKey = null;
        }
		resultArray.push(rec);
    });
	return resultArray;
}
function GetCacheValue(id) {
  if(id==CacheIds.serverEndpoint && !SMPMobileAPI.IsMobileVersion)
  {
    return getCurrentEndpoint();
  }
  return window.localStorage.getItem(id);
}
function getCurrentEndpoint(){
	var origin = window.location.origin;
	var endpoint = window.location.pathname.split('/')[window.location.pathname.startsWith('/')?1:0];
	return origin.endsWith('/')?(origin+endpoint):(origin+'/'+endpoint);
}
function SetCacheValue(id, value) {
  window.localStorage.setItem(id, value);
}
function RemoveCacheValue(id) {
  window.localStorage.removeItem(id);
}
function createCaretPlacer(atStart) {
  return function (el) {
      el.focus();
      if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(atStart);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.collapse(atStart);
          textRange.select();
      }
  };
}
function PopulateLineFeeds(value){
	var retVal = '';
  var counter =0;
  var modalWidth = $('#printModal .modal-body').width();
  var limit = 8 ;
  if(modalWidth<300)
  {
    limit=8;
  }
  else if(modalWidth<400)
  {
    limit=13;
  }
  else
  {
    limit=16;
  }
	for(var index in value)
    {
		if(counter==limit)
        {
			retVal +=' ';
			counter=1;
			retVal += value[index];
        }
		else
		{
			counter++;
			retVal += value[index];
        }
    }
	return retVal;
}
function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}
function GetDatePartOfDate(date) {
  if (date) {
    var d = new Date(date);
    var month = d.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    var day = d.getDate();
    day = day < 10 ? "0" + day : day;
    var year = d.getFullYear();
    return month + "/" + day + "/" + year;
  }
  return "";
}
function GetDateForInput(date) {
  if (date) {
    var d = new Date(date);
    var month = d.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    var day = d.getDate();
    day = day < 10 ? "0" + day : day;
    var year = d.getFullYear();
    return  year+'-'+month + "-" + day;
  }
  return "";
}
function GetTimePartOfDate(date) {
  if (date) {
    var d = new Date(date);
    var hours = d.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    var minutes = d.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes;
  }
  return "";
}
function GetFormattedTime(time) {
  if (time) {
    var numTime = parseFloat(time);
    var hours = Math.floor(numTime);
    var minutes = (numTime - hours).RoundTo(2) * 100;
    minutes = parseInt((minutes * 60) / 100);
    return (hours<10?'0'+hours:hours) + ":" + (minutes<10?'0'+minutes:minutes);
  }
  return "";
}
function FormattedTimeToDecimal(time)
{
  if(time)
  {
    var result = parseFloat(time.split(':')[0]);
    result +=(parseFloat(time.split(':')[1])/60);
    return result.RoundTo(2);
  }
  return null;
}
function FindRowByFieldNameValuePair(array, fieldName, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][fieldName] == value) {
      return array[i];
    }
  }
  return null;
}
function FindRecordsByParams(array,firstOnly,opts)
{
  var resultSet = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    var isOur = true;
    for (let index = 0; index < opts.length; index++) {
      const opt = opts[index];
      if(element[opt.Name]==opt.Value)
        isOur = isOur && true;
      else
        isOur = false;
    }
    if(isOur)
    {
      resultSet.push(element);
      if(firstOnly)
        break;
    }
  }
  return resultSet;
}
function FindIndexByFieldNameValuePair(array, fieldName, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][fieldName] == value) {
      return i;
    }
  }
  return null;
}
function unpack(str) {
  var bytes = [];
  for(var i = 0, n = str.length; i < n; i++) {
      var char = str.charCodeAt(i);
      bytes.push(char >>> 8, char & 0xFF);
  }
  return bytes;
}
// function GetLocation(){
//   var promise =new Promise(function(resolve,reject){
//     navigator.geolocation.getCurrentPosition(resolve,reject, { maximumAge: 60000, timeout: 30000, enableHighAccuracy: true });
//   });
//   let retVal = promise.then(position=>{return position},error=>{smpMobileApi.ShowModal(
//     "Issue",
//     "Failed to get Geolocation" +
//       err.Message,
//     "danger",
//     15000
//   )});
//   return retVal;
// }
class SMPMobileAPI 
{
  constructor() 
  {
    if(GetCacheValue(CacheIds.app_state)=="" || GetCacheValue(CacheIds.app_state)==null)
    {
      SetCacheValue(CacheIds.app_state,1);
    }
    SMPMobileAPI.IsOnline = GetCacheValue(CacheIds.app_state)==1;
    SMPMobileAPI.IsMobileVersion = true;
    $.ajaxSetup({
      beforeSend: function(req) {
        var credentials=null;
        if(SMPMobileAPI.company && SMPMobileAPI.username && SMPMobileAPI.password)
          credentials = SMPMobileAPI.company.toLowerCase()+':'+SMPMobileAPI.username.toLowerCase()+':'+SMPMobileAPI.password;
        req.setRequestHeader(
          "Authorization",
          "Basic " +(credentials?btoa(credentials,true) :GetCacheValue(CacheIds.token))
        );
      },
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      timeout: 240000
    });
  }
  PutGeolocation(position,success,error){
    if(position)
    {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/Dispatch/Geolocation",
        data: JSON.stringify({Latitude: position.coords.latitude,Longitude: position.coords.longitude})

      })
      .done(function(res){
        if(res.Status!="fail")
          success(res);
        else
          error(res);
      }).fail(function(err){
        error(err);
      })
    }
  }
  Login(company, username, password, success, error) {
    SMPMobileAPI.company = company;
    SMPMobileAPI.username = username;
    SMPMobileAPI.password = password;
    if (SMPMobileAPI.IsOnline) {
      if(GetCacheValue(CacheIds.serverEndpoint)==null || GetCacheValue(CacheIds.serverEndpoint)=="")
      {
        smpMobileApi.ShowModal('Issue','Server Endpoint is not set.',"danger",3000);    
        return;
      }
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/CheckLogin"
      })
        .done(function(res) {
          smpMobileApi.GetGeolocation(function(position){
            smpMobileApi.PutGeolocation(position,function(res1){
              success(res);
              console.log(res);
            },
            function(err){
              success(res);
              console.log(err)});
          },
          function(error){
            success(res);
            console.log(error);
          });
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      if (company && username && password)
        if(
          btoa(
            SMPMobileAPI.company.toLowerCase() +
              ":" +
              SMPMobileAPI.username.toLowerCase() +
              ":" +
              SMPMobileAPI.password,
            true
          ) == GetCacheValue(CacheIds.lastCredentials)
        ) {
          success(GetCacheValue(CacheIds.token));
        } else {
          error({ Status: "401" });
        }
      else
      {
        var token = GetCacheValue(CacheIds.token);
        var lastCredentials = atob(GetCacheValue(CacheIds.lastCredentials));
        lastCredentials = lastCredentials.split(':')[0].toUpperCase() +':'+ lastCredentials.split(':')[1].toUpperCase() +':'+ lastCredentials.split(':')[2];
        if(token == btoa(lastCredentials))
        {
          success(token);
        } else {
          error({ Status: "401" });
        }
      }
    }
  }
  GenerateInvoice(taskNo,dispatchNo,success,error)
  {
    if(SMPMobileAPI.IsOnline){
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/GenerateInvoice/"+taskNo+"/"+dispatchNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    }
    else{

    }
  }
  GetApplicationModel(success, error)
  {
    $.ajax({
      method: "GET",
      url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/All",
      timeout: 600000 
    })
      .done(function(res) {
        if (res.Status != "fail") 
          success(res);
        else {
          error(res);
        }
      })
      .fail(function(err) {
        error(err);
      });
  }
  GetGeolocation(success,error)
  {
    // if(SMPMobileAPI.IsLocationEnabled==undefined)
    //   iig.geolocation.enableLocation(function(retVal){
    //     SMPMobileAPI.IsLocationEnabled = true;
    //     navigator.geolocation.getCurrentPosition(success,error,{maximumAge:60000,timeout:120000,enableHighAccuracy:true});
    //   },function(err){
    //     SMPMobileAPI.IsLocationEnabled = false;
    //     error("Location is not enabled or application has not corresponding access rights.");      
    //   });
    // else{
    //   if(SMPMobileAPI.IsLocationEnabled)
        
    //   else
    //     error("Location is not enabled or application has not corresponding access rights.");      
    // }
    iig.geolocation.isLocationEnabled(function(okRetVal){
      navigator.geolocation.getCurrentPosition(success,error,{maximumAge:60000,timeout:120000,enableHighAccuracy:true});
    },function(disabledRetVal){
      var path = window.location.pathname;
      var page = path.split("/").pop();
      if(page=="Index.html")
      {
        iig.geolocation.enableLocation(function(retVal){
          navigator.geolocation.getCurrentPosition(success,error,{maximumAge:60000,timeout:120000,enableHighAccuracy:true});
        },function(err){
          error("Location is not enabled or application has not corresponding access rights.");      
        });
      }
      else{
        error("Location is not enabled or application has not corresponding access rights.");      
      }
    });
    
  }
  GetDispatchData(taskNo,dispatchNo,success,error)
  {
    $.ajax({
      method: "GET",
      url: GetCacheValue(CacheIds.serverEndpoint) +'/api/dispatch/DispatchData/'+taskNo+'/'+dispatchNo,
      timeout: 600000 
    }).done(function(res) {
      if (res.Status != "fail") 
        success(res);
      else {
        error(res);
      }
    }).fail(function(err) {
      error(err);
    });
  }
  GetARBillToSoldTos(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/ARBillToSoldTo"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetARBillToSoldTos(success,error);
    }
  }
  GetCIOptions(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/CIOptions"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCIOptions(success,error);
    }
  }
  GetAROptions(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/AROptions"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetAROptions(success,error);
    }
  }
  GetBMBillHeaders(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/BMBillHeaders"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetBMBillHeaders(success,error);
    }
  }
  GetBMBillOptionHeaders(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/BMBillOptionHeaders"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetBMBillOptionHeaders(success,error);
    }
  }
  GetBMBillOptionCategories(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/BMBillOptionCategories"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetBMBillOptionCategories(success,error);
    }
  }
  GetBMOptions(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/BMOptions"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetBMOptions(success,error);
    }
  }
  GetCIItems(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/CIItems"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCIItems(success,error);
    }
  }
  GetLaborSkillCodes(success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint)+'/api/common/SMLaborSkillCodes'
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetLaborSkillCodes(success,error);
    }
  }
  GetNextDeliveries(customer,scheduledDate,taskNo,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint)+`/api/dispatch/NextDeliveries/${encodeURIComponent(customer)}/${scheduledDate}/${taskNo}`
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetNextDeliveries(customer,scheduledDate,taskNo,success,error);
    }
  }
  GetLastDeliveries(customer,scheduledDate,taskNo,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint)+`/api/dispatch/LastDeliveries/${encodeURIComponent(customer)}/${scheduledDate}/${taskNo}`
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetLastDeliveries(customer,scheduledDate,taskNo,success,error);
    }
  }
  GetContractsDetails(success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Contracts/Details/"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
    }
  }
  GetContractsHeaders(success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Contracts/Headers"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
    }
  }  
  GetCoverageCodes(success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/CoverageCodes"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCoverageCodes(success,error);
    }
  }
  GetCompanyInfo(success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/Company"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCompanyInfo(success,error);
    }
  }
  GetCustomerCreditCards(arDivision, customerNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Cards/"+arDivision+"/"+customerNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCustomerCreditCards(arDivision,customerNo,success,error);
    }
  }
  GetCustomerTechLaborSkillRate(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/CustomerTechLaborSkillRates"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetCustomerTechLaborSkillRate(success,error);
    }
  } 
  GetDispatch(taskNo, dispatchNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/"+taskNo+"/"+dispatchNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatch(taskNo,dispatchNo,success,error);
    }
  }
  GetTaskAttachment(taskNo,fileName,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        dataType: 'binary',
        cache: false,
        processData: false,
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Task/Attachments/"+taskNo+"/"+fileName
      })
        .done(function(res,textStatus, jqXHR) {
          res.Hash =jqXHR.getResponseHeader('Hash');
          success(res);
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskAttachment(taskNo,fileName,success,error);
    }
  }
  GetDispatchDetails(taskNo, dispatchNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchDetails(taskNo,dispatchNo,success,error);
    }
  }
  GetDispatchDetail(taskNo, dispatchNo,lineKey, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo+"/"+lineKey
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchDetail(taskNo,dispatchNo,lineKey,success,error);
    }
  }
  GetDispatchDetailLabors(taskNo, dispatchNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchDetailLabors(taskNo,dispatchNo,success,error);
    }
  }
  GetDispatchDetailLabor(taskNo, dispatchNo,lineKey, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo+"/"+lineKey
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchDetailLabor(taskNo,dispatchNo,lineKey,success,error);
    }
  }
  GetDispatchPayments(taskDispatchNo,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Payments"+ (taskDispatchNo!=null && taskDispatchNo!=""?("/"+taskDispatchNo):"")
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchPayments(taskDispatchNo,success,error);
    }
  }
  GetNatureOfTasks(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/NatureOfTasks"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetNatureOfTasks(success,error);
    }
  }
  GetPaymentTypes(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/ARPaymentTypes"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetPaymentTypes(success,error);
    }
  }
  GetPriceCodes(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/PriceCodes"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetPriceCodes(success,error);
    }
  }
  GetPriceLevels(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/PriceLevels"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetPriceLevels(success,error);
    }
  }
  GetSMOptions(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/SMOptions"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetSMOptions(success,error);
    }
  }
  GetSOOptions(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/SOOptions"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetSOOptions(success,error);
    }
  }
  GetTaskAttachments(taskNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Task/Attachments/"+taskNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskAttachments(taskNo,success,error);
    }
  }
  GetTaskContractDetails(contractNo,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Contracts/Details/"+contractNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskContractDetails(contractNo,success,error);
    }
  }
  GetTaskPayments(taskNo,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Tasks/Payments"+ (taskNo!=null && taskNo!=""?("/"+taskNo):"")
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskPayments(taskNo,success,error);
    }
  }
  GetTaskContractHeader(contractNo,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Contracts/Headers/"+contractNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskContractHeader(contractNo,success,error);
    }
  }
  GetTaskDispatchStatuses(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/TaskDispatchStatuses"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskDispatchStatuses(success,error);
    }
  }
  GetTaskInfo(taskNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) +
          "/api/dispatch/Task/"+taskNo
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskInfo(taskNo,success,error);
    }
  }
  GetTaskTypes(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/TaskTypes"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTaskTypes(success,error);
    }
  }
  GetTaxRate(arDivision,customerNo,taxSchedule,success,error)
  {
    dbEngine.GetTaxRate(arDivision,customerNo,taxSchedule,success,error);
  }
  GetTechnician(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/Techinician"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTechnician(success,error);
    }
  }
  GetTechnicianDispatchesPreviews(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/dispatches"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatches(success,error);
    }
  }
  GetDispatchDescriptions(list, success, error) {
    if (SMPMobileAPI.IsOnline) {
      var list1 = [];

      for (var a = 0; a < list.length; a++) {
        list1.push(list[`${a}`].TaskNo + list[`${a}`].DispatchNo);
      }

      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/dispatchDescriptions",
        data: JSON.stringify(list1)
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetDispatchDescriptions(success, error)
    }
  }
  GetTechnicianTasksInfo(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/TasksInfo"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetTasks(success,error);
    }
  }
  GetWorkingDaysDetails(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/WorkingDaysDetails"
      })
        .done(function(res) {
          if (res.Status != "fail") success(res);
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.GetWorkingDaysDetails(success,error);
    }
  }  
  ToggleOnlineState(success,error)
  {
    if(SMPMobileAPI.IsOnline)
    {
      this.GoToOfflineMode(success,error);
    }
    else
    {
      this.GoToOnlineMode(success,error);
    }
  }
  GoToOfflineMode(success,error)
  {
    DBEngine.DeleteDatabase(
      function(res) {
        dbEngine = new DBEngine();
        dbEngine.InitializeDatabase(
          function() {
            SetCacheValue(CacheIds.app_state,0);
            success();
          },
      function(err) {
        error(err);
      })
    },
    function(err) {
      error(err)
    });
  }
  GoToOnlineMode(success,error)
  {
    dbEngine.GetModifiedRecordsList(async function(list){
      var groupedByTasksRecords = groupBy(beautifyRecords(list),'TaskNo');
      var offlineModifications = [];
      var errorsList=[];
      for(var groupKey in groupedByTasksRecords)
      {
        var OfflineModification = {
          Task: null,
          Attachments: [],
          Dispatches : []
        };
        OfflineModification.Task = await dbEngine.GetTaskInfoForSync(groupKey).catch(function(err){ errorsList.push(err); });
        var dispatchGroups = groupBy(groupedByTasksRecords[groupKey],'DispatchNo');
        for(var dispatchKey in dispatchGroups)
        {
          if(dispatchKey=="null")//Attachments group
          {
            for(var i =0;i<dispatchGroups[dispatchKey].length;i++)
            {
              var attachment = dispatchGroups[dispatchKey][i];
              if(attachment.AttachmentName)
                OfflineModification.Attachments.push(await dbEngine.GetTaskAttachmentForSync(attachment.TaskNo,attachment.AttachmentName).catch(function(err){ errorsList.push(err); }));
            }
          }
          else//Dispatch group
          {
            var DispatchView ={
              DispatchHeader : null,
              DispatchDetails: [],
              DispatchLabors: []
            }
            for(var i =0;i<dispatchGroups[dispatchKey].length;i++)
            {
              var dispatchItem = dispatchGroups[dispatchKey][i];
              switch(dispatchItem.TableName)
              {
                case "SMDispatchHeader":
                  DispatchView.DispatchHeader = await dbEngine.GetDispatchForSync(dispatchItem.TaskNo,dispatchItem.DispatchNo).catch(function(err){ errorsList.push(err); });
                  break;
                case "SMDispatchDetail":
                  DispatchView.DispatchDetails.push(await dbEngine.GetDispatchDetailForSync(dispatchItem.TaskNo,dispatchItem.DispatchNo,dispatchItem.LineKey).catch(function(err){ errorsList.push(err); }));
                  break;
                case "SMDispatchDetailLabor":
                  DispatchView.DispatchLabors.push(await dbEngine.GetDispatchDetailLaborForSync(dispatchItem.TaskNo,dispatchItem.DispatchNo,dispatchItem.LineKey).catch(function(err){ errorsList.push(err); }));
                  break;
              }
            }
            OfflineModification.Dispatches.push(DispatchView);
          }
        }
        offlineModifications.push(OfflineModification);
      }
      smpMobileApi.SynchronizeData(offlineModifications,function(result){
        if(result=="ok" || result.m_Item1.length==0)
        {
          SetCacheValue(CacheIds.app_state,1);
          success();
        }
        else{
          var sqlCommand = [];
          result.m_Item2.forEach(item =>{
            switch(item.TableName)
            {
              case 'SMTask':
                sqlCommand.push(['DELETE FROM SMTask WHERE CompanyCode=? AND TaskNo=?',[pageModel.companyInfo.CompanyCode,item.TaskNo]]);
                sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,item.TableName,item.RecordKey]]);
                sqlCommand.push(['INSERT INTO SMTask VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,item.Record.TaskNo, item.Record.TaskDate, item.Record.TaskTime, item.Record.TaskType, item.Record.ARDivisionNo, item.Record.CustomerNo, item.Record.CustomerPONo, item.Record.ContractNo, item.Record.TaxSchedule, item.Record.ScheduledDate, item.Record.DocumentsPath, item.Record.Route, item.Record.NumberOfVisit, item.Record.TaskStatus, item.Record.TaskDescription, item.Record.ExtendedDescriptionText, item.Record.BillToName, item.Record.BillToAddress, item.Record.BillToCity, item.Record.BillToState, item.Record.BillToZipCode, item.Record.ShipToCode, item.Record.ShipToName, item.Record.ShipToAddress, item.Record.ShipToCity, item.Record.ShipToState, item.Record.ShipToZipCode, item.Record.CreditLimit, item.Record.OpenOrderAmt, item.Record.ArBalance, item.Record.OverBy, item.Record.PriceLevel, item.Record.TermsCode, item.Record.TermsCodeDesc, item.Record.NatureOfTask, item.Record.NatureOfTaskAnswer1, item.Record.NatureOfTaskAnswer2, item.Record.NatureOfTaskAnswer3, item.Record.NatureOfTaskAnswer4, item.Record.NatureOfTaskAnswer5, item.Record.BillToDivisionNo, item.Record.BillToCustomerNo, item.Record.DepositAmt, item.Record.PaymentTypeCategory, item.Record.CoverageCode,item.Record.AR068_SMPLaborTaxCalculate,item.Record.SO068_SMPLaborTaxCalculate, item.Record.Hash, RowStates.UNCHANGED]]);
                break;                
              case 'SMDispatchHeader':
                sqlCommand.push(['DELETE FROM SMDispatchHeader WHERE CompanyCode=? AND TaskNo=? AND DispatchNo=?',[pageModel.companyInfo.CompanyCode,item.TaskNo,item.DispatchNo]]);
                sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,item.TableName,item.RecordKey]]);
                sqlCommand.push(['INSERT INTO SMDispatchHeader VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,item.Record.TaskNo, item.Record.DispatchNo, item.Record.DispatchDate, item.Record.TechnicianCode, item.Record.Customer.split('-')[0], item.Record.Customer.split('-')[1], item.Record.StartDate, item.Record.StartTime, item.Record.EndDate, item.Record.EndTime, item.Record.StatusCode, item.Record.TaskDescription, item.Record.ContractNo, item.Record.ShipToName, item.Record.ShipToAddress, item.Record.TaxableAmt, item.Record.NonTaxableAmt, item.Record.DispatchTotal, item.Record.DiscountRate, item.Record.DiscountAmt, item.Record.FreightAmt, item.Record.SalesTaxAmt, item.Record.Manufacturing?1:0, item.Record.CommitQty?1:0, item.Record.MachineCode, item.Record.EquipmentItemNo, item.Record.DispatchContractNo, item.Record.DateUpdated, item.Record.TimeUpdated, item.Record.PaymentType, item.Record.CheckNoForDeposit, item.Record.OtherPaymentTypeRefNo, item.Record.DepositAmt, item.Record.PaymentTypeCategory, item.Record.Hash, 0]]);                
                break;
              case 'SMDispatchDetail':
                sqlCommand.push(['DELETE FROM SMDispatchDetail WHERE CompanyCode=? AND TaskNo=? AND DispatchNo=? AND LineKey=?',[pageModel.companyInfo.CompanyCode,item.TaskNo,item.DispatchNo,item.LineKey]]);
                sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,item.TableName,item.RecordKey]]);
                sqlCommand.push(['INSERT INTO SMDispatchDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode, item.Record.TaskNo, item.Record.DispatchNo, item.Record.ItemCode, item.Record.LineSeqNo, item.Record.LineKey, item.Record.ItemCodeDesc, item.Record.ExtendedDescriptionKey, item.Record.ExtendedDescriptionText, item.Record.WarehouseCode, item.Record.Discount, item.Record.TaxClass, item.Record.UnitOfMeasureConvFactor, item.Record.ProductLine, item.Record.CommentText, item.Record.QuantityOrdered, item.Record.UnitPrice, item.Record.PriceLevel, item.Record.ExtensionAmt, item.Record.ItemType,item.Record.LineDiscountPercent, item.Record.Hash, 0]]);
                break;
              case 'SMDispatchDetailLabor':
                sqlCommand.push(['DELETE FROM SMDispatchDetailLabor WHERE CompanyCode=? AND TaskNo=? AND DispatchNo=? AND LineKey=?',[pageModel.companyInfo.CompanyCode,item.TaskNo,item.DispatchNo,item.LineKey]]);
                sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,item.TableName,item.RecordKey]]);
                sqlCommand.push(['INSERT INTO SMDispatchDetailLabor VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,item.Record.TaskNo, item.Record.DispatchNo, item.Record.LaborSkillCode, item.Record.LineSeqNo, item.Record.LineKey, item.Record.LineDesc, item.Record.ExtendedDescriptionKey, item.Record.ExtendedDescriptionText, item.Record.LaborCommentText,item.Record.HoursSpent, item.Record.BillingRate, item.Record.ExtensionAmt, item.Record.TaxClass, item.Record.OvertimeStartDate, item.Record.OvertimeStartTime,item.Record.LineDiscountPercent,item.Record.Hash,0 ]]);
                break;
              case 'SMTaskAttachment':
                sqlCommand.push(['DELETE FROM SMTaskAttachment WHERE CompanyCode=? AND TaskNo=? AND Name=?',[pageModel.companyInfo.CompanyCode,item.TaskNo,item.Name]]);
                sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,item.TableName,item.RecordKey]]);
                sqlCommand.push(['INSERT INTO SMTaskAttachment VALUES (?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,item.Record.TaskNo, item.Record.Name,item.Record.Data, 0]]);
                break;
            }
          });
          dbEngine._db.sqlBatch(sqlCommand, function() {
            error('Issue while submitting changes to the server.');
          }, function(err) {
            error('Issue while submitting changes to the server. Failed to update local database for successfully submitted modifications.');
          });
        }


      },error);
    },error);
  }

 InsertDispatchDetail(taskNo,dispatchNo,dispatchDetail,priceCalculated,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo+"/"+priceCalculated,
        data: JSON.stringify(dispatchDetail)
      })
        .done(function(res) {
          if (res.Status != "fail"){
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.InsertDispatchDetail(
        dispatchDetail,
        function(res) {
          smpMobileApi.RecalculateTotals(taskNo,dispatchNo,function(){
            success(dispatchDetail.LineKey);
          },error);
        },
        function(err) {
          error(err);
        }
      );     
    }
  }
  InsertDispatchDetailLabor(taskNo,dispatchNo,dispatchDetailLabor,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo,
        data: JSON.stringify(dispatchDetailLabor)
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.InsertDispatchDetailLabor(dispatchDetailLabor,function(res){
          smpMobileApi.RecalculateTotals(taskNo,dispatchNo,function(){
            success(dispatchDetailLabor.LineKey);
          },error);
        },
        function(err){
          error(err);
        }
      );   
    }
  }
  InsertTaskAttachment(taskNo,name,dataUrl,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Task/Attachments/"+taskNo,
        data: JSON.stringify({
          key: name,
          data: dataUrl
        })
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.InsertTaskAttachment(taskNo,name,dataUrl,success,error);
    }
  }
  UpdateDispatch(dispatch,taskInfo,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/UpdateDispatch",
        data: JSON.stringify({DispatchHeader: dispatch,Task :taskInfo})
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.UpdateDispatch(dispatch,taskInfo,success,error);
    }
  }
  UpdateDispatchDetail(taskNo,dispatchNo,dispatchDetail,priceCalculated,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo+"/"+priceCalculated,
        data: JSON.stringify(dispatchDetail)
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.UpdateDispatchDetail(dispatchDetail,function(res){
          smpMobileApi.RecalculateTotals(taskNo,dispatchNo,function(){
            success(dispatchDetail.LineKey);
          },error);
        },
        function(err)
        {
          error(err);
        }
      );
    }
  }
  UpdateDispatchDetailLabor(taskNo,dispatchNo,dispatchDetailLabor,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo,
        data: JSON.stringify(dispatchDetailLabor)
      })
        .done(function(res) {
          if (res.Status != "fail"){
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.UpdateDispatchDetailLabor(dispatchDetailLabor,function(res){
        smpMobileApi.RecalculateTotals(taskNo,dispatchNo,function(){
          success(dispatchDetailLabor.LineKey);
        },error);
      },
      function(err)
      {
        error(err);
      }
    );
    }
  }
  UpdateDispatchPayment(taskNo,dispatchNo,paymentMethod,data,success,error){
    if (SMPMobileAPI.IsOnline &&  ((!SMPMobileAPI.IsMobileVersion && window.location.protocol.indexOf("https")>=0) || (SMPMobileAPI.IsMobileVersion && GetCacheValue(CacheIds.serverEndpoint).indexOf("https")>=0))) {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Payment/"+taskNo+"/"+dispatchNo+"/"+paymentMethod,
        data: JSON.stringify(data)
      })
        .done(function(res) {
          if (res.Status != "fail"){
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      error({Message: "Payment Processing is available only in Online mode and by HTTPS connection."});
    }
  }
  DeleteDispatchDetail(taskNo,dispatchNo,itemCode,lineKey,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "DELETE",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo,
        data: JSON.stringify({Item1: itemCode,Item2 :lineKey})
      })
        .done(function(res) {
          if (res.Status != "fail"){
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.DeleteDispatchDetail(taskNo,dispatchNo,lineKey,function(res){
          smpMobileApi.RecalculateTotals(taskNo,dispatchNo,success,error);
        },
        function(err){
          error(err);
        }
      );
    }
  }
  DeleteDispatchDetailLabor(taskNo,dispatchNo,laborSkillCode,lineKey,success,error)
  {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "DELETE",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo,
        data: JSON.stringify({Item1: laborSkillCode,Item2 :lineKey})
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
          else {
            error(res);
          }
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      dbEngine.DeleteDispatchDetailLabor(taskNo,dispatchNo,lineKey,function(res){
        smpMobileApi.RecalculateTotals(taskNo,dispatchNo,success,error);
      },
      function(err){
        error(err);
      }
    );
    }
  }
  RecalculateTotals(taskNo,dispatchNo,success,error)
  {
    dbEngine.GetTaskInfo(taskNo,function(task){
      dbEngine.GetDispatch(taskNo,dispatchNo,function(currentDispatchInfo){      
        dbEngine.GetDispatchDetails(taskNo,dispatchNo,function(lines){
          dbEngine.GetDispatchDetailLabors(taskNo,dispatchNo,function(labors){
            dbEngine.GetTaxRate(task.ARDivisionNo,task.CustomerNo,task.TaxSchedule,function(taxRate){
              smpMobileApi.RecalculateDispatchTotals(currentDispatchInfo,lines,labors,taxRate,function(totals){
                dbEngine.UpdateDispatchTotals(taskNo,dispatchNo,totals,currentDispatchInfo.State==RowStates.UNCHANGED,success,error);
              });
            },function(err){
              error(err);
            })
          },function(err){
            error(err);
          });
        },function(err){
          error(err);
        });
      },function(err){
        error(err);
      })
    },function(err){
      error(err);
    })
    
  }
  RecalculateDispatchTotals(currentDispatchInfo,lines,labors,taxRate,success)
  {
    let taxableTotal = 0;
    let noneTaxableAmount = 0;
    let taxableAmount =0;
    let discountedTotal = 0;
    let dispatchTotal = 0;
    let tempTaxDiscount=0;
    let tempNonTaxDiscount=0;
    let lineTotal = 0;
    var discountRate = (currentDispatchInfo.DiscountRate) ? currentDispatchInfo.DiscountRate : 0;
    lines.forEach(function (item){
      if (item.TaxClass == "NT" || (taxRate && !taxRate.IsTaxable)) {
        noneTaxableAmount += parseFloat(item.ExtensionAmt);
        if(item.Discount) {
            tempNonTaxDiscount += parseFloat(item.ExtensionAmt);
        }
      } else{
          taxableAmount += parseFloat(item.ExtensionAmt);
          if(item.Discount) {
              tempTaxDiscount += parseFloat(item.ExtensionAmt);
          }
        } 
      });
    if(pageModel.smOptions.LaborBillingPresentation!="N")
    {
      labors.forEach(function (item){
        var laborSkillCode = FindRecordsByParams(pageModel.laborSkillCodes,true,[{Name:"LaborSkillCode",Value:item.LaborSkillCode}])[0];
        if (item.TaxClass == "NT" || (taxRate && !taxRate.IsTaxable)) {
          noneTaxableAmount += parseFloat(item.ExtensionAmt);
          if(laborSkillCode.Discount) {
              tempNonTaxDiscount += parseFloat(item.ExtensionAmt);
          }
        }else{
          taxableAmount += parseFloat(item.ExtensionAmt);
          if(laborSkillCode.Discount) {
              tempTaxDiscount += parseFloat(item.ExtensionAmt);
          } 
        }
      });
    }
    lineTotal = taxableAmount+noneTaxableAmount;
    var taxDiscount =(tempTaxDiscount/100) *parseFloat(discountRate);
    var nonTaxDiscount =(tempNonTaxDiscount/100) *parseFloat(discountRate);
    taxableAmount = taxableAmount - taxDiscount;
    noneTaxableAmount = noneTaxableAmount - nonTaxDiscount;
    discountedTotal = taxDiscount + nonTaxDiscount;
    if(taxRate)
    {
      taxRate.ReturnTaxRateDetails.split('|').forEach(taxDetailPercent => {
        taxableTotal = parseFloat((taxableTotal + parseFloat(((taxableAmount/100) * parseFloat(taxDetailPercent)).RoundTo(2))).RoundTo(2));
      });
    }

    dispatchTotal = taxableAmount + noneTaxableAmount + taxableTotal + currentDispatchInfo.FreightAmt;
    success({TaxableAmt: taxableAmount,
            NonTaxableAmt: noneTaxableAmount,
            DiscountAmt: discountedTotal,
            SalesTaxAmt: taxableTotal,
            DispatchTotal: dispatchTotal});
  }
  ShowModal(header, text, type, timeout) 
  {
    var $modal = $("<div>");
    $modal.attr("id", "notification_modal");
    $modal.addClass("alert alert-" + type + " notification");
    $modal.append(
      '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
    );
    $modal.append(
      '<h3 class="alert-heading">' +
        header +
        '</h3><p class="mb-0">' +
        text +
        "</p>"
    );
    $("body").append($modal);
    $modal.fadeIn();
    setTimeout(function() {
      $modal.fadeOut();
      $modal.remove();
    }, timeout);
  }
  UpdateTask(taskInfo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "PUT",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Task/",
        data: JSON.stringify(taskInfo)
      })
      .done(function(res) {
        if (res.Status != "fail") 
          {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                success(res);
                console.log(res);
              },
              function(err){
                success(res);
                console.log(err)});
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            });
          }
        else {
          error(res);
        }
      })
      .fail(function(err) {
        error(err);
      });
    } else {
      dbEngine.UpdateTask(taskInfo, success, error);
    }
  }
  SynchronizeData(offlineModifications,success,error)
  {
    $.ajax({
      method: "POST",
      url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Synchronize",
      data: JSON.stringify(offlineModifications),
      timeout: 600000
    })
      .done(function(res) {
        if (res.Status != "fail") success(res);
        else {
          error(res);
        }
      })
      .fail(function(err) {
        error(err);
      });
  }
}
