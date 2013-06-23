
Ext.define('DirectoryListing.controller.Manage', {
    extend: 'Ext.app.Controller',

    views: [ 'ManageWindow' ],
    stores: [  ],

    refs: [
        { ref: 'mgWindow', selector: 'window[xid=managewindow]' },
        { ref: 'groupGrid', selector: 'window[xid=managewindow] gridpanel[xid=grouplist]' },
        { ref: 'shareGrid', selector: 'window[xid=managewindow] gridpanel[xid=sharelist]' }
    ],

    cachedLoginStatus: null,

   init: function() {

        this.control({
           'window[xid=managewindow]': {
              close: this.onWindowClose
           },
           'window[xid=managewindow] gridpanel[xid=grouplist]': {
              afterrender: this.onGroupPanelRendered,
              select: this.onGroupPanelItemClicked,
              beforeedit: this.onGroupPanelBeforeEdit,
              edit: this.onGroupEdited,
              deleterow: this.onGroupDelete
           },
           'window[xid=managewindow] gridpanel[xid=sharelist]': {
              edit: this.onShareEdited,
              deleterow: this.onShareDelete
           },
           'window[xid=managewindow] gridpanel[xid=grouplist] toolbar button[xid=add-group]': {
              click: this.onAddGroupClicked
           },
           'window[xid=managewindow] gridpanel[xid=sharelist] toolbar button[xid=add-share]': {
              click: this.onAddShareClicked
           },
           scope:this
        });

        this.application.on({
           'openmanagewindow': this.globalOpenManageWindow,
           'closemanagewindow': this.globalCloseManageWindow,
           scope: this
        });

   },

   globalOpenManageWindow: function() {
      Ext.require('DirectoryListing.view.ManageWindow', function() {
         var win = Ext.create('DirectoryListing.view.ManageWindow');
         win.show();
      });
   },

   globalCloseManageWindow: function() {
      var win = this.getMgWindow();
      if(win) {
         win.close();
      }
   },

   onWindowClose: function() {
      this.application.fireEvent('togglefilewindow', true);
   },

   onGroupPanelRendered: function(v) {
      v.getStore().load();
   },

   onGroupPanelItemClicked: function(panel, record) {
      if(record.data.name=="") {
         return;
      }
      var shares = this.getShareGrid();
      shares.getStore().load({
         params: {
            'args[group]': record.data.name
         }
      });
   },

   onGroupPanelBeforeEdit: function(e, editor) {
      if(editor.record.data.name!="") {
         return false;
      }
   },

   onAddGroupClicked: function(btn) {
      this.getGroupGrid().getStore().add({
         name:'',
         shares:0
      });
   },

   onGroupDelete: function(grid, record) {
      var me = this;
      grid.getStore().remove(record);
      var groupname = record.data.name;

      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=deletegroup',
          method:'post',
          params: {
             'args[group]': groupname
          },
          success: function(response, opts) {
             Msg.show("Success", "Group deleted successfull.");
             me.getGroupGrid().getStore().load({
                callback: function() {
                   me.getGroupGrid().getSelectionModel().select(me.getGroupGrid().getStore().getAt(0));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete group.");
          }
      });
   },

   onGroupEdited: function(editor, e) {
      var me = this;
      var data = e.record.data;

      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=addgroup',
          method:'post',
          params: {
             'args[group]': data.name
          },
          success: function(response, opts) {
             Msg.show("Success", "Create group successfull.");
             me.getGroupGrid().getStore().load({
                callback: function() {
                   me.getGroupGrid().getSelectionModel().select(me.getGroupGrid().getStore().find('name', data.name));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not create group.");
          }
      });
   },

   onAddShareClicked: function(btn) {
      this.getShareGrid().getStore().add({
         path:'',
         read:'',
         'delete':'',
         download:''
      });
   },

   onShareEdited: function(editor, e) {
      var me = this;
      var data = e.record.data;
      var groupname = me.getGroupGrid().getSelectionModel().getSelection()[0].data.name;

      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=updateshare',
          method:'post',
          params: {
             'args[group]': groupname,
             'args[path]': data.path,
             'args[read]': data.read,
             'args[download]': data.download,
             'args[delete]': data['delete']
          },
          success: function(response, opts) {
             Msg.show("Success", "Share edited successfull.");
             me.getGroupGrid().getStore().load({
                callback: function() {
                   me.getGroupGrid().getSelectionModel().select(me.getGroupGrid().getStore().find('name', groupname));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete share.");
          }
      });
   },

   onShareDelete: function(grid, record) {
      var me = this;
      grid.getStore().remove(record);
      var groupname = me.getGroupGrid().getSelectionModel().getSelection()[0].data.name;

      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=deleteshare',
          method:'post',
          params: {
             'args[group]': groupname,
             'args[share]': record.data.path
          },
          success: function(response, opts) {
             Msg.show("Success", "Share deleted successfull.");
             me.getGroupGrid().getStore().load({
                callback: function() {
                   me.getGroupGrid().getSelectionModel().select(me.getGroupGrid().getStore().find('name', groupname));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete share.");
          }
      });

   }


});
