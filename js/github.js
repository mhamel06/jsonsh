var GithubAuth = {

	setAuthCookie: function(authToken){
		var exdate=new Date();
		var exdays = 7;
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(authToken) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		var c_name = "github_auth_token";
		document.cookie=c_name + "=" + c_value;
	},

	getAuthCookie: function(){
		var c_name = "github_auth_token";
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++){
		  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		  x=x.replace(/^\s+|\s+$/g,"");
		  if (x==c_name){
		    return unescape(y);
		  }
	  }
		return false;
	},
	
	getUsername: function(token){
		$.ajax({
			url: 'https://github.corp.millennialmedia.com/api/v3/user?access_token=' + token,				
			contentType: 'application/json',
			dataType: 'json',
			type: 'GET',
			success: function(data, textStatus, jqXHR){
				$('#loginLink').html(data.name);
			}			
		});
	}
}