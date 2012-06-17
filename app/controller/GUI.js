
Ext.define('DirectoryListing.controller.GUI', {
    extend: 'Ext.app.Controller',
    
    views: [ 'Viewport' ],
    stores: [  ],
    
    refs: [
        { ref: 'viewport', selector: 'viewport' },
        { ref: 'window', selector: 'window[xid=filewindow]' },
        { ref: 'dirtree', selector: 'window[xid=filewindow] treepanel[xid=dirtree]' },
        { ref: 'filelist', selector: 'window[xid=filewindow] gridpanel[xid=filelist]' },
        { ref: 'currentpath', selector: 'window[xid=filewindow] panel textfield[xid=current-path]' },
        
        { ref: 'openbutton', selector: 'window[xid=filewindow] gridpanel[xid=filelist] toolbar button[xid=file-open]' }
        
    ],
    
    
    init: function() {
       
        this.control({
            'window': {
               afterrender: this.onBodyRendered
            },
            'window treepanel[xid=dirtree] toolbar button': {
               click: this.onTreePanelButtonClicked
            },
            'window gridpanel[xid=filelist] toolbar button': {
               click: this.onGridPanelButtonClicked
            },
            'window treepanel[xid=dirtree]': {
               itemclick: this.onTreeDirSelected
            },
            'window[xid=filewindow] gridpanel[xid=filelist]': {
               itemclick: this.onFilelistSelected,
               itemdblclick: this.onOpenFile
            },
            scope:this
        });
        
        this.application.on({
            
            scope: this
        });
        
    },
    
   onBodyRendered: function() {
      this.getDirtree().getStore().load({
         params: {
            path:'/'
         }
      });
      
   },
   
   onTreePanelButtonClicked: function(btn) {
      if(btn.xid=='expandall') {
         btn.up('treepanel').expandAll();
      }
      if(btn.xid=="collapseall") {
         btn.up('treepanel').collapseAll();
      }
   },
   
   onGridPanelButtonClicked: function(btn) {
      if(btn.xid=='about') {
         Ext.require('DirectoryListing.view.AboutWindow', function() {
            Ext.create('DirectoryListing.view.AboutWindow').show();
         });
      }
      if(btn.xid=='file-open') {
         var record = btn.up('gridpanel').getSelectionModel().getSelection()[0];
         this.onOpenFile(null, record);
      }
   },
   
   onTreeDirSelected: function(tree, item) {
      var path = item.data.id;
      
      this.getFilelist().getStore().load({
         params: {
            path:path
         }
      });
      
      tree.expand(item);
      this.getOpenbutton().disable();
      this.getCurrentpath().setValue(item.data.id);
      
   },
   
   onFilelistSelected: function(grid, item) {
      this.getOpenbutton().enable();
   },
   
   onOpenFile: function(grid, item) {
      this.getOpenbutton().enable();
      window.open(item.data.metadata.url);
   }
   
    
});
