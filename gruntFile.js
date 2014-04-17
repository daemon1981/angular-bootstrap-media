module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-html2js');

  // Default task.
  grunt.registerTask('default', ['build','jshint','karma:unit']);
  grunt.registerTask('build', ['clean','html2js','concat','clean:build_templates', 'copy:demo', 'copy:test']);
  grunt.registerTask('release', ['clean','html2js','concat','uglify','clean:build_templates', 'copy:demo','jshint','karma:unit']);
  grunt.registerTask('test-watch', ['karma:watch']);

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

  var karmaConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    distDir: 'dist',
    demoVendorDir: 'demo/vendor',
    testVendorDir: 'test/vendor',
    pkg: grunt.file.readJSON('package.json'),
    banner:
    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
    ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
    src: {
      js:    ['src/**/*.js'],
      jsTpl: ['<%= distDir %>/templates.js'],
      vendorTpl: ['<%= demoVendorDir %>/vendor-templates.js'],
      specs: ['test/**/*.spec.js'],
      tpl: {
        app: ['src/**/*.tpl.html'],
        vendor: ['bower_components/angular-ui-bootstrap/template/**/*.html']
      },
    },
    clean: {
      build: ['<%= distDir %>/*'],
      demo: ['<%= demoVendorDir %>/*'],
      test: ['<%= testVendorDir %>/*'],
      build_templates: ['<%= distDir %>/templates.js']
    },
    karma: {
      unit: { options: karmaConfig('karma.conf.js') },
      watch: { options: karmaConfig('karma.conf.js', { singleRun:false, autoWatch: true}) }
    },
    html2js: {
      app: {
        options: {
          base: 'src/templates'
        },
        src: ['<%= src.tpl.app %>'],
        dest: '<%= distDir %>/templates.js',
        module: 'angular.bootstrap.media.templates'
      },
      vendor: {
        options: {
          base: 'bower_components/angular-ui-bootstrap'
        },
        src: ['<%= src.tpl.vendor %>'],
        dest: '<%= demoVendorDir %>/vendor-templates.js',
        module: 'vendor-templates'
      }
    },
    concat: {
      dist: {
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distDir %>/<%= pkg.name %>.js'
      },
      demoVendorJs: {
        src:[
          'bower_components/angular/angular.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-simple-gravatar/dist/angular-simple-gravatar.js',
          '<%= src.vendorTpl %>',
          'bower_components/angular-ui-bootstrap/src/bindHtml/bindHtml.js',
          'bower_components/angular-ui-bootstrap/src/position/position.js',
          'bower_components/angular-ui-bootstrap/src/tooltip/tooltip.js'
        ],
        dest: '<%= demoVendorDir %>/lib.js'
      }
    },
    uglify: {
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest:'<%= distDir %>/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      demo: {
        files: [
          { dest: '<%= demoVendorDir %>', src : '**', expand: true, cwd: '<%= distDir %>' },
          { dest: '<%= demoVendorDir %>', src : 'bootstrap/**', expand: true, cwd: 'bower_components' },
        ]
      },
      test: {
        files: [
          { dest: '<%= testVendorDir %>', src : 'vendor-templates.js', expand: true, cwd: '<%= demoVendorDir %>' }
        ]
      }
    },
    watch:{
      all: {
        files:['<%= src.js %>', '<%= src.specs %>', '<%= src.tpl.app %>'],
        tasks:['default','timestamp']
      },
      build: {
        files:['<%= src.js %>', '<%= src.specs %>', '<%= src.tpl.app %>'],
        tasks:['build','timestamp']
      }
    },
    jshint:{
      files:['gruntFile.js', '<%= src.js %>', '<%= src.jsTpl %>', '<%= src.specs %>'],
      options:{
        curly:false,
        eqeqeq:true,
        immed:true,
        latedef:true,
        newcap:true,
        noarg:true,
        sub:true,
        boss:true,
        eqnull:true,
        globals:{}
      }
    }
  });

};
