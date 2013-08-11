
Ext.define('DirectoryListing.view.UploadWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:true,
   xid:'uploadwindow',

   width:600,
   height:400,

   targetpath: null,

   initComponent: function()
   {
      this.title = "Upload files to "+this.targetpath;

      this.items = [
         Ext.create('Ext.ux.upload.Panel', {
            xid:'uploadpanel',
            uploader: Ext.create('Ext.ux.upload.uploader.ExtJsUploader', {
               url: 'ajax.php',
               timeout: 86400000, // 24 hours
               params: {
                  controller:'filesystem',
                  action:'upload',
                  'targetpath':this.targetpath
               }
            })
         })
      ];

      this.callParent();

      // Window events
      this.on('beforeshow', this.onBeforeShow, this);

      // Redirect events
      this.child('[xid=uploadpanel]').on('uploadcomplete', this.onComplete, this);

   },

   onBeforeShow: function() {
      if(typeof window.FileReader=="undefined") {
         Msg.show("Failure", "FileAPI is not supported in this browser!")
         return false;
      }
   },

   onComplete:function(panel, manager, items, errorCount, eOpts) {
      this.fireEvent('uploadcomplete', panel, manager, items, errorCount, eOpts);
   }

});