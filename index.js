const express = require('express')
const app = express()
const hbs = require('hbs')
var cors = require('cors')
const fs = require('fs');
const date = require('date-and-time')
const Str = require('@supercharge/strings')

app.use(cors())
app.set('view engine', 'hbs')
app.use(express.json())

app.get('/', (req, res) => {
  res.render("index");
});


//New Room create
app.get('/newroom',cors(), (req, res) => {
  var roomID = Str.random(10);
  fs.appendFile("./room/"+roomID+".json",'[{"msg":"<b>You have been connected to the '+roomID+' chat. You can use /help to learn more</b>","nick":"Prvchat","date":"00:00"}]', function(){
    res.send("https://prvchatdot.herokuapp.com/?room="+roomID)
  })
});
//send to user room msg
app.get('/getmsg',cors(), (req, res) => {
  var roomID = req.query.roomID;
  if(roomID == null){
    roomID=0;
  }
  fs.readFile("./room/"+roomID+".json", 'utf8', function (err,data) {
    if(err){
      res.send("Error");
    }else{
      res.contentType('application/json');
      res.send(data);
    }
    
})


//send new msg to server
app.post('/newmsg',cors(), (req, res) => {
  var roomID = req.body.roomID;
  var nick = req.body.nick;
  var msg = req.body.msg;
  const now = new Date();
  const nowDate = date.format(now,'HH:mm');



  //Komendy/ochrona/style

  //Ochrona prze elementami HTML do xxs
  var lt = "<", 
    gt = ">", 
    ap = "\'", 
    ic = "\"";
    msg = msg.toString().replaceAll(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
    
    nick = nick.toString().replaceAll(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");

  //wygląd np. <b>, <i>
  if(msg.substring(0, 1) == ":"){
    if(msg.substring(1, 2) == "B" || msg.substring(1, 2) == "b"){
      msg = "<b>"+msg.substring(2)+"</b>";
    }
    if(msg.substring(1, 2) == "I" || msg.substring(1, 2) == "i"){
      msg = "<i>"+msg.substring(2)+"</i>";
    }
    if(msg.substring(1, 2) == "M" || msg.substring(1, 2) == "m"){
      msg = "<mark>"+msg.substring(2)+"</mark>";
    }
    if(msg.substring(1, 2) == "U" || msg.substring(1, 2) == "u"){
      msg = "<u>"+msg.substring(2)+"</u>";
    }
  }

  var urlRegex = /(https?:\/\/[^\s]+)/g;
  msg = msg.replaceAll(urlRegex, '<a href="$1" target="_blank">$1</a>')


  //komenda popoc
  if(msg.substring(0, 1) == "/"){
    if(msg.substring(1, 5) == "help" || msg.substring(1, 5) == "Help"){
      msg = "<br/><b>Formating text: </b><br/> :B <b>This</b> <br/> :I <i>This</i> <br/> :M <mark>This</mark> <br/> :U <u>This</u><br/><br/><b>Command issued by "+nick+"</b>";
      nick = "Prvchat"
    }
  }


  json = JSON.parse(fs.readFileSync("room/"+roomID+".json",{encoding:'utf8', flag:'r'}))
  json.push({"nick":nick,"msg":msg,"date":nowDate})
  fs.writeFileSync("room/"+roomID+".json",JSON.stringify(json), {flag:'w'})
  res.send(JSON.stringify(json))

})
})


app.listen(process.env.PORT || 3000)

