
Ext.define('DirectoryListing.controller.Authentication', {
    extend: 'Ext.app.Controller',

    views: [ 'LoginWindow' ],
    stores: [  ],

    refs: [
        { ref: 'loginWindow', selector: 'window[xid=loginwindow]' },
        { ref: 'fileWindow', selector: 'window[xid=filewindow]' },
        { ref: 'form', selector: 'window[xid=loginwindow] form' }
    ],

    cachedLoginStatus: null,

   init: function() {

        this.control({
            'window[xid=loginwindow]': {
               afterrender: this.onWindowRendered
            },
            'window[xid=loginwindow] form textfield': {
               specialkey: this.onTextfieldSpecialKey
            },
            'window[xid=loginwindow] toolbar button[xid=do-login]': {
               click: this.onLoginClicked
            },
            scope:this
        });

        this.application.on({
           'logout': this.globalLogout,
           'checkloginstatus': this.globalCheckLoginStatus,
           scope: this
        });

   },

   globalLogout: function() {
      var me = this;
      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=logout',
          success: function(response, opts) {
             me.application.fireEvent('checkloginstatus');
             me.application.fireEvent('reloadfiletree');
             Msg.show("Success", "Logout successfull.");
          },
          failure: function(response, opts) {
              Msg.show("Failure", "Logout failed.");
          }
      });
   },

   globalCheckLoginStatus: function() {
      var me = this;
      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=getuserstatus',
          success: function(response, opts) {
             var json = Ext.decode(response.responseText);
             Settings.user = json.result;

             if(json.result.loggedin==true && (me.cachedLoginStatus==false || me.cachedLoginStatus==null)) {
                me.application.fireEvent('loggedin', Settings.user);
             } else if(json.result.loggedin==false && (me.cachedLoginStatus==true || me.cachedLoginStatus==null)) {
                me.application.fireEvent('loggedout');
             }

             me.cachedLoginStatus = json.result.loggedin;

          },
          failure: function(response, opts) {
              Msg.show("Failure", "Could not check user status.");
          }
      });
   },

   onWindowRendered: function(win) {
      win.child('form').getForm().findField('args[username]').focus(true, true);
   },

   onTextfieldSpecialKey: function(field, e) {
      if (e.getKey() == e.ENTER) {
         this.onLoginClicked();
      }
   },

   onLoginClicked: function() {
      var me = this;
      var win = this.getLoginWindow();
      var form = this.getForm();

      form.getForm().submit({
         clientValidation: true,
         url: 'ajax.php?controller=authentication&action=login',
         success: function(form, action) {
            Msg.show("Success", "Login successfull.");
            me.application.fireEvent('checkloginstatus');
            me.application.fireEvent('reloadfiletree');
            win.close();
         },
         failure: function(form, action) {
            Msg.show("Failure", "Login failed.");
            me.application.fireEvent('checkloginstatus');
         }
      });

   }


});