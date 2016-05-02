var proto = {

websocket:	undefined,

connect:function(){
	try {
		var server = $("server").value;
		var host = "ws://" + server + ":9998";
		this.websocket = new WebSocket(host);
		
		this.websocket.onopen = function() {
			// websocket连接成功,玩家登录
			console.log("connect is established");
			var name = $("username").value;
			proto.acc_login("sherwinkoo", "");
		}
		
		this.websocket.onmessage = function(msg) {
			var reader = new FileReader();
			reader.onload = function(f){
				proto.dispatch(this.result);
			}
			reader.onerror = function(e){
				alert("读取Blob错误");
			}
			reader.readAsBinaryString(msg.data);
		}
		
		this.websocket.onclose = function() {

		}
		
		return true;
	}catch(exception){
		alert("<p>发生错误:" + exception.toString() + "</p>");
		return false;
	}
},

send:function(MsgId, msg) {
	var messageBlob = this.en_packet(MsgId, msg);
	console.log("发送消息:" + MsgId + ":" + msg);
	this.websocket.send(messageBlob);
},

disconnect:function() {
	this.websocket.close();
},

// 分发收到的消息
dispatch:function(message){
	var msg = this.de_packet(message);
	var msg_id = msg.section * 256 + msg.method;
	console.log("收到消息:" + msg_id);
	switch(msg_id){
		case 2560:	
			this.acc_login_s2c(msg.content);break;
		case 2561:
			this.acc_role_s2c(msg.content);break;
		default :	
			this.msgerr("未知的消息ID!");
	}
},

encode:function(MsgId, Msg){
	switch(MsgId){
		case 2560:	
			return this.acc_login_c2s(Msg);break;
		case 2561:
			return this.acc_role_c2s(Msg);break;
		default:
			this.msgerr("消息" + MsgId + "编码函数未定义");
	}
	return undefined;
},

/*************
*  消息编码
************/
en_packet:function(MsgId, msg) {
	var Section = Math.floor(MsgId / 256);
	var Method = MsgId - Section * 256;
	/* msg该是什么类型变量 */	
	var Content = this.encode(MsgId, msg);
	var Len = 4;
	if(Content != null) {
		Len += Content.byteLength;
	}
	var MsgHeader = new ArrayBuffer(6);
	var bytes = new Uint8Array(MsgHeader);
	bytes[0] = Math.floor(Len / 256);
	bytes[1] = Len % 256;
	bytes[2] = Section;
	bytes[3] = Method;
	bytes[4] = 0;		//16bit seq section: not used
	bytes[5] = 0;

	var blob_builder = new MozBlobBuilder();
	blob_builder.append(MsgHeader);
	if(Content != null) {
		blob_builder.append(Content.buffer);
	}

	var blob = blob_builder.getBlob();
	return blob;
},

/* @doc 对字符串编码 */
en_string:function(str){
	var  Str = new Array();
	Str[0] = Math.floor(str.length / 256);
	Str[1] = str.length % 256;
	for(var i = 0; i < str.length; i++){
		Str[i+2] = str.charCodeAt(i);
	}
	return Str;
},

/* @doc 对16位编码 */
en_u16: function(u16) {
	var Arr = new Array();

	Arr[0] = Math.floor(u32 / 256);
	u32 = u32 % 256;

	Arr[1] = u32;

	return Arr;
},

/* @doc 对32位编码 */
en_u32: function(u32) {
	var Arr = new Array();

	Arr[0] = Math.floor(u32 / (256 * 256 * 256));
	u32 = u32 % (256 * 256 * 256);
	
	Arr[1] = Math.floor(u32 / 65536);
	u32 = u32 % 65536;

	Arr[2] = Math.floor(u32 / 256);
	u32 = u32 % 256;

	Arr[3] = u32;

	return Arr;
},
 

/******************************
 *          消息解码
 ******************************/
de_packet:function(message) {
	var Len = message.charCodeAt(1);
	Len += message.charCodeAt(0) * 256;
	if(Len != message.length - 2){
		console.log("packet length parse error!");
		return ;
	}
	var Section = message.charCodeAt(2);
	var Method = message.charCodeAt(3);
	var Seq = message.charCodeAt(5);
	Seq += message.charCodeAt(4) * 256;
	var Content = message.substr(6);
	return {
		len:		Len,
		section:	Section,
		method:		Method,
		seq:		Seq,
		content:	Content
   	};
},

/* @doc 解码字符串 */
de_string:function(str, index){
	var Len = str.charCodeAt(index) + str.charCodeAt(index + 1) * 256;
	var sub = str.substr(index + 3,Len);
	return {result: sub, rest: str.substr(index + Len + 2)};
},

/* @doc 对16位解码 */
de_u16: function(Arr, index) {
	var u16 = Arr.charCodeAt(index + 1);
	u16 += Arr.charCodeAt(index) * 256;
	return u16;
},

/* @doc 对32位解码 */
de_u32: function(Arr, index) {
	var u32 = Arr.charCodeAt(index + 3);
	u32 += Arr.charCodeAt(index + 2) * 256;
	u32 += Arr.charCodeAt(index + 1) * 65536;
	u32 += Arr.charCodeAt(index) * 256 * 256 * 256;
	return u32;
},

/**************
* 错误处理函数
**************/
msgerr: function(err_str) {
	onsole.log(err_str);
},


/**************
* 模块相关消息
**************/

/* 1. 登陆消息 */
acc_login: function(user_name, pass){
	var MsgId = 2560;
	var msg = {
		accname	:	user_name,
	};
	this.send(MsgId, msg);
},

acc_login_c2s:function(msg){
	var name_str = this.en_string(msg.accname);
	var Len = name_str.length;
	var AccName = new ArrayBuffer(Len);
	var bytes = new Uint8Array(AccName);
	for(var i = 0; i < Len; i++){
		bytes[i] = name_str[i];
	}
	return bytes;
},

acc_login_s2c:function(str_content){
	var code = str_content.charCodeAt(1);
	code += str_content.charCodeAt(0) * 256;

	if(code == 0) {
		// 登陆成功, 获取角色信息
		this.acc_role();
	}
},

/* 2. 获取角色信息 */
acc_role: function() {
	var MsgId = 2561;
	this.send(MsgId, null);
},

acc_role_c2s: function(msg) {
	if(msg != null) {
		console.log("acc_role_c2s msg error!");
	}
	return null;
},

acc_role_s2c: function(str) {
	var i = 0;
	var State = this.de_u16(str, i);
	i += 2;
	var Id = this.de_u32(str, i);
	i += 4;
	var Career = str.charCodeAt(i);
	++i;
	var Sex = str.charCodeAt(i);

	console.log("收到角色信息:state="+State+", Id="+Id);

	if(State == 0) {
		// 未创建角色, 创建角色
		// 显示创建角色页面
		// ...
	}else if(State == 1){
		// 新手阶段
		// ...
	}else {
		// 正常阶段
		// ..
	}
}

};


/***************
 * 测试函数
 * *************/
function readBlob(blob){
	var reader = new FileReader();
	reader.onload = function(f){
		console.log(this.result);
	}
	reader.onerror = function(e){
		alert("读取Blob错误");
	}
	reader.readAsBinaryString(blob);

}
