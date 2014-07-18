

var allActionProps = {
    frames: [1],
    frameItv: null,
    xShift: 0,
    yShift: 0,
    moveItv: 0,
    loop: false,
    duration: null,
    bound: false,
    minDuration: 5,
    maxDuration: 40,
    notAfter: null,
    onlyAfter: null,
    nextAction: null,
    probability: null,
    onStep: function() {},
    onStop: function() {},
    onEnd: function() {},
    isPossible: function(sheep) {},
    beforeStart: function(){}
};


var Action = function Action(sheep) {

    var self    = this;
    self._sheep = sheep;
    self._sheep.on("tick", self.onTick, self);

    self._observable    = new MetaphorJs.lib.Observable;
    extend(self, self._observable.getApi());

    sheep.on("init", function() {
        sheep.getPosition().on("bounding", self.onBounding, self);
    });
};

extend(Action.prototype, {

    _id: null,
    _sheep: null,
    _observable: null,
    _currentFrame: -1,
    _startTime: null,
    _lastTime: null,
    _timeout: null,

    setup: function(props, id) {
        var self = this;
        extend(self, allActionProps);
        extend(self, props);
        self._id = id;
    },

    run: function() {
        var self    = this;
        self._currentFrame = -1;
        self._startTime = (new Date).getTime();
        self._lastTime = self._startTime;

        if (self.frameItv) {
            self._timeout = self.frameItv;
        }

        self.beforeStart();
        self.step(self._startTime);
        self.trigger("run", self);

        if (self.loop && !self.duration) {
            self.duration = getRandomInt(self.minDuration, self.maxDuration) * 1000;
        }
    },

    stop: function() {

        var self    = this;

        if (self._timeout) {
            self._timeout = null;
            self.onStop();
            self.trigger("stop", self);
        }
    },

    end: function() {
        var self = this;
        self.stop();
        self.onEnd();
        self.trigger("end", self);
    },

    onEnd: function() {},


    onTick: function(tickTime) {

        var self    = this;

        if (self._timeout && self._lastTime && tickTime - self._lastTime > self._timeout) {
            self._lastTime = tickTime;
            self.step(tickTime);
        }
    },

    step: function(tickTime) {

        var self    = this,
            l       = self.frames.length,
            curr    = self._currentFrame,
            frame;

        if (self.duration && tickTime - self._startTime > self.duration) {
            self.end();
            return;
        }

        curr++;
        if (curr == l) {
            if (self.loop) {
                curr = 0;
            }
            else {
                self.end();
                return;
            }
        }

        self._currentFrame = curr;
        frame = self.frames[curr];

        if (typeof frame == "number") {
            self._timeout = self.frameItv;
            self._sheep.setFrame(self.frames[curr]);
        }
        else {
            if (frame.frameItv) {
                self.frameItv = frame.frameItv;
            }
            self._timeout = frame.duration || self.frameItv;
            self._sheep.setFrame(frame.frame);

            if (frame.action) {
                frame.action.call(self);
            }
        }

        self.onStep(curr, frame);
        self.trigger("step", self, frame);
    },

    onBounding: function() {
        var self = this;
        if (self.bound) {
            self.end();
        }
    }

});
