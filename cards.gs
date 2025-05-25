class CardInfo {
  constructor(searchString, regex, dateIndex, dateFormat, merchantIndex, amountIndex){
    this.searchString = searchString;
    this.regex = regex;
    this.dateIndex = dateIndex;
    this.dateFormat = dateFormat;
    this.merchantIndex = merchantIndex;
    this.amountIndex = amountIndex;
  }
}

const HDFCBankCCRegex = /([0-9]+) for Rs([.]*) ([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)) at ([a-zA-Z0-9 $!@#$&-_.]+) on ([0-9]+(-[0-9]+)+)/;
const HDFCBankCCSearch = "from:hdfcbank.net AND subject:Alert : Update on your HDFC Bank Credit Card"
const HDFCCC = new CardInfo(HDFCBankCCSearch, HDFCBankCCRegex, 5, "DD-MM-YYYY", 4 , 3);

const HDFCUPIRegex = /Rs\.(\d+\.\d+) (has been debited from account) (\*\*\d+) (to) (.*) (on) (\d{2}-\d{2}-\d{2})/;
const HDFCUPISearch = "((from:alerts@hdfcbank.net AND subject:You have done a UPI txn. Check details!) OR (from:hdfcbank.net AND subject:View: Account update for your HDFC Bank A/c)) AND NOT Rupay"
const HDFCUPI = new CardInfo(HDFCUPISearch, HDFCUPIRegex, 7, "DD-MM-YY", 5 , 1);

const HDFCRupayUPIRegex = /Rs\.(\d+\.\d+) (has been debited from your HDFC Bank RuPay Credit Card XX\d+) (to) (.*) (on) (\d{2}-\d{2}-\d{2})/
const HDFCRupayUPISearch = "from:alerts@hdfcbank.net AND subject:You have done a UPI txn. Check details! AND Rupay"
const HDFCRupayUPI = new CardInfo(HDFCRupayUPISearch, HDFCRupayUPIRegex, 6, "DD-MM-YY", 4 , 1);

const AxisBankCCRegex = /[Cc]ard no.\s(XX\d+)\sfor\sINR\s(\d+(?:\.\d+)?)?\sat\s+(.+?)\son\s*(\d+-\d+-\d+\s\d+:\d+:\d+)/;
const AxisBankCCSearch = "from:alerts@axisbank.com AND subject:Transaction alert on Axis Bank Credit Card no"
const AxisCC = new CardInfo(AxisBankCCSearch, AxisBankCCRegex, 4, "DD-MM-YYYY", 3 , 2);

const IDFCCCRegex = /INR ([0-9]*\.[0-9]+)\s+([a-zA-Z]+\s+)+(XX[0-9]+) at ([A-Za-z0-9 @&$-_]+) on ([0-9A-Z-]+) at/;
const IDFCCCSearch = "from:idfcfirstbank.com AND subject:Debit Alert: Your IDFC FIRST Bank Credit Card"
const IDFCCC = new CardInfo(IDFCCCSearch, IDFCCCRegex, 5, "DD-MMM-YYYY", 4 , 1);

const ICICICCRegex = /a transaction of Rs|INR ([0-9,.]+) on ([A-Za-z0-9 @&$-_]+). Info: (.*?). The Available Credit Limit /;
const ICICICCSearch = "from:credit_cards@icicibank.com AND subject:Transaction alert for your ICICI Bank Credit Card"
const ICICICC = new CardInfo(ICICICCSearch, ICICICCRegex, -1, "", 3 , 1);

const ICICIFoodCardRegex = /of INR ([0-9,.]+) has been done using your ICICI Bank Prepaid Card (.*?) at (.*?) on ([A-Za-z0-9 @&$-_]+). The Available /;
const ICICIFoodCardSearch = "from:Prepaidcards@icicibank.com AND subject:Transaction Alert"
const ICICIFoodCard = new CardInfo(ICICIFoodCardSearch, ICICIFoodCardRegex, 4, "DD-MMM-YYYY", 3 , 1);

const AxisUPIRegex = /INR (\d+\.\d{2}) has been debited from A\/c no\. [A-Z]{2}\d{4} on (\d{2}-\d{2}-\d{2}) at \d{2}:\d{2}:\d{2} [A-Z]{3}\. Info- (.*). For any/;
const AxisUPISearch = "from:alerts@axisbank.com AND subject:Debit notification from Axis Bank A/c"
const AxisUPI = new CardInfo(AxisUPISearch, AxisUPIRegex, 2, "DD-MM-YY", 3 , 1);

const EnkashRegex = /Dear (.*?), Thanks for using (.*?) Freedom Card\. Your card ending with (.*?) has been (.*?) with an amount of Rs (.*?)\. Your current available balance is (.*?)\.Following are the transaction details\. Transaction Date: (.*?) Transaction Reference Number: (.*?)\. PG Reference Number: (.*?)\. Transaction Amount: (.*?) Transaction Description: (.*?) IN\. Enjoy the Freedom!/
const EnkashSearch = "from:sbm@enkash.com AND subject:Transaction Alert on your EnKash Freedom Card"
const Enkash = new CardInfo(EnkashSearch, EnkashRegex, 7, "YYYY-MM-DD HH:mm:SS", 11 , 5);

const SodexoRegex = /(?:Rs |₹)(\d+\.\d{2}) at (.*?). Please call/
const SodexoSearch = "from:do-not-reply@cardinfo.sodexo.in AND subject:Transaction confirmation on your Sodexo Card"
const Sodexo = new CardInfo(SodexoSearch, SodexoRegex, -1, "", 2 , 1);

//Rs. 2,750.00 spent on card 3681 on 03-JUL-23 at WWW BIGBASKET COM.
const CITICCRegex = /Rs. ([0-9,.]+) spent on card \d{4} on (\d{2}-[A-Z]{3}-\d{2}) at (.*?)\. Limit available=/;
const CITICCSearch = "subject:Transaction confirmation on your Citibank credit card"
const CITICC = new CardInfo(CITICCSearch, CITICCRegex, 2, "DD-MMM-YY", 3 , 1);

const YesCCRegex = /INR ([0-9,.]+) (.*?) at (.*?) on (\d{2}-\d{2}-\d{4})/;
const YesCCSearch = "from:alerts@yesbank.in AND subject:Yes Bank - Transaction Alert"
const YesCC = new CardInfo(YesCCSearch, YesCCRegex, 4, "DD-MM-YYYY", 3 , 1);

const RBLZomatoCCRegex = /INR ([0-9,.]+) at (.*?) on (\d{2}-\d{2}-\d{4});/;
const RBLZomatoCCSearch = "from:RBLAlerts@rblbank.com AND subject:Alert: Your Edition Classic Card has just been swiped"
const RBLZomatoCC = new CardInfo(RBLZomatoCCSearch, RBLZomatoCCRegex, 3, "DD-MM-YYYY", 2 , 1);



const CardsMap = {
  "hdfc_cc": HDFCCC,
  "hdfc_upi": HDFCUPI,
  "axis_cc": AxisCC,
  "axis_upi": AxisUPI,
  "idfc_cc": IDFCCC,
  "icici_cc": ICICICC,
  "icici_food": ICICIFoodCard,
  "sodexo": Sodexo,
  "citi": CITICC,
  "hdfc_rupay_cc": HDFCRupayUPI,
  "yesbank_cc": YesCC
}