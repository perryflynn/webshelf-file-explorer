
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
         
            /*** Group Tab ***/
            {
               title:'Groups',
               xid:'grouptab',
               layout:{
                  type:'hbox',
                  align:'stretch'
               },
               defaults: {
                  xtype:'panel'
               },

               items: [
               
                  /*** Group Gridpanel ***/
               
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
                     listeners: {
                        beforeedit:function(e, editor) {
                           if(editor.record.data.name!="") {
                              return false;
                           }
                        }
                     },
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
                               icon: 'fileicons/group_delete.png',
                               tooltip: 'Delete Group',
                               scope: this,
                               handler: function(grid, rowIndex, colIndex, item, e, record) {
                                 if(record.data.saved==false) {
                                    Msg.show("Failure", "This record is not saved.");
                                    return;
                                 }
                                 if(record.data.deletable==false) {
                                    Msg.show("Failure", "This group is readonly.");
                                    return;
                                 }
                                 grid.up('gridpanel').fireEvent('deleterow', grid.up('gridpanel'), record);
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
                        fields:['name', 'shares', 'deletable', 'saved'],
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
                  
                  /*** Group Gridpanel END ***/
                  
                  /*** Share Gridpanel ***/
                  
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
                        {
                           text:'Read',
                           dataIndex:'read',
                           xtype: 'checkcolumn',
                           listeners: {
                              beforecheckchange: function(col, rowidx) {
                                 var grid = this.up('gridpanel');
                                 var record = grid.getStore().getAt(rowidx);
                                 if(record.data.path=="") {
                                    Msg.show("Failure", "Please set a path first.");
                                    return false;
                                 }
                              },
                              checkchange: function(column, recordIndex, checked) {
                                 var grid = this.up('gridpanel');
                                 grid.getSelectionModel().select(recordIndex);
                                 grid.fireEvent('edit', null, {record:grid.getStore().getAt(recordIndex), grid:grid});
                              }
                           }
                        },
                        {
                           text:'Delete',
                           dataIndex:'delete',
                           hidden:true,
                           xtype: 'checkcolumn',
                           listeners: {
                              beforecheckchange: function(col, rowidx) {
                                 var grid = this.up('gridpanel');
                                 var record = grid.getStore().getAt(rowidx);
                                 if(record.data.path=="") {
                                    Msg.show("Failure", "Please set a path first.");
                                    return false;
                                 }
                              },
                              checkchange: function(column, recordIndex, checked) {
                                 var grid = this.up('gridpanel');
                                 grid.getSelectionModel().select(recordIndex);
                                 grid.fireEvent('edit', null, {record:grid.getStore().getAt(recordIndex), grid:grid});
                              }
                           }
                        },
                        {
                           text:'Download',
                           dataIndex:'download',
                           xtype: 'checkcolumn',
                           hidden:true,
                           listeners: {
                              beforecheckchange: function(col, rowidx) {
                                 var grid = this.up('gridpanel');
                                 var record = grid.getStore().getAt(rowidx);
                                 if(record.data.path=="") {
                                    Msg.show("Failure", "Please set a path first.");
                                    return false;
                                 }
                              },
                              checkchange: function(column, recordIndex, checked) {
                                 var grid = this.up('gridpanel');
                                 grid.getSelectionModel().select(recordIndex);
                                 grid.fireEvent('edit', null, {record:grid.getStore().getAt(recordIndex), grid:grid});
                              }
                           }
                        },
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
                                  if(record.data.saved==false) {
                                     Msg.show("Failure", "This record is not saved.");
                                     return;
                                  }
                                  grid.up('gridpanel').fireEvent('deleterow', grid.up('gridpanel'), record);
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
                        fields:['path', 'read', 'delete', 'download', 'saved'],
                        proxy: {
                           type: 'ajax',
                           url: 'ajax.php?controller=authentication&action=groupsharelist',
                           reader: {
                              type: 'json',
                              root: 'result'
                           }
                        }
                    })

                  }
                  
                  /*** Share Gridpanel ***/
                  
               ]

            },
            
            /*** Group Tab END ***/

/*   User Admin   ***********************************************************************************************/

            /*** User Tab ***/

            {
               title:'Users',
               xid:'usertab',
               layout:{
                  type:'hbox',
                  align:'stretch'
               },
               defaults: {
                  xtype:'panel'
               },

               items: [
               
                  /*** User Gridpanel ***/
               
                  {
                     flex:1,
                     tbar: [
                        { xtype:'tbfill' },
                        {
                           text:'New User',
                           xid:'add-user'
                        }
                     ],

                     listeners: {
                        beforeedit: function(editor, e) {
                           var record = e.record.data;
                           if(record.name==Config.user.username) {
                              return false;
                           }
                        }
                     },

                     xtype:'gridpanel',
                     xid:'userlist',
                     columns:[
                        { text:'Username', dataIndex:'name', flex:1, editor: { allowBlank: false } },
                        {
                           text:'Admin',
                           dataIndex:'admin',
                           xtype: 'checkcolumn',
                           listeners: {
                              beforecheckchange: function(col, rowidx) {
                                 var grid = this.up('gridpanel');
                                 var record = grid.getStore().getAt(rowidx);
                                 if(record.data.name==Config.user.username) {
                                    return false;
                                 }
                                 if(record.data.path=="") {
                                    Msg.show("Failure", "Please set a username first.");
                                    return false;
                                 }
                              },
                              checkchange: function(column, recordIndex, checked) {
                                 var grid = this.up('gridpanel');
                                 var record = grid.getStore().getAt(recordIndex);
                                 grid.getSelectionModel().select(recordIndex);
                                 grid.fireEvent('edit', null, {record:record, grid:grid});
                              }
                           }
                        },
                        {
                           xtype: 'actioncolumn',
                           width: 30,
                           align:'center',
                           sortable: false,
                           menuDisabled: true,
                           items: [
                              {
                                 icon: 'fileicons/key_go.png',
                                 tooltip: 'Change Password',
                                 scope: this,
                                 handler: function(grid, rowIndex, colIndex, item, e, record) {
                                    if(record.data.saved==false) {
                                       Msg.show("Failure", "This record is not saved.");
                                       return;
                                    }
                                   grid.up('gridpanel').fireEvent('changepw', grid.up('gridpanel'), record);
                                 }
                              }
                           ]
                        },
                        {
                           xtype: 'actioncolumn',
                           width: 30,
                           align:'center',
                           sortable: false,
                           menuDisabled: true,
                           items: [
                              {
                                 icon: 'fileicons/user_delete.png',
                                 tooltip: 'Delete User',
                                 scope: this,
                                 handler: function(grid, rowIndex, colIndex, item, e, record) {
                                   if(record.data.deletable==false) {
                                      Msg.show("Failure", "This user cant deleted.");
                                      return;
                                   }
                                   grid.up('gridpanel').fireEvent('deleterow', grid.up('gridpanel'), record);
                                 }
                              }
                           ]
                        }
                     ],
                     plugins: [
                        new Ext.grid.plugin.CellEditing({
                           clicksToEdit: 1
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'admin', 'deletable', 'saved'],
                        proxy: {
                           type: 'ajax',
                           url: 'ajax.php?controller=authentication&action=userlist',
                           reader: {
                              type: 'json',
                              root: 'result'
                           }
                        }
                    })


                  },
                  
                  /*** User Gridpanel END ***/
                  
                  /*** Group Membership Gridpanel ***/
                  
                  {
                     flex:2,
                     
                     xtype:'gridpanel',
                     xid:'groupmemberlist',
                     columns:[
                        {
                           text:'Is Member',
                           dataIndex:'member',
                           xtype: 'checkcolumn',
                           listeners: {
                              checkchange: function(column, recordIndex, checked) {
                                 var grid = this.up('gridpanel');
                                 grid.getSelectionModel().select(recordIndex);
                                 grid.fireEvent('edit', null, {record:grid.getStore().getAt(recordIndex), grid:grid});
                              }
                           }
                        },
                        { text:'Group', dataIndex:'name', flex:1 }
                     ],
                     plugins: [
                        new Ext.grid.plugin.CellEditing({
                           clicksToEdit: 1
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'member'],
                        proxy: {
                           type: 'ajax',
                           url: 'ajax.php?controller=authentication&action=usergrouplist',
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
                  
                  /*** Group Membership Gridpanel END ***/
                  
               ]

            }
            
            /*** User Tab END ***/
            
         ]
      }
   ],

});
