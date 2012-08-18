
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
        { ref: 'openbutton', selector: 'window[xid=filewindow] gridpanel[xid=filelist] toolbar button[xid=file-open]' },
        { ref: 'directlinkbutton', selector: 'window[xid=filewindow] gridpanel[xid=filelist] toolbar button[xid=direct-link]' }
    ],
    
    
    init: function() {
       
        this.control({
            'window[xid=filewindow]': {
               afterrender: this.onBodyRendered
            },
            'window[xid=filewindow] treepanel[xid=dirtree] toolbar button': {
               click: this.onTreePanelButtonClicked
            },
            'window[xid=filewindow] gridpanel[xid=filelist] toolbar button': {
               click: this.onGridPanelButtonClicked
            },
            'window[xid=filewindow] gridpanel[xid=filelist]': {
               itemclick: this.onFilelistSelected,
               itemdblclick: this.onOpenFile
            },
            'viewport': {
               afterrender: this.onViewportRendered
            },
            scope:this
        });
        
        this.application.on({
            
            scope: this
        });
        
    },
    
   initstatus: false,
   expandPathArray: [],
   expandPathIndex: 0,
   expandPathString:'',
    
   expandPath: function(me, treenode) {
      if(me.expandPathArray[me.expandPathIndex]) {
         if(me.expandPathString=='') me.expandPathString="/";
         me.expandPathString += me.expandPathArray[me.expandPathIndex]+"/";
         treenode.findChild('id', me.expandPathString).expand(false, function() {
            me.expandPath(me, this);
            me.getDirtree().getSelectionModel().select(this);
            
         });
         me.expandPathIndex++;
      }
   },
    
   onBodyRendered: function() {
      var me = this;
      if(!me.initstatus) this.getDirtree().getSelectionModel().on('selectionchange', this.onTreeDirSelected, this);
      
      me.initstatus = true;
      me.expandPathArray = window.location.hash.split('/');
      me.expandPathIndex = 0;
      me.expandPathString = "";
      me.expandPathArray.shift();
      me.expandPathArray.pop();
      
      this.getDirtree().getStore().load({
         params: {
            path:'/'
         },
         callback: function() {
            me.getDirtree().getStore().getRootNode().getChildAt(0).expand(false, function() {
               me.expandPath(me, this);
            });
         }
      });
      
      this.getFilelist().getStore().load({
         params: {
            path:'/'
         }
      });
      
   },
   
   onViewportRendered: function() {
      var me = this;
      var body = me.getViewport();
      var bwidth = body.getWidth();
      var bheight = body.getHeight();
      var win = me.getWindow();
      var wwidth = win.getWidth();
      var wheight = win.getHeight();
      
      if(wwidth>bwidth || wheight>bheight) {
         window.setTimeout(function() {win.maximize();}, 1000);
      }
   },
   
   onTreePanelButtonClicked: function(btn) {
      if(btn.xid=='expandall') {
         btn.up('treepanel').expandAll();
      }
      if(btn.xid=="collapseall") {
         btn.up('treepanel').collapseAll();
      }
      if(btn.xid=="tree-reload") {
         this.onBodyRendered();
      }
   },
   
   onGridPanelButtonClicked: function(btn) {
      if(btn.xid=='about') {
         Ext.require('DirectoryListing.view.AboutWindow', function() {
            Ext.create('DirectoryListing.view.AboutWindow').show();
         });
      }
      var record = btn.up('gridpanel').getSelectionModel().getSelection()[0];
      if(btn.xid=='file-open') {
         this.onOpenFile(null, record);
      }
      if(btn.xid=='direct-link') {
         this.onGetDirectLink(record);
      }
      if(btn.xid=='list-reload') {
         this.onReloadFilelist(record);
      }
   },
   
   currentpath: null,
   
   onTreeDirSelected: function(tree, item) {
      var me = this;
      me.currentpath = item[0].data.id;
      
      this.getFilelist().setLoading(true);
      this.getFilelist().getStore().load({
         params: {
            path:me.currentpath
         },
         callback: function() {
            me.getFilelist().setLoading(false);
         }
      });
      
      item[0].expand();
      this.getOpenbutton().disable();
      this.getDirectlinkbutton().disable();
      this.getCurrentpath().setValue((me.currentpath=="root" ? "/" : me.currentpath));
      window.location.hash = me.currentpath;
      
   },
   
   onFilelistSelected: function(grid, item) {
      this.getOpenbutton().enable();
      this.getDirectlinkbutton().enable();
   },
   
   onOpenFile: function(grid, item) {
      this.getOpenbutton().enable();
      window.open(item.data.metadata.url);
   },
   
   onGetDirectLink: function(record) {
      Ext.require('DirectoryListing.view.UrlWindow', function() {
         var win = Ext.create('DirectoryListing.view.UrlWindow');
         win.setURL(record.raw.metadata.fqdnurl);
         win.show();
      });
   },
   
   onReloadFilelist: function() {
      var me = this;
      this.getFilelist().setLoading(true);
      this.getFilelist().getStore().load({
         params: {
            path:me.currentpath
         },
         callback: function() {
            me.getFilelist().setLoading(false);
         }
      });
   }
   
    
});
