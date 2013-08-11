
Ext.define('DirectoryListing.view.ChangePasswordWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'changepasswordwindow',

   width:400,
   icon:'fileicons/key_go.png',

   targetusername: null,

   initComponent: function() {

      this.title = "Change password for "+this.targetusername;

      this.items = [
         {
            xtype:'form',
            bodyPadding:5,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items: [
               {
                  xtype:'textfield',
                  inputType: "password",
                  name:'password',
                  xid:'password1',
                  fieldLabel:'New Password',
                  value:'changemeplease',
                  enableKeyEvents:true,
                  listeners: {
                     afterrender: function() {
                        this.focus(true, true);
                     },
                     specialkey: function(btn, e) {
                        if (e.getKey() == e.ENTER) {
                           var win = btn.up('window');
                           win.fireEvent('changepw', win.targetusername, win.child('form textfield[xid=password1]').getValue());
                        }
                     },
                     keyup: function(btn) {
                        btn.up('form').getForm().isValid();
                     }
                  },
                  allowBlank: false,
                  validator: function(v) {
                     var pw1 = this.up('form').child('textfield[xid=password1]').getValue();
                     var pw2 = this.up('form').child('textfield[xid=password2]').getValue();
                     if(pw1==pw2) {
                        return true;
                     } else {
                        return "Passwords not match";
                     }
                  }
               },
               {
                  xtype:'textfield',
                  inputType: "password",
                  xid:'password2',
                  fieldLabel:'Re-enter',
                  enableKeyEvents:true,
                  allowBlank: false,
                  listeners: {
                     specialkey: function(btn, e) {
                        if (e.getKey() == e.ENTER) {
                           var win = btn.up('window');
                           win.changepw(btn);
                        }
                     },
                     keyup: function(btn) {
                        btn.up('form').getForm().isValid();
                     }
                  },
                  validator: function(v) {
                     var pw1 = this.up('form').child('textfield[xid=password1]').getValue();
                     var pw2 = this.up('form').child('textfield[xid=password2]').getValue();
                     if(pw1==pw2) {
                        return true;
                     } else {
                        return "Passwords not match";
                     }
                  }
               }
            ],
            buttons: [
               {
                  text:'Change',
                  xid:'do-change',
                  listeners: {
                     click: function(btn) {
                        var win = btn.up('window');
                        win.changepw(btn);
                     }
                  }
               }
            ] //end buttons
         } // end items
      ];

      this.callParent();
   },

   changepw: function(btn) {
      var win = btn.up('window');
      win.child('form').getForm().isValid();

      var user = win.targetusername;
      var pwd1 = win.child('form textfield[xid=password1]').getValue();
      var pwd2 = win.child('form textfield[xid=password2]').getValue();

      if(pwd1=="") {
         Msg.show("Failure", "Password is required");
         return;
      } else if(pwd1!=pwd2) {
         Msg.show("Failure", "Password not match");
         return;
      }

      win.fireEvent('changepw', user, pwd1);
      win.close();
   }

});
