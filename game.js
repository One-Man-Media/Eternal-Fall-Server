let socket;
let player;
let joystick;
let cursors;
let wasdKeys;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'https://example.com/player.png') //Replace with actual asset later
}

function create() {
    //Connect to WebSocket
    socket = new WebSocket('wss://musical-goldfish-wr55rg67579925qjv-3000.app.github.dev/');

    player = this.physics.add.image(400, 300, 'player');
    player.setCollideWorldBounds(true);

    //Virtual Joystick (For touchscreens)
    joystick = this.plugins.get('rexVirtualJoystick').add(this, {
        x: 100,
        y: 500,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 25, 0xffffff),
        dir: '8dir',
        forceMin: 0
    });

    //Keyboard Controls
    cursors = this.input.keyboard.createCursorKeys(); //Arrow Keys
    wasdKeys = this.input.keyboard.addKeys({ //W, A, S, D Movement
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    socket.onopen = () => {
        console.log('Connected to server');
        socket.send(JSON.stringify({ type: 'join', id: 'player1' }));
    };

    socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === 'updatePlayers') {
            console.log('Players:', data.players);
        }
    };
}

function update() {
    let speed = 2;

    //Virtual Joystick
    let angle = joystick.angle;
    if (joystick.force > 0) {
        let radian = Phaser.Math.DegToRad(angle);
        player.x += Math.cos(radian) * speed;
        player.y += Math.sin(radian) * speed;
    }

    //Keyboard
    if (cursors.left.isDown || wasdKeys.left.isDown) player.x -= speed;
    if (cursors.right.isDown || wasdKeys.right.isDown) player.x += speed;
    if (cursors.up.isDown || wasdKeys.up.isDown) player.y -= speed;
    if (cursors.down.isDown || wasdKeys.down.isDown) player.y += speed;

    // Send Movement Updates To Server
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'move', id: 'player1', x: player.x, y: player.y }));
    }
}