Ext.define('DirectoryListing.controller.GUI', {
    extend: 'Ext.app.Controller',

    views: [ 'Viewport', 'DirectoryListing.view.UrlWindow', 'Ext.ux.upload.Dialog' ],
    stores: [  ],

    refs: [
        { ref: 'viewport', selector: 'viewport' },
        { ref: 'window', selector: 'window[xid=filewindow]' },
        { ref: 'toolbar', selector: 'window[xid=filewindow] toolbar[dock=top]' },
        { ref: 'dirtree', selector: 'window[xid=filewindow] treepanel[xid=dirtree]' },
        { ref: 'filelist', selector: 'window[xid=filewindow] gridpanel[xid=filelist]' },
        { ref: 'currentpath', selector: 'window[xid=filewindow] panel textfield[xid=current-path]' },
        { ref: 'newmenu', selector: 'window[xid=filewindow] button[xid=newmenu]' },
        { ref: 'uploadbutton', selector: 'window[xid=filewindow] button[xid=newmenu] menuitem[xid=upload]' },
        { ref: 'uploadwindow', selector: 'window[xid=uploadwindow]' },
        { ref: 'newfolderMenu', selector:'window[xid=filewindow] button[xid=newmenu] menuitem[xid=newfolder]' },
        { ref: 'openbutton', selector: 'window[xid=filewindow] toolbar button[xid=file-open]' },
        { ref: 'directlinkbutton', selector: 'window[xid=filewindow] toolbar button[xid=direct-link]' }
    ],

   showHiddenFiles:false,
   expandPathArray: [],
   expandPathIndex: 0,
   expandPathString:'',

   currentpath: null,

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
            'window[xid=filewindow] toolbar button[xid=hidden-files]': {
               toggle: this.onShowHiddenFilesToggled
            },
            'window[xid=filewindow] treepanel[xid=dirtree]': {
               selectionchange: this.onTreeDirSelected,
               load: this.onDirTreeLoad,
               itemcontextmenu: this.onTreeItemContextMenu
            },
            'window[xid=filewindow] treepanel[xid=dirtree] tableview': {
               beforedrop: this.onDirTreeBeforeDrop,
               drop: this.onDirTreeDrop
            },
            'window[xid=filewindow] gridpanel[xid=filelist]': {
               itemclick: this.onFilelistSelected,
               itemdblclick: this.onOpenFile,
               itemcontextmenu: this.onTreeItemContextMenu
            },
            'window[xid=uploadwindow]': {
               uploadcomplete: this.onUploadCompleted,
               close: this.onUploadWindowClosed
            },
            'window[xid=batchdeletewindow]': {
               deletefile:this.onRunDeleteFiles,
               deletecompleted: this.onRunDeleteFilesCompleted,
               close: this.onDeleteFilesWindowClosed
            },
            'window[xid=filewindow] button[xid=newmenu] menuitem': {
               click: this.onNewMenuItemClicked
            },
            'menuitem[xid=newfolder] textfield': {
               specialkey: this.onNewMenuCreateFolder
            },
            'viewport': {
               afterrender: this.onViewportRendered/*,
               resize: this.onViewportResized*/
            },
            scope:this
        });

        this.application.on({
           'loggedin': this.globalLoggedin,
           'loggedout': this.globalLoggedout,
           'togglefilewindow': this.globalToggleFileWindow,
           'reloadfiletree': this.onReloadTree,
           scope: this
        });

   },

   globalLoggedin: function(user) {
      var tb = this.getToolbar();
      var il = tb.child('label[xid=logininfo]');
      var lb = tb.child('button[xid=login]');
      var m = tb.child('button[xid=manage]');
      il.setText("Logged in as "+user.username);
      il.show();
      lb.setText('Logout');

      if(Settings.user && Settings.user.admin && Settings.user.admin==true) {
         m.setDisabled(false);
         m.show();
      }
   },

   globalLoggedout: function() {
      var tb = this.getToolbar();
      var il = tb.child('label[xid=logininfo]');
      var lb = tb.child('button[xid=login]');
      var m = tb.child('button[xid=manage]');
      il.setText("Not logged in");
      il.hide();
      lb.setText('Login');
      m.setDisabled(true);
      m.hide();
   },

   globalToggleFileWindow: function(b) {
      if(b) {
         this.getWindow().show();
      } else {
         this.getWindow().hide();
      }
   },

   expandPath: function(me, treenode) {
      if(typeof me.expandPathArray[me.expandPathIndex]!="undefined") {
         if(me.expandPathString=='') me.expandPathString=separator;
         me.expandPathString += me.expandPathArray[me.expandPathIndex]+separator;
         me.expandPathIndex++;

         window.setTimeout(function() {
            var nextnode = treenode.findChild('id', me.expandPathString);
            if(nextnode) {
               nextnode.expand(false, function() {
                  me.getDirtree().getSelectionModel().select(this);
                  me.expandPath(me, this);
               });
            }
         }, 50);

      }
   },

   onBodyRendered: function() {
      var me = this;
      me.getViewport().on('resize', me.onViewportResized, me);
      me.getViewport().fireEvent('resize');

      if(typeof HashManager.get('path')!="string") {
         HashManager.set('path', '/');
      }

   },

   onDirTreeLoad: function(store, node, records) {
      var me = this;

      if(node.data.id=="root") {
         me.expandPathArray = HashManager.get('path').split(separator);
         me.expandPathIndex = 0;
         me.expandPathString = separator;
         me.expandPathArray.shift();
         me.expandPathArray.pop();

         if(me.expandPathArray.length>0 && node.findChild('id', separator+me.expandPathArray[0]+separator)!=null) {
            me.expandPath(me, node);
         } else {
            me.getDirtree().getSelectionModel().select(node.getChildAt(0));
         }

      }
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
      var wwidth = Settings.windowwidth;
      var wheight = Settings.windowheight;

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
         this.onReloadTree();
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
      if(btn.xid=='manage') {
         this.application.fireEvent('openmanagewindow');
         this.application.fireEvent('togglefilewindow', false);
      }

   },

   onNewMenuItemClicked: function(btn) {
      if(btn.xid=="upload") {
         var dialog = Ext.create('Ext.ux.upload.Dialog', {
            dialogTitle: 'Upload file to '+this.currentpath,
            uploadUrl: 'ajax.php',
            uploadParams: {
               controller:'filesystem',
               action:'upload',
               'args[targetpath]':this.currentpath
            },
            xid:'uploadwindow',
            modal:true
         });

         dialog.show();
      }
   },

   onNewMenuCreateFolder: function(field, e) {
      var me = this;
      if(e.keyCode==e.ENTER) {
         var foldername = field.getSubmitValue();
         var targetfolder = me.currentpath;

         if(field.up('button[xid=newmenu]') && field.up('button[xid=newmenu]').child('menu')) {
            field.up('button[xid=newmenu]').child('menu').hide();
         }
         if(field.up('menu[xid=foldermenu]')) {
            field.up('menu[xid=foldermenu]').hide();
         }

         field.setValue('');

         this.createDirectory(targetfolder, foldername);

      }
   },

   createDirectory: function(targetfolder, newfolder) {
      var me = this;
      Ext.Ajax.request({
         url: 'ajax.php?controller=filesystem&action=createdirectory',
         params: {
            'args[newfolder]': newfolder,
            'args[targetfolder]': targetfolder
         },
         success: function(response, opts) {
            me.application.fireEvent('reloadfiletree');
            Msg.show("Success", "Folder created.");
         },
         failure: function(response, opts) {
             Msg.show("Failure", "Folder creation failed.");
         }
      });
   },

   showDeleteDialog: function(records) {
      Ext.require('DirectoryListing.view.DeleteBatchWindow', function() {
         var win = Ext.create('DirectoryListing.view.DeleteBatchWindow', {
            records:records
         });
         win.show();
      });
   },

   onRunDeleteFiles: function(record, callback) {
      Ext.Ajax.request({
         url: 'ajax.php?controller=filesystem&action=deletefile',
         params: {
            'args[filepath]': record.raw.id
         },
         success: function(response, opts) {
            callback();
         },
         failure: function(response, opts) {
             callback();
         }
      });
   },

   onRunDeleteFilesCompleted: function(numitems) {
      Msg.show("Success", numitems+" File"+(numitems==1 ? "" : "s")+" deleted!");
   },

   onDeleteFilesWindowClosed: function() {
      this.application.fireEvent('reloadfiletree');
   },

   deleteFile: function(filepath) {
      console.log('called deprecated delete method!');
   },

   onShowHiddenFilesToggled: function(btn, pressed) {
      this.showHiddenFiles = pressed;
      this.onReloadFilelist();
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

   onTreeDirSelected: function(tree, item) {
      var me = this;
      if(item.length<1 || !item[0].data) {
         return;
      }
      me.currentpath = item[0].data.id;

      var can_upload = (item[0].raw.can_upload && item[0].raw.can_upload==true ? true : false);
      me.getUploadbutton().setDisabled(!can_upload);

      var can_mkdir = (item[0].raw.can_mkdir && item[0].raw.can_mkdir==true ? true : false);
      me.getNewfolderMenu().setDisabled(!can_mkdir);

      if(((!Settings.user||Settings.user.loggedin==false) && can_upload==false && can_mkdir==false) ||
         (!Settings.mkdir && !Settings.upload))
      {
         me.getNewmenu().hide();
      } else {
         me.getNewmenu().show();
      }

      this.getFilelist().setLoading(true);
      this.getFilelist().getStore().load({
         params: {
            'args[node]':me.currentpath,
            'args[showhidden]': me.showHiddenFiles
         },
         callback: function() {
            me.getFilelist().setLoading(false);
         }
      });

      item[0].expand();
      this.getOpenbutton().disable();
      this.getDirectlinkbutton().disable();
      this.getCurrentpath().setValue((me.currentpath=="root" ? "/" : me.currentpath));
      if(me.currentpath!="root") {
         HashManager.set('path', me.currentpath);
      }

   },

   onTreeItemContextMenu: function(view, singlerecord, html, index, e) {

      var me = this;
      e.preventDefault();

      console.log(view.up('tablepanel'));

      var grid = view.up('tablepanel')
      var records = grid.getSelectionModel().getSelection();
      var record = records[0]; // For check permissions and other stuff

      var can_delete = (record.raw.can_delete && record.raw.can_delete==true ? true : false);
      var can_mkdir = (record.raw.can_mkdir && record.raw.can_mkdir==true ? true : false);
      var can_upload = (record.raw.can_upload && record.raw.can_upload==true ? true : false);

      if(((!Settings.user||Settings.user.loggedin==false) && can_upload==false && can_mkdir==false && can_delete==false) ||
         (!Settings.mkdir && !Settings.upload && !Settings['delete']))
      {
         return;
      }

      var path = record.raw.id.substring(0, record.raw.id.lastIndexOf('/'))+'/';

      var menu = Ext.create('Ext.menu.Menu', {
         xid:'foldermenu',
         items: [
            {
               text:'Upload multiple files',
               icon:'fileicons/page_white_get.png',
               xid:'upload',
               disabled: !can_upload,
               hidden:(!Settings.upload),
               handler: function(btn) {
                  var dialog = Ext.create('Ext.ux.upload.Dialog', {
                     dialogTitle: 'Upload file to '+path,
                     uploadUrl: 'ajax.php',
                     uploadParams: {
                        controller:'filesystem',
                        action:'upload',
                        'args[targetpath]':path
                     },
                     xid:'uploadwindow',
                     modal:true
                  });
                  dialog.show();
               }
            },
            {
               text:'New Folder',
               icon:'fileicons/folder_add.png',
               xid:'newfolder',
               disabled: !can_mkdir,
               hidden:(!Settings.mkdir),
               menu: [
                  {
                     xtype:'textfield',
                     emptyText:'New Folder'
                  }
               ]
            },
            {
               text:'Delete',
               disabled: (!can_delete || record.raw.is_share),
               icon:'fileicons/folder_delete.png',
               xid:'delete-folder',
               hidden:(!Settings['delete']),
               handler: function(btn) {
                  /*Ext.MessageBox.confirm('Delete files & folders', 'Are you sure you want to do that?<br>All folders and files will deleted!', function(res) {
                     if(res=="yes") {
                        me.deleteFile(record.data.id);
                     }
                  });*/
                  me.showDeleteDialog(records);
               }
            }
         ]
      });

      menu.showAt(e.getXY());

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

   onReloadTree: function() {
      this.getDirtree().getStore().load();
   },

   onReloadFilelist: function() {
      var me = this;
      this.getFilelist().setLoading(true);
      this.getFilelist().getStore().load({
         params: {
            'args[node]':me.currentpath,
            'args[showhidden]': me.showHiddenFiles
         },
         callback: function() {
            me.getFilelist().setLoading(false);
         }
      });
   },

   onUploadCompleted: function(win, mgr, items, errors) {
      if(errors<1) {
         win.up('window').close();
      } else {
         Msg.show("Failure", "Upload of "+errors+" files failed.")
      }
   },

   onUploadWindowClosed: function(win) {
      this.onReloadFilelist();
   },

   onDirTreeBeforeDrop: function(node, data, overModel, dropPosition, dropHandlers) {

      if(dropPosition!="append") {
         return false;
      }

      console.log('dirtree beforedrop');
      return true;
   },

   onDirTreeDrop: function(node, data, dropRec, dropPosition) {

   }


});
