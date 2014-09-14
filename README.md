Illustrator Screen Density Exporter
===================================

Export various screen densities from Illustrator for different platforms (iOS, Android, Windows 8, etc.).



Setup
=====

Install Grunt dependencies.  These may require sudo permissions.
`[sudo] npm install -g grunt-cli`
`[sudo] npm install -g grunt-init`

Install the node dependencies (from the same root directory as the `package.json` file)
`npm install`

Compile the .jsx files with `grunt compile`

Install the .jsx in your local Scripts directory for easy access.  This is found in the Illustrator install directory.  For instance, a standard OS X install might use `/Applications/Adobe Illustrator CC 2014/Presets/en_US/Scripts/`.



Usage
=====

Run the script from within Illustrator.

Only artboards with a given name will be exported ("Artboard xx" will be skipped).

Artboards or layers starting with a "-" will always be ignored / turned off.

Layers starting with "+" will be used for layer output (one artboard with multiple layers / layer groups each exported individually).



TODO list
=========

* Add exporting of multiple layers as well as artboards
* Add a simple way to install the script locally
* Add a simple way to update the script across clients (maybe leverage InVision or Dropbox)
