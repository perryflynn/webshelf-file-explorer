
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
   titletemplate: new Ext.XTemplate('Rename {fullname}'),
   submitbuttonnname:'Rename',

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

      var txt = this.child('form textfield[xid=newname]');
      txt.on('change', this.onFilenameChanged, this, {single:true});
      txt.setValue(this.filename);
      this.setTitle(this.titletemplate.apply({ filename:this.filename, fullname:this.fullname }));
   },

   onFilenameChanged: function(txt, newval, oldval)
   {
      var me = this;
      txt.focus(false, true);
      window.setTimeout(function() {
         if(me.isfolder==false && newval.lastIndexOf('.')>0) {
            txt.selectText(0, newval.lastIndexOf('.'));
         }
         else
         {
            txt.selectText();
         }
      }, 20);
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
                     specialkey: function(field, e)
                     {
                        var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
                        var sbtn = tb.child('button[xid=submit]');
                        if (e.getKey() == e.ENTER) {
                           sbtn.fireEvent('click', sbtn);
                        }
                     },
                     scope:me
                  }
               }
            ],
            buttons: [
               {
                  xtype:'button',
                  xid:'submit',
                  text:me.submitbuttonnname,
                  listeners: {
                     click: function(btn) {
                        var newname = me.child('form textfield[xid=newname]').getSubmitValue();
                        var oldname = me.fullname;
                        me.fireEvent('renamefile', newname, oldname);
                        me.close();
                     }
                  }
               },
               {
                  xtype:'button',
                  xid:'cancel',
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
