
Ext.define('DirectoryListing.view.RenameWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   xid:'renamewindow',

   title:'Rename',
   iconCls:'iconcls-textfield_rename',
   width:600,
   height:120,
   modal:true,
   focusOnToFront:false,

   isfolder:false,
   fullname: null,
   filename: null,

   setFile: function(filename)
   {
      this.fullname = filename;
      this.filename = filename.substring(filename.lastIndexOf('/')+1);
      if(this.filename.length<1) {
         var myRegexp = /\/([^\/]*?)\/$/g;
         var match = myRegexp.exec(filename);
         this.filename = match[1];
         this.isfolder=true;
      }

      this.child('textfield[xid=newname]').setValue(this.filename);
      this.setTitle('Rename '+this.fullname);
   },

   initComponent: function()
   {
      var me = this;

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
                  listeners: {
                     change: function(txt, newval) {
                        txt.focus(false, true);
                        if(me.isfolder==false) {
                           txt.selectText(0, me.filename.lastIndexOf('.'));
                        }
                     },
                     specialkey: function(field, e) {
                        if (e.getKey() == e.ENTER) {
                           var newname = me.child('form textfield[xid=newname]').getSubmitValue();
                           var oldname = me.filename;
                           me.fireEvent('renamefile', newname, oldname);
                           me.close();
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
                        var newname = me.child('form textfield[xid=newname]').getSubmitValue();
                        var oldname = me.filename;
                        me.fireEvent('renamefile', newname, oldname);
                        me.close();
                     }
                  }
               },
               {
                  xtype:'button',
                  text:'Cancel',
                  listeners: {
                     click: function(btn) {
                        me.close();
                     }
                  }
               }
            ]
         }
      ];

      this.callParent();

   }

});
