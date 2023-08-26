function getMessagesDisplay() {
  var templ = HtmlService.createTemplateFromFile('messages');
  var days = "10d";
  templ.messages = getMessages("newer_than:"+ days + " AND " + HDFCBankCCSearch +" AND -label:spends_processed");
  return templ.evaluate();  
}

function getParsedDataDisplay() {
  var templ = HtmlService.createTemplateFromFile('parsed.html');
  var days = "10d";

  var messages = getMessages("newer_than:"+ days + " AND " + HDFCBankCCSearch);
  let records = parseMessageData(messages, HDFCCC, "HDFC Infinia");
  templ.records = records;
  return templ.evaluate();
}

function saveExpenseSheet(userInput) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('expenseSheet', userInput);
  return "Sheet saved succesfully!"
}

function saveTelegramSettings(telegramToken, telegramChatId) {
  if (!(telegramChatId && telegramChatId) ) {
    return "Enter telegram Token and chatId!";
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('telegramToken', telegramToken);
  userProperties.setProperty('telegramChatId', telegramChatId);
  return "Telegram Settings saved succesfully!"
}

function getExpenseSheet() {
  var userProperties = PropertiesService.getUserProperties();
  var data = userProperties.getProperty('expenseSheet');
  return data
}

function doGet() {
  // return getParsedDataDisplay();
  return HtmlService.createHtmlOutputFromFile('app');
  //return getMessagesDisplay();
}

function getCards() {
  var userProperties = PropertiesService.getUserProperties();
  var cards = userProperties.getProperty('cards').replace(/\n/g, "");
  return cards ? JSON.parse(cards) : [];
}

function saveCards(cards) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('cards', JSON.stringify(cards));
}
