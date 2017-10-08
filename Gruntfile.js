require('load-grunt-tasks'); // npm install --save-dev load-grunt-tasks

module.exports = function (grunt) {
    //Collect all of our node modules
    var modules = []
    var package = require('./package.json')
    if (!!package.dependencies) {
        modules = Object.keys(package.dependencies)
            .filter(function (m) {
                return m != 'nodewebkit'
            })
            .map(function (m) {
                return './node_modules/' + m + '/**/*'
            });
    }
    //Grunt Config
    grunt.initConfig({
        shell: {
            start: {
                command: 'npm start'
            }
        },
        bower: {
          dev: {
            dest: 'app/',
            js_dest: 'app/js/_vendor/',
            css_dest: 'app/css/_vendor/',
            fonts_dest: 'app/fonts/',
            options: {
              expand: true,
              keepExpandedHierarchy: false,
              packageSpecific: {
                'bootstrap': {
                  keepExpandedHierarchy: false,
                  stripGlobBase: true,
                  files: [
                    'dist/css/bootstrap.css',
                    'dist/js/bootstrap.min.js',
                    'themes/base/minified/**'
                  ]
                },
                'font-awesome': {
                  expand: false,
                  css_dest: 'app/css/',
                  keepExpandedHierarchy: false,
                  stripGlobBase: true,
                  files: [
                    'css/font-awesome.min.css',
                    'fonts/*'
                  ]
                }
              }
            }
          }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: [{
                    expand: true,
                    cwd: 'app/scss',
                    src: ['*.scss'],
                    dest: 'app/css',
                    ext: '.css'
                }]
            }
        },
        watch: {
            css: {
              files: ['app/scss/**/*.scss'],
              tasks: ['sass'],
            }
        },
        nwjs: {
            options: {
                cacheDir: './build/cache',
                macIcns: './app-icon.icns',
                winIco: './app-icon.ico',
                version: '0.25.1',
                flavor: 'normal',
                buildDir: './builds', // Where the build version your app is saved
            },
            src: ['./package.json', './app/**/*', '!./app/scss/**/**'].concat(modules) // Your NW.js app
        }
    });

    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower');

    grunt.registerTask('run', ['sass','shell']);
    grunt.registerTask('default', ['sass','shell']);
    grunt.registerTask('bowerc', ['bower','sass']);
    grunt.registerTask('build', 'Custom build task.', function (platform) {
        var platforms = [];
        // If no platform where specified, determine current platform
        if (arguments.length === 0) {
            if (process.platform === 'darwin') platforms.push('osx64')
            else if (process.platform === 'win32') platforms.push('win')
            else if (process.arch === 'ia32') platforms.push('linux32')
            else if (process.arch === 'x64') platforms.push('linux64')

        } else {
            if (platform === 'win') platforms.push('win')
            if (platform === 'mac') platforms.push('osx64')
            if (platform === 'linux32') platforms.push('linux32')
            if (platform === 'linux34') platforms.push('linux64')

            // Build for All platforms
            if (platform === 'all') platforms = ['win', 'osx64', 'linux32', 'linux64']

        }


        if (platforms) {
            grunt.config('nwjs.options.platforms', platforms);
        }

        grunt.task.run(['sass']);
        grunt.task.run(['nwjs']);

    });
};