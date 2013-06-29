
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

Ext.onReady(function() {

    /*Ext.Ajax.on('requestcomplete', function (conn, response, options) {
        var json = Ext.decode(response.responseText);
        if(json.success==false && !(json.globalerror && json.globalerror==false)) {
            Ext.Msg.show({
                title:'Error',
                msg: json.error_message,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    });*/

   Ext.getBody().setHTML("");


   Ext.application({
      name: 'DirectoryListing',

      autoCreateViewport: true,

      models: [  ],
      stores: [  ],
      controllers: [ 'GUI', 'Authentication', 'Manage' ],

      launch: function() {
         var me = this;
         me.fireEvent('checkloginstatus');
         window.setInterval(function() {
            me.fireEvent('checkloginstatus');
         }, 300000);
      }
   });

});