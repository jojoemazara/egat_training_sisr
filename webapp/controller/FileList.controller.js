sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.egat.training.zuserinfosisri.controller.FileList", {

            C_ENTITY_FILE: "/UserFileSet",

            C_MODEL_NAME_FILE: "fileList",
            C_MODEL_NAME_UPLOAD_RESULT: "uploadResult",

            onInit: function () {
                this.initModel();

                this.getOwnerComponent().getRouter().attachRouteMatched(this.handleRouteMatch.bind(this));

            },

            handleRouteMatch: function (oEvt) {
                this.loadFileList();
            },

            initModel: function () {
                var oModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(oModel, this.C_MODEL_NAME_FILE);

                var oModel = new sap.ui.model.json.JSONModel([]);
                this.getView().setModel(oModel, this.C_MODEL_NAME_UPLOAD_RESULT);
            },


            loadFileList: function () {
                return new Promise(function (res, rej) {

                    this.getView().setBusy(true);

                    var oDataModel = this.getView().getModel();

                    oDataModel.read(this.C_ENTITY_FILE, {

                        success: function (s) {
                            this.getView().setBusy(false);
                            var aFile = s.results;
                            for (var i in aFile) {
                                var oItem = aFile[i];
                                oItem.url = oDataModel.sServiceUrl + this.C_ENTITY_FILE + "('" + oItem.Filename + "')/$value"
                            }
                            this.getView().getModel(this.C_MODEL_NAME_FILE).setData(aFile);
                            res(s);
                        }.bind(this),

                        error: function (e) {
                            this.getView().setBusy(false);
                            this.getView().getModel(oModel).setData([]);
                            rej(e);
                        }.bind(this)

                    })

                }.bind(this));

            },


            onBeforeUploadStarts: function (oEvent) {
                this.getView().setBusy(true);
                // Header Slug
                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

                //collect file name to result
                this.collectPendingResult(oEvent.getParameter("fileName"));
                this.addPendingCount();


                var token = this.getView().getModel().getSecurityToken();

                var oCsrfToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: token
                });
                oEvent.getParameters().addHeaderParameter(oCsrfToken);

            },

            onStartUpload: function (oEvent) {
                
                //clear upload result data
                this.clearPendingCount();
                this.getView().getModel(this.C_MODEL_NAME_UPLOAD_RESULT).setData([]);
                
                var oUploadCollection = this.byId("UploadCollection");
                var cFiles = oUploadCollection.getItems().length;
                if (cFiles > 0) {
                    oUploadCollection.upload();
                }
            },

            onUploadComplete: function (oEvt) {
                var fileName = oEvt.getParameters().files[0].fileName;
                this.flagPendingResult(fileName, true);
                this.subPendingCount();
                this.checkUploadPendingCount();
            },

            onUploadTerminate: function (oEvt) {
                var fileName = oEvt.getParameters().files[0].fileName;
                this.flagPendingResult(fileName, false);
                this.checkUploadPendingCount();
            },

            collectPendingResult: function (fileName) {
                var aData = this.getView().getModel(this.C_MODEL_NAME_UPLOAD_RESULT).getData();
                aData.push({
                    fileName: fileName,
                    uploadComplete: false
                })
                this.getView().getModel(this.C_MODEL_NAME_UPLOAD_RESULT).setData(aData);
            },

            flagPendingResult: function (fileName, complete) {
                var aData = this.getView().getModel(this.C_MODEL_NAME_UPLOAD_RESULT).getData();
                for (var i in aData) {
                    var oItem = aData[i];
                    if (oItem.fileName === fileName) {
                        oItem.uploadComplete = complete;
                        break;
                    }
                }
                this.getView().getModel(this.C_MODEL_NAME_UPLOAD_RESULT).setData(aData);
            },

            clearPendingCount: function () {
                this.pendingFileCounter = 0;
            },

            addPendingCount: function () {
                this.pendingFileCounter += 1;
            },

            subPendingCount: function () {
                this.pendingFileCounter -= 1;
            },

            checkUploadPendingCount: function () {
                if (this.pendingFileCounter == 0) {
                    this.getView().setBusy(false);
                    this.showUploadResult();
                }
            },

            showUploadResult: function () {
                this.openResultDialog();
            },

            openResultDialog: function () {
                if (!this.oResultDialog) {
                    this.oResultDialog = sap.ui.xmlfragment("com.egat.training.zuserinfosisri.fragment.UploadResult", this);
                    this.getView().addDependent(this.oResultDialog);
                }
                this.oResultDialog.open();
            },

            onCloseResultDialog: function () {
                this.oResultDialog.close();
                this.loadFileList();
            },

            onFileDelete : function ( oEvt ){
                var fileName = oEvt.getSource().getBindingContext("fileList").getObject().Filename;

                sap.m.MessageBox.confirm("Confirm delete record?", {

                    onClose: function (action) {
                        if (action === sap.m.MessageBox.Action.OK) {
                            this.getView().setBusy(true);
                            this.deleteFile(fileName).then(function (success) {
                                this.getView().setBusy(false);
                                sap.m.MessageBox.success("Delete success.", {
                                    onClose: function () {
                                        this.loadFileList();
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

            deleteFile: function (fileName) {
                return new Promise(function (resolve, reject) {

                    var oDataModel = this.getView().getModel();
                    var deletePath = this.C_ENTITY_FILE + "('" + fileName + "')"
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

            onNavBack: function () {
                window.history.go(-1);
            }

        });
    });
