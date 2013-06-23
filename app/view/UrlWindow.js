
Ext.define('DirectoryListing.view.UrlWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',

   title:'Direct URL',
   width:600,
   height:120,
   modal:true,
   focusOnToFront:false,

   setURL: function(val) {
      this.child('form textfield').setValue(val);
   },

   items: [{
         xtype:'form',
         bodyPadding:5,
         layout:'anchor',
         defaults: {
            anchor:'100%'
         },
         items: [
            {
               xtype:'textfield',
               editable:false,
               listeners: {
                  afterrender: function(txt) {
                     txt.focus(true, true);
                  }
               }
            }
         ],
         buttons: [
            {
               xtype:'button',
               text:'Close',
               listeners: {

                  click: function(btn) {
                     btn.up('window').close();
                  }

               }
            }
         ]
   }]

});
