/*global module:false*/
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  var deployFolder = 'public/deploy/release/';
  var debugFolder = 'public/deploy/debug/';

  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: ['public/deploy/'],

    jshint: {
      options: {
        browser: true,
        curly: true,
        forin: true,
        scripturl: true,
        noempty: true,
        quotmark: 'single',
        jquery: true,
        boss: true,
        indent: 2,
        latedef: true,
        undef: true,
        devel: false,
        strict: true,
        trailing: false,
        eqeqeq: true,
        immed: true,
        funcscope: true,
        newcap: true,
        noarg: true,
        eqnull: true,
        node: true,
        globals: {
          define: true,
          require: true,
          requirejs: true,
          Backbone: true,
          _: true,
          I18n: true,
          requireNode: true,
          global: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      app: {
        src: 'public/app/**/*.js'
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: [
          'public/assets/javascript/libs/almond.js',
          'public/deploy/debug/templates.js',
          'public/deploy/debug/<%= pkg.name %>.js'
        ],
        dest: deployFolder + '<%= pkg.name %>.js',
        separator: ';'
      },
      beacon: {
        src: [
          'beacon/**/*.js'
        ],
        dest: 'public/beacon.client-build.js',
        separator: ';'
      }
    },

    sass: {
      options: {
        'debug-info': false,
        compass: true
      },
      deploy: {
        files: {
          'public/assets/css/main.css': 'public/assets/scss/main.scss'
        }
      }
    },

    cssmin: {
      deploy: {
        src: [
          'public/assets/vendor/css/normalize.css',
          'public/assets/css/main.css'
        ],
        dest: deployFolder + 'public/assets/css/main.css'
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      app: {
        files: 'public/assets/scss/**/*.scss',
        tasks: ['sass']
      },
      beacon: {
        files: 'beacon/**/*.js',
        tasks: ['concat:beacon', 'uglify:beacon']
        // TODO: Wrap
      }
    },

    jst: {
      'public/deploy/debug/templates.js': [
        'public/app/templates/**/*.html'
      ]
    },

    requirejs: {
      compile: {
        options: {
          mainConfigFile: 'public/app/config.js',
          // Output file.
          out: debugFolder + '<%= pkg.name %>.js',
          // Root application module.
          name: 'config',
          // Do not wrap everything in an IIFE.
          wrap: false,
          optimize: 'none'
        }
      }
    },

    uglify: {
      app: {
        files: {
          '<%= concat.dist.dest %>': [
            '<%= concat.dist.dest %>'
          ]
        }
      },
      beacon: {
        files: {
          'public/beacon.client-build.js': [
            'public/beacon.client-build.min.js'
          ]
        }
      }
    },

    nodemon: {
      main: {
        options: {
          file: 'server.js',
          args: ['-c', '.'],
          ignoredFiles: ['.gitignore', 'README.md', '.git/**', '.sass-cache/**', 'beacon/**', 'public/**', 'node_modules/**'],
          watchedExtensions: ['js']
        }
      }
    },

    concurrent: {
      target: {
        tasks: ['nodemon', 'watch', 'watch:beacon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, src: ['public/assets/translations/*'], dest: deployFolder},
          {expand: true, src: ['public/assets/images/*'], dest: deployFolder},
          {expand: false, src: ['public/index.html'], dest: deployFolder + 'index.html'}
        ]
      }
    }
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');


  grunt.registerTask('debug', ['jshint', 'clean', 'jst', 'requirejs']);
  grunt.registerTask('release', ['debug', 'concat', 'uglify', 'sass', 'cssmin', 'copy']);
  grunt.registerTask('default', ['concurrent:target']);

};
