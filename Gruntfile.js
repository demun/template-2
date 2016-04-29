module.exports = function (grunt) {

    'use strict';

    // 작업시간 표시
    require('time-grunt')(grunt);

    // 자동으로 grunt 태스크를 로드합니다. grunt.loadNpmTasks 를 생략한다.
    require('jit-grunt')(grunt);

    var config = {
        src: 'SourceCode',
        dest: 'FinishCode',
        bower: 'bower_components'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        jade: {
            dist: {
                options: {
                    client: false,
                    pretty: true
                },
                files: [
                    {
                        expand: true,                           // 동적 기술법을 활성화.
                        cwd   : '<%= config.src %>/jade/docs/', // Src 패턴의 기준 폴더.
                        src   : ['**/*.jade'],                  // 비교에 사용할 패턴 목록.
                        dest  : '<%= config.dest %>',           // 목적 경로의 접두사(사실상 폴더명)
                        ext   : '.html',                        // dest의 파일들의 확장자.
                    },
                ],
            },
        },
        
        // html 구문검사를 합니다.
        htmlhint: {
            options: {
                htmlhintrc: 'grunt/.htmlhintrc'
            },
            dist: [
                '<%= config.dest %>/**/*.html',
            ]
        },

        sass: {
            options: {
                sourceComments: false,
                sourceMap: true,
                outputStyle: 'expanded' // nested, expanded, compact, compressed
            },
            dist: {
                expand: true,
                cwd: '<%= config.src %>/scss/',
                src: ['**/*.{sass,scss}'],
                dest: '<%= config.dest %>/css/',
                ext: '.css'
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        browsers: [
                            'Android 2.3',
                            'Android >= 4',
                            'Chrome >= 20',
                            'Firefox >= 24',
                            'Explorer >= 8',
                            'iOS >= 6',
                            'Opera >= 12',
                            'Safari >= 6'
                        ]
                    })
                ]
            },
            dist: {
                src: '<%= config.dest %>/css/*.css',
            }
        },
        
        // css 의 속성을 정렬해줍니다.
        csscomb: {
            options: {
                config: 'grunt/.csscomb.json'
            },
            dist: {
                expand: true,
                cwd: '<%= config.dest %>/css/',
                src: ['*.css', '!*.min.css'],
                dest: '<%= config.dest %>/css/'
            }
        },
        // css 를 압축합니다.
        cssmin: {
            options: {
                // noAdvanced: true
                compatibility: 'ie9',
                keepSpecialComments: '*',
                sourceMap: true,
                advanced: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dest %>/css',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= config.dest %>/css',
                    ext: '.min.css'
                }]
            }
        },

        // 자바스크립트 구문검사를 합니다.
        jshint: {
            options: {
                jshintrc: 'grunt/.jshintrc',
                // force: true, // error 검출시 task를 fail 시키지 않고 계속 진단
                reporter: require('jshint-stylish') // output을 수정 할 수 있는 옵션
            },
            grunt: {
                src: ['Gruntfile.js']
            },
            dist: {
                src: '<%= config.src %>/js/site/*.js'
            }
        },

        concat: {
            options: {
                // separator: ';',
                stripBanners: false,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },

            jquery: {
                src: [
                    '<%= config.bower %>/jquery/dist/jquery.js',
                    '<%= config.bower %>/jquery-migrate/jquery-migrate.js',
                ],
                dest: '<%= config.dest %>/js/jquery.js'
            },
            plugins: {
                src: [
                    '<%= config.bower %>/bootstrap/dist/js/bootstrap.min.js',
                    '<%= config.bower %>/jquery-ui/jquery-ui.min.js',
                ],
                dest: '<%= config.dest %>/js/plugins.js'
            },
            site: {
                src: '<%= config.src %>/js/site/*.js',
                dest: '<%= config.dest %>/js/site.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            
            jquery: {
                src: '<%= concat.jquery.dest %>',
                dest: '<%= config.dest %>/js/jquery.min.js'
            },
            plugins: {
                src: '<%= concat.plugins.dest %>',
                dest: '<%= config.dest %>/js/plugins.min.js'
            },
            site: {
                src: '<%= concat.site.dest %>',
                dest: '<%= config.dest %>/js/site.min.js'
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.src %>/images/',
                    src: '**/*.{png,jpeg,jpg,gif}',
                    dest: '<%= config.dest %>/images/'
                }]
            }
        },
        clean: {
            dist: {
                files: [{
                    // dot: true,
                    // nonull: true,
                    src: [
                        '<%= config.dest %>'
                    ]
                }]
            },
        },
        copy: {
            dist: {
                files: [ 
                    // fonts
                    {
                        expand: true,
                        cwd: '<%= config.src %>/fonts/',
                        src: '**',
                        dest: '<%= config.dest %>/fonts/'
                    },
                    // bootstrap fonts
                    {
                        expand: true,
                        cwd: '<%= config.bower %>/bootstrap/dist/fonts/',
                        src: '**',
                        dest: '<%= config.dest %>/fonts/'
                    },
                    // bootstrap css
                    {
                        expand: true,
                        cwd: '<%= config.bower %>/bootstrap/dist/css/',
                        src: 'bootstrap.min.css',
                        dest: '<%= config.dest %>/css/'
                    },
                ]
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dist: [
                'copy',
                'imagemin'
            ]
        },

        watch: {
            options: { livereload: true },
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['jshint:grunt'],
            },
            jade: {
                files: ['<%= config.src %>/jade/**/*.jade'],
                tasks: ['jade','htmlhint'],
            },
            sass: {
                files: ['<%= config.src %>/scss/**/*.{sass,scss}'],
                tasks: ['sass','postcss','csscomb','cssmin'],
            },
            jsnt: {
                files: ['<%= config.src %>/js/**/*.js'],
                tasks: ['jshint','concat','uglify'],
            },
            img: {
                files: ['<%= config.src %>/images/**/*.{gif,jpeg,jpg,png}'],
                tasks: ['newer:imagemin'],
            },
            // fonts: {
            //     files: ['<%= config.src %>/fonts/**/*'],
            //     tasks: ['newer:copy'],
            // }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    livereload: 35729,
                    // keepalive: true,
                    base: '<%= config.dest %>',
                    open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/index.html'
                }
            }
        },


    });

    // 작업을 로드합니다.
    // grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('serve', function (target) {
      if (target === 'dist') {
          return grunt.task.run(['connect', 'watch']);
      }

      grunt.task.run([
        'default',
        'connect',
        'watch'
      ]);

    });

    // html task
    grunt.registerTask('html', [
            'jade',
            'htmlhint'
        ]
    );

    // css task
    grunt.registerTask('css', [
            // 'clean',
            'sass',
            'postcss',
            // 'csslint',
            'csscomb',
            'cssmin'
        ]
    );

    // javascript task
    grunt.registerTask('jsnt', [
            'jshint',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('default', [
        'clean',
        'html',
        'css',
        'jsnt',
        'concurrent',
    ]);


};
