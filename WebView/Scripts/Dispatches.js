var ds;
var smpMobileApi;
$(document).ready(function() {
  smpMobileApi = new SMPMobileAPI();
  ds = new DispatchesPage();
});

class DispatchesPage {
  constructor() {
    this.InitializeControls();
  }
  InitializeControls() {
    RemoveCacheValue(CacheIds.selectedTaskDispatch);
    this.CheckLogin(this, function(that) {
      that.InitializeMenu();
      that.InitializeDispatches();
    });
  }

  CheckLogin(that, success) {
    smpMobileApi.Login(
      SMPMobileAPI.company,
      SMPMobileAPI.username,
      SMPMobileAPI.password,
      function(res) {
        if (res) {
          SetCacheValue(CacheIds.token,res);
          success(that);
        } else {
          window.location.replace("../Index.html");
        }
      },
      function(err) {
        window.location.replace("../Index.html");
      }
    );
  }
  InitializeMenu() {
    $("#toggleMenu").click(function() {
      console.log("click toggle");
      $(".toggle-menu-inner").css("top", $("nav")[0].scrollHeight + 2 + "px");
      $("#toggle-menu").show();
      $("#toggle-menu").off('click').click(function() {
        $("#toggle-menu").hide();
      });
    });
    $("#signOutBtn").click(function(e) {
      smpMobileApi.GetGeolocation(function(position){
        smpMobileApi.PutGeolocation(position,
          function(res){
            console.log(res);
            RemoveCacheValue(CacheIds.token);
            window.location.replace("../Index.html");
          },
          function(err){
            console.log(err);
            RemoveCacheValue(CacheIds.token);
            window.location.replace("../Index.html");
          });
      },
      function(error){
        console.log(error);
        RemoveCacheValue(CacheIds.token);
        window.location.replace("../Index.html");
        //TODO add checking if GPS is turned on.
      })
      e.preventDefault();
    });
    $('#settingsPage').click(function(e){
      SetCacheValue(CacheIds.previousPage,"../Pages/Dispatches.html");
      window.location.replace("../Pages/Settings.html");
      e.preventDefault();
    });
  }

  InitializeDispatches() {
    var maxHeight = $(window.top).height() - $(".navbar").outerHeight() -  50;
    $("#dispatchesContainer").css("max-height",(maxHeight > 200 ? maxHeight : 200) + "px");
    smpMobileApi.GetTechnicianDispatchesPreviews(
      function(dispatches) {
        pageModel.dispatches = dispatches;
        pageModel.ajaxCounter--;
        pageModel.allLoaded();
        smpMobileApi.GetDispatchDescriptions(
          pageModel.dispatches,
          function(dispatchDesc) { 
            pageModel.dispatchDesc = dispatchDesc;
            pageModel.ajaxCounter--;
            pageModel.allLoaded();
          },
          function(err){
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to Get Dispatch Descriptions<br />" + err.Message,
              "danger",
              10000);
          })
      },
      function(error) {
        pageModel.ajaxFailedCounter++;
        pageModel.ajaxFailedCounter++;
        smpMobileApi.ShowModal(
          "Issue",
          "Issue during loading dispatches",
          "danger",
          5000
        );
      }
    );
    smpMobileApi.GetSMOptions(
      function(smOptions) {
        pageModel.smOptions = smOptions;
        pageModel.ajaxCounter--;
        pageModel.allLoaded();
      },
      function(error) {
        pageModel.ajaxFailedCounter++;
        pageModel.loadIssues.push(
          "Issue during loading <strong>SM options</strong>"
        );
        pageModel.allLoaded();
      }
    );
    smpMobileApi.GetTechnicianTasksInfo(
      function(tasksInfos) {
        pageModel.taskInfos = tasksInfos;
        pageModel.ajaxCounter--;
        pageModel.allLoaded();
      },
      function(error) {
        pageModel.ajaxFailedCounter++;
        smpMobileApi.ShowModal(
          "Issue",
          "Issue during loading tasks information",
          "danger",
          5000
        );
      }
    );

    smpMobileApi.GetNatureOfTasks(
        function(natureOfTasksInfo) {
          pageModel.natureOfTasks = natureOfTasksInfo;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          smpMobileApi.ShowModal(
            "Issue",
            "Issue during loading nature of tasks",
            "danger",
            5000
          );
        }
      );
      smpMobileApi.GetTaskDispatchStatuses(
        function(taskStatuses) {
          pageModel.taskStatuses = taskStatuses;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          smpMobileApi.ShowModal(
            "Issue",
            "Issue during loading tasks statuses",
            "danger",
            5000
          );
        }
      );
      smpMobileApi.GetTaskTypes(
        function(taskTypes) {
          pageModel.taskTypes = taskTypes;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          smpMobileApi.ShowModal(
            "Issue",
            "Issue during loading tasks types",
            "danger",
            5000
          );
        }
      );
  }
  InitializeFilters(pageModel) {
    var filterBtn = $("#filterBtn");
    var filterInput = $("#fastFilter");
    var taskNos = [];
    var customers = [];
    var statuses =[];
    for (let index = 0; index < pageModel.dispatches.length; index++) {
      const element = pageModel.dispatches[index];
      taskNos[element.TaskNo] = element.TaskNo;
      customers[element.Customer] = element.Customer;
      statuses[element.StatusCode] = element.StatusCode;
    }
    var taskNoSelect = $("#filterPopup_taskNoSelects");
    var customerSelect = $("#filterPopup_CustomerSelects");
    var statusSelect = $("#filterPopup_StatusSelects");
    for (var taskNo in taskNos) {
      taskNoSelect.append(`<option value="${taskNo}">${taskNo}</option>`);
    }
    for (var customer in customers) {
      customerSelect.append(`<option value="${customer}">${customer}</option>`);
    }
    for (var statusCode in statuses) {
      statusSelect.append(`<option value="${statusCode}">${FindRowByFieldNameValuePair( pageModel.taskStatuses,"StatusCode",statusCode).Description}</option>`);
    }
    var dispatchDate = $("#filterPopup_DispatchDate");
    var startDate = $("#filterPopup_StartDate");
    var endDate = $("#filterPopup_EndDate");
    $('#filterClearBtn').on('click',function(){
      $("#filterPopup_taskNoSelects").val("NONE");
      $("#filterPopup_CustomerSelects").val("NONE");
      $('#filterPopup_StatusSelects').val("NONE");
      $("#filterPopup_DispatchDate").val("");
      $("#filterPopup_StartDate").val("");
      $("#filterPopup_EndDate").val("");
      $("#filterPopup_EndDate").trigger("change");
    });
    filterInput.change(function() {
      ds.Filter(pageModel);
    });
    filterBtn.on("click", function() {
      $("#filterModal").modal();
    });
    taskNoSelect.change(function() {
      ds.Filter(pageModel);
    });
    customerSelect.change(function() {
      ds.Filter(pageModel);
    });
    dispatchDate.change(function() {
      ds.Filter(pageModel);
    });
    startDate.change(function() {
      ds.Filter(pageModel);
    });
    endDate.change(function() {
      ds.Filter(pageModel);
    });
    statusSelect.change(function(){
      ds.Filter(pageModel);
    });
  }
  Filter(pageModel) {
    var filterInput = $("#fastFilter");
    var fastFilterValue = filterInput.val();
    var taskNoSelect = $("#filterPopup_taskNoSelects");
    var customerSelect = $("#filterPopup_CustomerSelects");
    var dispatchDate = $("#filterPopup_DispatchDate");
    var startDate = $("#filterPopup_StartDate");
    var statusCode = $("#filterPopup_StatusSelects");
    var endDate = $("#filterPopup_EndDate");
    var params = [];
    if (taskNoSelect.val() != "NONE") {
      params.push({ Name: "TaskNo", Value: taskNoSelect.val() });
    }
    if (customerSelect.val() != "NONE") {
      params.push({ Name: "Customer", Value: customerSelect.val() });
    }
    if (dispatchDate.val()) {
      params.push({
        Name: "DispatchDate",
        Value: dispatchDate.val() + "T00:00:00"
      });
    }
    if (startDate.val()) {
      params.push({ Name: "StartDate", Value: startDate.val() + "T00:00:00" });
    }
    if (endDate.val()) {
      params.push({ Name: "EndDate", Value: endDate.val() + "T00:00:00" });
    }
    if(statusCode.val() != "NONE"){
      params.push({ Name: "StatusCode", Value: statusCode.val() });
    }
    var filteredRecs =
      params.length > 0
        ? FindRecordsByParams(pageModel.dispatches, false, params)
        : [];
    var recs =
      fastFilterValue != ""
        ? $(`.dispatchBox:containsInsensitive('${fastFilterValue}')`).toArray()
        : [];
    var uniqueIds = [];
    for (let i = 0; i < filteredRecs.length; i++) {
      if (fastFilterValue) {
        for (let j = 0; j < recs.length; j++) {
          if (
            filteredRecs[i].TaskNo + "_" + filteredRecs[i].DispatchNo ===
            recs[j].id
          ) {
            uniqueIds.push(recs[j].id);
          }
        }
      }
      else{
        uniqueIds.push(filteredRecs[i].TaskNo + "_" + filteredRecs[i].DispatchNo);
      }
    }
    if(params.length==0)
    {
      for (let j = 0; j < recs.length; j++) {
        uniqueIds.push(recs[j].id);
      }
    }
    $(".dispatchBox").hide();
    uniqueIds.forEach(element => {
      $("#" + element).show();
    });
    if (params.length == 0 && fastFilterValue == "") {
      $(".dispatchBox").show();
    }
    if(uniqueIds.length>0 || !(params.length ==0 && fastFilterValue == ""))
    {
      $('#filterBtn').addClass('appliedFilter');
    }
    else if(params.length ==0 && fastFilterValue == ""){
      $(".dispatchBox").show();
      $('#filterBtn').removeClass('appliedFilter');
    }
  }
  InitializeDispatchEvents(
    dispatch, 
    taskInfo, 
    taskType, 
    taskStatus, 
    natureOfTask, 
    dispatchDesc) {
    $("#" + dispatch.TaskNo + "_" + dispatch.DispatchNo).click(function() {
      SetCacheValue(CacheIds.selectedTaskDispatch,dispatch.TaskNo + "_" + dispatch.DispatchNo);
      window.location.href = "Dispatch.html";
    });
    
    if (taskInfo) {
      $("#" + dispatch.TaskNo + "_" + dispatch.DispatchNo + "_TaskInfo").click(
        function(e) {
          taskInfo = FindRowByFieldNameValuePair(
            pageModel.taskInfos,
            "TaskNo",
            dispatch.TaskNo);
          
          $("#taskInfo_TaskNo").text("");
          $("#taskInfo_Type").text("");
          $("#taskInfo_Status").text("");
          $("#taskInfo_Desc").text("");
          $("#taskInfo_ContractNo").text("");
          $("#taskInfo_NatureOfTask").text("");
          $("#taskInfo_NatureOfTaskQuestion1").text("");
          //$("#taskInfo_NatureOfTaskAnswer1").text("");
          $("#taskInfo_NatureOfTaskAnswer1_Input").val("");
          $("#taskInfo_NatureOfTaskQuestion2").text("");
          //$("#taskInfo_NatureOfTaskAnswer2").text("");
          $("#taskInfo_NatureOfTaskAnswer2_Input").val("");
          $("#taskInfo_NatureOfTaskQuestion3").text("");
          //$("#taskInfo_NatureOfTaskAnswer3").text("");
          $("#taskInfo_NatureOfTaskAnswer3_Input").val("");
          $("#taskInfo_NatureOfTaskQuestion4").text("");
          //$("#taskInfo_NatureOfTaskAnswer4").text("");
          $("#taskInfo_NatureOfTaskAnswer4_Input").val("");
          $("#taskInfo_NatureOfTaskQuestion5").text("");
          //$("#taskInfo_NatureOfTaskAnswer5").text("");
          $("#taskInfo_NatureOfTaskAnswer5_Input").val("");
          $("#iig_extendedDescriptionText").text("");
          $("#iig_dispatchExtendedDescriptionText").text("");
          $("#taskInfo_TaskNo").text(taskInfo.TaskNo);
          $("#taskInfo_Type").text(taskType.Description);
          $("#taskInfo_Status").text(taskStatus.Description);
          $("#taskInfo_Desc").text(taskInfo.TaskDescription);
          $("#taskInfo_ContractNo").text(taskInfo.ContractNo);
          if (natureOfTask) {
          var anyQuestion = false;
          if (natureOfTask.Description) {
              $("#taskInfo_NatureOfTask").text(
              natureOfTask.Description
              );
              $("#exd_natureOfTask").show();
          } else {
              $("#exd_natureOfTask").hide();
          }
          if (natureOfTask.Question1) {
              $("#taskInfo_NatureOfTaskQuestion1").text(natureOfTask.Question1);
              //$("#taskInfo_NatureOfTaskAnswer1").text(taskInfo.NatureOfTaskAnswer1);
              $("#taskInfo_NatureOfTaskAnswer1_Input").val(taskInfo.NatureOfTaskAnswer1);
              $("#exd_natureOfTaskQuestion1").show();
              anyQuestion = true;
          } else {
              $("#exd_natureOfTaskQuestion1").hide();
          }
          if (natureOfTask.Question2) {
              $("#taskInfo_NatureOfTaskQuestion2").text(natureOfTask.Question2);
              //$("#taskInfo_NatureOfTaskAnswer2").text(taskInfo.NatureOfTaskAnswer2);
              $("#taskInfo_NatureOfTaskAnswer2_Input").val(taskInfo.NatureOfTaskAnswer2);
              $("#exd_natureOfTaskQuestion2").show();
              anyQuestion = true;
          } else {
              $("#exd_natureOfTaskQuestion2").hide();
          }
          if (natureOfTask.Question3) {
              $("#taskInfo_NatureOfTaskQuestion3").text(natureOfTask.Question3);
              //$("#taskInfo_NatureOfTaskAnswer3").text(taskInfo.NatureOfTaskAnswer3);
              $("#taskInfo_NatureOfTaskAnswer3_Input").val(taskInfo.NatureOfTaskAnswer3);
              $("#exd_natureOfTaskQuestion3").show();
              anyQuestion = true;
          } else {
              $("#exd_natureOfTaskQuestion3").hide();
          }
          if (natureOfTask.Question4) {
              $("#taskInfo_NatureOfTaskQuestion4").text(natureOfTask.Question4);
              //$("#taskInfo_NatureOfTaskAnswer4").text(taskInfo.NatureOfTaskAnswer4);
              $("#taskInfo_NatureOfTaskAnswer4_Input").val(taskInfo.NatureOfTaskAnswer4);
              $("#exd_natureOfTaskQuestion4").show();
              anyQuestion = true;
          } else {
              $("#exd_natureOfTaskQuestion4").hide();
          }
          if (natureOfTask.Question5) {
              $("#taskInfo_NatureOfTaskQuestion5").text(natureOfTask.Question5);
              //$("#taskInfo_NatureOfTaskAnswer5").text(taskInfo.NatureOfTaskAnswer5);
              $("#taskInfo_NatureOfTaskAnswer5_Input").val(taskInfo.NatureOfTaskAnswer5);
              $("#exd_natureOfTaskQuestion5").show();
              anyQuestion = true;
          } else {
              $("#exd_natureOfTaskQuestion5").hide();
          }
          if (anyQuestion) {
              $('#btnSave').show();
              $("#exd_natureOfTask_questionHeader").show();
          } else {
              $('#btnSave').hide();
              $("#exd_natureOfTask_questionHeader").hide();
          }
          }
          else {
            $(".natureOfTask").css("display", "none");
            $('#btnSave').hide();
          }
          $("#iig_extendedDescriptionText").text(taskInfo.ExtendedDescription);
          $("#iig_dispatchExtendedDescriptionText").text(dispatchDesc.ExtendedDescriptionText);
          
          if (taskInfo.ExtendedDescription) {
            $("#exd_description_div").show();
          } else {
            $("#exd_description_div").hide();
          }

          if (dispatchDesc.ExtendedDescriptionText) {
            $("#dispatch_exd_description_div").show();
          } else {
            $("#dispatch_exd_description_div").hide();
          }
          $("#taskInfoModal").modal();
          e.stopPropagation();
      });
      $("#" + dispatch.TaskNo + "_" + dispatch.DispatchNo + "_CustomerInfo").click(function(e) {
        $("#CustNo").text("");
        $("#BillToName").text("");
        $("#BillToAddr").text("");
        $("#BillToCity").text("");
        $("#ShipToName").text("");
        $("#ShipToAddr").text("");
        $("#ShipToCity").text("");
        $("#CreditLimit").text("");
        $("#AR_Balance").text("");
        $("#OpenOrderAmt").text("");
        $("#OverBy").text("");
        $("#CustMap").attr("src", "");
        $("#CustNo").text(taskInfo.ARDivisionNo + "-" + taskInfo.CustomerNo);
        $("#BillToName").text(taskInfo.BillToName);
        $("#BillToAddr").text(taskInfo.BillToAddress);
        $("#BillToCity").text(taskInfo.BillToCity);
        $("#ShipToName").text(taskInfo.ShipToName);
        $("#ShipToAddr").text(taskInfo.ShipToAddress);
        $("#ShipToCity").text(taskInfo.ShipToCity);
        $("#CreditLimit").text(taskInfo.CreditLimit.RoundTo(2));
        $("#AR_Balance").text(taskInfo.ArBalance.RoundTo(2));
        $("#OpenOrderAmt").text(taskInfo.OpenOrderAmt.RoundTo(2));
        $("#OverBy").text(taskInfo.OverBy.RoundTo(2));
        if(!pageModel.smOptions.DisplayCustomerARInfoOnMobile)
        {
          $("#CreditLimit").hide();
          $("#AR_Balance").hide();
          $("#OpenOrderAmt").hide();
          $("#OverBy").hide();
          $(".customerARInfo").hide();
        }
        $(".ShipToAddr-link").attr("href", "https://maps.google.com/?q=" + taskInfo.ShipToAddress+" "+taskInfo.ShipToCity);
        $(".BillToAddr-link").attr("href", "https://maps.google.com/?q=" + taskInfo.BillToAddress+" "+taskInfo.BillToCity);
        if(!SMPMobileAPI.IsMobileVersion)
        {
          $(".ShipToAddr-link").attr("target", "_blank");
          $(".BillToAddr-link").attr("target", "_blank");
        }
        $("#customerInfoModal").modal();
        e.stopPropagation();
      });
    }
  }

  CreateDispatchView(dispatch, dispatchStatus, dispatchDesc) {
    var $dispatchView = $("<div>")
      .addClass("col-10 col-sm-10 col-md-4 col-lg-3 col-xl-3 dispatchBox")
      .css(
        "background-color", 
        ds.GetDispatchBoxColor(dispatchStatus.Description, dispatchStatus))
      .css("color", ds.GetDispatchBoxFontColor(dispatchStatus.Description))
      .attr("id", dispatch.TaskNo + "_" + dispatch.DispatchNo);
    var $dispatchHeader = $("<div>").addClass("dispatchHeader");
    $dispatchHeader.append(
      "<p> Task No: " +
        dispatch.TaskNo +
        '<span id="dispatchButtonsSpan" class="float-right">' +
        '<span id="' +
        dispatch.TaskNo +
        "_" +
        dispatch.DispatchNo +
        '_TaskInfo" class="dispatchButtons"><i class="fas fa-clipboard-list fa-2x"></i></span>' +
        '<span id="' +
        dispatch.TaskNo +
        "_" +
        dispatch.DispatchNo +
        '_CustomerInfo" class="dispatchCustomerInfo dispatchButtons"><i class="fas fa-address-book fa-2x"></i></span>' +
        "</span></p>"
    );
    $dispatchView.append($dispatchHeader);
    var $dispatchBody = $("<div>").addClass("dispatchBody");
    $dispatchBody.append("<p> Dispatch No: " + dispatch.DispatchNo + "</p>");
    $dispatchBody.append(
      "<p> Date: " + GetDatePartOfDate(dispatch.DispatchDate) + "</p>"
    );
    $dispatchBody.append(
      "<p> Task Description:</br> " + dispatch.TaskDescription + "</p>"
    );
    $dispatchBody.append(
      "<p> Dispatch Description:</br> " + dispatchDesc.DispatchDescription + "</p>"
    );
    $dispatchBody.append("<p> Customer: " + dispatch.Customer + "</p>");
    $dispatchBody.append(
      "<p> Ship To Name:</br> " + dispatch.ShipToName + "</p>"
    );
    $dispatchBody.append(
      "<p> Start Date: " +
        GetDatePartOfDate(dispatch.StartDate) +
        " " +
        GetFormattedTime(dispatch.StartTime) +
        "</p>"
    );
    $dispatchBody.append(
      "<p> End Date: " +
        GetDatePartOfDate(dispatch.EndDate) +
        " " +
        GetFormattedTime(dispatch.EndTime) +
        "</p>"
    );
    $dispatchView.append($dispatchBody);
    $dispatchView.append(
      '<p class="dispatchStatusBar"> Status: ' + dispatchStatus.Description + "</p>"
    );
    return $dispatchView;
  }
  GetDispatchBoxColor(status, dispatchStatus) {
    switch (status) {
      case "Open":
        return `rgb(${dispatchStatus.RedDispatchColor}, ${dispatchStatus.GreenDispatchColor}, ${dispatchStatus.BlueDispatchColor})`; //"#3c8dbc";
      case "Hold":
        return `rgb(${dispatchStatus.RedDispatchColor}, ${dispatchStatus.GreenDispatchColor}, ${dispatchStatus.BlueDispatchColor})`; //"#ED8013";
      case "Closed":
        return `rgb(${dispatchStatus.RedDispatchColor}, ${dispatchStatus.GreenDispatchColor}, ${dispatchStatus.BlueDispatchColor})`; //"#FC0000";
      case "Entered":
        return `rgb(${dispatchStatus.RedDispatchColor}, ${dispatchStatus.GreenDispatchColor}, ${dispatchStatus.BlueDispatchColor})`; //"#239906";
      default:
        return `rgb(${dispatchStatus.RedDispatchColor}, ${dispatchStatus.GreenDispatchColor}, ${dispatchStatus.BlueDispatchColor})`; //"#3c8dbc";
    }
  }
  GetDispatchBoxFontColor(status) {
    switch (status) {
      case "Open":
        return "#FFFFFF";
      case "Hold":
        return "#FFFFFF";
      case "Closed":
        return "#FFFFFF";
      case "Entered":
        return "#FFFFFF";
      default:
        return "#FFFFFF";
    }
  }
}
var pageModel = {
  ajaxCounter: 7,
  ajaxFailedCounter: 0,
  allLoaded: function() {
    if (pageModel.ajaxCounter == 0) {
      for (var i = 0; i < pageModel.dispatches.length; i++) {
        var dispatchStatus = FindRowByFieldNameValuePair(
          pageModel.taskStatuses,
          "StatusCode",
          pageModel.dispatches[i].StatusCode
        );
        var dispatchDesc = FindRowByFieldNameValuePair(
          pageModel.dispatchDesc,
          "TaskNo",
          pageModel.dispatches[i].TaskNo
        );
        var $dispatchView = ds.CreateDispatchView(
          pageModel.dispatches[i],
          dispatchStatus,
          dispatchDesc);
        var taskInfo = FindRowByFieldNameValuePair(
          pageModel.taskInfos,
          "TaskNo",
          pageModel.dispatches[i].TaskNo
        );
        var taskType = FindRowByFieldNameValuePair(
          pageModel.taskTypes,
          "TypeCode",
          taskInfo.TaskType
        );
        var taskStatus = FindRowByFieldNameValuePair(
          pageModel.taskStatuses,
          "StatusCode",
          taskInfo.TaskStatus
        );
        var natureOfTask = FindRecordsByParams(
            pageModel.natureOfTasks,
            true,
            [{Name: "NatureOfTask", Value:taskInfo.NatureOfTask},
            {Name:"TypeCode", Value:taskInfo.TaskType}])[0];
        // FindRowByFieldNameValuePair(
        //   pageModel.natureOfTasks,
        //   "NatureOfTask",
        //   taskInfo.NatureOfTask
        // );
        $dispatchView.appendTo("#dispatchesContainer");
        ds.InitializeDispatchEvents(
          pageModel.dispatches[i],
          taskInfo,
          taskType,
          taskStatus,
          natureOfTask,
          dispatchDesc
        );
      }
      $("#btnSave").click(function() {
        var taskNbr = $("#taskInfo_TaskNo");
        var first = $("#taskInfo_NatureOfTaskAnswer1_Input");
        var second = $("#taskInfo_NatureOfTaskAnswer2_Input");
        var third = $("#taskInfo_NatureOfTaskAnswer3_Input");
        var fourth = $("#taskInfo_NatureOfTaskAnswer4_Input");
        var fifth = $("#taskInfo_NatureOfTaskAnswer5_Input");

        var taskInfo = FindRowByFieldNameValuePair(pageModel.taskInfos, "TaskNo", taskNbr.text());
        taskInfo.NatureOfTaskAnswer1 = first.val();
        taskInfo.NatureOfTaskAnswer2 = second.val();
        taskInfo.NatureOfTaskAnswer3 = third.val();
        taskInfo.NatureOfTaskAnswer4 = fourth.val();
        taskInfo.NatureOfTaskAnswer5 = fifth.val();
        //FindRowByFieldNameValuePair(pageModel.taskInfos, "TaskNo", taskNbr.text()).NatureOfTaskAnswer1 = first.val();

        $('.loading').toggleClass('d-none');
        $('.loading div').toggleClass('loadingIcon');
        smpMobileApi.UpdateTask(
          taskInfo,
          function(res) {
            smpMobileApi.GetTechnicianTasksInfo(
              function(tasksInfos) {
                pageModel.taskInfos = tasksInfos;
                $('.loading').toggleClass('d-none');
                $('.loading div').toggleClass('loadingIcon');
                },
              function(error) {
                $('.loading').toggleClass('d-none');
                $('.loading div').toggleClass('loadingIcon')
                pageModel.ajaxFailedCounter++;
                smpMobileApi.ShowModal(
                  "Issue",
                  "Issue during loading tasks information",
                  "danger",
                  5000
                );
              }
            );
          },
          function(err){
            $('.loading').toggleClass('d-none');
            $('.loading div').toggleClass('loadingIcon')
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to Update Nature of Task Answers<br />" + err.Message,
              "danger",
              10000
            );
          });
      });
      ds.InitializeFilters(pageModel);
      $('.loading div').toggleClass('loadingIcon');
      $('.loading').toggleClass('d-none');
      $('#dispatchesContainer').toggleClass('d-none');
    } else if(pageModel.ajaxCounter - pageModel.ajaxFailedCounter == 0) {
      $('.loading div').toggleClass('loadingIcon');
      $('.loading').toggleClass('d-none');
    }
  },
  dispatches: null,
  taskInfos: null,
  taskStatuses: null,
  taskTypes: null,
  natureOfTasks: null,
  smOptions: null,
  dispatchDesc: null
};
