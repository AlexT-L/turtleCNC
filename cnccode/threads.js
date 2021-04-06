
Process.prototype.proxy = 'https://turtlestitch.org:8080';

Process.prototype.reportMouseX = function () {
    var stage, world;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            world = stage.world();
            if (world) {
                 return (
                   (world.hand.position().x - stage.center().x)
                     / stage.camera.zoomFactor
                     / stage.scale
                     * 2
                     + stage.controls.center.x
               );
            }
        }
    }
    return 0;
};

Process.prototype.reportMouseY = function () {
    var stage, world;
    if (this.homeContext.receiver) {
        stage = this.homeContext.receiver.parentThatIsA(StageMorph);
        if (stage) {
            world = stage.world();
            if (world) {
                return (
                  (stage.center().y - world.hand.position().y)
                   / stage.camera.zoomFactor
                   / stage.scale
                   * 2
                   + stage.controls.center.y
                 );
            }
        }
    }
    return 0;
};

Process.prototype.zoomToFit = function() {
	stage = this.homeContext.receiver.parentThatIsA(StageMorph);
	if (stage) {
		stage.camera.fitScene();
	}
}

Process.prototype.reportPi = function (min, max) {
    return Math.PI;
};

Process.prototype.reportProxiedURL = function (url) {
    return this.reportURL(this.proxy + '/' + url);
};
