var shot = function() {
    
//    console.log(this);
    
    if(this.prevShot + this.config.gunCooldownTime > this.game.time.now) {
        return; // gun is still cooling down.
    }
    this.prevShot = this.game.time.now;
    var bullet = this.game.add.sprite(this.ship.x, this.ship.y, 'bullet_t' + this.team);
//    bullet.enableBody = true;
//    bullet.physicsBodyType = Phaser.Physics.ARCADE;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.lifespan = this.config.bulletLifespan;
    bullet.rotation = this.ship.rotation;
    this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
    this.ship.body.collideWorldBounds = true;
    this.game.physics.arcade.velocityFromRotation(bullet.rotation, this.config.bulletSpeed, bullet.body.velocity); // move bullet velocity to config.
//    if(this.team === 1) {
    this.bullets.add(bullet);
//    } else {
//        this.bullets_t2.add(bullet);
//    }
    
    
    shot = this.game.add.audio('laser_t' + this.team);
    shot.play('', 0, 0.1);
};

var aimEnemy = function(enemy) {
    
    this.ship.rotation = this.game.physics.arcade.angleBetween(this.ship, enemy.ship);
    if(this.game.physics.arcade.distanceBetween(this.ship, enemy.ship) < this.config.thresholdFlee) {
        // too close
        this.ship.rotation = - this.ship.rotation;
        this.state = 'flee';
        this.data = this.data; // not chaning, just to show we still need this data.
        return;
    }
    
    // shoting
    this.shot();
    
    
    
};


var flee = function(enemy) {
    this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, -200, this.ship.body.acceleration);
}

var accelerate = function() {
    var rand = this.game.rnd.frac();
    if(rand > 0.4) {
//        this.game.physics.arcade.velocityFromAngle(this.ship.angle, config.baseVelocity, this.ship.body.velocity);
            this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, 200, this.ship.body.acceleration);
    } else if(rand < 0.2) {
            this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, -200, this.ship.body.acceleration);
    } else {
//        this.ship.body.velocity.set( this.ship.body.velocity - 0.0005);
//        this.ship.body.acceleration.set(0);
        
        this.ship.body.acceleration.set(0);
    }
};

var rotate = function() {
    if(this.game.rnd.frac() > 0.7) {
        // doing rotation
        if(this.game.rnd.frac() > 0.5) {
            this.ship.body.angularVelocity = this.game.rnd.integerInRange(100, 400);
        } else {
            this.ship.body.angularVelocity = this.game.rnd.integerInRange(-400, -100);
        }
    } else {
        this.ship.body.angularVelocity = 0;
    }
};

var changeParams = function() {
    this.rotate();
    this.accelerate();
};

var update = function(enemies) {
    // logic for movement and aiming an enemyS
    
    this.changeParams();
    
    if(this.state === 'following') {
        if(this.game.physics.arcade.distanceBetween(this.ship, this.data.ship) > this.config.thresholdLost) {
            // ship lost
            this.state = 'idle';
            this.data = null;
        } else {
            this.aimEnemy(this.data);
        }
    }
    
    if(this.state === 'flee') {
        if(this.game.physics.arcade.distanceBetween(this.ship, this.data.ship) > this.config.thresholdFleed) {
            // successfuly fleed
            this.state = 'idle';
            this.data = null;
        } else {
            this.flee(this.data);
            return;
        }
    }
    
    if(this.game.rnd.frac() > 0.999) {
        this.shot(); // shoting randomly
    }
    
    for(var i in enemies) {
        var enemy = enemies[i];
        
        if(this.game.physics.arcade.distanceBetween(this.ship, enemy.ship) < 200) { // TODO: move to config
            this.state = 'following';
            this.data = enemy;
            break; // following the first one.
        }
    }
    
    
    
};


var collideWith = function() {
    var args = Array.prototype.slice.call(arguments);
    for(var i in args) {
        this.collideWithOne(args[i]);
    }
};

var collideWithOne = function(arr) {
    for(var i in arr) {
        this.game.physics.arcade.collide(this.ship, arr[i].ship);
    }
};

var damage = function() {
    // empty
};



var SpaceShip = function(game, team, config, bullets) {
    
    var ship = {};
    
    var x = game.world.randomX;
    var y = game.world.randomY;
    ship.game = game;
    ship.config = config;
    ship.health = config.health;
    ship.alive = true;
    ship.team = team;
    ship.ship = game.add.sprite(x, y, 'player_t' + team);
    ship.ship.anchor.set(0.5, 0.5);
    ship.game.physics.enable(ship.ship, Phaser.Physics.ARCADE);
    ship.ship.body.immovable = false;;
    ship.ship.body.collideWorldBounds = true;
    ship.ship.body.bounce.setTo(1, 1); // TODO: set here some other values and move to config
    ship.ship.body.maxVelocity.setTo(300, 300);
    
    ship.ship.angle = game.rnd.angle();
    ship.game = game;
    ship.prevShot = 0;
    ship.bullets = bullets;
    
//    game.physics.arcade.velocityFromRotation(this.ship.rotation, 100, this.ship.body.velocity); // TODO: move to config
    
    ship.state = 'idle';
    
    // binding methods
    ship.shot = shot;
    ship.flee = flee;
    ship.aimEnemy = aimEnemy;
    ship.accelerate = accelerate;
    ship.rotate = rotate;
    ship.changeParams = changeParams;
    ship.update = update;
    ship.collideWith = collideWith;
    ship.collideWithOne = collideWithOne;
    ship.damage = damage;
    
    return ship;
};


//
//SpaceShip.prototype.shot = function() {
//    
//    
//};
//
//SpaceShip.prototype.aimEnemy = function(enemy) {
//    
//}
//
//SpaceShip.prototype.flee = function(enemy) {
////    this.ship.rotate = 180 - this.game.physics.arcade.angleBetween(this.ship, enemy.ship);
//    
//}
//
//SpaceShip.prototype.accelerate = function() {
//    // accelerate
//    
//}
//
//SpaceShip.prototype.rotate = function() {
////    // rotate randomly in range (curr - diff , curr + diff) deg
////    var diff = 0.1;
////    var rot_min = Math.max(-180, this.ship.rotation - diff);
////    var rot_max = Math.min(180, this.ship.rotation + 2 * diff);
////    if(this.game.rnd.frac() > 0.7) {
////        this.ship.rotation = this.game.rnd.realInRange(rot_min, rot_max);
////    }
//    
//    
//    
////    game.physics.arcade.accelerationFromddRotation(player.ship.rotation, 200, player.ship.body.acceleration);
//    
//}
//
//SpaceShip.prototype.changeParams = function() {
//}




module.exports = SpaceShip;