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
  grunt.registerTask('build', ['clean','html2js','concat','clean:build_templates', 'copy:demo']);
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
    distdir: 'dist',
    demodirlib: 'demo-lib',
    pkg: grunt.file.readJSON('package.json'),
    banner:
    '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
    ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
    src: {
      js:    ['src/**/*.js'],
      jsTpl: ['<%= distdir %>/templates.js'],
      vendorTpl: ['<%= demodirlib %>/vendor-templates.js'],
      specs: ['test/**/*.spec.js'],
      tpl: {
        app: ['src/**/*.tpl.html'],
        vendor: ['bower_components/angular-ui-bootstrap/template/**/*.html']
      },
    },
    clean: {
      build: ['<%= distdir %>/*'],
      vendorBuild: ['<%= demodirlib %>/*'],
      build_templates: ['<%= distdir %>/templates.js']
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
        dest: '<%= distdir %>/templates.js',
        module: 'angular.bootstrap.media.templates'
      },
      vendor: {
        options: {
          base: 'bower_components/angular-ui-bootstrap'
        },
        src: ['<%= src.tpl.vendor %>'],
        dest: '<%= demodirlib %>/vendor-templates.js',
        module: 'vendor-templates'
      }
    },
    concat: {
      dist: {
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.js'
      },
      vendor: {
        src:[
          'bower_components/jquery/dist/jquery.js',
          'bower_components/bootstrap/dist/js/bootstrap.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-simple-gravatar/dist/angular-simple-gravatar.js',
          '<%= src.vendorTpl %>',
          'bower_components/angular-ui-bootstrap/src/bindHtml/bindHtml.js',
          'bower_components/angular-ui-bootstrap/src/position/position.js',
          'bower_components/angular-ui-bootstrap/src/tooltip/tooltip.js',
        ],
        dest: '<%= demodirlib %>/lib.js'
      },
    },
    uglify: {
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      demo: {
        files: [
          { dest: '<%= demodirlib %>', src : '**', expand: true, cwd: '<%= distdir %>' }
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
