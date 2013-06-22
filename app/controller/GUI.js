
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
        { ref: 'openbutton', selector: 'window[xid=filewindow] toolbar button[xid=file-open]' },
        { ref: 'directlinkbutton', selector: 'window[xid=filewindow] toolbar button[xid=direct-link]' }
    ],

   initstatus: false,
   expandPathArray: [],
   expandPathIndex: 0,
   expandPathString:'',

   windowState: 'restored',

   init: function() {

        this.control({
            'window[xid=filewindow]': {
               afterrender: this.onBodyRendered,
               maximize: this.onWindowMaximized,
               restore: this.onWindowRestored
            },
            'window[xid=filewindow] toolbar button': {
               click: this.onButtonClicked
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
           'loggedin': this.globalLoggedin,
           'loggedout': this.globalLoggedout,
           scope: this
        });

   },

   globalLoggedin: function() {
      this.getWindow().child('toolbar[dock=top] button[xid=login]').setText("Logout");
   },

   globalLoggedout: function() {
      this.getWindow().child('toolbar[dock=top] button[xid=login]').setText("Login");
   },

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
      var body = me.getViewport();

      // Hashtag Management
      if(!me.initstatus) {
         body.on('resize', me.onViewportResized, me);
         body.fireEvent('resize', {});
         this.getDirtree().getSelectionModel().on('selectionchange', this.onTreeDirSelected, this);
      }

      if(typeof HashManager.get('path')!="string") {
         HashManager.set('path', '/');
      }

      me.initstatus = true;
      me.expandPathArray = HashManager.get('path').split('/');
      me.expandPathIndex = 0;
      me.expandPathString = "";
      me.expandPathArray.shift();
      me.expandPathArray.pop();

      // Expand Dirtree via Hashtag
      this.getDirtree().getStore().load({
         params: {
            'args[path]':'/'
         },
         callback: function() {
            me.getDirtree().getStore().getRootNode().getChildAt(0).expand(false, function() {
               if(me.expandPathArray.length>0) {
                  me.expandPath(me, this);
               } else {
                  me.getDirtree().getSelectionModel().select(this);
               }
            });
         }
      });

   },

   onWindowMaximized: function() {
      this.windowState = "maximized";
   },

   onWindowRestored: function() {
      this.windowState = "restored";
   },

   onViewportResized: function() {
      var me = this;

      var body = me.getViewport();
      var bwidth = body.getWidth();
      var bheight = body.getHeight();
      var win = me.getWindow();
      var wwidth = Config.winWidth;
      var wheight = Config.winHeight;

      if(me.windowState=="restored" && (wwidth>bwidth || wheight>bheight)) {
         win.setPosition(0,0);
         win.maximize();
      } else if(me.windowState=="maximized" && wwidth<=bwidth && wheight<=bheight) {
         win.restore();
      }

      if(me.windowState=="restored") {
         win.center();
      }

   },

   onViewportRendered: function() {

   },

   onButtonClicked: function(btn) {

      var dirtree = btn.up('window').child('treepanel[xid=dirtree]');

      // Tree
      if(btn.xid=='expandall') {
         if(dirtree.getRootNode().getChildAt(0) && dirtree.getRootNode().getChildAt(0).isExpanded()) {
            dirtree.collapseAll(function() {
               dirtree.expandAll();
            });
         } else {
            dirtree.expandAll();
         }
      }
      if(btn.xid=="collapseall") {
         dirtree.collapseAll();
      }
      if(btn.xid=="tree-reload") {
         this.onBodyRendered();
      }

      // Grid
      if(btn.xid=='about') {
         Ext.require('DirectoryListing.view.AboutWindow', function() {
            Ext.create('DirectoryListing.view.AboutWindow').show();
         });
      }
      var record = btn.up('window').child('gridpanel[xid=filelist]').getSelectionModel().getSelection()[0];
      if(btn.xid=='file-open') {
         this.onOpenFile(null, record);
      }
      if(btn.xid=='direct-link') {
         this.onGetDirectLink(record);
      }
      if(btn.xid=='list-reload') {
         this.onReloadFilelist(record);
      }
      if(btn.xid=='login') {
         this.onBtnLoginClicked(btn);
      }
   },

   onBtnLoginClicked: function(btn) {
      if(btn.getText()=="Login") {
         Ext.require('DirectoryListing.view.LoginWindow', function() {
            var loginwin = Ext.create('DirectoryListing.view.LoginWindow');
            loginwin.show();
         });
      } else {
         Ext.MessageBox.confirm('Logout', 'Are you sure you want to do that?', function(res) {
            if(res=="yes") {
               this.application.fireEvent('logout');
            }
         }, this);
      }
   },

   currentpath: null,

   onTreeDirSelected: function(tree, item) {
      var me = this;
      if(item.length<1) {
         return;
      }
      me.currentpath = item[0].data.id;

      this.getFilelist().setLoading(true);
      this.getFilelist().getStore().load({
         params: {
            'args[path]':me.currentpath
         },
         callback: function() {
            me.getFilelist().setLoading(false);
         }
      });

      item[0].expand();
      this.getOpenbutton().disable();
      this.getDirectlinkbutton().disable();
      this.getCurrentpath().setValue((me.currentpath=="root" ? "/" : me.currentpath));
      HashManager.set('path', me.currentpath);

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
