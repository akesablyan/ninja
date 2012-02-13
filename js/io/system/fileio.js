/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/* /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
NOTES:

	For newFile, only the 'uri' is required, if contents is empty, such
	empty file will be created. 'contents' should be a string to be saved
	as the file. 'contentType' is the mime type of the file.
	
	Core API reference in NINJA: this.application.ninja.coreIoApi
	
////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////// */
//
var Montage = 	require("montage/core/core").Montage,
	Component = require("montage/ui/component").Component;
////////////////////////////////////////////////////////////////////////
//Exporting as File I/O
exports.FileIo = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
    //newFile Object (*required): {uri*, contents, contentType}
    newFile: {
    	enumerable: true,
    	value: function(file) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//Peforming check for file to exist
    		var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, create;
    		//Upon successful check, handling results
    		if (check.success) {
    			//Handling status of check
    			switch (check.status) {
    				case 204:
    					//Storing status to be returned (for UI handling)
    					status = check.status;
    					break;
    				case 404:
    					//File does not exists, ready to be created
    					create = this.application.ninja.coreIoApi.createFile(file);
    					status = create.status;
    					break;
    				default:
    					//Unknown Error
    					break;
    			}
	   		} else {
	    		//Unknown Error
    		}
    		//Returning resulting code
    		return status;
		    //	204: File exists | 400: File exists | 404: File does not exists
		    //	201: File succesfully created | 500: Unknown | undefined: Unknown
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    readFile: {
    	enumerable: true,
    	value: function(file) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//Peforming check for file to exist
    		var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, create, result;
    		//Upon successful check, handling results
    		if (check.success) {
    			//Handling status of check
    			switch (check.status) {
    				case 204:
    					//File exists
    					result = {};
    					result.content = this.application.ninja.coreIoApi.readFile(file).content;
    					result.details = this.infoFile(file);
    					status = check.status;
    					break;
    				case 404:
    					//File does not exists, ready to be created
    					status = check.status;
    					break;
    				default:
    					//Unknown Error
    					status = 500;
    					break;
    			}
	   		} else {
	    		//Unknown Error
	    		status = 500;
    		}
    		//Returning resulting code
    		return {status: status, file: result};
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    saveFile: {
    	enumerable: true,
    	value: function(file) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//Peforming check for file to exist
    		var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), status, result;
    		//Upon successful check, handling results
    		if (check.success) {
    			//Handling status of check
    			switch (check.status) {
    				case 204:
    					//File exists
    					result = this.application.ninja.coreIoApi.updateFile(file);
    					status = 204;
    					break;
    				case 404://createFile
    					//File does not exists, ready to be created
    					result = this.application.ninja.coreIoApi.createFile(file);
    					status = 404;
    					break;
    				default:
    					//Unknown Error
    					status = 500;
    					break;
    			}
	   		} else {
	    		//Unknown Error
	    		status = 500;
    		}
    		//
    		return {status: status, result: result};
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    deleteFile: {
    	enumerable: true,
    	value: function() {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    copyFile: {
    	enumerable: true,
    	value: function() {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    infoFile: {
    	enumerable: true,
    	value: function(file) {
    		//Checking for API to be available
    		if (!this.application.ninja.coreIoApi.cloudAvailable()) {
    			//API not available, no IO action taken
    			return null;
    		}
    		//
    		var check = this.application.ninja.coreIoApi.fileExists({uri: file.uri}), details;
    		//
    		if (check.success) {
    			//Handling status of check
    			switch (check.status) {
    				case 204:
    					//File exists
    					details = JSON.parse(this.application.ninja.coreIoApi.isFileWritable(file).content);
    					details.uri = file.uri;
    					details.name = this.getFileNameFromPath(file.uri);
    					details.extension = details.name.split('.')[details.name.split('.').length-1];
    					break;
    				case 404:
    					//File does not exists, ready to be created
    					
    					break;
    				default:
    					//Unknown Error
    					
    					break;
    			}
	   		} else {
	    		//Unknown Error
	    		
    		}
    		return details;
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    getFileNameFromPath : {
        value: function(path) {
            path = path.replace(/[/\\]$/g,"");
            path = path.replace(/\\/g,"/");
            return path.substr(path.lastIndexOf('/') + 1);
        }
    }
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
open: {
    	enumerable: true,
    	value: function(doc, type, uri, server) {
    		//
    		var file = {}, head, body, h, b;
    		file.uri = uri;
    		file.server = server;
    		//
    		if (doc.content) {
    			if (type === 'html' || type === 'htm') {
    				//
    				h = doc.content.split('</head>');
    				h = h[0].split('<head>');
    				head = h[1];
    				//
    				b = doc.content.split('</body>');
    				b = b[0].split('<body>');
    				body = b[1];
    				//
    				file.type = 'html';
    				file.head = head;
    				file.body = body;
    			} else {
    				//TODO: Add other file type routines
    				file.type = type;
    				file.content = doc.content;
    			}		
    		} else {
   				//TODO: File is empty
   				if (type === 'html' || type === 'htm') {
   					head = '';
   					body = '';
   					//
   					file.type = 'html';
    				file.head = head;
    				file.body = body;
   				} else {
   					//TODO: Add other file type routines
    				file.type = type;
    				file.content = doc.content;
   				}
   			}
   			//TODO: Load contents into App
            //documentManagerModule.DocumentManager.openDocument(file);
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    save: {
    	enumerable: true,
    	value: function(type, id, components) {
    		
    		
    		
    		//
    		var contents, counter = 0;
    		//Checking for document type to go through saving routine
    		switch (type.toLowerCase()) {
    			case 'html':
    				//Checking for components in components panel
    				if (components) {
    					var comps = '', comp, html, mbind, hackParams = '', compSerializer = Serializer.create();
    					//TODO: Check if this is needed since compSerializer was localized
						compSerializer._serializedObjects = [];
						//
    					html = document.getElementById(id).contentDocument.getElementById('UserContent').innerHTML;
    					//
    					for(var i in components){
    						//
    						comp = compSerializer.serializeObject(components[i]);
    						//TODO: Remove this HACK
    						if (components[i]._montage_metadata.__proto__.objectName == 'PhotoEditor') {
    							if (components[i].pathToJSON) {
    								hackParams = '"pathToJSON": "'+components[i].pathToJSON+'",\n';
    							}
    						} else {
    							
    						}
    						var split = comp.split('"element":U("m-obj://undefined/'+components[i]._element.uuid);
    						comp = split[0]+hackParams+'\t"element":E("#'+components[i]._element.id+split[1];
    						if (document.getElementById(id).contentDocument.getElementById(components[i]._originalElementId).innerHTML.length > 2) {
    							split = html.split(document.getElementById(id).contentDocument.getElementById(components[i]._originalElementId).innerHTML);
    							html = split[0]+split[1];
    						}
    						//
    						if (counter > 0) {
    							comps += ',\n'+comp;
    						} else {
    							comps += comp;
    						}
    						counter++;
    	       			}
            	
            			for(var i in components){
            				//
            				if (components[i]._bindingDescriptors){
            					var split = comps.split('U("m-obj://undefined/'+components[i]._bindingDescriptors.uuid+'", {\n    })');
    							comps = split[0]+'\n'+
    									'{\n'+
                                    	'"'+components[i].binding.sourceProperty+'": {\n'+
                                        '"boundObject": U("m-obj://'+components[i].binding.target._montage_metadata.__proto__.objectName+'/'+components[i].binding.target.uuid+'?mId='+components[i].binding.target._montage_metadata.__proto__.moduleId+'"),\n'+
                                        '"boundObjectPropertyPath": "'+components[i].binding.targetProperty+'"\n'+
                                    	'}\n'+
                                		'}\n'+
    									split[1];
    						}
            			}
    					var montage = 	'<script type="text/m-objects">\n\t\t\t{\n'+
    									'\t\t\t"$rootObject": U("m-obj://Application/application-uuid?mId=montage/application", {\n'+
            							'\t\t\t\t"components": [\n'+
           								comps+
            							'\n\t\t\t\t]\n\t\t\t})\n\t\t\t}\n\t\t</script>';
								    	
    					contents = '<html>\n\t<head>'+document.getElementById(id).contentDocument.getElementById('userHead').innerHTML+'\n\t\t'+montage+'\n\t</head>\n\t<body>\n'+html+'\n\t</body>\n</html>';
    				} else {
    					//No m-js components in file, so saving plain document HTML
    					contents = '<html>\n\t<head>'+document.getElementById(id).contentDocument.getElementById('userHead').innerHTML+'\n\t</head>\n\t<body>\n'+document.getElementById(id).contentDocument.getElementById('UserContent').innerHTML+'\n\t</body>\n</html>';
    				}
    				break;
    			case 'css':
    				contents = this.getCssFromRules(document.getElementById(id).contentDocument.styleSheets[document.getElementById(id).contentDocument.styleSheets.length-1].cssRules);
    				break;
    			case 'js':
    				break;
    			case 'text':
    				break;
    			default:
    				break;
    		}
    		
    		
    		return contents;
    		
    		
    		
    	}
    },
    ////////////////////////////////////////////////////////////////////
    //
    saveAs: {
    	enumerable: true,
    	value: function(e) {
    		//TODO: Add functionality
    		console.log('FileIO: saveFileAs');
    	}
    },
    
    
    
    
    ////////////////////////////////////////////////////////////////////
    //Method to return a string from CSS rules (to be saved to a file)
    getCssFromRules: {
    	enumerable: false,
    	value: function (list) {
    		//Variable to store CSS definitions
    		var i, str, css = '';
    		//Looping through list
    		if (list && list.length > 0) {
    			//Adding each list item to string and also adding breaks
    			for (i = 0; list[i]; i++) {
    				str = list[i].cssText+' ';
    				str = str.replace( new RegExp( "{", "gi" ), "{\n\t" );
    				str = str.replace( new RegExp( "}", "gi" ), "}\n" );
    				str = str.replace( new RegExp( ";", "gi" ), ";\n\t" );
    				css += '\n'+str;
    			}
    		}
    		//Returning the CSS string
    		return css;
    	}
    }
*/
    
    
    

    
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////