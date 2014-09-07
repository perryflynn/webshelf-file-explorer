
Ext.define('DirectoryListing.view.NewFolderWindow', {
   extend:'DirectoryListing.view.RenameWindow',
   iconCls:'iconcls-folder_add',
   xid:'newfolderwindow',

   titletemplate: new Ext.XTemplate('Create new folder'),
   submitbuttonnname:'Create Folder',

   initComponent: function()
   {
      var me = this;
      this.callParent();
   },

   setFile: function(filename)
   {
      this.fullname = filename.substring(0, filename.lastIndexOf('/')+1);
      this.filename = filename.substring(filename.lastIndexOf('/')+1);
      if(this.filename.length<1) {
         var myRegexp = /\/([^\/]*?)\/$/g;
         var match = myRegexp.exec(filename);
         this.filename = match[1];
         this.isfolder=true;
      }

      var txt = this.child('form textfield[xid=newname]');
      txt.on('change', this.onFilenameChanged, this, {single:true});
      txt.setValue(this.fullname);
      this.setTitle(this.titletemplate.apply({ filename:this.filename, fullname:this.fullname }));
   },

   onFilenameChanged: function(txt, newval, oldval)
   {
      var me = this;
      txt.focus(false, true);
      window.setTimeout(function() {
         txt.selectText(newval.length);
      }, 20);
   }

});
