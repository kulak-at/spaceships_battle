module.exports = function(grunt) {
    
    grunt.initConfig({
        png: grunt.file.readJSON('package.json'),
        connect: {
            dist: {
                port: 3333,
                base: '.'
            }
        },
        browserify: {
            dist: {
                files: {
                    'build/compiled.js': ['js/main.js']
                }
            }
        },
        watch: {
            dist: {
                files: ['js/*.js'],
                tasks: ['browserify:dist']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-connect');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('build', 'browserify:dist');
    grunt.registerTask('default', 'connect:dist');
    
};