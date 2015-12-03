/**
* ================================================================================
*
* Screener ver 1.00.00
*
* Author : KENTA SAKATA
* Since  : 2015/12/03
* Update : 2015/12/03
*
* Licensed under the MIT License
* Copyright (c) Kenta Sakata
* http://saken.jp/
*
* ================================================================================
*
**/
package src;

import haxe.Http;
import js.JQuery;
import jp.saken.utils.Dom;
import src.components.View;
import src.utils.DB;

class Main {
	
	public static var CAMPAIGN_LIST:Array<String> = ['b_1'];
	public static inline var TEST_MAIL:String = 'sakata@graphic.co.jp';
	
	public static function main():Void {
		
		Dom.jWindow.on('beforeunload',onBeforeunload);
		new JQuery('document').ready(init);
		
    }

	private static function init(event:JqEvent):Void {
		
		if (TEST_MAIL.length > 0) {
			trace('\n--\nTest - ' + TEST_MAIL + '\n--\n');
		}
		
		DB.load(View.init);
		
	}
	
	private static function onBeforeunload(event:JqEvent):Void {
		
		new Http('files/php/deleteCSV.php').request(true);
		
	}

}