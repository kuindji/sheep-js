
var actionIds = [];

// we don't need real class inheritance here
// simple extend() will be sufficient.

var actions = {

    meteor: {
        frames: [134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, {
            frame: 85,
            duration: 3000
        }],
        frameItv: 200,
        beforeStart: function() {
            var pos = this._sheep.getPosition();
            pos.set(window.innerWidth - SIZE, 0);
            pos.animateTo(
                (pos.bounding.right - pos.bounding.left) / 2,
                pos.floorY - SIZE,
                2500,
                easings.easeInQuad
            );
        },
        isPossible: function() {
            return false;
        }
    },

    sleep: {
        probability: 0.2,
        frames: [0, 1],
        frameItv: 500,
        maxDuration: 15,
        loop: true,
        notAfter: ["run", "meteor", "bump"]
    },

    call: {
        probability: 0.1,
        frameItv: 200,
        frames: [
            3,
            {frame: 73, duration: 2000},
            71, 72, 71, 72, 71, 72, 71, 72,
            {frame: 73, duration: 2000},
            71, 72, 71, 72, 71, 72, 71, 72,
            73, 74, 75,
            {frame: 76, duration: 5000},
            73, 3
        ]
    },

    yawn: {
        probability: 0.1,
        frameItv: 200,
        frames: [
            3, {frame: 31, duration: 2000},
            107, {frame: 108, duration: 2000},
            110, 111, 110, 111, 110, 111, 110, 111,
            {frame: 109, duration: 7000},
            31, 3
        ]
    },

    stare: {
        probability: 0.1,
        frames: [
            {frame: 9, duration: 400},
            {frame: 10, duration: 400},
            {frame: 34, duration: 5000},
            {frame: 36, duration: 400},
            {frame: 34, duration: 5000},
            {frame: 10, duration: 400},
            {frame: 9, duration: 400}
        ]
    },

    jumpDown: {
        frames:[
            {frame: 78, duration: 500},
            // jump
            {frame: 77, duration: 500, action: function() {
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition(),
                    floor   = self.jumpTo,
                    rect    = getClientRect(floor),
                    x       = rect.getCenterX(),
                    y       = rect.floor - SIZE;

                pos.animateTo(x, y, 1500, [easings.easeInCubic, easings.easeInBack], function(){
                    pos.setFloor(floor);
                });
            }},
            {frame: 24, duration: 1000},
            {frame: 84, duration: 500, action: function() {

                var self    = this,
                    sheep   = self._sheep,
                    dir     = sheep.getDirection(),
                    pos     = sheep.getPosition(),
                    floor   = self.jumpTo,
                    rect    = getClientRect(floor),
                    width   = rect.width,
                    x       = (dir == "l" ? (width / 10) * 4 : (width / 10) * 6) + rect.left;

                pos.animateTo(x, pos.getY(), 500, easings.easeOutSine, function() {
                    pos.setFloor(floor);
                });
            }}
        ],
        beforeStart: function() {
            var self    = this,
                sheep   = self._sheep,
                dir     = sheep.getDirection(),
                pos     = sheep.getPosition(),
                floor   = pos.findLowerFloor(),
                rect    = getClientRect(floor),
                x;

            self.jumpTo = floor;

            x = rect.getCenterX();

            if (dir == "r" && x < pos.getX()) {
                sheep.changeDirection();
            }
            else if (dir == "l" && x > pos.getX() + SIZE) {
                sheep.changeDirection();
            }
        },
        isPossible: function(sheep) {
            return sheep.getPosition().getFloor() !== window;
        }
    },

    climbDown: {
        frameItv: 300,
        frames: [
            3, 9, 10, 11,
            {frame: 3, action: function(){
                this._sheep.changeDirection();
            }},
            {frame: 31, moveToSwinging: true},
            {frame: 40, startSwinging: true},
            41, 40, 41, 40,
            {frame: 45, duration: 1000, startFalling: true},
            {frame: 48, duration: 1000}
        ],
        onStep: function(inx, frame) {

            var self = this,
                rect, pos, floor, dir,
                sheep = self._sheep;

            if (frame.moveToSwinging) {
                dir     = sheep.getDirection();
                pos     = sheep.getPosition();
                rect    = getClientRect(pos.getFloor());

                // direction already changed
                pos.animateTo(
                    dir == "r" ? rect.left - SIZE : rect.right,
                    rect.floor,
                    300,
                    easings.easeInSine
                );
            }
            if (frame.startSwinging) {

                dir     = sheep.getDirection();
                pos     = sheep.getPosition();
                rect    = getClientRect(pos.getFloor());

                // direction already changed
                pos.set(
                    dir == "r" ? rect.left - SIZE : rect.right,
                    rect.floor
                );
            }
            if (frame.startFalling) {
                pos     = sheep.getPosition();
                floor   = pos.findFloorBeneath();
                rect    = getClientRect(floor);

                pos.animateTo(
                    pos.getX(),
                    rect.floor - SIZE,
                    1000,
                    easings.easeInQuad,
                    function() {
                        pos.setFloor(floor);
                    }
                );
            }
        },
        isPossible: function(sheep) {
            var pos = sheep.getPosition();
            return pos.isOnBounding() && pos.getFloor() !== window;
        },
        notAfter: ["run"]
    },

    climbDown2: {
        frames: [
            9, 10,
            {frame: 81, duration: 1000},
            {frame: 10, duration: 1000},
            {frame: 81, duration: 1000},
            10, 9, 3, 12, 13,
            {frame: 49, duration: 300, action: function() {
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition();

                pos.animateTo(pos.getX(), pos.getY() + SIZE, 300);
            }},
            42, 46, 47, 46,
            {frame: 47, duration: 1000, action: function() {
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition(),
                    floor   = pos.findFloorBeneath(),
                    rect    = getClientRect(floor);

                pos.animateTo(pos.getX(), rect.floor - SIZE, 1000, easings.easeInQuad, function() {
                    pos.setFloor(floor);
                })
            }},
            {frame: 48, duration: 1000}
        ],
        frameItv: 400,
        isPossible: function(sheep) {
            return sheep.getPosition().getFloor() !== window;
        }
    },

    climbUp: {
        frameItv: 400,
        frames: [
            12, 13,
            // jump
            {frame: 49, action: function() {
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition();
                pos.animateTo(pos.getX(), pos.getY() - 50, 600, easings.easeOutCirc);
            }},
            132,
            // climb
            {frame: 131, action: function() {
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition();
                pos.animateTo(pos.getX(), pos.getY() - 50, 3000, easings.easeOutCirc);
            }},
            132, 131, 132, 131, 132, 131,
            // sweat
            {frame: 133, duration: 2000},
            // fall
            {frame: 47, duration: 1000, action: function(){
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition();
                pos.animateTo(pos.getX(), pos.floorY - SIZE, 1000, easings.easeInCirc);
            }},
            // boom
            {frame: 48, duration: 2000}
        ]
    },

    jumpTo: {
        frames: [
            {frame: 76, duration: 500},
            {frame: 30, duration: 1000},
            {frame: 24, duration: 500}
        ],

        notAfter: ["jumpDown"],

        isPossible: function(sheep) {
            return !!sheep.getPosition().findUpperFloor();
        },

        beforeStart: function() {

            var self    = this,
                pos     = self._sheep.getPosition(),
                floor   = pos.findUpperFloor(),
                rect    = getClientRect(floor),
                dir     = self._sheep.getDirection(),
                x       = rect.getCenterX();

            self.jumpTo = floor;

            if ((dir == "r" && x < pos.getX()) ||
                (dir == "l" && x > pos.getX() + SIZE)) {
                self._sheep.changeDirection();
            }
        },

        onStep: function(step) {
            if (step == 1) {
                var self    = this,
                    pos     = self._sheep.getPosition(),
                    floor   = self.jumpTo,
                    rect    = getClientRect(floor),
                    x       = rect.getCenterX(),
                    y       = rect.floor - SIZE;

                pos.animateTo(
                    x, y, 1500,
                    [easings.easeOutQuad, easings.easeOutBack],
                    function(){
                        pos.setFloor(floor);
                    });
            }
        }
    },


    bath: {
        probability: 0.1,
        frameItv: 400,
        frames: [
            3, 9,
            {frame: 10, action: function(){
                var self    = this,
                    sheep   = self._sheep,
                    pos     = sheep.getPosition(),
                    div     = document.createElement("div");

                div.className = "sheep-js";
                div.style.left = pos.getX() + 'px';
                div.style.top = pos.getY() + 'px';
                document.body.appendChild(div);
                setFrame(div, 146);
                self.bath = div;
            }},
            54, 55, 54, 55, 54, 55, 54, 55, 54, 55,
            {frame: 10, action: function(){

                var self    = this;

                if (self.bath) {
                    document.body.removeChild(self.bath);
                    self.bath = null;
                }
            }},
            {frame: 54, duration: 3000},
            10, 9, 3
        ],
        onStep: function(inx, frame) {
            var self    = this;
            if (self.bath && (frame == 54 || frame == 55)) {
                setFrame(self.bath, frame == 54 ? 147 : 148);
            }
        },
        onStop: function() {

            var self    = this;

            if (self.bath) {
                document.body.removeChild(self.bath);
                self.bath = null;
            }
        }
    },

    direction: {
          frameItv: 300,
          frames: [3, 9, 10, 11, 3],
          notAfter: ["directionBack"],
          onStep: function(inx) {
              if (inx == 4) {
                  this._sheep.changeDirection();
              }
          }
    },

    directionBack: {
        frameItv: 300,
        frames: [3, 12, 13, 14, 3],
        notAfter: ["direction"],
        onStep: function(inx) {
            if (inx == 4) {
                this._sheep.changeDirection();
            }
        }
    },

    eat: {
        frameItv: 300,
        frames: [
            {frame: 3, duration: 1000}, 58, 59,
                {frame: 60, changeLeaf: true}, 61, 60, 61, 60, 61,
            {frame: 3, duration: 1000}, 58, 59,
                {frame: 60, changeLeaf: true}, 61, 60, 61, 60, 61,
            {frame: 3, duration: 1000}, 58, 59,
                {frame: 60, changeLeaf: true}, 61, 60, 61, 60, 61,
            {frame: 3, duration: 1000}, 58, 59,
                {frame: 60, changeLeaf: true}, 61, 60, 61, 60, 61,
            {frame: 3, duration: 2000},
            50, 51, 50, 51, 50, 3
        ],
        beforeStart: function() {
            var self    = this,
                sheep   = self._sheep,
                pos     = sheep.getPosition(),
                dir     = sheep.getDirection(),
                div     = document.createElement("div");

            div.className = "sheep-js";
            div.style.left = dir == 'l' ? pos.getX() - SIZE + 'px' : pos.getX() + SIZE + 'px';
            div.style.top = pos.getY() + 'px';

            document.body.appendChild(div);
            setFrame(div, 153);

            self.flower = div;
            self.leafFrame = 149;
        },
        onStep: function(inx, frame) {
            if (typeof frame != "number" && frame.changeLeaf) {
                var self    = this;
                setFrame(self.flower, self.leafFrame);
                self.leafFrame++;
            }
        },
        onStop: function() {

            var self    = this;

            if (self.flower) {
                document.body.removeChild(self.flower);
                self.flower = null;
                self.leafFrame = null;
            }
        },
        isPossible: function(sheep) {
            var dir     = sheep.getDirection(),
                pos     = sheep.getPosition(),
                floor   = pos.getFloor(),
                rect    = getClientRect(floor);

            if (dir == "l") {
                return pos.getX() > rect.left + SIZE;
            }
            else {
                return pos.getX() < rect.right - SIZE - SIZE;
            }
        }
    },

    water: {
        probability: 0.1,
        frameItv: 300,
        frames: [
            // turn around
            {frame: 3, duration: 1000}, 12,
            {frame: 13, action: function() {
                this._sheep.changeDirection();
            }},
            103, 104,
            105, 106, 105, 106, 105, {frame: 106, changeLeaf: 151},
            105, 106, 105, 106, 105, {frame: 106, changeLeaf: 150},
            105, 106, 105, 106, 105, {frame: 106, changeLeaf: 149},
            105, 106, 105, 106, 105, {frame: 106, changeLeaf: 153},

            104, 103,
            {frame: 13, action: function() {
                this._sheep.changeDirection();
            }},
            12,
            {frame: 3, duration: 1000}, 8,
            {frame: 3, duration: 1000}
        ],
        beforeStart: function() {
            var self    = this,
                sheep   = self._sheep,
                pos     = sheep.getPosition(),
                dir     = sheep.getDirection(),
                div     = document.createElement("div");

            div.className = "sheep-js";
            div.style.left = dir == 'l' ? pos.getX() - SIZE + 'px' : pos.getX() + SIZE + 'px';
            div.style.top = pos.getY() + 'px';

            document.body.appendChild(div);
            setFrame(div, 152);

            self.flower = div;
        },
        onStep: function(inx, frame) {
            if (typeof frame != "number" && frame.changeLeaf) {
                var self    = this;
                setFrame(self.flower, frame.changeLeaf);
            }
        },
        onStop: function() {

            var self    = this;

            if (self.flower) {
                document.body.removeChild(self.flower);
                self.flower = null;
            }
        },
        isPossible: function(sheep) {
            var dir     = sheep.getDirection(),
                pos     = sheep.getPosition(),
                floor   = pos.getFloor(),
                rect    = getClientRect(floor);

            if (dir == "l") {
                return pos.getX() > rect.left + SIZE;
            }
            else {
                return pos.getX() < rect.right - SIZE - SIZE;
            }
        }
    },


    pee: {
        probability: 0.1,
        frameItv: 200,
        frames: [
            // turn around
            3, 12, 13,
            // pee
            103, 104, 105, 106, 105, 106, 105, 106, 105, 104, 103,
            // turn around
            13, 12, 3
        ]
    },

    walkOnHands: {
        bound: true,
        frameItv: 200,
        frames: [
            3, 78,
            {frame: 86, action: function(){
                var self    = this,
                    sheep   = self._sheep,
                    dir     = sheep.getDirection(),
                    pos     = sheep.getPosition();

                pos.animateTo(
                    dir == "l" ? pos.getX() - 40 : pos.getX() + SIZE + 40,
                    pos.getY(),
                    1500
                );
            }},
            87, 86, 87, 86, 87, 86, 78, 3]
    },

    walkOnHands2: {
        probability: 0.1,
        frameItv: 200,
        frames: [
            3, 9, 10,
            {frame: 88, frameItv: 400}, 89, 88, 89, 88, 89, 88, 89, 88, 89,
            90,
            {frame: 10, frameItv: 200}, 9, 3
        ]
    },

    roll: {
        bound: true,
        frameItv: 200,
        frames: [
            3, 9, 10,
            {frame: 126, action: function(){
                var self    = this,
                    sheep   = self._sheep,
                    dir     = sheep.getDirection(),
                    pos     = sheep.getPosition();

                pos.animateTo(
                    dir == "l" ? pos.getX() - 220 : pos.getX() + 220,
                    pos.getY(),
                    3000
                );
            }},
            125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112,
            10, 9, 3
        ],
        isPossible: function(sheep) {
            var pos     = sheep.getPosition(),
                dir     = sheep.getDirection(),
                x       = pos.getX(),
                rect    = getClientRect(pos.getFloor());

            if (dir == "l") {
                return x > rect.left + 220;
            }
            else {
                return x < rect.right - 220 - SIZE;
            }
        }
    },



    walk: {
        frames: [2, 3],
        frameItv: 300,
        xShift: 1,
        moveItv: 50,
        loop: true,
        maxDuration: 40,
        bound: true,
        isPossible: function(sheep) {
            return !sheep.getPosition().isOnBounding();
        }
    },

    run: {
        frames: [4, 5],
        frameItv: 300,
        xShift: 4,
        moveItv: 40,
        loop: true,
        maxDuration: 40,
        bound: true,
        isPossible: function(sheep) {
            return !sheep.getPosition().isOnBounding();
        }
    },

    bump: {
        bound: true,
        frames: [
            {frame: 62, duration: 200},
            {frame: 63, xShift: -3, moveItv: 40},
            64, 65, 66, 67, 68, 69, 70,
            {frame: 63, duration: 500},
            {frame: 63, stopMoving: true, duration: 500}
        ],
        frameItv: 100,
        onlyAfter: ["run"],
        isPossible: function(sheep) {
            return sheep.getPosition().isOnBounding() &&
                   sheep.getPosition().getFloor() === window;
        }
    }
};

for (var i in actions) {
    actionIds.push(i);
}