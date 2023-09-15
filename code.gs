const sheet_url = "https://docs.google.com/spreadsheets/d/1h3PjYSnTtf6hCA6umwh3KZQ76zSCtVA44unaIPL0-hk/edit#gid=1596994453"; 
// Here  ^^^^  is needed to replace by you Url of your coopy of google sheets table.
// Instruction: https://docs.google.com/spreadsheets/d/1h3PjYSnTtf6hCA6umwh3KZQ76zSCtVA44unaIPL0-hk/edit#gid=1596994453

/**
 *
 *  Telegramm bot on google sheets
 *  v 0.1b
 *  
 *    
 *  (с) Semenov Anton
 *  seotext91@yandex.ru
 * 
 **/


const DOC = SpreadsheetApp.openByUrl(sheet_url);
const Session_list = DOC.getSheetByName("#Bot");
const Sys_list = DOC.getSheetByName("#Sys");
const bot_api_token = Sys_list.getRange(1, 2).getValue();
const deployment_link = Sys_list.getRange(2, 2).getValue();

function send (msg, chat_id) {
  let payload = {
    'method': 'sendMessage',
    'chat_id': String(chat_id),
    'text': msg,
    'parse_mode': 'HTML'
  }
  let data = {
    "method": "post",
    "payload": payload
  }
    UrlFetchApp.fetch('https://api.telegram.org/bot' + bot_api_token + '/', data);
}

function doPost(e)
{
  let update = JSON.parse(e.postData.contents);
  if (update.hasOwnProperty('message'))
  {
    let msg = update.message;
    let chat_id = msg.chat.id;
    let text = msg.text;
    
    let ind = getInd(chat_id, Session_list);
    if (ind == -1){
      ind = Session_list.getLastRow()
      Session_list.getRange(ind+1,1).setValue(chat_id);
    }

    var questions = getQuestions(Session_list);
    var q_ammount = questions.length;
    var step = parseInt(getStep(ind, Session_list));

    if (text == "/start") {
      send (questions[step], chat_id);      
    }
    else{
      if (step >= q_ammount -1 ){ // Когда получили ответ на последний вопрос
        Session_list.getRange(ind+1,2+step).setValue(text);
        var answer = Session_list.getRange(1,q_ammount+3).getValue();
        send (answer, chat_id);
        answer = Session_list.getRange(ind+1,q_ammount+3).getValue();
        send (answer, chat_id);
        Session_list.getRange(ind+1,3, 1, q_ammount).clearContent();
        send (questions[1], chat_id);
      }
      else{
        if (step == 0){ 
          send (questions[step], chat_id);
        }
        send (questions[step+1], chat_id);
        if (step >= 0){
          Session_list.getRange(ind+1,2+step).setValue(text);
        }
      }
    }
  }  
}

function api_connector () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var bot_api_token = sheet.getRange(1, 2).getValue();
  var deployment_link = sheet.getRange(2, 2).getValue();

  UrlFetchApp.fetch("https://api.telegram.org/bot" + bot_api_token + "/setWebHook?url="+ deployment_link);
  SpreadsheetApp.getActive().toast('Connected.'); 
}

function getInd(chat_id,sheet) { //возвращает индекс строки, в которой записан chatid
  let lr = sheet.getLastRow();
  let chat_id_arr = sheet.getRange(1,1,lr).getValues();
  chat_id_arr = chat_id_arr.flat();
  let ind = chat_id_arr.indexOf(chat_id);
  return ind;
}

function getStep(ind,sheet) { // возвращает на каком шагу воронки вопросов находится пользователь
  let lr = sheet.getLastColumn();
  let chat_id_arr = sheet.getRange(ind+1,2,1,lr-1).getValues();
  chat_id_arr = chat_id_arr.flat();
  let step = chat_id_arr.indexOf("");
  return step;
}

function getQuestions(sheet) { // возвращает список вопросов
  let q = [];
  let last_col = sheet.getLastColumn();
  
  let q_arr = sheet.getRange(1,2,1, last_col - 1).getValues();
  q = q_arr.flat();
  let n = q.indexOf("");

  if (n>0){
    for (i = q.length - n; i > 0; i--){
      q.pop()
    }
  }
  return q;
}

function test(){
    var chat_id = 5940349793;
  var ind = getInd(chat_id , Session_list);

Logger.log(ind)
      log("ind", ind);
      
      var questions = getQuestions(Session_list);
      Logger.log(questions)
      var q_ammount = questions.length;
      log("q_ammount", q_ammount);

      var step = parseInt(getStep(ind, Session_list));
      Logger.log("step", step);
      if (step == q_ammount ){
        
        var answer = Session_list.getRange(1,q_ammount+2).getValue();
        send (answer, chat_id);
        answer = Session_list.getRange(ind+1,q_ammount+2).getValue();
        send (answer, chat_id);
        Session_list.getRange(ind+1,3, 1, q_ammount).clearContent();
      }
      else{

        send (questions[step], chat_id);
        if (step >= 0){
         Session_list.getRange(ind+1,2+step).setValue(text);
        }
      }

}

function log(event, message){
  SpreadsheetApp.getActive().getSheetByName('#Log').appendRow([new Date(), event, message])
}
