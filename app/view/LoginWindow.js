
Ext.define('DirectoryListing.view.LoginWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'loginwindow',

   title:'Login',
   iconCls:'iconcls-key',
   width:400,

   listeners: {
      afterrender: function(me)
      {
         me.child('form textfield[name=username]').focus(true,true);
      }
   },

   items: [{
         xtype:'form',
         bodyPadding:5,
         layout: 'anchor',
         border:0,
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
