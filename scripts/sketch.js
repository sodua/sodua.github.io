var joystick = new VirtualJoystick({
container : document.getElementById('defaultCanvas0'),
mouseSupport : false,
});

var fontsize = 40;
var ship;
var turrets, bullets, fireballs;
var shipImage, shipUpImage, shipDownImage, shipPhasedImage;
var bgImage, terrainTop, terrainBottom, turretImage, boomImage;
var bulletImage, fbImage;
var autoFire, gameOver, gameScore;

function preload() {
    font = loadFont('assets/iAWriterDuospace-Bold.otf');
}
function setup() {
    createCanvas(1100, 600);
    textFont(font);
    textSize(fontsize);
    textAlign(CENTER, CENTER);
    bgImage = loadImage('assets/cavebg.png');
    terrainTop = loadImage('assets/terrain_top.png');
    terrainBottom = loadImage('assets/terrain_bottom.png');
    shipImage = loadImage('assets/ship-side.png');
    shipUpImage = loadImage('assets/ship-side-right_under.png');
    shipDownImage = loadImage('assets/ship-side-left.png');
    shipPhasedImage = loadImage('assets/ship-side-phased.png');
    ship = createSprite(64, height/2);
    ship.addImage("normal", shipImage);
    ship.addImage("up", shipUpImage);
    ship.addImage("down", shipDownImage);
    ship.addImage("phased", shipPhasedImage);
    ship.score = 100;
    turretImage = loadImage('assets/turret.png');
    turrets = new Group();
    boomImage = loadImage('assets/explosion0001.png');
    bulletImage = loadImage('assets/fb_o.png');
    bullets = new Group();
    fbImage = loadImage('assets/fireball_small.png');
    fireballs = new Group();
    autoFire = false;
    gameOver = true;
    gameScore = 0;

}

function draw() {
    if (gameOver) {
        camera.off();
        image(bgImage, 0, 0);
        textAlign(CENTER);
        drawWords("Press 'N' or swipe screen to start", width * .5);
        camera.on();
        if (keyWentDown('n') || keyWentDown('N'))
            newGame();
        if (joystick.right()||joystick.left()||joystick.down()||joystick.up()) {
            autoFire = true;
            newGame();
        }
    } 

    if (!gameOver) {
    background(0);
    textAlign(RIGHT);

    /* continuously tilt turrets toward ship */
    for (var i = 0; i < turrets.length; i++) {
        var t = turrets[i];
        var turret_y = t.position.x - t.position.y;
        var ship_x = ship.position.x - ship.position.y;
        var atan_rot = Math.atan2(turret_y, ship_x) * 180 / Math.PI;
        if (t.position.x > ship.position.x)
            t.rotation = atan_rot;
        else
            t.rotation = -1 * atan_rot;
    }

    /* shoot automatically if user is on touch device */
    if (frameCount%30 == 0 && autoFire) {
        var bullet = createSprite(ship.position.x, ship.position.y);
        bullet.addImage(bulletImage);
        bullet.setSpeed(30, ship.rotation);
        bullet.life = 30;
        bullets.add(bullet);
    }

    /* turrets shoot fireballs at ship */
    if (frameCount%60 == 0) {
        for (var i = 0; i < turrets.length; i++) {
            var fbspeed = random(5, 30)
            var fb = createSprite(t.position.x, t.position.y);
            fb.addImage(fbImage);
            fb.attractionPoint(fbspeed, ship.position.x, ship.position.y);
            fireballs.add(fb);
        }
    }
     
    /* draw turrets and load turret explosions */
    if (frameCount%60 == 0) {
        var turretSpacing = random(700, 900);
        if (turretSpacing > 800) {
            var turret = createSprite(ship.position.x + turretSpacing, 35, 75, 75);
            turret.addImage(turretImage);
            turret.addAnimation("boom", 'assets/explosion0001.png', 'assets/explosion0003.png');
            turrets.add(turret);
        }
        if (turretSpacing < 800) {
            turret = createSprite(ship.position.x + turretSpacing, 565, 75, 75);
            turret.mirrorY(-1);
            turret.addImage(turretImage);
            turret.addAnimation("boom", 'assets/explosion0001.png', 'assets/explosion0003.png');
            turrets.add(turret);
        }
    }

    /* remove things that have left the screen */
    for (var i = 0; i < fireballs.length; i++)
        if (fireballs[i].position.x < width || fireballs[i].position.y < 0)
            fireballs[i].remove();
    for (var i = 0; i < turrets.length; i++)
        if (turrets[i].position.x < ship.position.x - width/2)
            turrets[i].remove();

    /* camera and ship positioning */
    camera.position.x = ship.position.x + width/4;
    
    ship.up = function() {
        ship.changeAnimation("up");
        ship.position.y = ship.position.y - 10;
        if (ship.position.y > 0) {
            ship.rotation -= 1;
        }
    }
    ship.down = function() {
        ship.changeAnimation("down");
        ship.position.y = ship.position.y + 10;
        if (ship.position.y < 600) { 
            ship.rotation += 1;
        }
    }
    ship.right = function() {
            ship.changeAnimation("normal");
            ship.position.x = ship.position.x + 10;
    }
    ship.left = function() {
            ship.changeAnimation("normal");
        if (ship.position.x >= 0) {
            ship.position.x = ship.position.x - 10;
	    }
    }
 	
    /* arrow key and wasd keyboard controls */
    if (keyIsDown(UP_ARROW) || keyIsDown(87))
		ship.up();
	if (keyIsDown(DOWN_ARROW) || keyIsDown(83))
		ship.down();
	if (keyIsDown(RIGHT_ARROW) || keyIsDown(68))
		ship.right();
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65))
		ship.left();

    /* touch screen controls */
	joystick.right() ? ship.right() : '';
	joystick.up() ? ship.up() : '';
	joystick.left() ? ship.left() : '';
	joystick.down() ? ship.down() : '';

    /* keep ship from going off screen and moving forward*/
    ship.update = function() {
        if (ship.position.y > height) {
          ship.position.y = height;
        }
        if (ship.position.y < 0) {
          ship.position.y = 0;
        }
        ship.position.x = ship.position.x + 5;
    }

    /* ship shoots fireball bullets */ 
    if (keyWentDown('SPACE')) {
        var bullet = createSprite(ship.position.x, ship.position.y);
        bullet.addImage(bulletImage);
        bullet.setSpeed(30, ship.rotation);
        bullet.life = 30;
        bullets.add(bullet);
    }

    /* when ship shoots turrets */
    bullets.collide(turrets, explosion);
    function explosion(spriteA, spriteB) {
        spriteB.changeAnimation("boom");
        gameScore += 50;
        spriteA.remove(); /* remove bullet that ship fired */
    }

    /* when turrets shoot ship */
    fireballs.collide(ship, shipHit);
    function shipHit(spriteA, spriteB) {
        spriteA.remove() /* remove fireball that hit ship */ 
        ship.changeAnimation("phased");
        spriteB.score--;
        if (spriteB.score == 0)
            die();
    }
    camera.off();
    image(bgImage, 0, 0);
    image(terrainTop, 0, 0);
    image(terrainBottom, 0, 565);
    drawWords(ship.score, width * .05);
    drawWords(gameScore, width * .8);
    camera.on();
    drawSprites();
  }
}

function die() {
    gameOver = true;
}

function newGame() {
    turrets.removeSprites();
    fireballs.removeSprites();
    updateSprites(true);
    ship.position.x = 64;
    ship.position.y = height/2;
    ship.rotation = 0;
    ship.changeAnimation("normal");
    ship.score = 100;
    gameScore = 0;
    gameOver = false;
}

joystick.addEventListener('touchStart', function(){
    console.log('down')
})
joystick.addEventListener('touchEnd', function(){
    console.log('up')
})

function drawWords(score, offset) {
    fill(255);
    text(score, offset, 75);
}
function touchStarted() {
    return true;
}
