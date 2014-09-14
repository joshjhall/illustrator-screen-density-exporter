# PlatformExport.jsx
# 
# Export artboards as PNG files in approriate resolutions, filenames, dirs for different platform retina considerations
# Based on MultiExporter.js by Matthew Ericson (2011), mericson@ericson.net


pngExporter =
  # Main document object
  doc: app.activeDocument
  
  # Artboard counts
  artboardCount: 0
  artboardExportCount: 0
  
  # Layer counts
  layerCount: 0
  
  # Settings
  preferencesLayer: null
  preferencesLayerName: 'exporter_info'
  preferencesXML: null
  
  # Options
  basePath: null
  platform: null
  
  # Dialog
  dialog: null
  
  # Progress bar
  progress: null
  progressLabel: null
  
  
  # Initialize
  init: ->
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS
    
    # figure out what is available to process
    @artboardCount = @doc.artboards.length
    
    # Get the count of layers
    @layerCount = @doc.layers.length
    
    # get a count of arboards marked for export
    @artboardExportCount = @getArtboardExportCount()
    
    # Load preferences and show the dialog
    @showDialog()  if @loadPreferences()
  
  
  # Test if this artboard should be processed
  artboardTest: (name) ->
    include = false
    include = true  unless name.match(/^artboard/i) or name.match(/^\-/)
    include
  
  
  # Test if the layer needs to be turned off
  layerTest: (name) ->
    visible = false
    visible = true  unless name.match(/^specctr/) or name.match(/^exporter_info/) or name.match(/^\-/)
    visible
  
  
  # Get artboard export count
  getArtboardExportCount: ->
    exportCount = 0
    i = 0
    
    # Count the artboards that we care about
    while i < @artboardCount
      exportCount++  if @artboardTest(@doc.artboards[i].name)
      i++
    exportCount
  
  
  # Only turn on layers that need to be shown
  toggleLayers: ->
    i = 0
    
    while i < @layerCount
      @doc.layers[i].visible = @layerTest(@doc.layers[i].name)
      i++
  
  
  # Load preferences
  loadPreferences: ->
    parse = false
    
    try
      @preferencesLayer = @doc.layers.getByName(@preferencesLayerName)
    catch e
      # Build XML for preferences with defaults
      @preferencesXML= new XML('<exporter_prefs></exporter_prefs>')
      @preferencesXML.appendChild new XML('<exporter_base_path>~/Desktop</exporter_base_path>')
      @preferencesXML.appendChild new XML('<exporter_platform>android</exporter_platform>')
      
      # if the layer doesn't exist, add a new layer
      @preferencesLayer = @doc.layers.add()
      @preferencesLayer.name = @preferencesLayerName
      
      # Save XML for preferences to a new layer
      exporterInfoXML = @preferencesLayer.textFrames.add()
      exporterInfoXML.contents = @preferencesXML.toXMLString()
      
      # Hide the new layer
      @preferencesLayer.printable = false
      @preferencesLayer.visible = false
    
    unless @preferencesLayer.textFrames.length is 1
      Window.alert 'Too many text frames were found. Please delete the exporter_info layer and try again.'
    else
      try
        # Load preferences from XML
        @preferencesXML = new XML(@preferencesLayer.textFrames[0].contents)
        @basePath = @preferencesXML.exporter_base_path
        @platform = @preferencesXML.exporter_platform
        
        parse = true
      catch
        Window.alert 'Failed to load preferences. Please delete the exporter_info layer and try again.'
        
    parse
  
  
  # Return the dropdown value or type string
  parsePlatform: (value) ->
    code = null
    
    if typeof(value) == 'number' or typeof(value) == 'object number'
      if value == 0
        code = 'android'
      else if value == 1
        code = 'iOS'
      else if value == 2
        code = 'win7'
      else if value == 3
        code = 'win8'
      else if value == 4
        code = 'web'
    else
      value = value.toLowerCase()
      if value == 'android'
        code = 0
      else if value == 'ios'
        code = 1
      else if value == 'win7' or value == 'windows 7'
        code = 2
      else if value == 'win8' or value == 'windows 8'
        code = 3
      else if value == 'web'
        code = 4
    
    # return the code found for the value passed
    code
  
  
  # Show the dialog for export options
  showDialog: ->
    # Init dialog
    @dialog = new Window('dialog', 'Export Artboards')
    
    # Hide layers that don't need to be shown
    @toggleLayers()
    
    # Panel to hold options
    messagePanel = @dialog.add('panel', undefined, 'Export artboards to PNG for a platform')
    
    # Platform options
    platformGroup = messagePanel.add('group', undefined, '')
    platformGroup.oreintation = 'row'
    platformGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
    
    platformLabel = platformGroup.add('statictext', undefined, 'Select a platform')
    platformLabel.size = [100, 20]
    
    # Load the dropdown and select the correct option (based on current selection in @platform variable)
    platformList = platformGroup.add('dropdownlist', undefined, ['Android', 'iOS', 'Windows 7', 'Windows 8', 'Web'])
    if @parsePlatform(@platform)
      platformList.selection = @parsePlatform(@platform)
    else # Something is wrong in the current var, so reset var and select first option
      platformList.selection = 0
      @platform = 'android'
    
    # Target directory options
    basePathGroup = messagePanel.add('group', undefined, '')
    basePathGroup.orientation = 'row'
    basePathGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
    
    basePathLabel = basePathGroup.add('statictext', undefined, 'Output directory')
    basePathLabel.size = [100, 20]
    
    # Load current value into the field
    basePathField = basePathGroup.add('edittext', undefined, @basePath)
    basePathField.size = [300, 20]
    
    # Choose path button
    choosePathButton = basePathGroup.add('button', undefined, 'Choose...')
    choosePathButton.onClick = ->
      basePathField.text = Folder.selectDialog()
    
    # Progress bar
    @progress = messagePanel.add('progressbar', undefined, 0, 100)
    @progress.size = [400, 10]
    
    # Progress bar label
    @progressLabel = messagePanel.add('statictext', undefined, 'Will export ' + @artboardExportCount + ' of ' + @artboardCount + ' artboards')
    @progressLabel.size = [400, 20]
    
    # Panel actions
    buttonPanel = @dialog.add('group', undefined, '')
    buttonPanel.orientation = 'row'
    
    # Cancel button
    buttonPanel.cancelButton = buttonPanel.add('button', undefined, 'Cancel',
      name: 'cancel'
    )
    buttonPanel.cancelButton.onClick = ->
      @dialog.close()
    
    # Export button
    buttonPanel.exportButton = buttonPanel.add('button', undefined, 'Export',
      name: 'export'
    )
    buttonPanel.exportButton.onClick = ->
      # Update variables based on form contents
      pngExporter.basePath = basePathField.text
      pngExporter.platform = pngExporter.parsePlatform(platformList.selection.index)
      
      # Save preferences
      pngExporter.savePreferences()
      
      # Run the exporter process
      pngExporter.export()
      
      # Close the dialog
      pngExporter.dialog.close()
    
    # Show the dialog
    @dialog.show()
  
  
  # Save settings
  savePreferences: ->
    @preferencesXML.exporter_base_path = @basePath
    @preferencesXML.exporter_platform = @platform
    
    try
      @preferencesLayer.textFrames[0].contents = @preferencesXML.toXMLString()
    catch
      Window.alert 'Failed to save preferences. Please delete the exporter_info layer and try again.'
  
  
  # Process export
  export: ->
    numExported = 0
    i = 0
    baseFilename = @doc.name.match( /(.*)\.[^\.]+$/ )[1] + '_'
    
    # Assuming PNG 24 for now
    exportType = ExportType.PNG24
    
    exportOptions = new ExportOptionsPNG24()
    exportOptions.antiAliasing = true
    exportOptions.transparency = true
    exportOptions.artBoardClipping = true
    exportOptions.matte = true
    exportOptions.horizontalScale = exportOptions.verticalScale = 100
    exportOptions.saveAsHTML = false
    
    # Create directories if necessary
    folder = new Folder(@basePath)
    folder.create()  unless folder.exists
    
    if @platform == 'android'
      folder = new Folder(@basePath + '/drawable-ldpi')
      folder.create()  unless folder.exists
      
      folder = new Folder(@basePath + '/drawable-mdpi')
      folder.create()  unless folder.exists
      
      folder = new Folder(@basePath + '/drawable-hdpi')
      folder.create()  unless folder.exists
      
      folder = new Folder(@basePath + '/drawable-xhdpi')
      folder.create()  unless folder.exists
      
      folder = new Folder(@basePath + '/drawable-xxhdpi')
      folder.create()  unless folder.exists
      
      folder = new Folder(@basePath + '/drawable-xxxhdpi')
      folder.create()  unless folder.exists
    
    # Iterate through artboards for export
    while i < @artboardCount
      # Only export artboards that pass requirements
      if @artboardTest(@doc.artboards[i].name)
        # Set the current artboard active
        @doc.artboards.setActiveArtboardIndex(i)
        
        # Android export
        if @platform == 'android'
          # ldpi version
          destFile = new File(@basePath + '/drawable-ldpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 75
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # mdpi version
          destFile = new File(@basePath + '/drawable-mdpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 100
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # hdpi version
          destFile = new File(@basePath + '/drawable-hdpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 150
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # xhdpi version
          destFile = new File(@basePath + '/drawable-xhdpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 200
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # xxhdpi version
          destFile = new File(@basePath + '/drawable-xxhdpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 300
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # xxxhdpi version
          destFile = new File(@basePath + '/drawable-xxxhdpi/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 400
          @doc.exportFile(destFile, exportType, exportOptions)
        
        # iOS
        else if @platform == 'iOS'
          # standard version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 100
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # retina version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '@2x.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 200
          @doc.exportFile(destFile, exportType, exportOptions)
        
        # Windows 7
        else if @platform == 'win7'
          # standard version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 100
          @doc.exportFile(destFile, exportType, exportOptions)
        
        # Windows 8
        else if @platform == 'win8'
          # 80% version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.scale-80.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 80
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # 100% version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.scale-100.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 100
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # 140% version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.scale-140.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 140
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # 180% version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.scale-180.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 180
          @doc.exportFile(destFile, exportType, exportOptions)
        
        # Web
        else if @platform == 'web'
          # standard version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 100
          @doc.exportFile(destFile, exportType, exportOptions)
          
          # retina version
          destFile = new File(@basePath + '/' + baseFilename + @doc.artboards[i].name + '@2x.png')
          exportOptions.horizontalScale = exportOptions.verticalScale = 200
          @doc.exportFile(destFile, exportType, exportOptions)
        
        numExported++
      
        # Update the progress bar and label
        @progressLabel.text = 'Exported ' + numExported + ' of ' + @artboardExportCount
        @progress.value = numExported / @artboardExportCount * 100
        @dialog.update()
      
      # Move to next artboard
      i++
  
  
pngExporter.init()
