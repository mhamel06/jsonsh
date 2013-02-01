{
   "_id": "_design/shares",
   "language": "javascript",
   "views": {
       "all": {
           "map": "function(doc) {emit(doc.userToken, doc);}"
       },
			 "by_token": {
				 	 "map": "function(doc) {if(doc.userToken){emit(doc.userToken, doc);}}"			 
			 }
   }
}