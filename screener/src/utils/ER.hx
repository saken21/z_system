package src.utils;

class ER {
	
	public static var ngDomains:EReg;
	public static var stopUsers:EReg;
	public static var ngWords  :EReg;
	
	/* =======================================================================
	Public - Set
	========================================================================== */
	public static function set(value:String):Void {
		
		ngDomains = getByArray(DB.ngDomains);
		stopUsers = getByArray(DB.stopUsers);
		ngWords   = getByText(value);
		
	}
	
	/* =======================================================================
	Get By Array
	========================================================================== */
	private static function getByArray(array:Array<String>):EReg {
		
		return new EReg(array.join('|'),'i');
		
	}
	
	/* =======================================================================
	Get By Text
	========================================================================== */
	private static function getByText(value:String):EReg {
		
		if (value.length == 0) return null;
		
		value = ~/\n/g.replace(value,'');
		return new EReg(~/,/g.replace(value,'|'),'i');
		
	}
	
}