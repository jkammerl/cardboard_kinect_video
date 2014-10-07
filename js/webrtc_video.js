WebRtcVideo = function (containerEl, callback) {
    this.videoEl_ = this.createVideoElement(containerEl);
    this.initWebRtcVideo(callback);
}

WebRtcVideo.VIDEO_WIDTH = 640;

WebRtcVideo.VIDEO_HEIGHT = 480;

WebRtcVideo.prototype.createVideoElement = function (containerEl) {
    var video = containerEl.createElement('video');
    video.width = WebRtcVideo.VIDEO_WIDTH;
    video.height = WebRtcVideo.VIDEO_HEIGHT;
    video.autoplay = true;
    return video;
}

WebRtcVideo.prototype.initWebRtcVideo = function (callback) {
    navigator.getUserMedia = navigator.getUserMedia || 
                             navigator.webkitGetUserMedia || 
                             navigator.mozGetUserMedia || 
                             navigator.msGetUserMedia;
    var initSuccessCallback = function (stream) {
        if (this.videoEl_.mozSrcObject !== undefined) {
            this.videoEl_.mozSrcObject = stream;
        } else {
            this.videoEl_.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        this.videoEl_.play();

        callback(this.videoEl_);
    }

    function initErrorCallback(error) {
        console.error('An error occurred during WebRTC initialization.');
        if (error) {
            console.error(error);
        }
    }

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true
        }, initSuccessCallback.bind(this), initErrorCallback.bind());
    } else {
        alert('Native web camera streaming (getUserMedia) not supported in this browser.');
    }
}