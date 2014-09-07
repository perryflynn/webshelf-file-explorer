
Ext.define('DirectoryListing.view.LoginWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'loginwindow',

   title:'Login',
   iconCls:'iconcls-key',
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
               name:'username',
               fieldLabel:'Username'
            },
            {
               xtype:'textfield',
               name:'password',
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
