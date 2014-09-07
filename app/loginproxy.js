
if(!console) {
   var console = {
      log: function() {

      }
   }
}

Ext.Loader.setConfig({
    enabled : true,
    paths   : {
        DirectoryListing : 'app',
        'Ext.ux': 'ux'
    }
});
Ext.require('*');

Ext.onReady(function()
{

   Ext.Ajax.on('requestcomplete', function (conn, response, options) {
      var json = Ext.decode(response.responseText);
      if(json.message!=null && json.success==false && !(json.globalerror && json.globalerror==false)) {
         Msg.show("Remote Error", json.message);
      }
    });

   Ext.application(
   {
      name: 'DirectoryListing',
      autoCreateViewport: false,
      models: [  ],
      stores: [  ],
      controllers: [ 'Authentication' ],

      launch: function()
      {
         var me = this;
         me.fireEvent('checkloginstatus');

         var dialog=null;
         var loginprogress=false;
         this.on('loginstatuscached', function(user)
         {
            if(dialog)
            {
               console.log('close dialog')
               dialog.close();
               dialog=null;
            }

            Ext.getBody().setHTML("");

            if(user.loggedin)
            {
               console.log('login!');
               if(loginprogress)
               {
                  console.log('redirect')
                  location.reload();
               }
               else
               {
                  console.log('denied dialog')
                  dialog = Ext.MessageBox.show({
                     closable:false,
                     title: '403 Forbidden',
                     msg: 'Permission denied.',
                     buttons: null,
                     icon: Ext.MessageBox.ERROR
                  });
               }
            }
            else
            {
               dialog = Ext.create('DirectoryListing.view.LoginWindow', {
                  closable:false
               });
               dialog.show();
               loginprogress=true;
               console.log('login box');
               /*
               me.on('loggedin', function()
               {
                  console.log(window.location.href);
                  window.location.href="";
               });
               */
            }

         });

      }
   });

});