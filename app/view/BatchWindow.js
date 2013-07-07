
Ext.define('DirectoryListing.view.BatchWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:true,
   xid:'batchwindow',

   width:400,

   deleteindex: 0,
   records: null,
   target: null,
   autostart:false,

   successcount: 0,
   failurecount: 0,

   initComponent: function()
   {
      this.on('afterrender', this.onWindowRendered, this);

      this.callParent();

      var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
      var delbtn = tb.child('button[xid=ok]');
      delbtn.on('click', this.onOk, this);

      var cbtn = tb.child('button[xid=cancel]');
      cbtn.on('click', this.onCancel, this);

      if(this.oktext) {
         delbtn.setText(this.oktext);
      }
      if(this.canceltext) {
         cbtn.setText(this.canceltext);
      }

   },

   onWindowRendered: function() {
      if(this.autostart==true) {
         this.onOk(this.getOkButton());
      }
   },

   onCancel: function() {
      this.close();
   },

   getCancelButton: function() {
      var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
      return tb.child('button[xid=cancel]');
   },

   getOkButton: function() {
      var tb = this.child('form').getDockedItems('toolbar[dock=bottom]')[0];
      return tb.child('button[xid=ok]');
   },

   updateProgress: function() {
      var percent = Math.ceil((100/this.records.length*this.deleteindex))/100;
      this.child('form progressbar[xid=pbar]').updateProgress(percent, this.deleteindex+" of "+this.records.length+" done");
   },

   onOk: function(btn) {
      var me = btn.up('window');
      btn.setDisabled(true);
      me.child('form progressbar[xid=pbar]').updateText('Start...');
      me.deleteindex = 0;
      var callback = function(success) {
         if(success) {
            me.successcount++;
         } else {
            me.failurecount++;
         }
         me.deleteindex++;
         me.updateProgress();
         if(me.records[me.deleteindex]) {
            me.fireEvent('okclicked', me.records[me.deleteindex], me.target, callback);
         } else {
            me.fireEvent('okcompleted', me.records.length, me.successcount, me.failurecount);
            me.getCancelButton().setText("Close");
            me.close();
         }
      }
      me.fireEvent('okclicked', me.records[me.deleteindex], me.target, callback);
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
               text:'OK',
               xid:'ok'
            },
            {
               text:'Cancel',
               xid:'cancel'
            }
         ]
   }]

});
