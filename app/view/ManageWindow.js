
Ext.define('DirectoryListing.view.ManageWindow', {
   extend: 'DirectoryListing.view.BasicWindow',
   layout:'fit',
   modal:true,
   focusOnToFront:false,
   xid:'managewindow',

   title:'Manage Shares, Groups and Users',
   iconCls:'iconcls-cog',
   width:Settings.windowwidth,
   height:Settings.windowheight,

   items: [
      {
         xtype:'tabpanel',
         defaults: {
            layout:'fit'
         },
         items:[

            /*** Settings Tab ***/

            {
               title:'Settings',
               iconCls:'iconcls-wrench_orange',
               xid:'settingstab',
               xtype:'form',
               layout:{
                  type:'hbox',
                  align:'stretch'
               },
               defaults: {
                  xtype:'panel',
                  flex:1,
                  border:0,
                  bodyPadding:5
               },

               items: [

                  /*** Left side ***/

                  {
                     defaults: {
                        xtype:'fieldset',
                        layout:'fit'
                     },
                     items: [

                        // Window width / height
                        {
                           title:'Window width / height',
                           layout:'anchor',
                           bodyPadding:5,
                           defaults: {
                              anchor:'100%'
                           },
                           items: [
                              {
                                 xtype:'numberfield',
                                 name:'windowwidth',
                                 fieldLabel:'Width',
                                 checkChangeBuffer:1000,
                                 minValue:500,
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                              },
                              {
                                 xtype:'numberfield',
                                 name:'windowheight',
                                 fieldLabel:'Height',
                                 checkChangeBuffer:1000,
                                 minValue:100,
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                              }
                           ]
                        },

                        // UI Theme
                        {
                           title:'UI Theme',
                           items: [
                              {
                                 xtype: 'radiogroup',
                                 columns: 2,
                                 vertical: true,
                                 items: [
                                     { boxLabel: 'Blue', name: 'uitheme', inputValue: 'classic' },
                                     { boxLabel: 'Gray', name: 'uitheme', inputValue: 'gray' },
                                     { boxLabel: 'Neptune', name: 'uitheme', inputValue: 'neptune' },
                                     { boxLabel: 'Access', name: 'uitheme', inputValue: 'access' }
                                 ],
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                             }
                           ]
                        }, //uitheme end

                        // Upload
                        {
                           title:'Upload Settings',
                           layout:'anchor',
                           defaults: {
                              anchor:'100%'
                           },
                           items: [
                              {
                                 xtype:'checkboxfield',
                                 boxLabel:'Upload',
                                 name:'upload',
                                 inputValue:'true',
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                              },
                              {
                                 xtype:'numberfield',
                                 name:'upload_maxsize',
                                 fieldLabel:'Max Size in MB',
                                 minValue:1,
                                 checkChangeBuffer:1000,
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                              }
                           ]
                        }, //uploadend

                        // Features
                        {
                           title:'Enabled Features',
                           items: [
                              {
                                 xtype: 'checkboxgroup',
                                 columns: 2,
                                 vertical: true,
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 },
                                 items: [
                                    { boxLabel:'Delete', name:'delete', inputValue:'true' },
                                    { boxLabel:'Copy', name:'copy', inputValue:'true' },
                                    { boxLabel:'Move / Rename', name:'move_rename', inputValue:'true' },
                                    { boxLabel:'Create Directory', name:'mkdir', inputValue:'true' },
                                    { boxLabel:'Image Viewer', name:'imageviewer', inputValue:'true' }
                                 ]
                              }
                           ]
                        }, //features end

                        // About Text
                        {
                           title:'About Content (HTML allowed)',
                           padding:'5px 10px 5px 10px',
                           items: [
                              {
                                 xtype:'textareafield',
                                 name:'about_content',
                                 grow:true,
                                 checkChangeBuffer:1000,
                                 enableKeyEvents: true,
                                 listeners: {
                                    change: function(field) {
                                       field.up('form').fireEvent('dosubmit');
                                    }
                                 }
                              }
                           ]
                        } //about end

                     ]
                  },

                  /*** Left side END ***/

                  /*** Right side ***/

                  {

                  }

                  /*** Right side END ***/

               ]

            },

            /*** Settings Tab END ***/

            /*** Group Tab ***/
            {
               title:'Groups',
               iconCls:'iconcls-group',
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
                               iconCls: 'iconcls-group_delete',
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
                           clicksToEdit: 1,
                           pluginId:'cellplugin'
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'shares', 'deletable', 'saved'],
                        proxy: {
                           type: 'ajax',
                           url: 'index.php/authentication/grouplist',
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

                     listeners: {
                        beforeedit: function(editor, e) {
                           if(e.record.data.saved==true && e.column.dataIndex=="path")
                           {
                              return false;
                           }
                        }
                     },

                     xtype:'gridpanel',
                     xid:'sharelist',
                     columns:[
                        {
                           text:'Path',
                           dataIndex:'path',
                           flex:1,
                           editor: new Ext.form.field.ComboBox({
                               typeAhead: false,
                               autoSelect:false,
                               triggerAction: 'all',
                               displayField: 'name',
                               valueField: 'name',
                               store: Ext.create('Ext.data.Store', {
                                  fields:['name'],
                                  proxy: {
                                     type: 'ajax',
                                     url: 'index.php/filesystem/sharelist',
                                     reader: {
                                        type: 'json',
                                        root: 'result'
                                     }
                                  }
                               }),
                               validator: function(value) {
                                  return (value.indexOf('/')<0 ? true : "Illegal character in share name" );
                               }
                           })

                        },
                        {
                           text:'Read',
                           width:60,
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
                           text:'Upload',
                           width:60,
                           dataIndex:'upload',
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
                           text:'Mkdir',
                           width:60,
                           dataIndex:'mkdir',
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
                           text:'Copy',
                           width:60,
                           dataIndex:'copy',
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
                           text:'Move/Rename',
                           width:90,
                           dataIndex:'move_rename',
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
                           text:'Protected',
                           width:60,
                           dataIndex:'protected',
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
                           xtype: 'checkcolumn',
                           width:60,
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
                               iconCls: 'iconcls-drive_delete',
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
                           clicksToEdit: 1,
                           pluginId:'cellplugin'
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['path', 'read', 'protected', 'upload', 'mkdir', 'copy', 'move_rename', 'delete', 'download', 'saved'],
                        proxy: {
                           type: 'ajax',
                           url: 'index.php/authentication/groupsharelist',
                           actionMethods: {
                              read:'POST'
                           },
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
               iconCls:'iconcls-user_green',
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
                           if((e.record.data.saved==true && e.column.dataIndex=="name") ||
                              Settings.user.username==e.record.data.name)
                           {
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
                                 if(record.data.name==Settings.user.username) {
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
                                 iconCls: 'iconcls-key_go',
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
                                 iconCls: 'iconcls-user_delete',
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
                           clicksToEdit: 1,
                           pluginId:'cellplugin'
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'admin', 'deletable', 'saved'],
                        proxy: {
                           type: 'ajax',
                           url: 'index.php/authentication/userlist',
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
                           clicksToEdit: 1,
                           pluginId:'cellplugin'
                         })
                     ],
                     store: Ext.create('Ext.data.Store', {
                        fields:['name', 'member'],
                        proxy: {
                           type: 'ajax',
                           url: 'index.php/authentication/usergrouplist',
                           actionMethods: {
                              read:'POST'
                           },
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

            },

            /*** User Tab END ***/

/*   Maintenance   ***********************************************************************************************/

            {
               title:'Maintenance',
               iconCls:'iconcls-bin',
               xid:'maintenance',
               bodyPadding:5,

               defaults: {
                  padding:5
               },

               layout: {
                  xtype:'vbox',
                  align:'stretch'
               },

               items: [
                  {
                     xtype:'fieldset',
                     xid:'thumbnailcache',
                     title:'Thumbnail Cache',
                     items: [
                        {
                           xtype:'panel',
                           xid:'thumbnailstatus',
                           border:0,
                           defaults: {
                              border:0
                           }
                        },
                        {
                           xtype:'button',
                           margin:'5 0 0 0',
                           text:'Clear thumbnail cache'
                        }
                     ]
                  }
               ]

            }


         ]
      }
   ]

});
