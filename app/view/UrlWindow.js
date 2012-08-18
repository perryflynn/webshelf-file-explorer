
Ext.define('DirectoryListing.view.UrlWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   
   title:'Direct URL',
   width:600,
   height:120,
   modal:true,
   
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
                     window.setTimeout(function() {txt.selectText(); }, 1000);
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
