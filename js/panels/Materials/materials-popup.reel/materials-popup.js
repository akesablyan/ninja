/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage,
    Component   = require("montage/ui/component").Component;
var Button = 			require("js/components/button.reel").Button;

////////////////////////////////////////////////////////////////////////
//Exporting as MaterialsPopup
exports.MaterialsPopup = Montage.create(Component, {
	////////////////////////////////////////////////////////////////////
    okButton: {
        enumerable: false,
        value: null
    },

    cancelButton: {
        enumerable: false,
        value: null
    },

    ////////////////////////////////////////////////////////////////////
	// Material Properties

    materialsProperties: {
        enumerable: true,
        serializable: true,
        value: null
    },

    _materialName: {
        enumerable: true,
        value: "Material"
    },

	materialTitle: {
		enumerable: true,
		value: null
	},

	captureAction: {
		value:function(event) {
			switch(event._currentTarget.label)
			{
				case "Cancel":
					console.log("Cancel material edit");
					break;
				case "OK":
					console.log("Committing material with the following values:");
                    for(var i=0, len=this.materialsProperties.childComponents.length; i< len; i++)
                    {
                        var childControl = this.materialsProperties.childComponents[i];
                        var childValue = childControl._control[childControl._prop];

                        if(typeof childValue === "object")
                        {
                            console.log(childControl.label + " is ");
                            console.dir(childValue);
                        }
                        else
                        {
                            console.log(childControl.label + " is " + childValue);
                        }
                        console.log("--------------");

                    }
					break;
			}
		}
	},

    updatePreview:
    {
        value: function(event)
        {
            if(event.type === "propertyChanging")
            {
                this._handlePropertyChanging(event);
            }
            else
            {
                this._handlePropertyChange(event);
            }
        }
    },

    _handlePropertyChanging:
    {
        value: function(event)
        {
            if(typeof event.propertyValue === "object")
            {
                console.log(event.propertyLabel + " changing to ");
                console.dir(event.propertyValue);
            }
            else
            {
                console.log(event.propertyLabel + " changing to " + event.propertyValue);
            }

			if (event.propertyLabel && event.propertyValue)
				this.applyProperty( event.propertyLabel,  event.propertyValue );
        }
    },

    _handlePropertyChange:
    {
        value: function(event)
        {
            if(typeof event.propertyValue === "object")
            {
                console.log(event.propertyLabel + " changed to ");
                console.dir(event.propertyValue);
            }
            else
            {
                console.log(event.propertyLabel + " changed to " + event.propertyValue);
            }

			if (event.propertyLabel)
				this.applyProperty( event.propertyLabel,  event.propertyValue );
        }
    },

	applyProperty:
	{
		value: function( propLabel, propValue)
		{
			// find the property lable in the array
			// This assumes no duplication in labels
			if (this._propLabels)
			{
				// the label cones through with a trailing ':'.  remove that
				var ch = propLabel[ propLabel.length - 1];
				if (ch == ':')
					propLabel = propLabel.substr(0, propLabel.length - 1);
				
				var index;
				var nProps = this._propLabels.length;
				for (var i=0;  i<nProps;  i++)
				{
					if (this._propLabels[i] == propLabel)
					{
						index = i;
						break;
					}
				}
				if ((index != null) && this._material)
				{
					var value = this.decodeValue( this._propTypes[index],  propValue );
					this._material.setProperty( this._propNames[index],  value );
				}
			}
		}
	},

	decodeValue:
	{
		value: function( type,  value )
		{
			var rtnValue;
			switch (type)
			{
				case "color":
					rtnValue = [ value['r']/255.0,  value['g']/255.0,  value['b']/255.0, value['a'] ];
					break;

				case "vector2d":
				case "vector3d":
					rtnValue = [];
					for (var i in value)  rtnValue.push( value[i] );
					break;

				case "float":
					rtnValue = value;
					break;

				case "file":
					if (value && (value.length > 0))
					{
						var index = value.lastIndexOf( "/" );
						if (index < 0)  index = value.lastIndexOf( "\\" );
						if (index >= 0)
							value = value.substr( index+1 );
						value = "assets\\images\\" + value;
						rtnValue = value.slice(0);
					}
					break;

				case "checkbox":
					rtnValue = value;
					break;

				default:
					console.log( "unrecognized material control type: " + type );
					break;
			}
			return rtnValue;
		}
	},

    ////////////////////////////////////////////////////////////////////
	//
	prepareForDraw: {
		enumerable: false,
		value: function() {
            this.cancelButton.addEventListener("action", this, true);

            this.okButton.addEventListener("action", this, true);
        }
    },
	////////////////////////////////////////////////////////////////////
	//
	didDraw: {
		enumerable: false,
		value: function() {
           this.materialTitle.innerHTML = this._materialName;
		}
	},

	//Garbage collection (Manual method)
	destroy: {
		enumerable: false,
		value: function() {
			// add cleanup routines here
		}
	},

	loadMaterials:
	{
		enumerable: true,
		value: function(materialID)
		{
           this._materialName = materialID;
            if(	
					(materialID === "BrickMaterial")				||
					(materialID ===  "UberMaterial")				|| 
					(materialID ===  "FlatMaterial")				||
 					(materialID ===  "BumpMetalMaterial")			||
 					(materialID ===  "PlasmaMaterial")				||
 					(materialID ===  "LinearGradientMaterial")		||
 					(materialID ===  "RadialGradientMaterial")		||
 					(materialID ===  "RadialBlurMaterial")			||
 					(materialID ===  "PulseMaterial")				||
 					(materialID ===  "TunnelMaterial")				||
 					(materialID ===  "TwistMaterial")				||
 					(materialID ===  "KeleidoscopeMaterial")		||
 					(materialID ===  "JuliaMaterial")				||
 					(materialID ===  "MandelMaterial")				||
 					(materialID ===  "IridescentScalesMaterial")
				)
			{
				var material = MaterialsLibrary.getMaterial( materialID );
				if (material)
				{
					this._material = material;
					var matData = this.getMaterialData( material );
					this.materialsData = matData;
				}
            }
            else
            {
                this.materialsData = this._dummyData1;
            }
            
           this.needsDraw = true;
		}
	},

	getMaterialData:
	{
		value: function( material )
		{
			// declare the array to hold the results
			var rtnArray = [];

			var propNames = [],  propValues = [],  propTypes = [],  propLabels = [];
			this._propNames = propNames;
			this._propValues = propValues;
			this._propTypes = propTypes;
			this._propLabels = propLabels;
			material.getAllProperties( propNames,  propValues,  propTypes,  propLabels);
			var n = propNames.length;
			for (var i=0;  i<n;  i++)
			{
				var obj;
				switch (propTypes[i])
				{
					case "color":
						obj = this.createColorData( propLabels[i], propValues[i] );
						break;

					case "vector2d":
						obj = this.createVectorData( 2, propLabels[i], propValues[i] );
						break;

					case "vector3d":
						obj = this.createVectorData( 3, propLabels[i], propValues[i] );
						break;

					case "float":
						obj = this.createFloatData( propLabels[i], propValues[i] );
						break;

					case "file":
						obj = this.createFileData( propLabels[i], propValues[i] );
						break;

					case "checkbox":
						obj = this.createCheckboxData( propLabels[i], propValues[i] );
						break;

					default:
						console.log( "unrecognized material control type: " + propType[i] );
						break;
				}

				if (obj)
				{
					rtnArray.push( obj );
					obj = null;
				}
			}

			return rtnArray;
		}
	},

	createColorData:
	{
		value:  function( label,  color )
		{
			var obj =
			{
				"label":		label,
				"description":	"a color",
				"controlType":	"ColorChip",
                "defaults":
                {
					"color":	{ r:color[0]*255, g:color[1]*255, b:color[2]*255, a:color[3] }
				}
			};

			return obj;
		}
	},

	createFloatData:
	{
		value: function( label, value )
		{
			var obj =
			{
                "label":         label,
                "description":   "floating point value",
                "controlType":   "HotText",
                "defaults":
                {
                    "minValue": 0,
                    "maxValue": 128,
                    "decimalPlace": 100,
					"value": value
                }
			}

			return obj;
		}
	},
	
	createCheckboxData:
	{
		value: function( label, value )
		{
			var obj =
			{
                "label":         label,
                "description":   "checkbox",
                "controlType":   "Button",
                "defaults":
                {
                    "isToggleButton": true,
					"value": value
                }
			}

			return obj;
		}
	},

	createFileData:
	{
		value: function( label, value )
		{
			var obj =
			{
                "label":         label,
                "description":   "Image file",
                "controlType":   "FileInput",
                "defaults":
                {
                    "filePath": value
                }
            };

			return obj;
		}
	},

	createVectorData:
	{
		value: function( dimen, label, value )
		{
			var obj = 
			{
                "label":         label,
                "description":   "a vector",
                "controlType":   "InputGroup",
                "defaults":
                {
                    data:[
                        {
                            "label":         "X",
                            "description":   "X value",
                            "controlType":   "HotText",
                            "defaults":
                            {
								"decimalPlace": 100,
								"minValue": -10,
                                "maxValue":  10,
                                "value": value[0]
                            }
                        },
                        {
                            "label":         "Y",
                            "description":   "Y value",
                            "controlType":   "HotText",
                            "defaults":
                            {
								"decimalPlace": 100,
								"minValue": -100,
                                "maxValue":  100,
								"value":	value[1]
                           }
                        }
                    ]
                }
			}

			if (dimen > 2)
			{
				obj["defaults"]["data"][2] =
				{
					"label":         "Z",
					"description":   "Z value",
					"controlType":   "HotText",
					"defaults":
					{
						"minValue": -1.e8,
						"maxValue":  1.e8,
						"value":	value[2]
					}
				}
			}

			return obj;
		}
	},

    _dummyData1: {
        value: [
            {
                "label":         "Texture1",
                "description":   "Texture1 value",
                "controlType":   "FileInput",
                "defaults":
                {
                    "filePath": "http://localhost/"
                }
            },
            {
                "label":         "Diffuse",
                "description":   "Diffuse value",
                "controlType":   "ColorChip",
                "defaults":
                {
                }
            },
            {
                "label":         "Specular",
                "description":   "Specular value",
                "controlType":   "Button",
                "defaults":
                {
                    "isToggleButton": true
                }
            },
            {
                "label":         "Shininess",
                "description":   "Shininess value",
                "controlType":   "HotText",
                "defaults":
                {
                    "minValue": 0,
                    "maxValue": 128,
                    "decimalPlace": 100
                }
            },
            {
                "label":         "RGB",
                "description":   "RGB value",
                "controlType":   "InputGroup",
                "defaults":
                {
                    data:[
                        {
                            "label":         "R",
                            "description":   "R value",
                            "controlType":   "HotText",
                            "defaults":
                            {
                                "minValue": 0,
                                "maxValue": 255,
                                "value": 255
                            }
                        },
                        {
                            "label":         "G",
                            "description":   "G value",
                            "controlType":   "HotText",
                            "defaults":
                            {
                                "minValue": 0,
                                "maxValue": 255
                            }
                        },
                        {
                            "label":         "B",
                            "description":   "B value",
                            "controlType":   "HotText",
                            "defaults":
                            {
                                "minValue": 0,
                                "maxValue": 255
                            }
                        }
                    ]
                }
            },
            {
                "label":         "XYZ",
                "description":   "XYZ value",
                "controlType":   "InputGroup",
                "defaults":
                {
                    data:[
                        {
                            "label":         "X",
                            "description":   "X value",
                            "controlType":   "TextField",
                            "defaults":
                            {
                                "text": "0"
                            }
                        },
                        {
                            "label":         "Y",
                            "description":   "Y value",
                            "controlType":   "TextField",
                            "defaults":
                            {
                                "text": "0"
                            }
                        },
                        {
                            "label":         "Z",
                            "description":   "Z value",
                            "controlType":   "TextField",
                            "defaults":
                            {
                                "text": "1"
                            }
                        }
                    ]
                }
            },
            {
                "label":         "Foo",
                "description":   "Foo value",
                "controlType":   "Slider",
                "defaults":
                {
                    "minValue":    0,
                    "maxValue":    100,
                    "value":    50,
                    "allowTrackClick": true
                }
            },
            {
                "label":         "Bar",
                "description":   "Bar value",
                "controlType":   "HotTextUnit",
                "defaults":
                {
                    "acceptableUnits": ["%"],
                    "value":    50,
                    "units": "%"
                }
            }
        ]
    },

    _dummyData2: {
        value: [
                    {
                        "label":         "Diffuse",
                        "description":   "Diffuse value",
                        "controlType":   "ColorChip",
                        "defaults":
                        {
                        }
                    },
                    {
                        "label":         "Ambient",
                        "description":   "Ambient value",
                        "controlType":   "ColorChip",
                        "defaults":
                        {
                        }
                    },
                    {
                        "label":         "Specular",
                        "description":   "Specular value",
                        "controlType":   "ColorChip",
                        "defaults":
                        {
                        }
                    },
                    {
                        "label":         "Shininess",
                        "description":   "Shininess value",
                        "controlType":   "HotText",
                        "defaults":
                            {
                                "minValue": 0,
                                "maxValue": 128
                            }
                    }
                ]
    },
    
    _materialsData: {
		enumerable: true,
        serializable: true,
	    value: this._dummyData1
    
	},

    materialsData: {
        enumerable: true,
        serializable: true,
        get: function() {
                return this._materialsData;
            },
        set: function(data) {
            this._materialsData = data;
            this.materialsProperties.needsDraw = true;
        }
    }


});