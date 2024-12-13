class SpaceWar extends Phaser.Scene {
	constructor() {
		super()
		this.shipSpeed = 300
		this.direction = null
		this.previousDirection = null

		this.maxAmmo = 20
		this.currentAmmo = this.maxAmmo
		this.ammoRegenerate = 1
		this.lastAmmoRegenTime = 0
		this.ammoRegenRate = 1
		this.lastShotTime = 0
		this.shootDelay = 500

		this.enemySpawnDelay = 2000
		this.lastEnemySpawnTime = 0
	}

	preload() {
		this.load.image('background', './assets/bg.png')
		this.load.spritesheet('ship', './assets/spaceship.png', {
			frameWidth: 64,
			frameHeight: 64,
		})

		this.load.spritesheet('ammo', './assets/ammo.png', {
			frameWidth: 16,
			frameHeight: 16,
		})

		this.load.spritesheet(
			'greenEnemyShip',
			'./assets/greenEnemyShip/greenEnemyShip.png',
			{
				frameWidth: 64,
				frameHeight: 64,
			}
		)

		// Загружаем анимацию взрыва
		this.load.spritesheet(
			'greenEnemyShipBlow1',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_001.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow2',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_001.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow3',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_003.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow4',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_004.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow5',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_005.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow6',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_006.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow7',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_007.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow8',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_008.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow9',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_009.png',
			{
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		this.load.spritesheet(
			'greenEnemyShipBlow10',
			'./assets/greenEnemyShip/blow/Ship1_Explosion_010.png',
			{
				frameWidth: 129,
				frameHeight: 128,
			}
		)
	}

	create() {
		const bg = this.add.image(0, 0, 'background').setOrigin(0, 0)
		bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)

		this.anims.create({
			key: 'shipAnimation',
			frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
			frameRate: 6,
			repeat: -1,
		})

		this.anims.create({
			key: 'greenEnemyShipAnim',
			frames: [
				{ key: 'greenEnemyShipBlow1' },
				{ key: 'greenEnemyShipBlow2' },
				{ key: 'greenEnemyShipBlow3' },
				{ key: 'greenEnemyShipBlow4' },
				{ key: 'greenEnemyShipBlow5' },
				{ key: 'greenEnemyShipBlow6' },
				{ key: 'greenEnemyShipBlow7' },
				{ key: 'greenEnemyShipBlow8' },
				{ key: 'greenEnemyShipBlow9' },
				{ key: 'greenEnemyShipBlow10' },
			],
			frameRate: 20,
			repeat: 0,
		})

		this.ship = { sprite: this.physics.add.sprite(200, 400, 'ship') }
		this.ship.sprite.anims.play('shipAnimation')

		this.cursors = this.input.keyboard.createCursorKeys()
		this.keys = this.input.keyboard.addKeys({
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			w: Phaser.Input.Keyboard.KeyCodes.W,
			s: Phaser.Input.Keyboard.KeyCodes.S,
		})

		// Показываем количество патронов
		this.ammoText = this.add.text(
			60,
			50,
			'Ammo: ' + '|'.repeat(this.currentAmmo),
			{
				fontSize: '20px',
				fill: '#fefe22',
			}
		)

		// Таймер
		this.timer = this.add.text(this.sys.game.config.width - 60, 50, time, {
			fontSize: '20px',
			fill: '#fefe22',
		})

		this.bullets = this.physics.add.group()
		this.enemies = this.physics.add.group()
		this.explosions = this.physics.add.group() // Группа для взрывов

		// Настройка пересечений между пулями и врагами
		this.physics.add.overlap(
			this.bullets,
			this.enemies,
			this.destroyEnemy,
			null,
			this
		)
	}

	update(time, delta) {
		this.handleDirectionInput()
		this.moveShip(delta)
		this.handleShooting(time)
		this.regenerateAmmo(time)
		this.spawnEnemy(time)

		// Удаляем пули, вышедшие за пределы экрана
		this.bullets.getChildren().forEach(bullet => {
			if (bullet.x > this.sys.game.config.width) {
				bullet.destroy()
			}
		})
	}

	handleShooting(time) {
		// Проверяем, прошло ли достаточно времени с момента последнего выстрела
		if (
			this.keys.space.isDown &&
			this.currentAmmo > 0 &&
			time - this.lastShotTime > this.shootDelay
		) {
			const bullet = this.bullets.create(
				this.ship.sprite.x,
				this.ship.sprite.y,
				'ammo'
			)

			// Устанавливаем скорость пули сразу
			bullet.setVelocityX(400)

			// Уменьшаем количество патронов и обновляем текст
			this.currentAmmo--
			this.updateAmmoText()

			// Обновляем время последнего выстрела
			this.lastShotTime = time
		}
	}

	regenerateAmmo(time) {
		if (time - this.lastAmmoRegenTime > 2000) {
			this.currentAmmo = Math.min(
				this.currentAmmo + this.ammoRegenRate,
				this.maxAmmo
			)
			this.lastAmmoRegenTime = time

			this.updateAmmoText()
		}
	}

	updateAmmoText() {
		this.ammoText.setText('Ammo: ' + '|'.repeat(this.currentAmmo))
	}

	getRandomY() {
		const minY = 100
		const maxY = this.sys.game.config.height - this.ship.sprite.height - 30
		return Phaser.Math.Between(minY, maxY)
	}

	spawnEnemy(time) {
		if (time - this.lastEnemySpawnTime > this.enemySpawnDelay) {
			const positionY = this.getRandomY()

			const enemy = this.enemies.create(
				this.sys.game.config.width - 64,
				positionY,
				'greenEnemyShip'
			)

			enemy.setVelocityX(-200)

			this.lastEnemySpawnTime = time
		}
	}

	destroyEnemy(bullet, enemy) {
		// Создаем объект взрыва
		const explosion = this.explosions.create(
			enemy.x,
			enemy.y,
			'greenEnemyShipBlow1'
		)
		explosion.play('greenEnemyShipAnim')

		// Удаляем врага
		enemy.disableBody(true, true)

		// Удаляем пулю
		bullet.destroy()

		// Удаляем объект взрыва после завершения анимации
		explosion.on('animationcomplete', () => {
			explosion.destroy()
		})
	}

	handleDirectionInput() {
		this.direction = null

		if (this.cursors.up.isDown || this.keys.w.isDown) {
			this.direction = 'up'
		} else if (this.cursors.down.isDown || this.keys.s.isDown) {
			this.direction = 'down'
		}
	}

	moveShip(delta) {
		if (!this.direction) {
			return
		}

		if (this.direction === 'up') {
			this.ship.sprite.y -= this.shipSpeed * (delta / 1000)
		} else if (this.direction === 'down') {
			this.ship.sprite.y += this.shipSpeed * (delta / 1000)
		}

		this.ship.sprite.y = Phaser.Math.Clamp(
			this.ship.sprite.y,
			30,
			this.sys.game.config.height - this.ship.sprite.height + 30
		)
	}

	looseGame() {}
	winGame() {}
}

const config = {
	type: Phaser.AUTO,
	width: innerWidth,
	height: innerHeight,
	parent: 'boardContainer',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: false,
		},
	},
	scene: SpaceWar,
}

const game = new Phaser.Game(config)
