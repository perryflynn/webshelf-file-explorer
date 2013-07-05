
Ext.define('DirectoryListing.view.DeleteBatchWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:true,
   xid:'batchdeletewindow',

   title:'Delete',
   icon:'fileicons/folder_delete.png',
   width:400,

   deleteindex: 0,
   records: null,

   initComponent: function()
   {
      this.callParent();
      this.setTitle("Really delete "+this.records.length+" File"+(this.records.length==1 ? "" : "s")+"?");

      var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
      var delbtn = tb.child('button[xid=delete]');
      var cbtn = tb.child('button[xid=cancel]');

      delbtn.on('click', this.onDelete, this);
      cbtn.on('click', this.onCancel, this);
   },

   onCancel: function() {
      this.close();
   },

   getCancelButton: function() {
      var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
      return tb.child('button[xid=cancel]');
   },

   updateProgress: function() {
      var percent = Math.ceil((100/this.records.length*this.deleteindex))/100;
      this.child('form progressbar[xid=pbar]').updateProgress(percent, this.deleteindex+" of "+this.records.length+" done");
   },

   onDelete: function(btn) {
      btn.setDisabled(true);
      var me = this;
      me.deleteindex = 0;
      var callback = function() {
         me.deleteindex++;
         me.updateProgress();
         if(me.records[me.deleteindex]) {
            me.fireEvent('deletefile', me.records[me.deleteindex], callback);
         } else {
            me.fireEvent('deletecompleted', me.records.length);
            if(me.records.length>1) {
               me.getCancelButton().setText("Close");
            } else {
               me.close();
            }
         }
      }
      me.fireEvent('deletefile', me.records[me.deleteindex], callback);
   },

   items: [{
         xtype:'form',
         bodyPadding:5,
         layout: 'anchor',
         defaults: {
             anchor: '100%'
         },
         items: [
            {
               xtype:'progressbar',
               text:'you decide',
               xid:'pbar',
               value: .0
            }
         ],
         buttons: [
            {
               text:'Delete all files',
               xid:'delete'
            },
            {
               text:'Cancel',
               xid:'cancel'
            }
         ]
   }]

});
