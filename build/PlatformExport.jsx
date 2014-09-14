(function() {
  var pngExporter;

  pngExporter = {
    doc: app.activeDocument,
    artboardCount: 0,
    artboardExportCount: 0,
    layerCount: 0,
    preferencesLayer: null,
    preferencesLayerName: 'exporter_info',
    preferencesXML: null,
    basePath: null,
    platform: null,
    dialog: null,
    progress: null,
    progressLabel: null,
    init: function() {
      app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
      this.artboardCount = this.doc.artboards.length;
      this.layerCount = this.doc.layers.length;
      this.artboardExportCount = this.getArtboardExportCount();
      if (this.loadPreferences()) {
        return this.showDialog();
      }
    },
    artboardTest: function(name) {
      var include;
      include = false;
      if (!(name.match(/^artboard/i) || name.match(/^\-/))) {
        include = true;
      }
      return include;
    },
    layerTest: function(name) {
      var visible;
      visible = false;
      if (!(name.match(/^specctr/) || name.match(/^exporter_info/) || name.match(/^\-/))) {
        visible = true;
      }
      return visible;
    },
    getArtboardExportCount: function() {
      var exportCount, i;
      exportCount = 0;
      i = 0;
      while (i < this.artboardCount) {
        if (this.artboardTest(this.doc.artboards[i].name)) {
          exportCount++;
        }
        i++;
      }
      return exportCount;
    },
    toggleLayers: function() {
      var i, _results;
      i = 0;
      _results = [];
      while (i < this.layerCount) {
        this.doc.layers[i].visible = this.layerTest(this.doc.layers[i].name);
        _results.push(i++);
      }
      return _results;
    },
    loadPreferences: function() {
      var e, exporterInfoXML, parse;
      parse = false;
      try {
        this.preferencesLayer = this.doc.layers.getByName(this.preferencesLayerName);
      } catch (_error) {
        e = _error;
        this.preferencesXML = new XML('<exporter_prefs></exporter_prefs>');
        this.preferencesXML.appendChild(new XML('<exporter_base_path>~/Desktop</exporter_base_path>'));
        this.preferencesXML.appendChild(new XML('<exporter_platform>android</exporter_platform>'));
        this.preferencesLayer = this.doc.layers.add();
        this.preferencesLayer.name = this.preferencesLayerName;
        exporterInfoXML = this.preferencesLayer.textFrames.add();
        exporterInfoXML.contents = this.preferencesXML.toXMLString();
        this.preferencesLayer.printable = false;
        this.preferencesLayer.visible = false;
      }
      if (this.preferencesLayer.textFrames.length !== 1) {
        Window.alert('Too many text frames were found. Please delete the exporter_info layer and try again.');
      } else {
        try {
          this.preferencesXML = new XML(this.preferencesLayer.textFrames[0].contents);
          this.basePath = this.preferencesXML.exporter_base_path;
          this.platform = this.preferencesXML.exporter_platform;
          parse = true;
        } catch (_error) {
          Window.alert('Failed to load preferences. Please delete the exporter_info layer and try again.');
        }
      }
      return parse;
    },
    parsePlatform: function(value) {
      var code;
      code = null;
      if (typeof value === 'number' || typeof value === 'object number') {
        if (value === 0) {
          code = 'android';
        } else if (value === 1) {
          code = 'iOS';
        } else if (value === 2) {
          code = 'win7';
        } else if (value === 3) {
          code = 'win8';
        } else if (value === 4) {
          code = 'web';
        }
      } else {
        value = value.toLowerCase();
        if (value === 'android') {
          code = 0;
        } else if (value === 'ios') {
          code = 1;
        } else if (value === 'win7' || value === 'windows 7') {
          code = 2;
        } else if (value === 'win8' || value === 'windows 8') {
          code = 3;
        } else if (value === 'web') {
          code = 4;
        }
      }
      return code;
    },
    showDialog: function() {
      var basePathField, basePathGroup, basePathLabel, buttonPanel, choosePathButton, messagePanel, platformGroup, platformLabel, platformList;
      this.dialog = new Window('dialog', 'Export Artboards');
      this.toggleLayers();
      messagePanel = this.dialog.add('panel', void 0, 'Export artboards to PNG for a platform');
      platformGroup = messagePanel.add('group', void 0, '');
      platformGroup.oreintation = 'row';
      platformGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
      platformLabel = platformGroup.add('statictext', void 0, 'Select a platform');
      platformLabel.size = [100, 20];
      platformList = platformGroup.add('dropdownlist', void 0, ['Android', 'iOS', 'Windows 7', 'Windows 8', 'Web']);
      if (this.parsePlatform(this.platform)) {
        platformList.selection = this.parsePlatform(this.platform);
      } else {
        platformList.selection = 0;
        this.platform = 'android';
      }
      basePathGroup = messagePanel.add('group', void 0, '');
      basePathGroup.orientation = 'row';
      basePathGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
      basePathLabel = basePathGroup.add('statictext', void 0, 'Output directory');
      basePathLabel.size = [100, 20];
      basePathField = basePathGroup.add('edittext', void 0, this.basePath);
      basePathField.size = [300, 20];
      choosePathButton = basePathGroup.add('button', void 0, 'Choose...');
      choosePathButton.onClick = function() {
        return basePathField.text = Folder.selectDialog();
      };
      this.progress = messagePanel.add('progressbar', void 0, 0, 100);
      this.progress.size = [400, 10];
      this.progressLabel = messagePanel.add('statictext', void 0, 'Will export ' + this.artboardExportCount + ' of ' + this.artboardCount + ' artboards');
      this.progressLabel.size = [400, 20];
      buttonPanel = this.dialog.add('group', void 0, '');
      buttonPanel.orientation = 'row';
      buttonPanel.cancelButton = buttonPanel.add('button', void 0, 'Cancel', {
        name: 'cancel'
      });
      buttonPanel.cancelButton.onClick = function() {
        return this.dialog.close();
      };
      buttonPanel.exportButton = buttonPanel.add('button', void 0, 'Export', {
        name: 'export'
      });
      buttonPanel.exportButton.onClick = function() {
        pngExporter.basePath = basePathField.text;
        pngExporter.platform = pngExporter.parsePlatform(platformList.selection.index);
        pngExporter.savePreferences();
        pngExporter["export"]();
        return pngExporter.dialog.close();
      };
      return this.dialog.show();
    },
    savePreferences: function() {
      this.preferencesXML.exporter_base_path = this.basePath;
      this.preferencesXML.exporter_platform = this.platform;
      try {
        return this.preferencesLayer.textFrames[0].contents = this.preferencesXML.toXMLString();
      } catch (_error) {
        return Window.alert('Failed to save preferences. Please delete the exporter_info layer and try again.');
      }
    },
    "export": function() {
      var baseFilename, destFile, exportOptions, exportType, folder, i, numExported, _results;
      numExported = 0;
      i = 0;
      baseFilename = this.doc.name.match(/(.*)\.[^\.]+$/)[1] + '_';
      exportType = ExportType.PNG24;
      exportOptions = new ExportOptionsPNG24();
      exportOptions.antiAliasing = true;
      exportOptions.transparency = true;
      exportOptions.artBoardClipping = true;
      exportOptions.matte = true;
      exportOptions.horizontalScale = exportOptions.verticalScale = 100;
      exportOptions.saveAsHTML = false;
      folder = new Folder(this.basePath);
      if (!folder.exists) {
        folder.create();
      }
      if (this.platform === 'android') {
        folder = new Folder(this.basePath + '/drawable-ldpi');
        if (!folder.exists) {
          folder.create();
        }
        folder = new Folder(this.basePath + '/drawable-mdpi');
        if (!folder.exists) {
          folder.create();
        }
        folder = new Folder(this.basePath + '/drawable-hdpi');
        if (!folder.exists) {
          folder.create();
        }
        folder = new Folder(this.basePath + '/drawable-xhdpi');
        if (!folder.exists) {
          folder.create();
        }
        folder = new Folder(this.basePath + '/drawable-xxhdpi');
        if (!folder.exists) {
          folder.create();
        }
        folder = new Folder(this.basePath + '/drawable-xxxhdpi');
        if (!folder.exists) {
          folder.create();
        }
      }
      _results = [];
      while (i < this.artboardCount) {
        if (this.artboardTest(this.doc.artboards[i].name)) {
          this.doc.artboards.setActiveArtboardIndex(i);
          if (this.platform === 'android') {
            destFile = new File(this.basePath + '/drawable-ldpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 75;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/drawable-mdpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 100;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/drawable-hdpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 150;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/drawable-xhdpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 200;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/drawable-xxhdpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 300;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/drawable-xxxhdpi/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 400;
            this.doc.exportFile(destFile, exportType, exportOptions);
          } else if (this.platform === 'iOS') {
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 100;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '@2x.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 200;
            this.doc.exportFile(destFile, exportType, exportOptions);
          } else if (this.platform === 'win7') {
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 100;
            this.doc.exportFile(destFile, exportType, exportOptions);
          } else if (this.platform === 'win8') {
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.scale-80.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 80;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.scale-100.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 100;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.scale-140.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 140;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.scale-180.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 180;
            this.doc.exportFile(destFile, exportType, exportOptions);
          } else if (this.platform === 'web') {
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 100;
            this.doc.exportFile(destFile, exportType, exportOptions);
            destFile = new File(this.basePath + '/' + baseFilename + this.doc.artboards[i].name + '@2x.png');
            exportOptions.horizontalScale = exportOptions.verticalScale = 200;
            this.doc.exportFile(destFile, exportType, exportOptions);
          }
          numExported++;
          this.progressLabel.text = 'Exported ' + numExported + ' of ' + this.artboardExportCount;
          this.progress.value = numExported / this.artboardExportCount * 100;
          this.dialog.update();
        }
        _results.push(i++);
      }
      return _results;
    }
  };

  pngExporter.init();

}).call(this);
