function processWalletTransactions() {
  let amazonMessages = getBodyAndMessages("newer_than:10d AND from:no-reply@amazonpay.in AND subject:(successful OR (paid on Amazon.in)) AND -label:wallets_processed");
  let amazonRecords = parseAmazonMessages(amazonMessages);
  saveDataToSheet(amazonRecords, "Wallets");
  let messagesToBeLabelled= [];
  for (var i = 0; i< amazonMessages.length; i++) {
    messagesToBeLabelled = messagesToBeLabelled.concat(amazonMessages[i].messageBody);
  }
  labelMessagesAsDone(messagesToBeLabelled, "wallets_processed");
}

function getBodyAndMessages(searchString) {
  var threads = GmailApp.search( searchString,0,100);
  var arrToConvert=[];
  for(var i = threads.length - 1; i >=0; i--) {
    arrToConvert.push({messages: threads[i].getMessages(), subject: threads[i].getFirstMessageSubject()});
  }
  var messages = [];
  for(var i = 0; i < arrToConvert.length; i++) {
    for (var j = 0; j < arrToConvert[i].messages.length; j++){
      messages = messages.concat({messageBody: arrToConvert[i].messages[j], subject: arrToConvert[i].subject});
    }
  }
  return messages;
}

function parseAmazonMessages(messages){
  var records=[];
  if(!messages) {
    Logger.log("Amazon message is undefined");
    //messages is undefined or null or just empty
    return records;
  }
  for(var m=0;m<messages.length;m++) {
    var text = messages[m].messageBody.getPlainBody();
    var textWithoutBreaks = text.replace(/(\r\n|\n|\r)/gm, "");
    let subject = messages[m].subject;
    let recharges = subject.match(/Your (.*) for Rs. (\d+) is successful/);
    let amazonOrderMatch = subject.match(/(?:Rs |₹)(\d+\.\d{2}) (was paid on Amazon.in)/);
    let partnerPaymentMatch = subject.match(/Your payment of ₹ (\d+\.\d+) to (.*) was successful/);
    let utilitiesPaymentMatch = subject.match(/Your (.*) payment for Rs\.(\d+\.\d+) is successful/)
    var rec = {};
    if (recharges){
      rec.amount = recharges[2];
      let walletTypeMatch = textWithoutBreaks.match(/.*Voucher*/);
      rec.card = walletTypeMatch ? "Amazon Shopping Voucher": "Amazon Pay Balance";
      rec.date = Moment.moment(messages[m].messageBody.getDate()).format("M/D/YYYY");
      rec.merchant = recharges[1];
    } else if (amazonOrderMatch){
      rec.amount = amazonOrderMatch[1];
      let walletTypeMatch = textWithoutBreaks.match(/.*Voucher*/);
      rec.card = walletTypeMatch ? "Amazon Shopping Voucher": "Amazon Pay Balance";
      rec.date = Moment.moment(messages[m].messageBody.getDate()).format("M/D/YYYY");
      rec.merchant = "Amazon";
    }else if (partnerPaymentMatch) {
      rec.amount = partnerPaymentMatch[1];
      rec.card = "Amazon Pay Balance";
      rec.date = Moment.moment(messages[m].messageBody.getDate()).format("M/D/YYYY");
      rec.merchant = partnerPaymentMatch[2];
    }else if (utilitiesPaymentMatch) {
      rec.amount = utilitiesPaymentMatch[2];
      rec.card = "Amazon Pay Balance";
      rec.date = Moment.moment(messages[m].messageBody.getDate()).format("M/D/YYYY");
      rec.merchant = utilitiesPaymentMatch[1];
    }else {
      continue;
    }
    rec.messageId = messages[m].messageBody.getId();
    rec.messageTime = Moment.moment(messages[m].messageBody.getDate()).format("HH:mm:SS");
    records.push(rec);
  }
  return records;
}