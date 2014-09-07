
Ext.define('DirectoryListing.view.ImageviewerWindow', {
   extend: 'DirectoryListing.view.BasicWindow',
   layout:'fit',
   xid:'imageviewerwindow',

   requires: [
      'Ext.ux.fiaedotws.imageviewer.Panel'
   ],

   title:'Imageviewer',
   iconCls:'iconcls-photo',
   width:800,
   height:600,
   maximizable:true,

   initComponent: function() {

      this.on('beforeshow', this.onBeforeShow, this);
      this.callParent();

   },

   onBeforeShow: function() {
      if(this.imagelist.length<1) {
         Msg.show("Information", "No images found.");
         return false;
      }
      this.child('imageviewer').setImages(this.imagelist);
      if(this.selectedimage) {
         this.child('imageviewer').setCurrentImage(this.selectedimage);
      }
   },

   items: [
      {
         xtype:'imageviewer',
         border:0
      }
   ]

});
