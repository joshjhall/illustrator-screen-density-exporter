module.exports = function (grunt) {
  /*
    Grunt Installation:
    -------------------
    [sudo] npm install -g grunt-cli
    [sudo] npm install -g grunt-init
    
    Project Dependencies:
    ---------------------
    grunt-contrib-coffee
    grunt-shell
    
    Simple Dependency Install:
    --------------------------
    npm install (from the same root directory as the `package.json` file)
  */
  
  // our Grunt task settings
  grunt.initConfig({
    // Store your Package file so you can reference its specific data whenever necessary
    pkg: grunt.file.readJSON('package.json'),
    
    // Coffee script source and target directories
    coffeeSource: 'source/',
    coffeeTarget: 'build/',
    
    
    // Shell functions
    shell: {
      pluginPerms: {
        command: 'chmod 775 <%= coffeeTarget %>*.jsx'
      }
    },
    
    // Coffee tasks
    coffee: {
      compile: {
        expand: true,
        flatten: true,
        cwd: '<%= coffeeSource %>',
        src: ['*.coffee'],
        dest: '<%= coffeeTarget %>',
        ext: '.jsx'
      }
    }
  });
  
  // Load NPM Tasks
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  
  // Compile plugins task
  grunt.registerTask('build', ['coffee:compile', 'shell:pluginPerms']);
  
};
