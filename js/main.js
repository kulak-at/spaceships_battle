var SpaceShip = require('./spaceship.js');
var PlayerSpaceShip = require('./playerspaceship.js');

        
var game;
document.addEventListener('DOMContentLoaded', function(){
    game = new Phaser.Game(document.body.clientWidth, document.body.clientHeight, Phaser.AUTO, null, { preload: preload, create: create, update: update, render: render });
});



var config = require('./config.js');

var cursors;
var land;

var team1 = [];
var team2 = [];
var bullets_t1;
var bullets_t2;
var music;
var player;
var hud = [];
var menu_text;
var menu_group;

function preload() {
    // preloading assets
    game.load.image('bg_stars' , 'assets/starBackground.png');
    game.load.image('player_t1', 'assets/player.png');
    game.load.image('player_t2', 'assets/enemyShip.png');
    game.load.image('bullet_t1', 'assets/laserRed.png');
    game.load.image('bullet_t2', 'assets/laserGreen.png');
    game.load.image('shot_t1'  , 'assets/laserRedShot.png');
    game.load.image('shot_t2'  , 'assets/laserGreenShot.png');
    game.load.image('hud_life' , 'assets/life.png');
    
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
    
    // bullets group
    bullets_t1 = game.add.group();
    bullets_t2 = game.add.group();
    
    // creating teams
    var k = config.teamPlayersCount;
    while(k--) {
        team1.push(new SpaceShip(game, 1, config, bullets_t1));
    }
    k = config.teamPlayersCount;
    while(k--) {
        team2.push(new SpaceShip(game, 2, config, bullets_t2));
    }
    
    // audio playback
    music = game.add.audio('soundtrack');
    music.play('', 0, 1, true);
    
    createMenuHud();
    
    // player
    player = new PlayerSpaceShip(game, 1, config, bullets_t1, menu_group);
    
    
    game.camera.follow(player.ship);
    team1.push(player);
    
    
    setTimeout(resurectTeamMember.bind(this, team1), game.rnd.integerInRange(2000, 10000));
    setTimeout(resurectTeamMember.bind(this, team2), game.rnd.integerInRange(2000, 10000));
    
}

function resurectTeamMember(team) {
    
    for(var i=0, ship; i< team.length, ship = team[i]; i++) {
        if(!ship.alive && ship !== player) {
            // resurecting
            ship.alive = true;
            ship.ship.revive();
            ship.health = config.health;
            
            ship.ship.x = game.world.randomX;
            ship.ship.y = game.world.randomY;
            ship.prevShot = this.game.time.now + 1000;
            break;
        }
    }
    
    setTimeout(resurectTeamMember.bind(this, team), game.rnd.integerInRange(2000, 10000));
    
}

function bulletHit(ship, bullet) {
    var hit = game.add.sprite(bullet.x, bullet.y, 'shot_t' + ((this.team % 2) + 1) );
    hit.anchor.set(0.5);
    hit.scale.x = 0.1;
    hit.scale.y = 0.1;
    game.add.tween(hit.scale).to({x:1, y: 1}, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
//    hit.x = bullet.x;
//    hit.y = bullet.y;
    
    setTimeout(function() {
        hit.destroy();
    }, 100);
    
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

function createMenuHud() {
    menu_text = game.add.text(game.width/2, game.height/2, "Press Space to start", { font: '30px Arial', fill: '#fff'});
    var gameTitle = game.add.text(game.width / 2, (game.height / 2) - menu_text.height - 50, "SpaceShips Battle", { font: '60px Arial', fill: '#fff'});

    menu_text.anchor.setTo(0.5, 0.5);
    gameTitle.anchor.setTo(0.5, 0.5);
    menu_text.fixedToCamera = true;
    gameTitle.fixedToCamera = true;
    menu_group = game.add.group();
    menu_group.add(gameTitle);
    menu_group.add(menu_text);
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
    } else if(cursors.down.isDown) {
        game.physics.arcade.accelerationFromRotation(player.ship.rotation, -200, player.ship.body.acceleration);
    } else {
        player.ship.body.acceleration.set(0);
    }
    
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if(player.alive) {
            player.shot();
        } else {
            player.resurect();
            menu_group.alpha = 0;
        }
    }
    
//    if(cursors.down.isDown) {
//        game.camera.y += diff;
//    }
    
//    game.camera.x = player.ship.x;
    land.tilePosition.x = -player.ship.x;
    
//    game.camera.y = player.ship.y;
    land.tilePosition.y = -player.ship.y;
}