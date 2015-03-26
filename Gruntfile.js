'use strict';

module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
		dist: {
			src: ['index.html']
		}
	},
	markdown: {
		readme: {
			files: {
				'index.html': ['README.md']
			}
		}
	}
});

grunt.registerTask('default', [
	'clean',
	'markdown'
]);

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-markdown');
};