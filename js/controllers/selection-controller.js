/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */


var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.SelectionController = Montage.create(Component, {

    _isDocument: {
        value: true
    },

    isDocument: {
        get: function() {
            return this._isDocument;
        }
    },

    deserializedFromTemplate: {
        value: function() {
            this.eventManager.addEventListener("openDocument", this, false);
            this.eventManager.addEventListener("elementAdded", this, false);
            this.eventManager.addEventListener("elementDeleted", this, false);
            this.eventManager.addEventListener("selectAll", this, false);
            this.eventManager.addEventListener("deleteSelection", this, false);
//            defaultEventManager.addEventListener( "undo", this, false);
//            defaultEventManager.addEventListener( "redo", this, false);
        }
    },

    /**
     * Get the current document selection array. If nothing is selected the currentSelectionArray should be null
     */
    handleOpenDocument: {
        value: function() {
            // Handle initializing the selection array here.
        }
    },
    
    initWithDocument: {
        value: function(currentSelectionArray) {
            this._selectedItems = [];
            this._isDocument = true;

            if(currentSelectionArray) {
                if(currentSelectionArray.length >= 1) {
                    this._selectedItems = currentSelectionArray;
                    this._isDocument = false;
                }
            }

            this.dispatchEvent(selectionEvent.event);
        }
    },

    handleElementAdded: {
        value: function(event) {
            this.executeSelectElement(event.detail);
        }
    },

    handleElementDeleted: {
        value: function(event) {
            if(!this._isDocument) {

                if(this.findSelectedElement(event.detail) !== -1) {
                    this.executeSelectElement();
                }

            }

        }
    },

    handleSelectAll: {
        value: function(event) {
            var selected = [], childNodes = [];

            childNodes = this.application.ninja.currentDocument.documentRoot.childNodes;
            childNodes = Array.prototype.slice.call(childNodes, 0);
            childNodes.forEach(function(item) {
                if(item.nodeType == 1) {
                    selected.push(item);
                }
            });

            this.selectElements(selected);
        }
    },

    handleDeleteSelection: {
        value: function(event) {
            this.application.ninja.selectedElements = [];
            this._isDocument = true;
            NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
        }
    },

    /**
     * Select Element. This function will not check that element, it will simply add it to the selection array.
     */
    executeSelectElement: {
        value: function(item) {
            this.application.ninja.selectedElements = [];

            if(item) {
                this.application.ninja.selectedElements.push({_element: item, uuid: item.uuid});
                this._isDocument = false;
            } else {
                this._isDocument = true;
            }

            NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );

        }

    },

    selectElement: {
        value: function(item) {

            if(this.findSelectedElement(item) === -1) {

                if(this.application.ninja.currentDocument.inExclusion(item) !== -1){
                    if(this.isDocument) return;     // If the stage is already selected do nothing.
                    this.executeSelectElement();    // Else execute selection with no item
                } else {

                    if(item.parentNode.id == "UserContent") {
                        this.executeSelectElement(item);
                    } else {
                        var outerElement = item.parentNode;

                        while(outerElement.parentNode && outerElement.parentNode.id !== "UserContent") {
                            outerElement = outerElement.parentNode;
                        }

                        this.executeSelectElement(outerElement);
                    }
                }
            }
        }
    },

    selectElements: {
        value: function(items) {
            if(items && items.length > 0) {
                var that = this;
                this.application.ninja.selectedElements = [];

                items.forEach(function(item) {
                    that.application.ninja.selectedElements.push({_element: item, uuid: item.uuid});
                    that._isDocument = false;
                });

                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
            }
        }
    },

    shiftSelectElement: {
        value: function(item) {
            if(this.application.ninja.currentDocument.inExclusion(item) !== -1) return;

            (this.findSelectedElement(item) !== -1 ) ? this.removeElement(item) : this.insertElement(item);
        }
    },

    insertElement: {
        value: function(item) {
            if(item) {
                if(this._isDocument) {
                    this.application.ninja.selectedElements = [];
                    this._isDocument = false;
                }

                this.application.ninja.selectedElements.push({_element: item, uuid: item.uuid});

                NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );
            }
        }
    },

    removeElement: {
        value: function(item) {
            if(item){
                try{
                    if(this.application.ninja.selectedElements.length > 1) {
                        var idx = this.findSelectedElement(item);
                        if(idx != -1){
                            this.application.ninja.selectedElements.splice(idx, 1);
                        }
                    } else {
                        this.application.ninja.selectedElements = [];
                        this._isDocument = true;
                    }

                    NJevent("selectionChange", {"elements": this.application.ninja.selectedElements, "isDocument": this._isDocument} );

                } catch (err) {
                    console.log("Fault: " + err);
                }
            }

        }
    },





    handleUndo: {
        value: function(event) {
            this._applySelectionAfterUndoRedo(event.detail);
        }
    },

    handleRedo: {
        value: function(event) {
            this._applySelectionAfterUndoRedo(event.detail);
        }
    },

    _applySelectionAfterUndoRedo: {
        value: function(items) {
            if(items) {
                if(items instanceof Array) {
                    if(items.length > 1)
                    {
                        this.clearSelection();
                        this.setMultipleObjects(items);
                        documentControllerModule.DocumentController.DispatchElementChangedEvent(items);
                    }
                    else if(this._selectedItems.length === 0 || this.findSelectedElement(items) === -1) {
                        this.setSingleSelection(items[0]);
                        documentControllerModule.DocumentController.DispatchElementChangedEvent(items[0]);
                    }
                } else {
                    if(this._selectedItems.length === 0 || this.findSelectedElement(items) === -1) {
                        this.setSingleSelection(items);
                        //documentControllerModule.DocumentController.DispatchElementChangedEvent([items]);
                    }
                }

            } else {
                this.clearSelection();
            }
        }
    },

	isObjectSelected:
	{
		value: function( elt )
		{
			return this.findSelectedElement(elt) > -1;
		}
	},

    /**
     * Looks into the selectionObject for the item to be found using it's id
     *
     * @return: Item index in the selectionObject if found
     *          -1 if not found
     */
    findSelectedElement: {
        value: function(item) {
            var itemUUID;

            for(var i=0, uuid; this.application.ninja.selectedElements[i];i++) {
                // Check for multiple selection and excluding inner elements
                if(item.parentNode && item.parentNode.id !== "UserContent") {
                    var outerElement = item.parentNode;

                    while(outerElement.parentNode && outerElement.parentNode.id !== "UserContent") {
                        outerElement = outerElement.parentNode;
                    }

                    itemUUID = outerElement.uuid;
                } else {
                    itemUUID = item.uuid;
                }

                if(this.application.ninja.selectedElements[i].uuid === itemUUID) {
                    return i;
                }
            }

            return -1;

            // TODO: Not a true object because of the _element.
            //return this.application.ninja.selectedElements.indexOf(item);
        }
    }

});