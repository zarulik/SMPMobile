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
function GetLocation(){
  var promise =new Promise(function(resolve,reject){
    navigator.geolocation.getCurrentPosition(resolve,reject, { maximumAge: 60000, timeout: 30000, enableHighAccuracy: true });
  });
  let retVal = promise.then(position=>{return position},error=>{smpMobileApi.ShowModal(
    "Issue",
    "Failed to get Geolocation" +
      err.Message,
    "danger",
    15000
  )});
  return retVal;
}
class SMPMobileAPI {
  constructor() {
    SMPMobileAPI.IsOnline = true;
    SMPMobileAPI.IsMobileVersion = false;
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
        if(res.Status!='fail')
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
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/common/CheckLogin"
      })
        .done(function(res) {
          smpMobileApi.GetGeolocation(function(position){
            smpMobileApi.PutGeolocation(position,function(res1){
              console.log(res);
              success(res);
            },function(err){
              success(res);
              console.log(err)
            });
          },
          function(error){
            console.log(error);
            //TODO add checking if GPS is turned on.
            success(res);
          })
        })
        .fail(function(err) {
          error(err);
        });
    } else {
      if (
        btoa(
          SMPMobileAPI.company.toLowerCase() +
            ":" +
            SMPMobileAPI.username.toLowerCase() +
            ":" +
            SMPMobileAPI.password,
          true
        ) == GetCacheValue(CacheIds.lastCredentials)
      ) {
        success();
      } else {
        error({ Status: "401" });
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
    }
  }
  GetCustomerCreditCards(arDivision, customerNo, success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url:
          GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Cards/"+arDivision+"/"+encodeURIComponent(customerNo)
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
    }
  } 
  GetGeolocation(success,error)
  {
    navigator.geolocation.getCurrentPosition(success,error,{maximumAge:60000,timeout:120000,enableHighAccuracy:true});
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
    }
  }
  GetNatureOfTasks(success, error) {
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "GET",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/NatureOfTasks"
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
    }
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
    }
  }
  GetDispatchDescriptions(list,success, error) {
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
    }
  }  
  InsertDispatchDetail(taskNo,dispatchNo,dispatchDetail,priceCalculated,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/Details/"+taskNo+"/"+dispatchNo+"/"+priceCalculated,
        data: JSON.stringify(dispatchDetail)
      })
        .done(function(res) {
          if (res.Status != "fail") {
            smpMobileApi.GetGeolocation(function(position){
              smpMobileApi.PutGeolocation(position,function(res1){
                console.log(res)
                success(res);
              },function(err){
                success(res);
                console.log(err)
              });
            },
            function(error){
              success(res);
              console.log(error);
              //TODO add checking if GPS is turned on.
            })
          }
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
  InsertDispatchDetailLabor(taskNo,dispatchNo,dispatchDetailLabor,success,error){
    if (SMPMobileAPI.IsOnline) {
      $.ajax({
        method: "POST",
        url: GetCacheValue(CacheIds.serverEndpoint) + "/api/dispatch/DetailLabors/"+taskNo+"/"+dispatchNo,
        data: JSON.stringify(dispatchDetailLabor)
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
    }
  }
  ShowModal(header, text, type, timeout) {
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
    }
  }
}
