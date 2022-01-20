/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comegat.training./zuserinfo_sisr/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
