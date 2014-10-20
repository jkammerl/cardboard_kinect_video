WebGLConfig = function (meshUpdateCallback, materialUpdateCallback) {
    this.wireframe = WebGLConfig.INIT_WIREFRAME;
    this.vertices = WebGLConfig.INIT_VERTICES;
    this.depth = WebGLConfig.INIT_DEPTH;
    this.offset = WebGLConfig.INIT_OFFSET;

    this.createGUI(meshUpdateCallback, materialUpdateCallback);
}

// Configuration
WebGLConfig.INIT_WIREFRAME = false;

WebGLConfig.INIT_VERTICES = 256;

WebGLConfig.MAX_VERTICES = 256;

WebGLConfig.INIT_DEPTH = 1.2;

WebGLConfig.MAX_DEPTH = 5.0;

WebGLConfig.INIT_OFFSET = -50.0;

WebGLConfig.MIN_OFFSET = -200.0;

WebGLConfig.MAX_OFFSET = 200.0;

WebGLConfig.GUI_WIDTH = 300;

WebGLConfig.prototype.createGUI = function (meshUpdateCallback, materialUpdateCallback) {
    var gui = new dat.GUI();
    gui.width = WebGLConfig.GUI_WIDTH;
    gui.close();

    var configGui = gui.addFolder("Config");

    configGui.add(this, "depth").min(0.0).max(WebGLConfig.MAX_DEPTH).step(0.1).onChange(materialUpdateCallback);
    configGui.add(this, "vertices").min(1).max(WebGLConfig.MAX_VERTICES).step(1).onChange(meshUpdateCallback);
    configGui.add(this, "offset").min(WebGLConfig.MIN_OFFSET).max(WebGLConfig.MAX_OFFSET).step(1).onChange(materialUpdateCallback);
    configGui.add(this, "wireframe").onChange(meshUpdateCallback);

    configGui.open();
}
