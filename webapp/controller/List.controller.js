sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.egat.training.zuserinfosisri.controller.List", {

            C_MODEL_NAME_FILTER: "filter",
            C_MODEL_NAME_DATA: "data",
            C_MODEL_NAME_DIALOG: "dialog",

            C_ENTITY_SET_USER: "/UserSet",

            onInit: function () {
                this.initModel();
            },

            initModel: function () {
                var filterModel = new sap.ui.model.json.JSONModel();
                filterModel.setData({
                    Userid: "",
                    Firstname: "",
                    Lastname: ""
                });
                this.getView().setModel(filterModel, this.C_MODEL_NAME_FILTER);
                var dataModel = new sap.ui.model.json.JSONModel();
                dataModel.setData([]);
                this.getView().setModel(dataModel, this.C_MODEL_NAME_DATA);

                var dialogModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(dialogModel, this.C_MODEL_NAME_DIALOG);


            },

            onSearch: function (oEvt) {
                this.searchUserList();
            },

            searchUserList: function () {
                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();

                    var aFilter = this.getFilter();

                    oDataModel.read(this.C_ENTITY_SET_USER, {

                        filters: aFilter,

                        success: function (s) {
                            this.getView().getModel(this.C_MODEL_NAME_DATA).setData(s.results);
                            resolve(s);
                        }.bind(this),
                        error: function (e) {
                            this.getView().getModel(this.C_MODEL_NAME_DATA).setData([]);
                            reject(e);
                        }.bind(this)
                    });
                }.bind(this));
            },


            getFilter: function () {
                var oFilterData = this.getView().getModel(this.C_MODEL_NAME_FILTER).getData();
                var aFilter = [];
                for (var fieldName in oFilterData) {
                    var value = oFilterData[fieldName];
                    if (value) {
                        var oFilter = new sap.ui.model.Filter(fieldName, "Contains", value);
                        aFilter.push(oFilter);
                    }
                }
                return aFilter;
            },


            onCreate: function (oEvt) {
                this.openCreateDialog();
            },

            openCreateDialog: function () {
                if (!this.oCreateDialog) {
                    this.oCreateDialog = sap.ui.xmlfragment("com.egat.training.zuserinfosisri.fragment.CreateDialog", this);
                    this.getView().addDependent(this.oCreateDialog);
                }
                this.getView().getModel(this.C_MODEL_NAME_DIALOG).setData({
                    Firstname: "",
                    Lastname: "",
                    Email: "",
                    Phone: "",
                    Country: ""
                });
                this.oCreateDialog.open();
            },

            onCreateDialogCancel: function () {
                this.oCreateDialog.close();
            },

            onCreateDialogConfirm: function (oEvt) {
                this.getView().setBusy(true);

                this.createNewRecordFromDialog().then(function (success) {

                    this.getView().setBusy(false);
                    this.oCreateDialog.close();
                    sap.m.MessageBox.success("Create success. New user id is " + success.Userid + " .", {

                        onClose: function () {
                            this.searchUserList();
                        }.bind(this)

                    });

                }.bind(this), function (error) {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.error("Error occurs.");
                }.bind(this));
            },

            createNewRecordFromDialog: function () {

                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();
                    var oCreateData = this.getView().getModel(this.C_MODEL_NAME_DIALOG).getData();
                    oDataModel.create(this.C_ENTITY_SET_USER, oCreateData, {
                        success: function (s) {
                            resolve(s);
                        }.bind(this),
                        error: function (e) {
                            reject(e);
                        }.bind(this)
                    });

                }.bind(this));

            },

            onItemPress: function (oEvt) {
                var item = oEvt.getSource();
                var oBindingContext = item.getBindingContext(this.C_MODEL_NAME_DATA);
                var oBindingObject = oBindingContext.getObject();
                this.openUpdateDialog(oBindingObject);
            },

            openUpdateDialog: function (oUpdateObject) {
                if (!this.oUpdateDialog) {
                    this.oUpdateDialog = sap.ui.xmlfragment("com.egat.training.zuserinfosisri.fragment.UpdateDialog", this);
                    this.getView().addDependent(this.oUpdateDialog);
                }
                this.readUserRecord(oUpdateObject.Userid).then(function (success) {
                    this.getView().getModel(this.C_MODEL_NAME_DIALOG).setData(success);
                    this.oUpdateDialog.open();
                }.bind(this), function () {
                    sap.m.MessageBox.error("Error occurs.");
                }.bind(this));
            },

            readUserRecord: function (userId) {
                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();
                    var readPath = this.C_ENTITY_SET_USER + "('" + userId + "')"
                    oDataModel.read(readPath, {
                        urlParameters : {
                            "$expand" : "ToUserAuth"
                        },
                        success: function (s) {
                            debugger;
                            resolve(s);
                        }.bind(this),
                        error: function (e) {
                            reject(e);
                        }.bind(this)
                    });

                }.bind(this));
            },

            onUpdateDialogCancel: function () {
                this.oUpdateDialog.close();
            },

            onUpdateDialogConfirm: function (oEvt) {

                this.getView().setBusy(true);

                this.updateRecordFromDialog().then(function (success) {

                    this.getView().setBusy(false);
                    this.oUpdateDialog.close();

                    sap.m.MessageBox.success("Update success.", {
                        onClose: function () {
                            this.searchUserList();
                        }.bind(this)
                    });

                }.bind(this), function (error) {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.error("Error occurs.");
                }.bind(this));
            },

            updateRecordFromDialog: function () {
                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();
                    var oUpdateData = this.getView().getModel(this.C_MODEL_NAME_DIALOG).getData();

                    var updatePath = this.C_ENTITY_SET_USER + "('" + oUpdateData.Userid + "')";

                    oDataModel.update(updatePath, oUpdateData, {
                        success: function (s) {
                            resolve(s);
                        }.bind(this),

                        error: function (e) {
                            reject(e);
                        }.bind(this)
                    });
                }.bind(this));
            },

            onItemDelete: function (oEvt) {

                var oItem = oEvt.getParameters().listItem;
                var oBindingContext = oItem.getBindingContext(this.C_MODEL_NAME_DATA);
                var oBindingObject = oBindingContext.getObject();

                sap.m.MessageBox.confirm("Confirm delete record?", {

                    onClose: function (action) {
                        if (action === sap.m.MessageBox.Action.OK) {
                            this.getView().setBusy(true);
                            this.deleteRecord(oBindingObject.Userid).then(function (success) {

                                this.getView().setBusy(false);

                                sap.m.MessageBox.success("Delete success.", {
                                    onClose: function () {
                                        this.searchUserList();
                                    }.bind(this)
                                });
                            }.bind(this), function (error) {
                                this.getView().setBusy(false);
                                sap.m.MessageBox.error("Error occurs.");
                            }.bind(this));
                        }
                    }.bind(this)

                });
            },

            deleteRecord: function (userId) {
                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();
                    var deletePath = this.C_ENTITY_SET_USER + "('" + userId + "')"
                    oDataModel.remove(deletePath, {
                        success: function (s) {
                            resolve(s);
                        }.bind(this),
                        error: function (e) {
                            reject(e);
                        }.bind(this)

                    });

                }.bind(this));
            },


            goToFileList : function( oEvt ){
                this.getOwnerComponent().getRouter().navTo("FileList")
            }









        });
    });
