/**
 * JSONSH - JSON Syntax Highlight
 * 
 * @version v0.2.0 ( 4/20/2012 )
 *
 * @author <a href="http://www.peterschmalfeldt.com">Peter Schmalfeldt</a>
 *
 * @namespace jsonsh 
 */

 var clip = new ZeroClipboard( document.getElementById("my-button"), {
   moviePath: "/zeroClip/ZeroClipboard.swf"
 });

var jsonsh = {

	themes : {
		"Standard": "css\/syntax.css",
		"Big" :"css\/big.css",
		"TNight":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/tomorrow-night.css",
		"TNight-blue":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/tomorrow-night-blue.css",
		"TNight-80s":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/tomorrow-night-eighties.css",
		"Hemisu-light":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/hemisu-light.css",
		"Hemisu-dark":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/hemisu-dark.css",
		"Github":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/github.css",
		"Vibrant":"http://jmblog.github.com/color-themes-for-google-code-prettify/css/themes/vibrant-ink.css"
	},
	
	/** Track whether we've done an initial reformatting */
	is_pretty: false,

	/** Store old Source to compare if changes were made before formatting again */
	old_value: '',

	/** Single place to update how fast/slow the animations will take */
	animation_speed: 250,
	theme_speed:400,

	/** Single place to update how you want to manage the tabbing in your reformatting */
	tab_space: '  ',
	
	defaultStyleId : "Github",
	currentStyleId : this.defaultStyleId,
	currentStyle: "",
	zoomLevel: 100,


	setTheme: function(themeId){

		var themeFile = this.themes[themeId];
		this.currentStyleId = themeId;

		$('#resultContainer').fadeOut(jsonsh.theme_speed,function(){
			dstyle.remove(jsonsh.currentStyle,"css");
			jsonsh.currentStyle = themeFile;
			dstyle.add(jsonsh.currentStyle,"css");
			$('#resultContainer').fadeIn(jsonsh.theme_speed);
		});		
	},

	setZoom:(function(){
	//This runs initially and returns a function that will be used afterwards based on the browsers setup
	var test = document.createElement('div');
	//if there's a valid property in the browser
	//it will return ""
	//undefined means the browser doesn't know
	//what you're talking about
	    var zoomSupport = true;
        if (test.style.zoom === undefined) {
            zoomSupport = false;
        }
        delete test;

        if(zoomSupport){
			return function(zoomLevel){
				$("#output_wrapper").attr('style','zoom:'+zoomLevel+'%;');
			};
        }else{
        	return function(zoomLevel){

        		$('#zoomIn').hide();
        		$('#zoomOut').hide();
        		//var scale =(zoomLevel/100).toFixed(2);
        		//var style = "-o-transform: scale("+scale+");-moz-transform: scale("+scale+");transform: scale("+scale+")";
        		//$("#output_wrapper").attr('style',style);				
        	}
        }
	})(),

	/** Initialize JSONSH */
	init: function()
	{

		var loadId = jsonsh.getQueryParam('shareId');
		var themeName = jsonsh.getQueryParam('theme');
		var zoom = jsonsh.getQueryParam('zoom');
		var contentArray = [];
		
		$('#resultContainer').hide();
		$('#btnBeautify').hide();
		
		if(!loadId){
		//there is no id so this is a person here to share
			$('#btnSource').click();	
		}

		if(themeName){
			//No theme so use the standard
			if(this.themes.hasOwnProperty(themeName))
			{
				dstyle.add(this.themes[themeName],"css");
				this.currentStyle = this.themes[themeName];
				this.currentStyleId = this.themes[themeName];
				
			}else{
				dstyle.add(this.themes[this.defaultStyleId],"css");
				this.currentStyle = this.themes[this.defaultStyleId];
				this.currentStyleId = this.defaultStyleId;

			}
		}else{
				dstyle.add(this.themes[this.defaultStyleId],"css");
				this.currentStyle = this.themes[this.defaultStyleId];
				this.currentStyleId = this.defaultStyleId;
		}

		if(zoom){
			this.zoomLevel = parseInt(zoom);
			jsonsh.setZoom(this.zoomLevel);
			//$("#output_wrapper").attr('style','font-size:'+jsonsh.zoomLevel+'%;')
		}


		$('#resultContainer').fadeIn(jsonsh.theme_speed);
	
		//////////////////////////////
		//Add content programatically

		////Build the style dropdown
		//contentArray.push('<li><a id="styleNone" href="#" >None</a></li>');
		for(item in this.themes){
			contentArray.push('<li><a onClick="jsonsh.setTheme(\''+item+'\');" href="#" >'+item+'</a></li>');			
		}
		$('#themeDropdown').html(contentArray.join(""));

		/** Add Placeholder Text for browsers that do not support it */
		//jQuery('input[placeholder], textarea[placeholder]').placeholder();
		
		/** Allow logo and reset link to reset interface */
		jQuery('.logo, .reset').click(function()
		{
			jsonsh.reset_interface();
			return false;
		});
		
		jQuery('#parseError').hide();

		/////////////////////
		//Add Event Handlers
		
		$('#btnSource').click(function(){
			//Save a current copy of the source value
			jsonsh.safeCopy = $('#source').val();
			jQuery('#parseError').hide();
		
		});

		$('#btnCloseSource').click(function(){
			$('#source').val(jsonsh.safeCopy);
			
			jsonsh.make_pretty();
		});

		$('#zoomIn').click(function(){
			
			jsonsh.zoomLevel+=10;
			jsonsh.setZoom(jsonsh.zoomLevel);
			//$("#output_wrapper").attr('style','font-size:'+jsonsh.zoomLevel+'%;')
		});

		$('#zoomOut').click(function(){

			jsonsh.zoomLevel-=10;
			jsonsh.setZoom(jsonsh.zoomLevel);
			//$("#output_wrapper").attr('style','font-size:'+jsonsh.zoomLevel+'%;')
		});

		$('#styleNone').click(function(){

			$('#resultContainer').fadeOut(jsonsh.theme_speed,function(){
			dstyle.remove(jsonsh.currentStyle,"css");
			jsonsh.currentStyle = "";
			$('#resultContainer').fadeIn(jsonsh.theme_speed);
				
			});
			
		});

		$('#share').click(function(){
			$('#shareLink').hide();
			jsonsh.saveJson();
		});
		
		if(loadId){
			jsonsh.loadJson(loadId);
		}
		
		jQuery('#btnBeautify').click(function(){
			jsonsh.make_pretty();
			$('#pageWrapper').fadeIn(jsonsh.animation_speed);
		});
		
		/** Look for changes to JSON source */
		jQuery('#source').keyup(function()
		{
			/** Only process JSON if there is some, and it is not the same as before */
			var currentString = jQuery(this).val();
			if( (currentString != jsonsh.old_value) && currentString.length != 0)
			{
				/** Passed out initial tests, go ahead and make it pretty */
				//jsonsh.make_pretty();				
				
				jsonsh.updateParseError(currentString);
								
				/** Update our old value to the latest and greatest */
				jsonsh.old_value = currentString;
			}
			/** Source is blank now, no need to do anything, so reset interface */
			else if(currentString == '')
			{	
				jQuery('#parseError').html("");
				jQuery('#parseError').fadeOut();
				jsonsh.reset_interface();
			}
		});
	},

	updateParseError: function(sourcestring){

				var result = jsonsh.safeLint(sourcestring);
				if(result.success){
						jQuery('').html('');
						jQuery('#parseError').fadeOut(jsonsh.animation_speed,function(){
						jQuery('#btnBeautify').fadeIn(jsonsh.animation_speed);
					});									
				}else{
						jQuery('#btnBeautify').fadeOut(jsonsh.animation_speed,function(){					
						jQuery('#parseError').addClass('fail').html(result.object.message).fadeIn(jsonsh.animation_speed);
					});					
				}
	},

	
	getQueryParam: function(name)
	{
	  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	  var regexS = "[\\?&]" + name + "=([^&#]*)";
	  var regex = new RegExp(regexS);
	  var results = regex.exec(window.location.search);
	  if(results == null)
	    return false;
	  else
	    return decodeURIComponent(results[1].replace(/\+/g, " "));
	},
	
	loadJson: function(id){
		if(id=='debug'){
			var testJson = 
					{
						toplevel:
						{
							some:'stuff',
							to:'go',
							'in': "the",
							test :['json','object']
						},
						anumber:5,
						anothernumber:5000		
					};
					
					var jsonString =  JSON.stringify(testJson);//+"}";
					var parseResult = this.safeLint(jsonString);

					$('#source').val(JSON.stringify(testJson));
					jsonsh.make_pretty();
		}else{

			$.ajax({
				url: '/svc/couch/sharejson/' + id,
				contentType: 'application/json',
				type: 'GET',
				success: function(data, textStatus, jqXHR){
					var resp = JSON.parse(data);						
					$('#source').val(JSON.stringify(resp.json));
					jsonsh.make_pretty();
					
				}
			});	
		}				
	},
	
	
	safeLint: function(jsonString){	
	var result = {};
	try{
		result.object = jsonlint.parse(jsonString)
		result.success = true;
		
		}catch(error){
			result.success = false;
			result.object = error;			
		}
		return result;
	},
	
	/**
	* Send the json to couchdb to be saved
	**/
	
	saveJson: function(){
		var data = $('#source').val();
		var x = JSON.parse(data);
		data = {json: x};
		data = JSON.stringify(data);
		
		//Save the json in a couchdb page
		$.ajax({
			url: '/svc/couch/sharejson',
			data: data,
			contentType: 'application/json',
			type: 'POST',
			success: function(data, textStatus, jqXHR){
				var resp = JSON.parse(data),
						base = window.location.protocol + "//" + window.location.hostname;
						base += '?shareId=' + resp.id;

						//Add current theme
						if(jsonsh.currentStyle != jsonsh.defaultStyle){
							base += "&theme="+jsonsh.currentStyleId;
						}
						//Add current zoom	
						if(jsonsh.zoomLevel!= 100){
							base += "&zoom="+jsonsh.zoomLevel;
						}

				$.ajax({
					url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDOVPHSuha3jwS3iyAuHJ8KMENYfUZQabo',
					data: JSON.stringify({"longUrl": base}),
					contentType: 'application/json',
					type: 'POST',
					success: function(data, textStatus, jqXHR){
						var data,
								url;
								
						if(typeof(data) == "string"){
							data = JSON.parse(data);
						}		
										
						url = data.id;
						jsonsh.setShare(url);
					}
				});
						
			}
		});
	},
	
	setShare:function(url){
		$('#shareLink').attr('href', url);
		$('#shareLink').html(url);
		$('#shareLink').fadeIn(jsonsh.animation_speed);	
	},
	
	getUrl: function(id){
		
	},
	/**  */
	make_pretty: function()
	{
		/** Clear out the old HTML from the output first */
		jQuery('#output_wrapper').html('');

		/** Try to Validate & Format Source */
		if(jQuery('#source').val() != '')
		{
			try
			{
				/** Parse JSON using Awesome JSON Lint */
				var result = jsonlint.parse(jQuery('#source').val());
				
				/** Check for a result */
				if(result)
				{
					/** Stick out decompresses JSON string into the output wrapper so we can make it all pretty */
					jQuery('#output_wrapper').html('<pre class="prettyprint linenums"><code class="language-js">' + JSON.stringify(result, null, jsonsh.tab_space) + '</code></pre>');
					
					/** Check if we've already made the JSON pretty, if not let's also update the original source ( doing it again just makes the UX horrible ) */
					if(jsonsh.is_pretty === false)
					{
						/** Update formatting of original source so user can copy / paste if they want */
						jQuery('#source').val(JSON.stringify(result, null, jsonsh.tab_space)).scrollTop(0);
						
						/** Track that we updated the users JSON source formatting */
						jsonsh.is_pretty = true;
					}
					
					/** Get rid of any existing result messages */
					jQuery('#result').fadeOut(jsonsh.animation_speed);
					
					/** Now that the heavy lifing is done, MAKE IT PRETTY */
					prettyPrint();
					
					/** Allow the user to click to highlight a row to keep mental track of things better */
					jQuery('pre ol li').click(function(){
						jQuery(this).toggleClass('select');
						
						//For code folding
						var startLen = $(this).find('span.pln').first().html().length,
						next = $(this).next('li'),
						nextLen = next.find('span.pln').first().html().length;
						
						function getNext(oldNext){
							next = $(oldNext).next('li');
							nextLen = next.find('span.pln').first().html().length;
						}
						
						if(next.is(":visible")){
							while(startLen < nextLen){
								next.hide();
								getNext(next);
							}
						}else{
							while(!next.is(":visible")){
								next.show();
								getNext(next);
							}
						}
						
					});
					
					/** Bring up the reset link to allow user to get back to the begging ASAP */
					jQuery('.reset').fadeIn(jsonsh.animation_speed);
				}
			}
			/** Invalid Source */
			catch(error)
			{
				/** Bring up the reset link to allow user to get back to the begging ASAP */
				jQuery('.reset').fadeIn(jsonsh.animation_speed);
				
				/** Show the error message we got to the user so then know what's up */
				jQuery('#result').addClass('fail').html(error.message).fadeIn();
			}
		}
		/** Source code is blank now, so reset the interface */
		else
		{
			jsonsh.reset_interface();
		}
	},
	
	/** Put everything back the way it was when we first started... easy peasy */
	reset_interface: function()
	{
		jQuery('#result').fadeOut(jsonsh.animation_speed);
		jQuery('#source').val('');
		jQuery('#output_wrapper').html('');
		jQuery('.reset').fadeOut(jsonsh.animation_speed);

		jsonsh.is_pretty = false;
		jsonsh.old_value = '';
	}
}

/** Initialize JSONSH */
jQuery(function()
{
	jsonsh.init();	
});
