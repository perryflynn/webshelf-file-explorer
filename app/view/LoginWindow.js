
Ext.define('DirectoryListing.view.LoginWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'loginwindow',

   title:'Login',
   width:400,

   items: [{
         xtype:'form',
         bodyPadding:5,
         layout: 'anchor',
         defaults: {
             anchor: '100%'
         },
         items: [
            {
               xtype:'textfield',
               name:'args[username]',
               fieldLabel:'Username'
            },
            {
               xtype:'textfield',
               name:'args[password]',
               inputType: "password",
               fieldLabel:'Password'
            }
         ],
         buttons: [
            {
               text:'Login',
               xid:'do-login'
            }
         ]
   }]

});
