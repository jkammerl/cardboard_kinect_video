WebGLVideo = function (containerEl) {
    this.scene_;
    this.camera_;
    this.controls_;

    this.renderer_;
    this.effect_;
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

WebGLVideo.ENABLE_CARDBOARD = true;

WebGLVideo.MESH_SCALE = 100.0;

WebGLVideo.CAMERA_DISTANCE = 30.0;

WebGLVideo.BORDER_CUT = 0.02;

WebGLVideo.FOCAL_LENGTH = 605;

WebGLVideo.VIDEO_DIMENSIONS = 512;

WebGLVideo.VERTEX_SHADER = 'shaders/vertex.vsh';

WebGLVideo.FRAGMENT_SHADER = 'shaders/fragment.fsh';

WebGLVideo.prototype.initWebGL = function (containerEl) {
    if (Detector.webgl) {
        this.renderer_ = new THREE.WebGLRenderer({
            antialias: true, // to get smoother output
            preserveDrawingBuffer: true, // to allow screenshot
            doubleSided: true,
            cullFace: "front_and_back"
        });

        if (WebGLVideo.ENABLE_CARDBOARD) {
            this.effect_ = new THREE.StereoEffect(this.renderer_); 
        }

    } else {
        Detector.addGetWebGLMessage();
        return false;
    }
    this.renderer_.setSize(window.innerWidth, window.innerHeight);
    containerEl.appendChild(this.renderer_.domElement);

    // create a scene
    this.scene_ = new THREE.Scene();

    // put a camera in the scene
    this.camera_ = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.00001, 1000);
    this.camera_.position.set(0.0, 0.0, -1.0 * WebGLVideo.CAMERA_DISTANCE);
    this.camera_.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    this.scene_.add(this.camera_);

    this.videoEl_ = document.createElement( 'video' );
    this.videoEl_.loop = true;
    this.videoEl_.width = WebGLVideo.VIDEO_DIMENSIONS;
    this.videoEl_.height = WebGLVideo.VIDEO_DIMENSIONS; 
    this.videoEl_.src = 'video/kinect_small.webm';
    this.videoEl_.crossOrigin = 'Anonymous';
    this.videoEl_.setAttribute('crossorigin', 'Anonymous');
    this.videoEl_.play();

    this.videoTexture_ = new THREE.Texture(this.videoEl_);
    this.videoTexture_.needsUpdate = true;

    this.videoAspect_ = this.videoEl_.height / this.videoEl_.width;

    this.shader_ = {
        uniforms: {
            'texture': {
                type: 't',
                value: this.videoTexture_
            },
            'depth': {
                type: 'f',
                value: this.config_.depth
            },
            'offset': {
                type: 'f',
                value: this.config_.offset/100.0
            },
            'resolution' : {
              type : 'f',
              value : 1.0/this.videoEl_.width
            },         
            'border_cut' : {
              type : 'f',
              value : WebGLVideo.BORDER_CUT
            },
            'focallength' : {
              type : 'f',
              value : (1000.0/WebGLVideo.FOCAL_LENGTH)
            }
        },
        vertexShader: this.loadShader(WebGLVideo.VERTEX_SHADER),
        fragmentShader: this.loadShader(WebGLVideo.FRAGMENT_SHADER)
    };
    this.createScene();

    var that = this;
    var onWindowResize = function () {
        that.camera_.aspect = window.innerWidth / window.innerHeight;
        that.camera_.updateProjectionMatrix();

        that.renderer_.setSize(window.innerWidth, window.innerHeight);
        if (that.effect_) {
           that.effect_.setSize(window.innerWidth, window.innerHeight);
        }
    };

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    function fullscreen() {
      if (containerEl.requestFullscreen) {
        containerEl.requestFullscreen();
      } else if (containerEl.msRequestFullscreen) {
        containerEl.msRequestFullscreen();
      } else if (containerEl.mozRequestFullScreen) {
        containerEl.mozRequestFullScreen();
      } else if (containerEl.webkitRequestFullscreen) {
        containerEl.webkitRequestFullscreen();
      }
    }
    container.addEventListener('click', fullscreen, false);

    return true;
}

WebGLVideo.prototype.materialUpdate = function () {
    this.mesh_.material.uniforms.depth.value = this.config_.depth;
    this.mesh_.material.uniforms.offset.value = this.config_.offset/100.0;
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
        wireframe: this.config_.wireframe,
        transparent: true
    });

    var geom = new THREE.PlaneGeometry(3, 3 * this.videoAspect_, this.config_.vertices, this.config_.vertices);
    var newMesh = new THREE.Mesh(geom, material);
    newMesh.scale.set( WebGLVideo.MESH_SCALE, WebGLVideo.MESH_SCALE, WebGLVideo.MESH_SCALE );

    // replace mesh if is already exists
    if (this.mesh_) {
        this.scene_.remove(this.mesh_);
    }
    this.scene_.add(newMesh);
    this.mesh_ = newMesh;

}

WebGLVideo.prototype.render = function () {
    // actually render the scene
    if (WebGLVideo.ENABLE_CARDBOARD) {
        this.effect_.render(this.scene_, this.camera_);
    } else {
        this.renderer_.render(this.scene_, this.camera_);
    }
    
}

WebGLVideo.prototype.animate = function () {
    if (this.mesh_ && this.videoTexture_ && 
        this.videoEl_ && this.videoEl_.readyState === this.videoEl_.HAVE_ENOUGH_DATA) {
        this.videoTexture_.needsUpdate = true;
    }

    this.render();

    requestAnimationFrame(this.animate.bind(this));
}