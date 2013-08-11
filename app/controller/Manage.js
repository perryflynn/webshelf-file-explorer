
Ext.define('DirectoryListing.controller.Manage', {
    extend: 'Ext.app.Controller',

    views: [ 'Viewport', 'ManageWindow', 'ChangePasswordWindow' ],
    stores: [  ],

    refs: [
        { ref: 'viewport', selector: 'viewport' },
        { ref: 'mgWindow', selector: 'window[xid=managewindow]' },
        { ref: 'settingsForm', selector: 'window[xid=managewindow] form[xid=settingstab]' },
        { ref: 'groupGrid', selector: 'window[xid=managewindow] gridpanel[xid=grouplist]' },
        { ref: 'shareGrid', selector: 'window[xid=managewindow] gridpanel[xid=sharelist]' },
        { ref: 'userGrid', selector: 'window[xid=managewindow] gridpanel[xid=userlist]' },
        { ref: 'memberGrid', selector: 'window[xid=managewindow] gridpanel[xid=groupmemberlist]' }
    ],

    cachedLoginStatus: null,
    windowState: 'restored',

   init: function() {

        this.control({
           'window[xid=managewindow]': {
              afterrender: this.onWindowRendered,
              close: this.onWindowClose
           },
           'window[xid=managewindow] tabpanel': {
              tabchange: this.onTabChange
           },
           'window[xid=managewindow] form[xid=settingstab]': {
              afterrender: this.settingsFormRendered,
              dosubmit: this.onSubmitSettings
           },
           'window[xid=managewindow] gridpanel[xid=grouplist]': {
              afterrender: this.onGroupPanelRendered,
              select: this.onGroupPanelItemClicked,
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
           'window[xid=managewindow] gridpanel[xid=userlist]': {
              afterrender: this.onUserPanelRendered,
              edit: this.onEditUser,
              deleterow: this.onDeleteUser,
              changepw: this.onChangeUserPassword,
              select: this.onUserSelected
           },
           'window[xid=managewindow] gridpanel[xid=userlist] toolbar button[xid=add-user]': {
              click: this.onAddUser
           },
           'window[xid=changepasswordwindow]': {
              changepw: this.onChangePasswordClicked
           },
           'window[xid=managewindow] gridpanel[xid=groupmemberlist]': {
              edit: this.onGroupMemberShipChanged
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
      var me = this;
      Ext.require('DirectoryListing.view.ManageWindow', function() {
         var win = Ext.create('DirectoryListing.view.ManageWindow');
         me.getViewport().add(win);
         win.show();
      });
   },

   globalCloseManageWindow: function() {
      var win = this.getMgWindow();
      if(win) {
         win.close();
      }
   },

   onWindowRendered: function() {
      var me = this;
   },

   onWindowClose: function() {
      var theme = this.getSettingsForm().getForm().findField('uitheme').getSubmitValue();
      if(theme!=Settings.uitheme) {
         Msg.show("Information", "Please reload the browser to change to the new theme.")
      }

      var values = this.getSettingsForm().getForm().getFieldValues();
      Ext.iterate(values, function(key, value) {
         //var myRegexp = /\[(.*?)\]/g;
         //var match = myRegexp.exec(key);
         //var skey = match[1];
         var skey = key;
         Settings[skey] = value;
      });

      var me = this;
      me.getViewport().un('resize', me.onViewportResized, me);
      this.application.fireEvent('togglefilewindow', true);
      this.application.fireEvent('reloadfiletree', true);
   },

   onTabChange: function(panel, newtab)
   {
      var me = this;

      if(newtab.xid=="usertab" || newtab.xid=="grouptab")
      {
         var ugrid = null;
         if(newtab.xid=="usertab") {
            ugrid = me.getUserGrid();
         } else if(newtab.xid=="grouptab") {
            ugrid = me.getGroupGrid();
         } else {
            return;
         }

         var ustore = ugrid.getStore();
         var usm = ugrid.getSelectionModel();
         var ur = usm.getSelection()[0];
         var uidx = -1;
         if(ur) {
            uidx = ustore.find('name', ur.data.name);
         }

         ustore.load({
            callback: function() {
               if(uidx>-1) {
                  usm.select(uidx);
               } else {
                  usm.select(ustore.getAt(0));
               }
            }
         });
      }

   },

   settingsFormRendered: function(form) {
      form.getForm().loaded = false;
      Ext.Ajax.request({
          url: 'index.php/management/getsettings',
          success: function(response, opts) {
             var json = Ext.decode(response.responseText);
             form.getForm().setValues(json.result);
             form.getForm().loaded = true;
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Get settings failed.");
          }
      });
   },

   onSubmitSettings: function() {
      var form = this.getSettingsForm().getForm();
      if(!form.loaded) {
         return;
      }
      if(form.isValid()) {
          form.submit({
             url: 'index.php/management/savesettings',
             method:'POST',
             success: function(form, action) {

             },
             failure: function(form, action) {
                Msg.show("Failure", "Save settings failed.");
             }
          });
      }
   },

   onGroupPanelRendered: function(v) {
      v.getStore().load({
         callback: function() {
            v.getSelectionModel().select(v.getStore().getAt(0));
         }
      });
   },

   onUserPanelRendered: function(v) {
      v.getStore().load({
         callback: function() {
            v.getSelectionModel().select(v.getStore().getAt(0));
         }
      });
   },

   onGroupPanelItemClicked: function(panel, record) {
      if(record.data.name=="") {
         return;
      }
      var shares = this.getShareGrid();
      shares.getStore().load({
         params: {
            'group': record.data.name
         }
      });
   },

   onAddGroupClicked: function(btn) {
      var r = this.getGroupGrid().getStore().add({
         name:'',
         shares:0,
         saved:false
      });
      this.getGroupGrid().getPlugin('cellplugin').startEdit(r[0], 0);
   },

   onGroupDelete: function(grid, record) {
      var me = this;
      grid.getStore().remove(record);
      var groupname = record.data.name;

      Ext.Ajax.request({
          url: 'index.php/authentication/deletegroup',
          method:'post',
          params: {
             'group': groupname
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

      if(data.saved==false && e.grid.getStore().findBy(function(record, id) { return (record.id!=e.record.id && record.data.name==data.name); })>=0) {
         e.grid.getStore().remove(e.record);
         Msg.show("Failure", "Group already exist!");
         return;
      }

      Ext.Ajax.request({
          url: 'index.php/authentication/addgroup',
          method:'post',
          params: {
             'group': data.name
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
      var r = this.getShareGrid().getStore().add({
         path:'',
         read:'',
         'delete':'',
         download:'',
         saved:false
      });
      this.getShareGrid().getPlugin('cellplugin').startEdit(r[0], 0);
   },

   onShareEdited: function(editor, e) {
      var me = this;
      var data = e.record.data;
      var groupname = me.getGroupGrid().getSelectionModel().getSelection()[0].data.name;

      if(data.saved==false && e.grid.getStore().findBy(function(record, id) { return (record.id!=e.record.id && record.data.path==data.path); })>=0) {
         e.grid.getStore().remove(e.record);
         Msg.show("Failure", "Share already exist!");
         return;
      }

      Ext.Ajax.request({
          url: 'index.php/authentication/updateshare',
          method:'post',
          params: {
             'group': groupname,
             'path': data.path,
             'read': data.read,
             'protected': data['protected'],
             'upload': data.upload,
             'mkdir': data.mkdir,
             'copy': data.copy,
             'move_rename': data.move_rename,
             'download': data.download,
             'delete': data['delete']
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
          url: 'index.php/authentication/deleteshare',
          method:'post',
          params: {
             'group': groupname,
             'share': record.data.path
          },
          success: function(response, opts) {
             Msg.show("Success", "Share deleted successfull.");
             me.getGroupGrid().getStore().load({
                callback: function() {
                   me.getGroupGrid().getSelectionModel().select(me.getGroupGrid().getStore().getAt(0));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete share.");
          }
      });

   },

   onEditUser: function(editor, e) {
      var me = this;
      var data = e.record.data;

      if(data.saved==false && e.grid.getStore().findBy(function(record, id) { return (record.id!=e.record.id && record.data.name==data.name); })>=0) {
         e.grid.getStore().remove(e.record);
         Msg.show("Failure", "User already exist!");
         return;
      }

      Ext.Ajax.request({
          url: 'index.php/authentication/updateuser',
          method:'post',
          params: {
             'username': data.name,
             'admin': data.admin
          },
          success: function(response, opts) {
             Msg.show("Success", "User edited successfull.");
             me.getUserGrid().getStore().load({
                callback: function() {
                   me.getUserGrid().getSelectionModel().select(me.getUserGrid().getStore().find('name', data.name));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete share.");
          }
      });

   },

   onDeleteUser: function(grid, record) {
      var me = this;
      grid.getStore().remove(record);
      var username = record.data.name;
      Ext.Ajax.request({
          url: 'index.php/authentication/deleteuser',
          method:'post',
          params: {
             'username': username
          },
          success: function(response, opts) {
             Msg.show("Success", "User deleted successfull.");
             me.getUserGrid().getStore().load({
                callback: function() {
                   me.getUserGrid().getSelectionModel().select(me.getUserGrid().getStore().getAt(0));
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not delete share.");
          }
      });
   },

   onChangeUserPassword: function(grid, record) {
      var me = this;
      var username = record.data.name;
      Ext.require('DirectoryListing.view.ChangePasswordWindow', function() {
         var win = Ext.create('DirectoryListing.view.ChangePasswordWindow', {
            targetusername: username
         });
         win.show();
      });
   },

   onChangePasswordClicked: function(name, password) {
      Ext.Ajax.request({
          url: 'index.php/authentication/setpassword',
          method:'post',
          params: {
             'username': name,
             'password': password
          },
          success: function(response, opts) {
             Msg.show("Success", "Password changed.");
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not change password.");
          }
      });
   },

   onAddUser: function(btn) {
      var r = this.getUserGrid().getStore().add({
         name:'',
         admin:false,
         deletable:true,
         saved:false
      });
      this.getUserGrid().getPlugin('cellplugin').startEdit(r[0], 0);
   },

   onUserSelected: function(panel, record) {
      if(record.data.name=="") {
         return;
      }
      var grid = this.getMemberGrid();
      grid.getStore().load({
         params: {
            'username': record.data.name
         }
      });
   },

   onGroupMemberShipChanged: function(editor, e) {
      var me = this;
      var data = e.record.data;

      var username = me.getUserGrid().getSelectionModel().getSelection()[0].data.name;
      var groupname = data.name;
      var memberof = data.member;

      Ext.Ajax.request({
          url: 'index.php/authentication/changegroupmembership',
          method:'post',
          params: {
             'username': username,
             'group': groupname,
             'memberof': memberof
          },
          success: function(response, opts) {
             var grid = me.getUserGrid();
             var sm = grid.getSelectionModel();
             var r = null;
             if(sm.getCount()>0) {
                r = sm.getSelection()[0];
             }

             Msg.show("Success", "Membership changed.");
             me.getUserGrid().getStore().load({
                callback: function() {
                   if(r==null) {
                      sm.select(me.getUserGrid().getStore().getAt(0));
                   } else {
                      sm.select(grid.getStore().getAt(grid.getStore().find('name', r.data.name)));
                   }
                }
             });
          },
          failure: function(response, opts) {
             Msg.show("Failure", "Could not change membership.");
          }
      });

   }


});
