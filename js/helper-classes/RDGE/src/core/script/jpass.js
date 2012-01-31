/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

/*
 *	jpass geometry set - determines the category(s) of geometry that a pass will render
 *	can be OR'ed together
 */
jpassGeoSet =
{
	'BACKGROUND'	:1,
	'OPAQUE'		:2,
	'TRANSPARENT'	:4,
	'ADDITIVE'		:8,
	'TRANSLUCENT'	:16,
	'FOREGROUND'	:32,
	'ALL'			:127,
	'SCREEN_QUAD'	:128,	// a screen aligned quad - for rendering a texture to screen
	'SHADOW'		:256,	// the opaque geometry from shadow light's point of view
	'MAXSETS'		:9
};


/*
 *	The abstract base class that defines a jpass
 *	a jpass represents a single render pass of the scene graph
 */
_jpassBaseClass = function() {
    this.context = g_Engine.getContext();
    this.renderer = g_Engine.getContext().renderer;
    this.sortCats = rdgeConstants.categoryEnumeration;
    this.bucketCount = rdgeConstants.categoryEnumeration.MAX_CAT;

    // render order
    this.renderOrder = [];
    this.renderOrder[this.sortCats.BACKGROUND] = 0;
    this.renderOrder[this.sortCats.OPAQUE] = 1;
    this.renderOrder[this.sortCats.TRANSPARENT] = 2;
    this.renderOrder[this.sortCats.ADDITIVE] = 3
    this.renderOrder[this.sortCats.TRANSLUCENT] = 4;
    this.renderOrder[this.sortCats.FOREGROUND] = 5;

    // the name of this pass
    this.name = "renderPass_" + nodeIdGen.getId();

    /* 
    *	if 0 this pass and children are culled from rendering
    */
    this.visibility = 1;

    /*
    *	called when the pass is hidden - override for customication
    */
    this.onHide = function() {

    }

    /*
    *	Called by the system to hide the pass and its children
    */
    this.hidePass = function() {
        this.onHide();

        for (var i = 0, len = this.children.length; i < len; ++i) {
            this.children[i].hidePass();
        }
    }

    /*
    *	the default output render targets that this pass will create
    */
    this.defaultTargetOut = {};

    /*
    * All the outputs required by the pass
    */
    this.outputs =
	[
    // example
    // {'name':"u_mainRT", 'type':"target", 'width':1024, 'height':1024, 'mips':false}
	];

    /*
    *	notifies the the renderer that the viewport was modified and needs to be reset
    */
    this.dirty = false;

    /*
    *	Index of the currently selected output target
    */
    this.outputIndex = 0;

    /*
    *	outputs from the previous pass are set as inputs for this pass
    */
    this.inputs =
	[
	];

    /*
    *	other textures requested for this pass
    */
    this.textures =
	[

	];

    /*
    *	the flags that control how the pass is rendered
    */
    this.frustum_culling = "enable"; 		// disable/enable frustum culling during the pass
    this.clear = null; 						// flags to clear the output target with before rendering
    this.clearColor = null;

    /*
    *	Contains a list of geometry to be rendered, during a post process render pass this will usually by a screen quad
    */
    this.renderList =
	[
    // example
    // { 'name':'opaqeobjects', 'geo'{ 'OPAQUE':[ new renderObject(meshNode, transformNode, RenderContext)]} }
	];

    /*
    *	The passes that will render after this pass
    */
    this.children = [];

    /*
    *	This shader will override all other shaders
    */
    this.shader = null;

    /*
    *	Technique of from shader to use, if null currently set technique is used
    */
    this.technique = null;

    /*
    *	determines the geometry that will be rendered during the pass
    */
    this.geometrySet = "SCREEN_QUAD";


    /*
    *	A camera set here will override any camera active in the scene
    */
    this.camera = null;

    /*
    *	Initialize the pass
    */
    this.init = function() {

    }

    /*
    *	inserts a node into the child map using the pass name as the key
    */
    this.insertChildPass = function(jpassObj) {
        this.children[jpassObj.name] = jpassObj;
    }

    /*
    *	the scene-graph to process
    */
    this.process = function() {
        // pre-defined local variables to prevent allocation
        var context;
        var shaderProg;
        var listCount;
        var len;
        var passes;
        var pass;
        var node;
        var mesh;
        var meshCount;
        var nodeIdx = 0;
        var meshIdx = 0;
        var paramIdx = 0;
        var passIdx = 0;

        var renderer = g_Engine.getContext().renderer;

        //this.renderer = g_Engine.getContext().renderer;

        // bind output target for rendering
        this.bindOutput();

        // call custom pre-render step
        this.preRender();

        var activeCam = renderer.cameraManager().getActiveCamera();

        if (this.technique) {
            this.shader.setTechnique(this.technique);
        }

        renderer.projectionMatrix = activeCam.proj;

        // parameters that can be set once per pass
        rdgeGlobalParameters.u_inv_viewport_width.set([1.0 / renderer.vpWidth]);
        rdgeGlobalParameters.u_inv_viewport_height.set([1.0 / renderer.vpHeight]);
        rdgeGlobalParameters.u_farZ.set([activeCam.zFar()]);
        rdgeGlobalParameters.u_projMatrix.set(renderer.projectionMatrix);

        for (var bucketIdx = 0, bckCnt = this.renderList.length; bucketIdx < bckCnt; ++bucketIdx) {
            //var curList		= this.renderList[bucketIdx];
            listCount = this.renderList[bucketIdx].length;

            for (nodeIdx = 0; nodeIdx < listCount; ++nodeIdx) {
                node = this.renderList[bucketIdx][nodeIdx].node;

                if (node.world) {
                    context = this.renderList[bucketIdx][nodeIdx].context;
                    shaderProg = this.shader ? this.shader : context.shaderProg;

                    renderer.mvMatrix = mat4.mul4x3(node.world, activeCam.view);
                    renderer.invMvMatrix = mat4.inverse(renderer.mvMatrix);
                    renderer.normalMatrix = mat4.transpose(renderer.invMvMatrix);
                    
                    rdgeGlobalParameters.u_mvMatrix.set(renderer.mvMatrix);
                    rdgeGlobalParameters.u_normalMatrix.set(renderer.normalMatrix);
                    rdgeGlobalParameters.u_worldMatrix.set(node.world);

                    rdgeGlobalParameters.u_viewMatrix.set(activeCam.view);
                    rdgeGlobalParameters.u_invViewMatrix.set(mat4.inverse(activeCam.view));
                    rdgeGlobalParameters.u_invMvMatrix.set(renderer.invMvMatrix);

                    len = context.uniforms.length;
                    for (paramIdx = 0; paramIdx < len; ++paramIdx) {
                        rdgeGlobalParameters[context.uniforms[paramIdx].name].set(context.uniforms[paramIdx].value);
                    }

                    // augment the texture list with any post processing textures
                    this.updateTextureContext(context.textureList);

                    shaderProg.setLightContext(context.lights);
                    shaderProg.setTextureContext(context.textureList);

                    passes = shaderProg.begin();
                    pass = null;
                    for (passIdx = 0; passIdx < passes; ++passIdx) {
                        pass = shaderProg.beginPass(passIdx);

                        meshCount = node.meshes.length;
                        for (meshIdx = 0; meshIdx < meshCount; ++meshIdx) {
                            mesh = g_meshMan.getModelByName(node.meshes[meshIdx].mesh.name);

                            if (mesh)
                                renderer.drawPrimitive(mesh.primitive, pass.program, pass.attributes);

                        }

                        shaderProg.endPass();

                        this.onPassEnd();
                    }

                    shaderProg.end();
                }
            }

        }

        // call custom post render step
        this.postRender();

        // remove the bound render target if applicable
        this.unbindOutput();
    }

    /*
    *	handle any setup 'before' processing the geo/scenegraph
    *	the first step in the pass
    */
    this.preRender = function() {

    }


    /*
    *	handle any setup 'after' processing the geo/scenegraph
    *	the last step in the pass
    */
    this.postRender = function() {

    }


    /*
    *	Custom function to handle any processing in between jshader passes
    */
    this.onPassEnd = function() {
        if (this.outputIndex + 1 < this.outputs.length)
            ++this.outputIndex;
    }

    /*
    *	Set the list of objects to render
    */
    this.setRenderList = function(contextList) {
        this.renderList = contextList;
    }

    /*
    *	Set the render targets to use as input for the next pass
    */
    this.setInputs = function(inputsArr) {
        this.inputs = inputsArr.slice();
    }

    /*
    *	Augment the textureList passed in with the input textures
    *	this will cause the textures to be bound to the jshader
    */
    this.updateTextureContext = function(textureList) {
        var inputs = this.inputs.slice();
        for (var i = 0; i < this.inputs.length; ++i) {
            textureList.push(inputs[i]);
        }

        for (var i = 0; i < this.textures.length; ++i) {
            if (this.textures[i].enabled)
                textureList.push(this.textures[i]);
        }
    }

    /*
    *	If there is an output surface this will bind it
    */
    this.bindOutput = function() {
        this.outputIndex = 0;
        if (this.outputs[this.outputIndex]) {
            this.dirty = true;
            var oldClear = null;
            var fb = this.outputs[this.outputIndex].data[0].frameBuffer;
            this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER, fb);
            this.renderer.ctx.viewport(0, 0, fb.width, fb.height);
            if (this.clearColor) {
                oldClear = this.renderer.clearColor;
                this.renderer.setClearColor(this.clearColor);
            }

            if (this.clear)
                this.renderer.clear(this.clear);
            else
                this.renderer._clear();

            if (this.clearColor) {
                this.renderer.setClearColor(oldClear);
            }
        }
    }

    /*
    *	If an output surface was bound this will unbind it
    */
    this.unbindOutput = function() {
        if (this.dirty) {
            this.dirty = false;
            this.renderer.ctx.bindFramebuffer(this.renderer.ctx.FRAMEBUFFER, null);
            this.renderer.setViewPort(0, 0, this.renderer.vpWidth, this.renderer.vpHeight);
        }

    }
}

/*
 *	The concrete class to be used when creating a scene pass
 */
jpass = function( def )
{
	// inherit from the base class
	this.inheritedFrom = _jpassBaseClass;
	this.inheritedFrom();
	
	// setup the jpass as defined, recursively instantiated the children as they are encountered
	for(var obj in def)
	{
		this[obj] = def[obj];
		
		if(obj == "children")
		{
			var childCount = this[obj].length;
			for(var i = 0; i < childCount; ++i)
			{
				this[obj][i] = new jpass(this[obj][i]);
			}
		}
		// validate array and create the texture/render-target
		else if(obj == "inputs" || obj == "outputs")
		{
			// this makes sure the data type was passed as an array and converts it to an array if needed
			if(!this[obj].slice())
			{
				this[obj] = [this[obj]];
			}
			
			var count = this[obj].length;
			for(var i = 0; i < count; ++i)
			{
				// if the texture/render-target is not created yet do so now
				if(!this[obj][i].data)
				{
					if(this[obj][i].type == "target")
					{
						// setup the render target
						this[obj][i].data = [this.renderer.createRenderTargetTexture(this[obj][i].name, this[obj][i].width, this[obj][i].height, this[obj][i].mips)];
					}
					else
					{
						// make sure data is defined
						this[obj][i].data = [null]				
					}
				}
				
				if(!this[obj][i].handle)
				{
					this[obj][i].handle = this[obj][i].data[0];
				}
			}
		}
		else if("renderList" == obj)
		{
			// put the items listed into their  buckets
			var renderList  = new Array(rdgeConstants.categoryEnumeration.MAX_CAT);
			renderList[rdgeConstants.categoryEnumeration.BACKGROUND]		= [];	//BACKGROUND	
			renderList[rdgeConstants.categoryEnumeration.OPAQUE]			= [];	//OPAQUE		
			renderList[rdgeConstants.categoryEnumeration.TRANSPARENT]		= [];	//TRANSPARENT
			renderList[rdgeConstants.categoryEnumeration.ADDITIVE]			= [];	//ADDITIVE
			renderList[rdgeConstants.categoryEnumeration.TRANSLUCENT]		= [];	//TRANSLUCENT
			renderList[rdgeConstants.categoryEnumeration.FOREGROUND]		= [];	//FOREGROUND
			
			for(var buckets in this[obj])
			{
				// get the enumeration value (ie rdgeConstants.categoryEnumeration.OPAQUE)
				var bucket = rdgeConstants.categoryEnumeration[buckets];
				
				// create the list for this bucket
				
				var len = this[obj][buckets].length;
				for(var i = 0; i < len; ++i)
				{
					// add the corresponding objects to the bucket
					renderList[bucket].push(this[obj][buckets][i]);
				}
				
			}
			
			// overwrite with the new list
			this[obj] = renderList;
		}
		else if("shader" == obj)
		{
			// setup the shader
			if(typeof this[obj] == "string")
			{
				this.shader = new jshader(this[obj]);				
			}
			else
			{
				var finalShader = new jshader();
				finalShader.def = this[obj];
				finalShader.init();
				this[obj] = finalShader;
			}
		}
		else if("geometrySet" == obj)
		{
			if( typeof this[obj] == "string")
			{
				var sets = this[obj].split("|");
				
				var setValue = 0;
				for(var i = 0; i < sets.length; ++i)
				{
					setValue |= jpassGeoSet[sets[i]];	
					if(sets[i] === "SCREEN_QUAD")
					{
						this[obj] = jpassGeoSet[sets[i]];
						this.renderList[0] = [new renderObject( createScreenQuadNode() )];
						break;
					}
				}
				
				this[obj] = setValue;
			}
		}	
		else if("textures" == obj)
		{
			for(var i = 0, len = this[obj].length; i < len; ++i)
			{
				if(typeof this[obj][i].data == "string")
				{
					this[obj][i].name = this[obj][i].data;
					this[obj][i].data = [this[obj][i].data];
					this[obj][i].enabled = true;
				}
				else
				{
					this[obj][i].name = this.renderer.getTextureByName(this[obj][i].data[0].lookUpName);
				}
			}
		}
		
	}
	
	// call initialize code
	this.init();
	
}

/*
 *	a graph describing the hierarchy of scene pass objects to create the final composition
 */ 
jpassGraph = function( def )
{
	// the root pass
	this.root = null;
	
	// going through steps to build the pass graph
	if(def && typeof def == "string")
	{
		// make ajax request
	}
	else if(def)
	{
		this.root = new jpass(def);
	}
	else
	{
		this.root = new jpass({});	
	}
	
	this.find = null;
	this.insert = null;
	
	// an index to the opaque bucket
	this.OPAQUE = rdgeConstants.categoryEnumeration.OPAQUE;
	
	this.setPassRoot = function(jpassObj)
	{
		this.root = jpassObj;
	}
	
	/*
	 *	Helper function to generate the references to passes available as passGraph."passName"
	 */
	this._initHelper = function(node)
	{
		if(!node)
			return;
			
		this[node.name] = node;

		for(var child in node.children)
		{
			this._initHelper(node.children[child]);
		}
	}
	this._initHelper(this.root);
	
	/*
	 *	@param parentName - the name of the parent object to insert under
	 *	@param jpassObj - the jpass object to insert
	 */
	this.insertAsChild = function(parentName, jpassObj)
	{
		this.find = parentName;
		this.insert = jpassObj;
		
		// create ref for this object
		this[jpassObj.name] = jpassObj;
		
		this._insertHelper(this.root);
		
		this.find = null;
		this.insert = null;
	}
	
	/*
	 *	Recursive helper function for traversing the graph and insterting the node
	 */
	this._insertHelper = function(node)
	{
		if(!node)
			return false;
			
		if(node.name == this.find)
		{
			node.insertChildPass(this.insert);
			return true;
		}
		
		for(var child in node.children)
		{
			if(this._insertHelper(node.children[child]))
			{
				break;
			}
		}
		
		return true;
	}
	
	// maps jpassGeoSet values to indices
	this.geoSetMap = [];
	var geoSetIdx = 0;
	for(var geoSet in jpassGeoSet)
	{
		this.geoSetMap[geoSetIdx++] = jpassGeoSet[geoSet];
	}
	
	/*
	 *	Traverse the render graph, breadth first to produce the final render output
	 *	note: breadth first is used to allow generation of an entire level at once, 
	 *	the peers in one level could, in theory, be processed in parallel
	 */
	this.render = function( sceneGraph ) {

		g_renderStats.numPasses.value=0;
		var renderList = sceneGraph.renderList;
		var renderer = g_Engine.getContext().renderer;
		
		// set the first pass with scene geometry
		this.root.setRenderList(renderList);
		
		var curRenderList = null;
		
		var queue = [ {'parent':this.root } ];
		
		var parent = null;
		var setCount = this.geoSetMap.length;
		var maxCats	 = rdgeConstants.categoryEnumeration.MAX_CAT;
		var idx = 0;
		var renderListIdx = 0;
		
		while(queue.length)
		{
			var parent = queue.shift().parent;
			
			// pull out the shadow geometry
			if(sceneGraph.shadowsEnabled && parent.geometrySet === jpassGeoSet.SHADOW)
			{
				parent.setRenderList( [ sceneGraph.shadowRenderList ] );
			}
			// screen quad needs special prep since geometry is never re-assigned, lists needs to be cleaned up
			else if(parent.geometrySet === jpassGeoSet.SCREEN_QUAD)
			{
				parent.renderList[0][0].context.textureList = [];
			}
			// pull out all the sort categories that the pass requested
			else
			{
				curRenderList = [];
				renderListIdx = 0;
				
				// create the pass's render list
				for(idx = 0; idx < setCount; ++idx)
				{
					// assign the render list, checking to make sure the index is less than the total number of material categories
					if(parent.geometrySet & this.geoSetMap[idx])
					{
						if(renderList[idx])
						{
							curRenderList[renderListIdx++] = renderList[idx];
						}
					}
				}
				
				parent.setRenderList(curRenderList);
			}

			// if this pass has a camera push it on the stack
			if(parent.camera)
			{
				renderer.cameraManager().pushCamera(parent.camera);
			}	
			
			// process the geometry - all rendering occurs here
			g_renderStats.numPasses.value++;
			parent.process();
			
			// if this pass had a camera pop it off the stack
			if(parent.camera)
			{
				renderer.cameraManager().popCamera();
			}
			
			// push on the children
			for(idx = parent.children.length - 1; idx >= 0; --idx)
			{
				if(parent.children[idx].visibility === 1)
				{
					parent.children[idx].setInputs( parent.outputs );
					queue.unshift({'parent': parent.children[idx] });
				}
				else if(parent.children[idx].visibility === 0)
				{
					parent.children[idx].hidePass();
					parent.children[idx].visibility = 2;
				}
			}
		}
    }
}
