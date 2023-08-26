const debug = false;

function processTransactionEmails() {
  let sheetUrl = getExpenseSheet();
  if (!sheetUrl){
    return false;
  }
  let sheet = SpreadsheetApp.openByUrl(sheetUrl);
  let cardsInfo = JSON.parse(getCards());
  for( let cardInfo of cardsInfo) {
    processTransactions(CardsMap[cardInfo['cardId']], "30d", cardInfo['cardName'], sheet);
  }
  return true;
}

function getMessages(searchString) {
  var threads = GmailApp.search(searchString,0,100);
  var arrToConvert=[];
  for(var i = threads.length - 1; i >=0; i--) {
    arrToConvert.push(threads[i].getMessages());   
  }
  var messages = [];
  for(var i = 0; i < arrToConvert.length; i++) {
    messages = messages.concat(arrToConvert[i]);
  }
  return messages;
}

function processRecurringTransactions() {
  let sheetUrl = getExpenseSheet();
  if (!sheetUrl){
    return false;
  }
  let sheet = SpreadsheetApp.openByUrl(sheetUrl);
  let records = [];
  var rec = {};
  rec.amount = 40000;
  rec.messageTime = Moment.moment().format("HH:mm:SS");
  rec.card = "Axis Net Banking";
  var formattedDate = Moment.moment().format("M/D/YYYY");
  rec.date= formattedDate;
  rec.merchant = "SBI Education loan";
  rec.messageId = "recurring expense " + rec.date + " " + rec.messageTime;
  records.push(rec);
  saveDataToSheet(records, "Expenses", sheet);
}

function processTransactions(cardInfo, days, cardName, sheet = undefined) {
  var messages = getMessages("newer_than:"+ days + " AND " + cardInfo.searchString +" AND -label:spends_processed");
  let records = parseMessageData(messages, cardInfo, cardName);
  saveDataToSheet(records, "Expenses", sheet);
  labelMessagesAsDone(messages, "spends_processed");
}

function parseMessageData(messages, cardInfo, cardName) {
  var records=[];
  if(!messages) {
    //messages is undefined or null or just empty
    return records;
  }
  for(var m=0;m<messages.length;m++) {
    var text = messages[m].getPlainBody();

    var textWithoutBreaks = text.replace(/(\r\n|\n|\r)/gm, "");
    var matches = textWithoutBreaks.match(cardInfo.regex);
    if(!matches || matches.length < 1){
      Logger.log('Match failed');
      Logger.log(textWithoutBreaks);
      continue;
    }

    var rec = {};
    Logger.log(matches);
    rec.amount = matches[cardInfo.amountIndex];
    rec.messageTime = Moment.moment(messages[m].getDate()).format("HH:mm:SS");
    rec.card = cardName;
    var formattedDate = Moment.moment(messages[m].getDate()).format("M/D/YYYY");
    if (cardInfo.dateIndex > 0 ){
      formattedDate = Moment.moment(matches[cardInfo.dateIndex], cardInfo.dateFormat).format("M/D/YYYY");
    }
    rec.date= formattedDate;
    const upiRegexPattern = /UPI\/(?:P2A|P2M|P2P)\/\d+\//;
    rec.merchant = matches[cardInfo.merchantIndex].trim().replace(upiRegexPattern, "");
    rec.messageId = messages[m].getId();
    if(!["VPA cred.club@axisb", "CRED Club/Axis Bank"].includes(rec.merchant)) {
      records.push(rec);
    }
  }
  return records;
}

function saveDataToSheet(records, sheet, altSheet) {
  let spreadsheet = altSheet || SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1Zu5sXhI-zWuREZeVRlkDZb6Vaj1jqEisxxk5-aT7rmE/edit?resourcekey#gid=580794423");
  
  let time = Moment.moment().format("HH:mm:SS");
  for(var r=0;r<records.length;r++){
    let messagesSheet = spreadsheet.getSheetByName("messageIdLogs");
    let messageIdSearchResults = messagesSheet.createTextFinder(records[r].messageId).matchEntireCell(true).findAll();
    if(debug || messageIdSearchResults.length > 0) {
      continue;
    }
    messagesSheet.appendRow([records[r].messageTime, records[r].messageId]);
    let recordsSheet = spreadsheet.getSheetByName(sheet);
    let categorySet = new Set();
    let descriptionSet = new Set();
    let merchantsColumn = recordsSheet.getRange(1, 6, recordsSheet.getLastRow(), 1)
    let prevMerchants = merchantsColumn.createTextFinder(records[r].merchant).matchEntireCell(true).findAll();
    for( var i=0; i < prevMerchants.length; i++) {
      let prevCategory = prevMerchants[i].offset(0,-2).getValue();
      let prevDescription = prevMerchants[i].offset(0,-1).getValue();
      categorySet.add(prevCategory);
      descriptionSet.add(prevDescription);
    }
    
    let category = categorySet.size == 1 ? [...categorySet][0] : "";
    let description = descriptionSet.size == 1 ? [...descriptionSet][0] : "";
    records[r].category = category;
    records[r].description = description;
    let row = [(records[r].date + " " + records[r].messageTime), records[r].card, records[r].amount, category, description, records[r].merchant];
    recordsSheet.appendRow(row);
    recordsSheet.sort(1, false);
    sendTelegramMessage(records[r]);
  }
}


function labelMessagesAsDone(messages, label) {
  var label_obj = GmailApp.getUserLabelByName(label);
  if(!label_obj)
  {
    label_obj = GmailApp.createLabel(label);
  }
  
  for(var m =0; m < messages.length; m++ ){
     label_obj.addToThread(messages[m].getThread());  
  }
  
}

function sendTelegramMessage(record) {
  var userProperties = PropertiesService.getUserProperties();
  var telegramToken = userProperties.getProperty('telegramToken');
  var telegramChatId = userProperties.getProperty('telegramChatId');
  if (!telegramChatId || ! telegramToken ) {
    return;
  }

  var apiUrl = 'https://api.telegram.org/bot' + telegramToken + '/sendMessage';

  let message = "Spent ₹" + record.amount + " using " + record.card + ". \n" + 
                "Merchant: " + record.merchant + "\n" +
                "Category: " + record.category + "\n" +
                "Descrption: " + record.description;

  var payload = {
    'chat_id': telegramChatId,
    'text': message
  };

  var options = {
    'method': 'post',
    'payload': payload
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  Logger.log(response.getContentText());
}
