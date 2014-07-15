module.exports = function(grunt) {
    
    grunt.initConfig({
        png: grunt.file.readJSON('package.json'),
        connect: {
            dist: {
                port: 3333,
                base: '.'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-connect');
    grunt.registerTask('default', 'connect:dist');
    
};