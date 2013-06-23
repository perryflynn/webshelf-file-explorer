
Ext.define('DirectoryListing.view.ManageWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'managewindow',

   title:'Manage Shares, Groups and Users',
   width:Config.winWidth,
   height:Config.winHeight,

   items: [
      {
         xtype:'tabpanel',
         defaults: {
            layout:'fit'
         },
         items:[
            {
               title:'Groups',
               layout:{
                  type:'hbox',
                  align:'stretch'
               },
               defaults: {
                  xtype:'panel'
               },

               items: [
                  {
                     flex:1,
                     tbar: [
                        { xtype:'tbfill' },
                        {
                           text:'New Group',
                           xid:'add-group'
                        }
                     ],

                     xtype:'gridpanel',
                     xid:'grouplist',
                     columns:[
                        { text:'Group Name', dataIndex:'name', flex:1, editor: { allowBlank: false } },
                        { text:'Shares', dataIndex:'shares' },
                        {
                           xtype: 'actioncolumn',
                           width: 30,
                           align:'center',
                           sortable: false,
                           menuDisabled: true,
                           items: [{
                               icon: 'fileicons/drive_delete.png',
                               tooltip: 'Delete Group',
                               scope: this,
                               handler: function(grid, rowIndex, colIndex, item, e, record) {
                                  grid.up('gridpanel[xid=grouplist]').fireEvent('deleterow', grid.up('gridpanel[xid=grouplist]'), record);
                               }
                           }]
                        }
                     ],
                     plugins: [
                        new Ext.grid.plugin.CellEditing({
                           clicksToEdit: 1
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'shares'],
                        proxy: {
                           type: 'ajax',
                           url: 'ajax.php?controller=authentication&action=grouplist',
                           reader: {
                              type: 'json',
                              root: 'result'
                           }
                        }
                    })

                  },
                  {
                     flex:2,
                     tbar: [
                        { xtype:'tbfill' },
                        {
                           text:'New Share',
                           xid:'add-share'
                        }
                     ],

                     xtype:'gridpanel',
                     xid:'sharelist',
                     columns:[
                        { text:'Path', dataIndex:'path', flex:1, editor: { allowBlank: false } },
                        { text:'Read', dataIndex:'read', xtype: 'checkcolumn' },
                        { text:'Delete', dataIndex:'delete', xtype: 'checkcolumn' },
                        { text:'Download', dataIndex:'download', xtype: 'checkcolumn' },
                        {
                           xtype: 'actioncolumn',
                           width: 30,
                           align:'center',
                           sortable: false,
                           menuDisabled: true,
                           items: [{
                               icon: 'fileicons/drive_delete.png',
                               tooltip: 'Delete Share',
                               scope: this,
                               handler: function(grid, rowIndex, colIndex, item, e, record) {
                                  grid.up('gridpanel[xid=sharelist]').fireEvent('deleterow', grid.up('gridpanel[xid=sharelist]'), record);
                               }
                           }]
                        }
                     ],
                     plugins: [
                        new Ext.grid.plugin.CellEditing({
                           clicksToEdit: 1
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['path', 'read', 'delete', 'download'],
                        proxy: {
                           type: 'ajax',
                           url: 'ajax.php?controller=authentication&action=groupsharelist',
                           reader: {
                              type: 'json',
                              root: 'result'
                           },
                           writer: {
                              type:'json'
                           }
                        }
                    })

                  }
               ]

            },
            {
               title:'Users'
            }
         ]
      }
   ]

});
