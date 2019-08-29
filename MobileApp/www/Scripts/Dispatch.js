var ds;
var smpMobileApi;
var signaturePad;
var dbEngine;

document.addEventListener("deviceready", function() {
  dbEngine = new DBEngine();
  smpMobileApi = new SMPMobileAPI();
  ds = new DispatchPage();
});

class DispatchPage {
  constructor() {
    this.InitializeControls();
  }
  AppendAddressInfo(commands, paperSize) {
    var billToAddressSplits = pageModel.taskInfo.BillToAddress.split(", ");
    var shipToAddressSplits = pageModel.taskInfo.ShipToAddress.split(", ");
    switch (paperSize) {
      case 576:
        commands.push({ enableEmphasis: true });
        commands.push({ append: "Bill To:" });
        commands.push({ appendAbsolutePosition: 288, data: "Ship To:\n" });
        commands.push({ enableEmphasis: false });
        commands.push({ append: pageModel.taskInfo.BillToName.substr(0, 24) });
        commands.push({
          appendAbsolutePosition: 288,
          data: pageModel.taskInfo.ShipToName.substr(0, 24) + "\n"
        });
        if (billToAddressSplits[0] || shipToAddressSplits[0]) {
          commands.push({
            append: billToAddressSplits[0] ? billToAddressSplits[0] : ""
          });
          commands.push({
            appendAbsolutePosition: 288,
            data: (shipToAddressSplits[0] ? shipToAddressSplits[0] : "") + "\n"
          });
        }
        if (billToAddressSplits[1] || shipToAddressSplits[1]) {
          commands.push({
            append: billToAddressSplits[1] ? billToAddressSplits[1] : ""
          });
          commands.push({
            appendAbsolutePosition: 288,
            data: (shipToAddressSplits[1] ? shipToAddressSplits[1] : "") + "\n"
          });
        }
        if (billToAddressSplits[2] || shipToAddressSplits[2]) {
          commands.push({
            append: billToAddressSplits[2] ? billToAddressSplits[2] : ""
          });
          commands.push({
            appendAbsolutePosition: 288,
            data: (shipToAddressSplits[2] ? shipToAddressSplits[2] : "") + "\n"
          });
        }
        break;
      case 832:
        commands.push({ enableEmphasis: true });
        commands.push({ append: "Bill To:" });
        commands.push({ appendAbsolutePosition: 416, data: "Ship To:\n" });
        commands.push({ enableEmphasis: false });
        commands.push({ append: pageModel.taskInfo.BillToName });
        commands.push({
          appendAbsolutePosition: 416,
          data: pageModel.taskInfo.ShipToName + "\n"
        });
        if (billToAddressSplits[0] || shipToAddressSplits[0]) {
          commands.push({
            append: billToAddressSplits[0] ? billToAddressSplits[0] : ""
          });
          commands.push({
            appendAbsolutePosition: 416,
            data: (shipToAddressSplits[0] ? shipToAddressSplits[0] : "") + "\n"
          });
        }
        if (billToAddressSplits[1] || shipToAddressSplits[1]) {
          commands.push({
            append: billToAddressSplits[1] ? billToAddressSplits[1] : ""
          });
          commands.push({
            appendAbsolutePosition: 416,
            data: (shipToAddressSplits[1] ? shipToAddressSplits[1] : "") + "\n"
          });
        }
        if (billToAddressSplits[2] || shipToAddressSplits[2]) {
          commands.push({
            append: billToAddressSplits[2] ? billToAddressSplits[2] : ""
          });
          commands.push({
            appendAbsolutePosition: 416,
            data: (shipToAddressSplits[2] ? shipToAddressSplits[2] : "") + "\n"
          });
        }
        break;
      case 384:
      default:
        commands.push({ appendEmphasis: "Bill To :\n" });
        commands.push({ append: pageModel.taskInfo.BillToName + "\n" });
        billToAddressSplits.forEach(element => {
          commands.push({ append: element + "\n" });
        });
        commands.push({ appendLineFeed: 2 });
        commands.push({ appendEmphasis: "Ship To :\n" });
        commands.push({ append: pageModel.taskInfo.ShipToName + "\n" });
        shipToAddressSplits.forEach(element => {
          commands.push({ append: element + "\n" });
        });
        break;
    }
    commands.push({ appendLineFeed: 2 });
  }
  AppendDispatchLines(commands, paperSize) {
    commands.push({ enableEmphasis: true });
    commands.push({ appendRaw: "\x1D\x21\x01 Dispatch Details \x1D\x21\x00" });
    commands.push({ appendLineFeed: 1 });
    switch (paperSize) {
      case 832: //4"
      //TODO Modify printing for 4" case when 4" printer will be available in the office
      case 576: //3"
        if (pageModel.dispatchDetail.length > 0) {
          commands.push({ appendRaw: "Item Code" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "  Description" });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw: "       Quantity      "+(pageModel.smOptions.HideAmountFields?"":"Unit Price      Extension ")
          });
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        }
        pageModel.dispatchDetail.forEach(detail => {
          switch (detail.ItemType) {
            case "1": //regular
            case "5": //misc
              commands.push({ appendRaw: detail.ItemCode });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  "  " +
                  (detail.ExtendedDesc
                    ? detail.ExtendedDesc
                    : detail.ItemCodeDesc)
              });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  ds.PrependWhiteSpaces(
                    detail.QuantityOrdered.RoundTo(
                      pageModel.ciOptions.NumberOfDecimalPlacesInQty
                    ),
                    14
                  ) +
                  "   " +(pageModel.smOptions.HideAmountFields?"":(
                  ds.PrependWhiteSpaces(
                    detail.UnitPrice.RoundTo(
                      pageModel.ciOptions.NumberOfDecimalPlacesInPrice
                    ),
                    14
                  ) +
                  "       " +
                  ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)))
              });
              if (detail.CommentText != "")
                {
                  commands.push({ appendLineFeed: 1 });
                  commands.push({ appendRaw: "  " + detail.CommentText });
                }
              break;
            case "3": //charge
              commands.push({ appendRaw: detail.ItemCode });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  "  " +
                  (detail.ExtendedDesc
                    ? detail.ExtendedDesc
                    : detail.ItemCodeDesc)
              });
              commands.push({ appendLineFeed: 1 });
              if(!pageModel.smOptions.HideAmountFields)
              {
                commands.push({
                  appendRaw:
                    ds.PrependWhiteSpaces("", 14) +
                    "   " +
                    ds.PrependWhiteSpaces("", 14) +
                    "       " +
                    ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)
                });
              }
              if (detail.CommentText != "")
                commands.push({ appendRaw: "  " + detail.CommentText });
              break;
            case "4": //comment
              if (detail.CommentText != "")
                commands.push({ appendRaw: "  " + detail.CommentText });
              break;
          }

          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        });
        commands.push({ appendLineFeed: 1 });
        commands.push({ enableEmphasis: true });
        if (pageModel.dispatchLabor.length > 0) {
          commands.push({
            appendRaw: "\x1D\x21\x01 Dispatch Labors \x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "Labor Code" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "  Description" });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw: "       Hours Spent    "+(pageModel.smOptions.HideAmountFields?"":"Billing Rate   Extension ")
          });
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        }
        pageModel.dispatchLabor.forEach(detail => {
          commands.push({ appendRaw: detail.LaborSkillCode });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw:
              "  " +
              (detail.LineDescExtended
                ? detail.LineDescExtended
                : detail.LineDesc)
          });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw:
              ds.PrependWhiteSpaces(
                detail.HoursSpent.RoundTo(
                  pageModel.ciOptions.NumberOfDecimalPlacesInQty
                ),
                14
              ) +
              "   " +(pageModel.smOptions.HideAmountFields?"":(
              ds.PrependWhiteSpaces(
                detail.BillingRate.RoundTo(
                  pageModel.ciOptions.NumberOfDecimalPlacesInPrice
                ),
                14
              ) +
              "       " +
              ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)))
          });
          if (detail.LaborCommentText != "")
          {
            commands.push({ appendLineFeed: 1 });
            commands.push({ appendRaw: "  " + detail.LaborCommentText });
          }
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        });
        commands.push({ appendLineFeed: 2 });
        break;
      case 384: //2"
      default:
        if (pageModel.dispatchDetail.length > 0) {
          commands.push({ appendRaw: "Item Code" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "  Description" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "  Quantity "+(pageModel.smOptions.HideAmountFields?"":" Unit Price  Extension ") });
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        }
        pageModel.dispatchDetail.forEach(detail => {
          switch (detail.ItemType) {
            case "1": //regular
            case "5": //misc
              commands.push({ appendRaw: detail.ItemCode });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  "  " +
                  (detail.ExtendedDesc
                    ? detail.ExtendedDesc
                    : detail.ItemCodeDesc)
              });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  ds.PrependWhiteSpaces(
                    detail.QuantityOrdered.RoundTo(
                      pageModel.ciOptions.NumberOfDecimalPlacesInQty
                    ),
                    11
                  ) +
                  " " +(pageModel.smOptions.HideAmountFields?"":(
                  ds.PrependWhiteSpaces(
                    detail.UnitPrice.RoundTo(
                      pageModel.ciOptions.NumberOfDecimalPlacesInPrice
                    ),
                    11
                  ) +
                  " " +
                  ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)))
              });
              if (detail.CommentText != "")
              {
                commands.push({ appendLineFeed: 1 });
                commands.push({ appendRaw: "  " + detail.CommentText });
              }
              break;
            case "3": //charge
              commands.push({ appendRaw: detail.ItemCode });
              commands.push({ appendLineFeed: 1 });
              commands.push({
                appendRaw:
                  "  " +
                  (detail.ExtendedDesc
                    ? detail.ExtendedDesc
                    : detail.ItemCodeDesc)
              });
              if(!pageModel.smOptions.HideAmountFields){
                commands.push({ appendLineFeed: 1 });
                commands.push({
                  appendRaw:
                    ds.PrependWhiteSpaces("", 11) +
                    " " +
                    ds.PrependWhiteSpaces("", 11) +
                    " " +
                    ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)
                });
              }
              if (detail.CommentText != "")
                commands.push({ appendRaw: "  " + detail.CommentText });
              break;
            case "4": //comment
              if (detail.CommentText != "")
                commands.push({ appendRaw: "  " + detail.CommentText });
              break;
          }
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        });
        commands.push({ appendLineFeed: 1 });
        commands.push({ enableEmphasis: true });
        if (pageModel.dispatchLabor.length > 0) {
          commands.push({
            appendRaw: "\x1D\x21\x01 Dispatch Labors \x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "Labor Code" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "  Description" });
          commands.push({ appendLineFeed: 1 });
          commands.push({ appendRaw: "Hours Spent "+(pageModel.smOptions.HideAmountFields?"":"Billing Rate Extension")});
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        }
        pageModel.dispatchLabor.forEach(detail => {
          commands.push({ appendRaw: detail.LaborSkillCode });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw:
              "  " +
              (detail.LineDescExtended
                ? detail.LineDescExtended
                : detail.LineDesc)
          });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw:
              ds.PrependWhiteSpaces(
                detail.HoursSpent.RoundTo(
                  pageModel.ciOptions.NumberOfDecimalPlacesInQty
                ),
                11
              ) +
              " " + (pageModel.smOptions.HideAmountFields?"":(
              ds.PrependWhiteSpaces(
                detail.BillingRate.RoundTo(
                  pageModel.ciOptions.NumberOfDecimalPlacesInPrice
                ),
                11
              ) +
              " " +
              ds.PrependWhiteSpaces(detail.ExtensionAmt.RoundTo(2), 10)))
          });
          if (detail.LaborCommentText != "")
          {
            commands.push({ appendLineFeed: 1 });
            commands.push({ appendRaw: "  " + detail.LaborCommentText });
          }
          commands.push({ enableEmphasis: false });
          commands.push({ appendLineFeed: 1 });
        });
        commands.push({ appendLineFeed: 2 });
        break;
    }
  }
  AppendDispatchTotals(commands, paperSize) {
    commands.push({ appendAlignment: "Right" });
    commands.push({
      append: "Taxable Amount : " + pageModel.dispatch.TaxableAmt.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    commands.push({
      append:
        "NonTaxable Amount : " + pageModel.dispatch.NonTaxableAmt.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    commands.push({
      append: "Less Discount : " + pageModel.dispatch.DiscountAmt.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    commands.push({
      append: "Freight : " + pageModel.dispatch.FreightAmt.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    commands.push({
      append: "Sales Tax : " + pageModel.dispatch.SalesTaxAmt.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    commands.push({
      append: "Dispatch Total : " + pageModel.dispatch.DispatchTotal.RoundTo(2)
    });
    commands.push({ appendLineFeed: 1 });
    if (pageModel.dispatch.DepositAmt > 0) {
      commands.push({
        append: "Deposit Amount : " + pageModel.dispatch.DepositAmt.RoundTo(2)
      });
      commands.push({ appendLineFeed: 1 });
      commands.push({
        append:
          "Net Dispatch: " +
          (
            pageModel.dispatch.DispatchTotal - pageModel.dispatch.DepositAmt
          ).RoundTo(2)
      });
      commands.push({ appendLineFeed: 1 });
    }
    commands.push({ appendLineFeed: 3 });
  }
  AppendSignature(commands, paperSize, callback) {
    if (pageModel.signature) {
      ds.WriteTempFile(
        pageModel.signature,
        pageModel.dispatch.TaskNo +
          "_" +
          pageModel.dispatch.DispatchNo +
          "_signature.jpg",
        function() {
          ds.ReadTempFile(
            pageModel.dispatch.TaskNo +
              "_" +
              pageModel.dispatch.DispatchNo +
              "_signature.jpg",
            function(fileEntry) {
              commands.push({
                appendBitmap: fileEntry.nativeURL,
                alignment: "Center",
                width: paperSize,
                bothScale: false
              });
              commands.push({ appendLineFeed: 3 });
              callback();
            },
            function(err) {
              smpMobileApi.ShowModal(
                "Issue",
                "Issue reading temporary file",
                "danger",
                5000
              );
              commands.push({ appendLineFeed: 3 });
              callback();
            }
          );
        },
        function(err) {
          smpMobileApi.ShowModal(
            "Issue",
            "Issue writing temporary file",
            "danger",
            5000
          );
          commands.push({ appendLineFeed: 3 });
          callback();
        }
      );
    } else {
      callback();
    }
  }
  WriteTempFile(dataUrl, fileName, success, error) {
    window.requestFileSystem(
      window.TEMPORARY,
      5 * 1024 * 1024,
      function(fs) {
        console.log("file system open: " + fs.name);

        // Creates a new file or returns the file if it already exists.
        fs.root.getFile(
          fileName,
          { create: true, exclusive: false },
          function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
              fileWriter.onwriteend = function() {
                console.log("Successful file write...");
              };

              fileWriter.onerror = function(e) {
                console.log("Failed file write: " + e.toString());
              };

              // If data object is not passed in,
              // create a new Blob instead.
              var dataObj = dataURItoBlob(dataUrl);
              fileWriter.write(dataObj);
              success();
            });
          },
          error
        );
      },
      error
    );
  }
  ReadTempFile(fileName, success, error) {
    window.requestFileSystem(
      window.TEMPORARY,
      5 * 1024 * 1024,
      function(fs) {
        fs.root.getFile(fileName, { create: false }, function(fileEntry) {
          success(fileEntry);
        });
      },
      error
    );
  }
  DeleteTempFile(fileName, success, error) {
    window.requestFileSystem(
      window.TEMPORARY,
      5 * 1024 * 1024,
      function(fs) {
        fs.root.getFile(fileName, { create: false }, function(fileEntry) {
          fileEntry.remove(
            function() {
              success();
              // The file has been removed succesfullyly
            },
            function(err) {
              error(err);
              // Error deleting the file
            },
            function() {
              // The file doesn't exist
            }
          );
        });
      },
      error
    );
  }

  PrependWhiteSpaces(str, length) {
    var retVal = new Array(length + 1).join(" ") + str;
    retVal = retVal.substr(retVal.length - length, length);
    return retVal;
  }
  InitializeControls() {
    this.CheckLogin(this, function(that) {
      that.InitializeMenu();
      that.InitializeTabs();
      that.InitializePageData();
    });
  }
  CalculateDispatchDetailPrice(dispatchLine) {
    var item = FindRowByFieldNameValuePair(
      pageModel.ciItems,
      "ItemCode",
      dispatchLine.ItemCode
    );
    if (!item) return 0;
    if (item.ItemType != "1") return item.StandardUnitPrice;
    var divisionNo = pageModel.taskInfo.ARDivisionNo;
    var customerNo = pageModel.taskInfo.CustomerNo;
    if (ds.UseBillToCustomer()) {
      divisionNo = pageModel.taskInfo.BillToDivisionNo;
      customerNo = pageModel.taskInfo.BillToCustomerNo;
    }
    var billOptions = ds.GetBillOptions(dispatchLine.ItemCode);
    var priceRecord = ds.GetPriceRecord(
      dispatchLine.ItemCode,
      item.PriceCode,
      pageModel.taskInfo.PriceLevel,
      divisionNo,
      customerNo
    );
    if (priceRecord.PricingMethod == "S") {
      priceRecord.DiscountMarkup1 = item.StandardUnitPrice;
    }
    var useBreak = 0;
    for (var i = 1; i <= 5; i++) {
      var breakQty = priceRecord["BreakQuantity" + i];
      if (breakQty == 0) {
        if (i == 1) {
          useBreak = i;
          break;
        } else {
          useBreak = i - 1;
          break;
        }
      } else {
        var tmpQty = dispatchLine.QuantityOrdered * item.SalesUMConvFctr;
        if (tmpQty <= breakQty) {
          useBreak = i;
          break;
        }
        if (i == 5) {
          useBreak = 5;
        }
      }
    }
    var price = 0;
    var optionsPrice = 0;
    var tmpPrice = item.StandardUnitPrice;
    if (billOptions.length > 0) {
      optionsPrice = ds.CalculateOptionsPrice(
        dispatchLine.ItemCode,
        billOptions
      );
      price = optionsPrice;
    }
    var pricingRate = priceRecord["DiscountMarkup" + useBreak];
    switch (priceRecord.PricingMethod) {
      case "C":
        price = item.StandardUnitPrice + optionsPrice + pricingRate;
        if (item.StandardUnitPrice == 0) {
          price = item.LastTotalUnitCost + optionsPrice + pricingRate;
        }
        break;
      case "P":
        price = item.StandardUnitPrice - pricingRate;
        break;
      case "M":
        price =
          item.StandardUnitCost +
          optionsPrice +
          (item.StandardUnitCost * pricingRate) / 100;
        if (item.StandardUnitCost == 0) {
          price =
            item.LastTotalUnitCost +
            optionsPrice +
            (item.LastTotalUnitCost * pricingRate) / 100;
        }
        break;
      case "D":
        price =
          item.StandardUnitPrice - (item.StandardUnitPrice * pricingRate) / 100;
        break;
      case "O":
      case "S":
        price = pricingRate + optionsPrice;
        break;
      default:
        price = item.StandardUnitPrice;
        break;
    }
    // ! Is Item on Sale?
    var salePrice = 0;
    if (item.SaleMethod == "P") {
      salePrice = item.SalesPromotionPrice;
    } else if (item.SaleMethod == "D") {
      salePrice = parseFloat(
        (
          item.StandardUnitPrice -
          (item.StandardUnitPrice * item.SalesPromotionDiscountPercent) / 100
        ).RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInPrice)
      );
    }
    if (item.SalesPromocotionCode != "") {
      if (
        pageModel.dispatch.DispatchDate >= item.SaleStartingDate &&
        pageModel.dispatch.DispatchDate <= item.SaleEndingDate
      ) {
        if (salePrice + optionsPrice < price) {
          price = salePrice + optionsPrice;
        }
      }
    }
    price =
      parseFloat(
        price.RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInPrice)
      ) * item.SalesUMConvFctr;
    item.StandardUnitPrice = tmpPrice;
    var contractPrice = ds.CalculateContractPrice(dispatchLine.ItemCode, price);
    if (contractPrice != null) {
      price = contractPrice;
    }
    return price;
  }
  CalculateContractPrice(itemCode, calculatedPrice) {
    var contractPrice = null;
    var itemContractDetails = FindRecordsByParams(
      pageModel.taskContractDetails,
      false,
      [
        { Name: "ItemLaborSkillCode", Value: itemCode },
        { Name: "LineType", Value: "1" }
      ]
    );
    if (itemContractDetails.length > 0) {
      itemContractDetails.forEach(elem => {
        if (elem.ExpirationDate > pageModel.taskInfo.TaskDate) {
          switch (elem.PricingMethod) {
            case "S":
              contractPrice = calculatedPrice;
              break;
            case "D":
              contractPrice =
                calculatedPrice -
                (calculatedPrice * elem.LineDiscountPercent) / 100;
              break;
            case "O":
              contractPrice =
                (elem.OverridePrice / elem.UnitOfMeasureConvFactor) * 1;//TODO MODIFY THIS LINES WHEN UOM WILL BE AVAILABLE IN MOBILE
                //UnitOfMeasureConvFactor;
              break;
            case "P":
              contractPrice =
                calculatedPrice -
                (elem.PriceOff / elem.UnitOfMeasureConvFactor) * 1;//TODO MODIFY THIS LINES WHEN UOM WILL BE AVAILABLE IN MOBILE
                  //UnitOfMeasureConvFactor;
              break;
          }
        }
      });
    }
    if (pageModel.taskContract!=null && pageModel.taskContract.AllCoveredMaterials && contractPrice == null) {
      contractPrice = 0;
    }
    if (contractPrice < 0) {
      contractPrice = 0;
    }
    return contractPrice;
  }
  CalculateOptionsPrice(billOptions) {
    var optsPrice = 0;
    if (
      pageModel.bmOptions.BMIntegrated &&
      pageModel.bmOptions.UseOptionBills
    ) {
      billOptions.forEach(element => {
        optsPrice += element.OptionPrice;
      });
    }
    return optsPrice;
  }
  GetPriceRecord(itemCode, priceCode, priceLevel, divNo, customerNo) {
    var record = FindRecordsByParams(pageModel.priceCodes, true, [
      { Name: "PriceCodeRecord", Value: "2" },
      { Name: "ARDivisionNo", Value: divNo },
      { Name: "CustomerNo", Value: customerNo }
    ])[0];
    var priceType = 6;
    if (record) {
      priceType = 1;
    } else {
      record = FindRecordsByParams(pageModel.priceCodes, true, [
        { Name: "PriceCodeRecord", Value: "1" },
        { Name: "ItemCode", Value: itemCode },
        { Name: "CustomerPriceLevel", Value: priceLevel }
      ])[0];
      if (record) {
        if (priceLevel != "") {
          priceType = 2;
        } else {
          priceType = 3;
        }
      } else {
        record = FindRecordsByParams(pageModel.priceCodes, true, [
          { Name: "PriceCodeRecord", Value: "0" },
          { Name: "PriceCode", Value: priceCode },
          { Name: "CustomerPriceLevel", Value: priceLevel }
        ])[0];
        if (record) {
          priceType = 4;
        } else {
          record = FindRecordsByParams(pageModel.priceCodes, true, [
            { Name: "PriceCodeRecord", Value: "0" },
            { Name: "PriceCode", Value: priceCode }
          ])[0];
          if (record) {
            priceType = 5;
          }
        }
      }
    }
    if (priceType == 6) {
      return {
        PriceType: 6,
        PriceCode: "3",
        ItemCode: itemCode,
        PricingMethod: "S",
        BreakQuantity1: 99999999
      };
    } else {
      record.PriceType = priceType;
      return record;
    }
  }
  GetBillOptions(itemCode) {
    var billRecords = FindRecordsByParams(pageModel.bmBillHeaders, true, [
      { Name: "BillNo", Value: itemCode }
    ]);
    if (billRecords.length > 0) {
      var currentRevision = billRecords[0].CurrentBillRevision;
      var billOptions = FindRecordsByParams(
        pageModel.bmBillOptionHeaders,
        false,
        [
          { Name: "BillNo", Value: itemCode },
          { Name: "Revision", Value: currentRevision }
        ]
      );
      return billOptions;
    }
    return [];
  }
  UseBillToCustomer() {
    var record = null;
    for (var i = 0; i < pageModel.arBillToSoldTos.length; i++) {
      if (
        pageModel.arBillToSoldTos[i]["SoldToDivisionNo"] ==
          pageModel.taskInfo.ARDivisionNo &&
          pageModel.arBillToSoldTos[i]["SoldToCustomerNo"] == pageModel.taskInfo.CustomerNo
      ) {
        record = pageModel.arBillToSoldTos[i];
        break;
      }
    }
    if (record && record.PricingMethod == "B") return true;
    return false;
  }
  CalculateDispatchDetailLaborPrice(laborLine) {
    var Type = "L";
    var LaborCode = laborLine.LaborSkillCode;
    var SkillCode = "";
    if (laborLine.LaborSkillCode.startsWith("/")) {
      Type = "S";
      LaborCode = "";
      SkillCode = laborLine.LaborSkillCode;
    }
    var tmpRetVal = FindRecordsByParams(
      pageModel.customerTechLaborSkillRates,
      true,
      [
        {
          Name: "ARDivisionNo",
          Value: pageModel.dispatch.Customer
            ? pageModel.dispatch.Customer.split("-")[0]
            : pageModel.dispatch.ARDivisionNo
        },
        {
          Name: "CustomerNo",
          Value: pageModel.dispatch.Customer
            ? pageModel.dispatch.Customer.split("-")[1]
            : pageModel.dispatch.CustomerNo
        },
        { Name: "ContractNo", Value: pageModel.taskInfo.ContractNo },
        { Name: "TechnicianCode", Value: pageModel.dispatch.TechnicianCode },
        { Name: "Type", Value: Type },
        { Name: "LaborCode", Value: LaborCode },
        { Name: "SkillCode", Value: SkillCode }
      ]
    )[0];
    if (tmpRetVal) {
      return tmpRetVal.BillingRate;
    }
    var Billing_Rate = ds.GetBillingRate(
      laborLine.LaborSkillCode,
      Type,
      pageModel.smOptions.BillingRateCalcPriorityHigh
    );
    if (Billing_Rate == null) {
      if (
        pageModel.smOptions.BillingRateCalcPriorityHigh !=
        pageModel.smOptions.BillingRateCalcPriorityMiddle
      ) {
        Billing_Rate = ds.GetBillingRate(
          laborLine.LaborSkillCode,
          Type,
          pageModel.smOptions.BillingRateCalcPriorityMiddle
        );
      }
      if (Billing_Rate == null) {
        if (
          pageModel.smOptions.BillingRateCalcPriorityMiddle !=
          pageModel.smOptions.BillingRateCalcPriorityLowest
        ) {
          Billing_Rate = ds.GetBillingRate(
            laborLine.LaborSkillCode,
            Type,
            pageModel.smOptions.BillingRateCalcPriorityLowest
          );
        }
      }
    }
    var newRate = Billing_Rate;
    var ApplyRatesCoveragePeriod = true;
    if (pageModel.taskInfo.ContractNo) {
      if (pageModel.taskContract) {
        if (ApplyRatesCoveragePeriod) {
          var overTimeLine = ds.CheckOvertime(
            FindRecordsByParams(pageModel.coverageCodes, true, {
              Name: "CoverageCode",
              Value: pageModel.taskInfo.CoverageCode
            })[0],
            laborLine.OverTimeStartDate,
            laborLine.OverTimeStartTime,
            ApplyRatesCoveragePeriod
          );
          if (!overTimeLine) {
            var tmpLaborSkillCode = laborLine.LaborSkillCode;
            if (Type == "S") {
              tmpLaborSkillCode = laborLine.LaborSkillCode.substr(1);
            }
            var NotFound = true;
            var laborContractDetails = FindRecordsByParams(
              pageModel.taskContractDetails,
              false,
              [
                { Name: "ItemLaborSkillCode", Value: tmpLaborSkillCode },
                { Name: "LineType", Value: "6" }
              ]
            );
            laborContractDetails.concat(
              FindRecordsByParams(pageModel.taskContractDetails, false, [
                { Name: "ItemLaborSkillCode", Value: tmpLaborSkillCode },
                { Name: "LineType", Value: "7" }
              ])
            );
            if (laborContractDetails.length > 0) {
              laborContractDetails.forEach(elem => {
                if (elem.ExpirationDate > pageModel.taskInfo.TaskDate) {
                  switch (elem.PricingMethod) {
                    case "S":
                      newRate = Billing_Rate;
                      break;
                    case "D":
                      newRate =
                        Billing_Rate -
                        (Billing_Rate * elem.LineDiscountPercent) / 100;
                      break;
                    case "O":
                      newRate = Billing_Rate.OverridePrice;
                      break;
                    case "P":
                      newRate = Billing_Rate - elem.PriceOff;
                      break;
                  }
                  NotFound = false;
                }
              });
            }
            if (newRate < 0) {
              Billing_Rate = 0;
            } else {
              Billing_Rate = newRate;
            }
            if (pageModel.taskContract && pageModel.taskContract.AllCoveredLabors && NotFound) {
              Billing_Rate = 0;
            }
          }
        }
      }
    }
    return Billing_Rate;
  }
  CheckOvertime(
    coverageRec,
    overTimeStartDate,
    overTimeStartTime,
    ApplyRatesOnlyDurCovrgPer
  ) {
    if (
      !coverageRec ||
      !overTimeStartDate ||
      !overTimeStartTime ||
      ApplyRatesOnlyDurCovrgPer != "Y"
    )
      return false;
    var WorkDay = null;
    var Week_Day = overTimeStartDate.getDay();
    if (Week_Day > 5 && coverageRec.WorkdaysOnly == "Y") {
      WorkDay = false;
    } else {
      WorkDay = true;
    }
    if (coverageRec.WorkdaysOnly == "Y") {
      var res = IsWorkingDay(overTimeStartDate);
      if (res != 2) {
        WorkDay = res == 1;
      }
    }
    if (
      !WorkDay ||
      OverTimeStartTime >= coverageRec["CloseTime" + Week_Day] ||
      OverTimeStartTime < coverageRec["OpenTime" + Week_Day]
    ) {
      return true;
    }
    return false;
  }

  GetBillingRate(laborSkillCode, type, Priority) {
    var billingRate = null;
    switch (Priority) {
      case "T":
        billingRate = pageModel.technician.BillingRate;
        break;
      case "L":
        if (type == "L") {
          var laborRecord = FindRecordsByParams(
            pageModel.laborSkillCodes,
            true,
            [{ Name: "LaborSkillCode", Value: laborSkillCode }]
          )[0];
          if (laborRecord) {
            billingRate = laborRecord.BillingRate;
          }
        }
        break;
      case "S":
        var skillRecord = FindRecordsByParams(pageModel.laborSkillCodes, true, [
          { Name: "LaborSkillCode", Value: laborSkillCode }
        ])[0];
        if (skillRecord) {
          billingRate = skillRecord.BillingRate;
        }
        break;
    }
    return billingRate;
  }
  CheckLogin(that, success) {
    smpMobileApi.Login(
      SMPMobileAPI.company,
      SMPMobileAPI.username,
      SMPMobileAPI.password,
      function(res) {
        if (res) {
          SetCacheValue(CacheIds.token, res);
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
      $(".toggle-menu-inner").css("top", $("nav")[0].scrollHeight + 2 + "px");
      $("#toggle-menu").show();
      $("#toggle-menu")
        .off("click")
        .click(function() {
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
    $("#settingsPage").click(function(e) {
      SetCacheValue(CacheIds.previousPage, "../Pages/Dispatch.html");
      window.location.replace("../Pages/Settings.html");
      e.preventDefault();
    });
    this.LoadCounter();
  }
  LoadCounter() {
    if (!SMPMobileAPI.IsOnline) {
      $("#toggleDiv").removeClass("turnedOn");
      $("#clearCache").removeClass("d-none");
      dbEngine.GetModifiedRecordsCount(
        function(count) {
          $("#offlineCounter").text(count);
          $("#offlineCounter").removeClass("d-none");
        },
        function(err) {
          $("#offlineCounter").text("?");
          $("#offlineCounter").removeClass("d-none");
        }
      );
      $("#offlineCounter")
        .off("click")
        .click(function() {
          dbEngine.GetModifiedRecordsList(
            function(modifications) {
              var groupedByTaskNoModifications = groupBy(
                beautifyRecords(modifications),
                "TaskNo"
              );
              $("#offlineModifications .modal-body").empty();
              for (var taskNum in groupedByTaskNoModifications) {
                var str = '<div id="' + taskNum + '">';
                str += "<h3> Task No: " + taskNum + "</h3>";
                groupedByTaskNoModifications[taskNum].forEach(x => {
                  if (x.DispatchNo == null && x.AttachmentName==null){
                    str += `<p>${x.TaskNo} Task has been ${
                      x.State == RowStates.INSERTED ? "added" : "updated"
                    }</p>`;
                  }
                  else if(x.DispatchNo == null) {
                    str += `<p>${x.AttachmentName} attachment has been ${
                      x.State == RowStates.INSERTED ? "added" : "updated"
                    }</p>`;
                  } else if (x.LineKey == null) {
                    str += `<p>${x.DispatchNo} Dispatch has been updated</p>`;
                  } else if (x.TableName == "SMDispatchDetail") {
                    str += `<p>${x.DispatchNo} Dispatch ${
                      x.LineKey
                    } Dispatch Detail has been ${
                      x.State == RowStates.INSERTED
                        ? "added"
                        : x.State == RowStates.UPDATED
                        ? "updated"
                        : "deleted"
                    }</p>`;
                  } else {
                    str += `<p>${x.DispatchNo} Dispatch ${
                      x.LineKey
                    } Dispatch Detail Labor has been ${
                      x.State == RowStates.INSERTED
                        ? "added"
                        : x.State == RowStates.UPDATED
                        ? "updated"
                        : "deleted"
                    }</p>`;
                  }
                });
                str += "</div>";
                $("#offlineModifications .modal-body").append(str);
              }
              $("#offlineModifications").modal();
            },
            function(err) {}
          );
        });
    }
    $("#toggleDiv")
      .off("click")
      .click(function() {
        $("#onlineStateWarningModal").modal();
      });
    $("#confirmStateToggle")
      .off("click")
      .click(function() {
        $('#onlineStateWarningModal').modal('hide');
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        smpMobileApi.ToggleOnlineState(
          function() {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            $("#toggleDiv").toggleClass("turnedOn");
            smpMobileApi.ShowModal(
              "Success",
              "Switched Online State successfully.</ br>Page will be reloaded in 3 seconds.",
              "success",
              5000
            );
            setTimeout(function() {
              window.location.reload();
            }, 3000);
            $()
          },
          function(err) {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Issue during toggling Online State.</ br>Page will be reloaded in 3 seconds.",
              "danger",
              5000
            );
            setTimeout(function() {
              window.location.reload();
            }, 3000);

          }
        );
      });
    $("#clearCache").off("click").click(() => {
      $("#clearCacheWarningModal").modal();
    });
    $("#confirmClearCache").click(() => {
      $("#clearCacheWarningModal").modal("hide");
      window.localStorage.setItem("APP_STATE", 1)
      smpMobileApi.ShowModal(
        "Success",
        "Cache cleared and state switched Online successfully.</ br>Page will be reloaded in 3 seconds.",
        "success",
        3000
      );
      setTimeout(function() {
        window.location.reload();
      }, 3000);
    });
  }
  InitializeTabs() {
    $(".tablinks").click(function() {
      $(".tabcontent").addClass("hideTabContent");
      //$("#" + $(this).attr("data-target")).removeClass("d-none");
      //$("#" + $(this).attr("data-target")).addClass("hideTabContent");
      $(".tablinks").removeClass("active");
      $(this).addClass("active");
      var maxHeight =
        $(window.top).height() -
        $(".navbar").outerHeight() -
        $(".dispatchInfo").outerHeight() -
        $(".tab").outerHeight() -
        $("#" + $(this).attr("data-target") + " .row").outerHeight() -
        $("#" + $(this).attr("data-target") + " thead").outerHeight() -
        20;
      var maxRowHeight =
        $(window.top).height() -
        $(".navbar").outerHeight() -
        $(".dispatchInfo").outerHeight() -
        $(".tab").outerHeight() -
        $(
          "#" + $(this).attr("data-target") + " .row:first-child"
        ).outerHeight() -
        20;
      $("#" + $(this).attr("data-target") + " .table-container").css(
        "max-height",
        (maxHeight > 200 ? maxHeight : 200) + "px"
      );
      $("#" + $(this).attr("data-target") + " .form-container").css(
        "max-height",
        (maxRowHeight > 200 ? maxRowHeight : 200) + "px"
      );

      $("#" + $(this).attr("data-target")).removeClass("hideTabContent");
    });
    $(window).resize(function() {
      $(".tablinks.active").click();
    });

    signaturePad = new SignaturePad(document.getElementById("signature-pad"), {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)"
    });
    $("#saveSignature").click(function(event) {
      if (!signaturePad.isEmpty()) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        var data = signaturePad.toDataURL("image/jpeg");
        var name =
          pageModel.dispatch.TaskNo +
          "_" +
          pageModel.dispatch.DispatchNo +
          "_signature.jpg";
        smpMobileApi.InsertTaskAttachment(
          pageModel.dispatch.TaskNo,
          name,
          data,
          function(res) {
            smpMobileApi.GetTaskAttachments(
              pageModel.dispatch.TaskNo,
              function(attachments) {
                pageModel.taskAttachments = attachments;
                $("#dispatchDetailAttachmentsTableBody tr").remove();
                ds.FillDispatchAttachments(pageModel.taskAttachments);
                ds.LoadCounter();
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Success",
                  "Task Attachment inserted succesfully",
                  "success",
                  5000
                );
              },
              function(error) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                ds.LoadCounter();
                smpMobileApi.ShowModal(
                  "Issue",
                  "Issue during loading <strong>Task Attachments</strong>." +
                    error.Message,
                  "danger",
                  15000
                );
              }
            );
          },
          function(error) {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Issue during insert of Task Attachment." + error.Message,
              "danger",
              15000
            );
          }
        );
      }
    });
    $("#clearSignature").click(function(event) {
      signaturePad.clear();
    });
    $(".tablinks").click();
    $('.tablinks[data-target="dispatchHeader"]').click();
  }
  InitializePageData() {
    var taskNo = GetCacheValue(CacheIds.selectedTaskDispatch).split("_")[0];
    var dispatchNo = GetCacheValue(CacheIds.selectedTaskDispatch).split("_")[1];
    //console.log('Ajaxs started',new Date());
    console.time("AjaxRequests");
    if (SMPMobileAPI.IsOnline) {
      smpMobileApi.GetDispatchData(
        taskNo,
        dispatchNo,
        function(pageData) {
          pageModel.dispatch = pageData.dispatch;
          pageModel.arBillToSoldTos = pageData.arBillToSoldTos;
          pageModel.arOptions = pageData.arOptions;
          pageModel.bmBillHeaders = pageData.bmBillHeaders;
          pageModel.bmBillOptionHeaders = pageData.bmBillOptionHeaders;
          pageModel.bmBillOptionCategories = pageData.bmBillOptionCategories;
          pageModel.bmOptions = pageData.bmOptions;
          pageModel.coverageCodes = pageData.coverageCodes;
          pageModel.dispatchDetail = pageData.dispatchDetail;
          pageModel.dispatchLabor = pageData.dispatchLabor;
          pageModel.dispatchPayments = pageData.dispatchPayments;
          pageModel.taskAttachments = pageData.taskAttachments;
          pageModel.taskInfo = pageData.taskInfo;
          pageModel.taskStatuses = pageData.taskStatuses;
          pageModel.dispatchDesc = pageData.dispatchDesc;
          pageModel.taskTypes = pageData.taskTypes;
          pageModel.taskContract = pageData.taskContract;
          pageModel.taskContractDetails = pageData.taskContractDetails;
          pageModel.taskPayments = pageData.taskPayments;
          pageModel.natureOfTasks = pageData.natureOfTasks;
          pageModel.priceCodes = pageData.priceCodes;
          pageModel.priceLevels = pageData.priceLevels;
          pageModel.paymentTypes = pageData.paymentTypes;
          pageModel.customerPaymentMethods = pageData.customerPaymentMethods;
          pageModel.customerTechLaborSkillRates = pageData.customerTechLaborSkillRates;
          pageModel.ciOptions = pageData.ciOptions;
          pageModel.smOptions = pageData.smOptions;
          pageModel.soOptions = pageData.soOptions;
          pageModel.companyInfo = pageData.companyInfo;
          pageModel.ciItems = pageData.ciItems;
          pageModel.laborSkillCodes = pageData.laborSkillCodes;
          pageModel.technician = pageData.technician;
          pageModel.workingDaysDetails = pageData.workingDaysDetails;
          pageModel.lastDeliveries = pageData.lastDeliveries;
          pageModel.nextDeliveries = pageData.nextDeliveries;
          pageModel.ajaxCounter=0;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter=pageModel.ajaxCounter;
          pageModel.loadIssues.push(error.Message);
          pageModel.allLoaded();
        }
      );
    } else {
      smpMobileApi.GetTechnician(
        function(technician) {
          pageModel.technician = technician;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>SM Technician</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetDispatchPayments(
        taskNo + dispatchNo,
        function(payments) {
          pageModel.dispatchPayments = payments;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Dispatch Payments</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetCoverageCodes(
        function(covCodes) {
          pageModel.coverageCodes = covCodes;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>SM Coverage Codes</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetCustomerTechLaborSkillRate(
        function(laborSkillRates) {
          pageModel.customerTechLaborSkillRates = laborSkillRates;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong> Labor Skill Rates</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetWorkingDaysDetails(
        function(workingDaysDetails) {
          pageModel.workingDaysDetails = workingDaysDetails;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong> Working Days Details</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetTaskPayments(
        taskNo,
        function(payments) {
          pageModel.taskPayments = payments;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Task Payments</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetAROptions(
        function(options) {
          pageModel.arOptions = options;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>AR Options</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetARBillToSoldTos(
        function(records) {
          pageModel.arBillToSoldTos = records;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>AR Bill To Sold To information</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetBMBillHeaders(
        function(headers) {
          pageModel.bmBillHeaders = headers;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>BM Bill Headers</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetBMBillOptionHeaders(
        function(headers) {
          pageModel.bmBillOptionHeaders = headers;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>BM Bill Option Headers</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetBMBillOptionCategories(
        function(categories) {
          pageModel.bmBillOptionCategories = categories;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>BM Bill Option Categories</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetBMOptions(
        function(options) {
          pageModel.bmOptions = options;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>BM Options</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetCIOptions(
        function(ciOptions) {
          pageModel.ciOptions = ciOptions;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>CI options</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetCIItems(
        function(items) {
          pageModel.ciItems = items;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>CI Items</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetLaborSkillCodes(
        function(items) {
          pageModel.laborSkillCodes = items;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>SM Labor/Skill Codes</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetCompanyInfo(
        function(compInfo) {
          pageModel.companyInfo = compInfo;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Company Information</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetDispatch(
        taskNo,
        dispatchNo,
        function(dispatch) {
          pageModel.dispatch = dispatch;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
          smpMobileApi.GetDispatchDescriptions(
            [{TaskNo: pageModel.dispatch.TaskNo, DispatchNo: pageModel.dispatch.DispatchNo}],
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
          pageModel.loadIssues.push(
            "Issue during loading <strong>Dispatch</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetTaskInfo(
        taskNo,
        function(task) {
          pageModel.taskInfo = task;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
          smpMobileApi.GetTaxRate(
            task.ARDivisionNo,
            task.CustomerNo,
            task.TaxSchedule,
            function(taxRate) {
              pageModel.taxRate = taxRate;
              pageModel.ajaxCounter--;
              pageModel.allLoaded();
            },
            function(error) {
              pageModel.ajaxFailedCounter++;
              pageModel.loadIssues.push(
                "Issue during loading <strong>Tax Rate</strong>"
              );
              pageModel.allLoaded();
            }
          );
          smpMobileApi.GetCustomerCreditCards(
            task.ARDivisionNo,
            task.CustomerNo,
            function(ccInfos) {
              pageModel.customerPaymentMethods = ccInfos;
              pageModel.ajaxCounter--;
              pageModel.allLoaded();
            },
            function(error) {
              pageModel.ajaxFailedCounter++;
              pageModel.loadIssues.push(
                "Issue during loading <strong>Customer Payment Methods</strong>"
              );
              pageModel.allLoaded();
            }
          );
          smpMobileApi.GetTaskContractHeader(
            task.ContractNo,
            function(contractHeader) {
              pageModel.taskContract = contractHeader;
              pageModel.ajaxCounter--;
              pageModel.allLoaded();
            },
            function(error) {
              pageModel.ajaxFailedCounter++;
              pageModel.loadIssues.push(
                "Issue during loading <strong>Task Contract Header</strong>"
              );
              pageModel.allLoaded();
            }
          );
          smpMobileApi.GetTaskContractDetails(
            task.ContractNo,
            function(contractDetails) {
              pageModel.taskContractDetails = contractDetails;
              pageModel.ajaxCounter--;
              pageModel.allLoaded();
            },
            function(error) {
              pageModel.ajaxFailedCounter++;
              pageModel.loadIssues.push(
                "Issue during loading <strong>Task Contract Details</strong>"
              );
              pageModel.allLoaded();
            }
          );
          smpMobileApi.GetLastDeliveries(pageModel.taskInfo.ARDivisionNo+'-'+pageModel.taskInfo.CustomerNo,GetDateForInput(pageModel.taskInfo.ScheduledDate),pageModel.taskInfo.TaskNo,function(lastDeliveries){
            pageModel.lastDeliveries = lastDeliveries;
            pageModel.ajaxCounter--;
            pageModel.allLoaded();
            smpMobileApi.GetNextDeliveries(pageModel.taskInfo.ARDivisionNo+'-'+pageModel.taskInfo.CustomerNo,GetDateForInput(pageModel.taskInfo.ScheduledDate),pageModel.taskInfo.TaskNo,function(nextDeliveries){
              pageModel.nextDeliveries = nextDeliveries;
              pageModel.ajaxCounter--;
              pageModel.allLoaded();
            },function(error)
            {
              pageModel.ajaxFailedCounter++;
              pageModel.loadIssues.push(
                "Issue during loading <strong>Next Activities</strong>"
              );
              pageModel.allLoaded();
            });
          },function(error)
          {
            pageModel.ajaxFailedCounter++;
            pageModel.ajaxFailedCounter++;
            pageModel.loadIssues.push(
              "Issue during loading <strong>Last Activities</strong>"
            );
          });
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Task</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetDispatchDetails(
        taskNo,
        dispatchNo,
        function(dispatchDetails) {
          pageModel.dispatchDetail = dispatchDetails;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Dispatch Details</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetDispatchDetailLabors(
        taskNo,
        dispatchNo,
        function(dispatchDetailLabors) {
          pageModel.dispatchLabor = dispatchDetailLabors;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Dispatch Labors</strong>"
          );
          pageModel.allLoaded();
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
          pageModel.loadIssues.push(
            "Issue during loading <strong>Nature of Tasks</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetPriceCodes(
        function(priceCodes) {
          pageModel.priceCodes = priceCodes;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>AR Price Codes</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetPriceLevels(
        function(priceLevels) {
          pageModel.priceLevels = priceLevels;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>AR Price Levels</strong>"
          );
          pageModel.allLoaded();
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
      smpMobileApi.GetSOOptions(
        function(soOptions) {
          pageModel.soOptions = soOptions;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>SO options</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetTaskAttachments(
        taskNo,
        function(attachments) {
          pageModel.taskAttachments = attachments;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>Task Attachments</strong>"
          );
          pageModel.allLoaded();
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
          pageModel.loadIssues.push(
            "Issue during loading <strong>Task Statuses</strong>"
          );
          pageModel.allLoaded();
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
          pageModel.loadIssues.push(
            "Issue during loading <strong>Task Types</strong>"
          );
          pageModel.allLoaded();
        }
      );
      smpMobileApi.GetPaymentTypes(
        function(paymentTypes) {
          pageModel.paymentTypes = paymentTypes;
          pageModel.ajaxCounter--;
          pageModel.allLoaded();
        },
        function(error) {
          pageModel.ajaxFailedCounter++;
          pageModel.loadIssues.push(
            "Issue during loading <strong>AR Payment Types</strong>"
          );
          pageModel.allLoaded();
        }
      );
    }
  }
  InitializeDispatchEvents(dispatch, taskInfo, taskType, taskStatus, natureOfTask, dispatchDesc) {
    var UnitPriceDecimals =
      pageModel.ciOptions && pageModel.ciOptions.NumberOfDecimalPlacesInPrice
        ? pageModel.ciOptions.NumberOfDecimalPlacesInPrice
        : 2;
    var QuantityDecimals =
      pageModel.ciOptions && pageModel.ciOptions.NumberOfDecimalPlacesInQty
        ? pageModel.ciOptions.NumberOfDecimalPlacesInQty
        : 2;
    if (taskInfo) {
      $("#dispatch_TaskInfo").click(function(e) {
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
        $("#iig_dispatchExtendedDescriptionText").text("")
        $("#taskInfo_TaskNo").text(taskInfo.TaskNo);
        $("#taskInfo_Type").text(taskType.Description);
        $("#taskInfo_Status").text(taskStatus.Description);
        $("#taskInfo_Desc").text(taskInfo.TaskDescription);
        $("#taskInfo_ContractNo").text(taskInfo.ContractNo);
        if (natureOfTask) {
          var anyQuestion = false;
          if (natureOfTask.Description) {
            $("#taskInfo_NatureOfTask").text(natureOfTask.Description);
            $("#exd_natureOfTask").show();
          } else {
            $("#exd_natureOfTask").hide();
          }
          if (natureOfTask.Question1) {
            $("#taskInfo_NatureOfTaskQuestion1").text(natureOfTask.Question1);
            //$("#taskInfo_NatureOfTaskAnswer1").text(taskInfo.NatureOfTaskAnswer1);
            $("#taskInfo_NatureOfTaskAnswer1_Input").val(pageModel.taskInfo.NatureOfTaskAnswer1);
            $("#exd_natureOfTaskQuestion1").show();
            anyQuestion = true;
          } else {
            $("#exd_natureOfTaskQuestion1").hide();
          }
          if (natureOfTask.Question2) {
            $("#taskInfo_NatureOfTaskQuestion2").text(natureOfTask.Question2);
            //$("#taskInfo_NatureOfTaskAnswer2").text(taskInfo.NatureOfTaskAnswer2);
            $("#taskInfo_NatureOfTaskAnswer2_Input").val(pageModel.taskInfo.NatureOfTaskAnswer2);
            $("#exd_natureOfTaskQuestion2").show();
            anyQuestion = true;
          } else {
            $("#exd_natureOfTaskQuestion2").hide();
          }
          if (natureOfTask.Question3) {
            $("#taskInfo_NatureOfTaskQuestion3").text(natureOfTask.Question3);
           //$("#taskInfo_NatureOfTaskAnswer3").text(taskInfo.NatureOfTaskAnswer3);
           $("#taskInfo_NatureOfTaskAnswer3_Input").val(pageModel.taskInfo.NatureOfTaskAnswer3);
            $("#exd_natureOfTaskQuestion3").show();
            anyQuestion = true;
          } else {
            $("#exd_natureOfTaskQuestion3").hide();
          }
          if (natureOfTask.Question4) {
            $("#taskInfo_NatureOfTaskQuestion4").text(natureOfTask.Question4);
            //$("#taskInfo_NatureOfTaskAnswer4").text(taskInfo.NatureOfTaskAnswer4);
            $("#taskInfo_NatureOfTaskAnswer4_Input").val(pageModel.taskInfo.NatureOfTaskAnswer4);
            $("#exd_natureOfTaskQuestion4").show();
            anyQuestion = true;
          } else {
            $("#exd_natureOfTaskQuestion4").hide();
          }
          if (natureOfTask.Question5) {
            $("#taskInfo_NatureOfTaskQuestion5").text(natureOfTask.Question5);
            //$("#taskInfo_NatureOfTaskAnswer5").text(taskInfo.NatureOfTaskAnswer5);
            $("#taskInfo_NatureOfTaskAnswer5_Input").val(pageModel.taskInfo.NatureOfTaskAnswer5);
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
        //removing the Save btn for offline mode
        //var $btnSave = $("#btnSave");
        //SMPMobileAPI.IsOnline ? $btnSave.removeClass("d-none") : $btnSave.addClass("d-none");
        $("#taskInfoModal").modal();
      });
      $("#dispatch_CustomerInfo").click(function(e) {
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
        $(".ShipToAddr-link").attr(
          "href",
          "https://maps.google.com/?q=" +
            taskInfo.ShipToAddress +
            " " +
            taskInfo.ShipToCity
        );
        $(".BillToAddr-link").attr(
          "href",
          "https://maps.google.com/?q=" +
            taskInfo.BillToAddress +
            " " +
            taskInfo.BillToCity
        );
        if (!SMPMobileAPI.IsMobileVersion) {
          $(".ShipToAddr-link").attr("target", "_blank");
          $(".BillToAddr-link").attr("target", "_blank");
        }
        $("#customerInfoModal").modal();
      });
    }
    if (!SMPMobileAPI.IsOnline) {
      $("#dispatch_ProcessPayment").hide();
    } else {
      $("#dispatch_ProcessPayment").click(function(e) {
        if (pageModel.taskInfo.DepositAmt > 0) {
          $("#taskHasPaymentModal").modal();
          return;
        }
        var depositRecord = FindRecordsByParams(pageModel.taskPayments, false, [
          { Name: "PaymentTypeCategory", Value: "D" }
        ])[0];
        var prepaymentRecord = FindRecordsByParams(
          pageModel.taskPayments,
          false,
          [{ Name: "PaymentTypeCategory", Value: "P" }]
        )[0];
        if (depositRecord && depositRecord.TransactionAmt > 0) {
          $("#taskHasPaymentModal").modal();
          return;
        } else if (prepaymentRecord && prepaymentRecord.TransactionAmt > 0) {
          $("#taskHasPaymentModal").modal();
          return;
        }
        $("#checkNumberInput").val("");
        $("#refNumberInput").val("");
        $("#newCreditCardChkBox").prop("checked", false);
        $("#cardNumberInput").val("");
        $("#cardNumberInput").inputmask("9{4}-9{4}-9{4}-9{1,4}");
        $("#expirationDateInput").val("");
        $("#expirationDateInput").inputmask({
          alias: "datetime",
          inputFormat: "mm/yyyy"
        });
        $("#cvvInput").val("");
        $("#cvvInput").inputmask("9{3,4}");
        $("#paymentAmountInput").val(0.0);
        $("#paymentTypeInput option").remove();
        $("#paymentTypeInput").append(
          '<option value="NONE" selected>NONE</option>'
        );
        pageModel.paymentTypes.forEach(paymentType => {
          $("#paymentTypeInput").append(
            '<option value="' +
              paymentType.PaymentType +
              '">' +
              paymentType.PaymentDesc +
              "</option>"
          );
        });
        $(".newCard").hide();
        $(".ccPayment").hide();
        $(".cashPayment").hide();
        $(".checkPayment").hide();
        $("#newCreditCardChkBox").prop("checked", false);

        var dispatchDepositRecord = FindRecordsByParams(
          pageModel.dispatchPayments,
          false,
          [{ Name: "PaymentTypeCategory", Value: "D" }]
        )[0];
        var dispatchPrepaymentRecord = FindRecordsByParams(
          pageModel.dispatchPayments,
          false,
          [{ Name: "PaymentTypeCategory", Value: "P" }]
        )[0];
        if (dispatchDepositRecord && dispatchDepositRecord.TransactionAmt > 0) {
          $("#paymentTypeInput").val(dispatchDepositRecord.PaymentType);
          $("#paymentTypeInput").trigger("change");
          $("#paymentIDInput").val(dispatchDepositRecord.CreditCardID);
          $("#paymentIDInput").trigger("change");
          $("#paymentAmountInput").val(dispatchDepositRecord.TransactionAmt);
          $("#paymentAmountInput").trigger("change");
        } else if (
          dispatchPrepaymentRecord &&
          dispatchPrepaymentRecord.TransactionAmt > 0
        ) {
          $("#paymentTypeInput").val(dispatchPrepaymentRecord.PaymentType);
          $("#paymentTypeInput").trigger("change");
          $("#paymentIDInput").val(dispatchPrepaymentRecord.CreditCardID);
          $("#paymentIDInput").trigger("change");
          $("#paymentAmountInput").val(dispatchPrepaymentRecord.TransactionAmt);
          $("#paymentAmountInput").trigger("change");
        } else if (pageModel.dispatch.DepositAmt > 0) {
          $("#paymentTypeInput").val(pageModel.dispatch.PaymentType);
          $("#paymentTypeInput").trigger("change");
          $("#checkNumberInput").val(pageModel.dispatch.CheckNoForDeposit);
          $("#checkNumberInput").trigger("change");
          $("#refNumberInput").val(pageModel.dispatch.OtherPaymentTypeRefNo);
          $("#refNumberInput").trigger("change");
          $("#paymentAmountInput").val(pageModel.dispatch.DepositAmt);
          $("#paymentAmountInput").trigger("change");
        }
        $("#processPaymentModal").modal();
      });
      $("#paymentTypeInput").change(function(e) {
        var selectedPaymentType = $(this).val();
        $("#checkNumberInput").val("");
        $("#refNumberInput").val("");
        $("#cardNumberInput").val("");
        $("#expirationDateInput").val("");
        $("#cvvInput").val("");
        $("#paymentAmountInput").val(0.0);
        if (selectedPaymentType == "NONE") {
          $(".cashPayment").hide();
          $(".ccPayment").hide();
          $(".newCard").hide();
          $(".checkPayment").hide();
          return;
        } else {
          var paymentTypeRecord = FindRowByFieldNameValuePair(
            pageModel.paymentTypes,
            "PaymentType",
            selectedPaymentType
          );
          switch (paymentTypeRecord.PaymentMethod) {
            case "C":
            case "O":
              $(".cashPayment").hide();
              $(".ccPayment").hide();
              $(".newCard").hide();
              $(".checkPayment").show();
              break;
            case "D":
              $(".checkPayment").hide();
              $(".ccPayment").hide();
              $(".newCard").hide();
              $(".cashPayment").show();
              break;
            case "R":
              $(".checkPayment").hide();
              $(".cashPayment").hide();
              $(".newCard").hide();
              $("#paymentIDInput option").remove();
              $("#paymentIDInput").append(
                '<option value="NONE" selected>NONE</option>'
              );
              pageModel.customerPaymentMethods.forEach(method => {
                $("#paymentIDInput").append(
                  '<option value="' +
                    method.CreditCardID +
                    '">' +
                    method.CreditCardID +
                    "</option>"
                );
              });
              $("#paymentIDInput").prop("disabled", false);
              $(".ccPayment").show();
              break;
          }
        }
      });
      $("#newCreditCardChkBox").change(function(e) {
        var value = $("#newCreditCardChkBox").prop("checked");
        if (value) {
          $("#paymentIDInput").prop("disabled", true);
          $("#cardNumberInput").val("");
          $("#expirationDateInput").val("");
          $("#cvvInput").val("");
          $(".newCard").show();
        } else {
          $("#paymentIDInput").prop("disabled", false);
          $(".newCard").hide();
        }
      });
      $("#submitPayment").click(function(e) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        if (ds.ValidatePayment()) {
          var paymentTypeRecord = FindRowByFieldNameValuePair(
            pageModel.paymentTypes,
            "PaymentType",
            $("#paymentTypeInput").val()
          );
          var paymentAmount = parseFloat($("#paymentAmountInput").val());
          var paymentData = "";
          if (paymentTypeRecord.PaymentMethod == "R") {
            paymentData = {
              CreditCardID: $("#newCreditCardChkBox").prop("checked")
                ? ""
                : $("#paymentIDInput").val(),
              PaymentType: paymentTypeRecord.PaymentType,
              CreditCardNo: $("#cardNumberInput").val(),
              ExpirationDateYear: $("#expirationDateInput")
                .val()
                .split("/")[1],
              ExpirationDateMonth: $("#expirationDateInput")
                .val()
                .split("/")[0],
              CVV: $("#cvvInput").val(),
              DepositAmt: paymentAmount
            };
          } else {
            paymentData = {
              PaymentType: paymentTypeRecord.PaymentType,
              CheckNoForDeposit: $("#checkNumberInput").val(),
              OtherPaymentTypeRefNo: $("#refNumberInput").val(),
              DepositAmt: paymentAmount
            };
          }
          if (paymentData != "") {
            smpMobileApi.UpdateDispatchPayment(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              paymentTypeRecord.PaymentMethod,
              paymentData,
              function(res) {
                smpMobileApi.GetDispatch(
                  pageModel.dispatch.TaskNo,
                  pageModel.dispatch.DispatchNo,
                  function(updatedDispatch) {
                    pageModel.dispatch = updatedDispatch;
                    var dispatchStatus = FindRowByFieldNameValuePair(
                      pageModel.taskStatuses,
                      "StatusCode",
                      updatedDispatch.StatusCode
                    );
                    ds.FillDispatchHeader(
                      updatedDispatch,
                      dispatchStatus,
                      pageModel.taskStatuses
                    );
                    smpMobileApi.GetDispatchPayments(
                      pageModel.dispatch.TaskNo + pageModel.dispatch.DispatchNo,
                      function(dispatchPayments) {
                        pageModel.dispatchPayments = dispatchPayments;
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        smpMobileApi.ShowModal(
                          "Success",
                          "Dispatch Payment updated succesfully",
                          "success",
                          5000
                        );
                      },
                      function(err) {
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        smpMobileApi.ShowModal(
                          "Issue",
                          "Failed to get updated <strong>Dispatch Payments</strong><br />" +
                            err.Message,
                          "danger",
                          15000
                        );
                      }
                    );
                  },
                  function(err) {
                    $(".loading").toggleClass("d-none");
                    $(".loading div").toggleClass("loadingIcon");
                    smpMobileApi.ShowModal(
                      "Issue",
                      "Failed to get updated <strong>Dispatch Header</strong><br />" +
                        err.Message,
                      "danger",
                      15000
                    );
                  }
                );
              },
              function(err) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed updated <strong>Dispatch Payment</strong><br />" +
                    err.Message,
                  "danger",
                  15000
                );
              }
            );
          }
          $("#processPaymentModal").modal("toggle");
        } else {
          $("#processPaymentInfo form")
            .get(0)
            .reportValidity();
          $(".loading").toggleClass("d-none");
          $(".loading div").toggleClass("loadingIcon");
        }
        //e.preventDefault();
      });
    }

    $("#saveDispatchHeader").click(function(e) {
      //Show Loading Icon
      $(".loading").toggleClass("d-none");
      $(".loading div").toggleClass("loadingIcon");
      if ($("#dispatchDateInput").val() != "")
        pageModel.dispatch.DispatchDate = $("#dispatchDateInput").val();
      if ($("#dispatchStatusSelect").val() != "")
        pageModel.dispatch.StatusCode = $("#dispatchStatusSelect").val();
      if ($("#dispatchStartDateInput").val() != "")
        pageModel.dispatch.StartDate = $("#dispatchStartDateInput").val();
      if ($("#dispatchStartTimeInput").val() != "")
        pageModel.dispatch.StartTime = FormattedTimeToDecimal(
          $("#dispatchStartTimeInput").val()
        );
      if ($("#dispatchEndDateInput").val() != "")
        pageModel.dispatch.EndDate = $("#dispatchEndDateInput").val();
      if ($("#dispatchEndTimeInput").val() != "")
        pageModel.dispatch.EndTime = FormattedTimeToDecimal(
          $("#dispatchEndTimeInput").val()
        );
      smpMobileApi.UpdateDispatch(
        pageModel.dispatch,
        pageModel.taskInfo,
        function(res) {
          smpMobileApi.GetDispatch(
            pageModel.dispatch.TaskNo,
            res,
            function(newDispatch) {
              pageModel.dispatch = newDispatch;
              var dispatchStatus = FindRowByFieldNameValuePair(
                pageModel.taskStatuses,
                "StatusCode",
                newDispatch.StatusCode
              );
              ds.FillDispatchHeader(
                newDispatch,
                dispatchStatus,
                pageModel.taskStatuses
              );
              ds.LoadCounter();
              //Remove waiting Icon
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
              smpMobileApi.ShowModal(
                "Success",
                "Dispatch Header updated succesfully",
                "success",
                5000
              );
            },
            function(error) {
              //Remove waiting Icon
              ds.LoadCounter();
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
              smpMobileApi.ShowModal(
                "Issue",
                "Issue during loading <strong>Dispatch</strong><br />" +
                  error.Message,
                "danger",
                15000
              );
            }
          );
        },
        function(err) {
          ds.LoadCounter();
          smpMobileApi.ShowModal(
            "Issue",
            "Failed to update <strong>Dispatch</strong><br />" + err.Message,
            "danger",
            15000
          );
          smpMobileApi.GetDispatch(
            dispatch.TaskNo,
            dispatch.DispatchNo,
            function(newDispatch) {
              pageModel.dispatch = newDispatch;
              var dispatchStatus = FindRowByFieldNameValuePair(
                pageModel.taskStatuses,
                "StatusCode",
                newDispatch.StatusCode
              );
              ds.FillDispatchHeader(
                newDispatch,
                dispatchStatus,
                pageModel.taskStatuses
              );
              ds.LoadCounter();
              //Remove waiting Icon
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
            },
            function(error) {
              //Remove waiting Icon
              ds.LoadCounter();
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
              smpMobileApi.ShowModal(
                "Issue",
                "Issue during loading <strong>Dispatch</strong><br />" +
                  error.Message,
                "danger",
                15000
              );
            }
          );
        }
      );
    });

    //#region Add new Detail
    $("#addNewDetail").click(function() {
      $("#newDetailInfo .descriptionInputGroup").show();
      $("#newDetailInfo .quantityInputGroup").show();
      $("#newDetailInfo .unitPriceInputGroup").show();
      $("#newDetailInfo .extensionInputGroup").show();
      $("#newDetailInfo #inventoryItemInput").val("");
      $("#newDetailInfo #inventoryItemInput").trigger("change");
      $("#newDetailInfo #inventoryItemInput").typeahead("val", "");
      $("#newDetailInfo #descriptionInput").val("");
      $(".descriptionInputGroup .recordDescription").attr("disabled", true);
      $(".commentInputGroup .recordDescription").attr("disabled", true);
      $("#newDetailInfo #descriptionInput").attr("disabled", true);
      $("#newDetailInfo #quantityInput").val("");
      $("#newDetailInfo #quantityInput").attr("disabled", true);
      $("#newDetailInfo #unitPriceInput").val("");
      $("#newDetailInfo #unitPriceInput").attr("disabled", true);
      $("#newDetailInfo #extensionInput").val("");
      $("#newDetailInfo #extensionInput").attr("disabled", true);
      $("#newDetailInfo #commentInput").val("");
      $("#newDetailInfo #commentInput").attr("disabled", true);
      $("#addNewDetailModal").modal();
    });
    $("#newDetailInfo #quantityInput").change(function(e) {
      var newPrice = ds.CalculateDispatchDetailPrice({
        ItemCode: $("#newDetailInfo #inventoryItemInput").val(),
        QuantityOrdered: parseFloat($(this).val())
      });
      $("#newDetailInfo #unitPriceInput").val(
        newPrice.RoundTo(UnitPriceDecimals)
      );
      $("#newDetailInfo #unitPriceInput").trigger("change");
      //$('#newDetailInfo #extensionInput').val(parseFloat($(this).val()*$('#newDetailInfo #unitPriceInput').val()).RoundTo(2));
    });
    $("#newDetailInfo #unitPriceInput").change(function(e) {
      $("#newDetailInfo #extensionInput").val(
        parseFloat(
          $(this).val() * $("#newDetailInfo #quantityInput").val()
        ).RoundTo(2)
      );
    });

    $("#submitNewDetailButton").click(async function(e) {
      //Show waiting Icon
      $(".loading").toggleClass("d-none");
      $(".loading div").toggleClass("loadingIcon");
      var lastLineNbr = "000000";
      pageModel.dispatchDetail.forEach(element => {
        if (element.LineKey > lastLineNbr) lastLineNbr = element.LineKey;
      });
      var incrementedLastLineNbr = "000000" + (parseInt(lastLineNbr) + 1);
      if (!SMPMobileAPI.IsOnline) {
        var newNextLineKey = await dbEngine
          .GetNextLineNbr(
            pageModel.dispatch.TaskNo,
            pageModel.dispatch.DispatchNo,
            false
          )
          .catch(function(err) {});
        if (newNextLineKey) {
          incrementedLastLineNbr = newNextLineKey;
        }
      }
      var ciItem = FindRecordsByParams(pageModel.ciItems, true, [
        {
          Name: "ItemCode",
          Value: $("#newDetailInfo #inventoryItemInput").val()
        }
      ])[0];
      var taxClass = "NT";
      var discount = ciItem.AllowTradeDiscount;
      switch (ciItem.ItemType) {
        case "1":
          taxClass = ciItem.TaxClass ? ciItem.TaxClass : "TX";
          break;
        case "5":
        case "3":
          taxClass = ciItem.TaxClass ? ciItem.TaxClass : "NT";
          break;
        case "4":
          taxClass = "NT";
          break;
      }
      var newLine = {
        TaskNo: pageModel.dispatch.TaskNo,
        DispatchNo: pageModel.dispatch.DispatchNo,
        LineKey: incrementedLastLineNbr.substr(
          incrementedLastLineNbr.length - 6,
          6
        ),
        ItemCode: $("#newDetailInfo #inventoryItemInput").val(),
        ItemCodeDesc: $("#newDetailInfo #descriptionInput").val(),
        CommentText: $("#newDetailInfo #commentInput").val(),
        QuantityOrdered: parseFloat(
          parseFloat($("#newDetailInfo #quantityInput").val()).RoundTo(
            QuantityDecimals
          )
        ),
        UnitPrice: parseFloat(
          parseFloat($("#newDetailInfo #unitPriceInput").val()).RoundTo(
            UnitPriceDecimals
          )
        ),
        ExtensionAmt: parseFloat(
          parseFloat($("#newDetailInfo #extensionInput").val()).RoundTo(2)
        ),
        TaxClass: taxClass,
        Discount: discount,
        LineDiscountPercent: 0,
        ItemType: ciItem.ItemType,
        State: RowStates.INSERTED
      };
      var priceCalculated = false;

      smpMobileApi.InsertDispatchDetail(
        pageModel.dispatch.TaskNo,
        pageModel.dispatch.DispatchNo,
        newLine,
        priceCalculated,
        function(res) {
          if (res.indexOf("-") < 0) {
            smpMobileApi.GetDispatchDetail(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              res,
              function(savedLine) {
                smpMobileApi.GetDispatch(
                  pageModel.dispatch.TaskNo,
                  pageModel.dispatch.DispatchNo,
                  function(updatedDispatch) {
                    pageModel.dispatchDetail.push(savedLine);
                    ds.DrawDispatchDetail(
                      savedLine,
                      QuantityDecimals,
                      UnitPriceDecimals
                    );
                    ds.InitializeEditDeleteEvents();
                    pageModel.dispatch = updatedDispatch;
                    var dispatchStatus = FindRowByFieldNameValuePair(
                      pageModel.taskStatuses,
                      "StatusCode",
                      updatedDispatch.StatusCode
                    );
                    ds.FillDispatchHeader(
                      updatedDispatch,
                      dispatchStatus,
                      pageModel.taskStatuses
                    );
                    if(pageModel.smOptions.HideAmountFields)
                    {
                      $('.amountField').addClass('d-none');
                    }
                    //Remove waiting Icon
                    ds.LoadCounter();
                    $(".loading").toggleClass("d-none");
                    $(".loading div").toggleClass("loadingIcon");
                    smpMobileApi.ShowModal(
                      "Success",
                      "Dispatch Detail inserted succesfully",
                      "success",
                      5000
                    );
                  },
                  function(err) {
                    //Remove waiting Icon
                    ds.LoadCounter();
                    $(".loading").toggleClass("d-none");
                    $(".loading div").toggleClass("loadingIcon");
                    smpMobileApi.ShowModal(
                      "Issue",
                      "Failed to get updated <strong>Dispatch Header</strong><br />" +
                        err.Message,
                      "danger",
                      15000
                    );
                  }
                );
              },
              function(err) {
                //Remove waiting Icon
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to get newly inserted <strong>Dispatch Detail</strong><br />",
                  "danger",
                  15000
                );
              }
            );
          } else {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to insert new <strong>Dispatch Detail</strong><br />",
              "danger",
              15000
            );
          }
        },
        function(err) {
          //Remove waiting Icon
          $(".loading").toggleClass("d-none");
          $(".loading div").toggleClass("loadingIcon");
          smpMobileApi.ShowModal(
            "Issue",
            "Failed to insert new <strong>Dispatch Detail</strong><br />" +
              err.Message,
            "danger",
            15000
          );
        }
      );
    });
    //#endregion

    //#region Add new Detail Labor
    $("#addNewLabor").click(function() {
      $("#newDetailLaborInfo #laborSkillInput").val("");
      $("#newDetailLaborInfo #laborSkillInput").trigger("change");
      $("#newDetailInfo #laborSkillInput").typeahead("val", "");
      $("#newDetailLaborInfo #laborDescriptionInput").val("");
      $(".laborDescriptionInputGroup .recordDescription").attr("disabled", true);
      $("#newDetailLaborInfo #laborDescriptionInput").attr("disabled", true);
      $("#newDetailLaborInfo #hoursSpentInput").val("");
      $("#newDetailLaborInfo #hoursSpentInput").attr("disabled", true);
      $("#newDetailLaborInfo #billintRateInput").val("");
      $("#newDetailLaborInfo #billintRateInput").attr("disabled", true);
      $("#newDetailLaborInfo #laborExtensionInput").val("");
      $("#newDetailLaborInfo #laborExtensionInput").attr("disabled", true);
      $("#addNewDetailLaborModal").modal();
      $('.laborCommentGroup .recordDescription').attr('disabled',true);
      $('#newDetailLaborInfo #laborCommentInput').attr('disabled',true);
      $('#addNewDetailLaborModal').modal();
    });
    $("#newDetailLaborInfo #hoursSpentInput").change(function(e) {
      var validatedHoursSpent = ds.ValidateHoursSpent(
        parseFloat($(this).val())
      );
      $("#newDetailLaborInfo #hoursSpentInput").val(
        validatedHoursSpent.RoundTo(QuantityDecimals)
      );
      var overTimeStartDate = null;
      var overTimeStartTime = null;
      if (pageModel.smOptions.UseOvertimeCalculationForLab) {
        if (
          (pageModel.smOptions.ApplyDispDateTimeToLabor == "1" &&
            pageModel.dispatchLabor.length == 0) ||
          pageModel.smOptions.ApplyDispDateTimeToLabor == "2"
        ) {
          overTimeStartDate = pageModel.dispatch.StartDate;
          overTimeStartTime = pageModel.dispatch.StartTime;
        }
      }
      var calculatedBillingRate = ds.CalculateDispatchDetailLaborPrice({
        LaborSkillCode: $("#newDetailLaborInfo #laborSkillInput").val(),
        HoursSpent: validatedHoursSpent,
        OverTimeStartDate: overTimeStartDate,
        OverTimeStartTime: overTimeStartTime
      });
      $("#newDetailLaborInfo #billintRateInput").val(
        calculatedBillingRate.RoundTo(UnitPriceDecimals)
      );
      $("#newDetailLaborInfo #billintRateInput").trigger("change");
      //$('#newDetailLaborInfo #laborExtensionInput').val(parseFloat(validatedHoursSpent*$('#newDetailLaborInfo #billintRateInput').val()).RoundTo(2));
    });
    $("#newDetailLaborInfo #billintRateInput").change(function(e) {
      $("#newDetailLaborInfo #laborExtensionInput").val(
        parseFloat(
          $(this).val() * $("#newDetailLaborInfo #hoursSpentInput").val()
        ).RoundTo(2)
      );
    });

    $("#submitNewDetailLaborButton").click(async function(e) {
      $(".loading").toggleClass("d-none");
      $(".loading div").toggleClass("loadingIcon");
      var lastLineNbr = "000000";
      pageModel.dispatchLabor.forEach(element => {
        if (element.LineKey > lastLineNbr) lastLineNbr = element.LineKey;
      });
      var incrementedLastLineNbr = "000000" + (parseInt(lastLineNbr) + 1);
      if (!SMPMobileAPI.IsOnline) {
        var newNextLineKey = await dbEngine
          .GetNextLineNbr(
            pageModel.dispatch.TaskNo,
            pageModel.dispatch.DispatchNo,
            true
          )
          .catch(function(err) {});
        if (newNextLineKey) {
          incrementedLastLineNbr = newNextLineKey;
        }
      }
      var laborSkillCode = FindRecordsByParams(
        pageModel.laborSkillCodes,
        true,
        [
          {
            Name: "LaborSkillCode",
            Value: $("#newDetailLaborInfo #laborSkillInput").val()
          }
        ]
      )[0];
      var taxClassUsing = true;
      var taxClass = "NT";
      if (pageModel.smOptions.CalculateTaxesOnLabor != "L") {
        taxClassUsing = false;
      } else if (
        pageModel.taskInfo.ShipToCode != null ||
        pageModel.taskInfo.ShipToCode != ""
      ) {
        taxClassUsing = pageModel.taskInfo.SO068_SMPLaborTaxCalculate;
      } else {
        taxClassUsing = pageModel.taskInfo.AR068_SMPLaborTaxCalculate;
      }
      if (
        pageModel.smOptions.CalculateTaxesOnLabor == "L" &&
        taxClassUsing &&
        (laborSkillCode.TaxClass != "" || laborSkillCode.TaxClass != "")
      ) {
        taxClass = laborSkillCode.TaxClass;
      }

      var newLaborLine = {
        TaskNo: pageModel.dispatch.TaskNo,
        DispatchNo: pageModel.dispatch.DispatchNo,
        LineKey: incrementedLastLineNbr.substr(
          incrementedLastLineNbr.length - 6,
          6
        ),
        LaborSkillCode: $("#newDetailLaborInfo #laborSkillInput").val(),
        LineDesc: $("#newDetailLaborInfo #laborDescriptionInput").val(),
        HoursSpent: parseFloat(
          parseFloat($("#newDetailLaborInfo #hoursSpentInput").val()).RoundTo(
            QuantityDecimals
          )
        ),
        BillingRate: parseFloat(
          parseFloat($("#newDetailLaborInfo #billintRateInput").val()).RoundTo(
            UnitPriceDecimals
          )
        ),
        ExtensionAmt: parseFloat(
          parseFloat(
            $("#newDetailLaborInfo #laborExtensionInput").val()
          ).RoundTo(2)
        ),
        LaborCommentText:  $('#newDetailLaborInfo #laborCommentInput').val(),
        TaxClass: taxClass
      };
      var priceCalculated = false;

      smpMobileApi.InsertDispatchDetailLabor(
        pageModel.dispatch.TaskNo,
        pageModel.dispatch.DispatchNo,
        newLaborLine,
        function(res) {
          smpMobileApi.GetDispatchDetailLabor(
            pageModel.dispatch.TaskNo,
            pageModel.dispatch.DispatchNo,
            res,
            function(savedLine) {
              smpMobileApi.GetDispatch(
                pageModel.dispatch.TaskNo,
                pageModel.dispatch.DispatchNo,
                function(updatedDispatch) {
                  pageModel.dispatchLabor.push(savedLine);
                  ds.DrawDispatchDetailLabor(
                    savedLine,
                    QuantityDecimals,
                    UnitPriceDecimals
                  );
                  ds.InitializeEditDeleteEvents();
                  pageModel.dispatch = updatedDispatch;
                  var dispatchStatus = FindRowByFieldNameValuePair(
                    pageModel.taskStatuses,
                    "StatusCode",
                    updatedDispatch.StatusCode
                  );
                  ds.FillDispatchHeader(
                    updatedDispatch,
                    dispatchStatus,
                    pageModel.taskStatuses
                  );
                  if(pageModel.smOptions.HideAmountFields)
                  {
                    $('.amountField').addClass('d-none');
                  }
                  ds.LoadCounter();
                  $(".loading").toggleClass("d-none");
                  $(".loading div").toggleClass("loadingIcon");
                  smpMobileApi.ShowModal(
                    "Success",
                    "Dispatch Detail Labor inserted succesfully",
                    "success",
                    5000
                  );
                },
                function(err) {
                  $(".loading").toggleClass("d-none");
                  $(".loading div").toggleClass("loadingIcon");
                  ds.LoadCounter();
                  smpMobileApi.ShowModal(
                    "Issue",
                    "Failed to get updated <strong>Dispatch Header</strong><br />" +
                      err.Message,
                    "danger",
                    15000
                  );
                }
              );
            },
            function(err) {
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
              smpMobileApi.ShowModal(
                "Issue",
                "Failed to get newly inserted <strong>Dispatch Detail Labor</strong><br />" +
                  err.Message,
                "danger",
                15000
              );
            }
          );
        },
        function(err) {
          $(".loading").toggleClass("d-none");
          $(".loading div").toggleClass("loadingIcon");
          smpMobileApi.ShowModal(
            "Issue",
            "Failed to insert new <strong>Dispatch Detail Labor</strong><br />" +
              err.Message,
            "danger",
            15000
          );
        }
      );
    });
    //#endregion

    //#region Add Attachment
    $("#uploadFile").click(function(e) {
      $("#uploadFileInput").click();
    });
    $("#uploadFileInput").change(function(e) {
      $(".loading").toggleClass("d-none");
      $(".loading div").toggleClass("loadingIcon");
      var selectedFile = $(this).get(0).files[0];
      if (selectedFile) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
          smpMobileApi.InsertTaskAttachment(
            pageModel.dispatch.TaskNo,
            selectedFile.name,
            fileReader.result,
            function(res) {
              smpMobileApi.GetTaskAttachments(
                pageModel.dispatch.TaskNo,
                function(attachments) {
                  pageModel.taskAttachments = attachments;
                  $("#dispatchDetailAttachmentsTableBody tr").remove();
                  ds.FillDispatchAttachments(pageModel.taskAttachments);
                  ds.LoadCounter();
                  $(".loading").toggleClass("d-none");
                  $(".loading div").toggleClass("loadingIcon");
                  smpMobileApi.ShowModal(
                    "Success",
                    "Task Attachment inserted succesfully",
                    "success",
                    5000
                  );
                },
                function(error) {
                  ds.LoadCounter();
                  $(".loading").toggleClass("d-none");
                  $(".loading div").toggleClass("loadingIcon");
                  smpMobileApi.ShowModal(
                    "Issue",
                    "Issue during loading <strong>Task Attachments</strong>." +
                      error.Message,
                    "danger",
                    15000
                  );
                }
              );
            },
            function(error) {
              $(".loading").toggleClass("d-none");
              $(".loading div").toggleClass("loadingIcon");
              smpMobileApi.ShowModal(
                "Issue",
                "Issue during insert of Task Attachment." + error.Message,
                "danger",
                15000
              );
            }
          );
        };
        fileReader.readAsDataURL(selectedFile);
      }
    });
    //#endregion

    //#region Record And Upload Audio
    if (!smpMobileApi.IsMobileVersion) {
      $("#uploadAudio").hide();
    } else {
      //TODO Add audio capture part for mobile
    }
    //#endregion
    this.InitializeEditDeleteEvents();
    //#region Initialize Item/LaborSkill Code Lookups
    var ItemSubstringMatcher = function(strs) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
        matches = [];
        substringRegex = new RegExp(q, "i");
        $.each(strs, function(i, str) {
          if (
            substringRegex.test(str.ItemCode) ||
            substringRegex.test(str.ItemCodeDesc)
          ) {
            matches.push(str);
          }
        });
        cb(matches);
      };
    };
    $("#newDetailInfo #inventoryItemInput")
      .typeahead(
        {
          hint: false,
          highlight: true,
          minLength: 1,
          autoselect: true
        },
        {
          name: "item-code",
          displayKey: "ItemCode",
          source: ItemSubstringMatcher(pageModel.ciItems),
          limit: 100,
          templates: {
            empty: [
              "<div class='empty-message'>",
              "no matches found",
              "</div>"
            ].join("\n"),
            suggestion: Handlebars.compile(pageModel.smOptions.HideAmountFields ? 
              "<p>{{ItemCode}}<br>{{ItemCodeDesc}}</p>" :
              "<p>{{ItemCode}}<br>{{ItemCodeDesc}}<br>{{StandardUnitPrice}}</p>")
          }
        }
      )
      .bind("typeahead:select", function(e, selectedItem) {
        switch (selectedItem.ItemType) {
          case "1":
          case "5":
            $("#newDetailInfo .descriptionInputGroup").show();
            $("#newDetailInfo .quantityInputGroup").show();
            $("#newDetailInfo .unitPriceInputGroup").show();
            $("#newDetailInfo .extensionInputGroup").show();
            $("#newDetailInfo .extensionInput").attr("disabled", true);
            break;
          case "3":
            $("#newDetailInfo .descriptionInputGroup").show();
            $("#newDetailInfo .quantityInputGroup").hide();
            $("#newDetailInfo .unitPriceInputGroup").hide();
            $("#newDetailInfo .extensionInputGroup").show();
            $("#newDetailInfo #extensionInput").attr("disabled", false);
            break;
          case "4":
            $("#newDetailInfo .descriptionInputGroup").hide();
            $("#newDetailInfo .quantityInputGroup").hide();
            $("#newDetailInfo .unitPriceInputGroup").hide();
            $("#newDetailInfo .extensionInputGroup").hide();
            $("#newDetailInfo #extensionInput").attr("disabled", true);
            break;
        }
        $("#newDetailInfo #descriptionInput").val(selectedItem.ItemCodeDesc);
        $("#newDetailInfo #descriptionInput").attr("disabled", false);
        $("#newDetailInfo .recordDescription").attr("disabled", false);
        $("#newDetailInfo #quantityInput").val(1.0);
        $("#newDetailInfo #quantityInput").trigger("change");
        $("#newDetailInfo #quantityInput").attr("disabled", false);
        //$('#newDetailInfo #unitPriceInput').val(selectedItem.StandardUnitPrice.RoundTo(UnitPriceDecimals));
        //$('#newDetailInfo #unitPriceInput').trigger("change");
        $("#newDetailInfo #unitPriceInput").attr("disabled", false);
        $("#newDetailInfo #commentInput").val("");
        $("#newDetailInfo #commentInput").attr("disabled", false);
        $(".commentInputGroup .recordDescription").attr("disabled", false);
      });
    var LaborSubstringMatcher = function(strs) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
        matches = [];
        substringRegex = new RegExp(q, "i");
        $.each(strs, function(i, str) {
          if (
            substringRegex.test(str.LaborSkillCode) ||
            substringRegex.test(str.Description)
          ) {
            matches.push(str);
          }
        });
        cb(matches);
      };
    };
    $("#newDetailLaborInfo #laborSkillInput")
      .typeahead(
        {
          hint: false,
          highlight: true,
          minLength: 1,
          autoselect: true
        },
        {
          name: "labor-skill-code",
          displayKey: "LaborSkillCode",
          source: LaborSubstringMatcher(pageModel.laborSkillCodes),
          limit: 100,
          templates: {
            empty: [
              "<div class='empty-message'>",
              "no matches found",
              "</div>"
            ].join("\n"),
            suggestion: Handlebars.compile(pageModel.smOptions.HideAmountFields ?
              "<p>{{LaborSkillCode}}<br>{{Description}}</p>" :
              "<p>{{LaborSkillCode}}<br>{{Description}}<br>{{BillingRate}}</p>"
            )
          }
        }
      )
      .bind("typeahead:select", function(e, selectedItem) {
        $("#newDetailLaborInfo #laborDescriptionInput").val(
          selectedItem.Description
        );
        $("#newDetailLaborInfo #laborDescriptionInput").attr("disabled", false);
        $("#newDetailLaborInfo .recordDescription").attr("disabled", false);
        $("#newDetailLaborInfo #hoursSpentInput").val(1.0);
        $("#newDetailLaborInfo #hoursSpentInput").trigger("change");
        $("#newDetailLaborInfo #hoursSpentInput").attr("disabled", false);
        //$('#newDetailLaborInfo #billintRateInput').val(selectedItem.BillingRate.RoundTo(UnitPriceDecimals));
        //$('#newDetailLaborInfo #billintRateInput').trigger("change");
        $("#newDetailLaborInfo #billintRateInput").attr("disabled", false);
        $('#newDetailLaborInfo #laborCommentInput').val("");
        $('#newDetailLaborInfo #laborCommentInput').attr('disabled',false);
        $('.laborCommentGroup .recordDescription').attr('disabled',false);
      });
    //#endregion

    //#region Initialize Speech Recognition for Description Fields
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.speechRecognition;
    if (SpeechRecognition) {
      $(".recognitionIcon").show();
      $(".recordDescription").click(function(e) {
        if (!$(this).attr("disabled")) {
          e.preventDefault();
          var target = $("#" + $(this).attr("data-target"));
          window.speechRecognition.isRecognitionAvailable().then(function(available) {
              if (available) {
                return window.speechRecognition.hasPermission();
              }
            }).then(function(hasPermission) {
              function startRecognition() {
                if (cordova.platformId === "ios") {
                  $(".speechListening").toggleClass("d-none");
                  $(".speechListening div").toggleClass("speechListeningIcon");
                }
                return window.speechRecognition.startRecognition({
                    language: "en-US",
                    showPopup: true,
                    showPartial: false
                  })
                  .then(function(data) {
                    if (cordova.platformId === "ios") {
                      $(".speechListening").toggleClass("d-none");
                      $(".speechListening div").toggleClass("speechListeningIcon");
                    }
                    if(data)
                    {
                      target.val(data[0]);
                      target.focus();
                      target.trigger('input');
                    }
                      
                  })
                  .catch(function(err) {
                    if (cordova.platformId === "ios") {
                      $(".speechListening").toggleClass("d-none");
                      $(".speechListening div").toggleClass("speechListeningIcon");
                    }
                    console.error(err);
                  });
              }

              if (!hasPermission) {
                window.speechRecognition
                  .requestPermission()
                  .then(function() {
                    // window.speechRecognition
                    //   .then(function() {
                        startRecognition();
                        if (cordova.platformId === "ios") {
                          window.setTimeout(function() {
                            window.speechRecognition.stopListening();
                          }, 5000);
                        }
                      // })
                      // .catch(function(err) {
                      //   console.error("Cannot get permission", err);
                      // });
                  })
                  .catch(function(err) {
                    console.error("Cannot stop prev. recognition", err);
                  });
              } else {
                // window.speechRecognition
                //   .then(function() {
                    startRecognition();
                    if (cordova.platformId === "ios") {
                      window.setTimeout(function() {
                        window.speechRecognition.stopListening();
                      }, 5000);
                    }
                  // })
                  // .catch(function(err) {
                  //   console.error("Cannot stop prev. recognition", err);
                  // });
              }
            })
            .catch(function(err) {
              console.error(err);
            });
        }
      });
    } else {
      $(".recognitionIcon").hide();
    }
    //#endregion

    //#region Initialize Last/Next Deliveries
    let lastDeliveriesDiv = $('#lastDeliveries');
    let nextDeliveriesDiv = $('#nextDeliveries');
    let lastDeliveriesGroupedByTaskNo = groupBy(pageModel.lastDeliveries,"TaskNo")
    let nextDeliveriesGroupedByTaskNo = groupBy(pageModel.nextDeliveries,"TaskNo")
    let count=5;
    for(let taskNo in lastDeliveriesGroupedByTaskNo)
    {
      if(pageModel.dispatch.TaskNo==taskNo)
        continue;
      if(count==0)
        break;
      let taskGroup = lastDeliveriesGroupedByTaskNo[taskNo];
      let deliveryTaskDiv = $('<div>');
      deliveryTaskDiv.attr('id', `lastDelivery_${taskNo}`);
      deliveryTaskDiv.attr('data-target', `lastDelivery_${taskNo}Details`);
      deliveryTaskDiv.addClass('deliveryBox');
      deliveryTaskDiv.append(`<h5>Task: ${taskNo}</h5>`);
      let deliveryTaskDetailDiv = $('<div>');
      deliveryTaskDetailDiv.attr('id',`lastDelivery_${taskNo}Details`);
      deliveryTaskDetailDiv.addClass('deliveryDetailBox d-none');
      deliveryTaskDetailDiv.append('<p><span class="itemCodeSpan"><strong>ItemCode</strong></span><span class="qtySpan"><strong>Qty</strong></span><span class="priceSpan amountField"><strong>Price</strong></span><span class="extensionSpan amountField"><strong>Extension</strong></span></p><br>')
      taskGroup.forEach(deliveryDetail=>{
        let itemCode = PopulateLineFeeds(deliveryDetail.ItemCode);
        deliveryTaskDetailDiv.append(`<p><span class="itemCodeSpan">${itemCode}</span><span class="qtySpan">${deliveryDetail.QuantityOrdered.RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInQty)}</span><span class="priceSpan amountField">${deliveryDetail.UnitPrice.RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInPrice)}</span><span class="extensionSpan amountField">${deliveryDetail.ExtensionAmt.RoundTo(2)}</span><br>`);
      });
      deliveryTaskDiv.append(deliveryTaskDetailDiv);
      lastDeliveriesDiv.append(deliveryTaskDiv);
      count--;
    }
    count=5;
    for(let taskNo in nextDeliveriesGroupedByTaskNo)
    {
      if(pageModel.dispatch.TaskNo==taskNo)
        continue;
      if(count==0)
        break;
      let taskGroup = nextDeliveriesGroupedByTaskNo[taskNo];
      let deliveryTaskDiv = $('<div>');
      deliveryTaskDiv.attr('id', `nextDelivery_${taskNo}`);
      deliveryTaskDiv.attr('data-target', `nextDelivery_${taskNo}Details`);
      deliveryTaskDiv.addClass('deliveryBox');
      deliveryTaskDiv.append(`<h5>Task: ${taskNo}</h5>`);
      let deliveryTaskDetailDiv = $('<div>');
      deliveryTaskDetailDiv.attr('id',`nextDelivery_${taskNo}Details`);
      deliveryTaskDetailDiv.addClass('deliveryDetailBox d-none');
      deliveryTaskDetailDiv.append('<p><span class="itemCodeSpan"><strong>ItemCode</strong></span><span class="qtySpan"><strong>Qty</strong></span><span class="priceSpan amountField"><strong>Price</strong></span><span class="extensionSpan amountField"><strong>Extension</strong></span></p><br>')
      taskGroup.forEach(deliveryDetail=>{
        let itemCode = PopulateLineFeeds(deliveryDetail.ItemCode);
        deliveryTaskDetailDiv.append(`<p><span class="itemCodeSpan">${itemCode}</span><span class="qtySpan">${deliveryDetail.QuantityOrdered.RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInQty)}</span><span class="priceSpan amountField">${deliveryDetail.UnitPrice.RoundTo(pageModel.ciOptions.NumberOfDecimalPlacesInPrice)}</span><span class="extensionSpan amountField">${deliveryDetail.ExtensionAmt.RoundTo(2)}</span><br>`);
      });
      deliveryTaskDiv.append(deliveryTaskDetailDiv);
      nextDeliveriesDiv.append(deliveryTaskDiv);
      count--;
    }

    $('.deliveryBox').click(function(){
      $('.deliveryDetailBox:not('+'#'+$(this).attr('data-target')+')').addClass('d-none');
      $('#'+$(this).attr('data-target')).toggleClass('d-none');
    });
    $('#deliveryInformation').toggleClass('d-none');
    $('#deliveryInformation').click(function(){
      $('#lastNextDeliveryModal').modal();
    });
    // <div id="delivery_taskNo" data-target="delivery_taskNoDetails" style="">
    //     <p>Task: 0000981</p>
    //     <div class="" id="delivery_taskNoDetails" style="padding: 10px;text-align: left; word-spacing: 10px;">
    //         <p>Item001 1.00 150.00 150.00</p>
		//       	<p>Item002 2.00 150.00 300.00</p>
		// 	      <p>Item003 10.00 150.00 1500.00</p>
    //     </div>
    // </div>
    //#endregion
    //Table carret change on enter
    $(".table td div").keypress(function(e) {
      if (e.which == 13) {
        var endPlacer = createCaretPlacer(false);
        if (
          $(this)
            .parent()
            .next().length > 0
        ) {
          endPlacer(
            $(this)
              .parent()
              .next()
              .get(0).children[0]
          );
        } else {
          var nextTrId = $(this)
            .parent()
            .parent()
            .next()
            .attr("id");
          if ($("#" + nextTrId).length == 0) {
            endPlacer(
              $(
                "#" +
                  $(this)
                    .parent()
                    .parent()
                    .parent()
                    .attr("id") +
                  " tr:first-child td:first-child div"
              ).get(0)
            );
          } else {
            endPlacer($("#" + nextTrId + " td:first-child  div").get(0));
          }
        }
        e.preventDefault();
      }
    });

    $("#printPreview").click(function(e) {
      if (!smpMobileApi.IsMobileVersion) {
        ds.FillPrintingModal(UnitPriceDecimals, QuantityDecimals);
        if(pageModel.smOptions.HideAmountFields)
        {
          $('.amountField').addClass('d-none');
        }
        $("#printModal").modal();
        e.preventDefault();
      } else {
      }
    });
    $("#printDispatchButton").click(function(e) {
      $(".loading").toggleClass("d-none");
      $(".loading div").toggleClass("loadingIcon");
      if (SMPMobileAPI.IsMobileVersion) {
        var printerPort = GetCacheValue(CacheIds.printerAddress);
        var printerMode = GetCacheValue(CacheIds.printerMode);
        var paperSize = GetCacheValue(CacheIds.paperSize);
        paperSize = paperSize ? parseInt(paperSize) : 384;
        printerMode = printerMode ? printerMode : "EscPosMobile";
        if (SMPMobileAPI.IsOnline) {
          smpMobileApi.GenerateInvoice(
            pageModel.dispatch.TaskNo,
            pageModel.dispatch.DispatchNo,
            function(fileName) {},
            function(err) {
              smpMobileApi.ShowModal(
                "Issue",
                "Issue during generation of the invoice report.<br />" + err.Message,
                "danger",
                15000
              );
            }
          );
        }
        if (printerPort) {
          var commands = [];
          commands.push({ appendAlignment: "Center" });
          commands.push({
            appendRaw:
              "\x1D\x21\x01 " +
              pageModel.companyInfo.CompanyName +
              "\x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 1 });
          if (pageModel.companyInfo.Address1)
            commands.push({ append: pageModel.companyInfo.Address1 + "\n" });
          if (pageModel.companyInfo.Address2)
            commands.push({ append: pageModel.companyInfo.Address2 + "\n" });
          if (pageModel.companyInfo.Address3)
            commands.push({ append: pageModel.companyInfo.Address3 + "\n" });
          if (pageModel.companyInfo.Address4)
            commands.push({ append: pageModel.companyInfo.Address4 + "\n" });
          if (pageModel.companyInfo.EmailAddress)
            commands.push({
              append: pageModel.companyInfo.EmailAddress + "\n"
            });
          if (pageModel.companyInfo.Phone)
            commands.push({ append: pageModel.companyInfo.Phone + "\n" });
          commands.push({ appendLineFeed: 3 });
          commands.push({ appendAlignment: "Left" });
          commands.push({
            appendRaw:
              "\x1D\x21\x01 Task No: " +
              pageModel.dispatch.TaskNo +
              "\x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 1 });
          commands.push({
            appendRaw:
              "\x1D\x21\x01 Dispatch No: " +
              pageModel.dispatch.DispatchNo +
              "\x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 3 });
          commands.push({
            appendRaw:
              "\x1D\x21\x01 Account: " +
              (pageModel.dispatch.Customer
                ? pageModel.dispatch.Customer
                : pageModel.dispatch.ARDivisionNo +
                  "-" +
                  pageModel.dispatch.CustomerNo) +
              "\x1D\x21\x00"
          });
          commands.push({ appendLineFeed: 1 });
          ds.AppendAddressInfo(commands, paperSize);
          ds.AppendDispatchLines(commands, paperSize);
          if(!pageModel.smOptions.HideAmountFields)
          {
            ds.AppendDispatchTotals(commands);
          }
          ds.AppendSignature(commands, paperSize, function() {
            starprnt.disconnect(
              function(msg) {
                console.log(msg);
              },
              function(msg) {
                console.log(msg);
              }
            );
            starprnt.print(
              printerPort,
              printerMode,
              commands,
              function(result) {
                ds.DeleteTempFile(
                  pageModel.dispatch.TaskNo +
                    "_" +
                    pageModel.dispatch.DispatchNo +
                    "_signature.jpg",
                  function(msg) {
                    console.log(msg);
                  },
                  function(msg) {
                    console.log(msg);
                  }
                );
                starprnt.disconnect(
                  function(msg) {
                    console.log(msg);
                  },
                  function(msg) {
                    console.log(msg);
                  }
                );
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
              },
              function(error) {
                ds.DeleteTempFile(
                  pageModel.dispatch.TaskNo +
                    "_" +
                    pageModel.dispatch.DispatchNo +
                    "_signature.jpg",
                  function(msg) {
                    console.log(msg);
                  },
                  function(msg) {
                    console.log(msg);
                  }
                );
                starprnt.disconnect(
                  function(msg) {
                    console.log(msg);
                  },
                  function(msg) {
                    console.log(msg);
                  }
                );
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to print Invoice<br />" + error,
                  "danger",
                  10000
                );
              }
            );
          });
        }
        else{
          smpMobileApi.ShowModal(
            "Issue",
            "Bluetooth Printer is not set",
            "danger",
            10000
          );
          $(".loading").toggleClass("d-none");
          $(".loading div").toggleClass("loadingIcon");
        }
      } else {
        smpMobileApi.GenerateInvoice(
          pageModel.dispatch.TaskNo,
          pageModel.dispatch.DispatchNo,
          function(fileName) {
            smpMobileApi.GetTaskAttachment(
              pageModel.dispatch.TaskNo,
              fileName,
              function(res) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                window.open(
                  GetCacheValue(CacheIds.serverEndpoint) +
                    "/api/dispatch/task/attachments/get/" +
                    pageModel.dispatch.TaskNo +
                    "/" +
                    fileName +
                    "?tokenID=" +
                    encodeURIComponent(res.Hash),
                  "_blank"
                );
              },
              function(err) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to open Attachment<br />" + err.Message,
                  "danger",
                  10000
                );
              }
            );
          },
          function(err) {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Issue during generation of the invoice report.<br />" + err.Message,
              "danger",
              15000
            );
          }
        );
      }
    });
  }
  InitializeEditDeleteEvents() {
    var UnitPriceDecimals =
      pageModel.ciOptions && pageModel.ciOptions.NumberOfDecimalPlacesInPrice
        ? pageModel.ciOptions.NumberOfDecimalPlacesInPrice
        : 2;
    var QuantityDecimals =
      pageModel.ciOptions && pageModel.ciOptions.NumberOfDecimalPlacesInQty
        ? pageModel.ciOptions.NumberOfDecimalPlacesInQty
        : 2;
    //#region Edit Detail
    $(".editDetail")
      .unbind()
      .click(function(e) {
        var targetLineKey = $(this).attr("data-target");
        if (targetLineKey) {
          var dispatchLine = FindRowByFieldNameValuePair(
            pageModel.dispatchDetail,
            "LineKey",
            targetLineKey
          );
          if (dispatchLine) {
            $("#submitEditDetailButton").attr(
              "data-target",
              dispatchLine.ItemCode + "_" + dispatchLine.LineKey
            );
            switch (dispatchLine.ItemType) {
              case "1":
              case "5":
                $("#editDetailInfo .descriptionEditGroup").show();
                $("#editDetailInfo .quantityEditGroup").show();
                $("#editDetailInfo .unitPriceEditGroup").show();
                $("#editDetailInfo .extensionEditGroup").show();
                $("#editDetailInfo .extensionEditInput").attr("disabled", true);
                break;
              case "3":
                $("#editDetailInfo .descriptionEditGroup").show();
                $("#editDetailInfo .quantityEditGroup").hide();
                $("#editDetailInfo .unitPriceEditGroup").hide();
                $("#editDetailInfo .extensionEditGroup").show();
                $("#editDetailInfo #extensionEditInput").attr(
                  "disabled",
                  false
                );
                break;
              case "4":
                $("#editDetailInfo .descriptionEditGroup").hide();
                $("#editDetailInfo .quantityEditGroup").hide();
                $("#editDetailInfo .unitPriceEditGroup").hide();
                $("#editDetailInfo .extensionEditGroup").hide();
                $("#editDetailInfo #extensionEditInput").attr("disabled", true);
                break;
            }
            $("#editDetailInfo #inventoryItemEditInput").val(
              dispatchLine.ItemCode
            );
            $("#editDetailInfo #descriptionEditInput").val(
              dispatchLine.ExtendedDesc
                ? dispatchLine.ExtendedDesc
                : dispatchLine.ItemCodeDesc
            );
            $(".descriptionEditGroup #descriptionEditInput").attr(
              "disabled",
              false
            );
            $("#editDetailInfo .recordDescription").attr("disabled", false);
            $("#editDetailInfo #quantityEditInput").val(
              dispatchLine.QuantityOrdered.RoundTo(QuantityDecimals)
            );
            //$('#editDetailInfo #quantityEditInput').trigger("change");
            $("#editDetailInfo #quantityEditInput").attr("disabled", false);
            $("#editDetailInfo #unitPriceEditInput").val(
              dispatchLine.UnitPrice.RoundTo(UnitPriceDecimals)
            );
            $("#editDetailInfo #unitPriceEditInput").trigger("change");
            $("#editDetailInfo #unitPriceEditInput").attr("disabled", false);
            $("#editDetailInfo #commentEditInput").val(
              dispatchLine.CommentText
            );
            $("#editDetailInfo #commentEditInput").attr("disabled", false);
            $(".commentEditGroup .recordDescription").attr("disabled", false);
            $("#editDetailModal").modal();
          }
        }
      });
    $("#editDetailInfo #quantityEditInput")
      .unbind()
      .change(function(e) {
        var newPrice = ds.CalculateDispatchDetailPrice({
          ItemCode: $("#editDetailInfo #inventoryItemEditInput").val(),
          QuantityOrdered: parseFloat($(this).val())
        });
        $("#editDetailInfo #unitPriceEditInput").val(
          newPrice.RoundTo(UnitPriceDecimals)
        );
        $("#editDetailInfo #unitPriceEditInput").trigger("change");
      });
    $("#editDetailInfo #unitPriceEditInput")
      .unbind()
      .change(function(e) {
        var targetLineKey = $("#submitEditDetailButton")
          .attr("data-target")
          .split("_")[1];
        var newExtension =
          $(this).val() * $("#editDetailInfo #quantityEditInput").val();
        var dispatchLine = FindRowByFieldNameValuePair(
          pageModel.dispatchDetail,
          "LineKey",
          targetLineKey
        );
        if (
          pageModel.soOptions.AllowDiscountRate &&
          dispatchLine.LineDiscountPercent
        ) {
          newExtension =
            newExtension * ((100 - dispatchLine.LineDiscountPercent) / 100);
        }
        $("#editDetailInfo #extensionEditInput").val(
          parseFloat(newExtension).RoundTo(2)
        );
      });
    $("#submitEditDetailButton")
      .unbind()
      .click(function(e) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        var targetLineKey = $(this)
          .attr("data-target")
          .split("_")[1];
        if (targetLineKey) {
          var modifyingLine = FindRowByFieldNameValuePair(
            pageModel.dispatchDetail.slice(),
            "LineKey",
            targetLineKey
          );
          var modifyingLineIndex = FindIndexByFieldNameValuePair(
            pageModel.dispatchDetail.slice(),
            "LineKey",
            targetLineKey
          );
          if (modifyingLine && modifyingLineIndex != null) {
            modifyingLine.ItemCodeDesc = $(
              "#editDetailInfo #descriptionEditInput"
            ).val();
            modifyingLine.QuantityOrdered = parseFloat(
              parseFloat($("#editDetailInfo #quantityEditInput").val()).RoundTo(
                QuantityDecimals
              )
            );
            modifyingLine.UnitPrice = parseFloat(
              parseFloat(
                $("#editDetailInfo #unitPriceEditInput").val()
              ).RoundTo(UnitPriceDecimals)
            );
            modifyingLine.ExtensionAmt = parseFloat(
              parseFloat(
                $("#editDetailInfo #extensionEditInput").val()
              ).RoundTo(2)
            );
            modifyingLine.CommentText = $(
              "#editDetailInfo #commentEditInput"
            ).val();

            smpMobileApi.UpdateDispatchDetail(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              modifyingLine,
              false,
              function(res) {
                smpMobileApi.GetDispatchDetail(
                  pageModel.dispatch.TaskNo,
                  pageModel.dispatch.DispatchNo,
                  modifyingLine.LineKey,
                  function(updatedLine) {
                    smpMobileApi.GetDispatch(
                      pageModel.dispatch.TaskNo,
                      pageModel.dispatch.DispatchNo,
                      function(updatedDispatch) {
                        pageModel.dispatchDetail.splice(
                          modifyingLineIndex,
                          1,
                          updatedLine
                        );
                        ds.UpdateDispatchDetailView(
                          updatedLine,
                          QuantityDecimals,
                          UnitPriceDecimals
                        );
                        pageModel.dispatch = updatedDispatch;
                        var dispatchStatus = FindRowByFieldNameValuePair(
                          pageModel.taskStatuses,
                          "StatusCode",
                          updatedDispatch.StatusCode
                        );
                        ds.FillDispatchHeader(
                          updatedDispatch,
                          dispatchStatus,
                          pageModel.taskStatuses
                        );
                        ds.LoadCounter();
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        smpMobileApi.ShowModal(
                          "Success",
                          "Dispatch Detail updated succesfully",
                          "success",
                          5000
                        );
                      },
                      function(err) {
                        ds.LoadCounter();
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        smpMobileApi.ShowModal(
                          "Issue",
                          "Failed to get updated <strong>Dispatch Header</strong><br />" +
                            err.Message,
                          "danger",
                          15000
                        );
                      }
                    );
                  },
                  function(err) {
                    $(".loading").toggleClass("d-none");
                    $(".loading div").toggleClass("loadingIcon");
                    smpMobileApi.ShowModal(
                      "Issue",
                      "Failed to get updated <strong>Dispatch Detail</strong><br />" +
                        err.Message,
                      "danger",
                      15000
                    );
                  }
                );
              },
              function(err) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to update <strong>Dispatch Detail</strong><br />" +
                    err.Message,
                  "danger",
                  15000
                );
              }
            );
          }
        }
      });
    //#endregion

    //#region Edit Detail Labor
    $(".editDetailLabor")
      .unbind()
      .click(function(e) {
        var targetLineKey = $(this).attr("data-target");
        if (targetLineKey) {
          var laborLine = FindRowByFieldNameValuePair(
            pageModel.dispatchLabor,
            "LineKey",
            targetLineKey
          );
          if (laborLine) {
            $("#submitEditDetailLaborButton").attr(
              "data-target",
              laborLine.LaborSkillCode + "_" + laborLine.LineKey
            );
            $("#editDetailLaborInfo #laborSkillEditInput").val(
              laborLine.LaborSkillCode
            );
            $("#editDetailLaborInfo #laborDescriptionEditInput").val(
              laborLine.LineDescExtended
                ? laborLine.LineDescExtended
                : laborLine.LineDesc
            );
            $("#editDetailLaborInfo #laborDescriptionEditInput").attr(
              "disabled",
              false
            );
            $("#editDetailLaborInfo .recordDescription").attr(
              "disabled",
              false
            );
            $("#editDetailLaborInfo #hoursSpentEditInput").val(
              laborLine.HoursSpent.RoundTo(QuantityDecimals)
            );
            $("#editDetailLaborInfo #hoursSpentEditInput").trigger("change");
            $("#editDetailLaborInfo #hoursSpentEditInput").attr(
              "disabled",
              false
            );
            $("#editDetailLaborInfo #billingRateEditInput").val(
              laborLine.BillingRate.RoundTo(UnitPriceDecimals)
            );
            $("#editDetailLaborInfo #billingRateEditInput").trigger("change");
            $("#editDetailLaborInfo #billingRateEditInput").attr(
              "disabled",
              false
            );
            $('#editDetailLaborInfo #laborCommentEditInput').val(laborLine.LaborCommentText);
            $('#editDetailLaborInfo #laborCommentEditInput').attr('disabled',false);
            $('.laborCommentEditGroup .recordDescription').attr('disabled',false);
            $("#editDetailLaborModal").modal();
          }
        }
      });
    $("#editDetailLaborInfo #hoursSpentEditInput")
      .unbind()
      .change(function(e) {
        var validatedHoursSpent = ds.ValidateHoursSpent(
          parseFloat($(this).val())
        );
        $("#editDetailLaborInfo #hoursSpentEditInput").val(
          validatedHoursSpent.RoundTo(QuantityDecimals)
        );
        var laborLineNbr = $("#submitEditDetailLaborButton")
          .attr("data-target")
          .split("_")[1];
        var laborLine = FindRecordsByParams(pageModel.dispatchLabor, true, [
          { Name: "LineKey", Value: laborLineNbr }
        ])[0];
        var overTimeStartDate = laborLine.OverTimeStartDate;
        var overTimeStartTime = laborLine.OverTimeStartTime;
        var calculatedBillingRate = ds.CalculateDispatchDetailLaborPrice({
          LaborSkillCode: $("#editDetailLaborInfo #laborSkillEditInput").val(),
          HoursSpent: validatedHoursSpent,
          OverTimeStartDate: overTimeStartDate,
          OverTimeStartTime: overTimeStartTime
        });
        $("#editDetailLaborInfo #billingRateEditInput").val(
          calculatedBillingRate.RoundTo(UnitPriceDecimals)
        );
        $("#editDetailLaborInfo #billingRateEditInput").trigger("change");
      });
    $("#editDetailLaborInfo #billingRateEditInput")
      .unbind()
      .change(function(e) {
        var targetLineKey = $("#submitEditDetailLaborButton")
          .attr("data-target")
          .split("_")[1];
        var newExtension =
          $(this).val() * $("#editDetailLaborInfo #hoursSpentEditInput").val();
        var laborLine = FindRowByFieldNameValuePair(
          pageModel.dispatchLabor,
          "LineKey",
          targetLineKey
        );
        if (
          pageModel.soOptions.AllowDiscountRate &&
          laborLine.LineDiscountPercent
        ) {
          newExtension =
            newExtension * ((100 - laborLine.LineDiscountPercent) / 100);
        }
        $("#editDetailLaborInfo #laborExtensionEditInput").val(
          parseFloat(newExtension).RoundTo(2)
        );
      });
    $("#submitEditDetailLaborButton")
      .unbind()
      .click(function(e) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        var targetLineKey = $(this)
          .attr("data-target")
          .split("_")[1];
        if (targetLineKey) {
          var modifyingLine = FindRowByFieldNameValuePair(
            pageModel.dispatchLabor.slice(),
            "LineKey",
            targetLineKey
          );
          var modifyingLineIndex = FindIndexByFieldNameValuePair(
            pageModel.dispatchLabor.slice(),
            "LineKey",
            targetLineKey
          );
          if (modifyingLine && modifyingLineIndex != null) {
            modifyingLine.LineDesc = $(
              "#editDetailLaborInfo #laborDescriptionEditInput"
            ).val();
            modifyingLine.HoursSpent = parseFloat(
              parseFloat(
                $("#editDetailLaborInfo #hoursSpentEditInput").val()
              ).RoundTo(QuantityDecimals)
            );
            modifyingLine.BillingRate = parseFloat(
              parseFloat(
                $("#editDetailLaborInfo #billingRateEditInput").val()
              ).RoundTo(UnitPriceDecimals)
            );
            modifyingLine.ExtensionAmt = parseFloat(
              parseFloat(
                $("#editDetailLaborInfo #laborExtensionEditInput").val()
              ).RoundTo(2)
            );
            modifyingLine.LaborCommentText = $('#editDetailLaborInfo #laborCommentEditInput').val();
            smpMobileApi.UpdateDispatchDetailLabor(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              modifyingLine,
              function(res) {
                smpMobileApi.GetDispatchDetailLabor(
                  pageModel.dispatch.TaskNo,
                  pageModel.dispatch.DispatchNo,
                  modifyingLine.LineKey,
                  function(updatedLine) {
                    smpMobileApi.GetDispatch(
                      pageModel.dispatch.TaskNo,
                      pageModel.dispatch.DispatchNo,
                      function(updatedDispatch) {
                        pageModel.dispatchLabor.splice(
                          modifyingLineIndex,
                          1,
                          updatedLine
                        );
                        ds.UpdateDispatchDetailLaborView(
                          updatedLine,
                          QuantityDecimals,
                          UnitPriceDecimals
                        );
                        pageModel.dispatch = updatedDispatch;
                        var dispatchStatus = FindRowByFieldNameValuePair(
                          pageModel.taskStatuses,
                          "StatusCode",
                          updatedDispatch.StatusCode
                        );
                        ds.FillDispatchHeader(
                          updatedDispatch,
                          dispatchStatus,
                          pageModel.taskStatuses
                        );
                        ds.LoadCounter();
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        smpMobileApi.ShowModal(
                          "Success",
                          "Dispatch Detail Labor updated succesfully",
                          "success",
                          5000
                        );
                      },
                      function(err) {
                        $(".loading").toggleClass("d-none");
                        $(".loading div").toggleClass("loadingIcon");
                        ds.LoadCounter();
                        smpMobileApi.ShowModal(
                          "Issue",
                          "Failed to get updated <strong>Dispatch Header</strong><br />" +
                            err.Message,
                          "danger",
                          15000
                        );
                      }
                    );
                  },
                  function(err) {
                    $(".loading").toggleClass("d-none");
                    $(".loading div").toggleClass("loadingIcon");
                    smpMobileApi.ShowModal(
                      "Issue",
                      "Failed to get updated <strong>Dispatch Detail</strong><br />" +
                        err.Message,
                      "danger",
                      15000
                    );
                  }
                );
              },
              function(err) {
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to update <strong>Dispatch Detail</strong><br />" +
                    err.Message,
                  "danger",
                  15000
                );
              }
            );
          }
        }
      });
    //#endregion

    //#region Delete Detail/Labor
    $(".deleteDetail")
      .unbind()
      .click(function(e) {
        var lineKey = $(this).attr("data-target");
        $("#deleteDetailSubmit").attr("data-target", lineKey);
        $("#deleteDetailConfirmationModal").modal();
      });
    $("#deleteDetailSubmit")
      .unbind()
      .click(function(e) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        var lineKey = $(this).attr("data-target");
        var line = FindRowByFieldNameValuePair(
          pageModel.dispatchDetail,
          "LineKey",
          lineKey
        );
        smpMobileApi.DeleteDispatchDetail(
          line.TaskNo,
          line.DispatchNo,
          line.ItemCode,
          lineKey,
          function(res) {
            smpMobileApi.GetDispatch(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              function(updatedDispatch) {
                var index = FindIndexByFieldNameValuePair(
                  pageModel.dispatchDetail,
                  "LineKey",
                  lineKey
                );
                pageModel.dispatchDetail.splice(index, 1);
                $("#line_" + lineKey).remove();

                pageModel.dispatch = updatedDispatch;
                var dispatchStatus = FindRowByFieldNameValuePair(
                  pageModel.taskStatuses,
                  "StatusCode",
                  updatedDispatch.StatusCode
                );
                ds.FillDispatchHeader(
                  updatedDispatch,
                  dispatchStatus,
                  pageModel.taskStatuses
                );
                ds.LoadCounter();
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Success",
                  "Dispatch Detail deleted succesfully",
                  "success",
                  5000
                );
              },
              function(err) {
                ds.LoadCounter();
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to get updated <strong>Dispatch Header</strong><br />" +
                    err.Message,
                  "danger",
                  15000
                );
              }
            );
          },
          function(err) {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to delete Dispatch Detail<br />" + err.Message,
              "danger",
              10000
            );
          }
        );
      });
    $(".deleteDetailLabor")
      .unbind()
      .click(function(e) {
        var lineKey = $(this).attr("data-target");
        $("#deleteDetailLaborSubmit").attr("data-target", lineKey);
        $("#deleteDetailLaborConfirmationModal").modal();
      });
    $("#deleteDetailLaborSubmit")
      .unbind()
      .click(function(e) {
        $(".loading").toggleClass("d-none");
        $(".loading div").toggleClass("loadingIcon");
        var lineKey = $(this).attr("data-target");
        var line = FindRowByFieldNameValuePair(
          pageModel.dispatchLabor,
          "LineKey",
          lineKey
        );
        smpMobileApi.DeleteDispatchDetailLabor(
          line.TaskNo,
          line.DispatchNo,
          line.LaborSkillCode,
          lineKey,
          function(res) {
            smpMobileApi.GetDispatch(
              pageModel.dispatch.TaskNo,
              pageModel.dispatch.DispatchNo,
              function(updatedDispatch) {
                var index = FindIndexByFieldNameValuePair(
                  pageModel.dispatchLabor,
                  "LineKey",
                  lineKey
                );
                pageModel.dispatchLabor.splice(index, 1);
                $("#labor_" + lineKey).remove();
                pageModel.dispatch = updatedDispatch;
                var dispatchStatus = FindRowByFieldNameValuePair(
                  pageModel.taskStatuses,
                  "StatusCode",
                  updatedDispatch.StatusCode
                );
                ds.FillDispatchHeader(
                  updatedDispatch,
                  dispatchStatus,
                  pageModel.taskStatuses
                );
                ds.LoadCounter();
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Success",
                  "Dispatch Labor deleted succesfully",
                  "success",
                  5000
                );
              },
              function(err) {
                ds.LoadCounter();
                $(".loading").toggleClass("d-none");
                $(".loading div").toggleClass("loadingIcon");
                smpMobileApi.ShowModal(
                  "Issue",
                  "Failed to get updated <strong>Dispatch Header</strong><br />" +
                    err.Message,
                  "danger",
                  15000
                );
              }
            );
          },
          function(err) {
            $(".loading").toggleClass("d-none");
            $(".loading div").toggleClass("loadingIcon");
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to delete Dispatch Detail Labor<br />" + err.Message,
              "danger",
              10000
            );
          }
        );
      });
    //#endregion
  }
  FillDispatchHeader(dispatch, dispatchStatus, dispatchStatuses) {
    dispatchStatuses.forEach(element => {
      $("#dispatchStatusSelect").append(
        '<option value="' +
          element.StatusCode +
          '">' +
          element.Description +
          "</option>"
      );
    });
    $("#dispatchTaskNo").text(dispatch.TaskNo);
    $("#dispatchDispatchNo").text(dispatch.DispatchNo);
    $("#dispatchCustomerNo").text(
      dispatch.Customer
        ? dispatch.Customer
        : dispatch.ARDivisionNo + "-" + dispatch.CustomerNo
    );
    $("#dispatchStatus").text(dispatchStatus.Description);
    $("#dispatchDate").text(GetDateForInput(dispatch.DispatchDate));
    $("#dispatchDateInput").val(GetDateForInput(dispatch.DispatchDate));
    $("#dispatchStatusSelect").val(dispatch.StatusCode);
    $("#dispatchStartDateInput").val(GetDateForInput(dispatch.StartDate));
    $("#dispatchStartTimeInput").val(GetFormattedTime(dispatch.StartTime));
    $("#dispatchEndDateInput").val(GetDateForInput(dispatch.EndDate));
    $("#dispatchEndTimeInput").val(GetFormattedTime(dispatch.EndTime));
    $("#dispatchDiscountRateInput").val(dispatch.DiscountRate.RoundTo(2));
    $("#dispatchDiscountAmountInput").val(dispatch.DiscountAmt.RoundTo(2));
    $("#dispatchFreightAmountInput").val(dispatch.FreightAmt.RoundTo(2));
    $("#dispatchSalesTaxAmountInput").val(dispatch.SalesTaxAmt.RoundTo(2));
    $("#dispatchTaxableAmountInput").val(dispatch.TaxableAmt.RoundTo(2));
    $("#dispatchNonTaxableAmountInput").val(dispatch.NonTaxableAmt.RoundTo(2));
    $("#dispatchDispatchTotalInput").val(dispatch.DispatchTotal.RoundTo(2));
    if (dispatch.DepositAmt > 0) {
      $("#dispatchDepositAmountInput").val(dispatch.DepositAmt.RoundTo(2));
      $("#dispatchNetTotalInput").val(
        (dispatch.DispatchTotal - dispatch.DepositAmt).RoundTo(2)
      );
      $("#dispatchDepositAmountDiv").removeClass("d-none");
      $("#dispatchNetTotalDiv").removeClass("d-none");
    } else {
      if (!$("#dispatchDepositAmountDiv").hasClass("d-none"))
        $("#dispatchDepositAmountDiv").addClass("d-none");
      if (!$("#dispatchNetTotalDiv").hasClass("d-none"))
        $("#dispatchNetTotalDiv").addClass("d-none");
    }
  }
  FillDispatchDetails(dispatchDetails, ciOptions) {
    var UnitPriceDecimals =
      ciOptions && ciOptions.NumberOfDecimalPlacesInPrice
        ? ciOptions.NumberOfDecimalPlacesInPrice
        : 2;
    var QuantityDecimals =
      ciOptions && ciOptions.NumberOfDecimalPlacesInQty
        ? ciOptions.NumberOfDecimalPlacesInQty
        : 2;
    var that = this;
    dispatchDetails.forEach(line => {
      that.DrawDispatchDetail(line, QuantityDecimals, UnitPriceDecimals);
    });
  }
  FillDispatchLabors(dispatchLabors, ciOptions) {
    var UnitPriceDecimals =
      ciOptions && ciOptions.NumberOfDecimalPlacesInPrice
        ? ciOptions.NumberOfDecimalPlacesInPrice
        : 2;
    var QuantityDecimals =
      ciOptions && ciOptions.NumberOfDecimalPlacesInQty
        ? ciOptions.NumberOfDecimalPlacesInQty
        : 2;
    var that = this;
    dispatchLabors.forEach(labor => {
      that.DrawDispatchDetailLabor(labor, QuantityDecimals, UnitPriceDecimals);
    });
  }
  FillDispatchAttachments(attachments) {
    var detailAttachmentsTableBody = $("#dispatchDetailAttachmentsTableBody");
    var lineNumber = 1;
    attachments.forEach(attachment => {
      var $tr = $("<tr>");
      $tr.attr("id", "attachment_" + lineNumber);
      lineNumber++;
      $tr.append(
        '<td><div class="single-line"><a href="#" class="openAttachment" data-target="' +
          attachment.Name +
          ":" +
          attachment.Hash +
          '">' +
          attachment.Name +
          "</a></div></td>"
      );
      detailAttachmentsTableBody.append($tr);
      if (attachment.Name.indexOf(pageModel.dispatch.TaskNo+"_"+pageModel.dispatch.DispatchNo+"_signature.jpg") >= 0) {
        smpMobileApi.GetTaskAttachment(
          pageModel.dispatch.TaskNo,
          attachment.Name,
          function(signatureData) {
            if (SMPMobileAPI.IsOnline) {
              var a = new FileReader();
              a.onload = function(e) {
                ds.LoadSignatureImage(e.target.result);
                pageModel.signature = e.target.result;
              };
              a.readAsDataURL(signatureData);
            } else {
              ds.LoadSignatureImage(
                "data:image/jpg;base64," + signatureData.Data
              );
              pageModel.signature =
                "data:image/jpg;base64," + signatureData.Data;
            }
          },
          function(err) {
            smpMobileApi.ShowModal(
              "Issue",
              "Failed to load Dispatch Signature<br />" + err.Message,
              "danger",
              10000
            );
          }
        );
      }
    });
    $(".openAttachment").click(function(e) {
      var attachment = $(this).attr("data-target");
      var url =
        GetCacheValue(CacheIds.serverEndpoint) +
        "/api/dispatch/task/attachments/get/" +
        pageModel.taskInfo.TaskNo +
        "/" +
        attachment.split(":")[0] +
        "?tokenID=" +
        encodeURIComponent(attachment.split(":")[1]);
      window.open(url, "_blank");
      e.preventDefault();
    });
  }
  FillPrintingModal(priceDecimal, qtyDecimal) {
    $("#printingInvoiceInfo").empty();
    var printModal = $("#printingInvoiceInfo");
    var innerColumn = $("<div></div>");
    var companyString =
      '<div class="col-12 text-center">' +
      "<h3>" +
      pageModel.companyInfo.CompanyName +
      "</h3>" +
      (pageModel.companyInfo.Address1
        ? "<p>" + pageModel.companyInfo.Address1 + "</p>"
        : "") +
      (pageModel.companyInfo.Address2
        ? "<p>" + pageModel.companyInfo.Address2 + "</p>"
        : "") +
      (pageModel.companyInfo.Address3
        ? "<p>" + pageModel.companyInfo.Address3 + "</p>"
        : "") +
      (pageModel.companyInfo.Address4
        ? "<p>" + pageModel.companyInfo.Address4 + "</p>"
        : "") +
      (pageModel.companyInfo.EmailAddress
        ? "<p>" + pageModel.companyInfo.EmailAddress + "</p>"
        : "") +
      (pageModel.companyInfo.Phone
        ? "<p>" + pageModel.companyInfo.Phone + "</p>"
        : "") +
      "</div>";
    var dispatchHeaderString =
      "<br /><div>" +
      '<div class="col-12">' +
      "<h3> Task No " +
      pageModel.dispatch.TaskNo +
      "</h3>" +
      "<h3> Dispatch No " +
      pageModel.dispatch.DispatchNo +
      "</h3>" +
      "<br/><br/>" +
      "<h3> Account " +
      pageModel.taskInfo.ARDivisionNo +
      "-" +
      pageModel.taskInfo.CustomerNo +
      "</h3>" +
      '<div class="row">' +
      '<div class="col-10 col-sm-10 col-md-6 col-lg-6 col-xl-6">' +
      "Bill To <br />" +
      "<p>" +
      pageModel.taskInfo.BillToName +
      "</p>" +
      "<p>" +
      pageModel.taskInfo.BillToAddress +
      "</p>" +
      "</div>" +
      '<div class="col-10 col-sm-10 col-md-6 col-lg-6 col-xl-6">' +
      "Ship To <br />" +
      "<p>" +
      pageModel.taskInfo.ShipToName +
      "</p>" +
      "<p>" +
      pageModel.taskInfo.ShipToAddress +
      "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div><br /><br />";
    var dispatchDetailsString = "";
    if(pageModel.dispatchDetail.length>0)
    {
      dispatchDetailsString+= '<h3>Dispatch Details</h3><div class="col-12">';
    dispatchDetailsString +=
      '<div class="row boldHeader"><div class="col-4">Item Code</div><div class="col-2">Qty.</div><div class="col-2 amountField">Price</div><div class="col-4 amountField">Extension</div><div class="col-12">Description</div></div>';
    pageModel.dispatchDetail.forEach(dispatchDetailLine => {
      dispatchDetailsString +=
        '<div class="row"><div class="col-4">' +
        (dispatchDetailLine.ItemType != "4"
          ? PopulateLineFeeds(dispatchDetailLine.ItemCode)
          : "") +
        "</div>" +
        '<div class="col-2">' +
        (dispatchDetailLine.ItemType != "4" &&
        dispatchDetailLine.ItemType != "3"
          ? dispatchDetailLine.QuantityOrdered.RoundTo(qtyDecimal)
          : "") +
        "</div>" +
        '<div class="col-3 amountField">' +
        (dispatchDetailLine.ItemType != "4" &&
        dispatchDetailLine.ItemType != "3"
          ? dispatchDetailLine.UnitPrice.RoundTo(priceDecimal)
          : "") +
        "</div>" +
        '<div class="col-3 amountField">' +
        (dispatchDetailLine.ItemType != "4"
          ? dispatchDetailLine.ExtensionAmt.RoundTo(2)
          : "") +
        "</div>" +
        '<div class="col-12">' +
        (dispatchDetailLine.ItemType != "4"
          ? dispatchDetailLine.ExtendedDesc
            ? dispatchDetailLine.ExtendedDesc
            : dispatchDetailLine.ItemCodeDesc
          : "") +
        "</div>" +
        '<div class="col-12">' +
        (dispatchDetailLine.CommentText != ""
          ? dispatchDetailLine.CommentText
          : "") +
        "</div></div>";
    });
    dispatchDetailsString += "<br /></div>";
    }
    var dispatchLaborsString = "";
    if(pageModel.dispatchLabor.length>0)
    {
      dispatchLaborsString += '<h3>Dispatch Labors</h3><div class="col-12">';
      dispatchLaborsString +=
        '<div class="row boldHeader"><div class="col-4">Labor Code</div><div class="col-2">Hours Spent</div><div class="col-2 amountField">Billing Rate</div><div class="col-4 amountField">Extension</div><div class="col-12">Description</div></div>';
      pageModel.dispatchLabor.forEach(dispatchDetailLaborLine => {
        dispatchLaborsString +=
          '<div class="row"><div class="col-4">' +
          PopulateLineFeeds(dispatchDetailLaborLine.LaborSkillCode) +
          "</div>" +
          '<div class="col-2">' +
          dispatchDetailLaborLine.HoursSpent.RoundTo(qtyDecimal) +
          "</div>" +
          '<div class="col-3 amountField">' +
          dispatchDetailLaborLine.BillingRate.RoundTo(priceDecimal) +
          "</div>" +
          '<div class="col-3 amountField">' +
          dispatchDetailLaborLine.ExtensionAmt.RoundTo(2) +
          "</div>" +
          '<div class="col-12">' +
          (dispatchDetailLaborLine.LineDescExtended
            ? dispatchDetailLaborLine.LineDescExtended
            : dispatchDetailLaborLine.LineDesc) +
          "</div>"+
          '<div class="col-12">' +
          (dispatchDetailLaborLine.LaborCommentText != ""
            ? dispatchDetailLaborLine.LaborCommentText
            : "") +
          "</div></div>";
      });
      dispatchLaborsString += "</div>";
    }
    var dispatchTotalsString = '<br /><div class="col-12 text-right amountField">';
    dispatchTotalsString +=
      "<p> Taxable Amount : " +
      pageModel.dispatch.TaxableAmt.RoundTo(2) +
      "</p>" +
      "<p> NonTaxable Amount : " +
      pageModel.dispatch.NonTaxableAmt.RoundTo(2) +
      "</p>" +
      "<p> Less Discount : " +
      pageModel.dispatch.DiscountAmt.RoundTo(2) +
      "</p>" +
      "<p> Freight : " +
      pageModel.dispatch.FreightAmt.RoundTo(2) +
      "</p>" +
      "<p> Sales Tax : " +
      pageModel.dispatch.SalesTaxAmt.RoundTo(2) +
      "</p>" +
      "<h5> Dispatch Total : " +
      pageModel.dispatch.DispatchTotal.RoundTo(2) +
      "</h5>" +
      (pageModel.dispatch.DepositAmt > 0
        ? "<h5> Deposit Amount : " +
          pageModel.dispatch.DepositAmt.RoundTo(2) +
          "</h5>" +
          "<h5> Net Dispatch : " +
          (
            pageModel.dispatch.DispatchTotal - pageModel.dispatch.DepositAmt
          ).RoundTo(2) +
          "</h5>"
        : "");
    dispatchTotalsString += "</div>";
    var signature = pageModel.signature; ///signaturePad.toDataURL("image/jpeg");
    var signatureString =
      '<br /><div class="col-12 text-center"><img width="200" height="200" src="' +
      signature +
      '"></img></div>';
    innerColumn.append(companyString);
    innerColumn.append(dispatchHeaderString);
    innerColumn.append(dispatchDetailsString);
    innerColumn.append(dispatchLaborsString);
    innerColumn.append(dispatchTotalsString);
    if (signature) innerColumn.append(signatureString);
    printModal.append(innerColumn);
  }
  LoadSignatureImage(dataURL) {
    var context = signaturePad._canvas.getContext("2d");
    if (dataURL) {
      var imageObj = new Image();
      imageObj.onload = function() {
        context.drawImage(
          this,
          0,
          0,
          this.width,
          this.height,
          0,
          0,
          signaturePad._canvas.width,
          signaturePad._canvas.height
        );
      };
      imageObj.src = dataURL;
    }
  }
  DrawDispatchDetail(line, quantityDec, priceDec) {
    var detailsTableBody = $("#dispatchDetailsTableBody");
    var $tr = $("<tr>");
    $tr.attr("id", "line_" + line.LineKey);
    $tr.append(
      '<td style="display:block;width:86px;"><button type="button" class="btn btn-primary deleteDetail" data-target="' +
        line.LineKey +
        '"><i class="fa fa-trash"></i></button>' +
        '<button type="button" class="btn btn-primary editDetail" data-target="' +
        line.LineKey +
        '"><i class="fa fa-edit"></i></button>' +
        "</td>"
    );
    $tr.append(
      '<td><div class="itemcode single-line">' + line.ItemCode + "</div></td>"
    );
    $tr.append(
      '<td><div class="single-line">' +
        line.QuantityOrdered.RoundTo(quantityDec) +
        "</div></td>"
    );
    $tr.append(
      '<td class="amountField"><div class="single-line">' +
        line.UnitPrice.RoundTo(priceDec) +
        "</div></td>"
    );
    $tr.append(
      '<td class="amountField"><div class="single-line">' +
        line.ExtensionAmt.RoundTo(2) +
        "</div></td>"
    );
    $tr.append(
      '<td><div class="comment single-line">' + line.CommentText + "</div></td>"
    );
    detailsTableBody.append($tr);
  }
  DrawDispatchDetailLabor(labor, quantityDec, priceDec) {
    var detailLaborsTableBody = $("#dispatchDetailLaborsTableBody");
    var $tr = $("<tr>");
    $tr.attr("id", "labor_" + labor.LineKey);
    $tr.append(
      '<td style="display:block;width:86px;"><button type="button" class="btn btn-primary deleteDetailLabor" data-target="' +
        labor.LineKey +
        '"><i class="fa fa-trash"></i></button>' +
        '<button type="button" class="btn btn-primary editDetailLabor" data-target="' +
        labor.LineKey +
        '"><i class="fa fa-edit"></i></button>' +
        "</td>"
    );
    $tr.append(
      '<td><div class="itemcode single-line">' +
        labor.LaborSkillCode +
        "</div></td>"
    );
    $tr.append(
      '<td><div class="single-line">' +
        labor.HoursSpent.RoundTo(quantityDec) +
        "</div></td>"
    );
    $tr.append(
      '<td class="amountField"><div class="single-line">' +
        labor.BillingRate.RoundTo(priceDec) +
        "</div></td>"
    );
    $tr.append(
      '<td class="amountField"><div class="single-line">' +
        labor.ExtensionAmt.RoundTo(2) +
        "</div></td>"
    );
    $tr.append(
      '<td><div class="comment single-line">' +
        labor.LaborCommentText +
        "</div></td>"
    );
    detailLaborsTableBody.append($tr);
  }
  UpdateDispatchDetailView(line, quantityDec, priceDec) {
    $(
      "#dispatchDetailsTableBody #line_" + line.LineKey + " td:nth-child(2) div"
    ).text(line.ItemCode);
    $(
      "#dispatchDetailsTableBody #line_" + line.LineKey + " td:nth-child(3) div"
    ).text(line.QuantityOrdered.RoundTo(quantityDec));
    $(
      "#dispatchDetailsTableBody #line_" + line.LineKey + " td:nth-child(4) div"
    ).text(line.UnitPrice.RoundTo(priceDec));
    $(
      "#dispatchDetailsTableBody #line_" + line.LineKey + " td:nth-child(5) div"
    ).text(line.ExtensionAmt.RoundTo(2));
    $(
      "#dispatchDetailsTableBody #line_" + line.LineKey + " td:nth-child(6) div"
    ).text(line.CommentText);
  }
  UpdateDispatchDetailLaborView(labor, quantityDec, priceDec) {
    $(
      "#dispatchDetailLaborsTableBody #labor_" +
        labor.LineKey +
        " td:nth-child(2) div"
    ).text(labor.LaborSkillCode);
    $(
      "#dispatchDetailLaborsTableBody #labor_" +
        labor.LineKey +
        " td:nth-child(3) div"
    ).text(labor.HoursSpent.RoundTo(quantityDec));
    $(
      "#dispatchDetailLaborsTableBody #labor_" +
        labor.LineKey +
        " td:nth-child(4) div"
    ).text(labor.BillingRate.RoundTo(priceDec));
    $(
      "#dispatchDetailLaborsTableBody #labor_" +
        labor.LineKey +
        " td:nth-child(5) div"
    ).text(labor.ExtensionAmt.RoundTo(2));
    $('#dispatchDetailLaborsTableBody  #labor_'+labor.LineKey+' td:nth-child(6) div').text(labor.LaborCommentText);
  }
  ValidatePayment() {
    var paymentTypeInput = $("#paymentTypeInput").val();
    if (!paymentTypeInput || paymentTypeInput == "NONE") {
      $("#paymentTypeInput")
        .get(0)
        .setCustomValidity("Payment Type is not selected");
      return false;
    }
    var paymentTypeRecord = FindRowByFieldNameValuePair(
      pageModel.paymentTypes,
      "PaymentType",
      paymentTypeInput
    );
    var checkNumberInput = $("#checkNumberInput").val();
    var refNumberInput = $("#refNumberInput").val();
    var newCreditCardChkBox = $("#newCreditCardChkBox").prop("checked");
    var paymentIDInput = $("#paymentIDInput").val();
    var cardNumberInput = $("#cardNumberInput").val();
    var expirationDateInput = $("#expirationDateInput").val();
    var cvvInput = $("#cvvInput").val();
    var paymentAmountInput = parseFloat($("#paymentAmountInput").val());
    var valid = true;
    switch (paymentTypeRecord.PaymentMethod) {
      case "O":
      case "C":
        if (!checkNumberInput) {
          $("#checkNumberInput")
            .get(0)
            .setCustomValidity("Check number could not be empty");
          valid = false;
        }
        break;
      case "D":
        if (!refNumberInput) {
          $("#refNumberInput")
            .get(0)
            .setCustomValidity("Reference number could not be empty");
          valid = false;
        }
        break;
      case "R":
        if (newCreditCardChkBox) {
          if (!cardNumberInput) {
            $("#cardNumberInput")
              .get(0)
              .setCustomValidity("Card Number could not be empty");
            valid = false;
          }
          if (!expirationDateInput) {
            $("#expirationDateInput")
              .get(0)
              .setCustomValidity("Expiration Date could not be empty");
            valid = false;
          }
          if (!cvvInput) {
            $("#cvvInput")
              .get(0)
              .setCustomValidity("CVV could not be empty");
            valid = false;
          }
        } else if (!paymentIDInput || paymentIDInput == "NONE") {
          $("#paymentIDInput")
            .get(0)
            .setCustomValidity("Payment ID could not be empty");
          valid = false;
        }
        break;
    }
    if (paymentAmountInput < 0) {
      $("#paymentAmountInput")
        .get(0)
        .setCustomValidity("Payment Amount should be greater than 0");
      valid = false;
    }
    return valid;
  }
  HoursPrecision(tmpHours, PrecisionInMinutes, Rounding) {
    var Hours = tmpHours;
    var HoursInPrecision = null;
    tmpHours = tmpHours * 60;
    PrecisionInMinutes = parseInt(PrecisionInMinutes);
    switch (Rounding) {
      case "U":
        HoursInPrecision =
          (parseInt(tmpHours / PrecisionInMinutes) * PrecisionInMinutes +
            (tmpHours / Math.abs(tmpHours)) *
              (Math.abs(tmpHours) % PrecisionInMinutes > 0 ? 1 : 0) *
              PrecisionInMinutes) /
          60;
        break;
      case "D":
        HoursInPrecision =
          (parseInt(tmpHours / PrecisionInMinutes) * PrecisionInMinutes) / 60;
        break;
      case "C":
        HoursInPrecision =
          (parseInt(tmpHours / PrecisionInMinutes) * PrecisionInMinutes +
            (tmpHours -
              parseInt(tmpHours / PrecisionInMinutes) * PrecisionInMinutes >
            PrecisionInMinutes / 2
              ? 1
              : 0) *
              PrecisionInMinutes) /
          60;
        break;
      case "N":
        HoursInPrecision = Hours;
        break;
      default:
        HoursInPrecision = Hours;
        break;
    }
    return HoursInPrecision;
  }
  IsWorkingDay(inputDate) {
    var result = 2;
    if (inputDate) {
      var generalDateRecords = FindRecordsByParams(
        pageModel.workingDaysDetails,
        false,
        [{ Name: "Year", Value: "9999" }]
      );
      generalDateRecords.forEach(element => {
        if (
          element.Day.getDate() == inputDate.getDate() &&
          element.Day.getMonth() == inputDate.getMonth()
        ) {
          result = parseInt(element.WorkDay);
        }
      });
      var generalDateRecords = FindRecordsByParams(
        pageModel.workingDaysDetails,
        false,
        [{ Name: "Year", Value: inputDate.getFullYear() }]
      );
      generalDateRecords.forEach(element => {
        if (
          element.Day.getDate() == inputDate.getDate() &&
          element.Day.getMonth() == inputDate.getMonth() &&
          element.Day.getFullYear() == inputDate.getFullYear()
        ) {
          result = parseInt(element.WorkDay);
        }
      });
    }
    return result;
  }
  ValidateHoursSpent(value) {
    var tmpHoursSpent = value;
    var HoursInPrecision = ds.HoursPrecision(
      tmpHoursSpent,
      pageModel.smOptions.SpentHoursPrecisionInMinutes,
      pageModel.smOptions.SpentHoursRounding
    );
    var MinimumBillingTime = parseInt(pageModel.smOptions.MinimumBillingTime);
    tmpHoursSpent = Math.max(HoursInPrecision, MinimumBillingTime / 60);
    if (tmpHoursSpent < 0) {
      tmpHoursSpent = 0;
    }
    return tmpHoursSpent;
  }
}
var pageModel = {
  signature: null, //this should not be counted as it is being initialized in the FillDispatchAttachments.
  dispatch: null,
  arBillToSoldTos: null,
  arOptions: null,
  bmBillHeaders: null,
  bmBillOptionHeaders: null,
  bmBillOptionCategories: null,
  bmOptions: null,
  coverageCodes: null,
  dispatchDetail: null,
  dispatchLabor: null,
  dispatchPayments: null,
  taskAttachments: null,
  taskInfo: null,
  taskStatuses: null,
  taskTypes: null,
  taskContract: null,
  taskContractDetails: null,
  taskPayments: null,
  natureOfTasks: null,
  priceCodes: null,
  priceLevels: null,
  paymentTypes: null,
  customerPaymentMethods: null,
  customerTechLaborSkillRates: null,
  ciOptions: null,
  smOptions: null,
  soOptions: null,
  companyInfo: null,
  ciItems: null,
  laborSkillCodes: null,
  technician: null,
  workingDaysDetails: null,
  taxRate: null,
  nextDeliveries: null,
  lastDeliveries: null,
  dispatchDesc: null,
  ajaxCounter: 36,
  ajaxFailedCounter: 0,
  loadIssues: [],
  allLoaded: function() {
    if (pageModel.ajaxCounter == 0) {
      console.timeEnd("AjaxRequests");
      if (! pageModel.companyInfo || !pageModel.companyInfo.ExternalAccess) {
        smpMobileApi.ShowModal(
          "Issue",
          "<strong>External Access</strong> for current Company is not allowed.",
          "danger",
          15000
        );
      } else {
        var taskType = FindRowByFieldNameValuePair(
          pageModel.taskTypes,
          "TypeCode",
          pageModel.taskInfo.TaskType
        );
        var taskStatus = FindRowByFieldNameValuePair(
          pageModel.taskStatuses,
          "StatusCode",
          pageModel.taskInfo.TaskStatus
        );
        var dispatchDesc = FindRowByFieldNameValuePair(
          pageModel.dispatchDesc,
          "StatusCode",
          pageModel.taskInfo.taskNo
        );
        var dispatchStatus = FindRowByFieldNameValuePair(
          pageModel.taskStatuses,
          "StatusCode",
          pageModel.dispatch.StatusCode
        );
        var natureOfTask = FindRecordsByParams(
          pageModel.natureOfTasks,
          true,
          [{Name: "NatureOfTask", Value:pageModel.taskInfo.NatureOfTask},
          {Name:"TypeCode", Value:pageModel.taskInfo.TaskType}])[0];
        // FindRowByFieldNameValuePair(
        //   pageModel.natureOfTasks,
        //   "NatureOfTask",
        //   pageModel.taskInfo.NatureOfTask
        // );
        ds.FillDispatchHeader(
          pageModel.dispatch,
          dispatchStatus,
          pageModel.taskStatuses
        );
        ds.FillDispatchDetails(
          pageModel.dispatchDetail, 
          pageModel.ciOptions);
        ds.FillDispatchLabors(
          pageModel.dispatchLabor, 
          pageModel.ciOptions);
        ds.FillDispatchAttachments(pageModel.taskAttachments);
        ds.InitializeDispatchEvents(
          pageModel.dispatch,
          pageModel.taskInfo,
          taskType,
          taskStatus,
          natureOfTask,
          dispatchDesc);
        $("#btnSave").click(function() {
          var first = $("#taskInfo_NatureOfTaskAnswer1_Input").val();
          var second = $("#taskInfo_NatureOfTaskAnswer2_Input").val();
          var third = $("#taskInfo_NatureOfTaskAnswer3_Input").val();
          var fourth = $("#taskInfo_NatureOfTaskAnswer4_Input").val();
          var fifth = $("#taskInfo_NatureOfTaskAnswer5_Input").val();
          pageModel.taskInfo.NatureOfTaskAnswer1 = first;
          pageModel.taskInfo.NatureOfTaskAnswer2 = second;
          pageModel.taskInfo.NatureOfTaskAnswer3 = third;
          pageModel.taskInfo.NatureOfTaskAnswer4 = fourth;
          pageModel.taskInfo.NatureOfTaskAnswer5 = fifth;

          $('.loading').toggleClass('d-none');
          $('.loading div').toggleClass('loadingIcon');

          smpMobileApi.UpdateTask(
            pageModel.taskInfo,
            function(res) {
              smpMobileApi.GetTechnicianTasksInfo(
                function(tasksInfos) {
                  pageModel.taskInfo = FindRowByFieldNameValuePair(
                    tasksInfos,
                    "TaskNo",
                    pageModel.taskInfo.TaskNo
                  );
                  ds.LoadCounter();
                  $('.loading').toggleClass('d-none');
                  $('.loading div').toggleClass('loadingIcon');  
                },
                function(error) {
                  ds.LoadCounter();
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
              ds.LoadCounter();
              smpMobileApi.ShowModal(
                "Issue",
                "Failed to Update Nature of Task Answers<br />" + err.Message,
                "danger",
                10000
              );
            });
        });
        if(pageModel.smOptions.HideAmountFields)
        {
          $('.amountField').addClass('d-none');
        }
        $(".loading div").toggleClass("loadingIcon");
        $(".loading").toggleClass("d-none");
        $("#dispatchContainer").toggleClass("hideInformation");
      }
    } else if (pageModel.ajaxCounter - pageModel.ajaxFailedCounter == 0) {
      smpMobileApi.ShowModal(
        "Issue",
        pageModel.loadIssues.join("<br />"),
        "danger",
        15000
      );
      $(".loading div").toggleClass("loadingIcon");
      $(".loading").toggleClass("d-none");
    }
  }
};
