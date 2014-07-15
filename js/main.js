var SpaceShip = function(game, team, config) {
    var x = game.world.randomX;
    var y = game.world.randomY;
    this.game = game;
    this.health = config.health;
    this.alive = true;
    this.team = team;
    this.ship = game.add.sprite(x, y, 'player_t' + team);
    this.ship.anchor.set(0.5, 0.5);
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.body.immovable = false;;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(1, 1); // TODO: set here some other values and move to config
    
    this.ship.angle = game.rnd.angle();
    this.game = game;
    this.prevShot = 0;
    
//    game.physics.arcade.velocityFromRotation(this.ship.rotation, 100, this.ship.body.velocity); // TODO: move to config
    
    this.state = 'idle';
};

SpaceShip.prototype.shot = function() {
    if(this.prevShot + config.gunCooldownTime > this.game.time.now) {
        return; // gun is still cooling down.
    }
    this.prevShot = this.game.time.now;
    var bullet = game.add.sprite(this.ship.x, this.ship.y, 'bullet_t' + this.team);
//    bullet.enableBody = true;
//    bullet.physicsBodyType = Phaser.Physics.ARCADE;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.lifespan = config.bulletLifespan;
    bullet.rotation = this.ship.rotation;
    game.physics.enable(bullet, Phaser.Physics.ARCADE);
    this.ship.body.collideWorldBounds = true;
    this.game.physics.arcade.velocityFromRotation(bullet.rotation, config.bulletSpeed, bullet.body.velocity); // move bullet velocity to config.
    if(this.team === 1) {
        bullets_t1.add(bullet);
    } else {
        bullets_t2.add(bullet);
    }
    
    
    shot = game.add.audio('laser_t' + this.team);
    shot.play('', 0, 0.2);
    
};

SpaceShip.prototype.aimEnemy = function(enemy) {
    this.ship.rotation = this.game.physics.arcade.angleBetween(this.ship, enemy.ship);
    if(game.physics.arcade.distanceBetween(this.ship, enemy.ship) < config.thresholdFlee) {
        // too close
        this.ship.rotation = - this.ship.rotation;
        this.state = 'flee';
        this.data = this.data; // not chaning, just to show we still need this data.
        return;
    }
    
    // shoting
    this.shot();
    
    
}

SpaceShip.prototype.flee = function(enemy) {
    this.ship.rotate = 180 - this.game.physics.arcade.angleBetween(this.ship, enemy.ship);
}

SpaceShip.prototype.accelerate = function() {
    // accelerate
    if(this.game.rnd.frac() > 0.4) {
        this.game.physics.arcade.velocityFromAngle(this.ship.angle, config.baseVelocity, this.ship.body.velocity);
    } else {
        this.ship.body.velocity.set( this.ship.body.velocity - 0.0005);
//        this.ship.body.acceleration.set(0);
    }
}

SpaceShip.prototype.rotate = function() {
    // rotate randomly in range (curr - diff , curr + diff) deg
    var diff = 0.1;
    var rot_min = Math.max(-180, this.ship.rotation - diff);
    var rot_max = Math.min(180, this.ship.rotation + 2 * diff);
    if(this.game.rnd.frac() > 0.7) {
        this.ship.rotation = this.game.rnd.realInRange(rot_min, rot_max);
    }
}

SpaceShip.prototype.changeParams = function() {
    this.rotate();
    this.accelerate();
}

SpaceShip.prototype.update = function(enemies) {
    // logic for movement and aiming an enemyS
    
    this.changeParams();
    
    if(this.state === 'following') {
        if(game.physics.arcade.distanceBetween(this.ship, this.data.ship) > config.thresholdLost) {
            // ship lost
            this.state = 'idle';
            this.data = null;
        } else {
            this.aimEnemy(this.data);
        }
    }
    
    if(this.state === 'flee') {
        if(game.physics.arcade.distanceBetween(this.ship, this.data.ship) > config.thresholdFleed) {
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
        
        if(game.physics.arcade.distanceBetween(this.ship, enemy.ship) < 200) { // TODO: move to config
            this.state = 'following';
            this.data = enemy;
            break; // following the first one.
        }
    }
    
    
    
};

SpaceShip.prototype.collideWith = function() {
    var args = Array.prototype.slice.call(arguments);
    for(var i in args) {
        this.collideWithOne(args[i]);
    }
};

SpaceShip.prototype.collideWithOne = function(arr) {
    for(var i in arr) {
        this.game.physics.arcade.collide(this.ship, arr[i].ship);
    }
};

SpaceShip.prototype.damage = function() {
    // empty
};

var playerUpdate = function() {
    // empty
};

var playerDamage = function() {
    hud[this.health].destroy();
    hud.pop();
};
        
var game;
document.addEventListener('DOMContentLoaded', function(){
    game = new Phaser.Game(document.body.clientWidth, document.body.clientHeight, Phaser.AUTO, null, { preload: preload, create: create, update: update, render: render });
});



var config = {
    cameraMovementDiff: 4,
    teamPlayersCount: 100,
    health: 5,
    bulletLifespan: 500,
    bulletSpeed: 900,
    baseVelocity: 350,
    gunCooldownTime: 300, // in miliseconds
    thresholdFlee: 100,
    thresholdLost: 300,
    thresholdFleed: 500
};

var cursors;
var land;

var team1 = [];
var team2 = [];
var bullets_t1;
var bullets_t2;
var music;
var player;
var hud = [];

function preload() {
    // preloading assets
    game.load.image('bg_stars', 'assets/starBackground.png');
    game.load.image('player_t1', 'assets/player.png');
    game.load.image('player_t2', 'assets/enemyShip.png');
    game.load.image('bullet_t1', 'assets/laserRed.png');
    game.load.image('bullet_t2', 'assets/laserGreen.png');
    game.load.image('hud_life',  'assets/life.png');
    
    game.load.audio('soundtrack', 'assets/soundtrack.mp3'); // TODO: convert soundtrack to ogg 'cos Firefox doesn't support mp3s
    game.load.audio('laser_t1', 'assets/Laser1.wav');
    game.load.audio('laser_t2', 'assets/Laser2.wav');
}

function create() {
    game.world.setBounds(-1000, -1000, 5000, 5000);
    
    land = game.add.tileSprite(0, 0, game.width, game.height, 'bg_stars');
    land.fixedToCamera = true;
    
    // cursors object
    cursors = game.input.keyboard.createCursorKeys();
    
    // creating teams
    var k = config.teamPlayersCount;
    while(k--) {
        team1.push(new SpaceShip(game, 1, config));
    }
    k = config.teamPlayersCount;
    while(k--) {
        team2.push(new SpaceShip(game, 2, config));
    }
    
    // bullets group
    bullets_t1 = game.add.group();
    bullets_t2 = game.add.group();
    
    // audio playback
    music = game.add.audio('soundtrack');
    music.play('', 0, 1, true);
    
    // player
    player = new SpaceShip(game, 1, config);
    player.update = playerUpdate;
    player.damage = playerDamage;
    
    game.camera.follow(player.ship);
    team1.push(player);
    
    render_hud();
    
}

function render_hud() {
    
    for(var i=0;i<config.health;i++) {
        var life = game.add.sprite(i*50 + 10, 10, 'hud_life');
        life.fixedToCamera = true;
        hud.push(life);
    }
}

function bulletHit(ship, bullet) {
    bullet.kill();
    this.health--;
    this.damage();
    
    if(this.health <= 0) {
        ship.kill();
        this.alive = false;
    }
}

function update() {
    
    // detached camera
    updateDetachedCamera();
    
    for(var i in team1) {
        var ship = team1[i];
        if(!ship.alive) {
            continue;
        }
        // collide
        ship.collideWith(team1, team2);
        game.physics.arcade.overlap(bullets_t2, ship.ship, bulletHit, null, ship);
        ship.update(team2);
    }
    
    for(var i in team2) {
        var ship = team2[i];
        if(!ship.alive) {
            continue;
        }
        ship.collideWith(team1, team2);
        game.physics.arcade.overlap(bullets_t1, ship.ship, bulletHit, null, ship);
        ship.update(team1);
    }
    
}

function render() {
    
}

function updateDetachedCamera() {
    var diff = config.cameraMovementDiff;
    if(cursors.left.isDown) {
//        game.camera.x -= diff;
        player.ship.body.angularVelocity = -300;
    } else if(cursors.right.isDown) {
//        game.camera.x += diff;
        player.ship.body.angularVelocity = 300;
    } else {
        player.ship.body.angularVelocity = 0;
    }
    
    if(cursors.up.isDown) {
        game.physics.arcade.accelerationFromRotation(player.ship.rotation, 200, player.ship.body.acceleration);
    } else {
        player.ship.body.acceleration.set(0);
    }
    
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && player.alive) {
        player.shot();
    }
    
//    if(cursors.down.isDown) {
//        game.camera.y += diff;
//    }
    
//    game.camera.x = player.ship.x;
    land.tilePosition.x = -player.ship.x;
    
//    game.camera.y = player.ship.y;
    land.tilePosition.y = -player.ship.y;
}