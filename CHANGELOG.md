HEAD
====

* 


0.3.1 (2014-06-19)
------------------

* Correct a bug in toggleLayers function that would throw an "i not defined" error in new versions of Illustrator


0.3.0 (2014-04-14)
------------------

* Automatically turn off / on layers appropriately.  Layers starting with '-' are excluded.  Specctr and exporter_info are always excluded.
* Added pseudonym 'compile' to run a complete compile
* Added grunt tasks to manage update processes to remove current bash script


0.2.0 (2014-01-12)
------------------

* Automatically create directories when necessary for export (i.e., Android)
* Removed individual grunt tasks. This means the entire directory needs to be parsed with every commit, but decouples the grunt tasks from specific directories. Ultimately, this makes the directory structure much more flexible.


0.1.0 (2013-12-23)
------------------

* Ability to export across all platforms
* Fix XAML clean action order.
* Add reset task to clean out the target directory before updating (forces delete of old items)
* Fix rsycn task
