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
        { ref: 'directlinkbutton', selector: 'window[xid=filewindow] toolbar button[xid=direct-link]' },
        { ref: 'imageviewerbutton', selector: 'window[xid=filewindow] toolbar button[xid=image-viewer]' },
        { ref: 'spacebar', selector: 'window[xid=filewindow] treepanel[xid=dirtree] toolbar[dock=bottom] progressbar[xid=space]' },
        { ref: 'filebar', selector: 'window[xid=filewindow] gridpanel[xid=filelist] toolbar[dock=bottom] tbtext[xid=sumfiles]' }
    ],

   showHiddenFiles:false,
   expandPathArray: [],
   expandPathIndex: 0,
   expandPathString:'',

   currentpath: null,

   windowState: 'restored',

   init: function() {

        this.control({
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
               afterrender: this.onFileListRendered,
               itemclick: this.onFilelistSelected,
               itemdblclick: this.onOpenFile,
               itemcontextmenu: this.onTreeItemContextMenu
            },
            'window[xid=uploadwindow]': {
               uploadcomplete: this.onUploadCompleted,
               close: this.onUploadWindowClosed
            },
            'window[xid=deletebatchwindow]': {
               okclicked:this.onRunDeleteFiles,
               okcompleted: this.onRunDeleteFilesCompleted,
               close: this.onBatchWindowClosed
            },
            'window[xid=copybatchwindow]': {
               okclicked:this.onRunCopyFiles,
               okcompleted: this.onRunCopyFilesCompleted,
               close: this.onBatchWindowClosed
            },
            'window[xid=movebatchwindow]': {
               okclicked:this.onRunMoveFiles,
               okcompleted: this.onRunMoveFilesCompleted,
               close: this.onBatchWindowClosed
            },
            'window[xid=renamewindow]': {
               renamefile: this.onRenameFile
            },
            'window[xid=filewindow] button[xid=newmenu] menuitem': {
               click: this.onNewMenuItemClicked
            },
            'menuitem[xid=newfolder] textfield': {
               specialkey: this.onNewMenuCreateFolder
            },
            'viewport': {
               afterrender: this.onBodyRendered
            },
            scope:this
        });

        this.application.on({
           'loggedin': this.globalLoggedin,
           'loggedout': this.globalLoggedout,
           'togglefilewindow': this.globalToggleFileWindow,
           'reloadfiletree': this.onReloadTree,
           'updatespaceinfo': this.globalUpdateSpaceInfo,
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
      lb.setTooltip('Logout');

      var pw = tb.child('button[xid=changepw]');
      pw.show();

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
      lb.setTooltip('Login');
      m.setDisabled(true);
      m.hide();

      var pw = tb.child('button[xid=changepw]');
      pw.hide();
   },

   globalToggleFileWindow: function(b) {
      if(b) {
         this.getWindow().show();
      } else {
         this.getWindow().hide();
      }
   },

   globalUpdateSpaceInfo: function(path) {
      var me = this;
      var sb = me.getSpacebar();
      Ext.Ajax.request({
          url: 'index.php/filesystem/spaceinfo',
          method:'POST',
          params: {
             'path': path
          },
          success: function(response, opts) {
             var json = Ext.decode(response.responseText);

             if(json.success==true) {
                sb.up('toolbar').show();
                sb.updateProgress(json.result.percent_used_float);
                sb.updateText(json.result.used+" GB of "+json.result.total+" GB used");
             } else {
                sb.up('toolbar').hide();
                sb.updateProgress(0);
                sb.updateText("");
             }

          },
          failure: function(response, opts) {

          }
      });
   },

   onBodyRendered: function() {
      if(typeof HashManager.get('path')!="string") {
         HashManager.set('path', '/');
      }
   },

   onFileListRendered: function(panel) {
      var view = panel.getView();
      var tip = Ext.create('Ext.tip.ToolTip', {
         target: view.el,
         delegate: view.itemSelector,
         trackMouse: true,
         renderTo: Ext.getBody(),
         listeners: {
            beforeshow: function updateTipBody(tip) {
               var m = view.getRecord(tip.triggerElement).get('metadata');
               if(m.isimage==false) {
                  return false;
               }
               var id = "thumb-"+view.getRecord(tip.triggerElement).id;
               tip.update('<img id="'+id+'" src="' + m.thumbnailurl + '" alt="thumb"><br>Type: '+m.extension+', Resolution: '+m.image_width+'x'+m.image_height);
               var imgload = function() {
                  tip.updateLayout();
                  Ext.get(id).un('load', imgload)
               };
               Ext.get(id).on('load', imgload);
            }
         }
      });
   },

   updateFeatures: function(features)
   {
      // "delete", "upload", "mkdir", "copy", "move_rename", "download"
      Settings.features = features;

      // Drag & Drop
      if(features.copy || features.move_rename) {
         this.getDirtree().getView().getPlugin('dragdrop').enable();
         this.getFilelist().getView().getPlugin('dragdrop').enable();
      } else {
         this.getDirtree().getView().getPlugin('dragdrop').disable();
         this.getFilelist().getView().getPlugin('dragdrop').disable();
      }

      // The new-menu
      if(features.mkdir || features.upload) {
         this.getNewmenu().show();
      } else {
         this.getNewmenu().hide();
      }

      this.getImageviewerbutton().setVisible(features.imageviewer);
      this.getUploadbutton().setVisible(features.upload);
      this.getNewfolderMenu().setVisible(features.mkdir);

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
            } else {
               me.expandPathIndex=-1;
            }
         }, 50);

      }
   },

   onDirTreeLoad: function(store, node, records) {
      var me = this;

      if(node.data.id=="root")
      {
         Ext.Ajax.request({
             url: 'index.php/management/featurelist',
             method:'get',
             success: function(response, opts) {
                var json = Ext.decode(response.responseText);
                me.updateFeatures(json.result);
             }
         });

         me.getNewmenu().hide();
         if(!me.getDirtree().getRootNode() || !me.getDirtree().getRootNode().getChildAt(0))
         {
            this.getCurrentpath().setValue("");
            me.getFilelist().getStore().removeAll();
            me.onBtnLoginClicked(true);
         }

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

      // when last node reached
      if(me.expandPathIndex<1 || me.expandPathIndex>=me.expandPathArray.length) {

         // load filelist
         me.getImageviewerbutton().disable();
         this.getFilelist().setLoading(true);
         this.getFilelist().getStore().load({
            params: {
               'node':me.currentpath,
               'showhidden': me.showHiddenFiles
            },
            callback: function(records) {
               me.getFilelist().setLoading(false);
               me.getImageviewerbutton().enable();
               var fb = me.getFilebar();

               var sumfiles = records.length;
               var sumbytes = 0;
               Ext.each(records, function(record) {
                  sumbytes += record.raw.metadata.size;
               });

               me.getFilebar().setText(sumfiles+' file'+(sumfiles==1 ? "" : "s")+", "+Tools.filesizeformat(sumbytes));

            }
         });

         // get space info
         me.application.fireEvent('updatespaceinfo', me.currentpath);

      }

      item[0].expand();
      this.getOpenbutton().disable();
      this.getDirectlinkbutton().disable();
      this.getCurrentpath().setValue((me.currentpath=="root" ? "/" : me.currentpath));
      if(me.currentpath!="root") {
         HashManager.set('path', me.currentpath);
      }

   },

   onButtonClicked: function(btn) {

      var me = this;
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
         this.onBtnLoginClicked();
      }
      if(btn.xid=='manage') {
         this.application.fireEvent('openmanagewindow');
         this.application.fireEvent('togglefilewindow', false);
      }
      if(btn.xid=="changepw") {
         var username = Settings.user.username;
         Ext.require('DirectoryListing.view.ChangePasswordWindow', function() {
            var win = Ext.create('DirectoryListing.view.ChangePasswordWindow', {
               targetusername: username
            });
            win.show();
         });
      }
      if(btn.xid=="image-viewer")
      {
         Ext.require('DirectoryListing.view.ImageviewerWindow', function() {
            var store = me.getFilelist().getStore();
            var imagerecords = store.query('text', /\.(jpg|jpeg|gif|png)$/i).getRange();

            var images = [];
            Ext.each(imagerecords, function(record) {
               images.push({
                  image: record.raw.metadata.fqdnurl,
                  thumbnail: record.raw.metadata.thumbnailurl
               });
            });

            var selected = null;
            var sele = me.getFilelist().getSelectionModel().getSelection();
            if(sele[0] && /\.(jpg|jpeg|gif|png)$/ig.test(sele[0].raw.text)) {
               selected = sele[0].raw.metadata.fqdnurl;
            }

            var win = Ext.create('DirectoryListing.view.ImageviewerWindow', {
               title:"Imageviewer on "+me.currentpath,
               imagelist:images,
               selectedimage: selected
            });

            me.getViewport().add(win);
            win.show();
         });
      }

   },

   onNewMenuItemClicked: function(btn) {
      var me = this;
      if(btn.xid=="upload") {
         Ext.require('DirectoryListing.view.UploadWindow', function() {
            var win = Ext.create('DirectoryListing.view.UploadWindow', {
               targetpath: me.currentpath
            });
            win.show();
         });
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
         url: 'index.php/filesystem/createdirectory',
         method:'POST',
         params: {
            'newfolder': newfolder,
            'targetfolder': targetfolder
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
      Ext.require('DirectoryListing.view.BatchWindow', function() {
         var win = Ext.create('DirectoryListing.view.BatchWindow', {
            title:"Really delete "+records.length+" File"+(records.length==1 ? "" : "s")+"?",
            icon:'fileicons/folder_delete.png',
            xid:'deletebatchwindow',
            oktext:'Delete all files',
            records:records
         });
         win.show();
      });
   },

   showRenameDialog: function(record) {
      Ext.require('DirectoryListing.view.RenameWindow', function() {
         var win = Ext.create('DirectoryListing.view.RenameWindow', {
            title:"Rename "+record.raw.id,
            filename:record.raw.id
         });
         win.show();
      });
   },

   onRenameFile: function(newname, filename) {
      var me = this;
      Ext.Ajax.request({
         url: 'index.php/filesystem/renamefile',
         method:'POST',
         params: {
            'file': filename,
            'newname': newname
         },
         success: function(response, opts) {
            me.application.fireEvent('reloadfiletree');
            Msg.show("Success", "Renamed '"+filename.substring(filename.lastIndexOf('/')+1)+"' to '"+newname+"'");
         },
         failure: function(response, opts) {
             Msg.show("Failure", "Rename failed.");
         }
      });
   },

   onRunDeleteFiles: function(record, target, callback) {
      Ext.Ajax.request({
         url: 'index.php/filesystem/deletefile',
         method:'POST',
         params: {
            'filepath': record.raw.id
         },
         success: function(response, opts) {
            var json = Ext.decode(response.responseText);
            callback(json.success);
         },
         failure: function(response, opts) {
             callback();
         }
      });
   },

   onRunDeleteFilesCompleted: function(numitems, numsuccess, numfailed) {
      if(numfailed<1) {
         Msg.show("Operation completed", numitems+" File"+(numitems==1 ? "" : "s")+" deleted!");
      } else {
         Msg.show("Operation failed", "Could not delete "+numfailed+" of "+numitems+"!");
      }
   },

   onBatchWindowClosed: function() {
      this.application.fireEvent('reloadfiletree');
   },

   deleteFile: function(filepath) {
      console.log('called deprecated delete method!');
   },

   onShowHiddenFilesToggled: function(btn, pressed) {
      this.showHiddenFiles = pressed;
      this.onReloadFilelist();
   },

   onBtnLoginClicked: function(forcewindow) {
      if(!Settings.user || Settings.user.loggedin==false || forcewindow==true) {
         Ext.require('DirectoryListing.view.LoginWindow', function() {
            var loginwin = Ext.create('DirectoryListing.view.LoginWindow');
            loginwin.show();
         });
      } else {
         this.application.fireEvent('logout');
      }
   },

   onTreeItemContextMenu: function(view, singlerecord, html, index, e) {

      var me = this;
      e.preventDefault();

      var grid = view.up('tablepanel')
      var records = grid.getSelectionModel().getSelection();
      var record = records[0]; // For check permissions and other stuff

      var can_delete = (record.raw.can_delete && record.raw.can_delete==true ? true : false);
      var can_mkdir = (record.raw.can_mkdir && record.raw.can_mkdir==true ? true : false);
      var can_upload = (record.raw.can_upload && record.raw.can_upload==true ? true : false);

      if(Settings.features && !Settings.features.upload && !Settings.features.mkdir && !Settings.features['delete'] &&
         !can_delete && !can_mkdir && !can_upload)
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
               hidden:(Settings.features && !Settings.features.upload),
               handler: function(btn) {

                  Ext.require('DirectoryListing.view.UploadWindow', function() {
                     var win = Ext.create('DirectoryListing.view.UploadWindow', {
                        targetpath: path
                     });
                     win.show();
                  });

               }
            },
            {
               text:'Rename',
               icon:'fileicons/textfield_rename.png',
               xid:'rename',
               //disabled:
               hidden:(Settings.features && !Settings.features.move_rename),
               handler: function() {
                  me.showRenameDialog(record);
               }
            },
            {
               text:'New Folder',
               icon:'fileicons/folder_add.png',
               xid:'newfolder',
               disabled: !can_mkdir,
               hidden:(Settings.features && !Settings.features.mkdir),
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
               hidden:(Settings.features && !Settings.features['delete']),
               handler: function(btn) {
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
            'node':me.currentpath,
            'showhidden': me.showHiddenFiles
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

   onDirTreeBeforeDrop: function(node, data, overModel, dropPosition, dropHandlers)
   {
      dropHandlers.wait = true;
      if(dropPosition!="append") {
         return false;
      }

      if(overModel.raw.id==data.records[0].raw.parent) {
         Msg.show("Information", "The files are already in this folder!");
         return false;
      }

      if(!Settings.move_rename && !Settings.copy) {
         Msg.show("Information", "The copy/move feature is disabled!");
         return false;
      }

      var copyenabled = (overModel.raw.can_copy && data.records[0].raw.can_copy);
      var moveenabled = (overModel.raw.can_move_rename && data.records[0].raw.can_move_rename);

      if(!copyenabled && !moveenabled) {
         Msg.show("Information", "Copy or move from <b>"+data.records[0].raw.parent+"</b> to <b>"+overModel.raw.id+"</b> is not allowed!");
         return false;
      }

      var menu = Ext.create('Ext.menu.Menu', {
         xid:'dropmenu',
         items: [
            {
               text:'Copy selected files',
               icon:'fileicons/page_white_copy.png',
               xid:'copy',
               disabled: !copyenabled,
               hidden:(!Settings.copy),
               handler: function(btn) {
                  dropHandlers.cancelDrop();
                  Ext.require('DirectoryListing.view.BatchWindow', function() {
                     var win = Ext.create('DirectoryListing.view.BatchWindow', {
                        title:"Really copy "+data.records.length+" File"+(data.records.length==1 ? "" : "s")+"?",
                        icon:'fileicons/page_white_copy.png',
                        xid:'copybatchwindow',
                        oktext:'Copy all files',
                        autostart:true,
                        records:data.records,
                        target:overModel
                     });
                     win.show();
                  });
               }
            },
            {
               text:'Move selected files',
               icon:'fileicons/page_white_go.png',
               xid:'move',
               disabled: !moveenabled,
               hidden:(!Settings.move_rename),
               handler: function() {
                  dropHandlers.cancelDrop();
                  Ext.require('DirectoryListing.view.BatchWindow', function() {
                     var win = Ext.create('DirectoryListing.view.BatchWindow', {
                        title:"Really move "+data.records.length+" File"+(data.records.length==1 ? "" : "s")+"?",
                        icon:'fileicons/page_white_go.png',
                        xid:'movebatchwindow',
                        oktext:'Move all files',
                        autostart:true,
                        records:data.records,
                        target:overModel
                     });
                     win.show();
                  });
               }
            }
         ]
      });

      menu.showBy(node);
   },

   onRunCopyFiles: function(record, target, callback) {
      Ext.Ajax.request({
         url: 'index.php/filesystem/fileoperation',
         method:'POST',
         params: {
            'operation': 'copy',
            'filepath': record.raw.id,
            'target': target.raw.id
         },
         success: function(response, opts) {
            var json = Ext.decode(response.responseText);
            callback(json.success);
         },
         failure: function(response, opts) {
            callback(false);
         }
      });
   },

   onRunCopyFilesCompleted: function(numitems, numsuccess, numfailed) {
      if(numfailed<1) {
         Msg.show("Operation completed", numitems+" File"+(numitems==1 ? "" : "s")+" copied!");
      } else {
         Msg.show("Operation failed", "Could not copy "+numfailed+" of "+numitems+"!");
      }
   },

   onRunMoveFiles: function(record, target, callback) {
      Ext.Ajax.request({
         url: 'index.php/filesystem/fileoperation',
         method:'POST',
         params: {
            'operation': 'move',
            'filepath': record.raw.id,
            'target': target.raw.id
         },
         success: function(response, opts) {
            var json = Ext.decode(response.responseText);
            callback(json.success);
         },
         failure: function(response, opts) {
            callback(false);
         }
      });
   },

   onRunMoveFilesCompleted: function(numitems, numsuccess, numfailed) {
      if(numfailed<1) {
         Msg.show("Operation completed", numitems+" File"+(numitems==1 ? "" : "s")+" moved!");
      } else {
         Msg.show("Operation failed", "Could not move "+numfailed+" of "+numitems+"!");
      }
   },

   onDirTreeDrop: function(node, data, dropRec, dropPosition) {

   }


});
