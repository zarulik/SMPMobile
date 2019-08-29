class DBEngine {
  constructor() {
    this._db = window.sqlitePlugin.openDatabase({
      name: "SMPMobileV2.db",
      location: "default"
    });
  }
  static DeleteDatabase(success,error){
    window.sqlitePlugin.deleteDatabase({name: 'SMPMobileV2.db', location: 'default'}, 
    success, 
    error);
  }
  InitializeDatabase(success,error){
    var that = this;
    that.InitializeTables();
    smpMobileApi.GetApplicationModel(
      function(allModel){
        that.InsertAllData(allModel,success,error);
      },
      error
    );
  }
  InsertAllData(allModel,success,error)
  {
    var sqlCommand = [];
    
    sqlCommand.push(['INSERT INTO AROptions VALUES (?,?,?)', [allModel.companyInfo.CompanyCode,allModel.arOptions.DefaultCustPricingSetting?1:0,allModel.arOptions.Hash ]]);
    sqlCommand.push(['INSERT INTO BMOptions VALUES (?,?,?,?)', [allModel.companyInfo.CompanyCode,allModel.bmOptions.UseOptionBills?1:0,allModel.bmOptions.BMIntegrated?1:0,allModel.bmOptions.Hash ]]);
    sqlCommand.push(['INSERT INTO CIOptions VALUES (?,?,?,?)',[allModel.companyInfo.CompanyCode,allModel.ciOptions.NumberOfDecimalPlacesInPrice,allModel.ciOptions.NumberOfDecimalPlacesInQty,allModel.ciOptions.Hash ]]);
    sqlCommand.push(['INSERT INTO SMOptions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,allModel.smOptions.LaborBillingPresentation,allModel.smOptions.MiscellaneousItemCode,allModel.smOptions.ProductLine,allModel.smOptions.OrderInItemNo,allModel.smOptions.CalculateTaxesOnLabor,allModel.smOptions.SpentHoursRounding,allModel.smOptions.SpentHoursPrecisionInMinutes,allModel.smOptions.MinimumBillingTime,allModel.smOptions.BillingRateCalcPriorityHigh,allModel.smOptions.BillingRateCalcPriorityMiddle,allModel.smOptions.BillingRateCalcPriorityLowest,allModel.smOptions.UseOvertimeCalculationForLab?1:0,allModel.smOptions.ApplyDispDateTimeToLabor,allModel.smOptions.DisplayCustomerARInfoOnMobile?1:0,allModel.smOptions.HideAmountFields?1:0,allModel.smOptions.Hash ]]);
    sqlCommand.push(['INSERT INTO SOOptions VALUES (?,?,?,?,?)', [allModel.companyInfo.CompanyCode,allModel.soOptions.EnableDefaultPriceLevelByCust?0:1,allModel.soOptions.BaseNewPriceLevelRecordsOn,allModel.soOptions.AllowDiscountRate?1:0,allModel.soOptions.Hash ]]);
    allModel.arBillToSoldTos.forEach(element => {
      sqlCommand.push(['INSERT INTO ARBillToSoldTo VALUES (?,?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,element.SoldToDivisionNo,element.SoldToCustomerNo,element.BillToDivisionNo,element.BillToCustomerNo,element.CustomerPricing,element.Hash ]]);      
    });
    allModel.paymentTypes.forEach(element => {
      sqlCommand.push(['INSERT INTO ARPaymentType VALUES (?,?,?,?,?)', [allModel.companyInfo.CompanyCode,element.PaymentType,element.PaymentDesc,element.PaymentMethod,element.Hash ]]);  
    });
    allModel.bmBillHeaders.forEach(element =>{
      sqlCommand.push(['INSERT INTO BMBillHeader VALUES (?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,element.BillNo,element.Revision,element.CurrentBillRevision,element.BillHasOptions?1:0,element.Hash ]]);  
    });
    allModel.bmBillOptionHeaders.forEach(element=>{
      sqlCommand.push(['INSERT INTO BMBillOptionHeader VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,element.BillNo,element.Revision,element.BillOptionCategory,element.BillOption,element.OptionDesc1,element.OptionDesc2,element.DrawingNo,element.DrawingRevision,element.DateLastUsed,element.RoutingNo,element.WorkOrderStepNo,element.MaximumLotSize,element.OptionPrice,element.YieldPercent,element.Hash ]]);  
    });
    allModel.bmBillOptionCategories.forEach(element=>{
      sqlCommand.push(['INSERT INTO BMBillOptionCategory VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,element.BillNo,element.Revision,element.BillOptionCategory1Desc,element.BillOptionCategory2Desc,element.BillOptionCategory3Desc,element.BillOptionCategory4Desc,element.BillOptionCategory5Desc,element.BillOptionCategory6Desc,element.BillOptionCategory7Desc,element.BillOptionCategory8Desc,element.BillOptionCategory9Desc,element.BillOption1Required?1:0,element.BillOption2Required?1:0,element.BillOption3Required?1:0,element.BillOption4Required?1:0,element.BillOption5Required?1:0,element.BillOption6Required?1:0,element.BillOption7Required?1:0,element.BillOption8Required?1:0,element.BillOption9Required?1:0,element.Hash ]]);  
    });
    sqlCommand.push(['INSERT INTO SYCompany VALUES (?,?,?,?,?,?,?,?,?,?)', [allModel.companyInfo.CompanyCode,allModel.companyInfo.CompanyName,allModel.companyInfo.Address1,allModel.companyInfo.Address2,allModel.companyInfo.Address3,allModel.companyInfo.Address4,allModel.companyInfo.EmailAddress,allModel.companyInfo.Phone,allModel.companyInfo.ExternalAccess,allModel.companyInfo.Hash ]]);
    allModel.ciItems.forEach(element=>{
      sqlCommand.push(['INSERT INTO CIItem VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode, element.ItemCode, element.ItemCodeDesc, element.StandardUnitPrice, element.StandardUnitCost, element.LastTotalUnitCost, element.ItemType, element.TaxClass, element.PriceCode, element.ProductLine, element.AllowTradeDiscount, element.SalesUMConvFctr, element.SalesPromotionCode, element.SaleStartingDate, element.SaleEndingDate, element.SaleMethod, element.SalesPromotionDiscountPercent, element.SalesPromotionPrice, element.Hash]]);
    });
    allModel.customersPaymentMethods.forEach(element=>{
      sqlCommand.push(['INSERT INTO ARCustomerCreditCard VALUES (?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ARDivisionNo, element.CustomerNo, element.CreditCardID, element.ExpirationDateYear, element.ExpirationDateMonth, element.PaymentType, element.CardType, element.Last4UnencryptedCreditCardNos, element.Hash]]);
    });
    allModel.tasksContracts.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMContractHeader VALUES (?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ContractNo,element.ContractDescription,element.ContractDate,element.AllCoveredMaterials?1:0,element.AllCoveredLabors?1:0,element.Hash]]);
    });
    allModel.tasksContractsDetails.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMContractDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ContractNo, element.LineKey, element.LineSeqNo, element.ItemLaborSkillCode, element.LotSerialNo, element.LineType, element.ExpirationDate, element.LineDescription, element.ExtendedDescriptionKey, element.Valuation, element.UnitOfMeasure, element.PricingMethod, element.CommentText, element.UnitOfMeasureConvFactor, element.LineDiscountPercent, element.OverridePrice, element.PriceOff, element.Hash]]);
    });
    allModel.laborSkillCodes.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMLaborSkillCode VALUES (?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.LaborSkillCode,element.Description,element.BillingRate,element.Discount,element.TaxClass,element.Hash]]);
    });
    allModel.natureOfTasks.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMNatureOfTask VALUES (?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.NatureOfTask, element.TypeCode, element.Description, element.Question1, element.Question2, element.Question3, element.Question4, element.Question5, element.Hash]]);
    });
    allModel.priceCodes.forEach(element=>{
      sqlCommand.push(['INSERT INTO IMPriceCode VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.PriceCodeRecord, element.PriceCode, element.ItemCode, element.CustomerPriceLevel, element.ARDivisionNo, element.CustomerNo, element.PricingMethod, element.BreakQuantity1, element.BreakQuantity2, element.BreakQuantity3, element.BreakQuantity4, element.BreakQuantity5, element.DiscountMarkup1, element.DiscountMarkup2, element.DiscountMarkup3, element.DiscountMarkup4, element.DiscountMarkup5, element.Hash]]);
    })
    allModel.priceLevels.forEach(element=>{
      sqlCommand.push(['INSERT INTO ARPriceLevelByCustomer VALUES (?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ARDivisionNo, element.CustomerNo, element.ProductLine, element.PriceCode, element.ShipToCode, element.EffectiveDate, element.EndDate, element.Hash]]);
    });
    allModel.customerTechLaborSkillRates.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMCustomerTechLaborSkillRate VALUES (?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ARDivisionNo, element.CustomerNo, element.ContractNo, element.TechnicianCode, element.Type, element.LaborCode, element.SkillCode, element.BillingRate, element.Hash]]);
    });
    allModel.coverageCodes.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMCoverageCode VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.CoverageCode, element.Description, element.WorkdaysOnly, element.OpenTime1, element.CloseTime1, element.OpenTime2, element.CloseTime2, element.OpenTime3, element.CloseTime3, element.OpenTime4, element.CloseTime4, element.OpenTime5, element.CloseTime5, element.OpenTime6, element.CloseTime6, element.OpenTime7, element.CloseTime7, element.Hash]]);
    })
    sqlCommand.push(['INSERT INTO SMTechnician VALUES (?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,allModel.technician.TechnicianCode, allModel.technician.LastName, allModel.technician.FirstName, allModel.technician.LaborCost, allModel.technician.BillingRate, allModel.technician.Delivery, allModel.technician.Hash]]);
    allModel.workingDaysDetails.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMWorkingDaysDetail VALUES (?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.Year, element.LineKey, element.LineSeqNo, element.Day, element.Description, element.WorkDay, element.Hash]]);
    });
    allModel.dispatchesPayments.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMDispatchDataPayment VALUES (?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskDispatchNo, element.PaymentSeqNo, element.PaymentType, element.PaymentTypeCategory, element.CreditCardID, element.Last4UnencryptedCreditCardNos, element.TransactionAmt, element.Hash]]);
    });
    allModel.tasksPayments.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMTaskDataPayment VALUES (?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.PaymentSeqNo, element.PaymentType, element.PaymentTypeCategory, element.CreditCardID, element.Last4UnencryptedCreditCardNos, element.TransactionAmt, element.Hash]]);
    });
    allModel.taskStatuses.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMTaskDispatchStatus VALUES (?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode, element.StatusCode, element.Description, element.RedDispatchColor, element.GreenDispatchColor, element.BlueDispatchColor, element.Hash]]);
    });
    allModel.taskTypes.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMTaskType VALUES (?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TypeCode, element.Description, element.DeliveryType, element.Hash]]);
    });
    allModel.documents.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMTaskAttachment VALUES (?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.Name,element.Data, 0]]);
    });
    allModel.tasksInfo.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMTask VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.TaskDate, element.TaskTime, element.TaskType, element.ARDivisionNo, element.CustomerNo, element.CustomerPONo, element.ContractNo, element.TaxSchedule, element.ScheduledDate, element.DocumentsPath, element.Route, element.NumberOfVisit, element.TaskStatus, element.TaskDescription, element.ExtendedDescriptionText, element.BillToName, element.BillToAddress, element.BillToCity, element.BillToState, element.BillToZipCode, element.ShipToCode, element.ShipToName, element.ShipToAddress, element.ShipToCity, element.ShipToState, element.ShipToZipCode, element.CreditLimit, element.OpenOrderAmt, element.ArBalance, element.OverBy, element.PriceLevel, element.TermsCode, element.TermsCodeDesc, element.NatureOfTask, element.NatureOfTaskAnswer1, element.NatureOfTaskAnswer2, element.NatureOfTaskAnswer3, element.NatureOfTaskAnswer4, element.NatureOfTaskAnswer5, element.BillToDivisionNo, element.BillToCustomerNo, element.DepositAmt, element.PaymentTypeCategory, element.CoverageCode,element.AR068_SMPLaborTaxCalculate,element.SO068_SMPLaborTaxCalculate, element.Hash, RowStates.UNCHANGED]]);
    });
    allModel.dispatches.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMDispatchHeader VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.DispatchNo, element.DispatchDate, element.TechnicianCode, element.Customer.split('-')[0], element.Customer.split('-')[1], element.StartDate, element.StartTime, element.EndDate, element.EndTime, element.StatusCode, element.TaskDescription, element.ContractNo, element.ShipToName, element.ShipToAddress, element.TaxableAmt, element.NonTaxableAmt, element.DispatchTotal, element.DiscountRate, element.DiscountAmt, element.FreightAmt, element.SalesTaxAmt, element.Manufacturing?1:0, element.CommitQty?1:0, element.MachineCode, element.EquipmentItemNo, element.DispatchContractNo, element.DateUpdated, element.TimeUpdated, element.PaymentType, element.CheckNoForDeposit, element.OtherPaymentTypeRefNo, element.DepositAmt, element.PaymentTypeCategory, element.Hash, 0]]);
    });
    allModel.dispatchesDetails.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMDispatchDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode, element.TaskNo, element.DispatchNo, element.ItemCode, element.LineSeqNo, element.LineKey, element.ItemCodeDesc, element.ExtendedDescriptionKey, element.ExtendedDescriptionText, element.WarehouseCode, element.Discount, element.TaxClass, element.UnitOfMeasureConvFactor, element.ProductLine, element.CommentText, element.QuantityOrdered, element.UnitPrice, element.PriceLevel, element.ExtensionAmt, element.ItemType,element.LineDiscountPercent, element.Hash, 0]]);
    })
    allModel.dispatchesLabors.forEach(element=>{
      sqlCommand.push(['INSERT INTO SMDispatchDetailLabor VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.DispatchNo, element.LaborSkillCode, element.LineSeqNo, element.LineKey, element.LineDesc, element.ExtendedDescriptionKey, element.ExtendedDescriptionText,element.LaborCommentText, element.HoursSpent, element.BillingRate, element.ExtensionAmt, element.TaxClass, element.OvertimeStartDate, element.OvertimeStartTime,element.LineDiscountPercent,element.Hash,0 ]]);
    });
    allModel.taxRates.forEach(element => {
      sqlCommand.push(['INSERT INTO SMTaxRate VALUES (?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.ARDivisionNo,element.CustomerNo,element.TaxSchedule,element.TaxRate,element.TaxRateDetails,element.IsTaxable?1:0,element.Hash]]);  
    });
    allModel.nextDeliveries.forEach(element =>{
      sqlCommand.push(['DELETE FROM SMDeliveryDetail WHERE CompanyCode =? AND TaskNo=? AND DispatchNo=? AND LineKey=?',[allModel.companyInfo.CompanyCode,element.TaskNo,element.DispatchNo,element.LineKey]]);
      sqlCommand.push(['INSERT INTO SMDeliveryDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.DispatchNo,element.ItemCode, element.ScheduledDate, element.Customer, element.LineSeqNo, element.LineKey, element.ItemCodeDesc, element.ExtendedDescriptionKey, element.ExtendedDescriptionText, element.WarehouseCode, element.Discount, element.TaxClass, element.UnitOfMeasureConvFactor, element.ProductLine, element.CommentText, element.QuantityOrdered, element.UnitPrice, element.PriceLevel, element.ExtensionAmt, element.ItemType, element.LineDiscountPercent, element.Hash]]);
    });
    allModel.lastDeliveries.forEach(element =>{
      sqlCommand.push(['DELETE FROM SMDeliveryDetail WHERE CompanyCode =? AND TaskNo=? AND DispatchNo=? AND LineKey=?',[allModel.companyInfo.CompanyCode,element.TaskNo,element.DispatchNo,element.LineKey]]);
      sqlCommand.push(['INSERT INTO SMDeliveryDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode,element.TaskNo, element.DispatchNo,element.ItemCode, element.ScheduledDate, element.Customer, element.LineSeqNo, element.LineKey, element.ItemCodeDesc, element.ExtendedDescriptionKey, element.ExtendedDescriptionText, element.WarehouseCode, element.Discount, element.TaxClass, element.UnitOfMeasureConvFactor, element.ProductLine, element.CommentText, element.QuantityOrdered, element.UnitPrice, element.PriceLevel, element.ExtensionAmt, element.ItemType, element.LineDiscountPercent, element.Hash]]);
    });
    allModel.dispatchDesc.forEach(element => {
      sqlCommand.push(['INSERT INTO CIExtendedDescription VALUES (?,?,?,?,?,?)',[allModel.companyInfo.CompanyCode, element.TaskNo, element.DispatchNo, element.DispatchDescription, element.ExtendedDescriptionKey, element.ExtendedDescriptionText]]);
    });
    
    //sqlCommand.push(['INSERT INTO table_name VALUES (?,?,?,?,?,?,?,?,?,?,)',[allModel.companyInfo.CompanyCode, ]]);
    this._db.sqlBatch(sqlCommand, function() {
      success('Data for Offline mode inserted into database.');
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  InitializeTables() {
    this._db.sqlBatch(
      [
        "CREATE TABLE IF NOT EXISTS AROptions (CompanyCode NVARCHAR(30),DefaultCustPricingSetting TINYINT,Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS AROptionsKey ON AROptions (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS BMOptions (CompanyCode NVARCHAR(30),UseOptionBills TINYINT,BMIntegrated TINYINT,Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS BMOptionsKey ON BMOptions (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS CIOptions (CompanyCode NVARCHAR(30),NumberOfDecimalPlacesInPrice INT,NumberOfDecimalPlacesInQty INT,Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS CIOptionsKey ON CIOptions (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS SMOptions (CompanyCode NVARCHAR(30),LaborBillingPresentation NVARCHAR(1),MiscellaneousItemCode NVARCHAR(30),ProductLine NVARCHAR(30),OrderInItemNo NVARCHAR(30),CalculateTaxesOnLabor NVARCHAR(1),SpentHoursRounding NVARCHAR(1),SpentHoursPrecisionInMinutes NVARCHAR(2),MinimumBillingTime NVARCHAR(2),BillingRateCalcPriorityHigh NVARCHAR(1),BillingRateCalcPriorityMiddle NVARCHAR(1),BillingRateCalcPriorityLowest NVARCHAR(1),UseOvertimeCalculationForLab TINYINT,ApplyDispDateTimeToLabor NVARCHAR(1),DisplayCustomerARInfoOnMobile TINYINT,HideAmountFields TINYINT,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMOptionsKey ON SMOptions (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS SOOptions (CompanyCode NVARCHAR(30),EnableDefaultPriceLevelByCust TINYINT,BaseNewPriceLevelRecordsOn NVARCHAR(1),AllowDiscountRate TINYINT,Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SOOptionsKey ON SOOptions (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS ARBillToSoldTo (CompanyCode NVARCHAR(30),SoldToDivisionNo NVARCHAR(30),SoldToCustomerNo NVARCHAR(30),BillToDivisionNo NVARCHAR(30),BillToCustomerNo NVARCHAR(30),CustomerPricing NVARCHAR(1),Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ARBillToSoldToKey ON ARBillToSoldTo (CompanyCode,SoldToDivisionNo,SoldToCustomerNo)",
        "CREATE TABLE IF NOT EXISTS ARPaymentType (CompanyCode NVARCHAR(30),PaymentType NVARCHAR(30),PaymentDesc NVARCHAR(255),PaymentMethod NVARCHAR(1),Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ARPaymentTypeKey ON ARPaymentType (CompanyCode,PaymentType)",
        "CREATE TABLE IF NOT EXISTS BMBillHeader (CompanyCode NVARCHAR(30),BillNo NVARCHAR(30),Revision NVARCHAR(30),CurrentBillRevision NVARCHAR(30),BillHasOptions TINYINT,Hash NUMERIC)",
        "CREATE UNIQUE INDEX IF NOT EXISTS BMBillHeaderKey on BMBillHeader (CompanyCode,BillNo,Revision)",
        "CREATE TABLE IF NOT EXISTS BMBillOptionHeader (CompanyCode NVARCHAR(30),BillNo NVARCHAR(30),Revision NVARCHAR(30),BillOptionCategory NVARCHAR(30),BillOption NVARCHAR(30),OptionDesc1 NVARCHAR(255),OptionDesc2 NVARCHAR(255),DrawingNo NVARCHAR(30),DrawingRevision NVARCHAR(30),DateLastUsed DATETIME, RoutingNo NVARCHAR(30), WorkOrderStepNo NVARCHAR(30),MaximumLotSize DECIMAL(19,6),OptionPrice DECIMAL(19,6),YieldPercent DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS BMBillOptionHeaderKey on BMBillOptionHeader (CompanyCode,BillNo,Revision,BillOptionCategory,BillOption)",
        "CREATE TABLE IF NOT EXISTS BMBillOptionCategory (CompanyCode NVARCHAR(30),BillNo NVARCHAR(30),Revision NVARCHAR(30),BillOptionCategory1Desc NVARCHAR(255),BillOptionCategory2Desc NVARCHAR(255),BillOptionCategory3Desc NVARCHAR(255),BillOptionCategory4Desc NVARCHAR(255),BillOptionCategory5Desc NVARCHAR(255),BillOptionCategory6Desc NVARCHAR(255),BillOptionCategory7Desc NVARCHAR(255),BillOptionCategory8Desc NVARCHAR(255),BillOptionCategory9Desc NVARCHAR(255),BillOption1Required TINYINT,BillOption2Required TINYINT,BillOption3Required TINYINT,BillOption4Required TINYINT,BillOption5Required TINYINT,BillOption6Required TINYINT,BillOption7Required TINYINT,BillOption8Required TINYINT,BillOption9Required TINYINT,Hash Int)",
        "CREATE UNIQUE INDEX IF NOT EXISTS BMBillOptionCategoryKey on BMBillOptionCategory (CompanyCode,BillNo,Revision)",
        "CREATE TABLE IF NOT EXISTS SYCompany (CompanyCode NVARCHAR(30),CompanyName NVARCHAR(30),Address1 NVARCHAR(30),Address2 NVARCHAR(30),Address3 NVARCHAR(30),Address4 NVARCHAR(30),EmailAddress NVARCHAR(30),Phone NVARCHAR(30),ExternalAccess TINYINT,Hash Int)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SYCompanyKey on SYCompany (CompanyCode)",
        "CREATE TABLE IF NOT EXISTS CIItem (CompanyCode NVARCHAR(30),ItemCode NVARCHAR(30),ItemCodeDesc NVARCHAR(30),StandardUnitPrice DECIMAL(19,6),StandardUnitCost DECIMAL(19,6),LastTotalUnitCost DECIMAL(19,6),ItemType NVARCHAR(1),TaxClass NVARCHAR(2),PriceCode NVARCHAR(30),ProductLine NVARCHAR(30),AllowTradeDiscount TINYINT, SalesUMConvFctr DECIMAL(19,6),SalesPromotionCode NVARCHAR(30),SaleStartingDate DATETIME, SaleEndingDate DATETIME, SaleMethod NVARCHAR(30),SalesPromotionDiscountPercent DECIMAL(19,6),SalesPromotionPrice DECIMAL(19,6),Hash Int)",
        "CREATE UNIQUE INDEX IF NOT EXISTS CIItemKey on CIItem (CompanyCode,ItemCode)",
        "CREATE TABLE IF NOT EXISTS ARCustomerCreditCard (CompanyCode NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30), CreditCardID NVARCHAR(30),ExpirationDateYear NVARCHAR(30),ExpirationDateMonth NVARCHAR(30),PaymentType NVARCHAR(30),CardType NVARCHAR(30),Last4UnencryptedCreditCardNos NVARCHAR(4),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ARCustomerCreditCardKey on ARCustomerCreditCard (CompanyCode,ARDivisionNo,CustomerNo,CreditCardID)",
        "CREATE TABLE IF NOT EXISTS SMContractHeader (CompanyCode NVARCHAR(30),ContractNo NVARCHAR(30),ContractDescription NVARCHAR(255),ContractDate DATETIME,AllCoveredMaterials TINYINT,AllCoveredLabors TINYINT,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMContractHeaderKey on SMContractHeader (CompanyCode,ContractNo)",
        "CREATE TABLE IF NOT EXISTS SMContractDetail (CompanyCode NVARCHAR(30),ContractNo NVARCHAR(30),LineKey NVARCHAR(30),LineSeqNo NVARCHAR(30),ItemLaborSkillCode NVARCHAR(30),LotSerialNo NVARCHAR(30),LineType NVARCHAR(30),ExpirationDate DATETIME,LineDescription NVARCHAR(255),ExtendedDescriptionKey NVARCHAR(30),Valuation NVARCHAR(30),UnitOfMeasure NVARCHAR(30), PricingMethod NVARCHAR(1),CommentText NVARCHAR(255),UnitOfMeasureConvFactor DECIMAL(19,6),LineDiscountPercent DECIMAL(19,6),OverridePrice DECIMAL(19,6),PriceOff DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMContractDetailKey on SMContractDetail (CompanyCode,ContractNo,LineKey)",
        "CREATE TABLE IF NOT EXISTS SMLaborSkillCode (CompanyCode NVARCHAR(30),LaborSkillCode NVARCHAR(30),Description NVARCHAR(255),BillingRate DECIMAL(19,6),Discount TINYINT,TaxClass NVARCHAR(2),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMLaborSkillCodeKey on SMLaborSkillCode (CompanyCode,LaborSkillCode)",
        "CREATE TABLE IF NOT EXISTS SMNatureOfTask (CompanyCode NVARCHAR(30),NatureOfTask NVARCHAR(30),TypeCode NVARCHAR(30),Description NVARCHAR(30),Question1 NVARCHAR(30),Question2 NVARCHAR(30),Question3 NVARCHAR(30),Question4 NVARCHAR(30),Question5 NVARCHAR(30),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMNatureOfTaskKey on SMNatureOfTask (CompanyCode,NatureOfTask,TypeCode)",
        "CREATE TABLE IF NOT EXISTS IMPriceCode (CompanyCode NVARCHAR(30),PriceCodeRecord NVARCHAR(30),PriceCode NVARCHAR(30),ItemCode NVARCHAR(30),CustomerPriceLevel NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),PricingMethod NVARCHAR(1),BreakQuantity1 DECIMAL(19,6),BreakQuantity2 DECIMAL(19,6),BreakQuantity3 DECIMAL(19,6),BreakQuantity4 DECIMAL(19,6),BreakQuantity5 DECIMAL(19,6),DiscountMarkup1 DECIMAL(19,6),DiscountMarkup2 DECIMAL(19,6),DiscountMarkup3 DECIMAL(19,6),DiscountMarkup4 DECIMAL(19,6),DiscountMarkup5 DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS IMPriceCodeKey on IMPriceCode (CompanyCode,PriceCodeRecord,PriceCode,ItemCode,CustomerPriceLevel,ARDivisionNo,CustomerNo)",
        "CREATE TABLE IF NOT EXISTS ARPriceLevelByCustomer (CompanyCode NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),ProductLine NVARCHAR(30),PriceCode NVARCHAR(30),ShipToCode NVARCHAR(30),EffectiveDate DATETIME,EndDate DATETIME,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ARPriceLevelByCustomerKey on ARPriceLevelByCustomer (CompanyCode,ARDivisionNo,CustomerNo,ProductLine,PriceCode,ShipToCode,EffectiveDate)",
        "CREATE TABLE IF NOT EXISTS SMCustomerTechLaborSkillRate (CompanyCode NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),ContractNo NVARCHAR(30),TechnicianCode NVARCHAR(30),Type NVARCHAR(30),LaborCode NVARCHAR(30),SkillCode NVARCHAR(30),BillingRate DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMCustomerTechLaborSkillRateKey on SMCustomerTechLaborSkillRate (CompanyCode,ARDivisionNo,CustomerNo,ContractNo,TechnicianCode,Type,LaborCode,SkillCode)",
        "CREATE TABLE IF NOT EXISTS SMCoverageCode (CompanyCode NVARCHAR(30),CoverageCode NVARCHAR(30), Description NVARCHAR(255),WorkdaysOnly NVARCHAR(30),OpenTime1 DECIMAL(19,6),CloseTime1 DECIMAL(19,6),OpenTime2 DECIMAL(19,6),CloseTime2 DECIMAL(19,6),OpenTime3 DECIMAL(19,6),CloseTime3 DECIMAL(19,6),OpenTime4 DECIMAL(19,6),CloseTime4 DECIMAL(19,6),OpenTime5 DECIMAL(19,6),CloseTime5 DECIMAL(19,6),OpenTime6 DECIMAL(19,6),CloseTime6 DECIMAL(19,6),OpenTime7 DECIMAL(19,6),CloseTime7 DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMCoverageCodeKey on SMCoverageCode (CompanyCode,CoverageCode)",
        "CREATE TABLE IF NOT EXISTS SMTechnician (CompanyCode NVARCHAR(30),TechnicianCode NVARCHAR(30),LastName NVARCHAR(30),FirstName NVARCHAR(30),LaborCost DECIMAL(19,6),BillingRate DECIMAL(19,6),Delivery TINYINT,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTechnicianKey on SMTechnician (CompanyCode,TechnicianCode)",
        "CREATE TABLE IF NOT EXISTS SMWorkingDaysDetail (CompanyCode NVARCHAR(30),Year NVARCHAR(30),LineKey NVARCHAR(30),LineSeqNo NVARCHAR(30),Day NVARCHAR(30),Description NVARCHAR(255),WorkDay NVARCHAR(30),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMWorkingDaysDetailKey on SMWorkingDaysDetail (CompanyCode,Year,LineKey)",
        "CREATE TABLE IF NOT EXISTS SMDispatchDataPayment (CompanyCode NVARCHAR(30),TaskDispatchNo NVARCHAR(30),PaymentSeqNo NVARCHAR(30),PaymentType NVARCHAR(30),PaymentTypeCategory NVARCHAR(30),CreditCardID NVARCHAR(30),Last4UnencryptedCreditCardNos NVARCHAR(4),TransactionAmt DECIMAL(30),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMDispatchDataPaymentKey on SMDispatchDataPayment (CompanyCode,TaskDispatchNo,PaymentSeqNo)",
        "CREATE TABLE IF NOT EXISTS SMTaskDataPayment (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),PaymentSeqNo NVARCHAR(30),PaymentType NVARCHAR(30),PaymentTypeCategory NVARCHAR(30),CreditCardID NVARCHAR(30),Last4UnencryptedCreditCardNos NVARCHAR(4),TransactionAmt DECIMAL(30),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaskDataPaymentKey on SMTaskDataPayment (CompanyCode,TaskNo,PaymentSeqNo)",
        "CREATE TABLE IF NOT EXISTS SMTaskDispatchStatus (CompanyCode NVARCHAR(30),StatusCode NVARCHAR(30),Description NVARCHAR(255),RedDispatchColor NVARCHAR(10),GreenDispatchColor NVARCHAR(10),BlueDispatchColor NVARCHAR(10),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaskDispatchStatusKey on SMTaskDispatchStatus (CompanyCode,StatusCode)",
        "CREATE TABLE IF NOT EXISTS SMTaskAttachment (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),Name NVARCHAR(255),Data BLOB, State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaskAttachmentKey on SMTaskAttachment (CompanyCode,TaskNo,Name)",
        "CREATE TABLE IF NOT EXISTS SMTaskType (CompanyCode NVARCHAR(30),TypeCode NVARCHAR(30),Description NVARCHAR(255),DeliveryType TINYINT,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaskTypeKey on SMTaskType (CompanyCode,TypeCode)",
        "CREATE TABLE IF NOT EXISTS SMTask (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),TaskDate DATETIME,TaskTime DECIMAL(19,6),TaskType NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),CustomerPONo NVARCHAR(30),ContractNo NVARCHAR(30),TaxSchedule NVARCHAR(30),ScheduledDate DATETIME,DocumentsPath NVARCHAR(255),Route NVARCHAR(30),NumberOfVisit NVARCHAR(30),TaskStatus NVARCHAR(30),TaskDescription NVARCHAR(255),ExtendedDescriptionText NVARCHAR(255),BillToName NVARCHAR(30),BillToAddress NVARCHAR(100),BillToCity NVARCHAR(30),BillToState NVARCHAR(30),BillToZipCode NVARCHAR(30),ShipToCode NVARCHAR(30),ShipToName NVARCHAR(30),ShipToAddress NVARCHAR(100),ShipToCity NVARCHAR(30),ShipToState NVARCHAR(30),ShipToZipCode NVARCHAR(30),CreditLimit DECIMAL(19,6),OpenOrderAmt DECIMAL(19,6),ArBalance DECIMAL(19,6),OverBy DECIMAL(19,6),PriceLevel NVARCHAR(30),TermsCode NVARCHAR(30),TermsCodeDesc NVARCHAR(255),NatureOfTask NVARCHAR(30),NatureOfTaskAnswer1 NVARCHAR(255),NatureOfTaskAnswer2 NVARCHAR(255),NatureOfTaskAnswer3 NVARCHAR(255),NatureOfTaskAnswer4 NVARCHAR(255),NatureOfTaskAnswer5 NVARCHAR(255),BillToDivisionNo NVARCHAR(30),BillToCustomerNo NVARCHAR(30),DepositAmt DECIMAL(19,6),PaymentTypeCategory NVARCHAR(30),CoverageCode NVARCHAR(30),AR068_SMPLaborTaxCalculate TINYINT,SO068_SMPLaborTaxCalculate TINYINT,Hash INT,State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaskKey on SMTask (CompanyCode,TaskNo)",
        "CREATE TABLE IF NOT EXISTS SMDispatchHeader (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),DispatchNo NVARCHAR(30),DispatchDate DATETIME,TechnicianCode NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),StartDate DATETIME,StartTime DECIMAL(19,6),EndDate DATETIME, EndTime DECIMAL(19,6),StatusCode NVARCHAR(30),TaskDescription NVARCHAR(255),ContractNo NVARCHAR(30),ShipToName NVARCHAR(30),ShipToAddress NVARCHAR(30),TaxableAmt DECIMAL(19,6),NonTaxableAmt DECIMAL(19,6),DispatchTotal DECIMAL(19,6),DiscountRate DECIMAL(19,6),DiscountAmt DECIMAL(19,6),FreightAmt DECIMAL(19,6),SalesTaxAmt DECIMAL(19,6),Manufacturing TINYINT,CommitQty TINYINT, MachineCode NVARCHAR(30),EquipmentItemNo NVARCHAR(30),DispatchContractNo NVARCHAR(30),DateUpdated DATETIME,TimeUpdated DECIMAL(19,6),PaymentType NVARCHAR(30),CheckNoForDeposit NVARCHAR(30),OtherPaymentTypeRefNo NVARCHAR(30),DepositAmt DECIMAL(19,6),PaymentTypeCategory NVARCHAR(30),Hash INT, State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMDispatchHeaderKey on SMDispatchHeader (CompanyCode,TaskNo,DispatchNo)",
        "CREATE TABLE IF NOT EXISTS SMDispatchDetail (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),DispatchNo NVARCHAR(30),ItemCode NVARCHAR(30),LineSeqNo NVARCHAR(30),LineKey NVARCHAR(30),ItemCodeDesc NVARCHAR(255),ExtendedDescriptionKey NVARCHAR(30),ExtendedDescriptionText NVARCHAR(255),WarehouseCode NVARCHAR(30),Discount TINYINT,TaxClass NVARCHAR(2),UnitOfMeasureConvFactor DECIMAL(19,6),ProductLine NVARCHAR(30),CommentText NVARCHAR(255),QuantityOrdered DECIMAL(19,6),UnitPrice DECIMAL(19,6),PriceLevel NVARCHAR(30),ExtensionAmt DECIMAL(19,6),ItemType NVARCHAR(30),LineDiscountPercent DECIMAL(19,6),Hash INT,State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMDispatchDetailKey on SMDispatchDetail (CompanyCode,TaskNo,DispatchNo,LineKey)",
        "CREATE TABLE IF NOT EXISTS SMDispatchDetailLabor (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),DispatchNo NVARCHAR(30),LaborSkillCode NVARCHAR(30),LineSeqNo NVARCHAR(30),LineKey NVARCHAR(30),LineDesc NVARCHAR(255),ExtendedDescriptionKey NVARCHAR(30),ExtendedDescriptionText NVARCHAR(255),LaborCommentText NVARCHAR(255),HoursSpent DECIMAL(19,6),BillingRate DECIMAL(19,6),ExtensionAmt DECIMAL(19,6),TaxClass NVARCHAR(2),OvertimeStartDate DATETIME,OvertimeStartTime DECIMAL(19,6),LineDiscountPercent DECIMAL(19,6),Hash INT,State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMDispatchDetailLaborKey on SMDispatchDetailLabor (CompanyCode,TaskNo,DispatchNo,LineKey)",
        "CREATE TABLE IF NOT EXISTS OfflineModifications (CompanyCode NVARCHAR(30),TableName NVARCHAR(255),RecordKey NVARCHAR(255),State INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS OfflineModificationsKey on OfflineModifications (CompanyCode,TableName,RecordKey)",
        "CREATE TABLE IF NOT EXISTS SMTaxRate (CompanyCode NVARCHAR(30),ARDivisionNo NVARCHAR(30),CustomerNo NVARCHAR(30),TaxSchedule NVARCHAR(30),ReturnTaxRate DECIMAL(19,6),ReturnTaxRateDetails NVARCHAR(255),IsTaxable TINYINT,Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMTaxRateKey on SMTaxRate (CompanyCode,ARDivisionNo,CustomerNo,TaxSchedule)", 
        "CREATE TABLE IF NOT EXISTS SMDeliveryDetail (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),DispatchNo NVARCHAR(30),ItemCode NVARCHAR(30),ScheduledDate DATETIME,Customer NVARCHAR(30),LineSeqNo NVARCHAR(30),LineKey NVARCHAR(30),ItemCodeDesc NVARCHAR(255),ExtendedDescriptionKey NVARCHAR(30),ExtendedDescriptionText NVARCHAR(255),WarehouseCode NVARCHAR(30),Discount TINYINT,TaxClass NVARCHAR(2),UnitOfMeasureConvFactor DECIMAL(19,6),ProductLine NVARCHAR(30),CommentText NVARCHAR(30),QuantityOrdered DECIMAL(19,6),UnitPrice DECIMAL(19,6),PriceLevel NVARCHAR(30),ExtensionAmt DECIMAL(19,6),ItemType NVARCHAR(30),LineDiscountPercent DECIMAL(19,6),Hash INT)",
        "CREATE UNIQUE INDEX IF NOT EXISTS SMDeliveryDetailKey on SMDeliveryDetail (CompanyCode,TaskNo,DispatchNo,LineKey)",
        "CREATE TABLE IF NOT EXISTS CIExtendedDescription (CompanyCode NVARCHAR(30),TaskNo NVARCHAR(30),DispatchNo NVARCHAR(30),DispatchDescription NVARCHAR(255),ExtendedDescriptionKey NVARCHAR(30),ExtendedDescriptionText NVARCHAR(255))",
        "CREATE UNIQUE INDEX IF NOT EXISTS CIExtendedDescriptionKey on CIExtendedDescription (CompanyCode,TaskNo,DispatchNo)"
      ],
      function() {
        console.log("Database table created.");
      },
      function(error) {
        console.log("SQL batch ERROR: " + error.message);
      }
    );
  }
  GetARBillToSoldTos(success,error){
    this._db.executeSql('SELECT * FROM ARBillToSoldTo', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });    
  }
  GetAROptions(success,error){
    this._db.executeSql('SELECT * FROM AROptions', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });    
  }
  GetBMBillHeaders(success,error){
    this._db.executeSql('SELECT * FROM BMBillHeader', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchDescriptions(success, error) {
    this._db.executeSql('SELECT * FROM CIExtendedDescription', [], 
    function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }),
    function() {
      error(err.message);
    }
  }
  GetBMBillOptionCategories(success,error){
    this._db.executeSql('SELECT * FROM BMBillOptionCategory', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });    
  }
  GetBMBillOptionHeaders(success,error){
    this._db.executeSql('SELECT * FROM BMBillOptionHeader', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetBMOptions(success,error){
    this._db.executeSql('SELECT * FROM BMOptions', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetCIItems(success,error){
    this._db.executeSql('SELECT * FROM CIItem', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetCIOptions(success,error){
    this._db.executeSql('SELECT * FROM CIOptions', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetCompanyInfo(success,error){
    this._db.executeSql('SELECT * FROM SYCompany', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetCoverageCodes(success,error){
    this._db.executeSql('SELECT * FROM SMCoverageCode', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetCustomerCreditCards(arDivisionNo,customerNo,success,error){
    this._db.executeSql('SELECT * FROM ARCustomerCreditCard WHERE ARDivisionNo=? AND CustomerNo=?', [arDivisionNo,customerNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetCustomerTechLaborSkillRate(success,error){
    this._db.executeSql('SELECT * FROM SMCustomerTechLaborSkillRate', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatch(taskNo,dispatchNo,success,error){
    this._db.executeSql('SELECT * FROM SMDispatchHeader WHERE TaskNo=? AND DispatchNo=?', [taskNo,dispatchNo], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchForSync(taskNo,dispatchNo){
    return new Promise(function(resolve,reject){
      dbEngine._db.executeSql('SELECT * FROM SMDispatchHeader WHERE TaskNo=? AND DispatchNo=?', [taskNo,dispatchNo], function(rs) {
        resolve(rs.rows.item(0));
      }, function(err) {
        reject(err.message);
      });
    })
  }
  GetDispatchDetailForSync(taskNo,dispatchNo,lineKey){
    return new Promise(function(resolve,reject){
      dbEngine._db.executeSql('SELECT * FROM SMDispatchDetail WHERE TaskNo=? AND DispatchNo=? AND LineKey=?', [taskNo,dispatchNo,lineKey], function(rs) {
        resolve(rs.rows.item(0));
      }, function(err) {
        reject(err.message);
      });
    });
  }
  GetDispatchDetail(taskNo,dispatchNo,lineKey,success,error){
    this._db.executeSql('SELECT * FROM SMDispatchDetail WHERE TaskNo=? AND DispatchNo=? AND LineKey=? AND State<>?', [taskNo,dispatchNo,lineKey,RowStates.DELETED], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchDetails(taskNo,dispatchNo,success,error){
    this._db.executeSql('SELECT * FROM SMDispatchDetail WHERE TaskNo=? AND DispatchNo=? AND State<>?', [taskNo,dispatchNo,RowStates.DELETED], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatches(success,error){
    this._db.executeSql('SELECT * FROM SMDispatchHeader', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchDetailLaborForSync(taskNo, dispatchNo,lineKey){
    return new Promise(function(resolve,reject){
      dbEngine._db.executeSql('SELECT * FROM SMDispatchDetailLabor WHERE TaskNo=? AND DispatchNo=? AND LineKey=?', [taskNo,dispatchNo,lineKey], function(rs) {
        resolve(rs.rows.item(0));
      }, function(err) {
        reject(err.message);
      });
    });
  }
  GetDispatchDetailLabor(taskNo, dispatchNo,lineKey, success, error){
    this._db.executeSql('SELECT * FROM SMDispatchDetailLabor WHERE TaskNo=? AND DispatchNo=? AND LineKey=? AND State<>?', [taskNo,dispatchNo,lineKey,RowStates.DELETED], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchDetailLabors(taskNo, dispatchNo, success, error){
    this._db.executeSql('SELECT * FROM SMDispatchDetailLabor WHERE TaskNo=? AND DispatchNo=? AND State<>?', [taskNo,dispatchNo,RowStates.DELETED], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetDispatchPayments(taskDispatchNo,success,error){
    this._db.executeSql('SELECT * FROM SMDispatchDataPayment WHERE TaskDispatchNo=?', [taskDispatchNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetLaborSkillCodes(success,error){
    this._db.executeSql('SELECT * FROM SMLaborSkillCode', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetNextLineNbr(taskNo,dispatchNo,forLabor)
  {
    return new Promise( function( resolve, reject ) {
      if(!forLabor)
      {
        dbEngine._db.executeSql("SELECT Max(LineKey) as LastNbr FROM SMDispatchDetail  WHERE TaskNo=? AND DispatchNo=?", [taskNo,dispatchNo], function(rs) {
          var lastNbr = rs.rows.item(0).LastNbr;       
          if(lastNbr)
          {
            resolve('000000'+(parseInt(lastNbr)+1));
          }
          else
          resolve(null);
        }, function(err) {
          reject(err);
        });
      }
      else
      {
        dbEngine._db.executeSql("SELECT Max(LineKey) as LastNbr FROM SMDispatchDetailLabor WHERE TaskNo=? AND DispatchNo=?", [taskNo,dispatchNo], function(rs) {
          var lastNbr = rs.rows.item(0).LastNbr;       
          if(lastNbr)
          {
              resolve('000000'+(parseInt(lastNbr)+1));
          }
          else
            resolve(null);
        }, function(err) {
          reject(err);
        });
      }
    });
  }
  GetNextDeliveries(customer,scheduledDate,taskNo,success,error)
  {
    this._db.executeSql('SELECT * FROM SMDeliveryDetail WHERE Customer=? AND (date(ScheduledDate) > ? OR (date(ScheduledDate) = ? AND TaskNo > ?)) ORDER BY ScheduledDate ASC,TaskNo ASC', [customer,scheduledDate,scheduledDate,taskNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetLastDeliveries(customer,scheduledDate,taskNo,success,error)
  {
    this._db.executeSql('SELECT * FROM SMDeliveryDetail WHERE Customer=? AND (date(ScheduledDate) < ? OR (date(ScheduledDate) = ?  AND TaskNo < ?)) ORDER BY ScheduledDate DESC,TaskNo DESC', [customer,scheduledDate,scheduledDate,taskNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetModifiedRecordsCount(success,error){
    this._db.executeSql('SELECT COUNT(*) as Count FROM OfflineModifications', [], function(rs) {
      success(rs.rows.item(0).Count);
    }, function(err) {
      error(err.message);
    });
  }
  GetModifiedRecordsList(success,error)
  {
    this._db.executeSql('SELECT * FROM OfflineModifications', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetNatureOfTasks(success,error){
    this._db.executeSql('SELECT * FROM SMNatureOfTask', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetPaymentTypes(success,error){
    this._db.executeSql('SELECT * FROM ARPaymentType', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetPriceCodes(success,error){
    this._db.executeSql('SELECT * FROM IMPriceCode', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetPriceLevels(success,error){
    this._db.executeSql('SELECT * FROM ARPriceLevelByCustomer', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetSMOptions(success,error){
    this._db.executeSql('SELECT * FROM SMOptions', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetSOOptions(success,error){
    this._db.executeSql('SELECT * FROM SOOptions', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskAttachment(taskNo,fileName,success,error){
    this._db.executeSql('SELECT * FROM SMTaskAttachment WHERE TaskNo=? AND Name=? AND State<>?', [taskNo,fileName,RowStates.DELETED], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskAttachmentForSync(taskNo,fileName){
    return new Promise(function(resolve,reject){
      dbEngine._db.executeSql('SELECT * FROM SMTaskAttachment WHERE TaskNo=? AND Name=? AND State<>?', [taskNo,fileName,RowStates.DELETED], function(rs) {
        resolve(rs.rows.item(0));
      }, function(err) {
        reject(err.message);
      });
    });
  }
  GetTaskAttachments(taskNo,success,error){
    this._db.executeSql('SELECT * FROM SMTaskAttachment WHERE TaskNo=? AND State<>?', [taskNo,RowStates.DELETED], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskContractHeader(contractNo,success,error){
    this._db.executeSql('SELECT * FROM SMContractHeader WHERE ContractNo=?', [contractNo], function(rs) {
      success(rs.rows.length>0?rs.rows.item(0):null);
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskContractDetails(contractNo,success,error){
    this._db.executeSql('SELECT * FROM SMContractDetail WHERE ContractNo=?', [contractNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskDispatchStatuses(success,error){
    this._db.executeSql('SELECT * FROM SMTaskDispatchStatus', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }

  GetTaskInfo(taskNo,success,error){
    this._db.executeSql('SELECT * FROM SMTask WHERE TaskNo=?', [taskNo], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskInfoForSync(taskNo){
    return new Promise(function(resolve,reject){
      dbEngine._db.executeSql('SELECT * FROM SMTask WHERE TaskNo=?', [taskNo], function(rs) {
        resolve(rs.rows.item(0));
      }, function(err) {
        reject(err.message);
      });
    });
  }
  GetTaskPayments(taskNo,success,error){
    this._db.executeSql('SELECT * FROM SMTaskDataPayment WHERE TaskNo=?', [taskNo], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetTasks(success,error){
    this._db.executeSql('SELECT * FROM SMTask', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaskTypes(success,error){
    this._db.executeSql('SELECT * FROM SMTaskType', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  GetTaxRate(arDivision,customerNo,taxSchedule,success,error){
    this._db.executeSql('SELECT * FROM SMTaxRate WHERE ARDivisionNo=? AND CustomerNo=? and TaxSchedule=?', [arDivision,customerNo,taxSchedule], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetTechnician(success,error){
    this._db.executeSql('SELECT * FROM SMTechnician', [], function(rs) {
      success(rs.rows.item(0));
    }, function(err) {
      error(err.message);
    });
  }
  GetWorkingDaysDetails(success,error){
    this._db.executeSql('SELECT * FROM SMWorkingDaysDetail', [], function(rs) {
      success(RowsToArray(rs.rows.item,rs.rows.length));
    }, function(err) {
      error(err.message);
    });
  }
  InsertTaskAttachment(taskNo,fileName,data,success,error){
    data = data.split(',')[1];
    this._db.executeSql('SELECT * FROM SMTaskAttachment WHERE CompanyCode=? AND TaskNo=? AND Name=?',[pageModel.companyInfo.CompanyCode,taskNo, fileName], async function(rs) {
      var sqlCommand = [];
      if(rs.rows.length>0)
      {
        var state = rs.rows.item(0).State;
        switch(state)
        {
          case RowStates.INSERTED:
            sqlCommand.push(['UPDATE SMTaskAttachment SET Data=?,State=? WHERE CompanyCode=? AND TaskNo=? AND Name=?',[data, RowStates.INSERTED,pageModel.companyInfo.CompanyCode,taskNo, fileName,]]);
            break;
          case RowStates.UNCHANGED:
            sqlCommand.push(['UPDATE SMTaskAttachment SET Data=?,State=? WHERE CompanyCode=? AND TaskNo=? AND Name=?',[data, RowStates.UPDATED,pageModel.companyInfo.CompanyCode,taskNo, fileName,]]);
            sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMTaskAttachment',taskNo+':'+fileName,RowStates.UPDATED]]);
            break;
          case RowStates.UPDATED:
            sqlCommand.push(['UPDATE SMTaskAttachment SET Data=?,State=? WHERE CompanyCode=? AND TaskNo=? AND Name=?',[data, RowStates.UPDATED,pageModel.companyInfo.CompanyCode,taskNo, fileName,]]);
            break;
        }
      }
      else{
        sqlCommand.push(['INSERT INTO SMTaskAttachment VALUES (?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,taskNo, fileName, data, RowStates.INSERTED]]);
        sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMTaskAttachment',taskNo+':'+fileName,RowStates.INSERTED]]);
      }
      dbEngine._db.sqlBatch(sqlCommand, function() {
        success(fileName);
      }, function(err) {
        error('SQL batch ERROR: ' + err.message);
      });
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
    
  }
  UpdateDispatch(dispatch,taskInfo,success,error){
    var sqlCommand = [];
    sqlCommand.push(['UPDATE SMDispatchHeader SET DispatchDate=?,StatusCode=?,StartDate=?,StartTime=?,EndDate=?,EndTime=?,State=? WHERE TaskNo=? AND DispatchNo=?',[dispatch.DispatchDate,dispatch.StatusCode,dispatch.StartDate,dispatch.StartTime,dispatch.EndDate,dispatch.EndTime,RowStates.UPDATED,dispatch.TaskNo,dispatch.DispatchNo]]);
    if(dispatch.State==RowStates.UNCHANGED)
      sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchHeader',dispatch.TaskNo+':'+dispatch.DispatchNo,RowStates.UPDATED]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(dispatch.DispatchNo);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  UpdateTask(taskInfo, success, error) {
    var sqlCommand = [];
    sqlCommand.push(['UPDATE SMTask SET NatureOfTaskAnswer1=?,NatureOfTaskAnswer2=?,NatureOfTaskAnswer3=?,NatureOfTaskAnswer4=?,NatureOfTaskAnswer5=?,State=? WHERE TaskNo=?', [taskInfo.NatureOfTaskAnswer1, taskInfo.NatureOfTaskAnswer2, taskInfo.NatureOfTaskAnswer3, taskInfo.NatureOfTaskAnswer4, taskInfo.NatureOfTaskAnswer5, RowStates.UPDATED,taskInfo.TaskNo,]])
    if(taskInfo.State == RowStates.UNCHANGED) {
      sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)', [pageModel.companyInfo.CompanyCode, 'SMTask', taskInfo.TaskNo, RowStates.UPDATED]]);
    }
    this._db.sqlBatch(sqlCommand, 
      function() {
        success();
      }, 
      function(err) {
        error('SQL batch ERROR: ' + err.message);
      });
  }
  InsertDispatchDetail(dispatchLine,success,error){
    var sqlCommand=[];
    sqlCommand.push(['INSERT INTO SMDispatchDetail VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode, dispatchLine.TaskNo, dispatchLine.DispatchNo, dispatchLine.ItemCode, dispatchLine.LineSeqNo, dispatchLine.LineKey, dispatchLine.ItemCodeDesc, dispatchLine.ExtendedDescriptionKey, dispatchLine.ExtendedDescriptionText, dispatchLine.WarehouseCode, dispatchLine.Discount, dispatchLine.TaxClass, dispatchLine.UnitOfMeasureConvFactor, dispatchLine.ProductLine, dispatchLine.CommentText, dispatchLine.QuantityOrdered, dispatchLine.UnitPrice, dispatchLine.PriceLevel, dispatchLine.ExtensionAmt, dispatchLine.ItemType,dispatchLine.LineDiscountPercent, dispatchLine.Hash, RowStates.INSERTED]]);
    sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetail',dispatchLine.TaskNo+':'+dispatchLine.DispatchNo+':'+dispatchLine.LineKey,RowStates.INSERTED]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(dispatchLine.LineKey);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  UpdateDispatchDetail(dispatchLine,success,error){
    var sqlCommand=[];
    sqlCommand.push(['UPDATE SMDispatchDetail SET QuantityOrdered=?,UnitPrice=?,ExtensionAmt=?,CommentText=?,ItemCodeDesc=?,State=? WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[dispatchLine.QuantityOrdered,dispatchLine.UnitPrice,dispatchLine.ExtensionAmt,dispatchLine.CommentText,dispatchLine.ItemCodeDesc,RowStates.UPDATED,dispatchLine.TaskNo,dispatchLine.DispatchNo,dispatchLine.LineKey]]);
    if(dispatchLine.Hash)
      sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetail',dispatchLine.TaskNo+':'+dispatchLine.DispatchNo+':'+dispatchLine.LineKey,RowStates.UPDATED]]);
    else
      sqlCommand.push(['UPDATE OfflineModifications SET STATE=? WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[RowStates.INSERTED,pageModel.companyInfo.CompanyCode,'SMDispatchDetail',dispatchLine.TaskNo+':'+dispatchLine.DispatchNo+':'+dispatchLine.LineKey]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(dispatchLine.LineKey);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  DeleteDispatchDetail(taskNo,dispatchNo,lineKey,success,error){
    var sqlCommand=[];
    this.GetDispatchDetail(taskNo,dispatchNo,lineKey,function(dispatchLine){
      if(dispatchLine.Hash)
      {
        sqlCommand.push(['UPDATE SMDispatchDetail SET State=? WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[RowStates.DELETED,taskNo,dispatchNo,lineKey]]);
        sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetail',taskNo+':'+dispatchNo+':'+lineKey,RowStates.DELETED]]);
      }
      else
      {
        sqlCommand.push(['DELETE FROM SMDispatchDetail WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[taskNo,dispatchNo,lineKey]]);
        sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,'SMDispatchDetail',taskNo+':'+dispatchNo+':'+lineKey]]);
      }
      dbEngine._db.sqlBatch(sqlCommand, function() {
        success(true);
      }, function(err) {
        error('SQL batch ERROR: ' + err.message);
      });
    },error);
  }
  InsertDispatchDetailLabor(dispatchLabor,success,error){
    var sqlCommand=[];
    sqlCommand.push(['INSERT INTO SMDispatchDetailLabor VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[pageModel.companyInfo.CompanyCode,dispatchLabor.TaskNo, dispatchLabor.DispatchNo, dispatchLabor.LaborSkillCode, dispatchLabor.LineSeqNo, dispatchLabor.LineKey, dispatchLabor.LineDesc, dispatchLabor.ExtendedDescriptionKey, dispatchLabor.ExtendedDescriptionText,dispatchLabor.LaborCommentText, dispatchLabor.HoursSpent, dispatchLabor.BillingRate, dispatchLabor.ExtensionAmt, dispatchLabor.TaxClass, dispatchLabor.OvertimeStartDate, dispatchLabor.OvertimeStartTime,dispatchLabor.LineDiscountPercent,dispatchLabor.Hash,RowStates.INSERTED ]]);
    sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetailLabor',dispatchLabor.TaskNo+':'+dispatchLabor.DispatchNo+':'+dispatchLabor.LineKey,RowStates.INSERTED]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(dispatchLabor.LineKey);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  UpdateDispatchDetailLabor(dispatchLabor,success,error){
    var sqlCommand=[];
    sqlCommand.push(['UPDATE SMDispatchDetailLabor SET LineDesc=?,HoursSpent=?,BillingRate=?,ExtensionAmt=?,LaborCommentText=?,State=? WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[dispatchLabor.LineDesc,dispatchLabor.HoursSpent,dispatchLabor.BillingRate,dispatchLabor.ExtensionAmt,dispatchLabor.LaborCommentText,RowStates.UPDATED,dispatchLabor.TaskNo,dispatchLabor.DispatchNo,dispatchLabor.LineKey]]);
    if(dispatchLabor.Hash)
      sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetailLabor',dispatchLabor.TaskNo+':'+dispatchLabor.DispatchNo+':'+dispatchLabor.LineKey,RowStates.UPDATED]]);
    else
      sqlCommand.push(['UPDATE OfflineModifications SET STATE=? WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[RowStates.INSERTED,pageModel.companyInfo.CompanyCode,'SMDispatchDetailLabor',dispatchLabor.TaskNo+':'+dispatchLabor.DispatchNo+':'+dispatchLabor.LineKey]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(dispatchLabor.LineKey);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
  DeleteDispatchDetailLabor(taskNo,dispatchNo,lineKey,success,error){
    var sqlCommand=[];
    this.GetDispatchDetailLabor(taskNo,dispatchNo,lineKey,function(laborLine){
      if(laborLine.Hash)
      {
        sqlCommand.push(['UPDATE SMDispatchDetailLabor SET State=? WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[RowStates.DELETED,taskNo,dispatchNo,lineKey]]);
        sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchDetailLabor',taskNo+':'+dispatchNo+':'+lineKey,RowStates.DELETED]]);
      }
      else
      {
        sqlCommand.push(['DELETE FROM SMDispatchDetailLabor WHERE TaskNo=? AND DispatchNo=? AND LineKey=?',[taskNo,dispatchNo,lineKey]]);
        sqlCommand.push(['DELETE FROM OfflineModifications WHERE CompanyCode=? AND TableName=? AND RecordKey=?',[pageModel.companyInfo.CompanyCode,'SMDispatchDetailLabor',taskNo+':'+dispatchNo+':'+lineKey]]);
      }
      dbEngine._db.sqlBatch(sqlCommand, function() {
        success(true);
      }, function(err) {
        error('SQL batch ERROR: ' + err.message);
      });
    },error);
  }
  UpdateDispatchTotals(taskNo,dispatchNo,totals,writeInLog,success,error){
    var sqlCommand=[];
    sqlCommand.push(['UPDATE SMDispatchHeader SET TaxableAmt=?,NonTaxableAmt=?,DiscountAmt=?,DispatchTotal=?,SalesTaxAmt=?,State=? WHERE TaskNo=? AND DispatchNo=?',[totals.TaxableAmt,totals.NonTaxableAmt,totals.DiscountAmt,totals.DispatchTotal,totals.SalesTaxAmt,RowStates.UPDATED,taskNo,dispatchNo]]);
    if(writeInLog)
      sqlCommand.push(['INSERT INTO OfflineModifications VALUES (?,?,?,?)',[pageModel.companyInfo.CompanyCode,'SMDispatchHeader',taskNo+':'+dispatchNo,RowStates.UPDATED]]);
    this._db.sqlBatch(sqlCommand, function() {
      success(true);
    }, function(err) {
      error('SQL batch ERROR: ' + err.message);
    });
  }
}
function RowsToArray(items,length){
  var resultSet =[];
  for (let index = 0; index < length; index++) {
    resultSet.push(items(index));
  }
  return resultSet;
}