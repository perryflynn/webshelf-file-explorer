
Ext.define('DirectoryListing.view.RenameWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   xid:'renamewindow',

   title:'Rename',
   icon:'fileicons/textfield_rename.png',
   width:600,
   height:120,
   modal:true,
   focusOnToFront:false,

   filename: null,

   initComponent: function()
   {
      var isfolder = false;
      var thename = this.filename.substring(this.filename.lastIndexOf('/')+1);
      if(thename.length<1) {
         var myRegexp = /\/([^\/]*?)\/$/g;
         var match = myRegexp.exec(this.filename);
         thename = match[1];
         isfolder=true;
      }

      this.items = [
         {
            xtype:'form',
            bodyPadding:5,
            layout:'anchor',
            defaults: {
               anchor:'100%'
            },
            items: [
               {
                  xtype:'textfield',
                  xid:'newname',
                  editable:false,
                  value: thename,
                  listeners: {
                     afterrender: function(txt) {
                        txt.focus(true, true);
                        if(isfolder==false) {
                           txt.selectText(0, thename.lastIndexOf('.'));
                        }
                     },
                     specialkey: function(field, e) {
                        if (e.getKey() == e.ENTER) {
                           var newname = field.up('window').child('form textfield[xid=newname]').getSubmitValue();
                           var oldname = field.up('window').filename;
                           field.up('window').fireEvent('renamefile', newname, oldname);
                           field.up('window').close();
                        }
                     }
                  }
               }
            ],
            buttons: [
               {
                  xtype:'button',
                  text:'Rename',
                  listeners: {
                     click: function(btn) {
                        var newname = btn.up('window').child('form textfield[xid=newname]').getSubmitValue();
                        var oldname = btn.up('window').filename;
                        btn.up('window').fireEvent('renamefile', newname, oldname);
                        btn.up('window').close();
                     }
                  }
               },
               {
                  xtype:'button',
                  text:'Cancel',
                  listeners: {
                     click: function(btn) {
                        btn.up('window').close();
                     }
                  }
               }
            ]
         }
      ];

      this.callParent();

   }

});
