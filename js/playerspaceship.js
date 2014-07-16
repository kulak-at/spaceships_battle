var SpaceShip = require('./spaceship.js');

var hud = [];

var update = function() {
    // empty
};

var damage = function() {
    hud[this.health].kill();
    if(this.health <= 0) {
        this.menu_group.alpha = 1;
    }
};

var resurect = function() {
    var h;
    for(var i=0;i<hud.length, h=hud[i];i++) {
        h.revive();
    }
    this.health = this.config.health;
    this.alive = true;
    this.ship.x = this.game.world.randomX;
    this.ship.y = this.game.world.randomY;
    this.ship.revive();
    this.prevShot = this.game.time.now + 1000; // shooting penalty after revive 
};


function render_hud() {
    
    for(var i=0;i<this.config.health;i++) {
        var life = this.game.add.sprite(i*50 + 10, 10, 'hud_life');
        life.fixedToCamera = true;
        life.kill();
        hud.push(life);
    }
};


var PlayerSpaceShip = function(game, team, config, bullets, menu_group) {
    
    var ship = Object.create(new SpaceShip(game, team, config, bullets));
    
    ship.alive = false;
    ship.update = update;
    ship.damage = damage;
    ship.resurect = resurect;
    ship.ship.kill();
    ship.render_hud = render_hud;
    ship.menu_group = menu_group;
    ship.render_hud();
    
    return ship;
    
};

module.exports = PlayerSpaceShip;