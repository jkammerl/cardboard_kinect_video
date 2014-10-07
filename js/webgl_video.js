WebGLVideo = function (containerEl) {
    this.scene_;
    this.camera_;
    this.renderer_;
    this.mesh_;
    this.shader_;
    this.videoEl_;
    this.videoAspect_;
    this.videoTexture_;
    this.lastFrameTimestamp_ = 0.0;
    this.animationTime_ = 0.0;

    this.config_ = new WebGLConfig(this.createScene.bind(this), this.materialUpdate.bind(this));

    if (this.initWebGL(containerEl)) {
        this.animate();
    }
}

WebGLVideo.FOCAL_LENGTH = 35;

WebGLVideo.VERTEX_SHADER = 'shaders/vertex.vsh';

WebGLVideo.FRAGMENT_SHADER = 'shaders/fragment.fsh';

WebGLVideo.prototype.initWebGL = function (containerEl) {
    if (Detector.webgl) {
        this.renderer_ = new THREE.WebGLRenderer({
            antialias: true, // to get smoother output
            preserveDrawingBuffer: true, // to allow screenshot
            doubleSided: true
        });
    } else {
        Detector.addGetWebGLMessage();
        return false;
    }
    this.renderer_.setSize(window.innerWidth, window.innerHeight);
    containerEl.appendChild(this.renderer_.domElement);

    // create a scene
    this.scene_ = new THREE.Scene();

    // put a camera in the scene
    this.camera_ = new THREE.PerspectiveCamera(WebGLVideo.FOCAL_LENGTH, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera_.position.set(0, 0, 6);
    this.scene_.add(this.camera_);

    var webrtc_init_callback = function (videoEl) {
        this.videoTexture_ = new THREE.Texture(videoEl);
        this.videoEl_ = videoEl;
        this.videoAspect_ = videoEl.height / videoEl.width;

        this.shader_ = {
            uniforms: {
                'texture': {
                    type: 't',
                    value: this.videoTexture_
                },
                'depth': {
                    type: 'f',
                    value: this.config_.depth
                }
            },
            vertexShader: this.loadShader(WebGLVideo.VERTEX_SHADER),
            fragmentShader: this.loadShader(WebGLVideo.FRAGMENT_SHADER)
        };
        this.createScene();
    };
    var webrtc_video = new WebRtcVideo(document, webrtc_init_callback.bind(this));

    var onWindowResize = function () {
        this.videoAspect_ = window.innerWidth / window.innerHeight;
        this.camera_.aspect = this.videoAspect_
        this.camera_.updateProjectionMatrix();

        this.renderer_.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize.bind(this), false);

    return true;
}

WebGLVideo.prototype.materialUpdate = function () {
    this.mesh_.material.uniforms.depth.value = this.config_.depth;
}

WebGLVideo.prototype.loadShader = function (url) {
    var shaderSrc;
    var result = jQuery.ajax(url, {
        async: false,
        success: function (data, status) {
            shaderSrc = data;
        },
        error: function (jqXHR, status, error) {
            console.error(status + " " + error);
        }
    });
    return shaderSrc;
}

WebGLVideo.prototype.createScene = function () {
    var material = new THREE.ShaderMaterial({
        uniforms: this.shader_.uniforms,
        vertexShader: this.shader_.vertexShader,
        fragmentShader: this.shader_.fragmentShader,
        side: THREE.DoubleSide,
        wireframe: this.config_.wireframe
    });

    var geom = new THREE.PlaneGeometry(3, 3 * this.videoAspect_, this.config_.vertices, this.config_.vertices);
    var newMesh = new THREE.Mesh(geom, material);

    // replace mesh if is already exists
    if (this.mesh_) {
        this.scene_.remove(this.mesh_);
    }
    this.scene_.add(newMesh);
    this.mesh_ = newMesh;
}

WebGLVideo.prototype.render = function () {
    if (this.videoTexture_ && this.videoEl_ && this.videoEl_.readyState === this.videoEl_.HAVE_ENOUGH_DATA) {
        this.videoTexture_.needsUpdate = true;
    }
    // actually render the scene
    this.renderer_.render(this.scene_, this.camera_);
}

WebGLVideo.prototype.animate = function () {
    if (this.mesh_) {
        var time_passed = Date.now() - this.lastFrameTimestamp_;
        this.lastFrameTimestamp_ = Date.now();
        this.animationTime_ += time_passed * this.config_.speed * 0.0005;

        var pi_timer = this.animationTime_ % (Math.PI);
        var y_rot = Math.abs(Math.pow(Math.sin(pi_timer), 3.0)) * Math.PI;
        if (pi_timer > Math.PI / 2) {
            y_rot = 2.0 * Math.PI - y_rot;
        }
        this.mesh_.rotation.y = y_rot;
    }

    this.render();

    var boundAnimate = this.animate.bind(this);
    requestAnimationFrame(boundAnimate);
}