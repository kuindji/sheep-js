

var Position = function Position(sheep, floors) {

    var self    = this;

    self.sheep  = sheep;

    self.floors         = document.querySelectorAll(floors);
    self.stepDelegate   = bind(self.step, self);
    self.resizeDelegate = bind(self.onWindowResize, self);
    self.scrollDelegate = bind(self.onScroll, self);

    self._observable    = new MetaphorJs.lib.Observable;
    extend(self, self._observable.getApi());

    var action = self.sheep.getAction();

    sheep.on("tick", self.onTick, self);

    action.on("run", self.onActionRun, self);
    action.on("stop", self.onActionStop, self);
    action.on("step", self.onActionStep, self);

    addListener(window, "resize", self.resizeDelegate);
    addListener(window, "scroll", self.scrollDelegate);
};

extend(Position.prototype, {

    stepTimeout: null,
    lastStepTime: null,

    animationTimeout: null,
    lastAnimTime: null,

    resumeTmt: null,


    floors: null,
    sheep: null,
    x: 0,
    y: 0,
    floor: null,
    floorY: 0,
    bounding: {
        left: 0,
        right: 0
    },

    setFloor: function(el) {
        var self    = this;
        self.floor  = el;

        if (el) {
            self.bounding = getClientRect(el);
            self.floorY = self.bounding.floor;
        }
    },

    getFloor: function() {
        return this.floor;
    },

    onTick: function(tickTime) {

        var self = this;

        if (self.stepTimeout && self.lastStepTime &&
            tickTime - self.lastStepTime > self.stepTimeout) {

            self.lastStepTime = tickTime;
            self.step();
        }

        if (self.animationTimeout && self.lastAnimTime &&
            tickTime - self.lastAnimTime > self.animationTimeout) {

            self.lastAnimTime = tickTime;
            self.animationStep(tickTime);
        }
    },

    step: function() {

        var self    = this,
            action  = self.sheep.getAction(),
            dir     = self.sheep.getDirection(),
            xShift  = action.xShift,
            yShift  = action.yShift,
            bounding    = false;

        if (dir == "l") {
            xShift  *= -1;
        }

        self.x      = self.x + xShift;

        self.updatePosition();

        if (self.isOnBounding()) {
            if (dir == "l") {
                self.x = self.bounding.left;
            }
            else {
                self.x = self.bounding.right - SIZE;
            }
            self.updatePosition();
            self.stop();
            self.trigger("bounding");
        }
    },

    isOnBounding: function(edge) {
        var self    = this,
            dir     = edge || self.sheep.getDirection();

        if (dir == "l" && self.x <= self.bounding.left) {
            return true;
        }
        else if (dir == "r" && self.x + SIZE >= self.bounding.right) {
            return true;
        }
        return false;
    },

    set: function(x, y) {
        var self = this;
        self.x = x;
        self.y = y;
        self.updatePosition();
    },

    addX: function(value) {
        this.x += value;
        this.updatePosition();
    },

    addY: function(value) {
        this.y += value;
        this.updatePosition();
    },

    getX: function() {
        return this.x;
    },

    getY: function() {
        return this.y;
    },

    updatePosition: function() {
        var self    = this,
            el      = self.sheep.getElem(),
            style   = el.style;

        style.left  = self.x + 'px';
        style.top   = self.y + 'px';
    },

    onActionRun: function(action) {

        var self    = this;

        if (action.moveItv) {
            self.lastStepTime = (new Date).getTime();
            self.stepTimeout = action.moveItv;
        }
    },

    onActionStop: function() {
        this.stop();
    },

    onActionStep: function(action, frame) {

        if (typeof frame != "number") {
            if (frame.moveItv) {
                action.xShift = frame.xShift;
                action.yShift = frame.yShift;
                action.moveItv = frame.moveItv;
                this.onActionRun(action);
            }
            if (frame.stopMoving) {
                this.stop();
            }
        }
    },

    stop: function() {
        this.stepTimeout = null;
        this.lastStepTime = null;
    },


    animateTo: function(toX, toY, duration, easing, cb, scope) {

        var self    = this,
            start   = (new Date).getTime(),
            startX  = self.x,
            startY  = self.y,
            xLen    = toX - startX,
            yLen    = toY - startY,
            xEasing,
            yEasing;

        if (!easing) {
            xEasing = yEasing = easings.linear;
        }
        else {
            if (isArray(easing)) {
                xEasing = easing[0];
                yEasing = easing[1];
            }
            else {
                xEasing = yEasing = easing;
            }
        }

        self.lastAnimTime = start;
        self.animationTimeout = 40;

        self.animationStep    = function(tickTime) {

            var time = tickTime - start;

            if (time > duration) {
                time = duration;
            }

            self.x  = startX + xEasing(time, 0, xLen, duration);
            self.y  = startY + yEasing(time, 0, yLen, duration);

            if (self.sheep.getAction().bound) {
                if (self.x < self.bounding.left) {
                    self.x = self.bounding.left;
                }
                if (self.x > self.bounding.right - SIZE) {
                    self.x = self.bounding.right - SIZE;
                }
            }

            self.updatePosition();

            if (time == duration) {
                if (cb) {
                    cb.call(scope || self.sheep);
                }
                if (self.onAnimationComplete) {
                    self.onAnimationComplete();
                    self.onAnimationComplete = null;
                }
                self.stopAnimation();
            }
        };
    },

    stopAnimation: function() {
        this.animationTimeout = null;
    },


    onWindowResize: function() {
        this.adjustToWindow();
    },

    onScroll: function() {
        this.adjustToWindow();
    },

    adjustToWindow: function() {
        var self    = this,
            rect    = getClientRect(window);

        if (self.resumeTmt) {
            window.clearTimeout(self.resumeTmt);
        }

        if (self.y + SIZE > rect.floor) {

            self.setFloor(window);

            self.stopAnimation();
            self.sheep.stop();
            self.sheep.setFrame(23);

            self.floorY = rect.floor;
            self.y = self.floorY - SIZE;
            self.updatePosition();

            self.resumeTmt = window.setTimeout(function(){
                self.sheep.start();
            }, 2000);
        }
        else if (self.y + SIZE < rect.floor && self.floor === window) {
            self.setFloor(window);
            self.sheep.stop();
            self.sheep.setFrame(47);
            self.floorY = rect.floor;
            self.animateTo(self.x, self.floorY - SIZE, 1000, easings.easeInQuad);
            self.onAnimationComplete = function() {
                self.sheep.setFrame(85);
                self.resumeTmt = window.setTimeout(function(){
                    self.sheep.start();
                }, 2000);
            };
        }
        else {
            if (!self.sheep.auto) {
                self.resumeTmt = window.setTimeout(function(){
                    self.sheep.start();
                }, 1000);
            }
        }
    },


    findUpperFloor: function() {
        return this.findFloor("upper", null);
    },

    findLowerFloor: function() {
        return this.findFloor("lower", window);
    },

    findFloor: function(which, def) {

        var self    = this,
            fls     = self.floors,
            i, len,
            rect,
            f,
            found   = [];

        for (i = 0, len = fls.length; i < len; i++) {

            f = fls[i];

            if (f === self.floor || f === window || !isReachable(f)) {
                continue;
            }

            rect = getClientRect(f);

            if (which == "upper" && rect.floor >= self.floorY) {
                continue;
            }

            if (which == "lower" && rect.floor <= self.floorY) {
                continue;
            }

            found.push(f);
        }

        if (found.length) {
            if (def) {
                found.push(def);
            }
            return found.length > 1 ? found[getRandomInt(0, found.length)] : found[0];
        }
        else {
            return def;
        }
    },


    findFloorBeneath: function() {

        var self    = this,
            fls     = self.floors,
            x       = self.x,
            y       = self.y,
            i, len,
            rect,
            f;

        for (i = 0, len = fls.length; i < len; i++) {

            f = fls[i];

            if (f === self.floor || f === window || !isReachable(f)) {
                continue;
            }

            rect = getClientRect(f);

            if (rect.floor <= y + SIZE) {
                continue;
            }

            if (rect.left < x && rect.right > x) {
                return f;
            }
        }

        return window;
    }

});