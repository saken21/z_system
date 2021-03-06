(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var IMap = function() { };
IMap.__name__ = true;
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.__name__ = true;
haxe.Http.prototype = {
	setParameter: function(param,value) {
		this.params = Lambda.filter(this.params,function(p) {
			return p.param != param;
		});
		this.params.push({ param : param, value : value});
		return this;
	}
	,request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				s = null;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.iterator();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.iterator();
		while( $it1.hasNext() ) {
			var h1 = $it1.next();
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
};
haxe.ds = {};
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
};
var jp = {};
jp.saken = {};
jp.saken.ui = {};
jp.saken.ui.DragAndDrop = function(jTarget,onSuccess,type) {
	if(type == null) type = "text";
	this._jTarget = jTarget;
	this._onSuccess = onSuccess;
	this._type = type;
	jTarget.on({ drop : $bind(this,this.onDrop), dragenter : $bind(this,this.onEnter), dragover : $bind(this,this.onOver), dragleave : $bind(this,this.onLeave)});
};
jp.saken.ui.DragAndDrop.__name__ = true;
jp.saken.ui.DragAndDrop.prototype = {
	getFilename: function() {
		return this._filename;
	}
	,onDrop: function(event) {
		var file = event.originalEvent.dataTransfer.files[0];
		var fileReader = new FileReader();
		this._filename = file.name;
		fileReader.onload = $bind(this,this.onLoaded);
		if(this._type == "text") fileReader.readAsText(file); else if(this._type == "image") fileReader.readAsDataURL(file);
		this.cancel(event);
		this._jTarget.removeClass("dragging").trigger("onDrop");
		return false;
	}
	,onLoaded: function(event) {
		this._onSuccess(event.target.result);
	}
	,onEnter: function(event) {
		this.cancel(event);
		this._jTarget.trigger("onEnter");
		return false;
	}
	,onOver: function(event) {
		this.cancel(event);
		this._jTarget.addClass("dragging").trigger("onOver");
		return false;
	}
	,onLeave: function(event) {
		this.cancel(event);
		this._jTarget.removeClass("dragging").trigger("onOver");
		return false;
	}
	,cancel: function(event) {
		event.preventDefault();
		event.stopPropagation();
	}
};
jp.saken.utils = {};
jp.saken.utils.Ajax = function() { };
jp.saken.utils.Ajax.__name__ = true;
jp.saken.utils.Ajax.getDatetime = function(onLoaded) {
	var http = new haxe.Http("files/php/" + "getDatetime.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.request(true);
};
jp.saken.utils.Ajax.uploadImage = function(filename,base64,onLoaded) {
	var http = new haxe.Http("files/php/" + "uploadImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.setParameter("base64",base64);
	http.request(true);
};
jp.saken.utils.Ajax.deleteImage = function(filename,onLoaded) {
	var http = new haxe.Http("files/php/" + "deleteImage.php");
	jp.saken.utils.Ajax.setBusy();
	http.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	http.setParameter("filename",filename);
	http.request(true);
};
jp.saken.utils.Ajax.getData = function(table,columns,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		onLoaded(JSON.parse(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT " + columns.join(",") + " FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getMaxData = function(table,column,onLoaded,where) {
	if(where == null) where = "";
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		var reg = new EReg("([0-9]+)","");
		var isMatch = reg.match(data);
		onLoaded(isMatch?Std.parseInt(reg.matched(0)):0);
		jp.saken.utils.Ajax.unsetBusy();
	};
	var query = "SELECT MAX(" + column + ") FROM " + table;
	if(where.length > 0) query += " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.getIsEmpty = function(table,onLoaded,where) {
	jp.saken.utils.Ajax.getData(table,["id"],function(data) {
		onLoaded(data.length < 1);
	},where);
};
jp.saken.utils.Ajax.insertData = function(table,columns,values,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded(Std.parseInt(data));
		jp.saken.utils.Ajax.unsetBusy();
	};
	var _g1 = 0;
	var _g = values.length;
	while(_g1 < _g) {
		var i = _g1++;
		values[i] = "'" + values[i] + "'";
	}
	var query = "INSERT INTO " + table + " (" + columns.join(",") + ") VALUES (" + values.join(",") + ")";
	jp.saken.utils.Ajax.requestConnectDB(query,true);
};
jp.saken.utils.Ajax.updateData = function(table,columns,values,where,onLoaded) {
	jp.saken.utils.Ajax.setConnectDB();
	jp.saken.utils.Ajax._connectDB.onData = function(data) {
		if(onLoaded != null) onLoaded();
		jp.saken.utils.Ajax.unsetBusy();
	};
	var array = [];
	var _g1 = 0;
	var _g = columns.length;
	while(_g1 < _g) {
		var p = _g1++;
		array[p] = columns[p] + "= '" + values[p] + "'";
	}
	var query = "UPDATE " + table + " SET " + array.join(",") + " WHERE " + where;
	jp.saken.utils.Ajax.requestConnectDB(query);
};
jp.saken.utils.Ajax.setConnectDB = function() {
	jp.saken.utils.Ajax._connectDB = new haxe.Http("files/php/" + "connectDB.php");
};
jp.saken.utils.Ajax.requestConnectDB = function(query,isInsert) {
	if(isInsert == null) isInsert = false;
	jp.saken.utils.Ajax.setBusy();
	jp.saken.utils.Ajax._connectDB.setParameter("query",query);
	if(isInsert) jp.saken.utils.Ajax._connectDB.setParameter("insert","true");
	jp.saken.utils.Ajax._connectDB.request(true);
};
jp.saken.utils.Ajax.setBusy = function() {
	jp.saken.utils.Dom.jWindow.on("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.unsetBusy = function() {
	jp.saken.utils.Dom.jWindow.unbind("beforeunload",jp.saken.utils.Ajax.onBeforeunload);
};
jp.saken.utils.Ajax.onBeforeunload = function(event) {
	return "データベース登録中です。";
};
var js = {};
jp.saken.utils.Dom = function() { };
jp.saken.utils.Dom.__name__ = true;
jp.saken.utils.File = function() { };
jp.saken.utils.File.__name__ = true;
jp.saken.utils.File.downloadDirect = function(folder,filename) {
	var jAnchor = new js.JQuery("<a>");
	jAnchor.prop("download",filename);
	jAnchor.prop("href",folder + filename);
	jAnchor.prop("target","_blank");
	jp.saken.utils.Dom.jBody.append(jAnchor);
	jAnchor.get(0).click();
	jAnchor.remove();
};
jp.saken.utils.Handy = function() { };
jp.saken.utils.Handy.__name__ = true;
jp.saken.utils.Handy.alert = function(value) {
	jp.saken.utils.Dom.window.alert(value);
};
jp.saken.utils.Handy.confirm = function(text,ok,cancel) {
	if(jp.saken.utils.Dom.window.confirm(text)) ok(); else if(cancel != null) cancel();
};
jp.saken.utils.Handy.getPastDate = function(date,num) {
	if(num == null) num = 30;
	var second = HxOverrides.strDate(date).getTime() - num * 86400000;
	var date1;
	var d = new Date();
	d.setTime(second);
	date1 = d;
	var m = jp.saken.utils.Handy.getFilledNumber(date1.getMonth() + 1,2);
	var d1 = jp.saken.utils.Handy.getFilledNumber(date1.getDate(),2);
	return date1.getFullYear() + "-" + m + "-" + d1;
};
jp.saken.utils.Handy.getFilledNumber = function(num,digits) {
	if(digits == null) digits = 3;
	var result = num + "";
	var blankLength = digits - jp.saken.utils.Handy.getDigits(num);
	var _g = 0;
	while(_g < blankLength) {
		var i = _g++;
		result = "0" + result;
	}
	return result;
};
jp.saken.utils.Handy.getDigits = function(val) {
	return (val + "").length;
};
jp.saken.utils.Handy.getLinkedHTML = function(text,target) {
	if(target == null) target = "_blank";
	if(new EReg("http","").match(text)) text = new EReg("((http|https)://[0-9a-z-/._?=&%\\[\\]~^:]+)","gi").replace(text,"<a href=\"$1\" target=\"" + target + "\">$1</a>");
	return text;
};
jp.saken.utils.Handy.getBreakedHTML = function(text) {
	if(new EReg("\n","").match(text)) text = new EReg("\r?\n","g").replace(text,"<br>");
	return text;
};
jp.saken.utils.Handy.getAdjustedHTML = function(text) {
	return jp.saken.utils.Handy.getLinkedHTML(jp.saken.utils.Handy.getBreakedHTML(text));
};
jp.saken.utils.Handy.getLines = function(text) {
	return jp.saken.utils.Handy.getNumberOfCharacter(text,"\n") + 1;
};
jp.saken.utils.Handy.getNumberOfCharacter = function(text,character) {
	return text.split(character).length - 1;
};
jp.saken.utils.Handy.getLimitText = function(text,count) {
	if(count == null) count = 10;
	if(text.length > count) text = HxOverrides.substr(text,0,count) + "...";
	return text;
};
jp.saken.utils.Handy.getReplacedSC = function(text) {
	text = StringTools.replace(text,"'","&#039;");
	text = StringTools.replace(text,"\\","&#47;");
	return text;
};
jp.saken.utils.Handy.getSlicedArray = function(array,num) {
	if(num == null) num = 1000;
	var results = [];
	var _g1 = 0;
	var _g = Math.ceil(array.length / num);
	while(_g1 < _g) {
		var i = _g1++;
		var j = i * num;
		results.push(array.slice(j,j + num));
	}
	return results;
};
jp.saken.utils.Handy.shuffleArray = function(array) {
	var copy = array.slice();
	var results = [];
	var length = copy.length;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var index = Math.floor(Math.random() * length);
		results.push(copy[index]);
		copy.splice(index,1);
	}
	return results;
};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Browser = function() { };
js.Browser.__name__ = true;
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
var src = {};
src.Main = function() { };
src.Main.__name__ = true;
src.Main.main = function() {
	jp.saken.utils.Dom.jWindow.on("beforeunload",src.Main.onBeforeunload);
	new js.JQuery("document").ready(src.Main.init);
};
src.Main.init = function(event) {
	src.utils.DB.load(src.components.View.init);
};
src.Main.onBeforeunload = function(event) {
	new haxe.Http("files/php/deleteCSV.php").request(true);
};
src.components = {};
src.components.Screener = function() { };
src.components.Screener.__name__ = true;
src.components.Screener.ready = function() {
	src.utils.Data.setLocalScreened(src.components.Screener.getLocalScreenedData());
};
src.components.Screener.start = function() {
	src.components.Screener.startGlobal(src.utils.Data.getLocalScreened());
};
src.components.Screener.getBusy = function() {
	return src.components.Screener._isBusy;
};
src.components.Screener.setCounter = function(value) {
	src.components.Screener._counter = value;
};
src.components.Screener.startGlobal = function(data) {
	src.components.Screener._isBusy = true;
	src.components.Screener._counter = data.length;
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = data[i];
		src.components.Screener.accessDomain(info);
	}
};
src.components.Screener.getLocalScreenedData = function() {
	src.components.Screener._mains = new haxe.ds.StringMap();
	var results = [];
	var rawData = src.utils.Data.getRaw();
	var _g1 = 0;
	var _g = rawData.length;
	while(_g1 < _g) {
		var p = _g1++;
		var string = rawData[p];
		var info = src.components.Screener.getInfo(string.split("\t"));
		if(info != null) results.push(info);
	}
	console.log("Local Screened : " + results.length);
	return results;
};
src.components.Screener.getInfo = function(array) {
	if(array.length < 9) return null;
	var id = array[0];
	var subID = array[1];
	var date = array[2];
	var corporate = src.components.Screener.getCorporate(array[5]);
	var name = src.components.Screener.getName(array[6],array[7]);
	var mail = src.components.Screener.getMailaddress(array[9]);
	if(corporate == null || name == null || mail == null) return null;
	var domain = src.components.Screener.getDomain(mail.split("@")[1]);
	if(domain == null) return null;
	if(src.components.Screener.isBadID(id,Std.parseInt(subID),corporate,mail,domain)) return null;
	var _g = new haxe.ds.StringMap();
	_g.set("id",id);
	_g.set("subID",subID);
	_g.set("date",date);
	_g.set("corporate",corporate);
	_g.set("name",name);
	_g.set("mail",mail);
	_g.set("domain",domain);
	return _g;
};
src.components.Screener.getCorporate = function(value) {
	if(value.length < 1) return null;
	value = src.components.Screener.getReplaced(value);
	if(src.utils.ER.ngWords.match(value)) return null;
	return value;
};
src.components.Screener.getName = function(a,b) {
	if(a.length < 1 && b.length < 1) return null;
	var fullname = src.components.Screener.getReplaced(a + " " + b);
	if(fullname.indexOf("株式会社") > -1) fullname = "ご担当者";
	return fullname;
};
src.components.Screener.getMailaddress = function(value) {
	if(value.length < 1) return null;
	if(!new EReg("@","").match(value)) return null;
	if(src.utils.ER.stopUsers.match(value)) return null;
	return value;
};
src.components.Screener.getDomain = function(value) {
	if(value.length < 1) return null;
	if(src.utils.ER.ngDomains.match(value)) return null;
	return value;
};
src.components.Screener.isBadID = function(id,subID,corporate,mail,domain) {
	if(subID > 1) {
		var main = src.components.Screener._mains.get(id);
		if(main == null) return true;
		var c = main.c;
		var d = main.d;
		var m = main.m;
		if(c == null || d == null) return true;
		if(corporate.indexOf(c) < 0 || mail.indexOf(d) < 0) return true;
		if(HxOverrides.indexOf(m,mail,0) > -1) return true;
		m.push(mail);
		src.components.Screener._mains.get(id).m = m;
	} else {
		var v = { c : corporate, d : domain, m : [mail]};
		src.components.Screener._mains.set(id,v);
		v;
	}
	return false;
};
src.components.Screener.getReplaced = function(value) {
	value = StringTools.replace(value,"⑰","㈲");
	value = StringTools.replace(value,"⑭","（株）");
	value = StringTools.replace(value,"&amp;","&");
	value = StringTools.replace(value,"&#039;","'");
	value = StringTools.replace(value,"&#8226;","・");
	return value;
};
src.components.Screener.accessDomain = function(info) {
	$.ajax({ type : "GET", url : "http://" + info.get("domain")}).done(function(data) {
		src.components.Screener.analyzeKeyword(data.results[0],info);
		src.components.Screener.removeCounter();
	}).fail(src.components.Screener.removeCounter);
};
src.components.Screener.analyzeKeyword = function(value,info) {
	if(value == null) return;
	var jHead = new js.JQuery("<div>" + value.split("<body")[0] + "</div>");
	var jKeywords = jHead.find("meta[name*=\"eyword\"]");
	var jDescription = jHead.find("meta[name*=\"escription\"]");
	if(jKeywords.length == 0) jKeywords = jHead.find("meta[name=\"KEYWORDS\"]");
	if(jDescription.length == 0) jDescription = jHead.find("meta[name=\"DESCRIPTION\"]");
	var keywords = jKeywords.prop("content") + jDescription.prop("content");
	console.log("Keyword : " + keywords);
	if(!src.utils.ER.ngWords.match(keywords)) src.utils.Data.pushWebScreened(info);
};
src.components.Screener.removeCounter = function() {
	src.components.Screener._counter--;
	if(src.components.Screener._counter == 0) {
		src.components.Screener._isBusy = false;
		jp.saken.utils.Handy.alert("スクリーニングが完了しました（" + src.utils.Data.getWebScreened().length + "件）。");
		src.components.View.showSaveButton();
	}
	console.log(src.components.Screener._counter);
};
src.components.View = function() { };
src.components.View.__name__ = true;
src.components.View.init = function() {
	var jAll = new js.JQuery("#all").show();
	var jForm = jAll.find("#form");
	src.components.View._jFilename = jAll.find("#filename");
	src.components.View._jNgWord = jForm.find("#ng-word");
	src.components.View._jScreeningLength = jForm.find("#screening-length").trigger("focus");
	src.components.View._jButtons = jForm.find("button").on("click",src.components.View.onClick);
	src.components.View._jScreeningList = jAll.find("#screening-list");
	src.components.View._dragAndDrop = new jp.saken.ui.DragAndDrop(jp.saken.utils.Dom.jWindow,src.components.View.onDropped);
};
src.components.View.setScreened = function(html) {
	src.components.View._jScreeningList.html(html);
};
src.components.View.showSaveButton = function() {
	src.components.View.showButton("save");
};
src.components.View.onDropped = function(data) {
	src.components.View._jFilename.text(src.components.View._dragAndDrop.getFilename());
	var array = data.split("\n");
	src.components.View.empty(array);
	src.utils.Test.traceHeader(array[0].split("\t"));
	console.log("All : " + array.length);
	src.utils.ER.set(src.components.View._jNgWord.prop("value"));
	src.components.Screener.ready();
	src.components.View.setSliced(Std.parseInt(src.components.View._jScreeningLength.prop("value")));
};
src.components.View.onClick = function(event) {
	var jTarget = new js.JQuery(event.target);
	var _g = jTarget.prop("class");
	switch(_g) {
	case "start":
		src.components.Screener.start();
		break;
	case "save":
		src.components.View.save();
		break;
	}
};
src.components.View.save = function() {
	var data = src.utils.Data.getWebScreened();
	var length = data.length;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var info = data[i];
		var v = src.components.View.getStaff(info.get("id"));
		info.set("staff",v);
		v;
	}
	console.log("Screened List : " + length);
	src.utils.Csv["export"](data);
};
src.components.View.getStaff = function(clientID) {
	var staff;
	var staffID = src.utils.DB.supports.get(clientID);
	if(staffID == null) {
		staff = jp.saken.utils.Handy.shuffleArray(src.utils.DB.staffs)[0];
		staffID = staff.id;
		src.utils.DB.supports.set(clientID,staffID);
		staffID;
		src.utils.DB.insertSupport(clientID,staffID);
	} else staff = src.utils.DB.staffMap.get(staffID);
	return staff.lastname;
};
src.components.View.setSliced = function(length) {
	if(length < 1) {
		src.components.View.showButton("start");
		return;
	}
	var data = jp.saken.utils.Handy.getSlicedArray(src.utils.Data.getLocalScreened(),length);
	var html = "";
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var p = _g1++;
		html += "<a class=\"slicedData\" data-id=\"" + p + "\">No." + jp.saken.utils.Handy.getFilledNumber(p) + " (" + data[p].length + ")</a>";
	}
	src.components.View._jScreeningList.html(html + "<p class=\"empty\"></p>").find("a").on("click",function(event) {
		if(src.components.Screener.getBusy()) {
			jp.saken.utils.Handy.alert("処理中です。しばらくお待ちください。");
			return;
		}
		var jTarget = $(this);
		src.components.Screener.startGlobal(data[jTarget.data("id")]);
		jTarget.remove();
	});
};
src.components.View.showButton = function(key) {
	src.components.View._jButtons.filter("." + key).show();
};
src.components.View.empty = function(data) {
	src.utils.Data.init(data);
	src.components.View._jScreeningList.find("a").unbind();
	src.components.View._jButtons.hide();
};
src.utils = {};
src.utils.Csv = function() { };
src.utils.Csv.__name__ = true;
src.utils.Csv["export"] = function(data) {
	src.utils.Csv.ajax(src.utils.Csv.getAdjusted(data).join("\n"));
};
src.utils.Csv.getAdjusted = function(data) {
	var array = [];
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = data[i];
		var id = info.get("id");
		var subID = info.get("subID");
		var date = info.get("date");
		var corporate = info.get("corporate");
		var name = info.get("name");
		var mail = info.get("mail");
		var staff = info.get("staff");
		array.push(id + "\t" + subID + "\t" + date + "\t" + corporate + "\t" + name + "\t" + mail + "\t" + staff);
	}
	return array;
};
src.utils.Csv.ajax = function(data) {
	var http = new haxe.Http("files/php/exportCSV.php");
	http.onData = src.utils.Csv.onExported;
	http.setParameter("data",data);
	http.setParameter("filename","data.csv");
	http.request(true);
};
src.utils.Csv.onExported = function(result) {
	jp.saken.utils.File.downloadDirect("files/php/csv/","data.csv");
};
src.utils.DB = function() { };
src.utils.DB.__name__ = true;
src.utils.DB.load = function(func) {
	src.utils.DB._func = func;
	src.utils.DB._map = new haxe.ds.StringMap();
	src.utils.DB._counter = 0;
	jp.saken.utils.Dom.jWindow.on("loadDB",src.utils.DB.onLoaded);
	src.utils.DB.ajax("staffs",["id","lastname","firstname","mailaddress"]);
	src.utils.DB.ajax("supports",["client_id","staff_id"]);
	src.utils.DB.ajax("ngDomains",["domain"]);
	src.utils.DB.ajax("stopUsers",["mailaddress"]);
};
src.utils.DB.insertSupport = function(clientID,staffID) {
	jp.saken.utils.Ajax.insertData("supports",["client_id","staff_id"],[clientID,staffID]);
};
src.utils.DB.getWhere = function(array) {
	var wheres = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		wheres.push("name = \"" + array[i] + "\"");
	}
	return wheres.join(" OR ");
};
src.utils.DB.ajax = function(table,columns,where) {
	if(where == null) where = "";
	src.utils.DB._counter++;
	jp.saken.utils.Ajax.getData(table,columns,function(data) {
		if(columns.length > 1) {
			src.utils.DB._map.set(table,data);
			data;
		} else {
			var v = src.utils.DB.getSimpleArray(data,columns[0]);
			src.utils.DB._map.set(table,v);
			v;
		}
		jp.saken.utils.Dom.jWindow.trigger("loadDB");
	},where);
};
src.utils.DB.getSimpleArray = function(data,key) {
	var array = [];
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		array.push(data[i][key]);
	}
	return array;
};
src.utils.DB.onLoaded = function(event) {
	src.utils.DB._counter--;
	if(src.utils.DB._counter > 0) return;
	src.utils.DB.staffs = src.utils.DB._map.get("staffs");
	src.utils.DB.staffMap = src.utils.DB.getMap(src.utils.DB.staffs,"id");
	src.utils.DB.supports = src.utils.DB.getMap(src.utils.DB._map.get("supports"),"client_id","staff_id");
	src.utils.DB.ngDomains = src.utils.DB._map.get("ngDomains");
	src.utils.DB.stopUsers = src.utils.DB._map.get("stopUsers");
	console.log("NG Domain : " + src.utils.DB.ngDomains.length + "件 " + Std.string(src.utils.DB.ngDomains));
	console.log("配信停止ユーザー : " + src.utils.DB.stopUsers.length + "件 " + Std.string(src.utils.DB.stopUsers));
	src.utils.DB._func();
};
src.utils.DB.getMap = function(data,key,value) {
	var map = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = data.length;
	while(_g1 < _g) {
		var i = _g1++;
		var info = data[i];
		var v;
		if(value == null) v = info; else v = info[value];
		map.set(info[key],v);
		v;
	}
	return map;
};
src.utils.Data = function() { };
src.utils.Data.__name__ = true;
src.utils.Data.init = function(array) {
	src.utils.Data._raw = array;
	src.utils.Data._localScreened = src.utils.Data._webScreened = [];
};
src.utils.Data.getRaw = function() {
	return src.utils.Data._raw;
};
src.utils.Data.shiftRaw = function() {
	src.utils.Data._raw.shift();
};
src.utils.Data.setLocalScreened = function(data) {
	src.utils.Data._localScreened = data;
};
src.utils.Data.getLocalScreened = function() {
	return src.utils.Data._localScreened;
};
src.utils.Data.setWebScreened = function(data) {
	src.utils.Data._webScreened = data;
};
src.utils.Data.getWebScreened = function() {
	return src.utils.Data._webScreened;
};
src.utils.Data.pushWebScreened = function(info) {
	src.utils.Data._webScreened.push(info);
};
src.utils.ER = function() { };
src.utils.ER.__name__ = true;
src.utils.ER.set = function(value) {
	src.utils.ER.ngDomains = src.utils.ER.getByArray(src.utils.DB.ngDomains);
	src.utils.ER.stopUsers = src.utils.ER.getByArray(src.utils.DB.stopUsers);
	src.utils.ER.ngWords = src.utils.ER.getByText(value);
};
src.utils.ER.getByArray = function(array) {
	return new EReg(array.join("|"),"i");
};
src.utils.ER.getByText = function(value) {
	if(value.length == 0) return null;
	value = new EReg("\n","g").replace(value,"");
	return new EReg(new EReg(",","g").replace(value,"|"),"i");
};
src.utils.Test = function() { };
src.utils.Test.__name__ = true;
src.utils.Test.traceHeader = function(array) {
	var strings = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var p = _g1++;
		strings.push(p + ":" + array[p]);
	}
	console.log(strings.join(","));
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
var q = window.jQuery;
js.JQuery = q;
jp.saken.utils.Ajax.PATH = "files/php/";
jp.saken.utils.Dom.document = window.document;
jp.saken.utils.Dom.window = window;
jp.saken.utils.Dom.jWindow = new js.JQuery(jp.saken.utils.Dom.window);
jp.saken.utils.Dom.body = jp.saken.utils.Dom.document.body;
jp.saken.utils.Dom.jBody = new js.JQuery(jp.saken.utils.Dom.body);
jp.saken.utils.Dom.userAgent = jp.saken.utils.Dom.window.navigator.userAgent;
src.components.Screener.HEAD_LENGTH = 9;
src.utils.Csv.PHP_URL = "files/php/exportCSV.php";
src.utils.Csv.FILE_NAME = "data.csv";
src.Main.main();
})();
