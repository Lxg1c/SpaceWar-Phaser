class SpaceWar extends Phaser.Scene {
	constructor() {
		super()
		this.shipSpeed = 300
		this.direction = null

		this.gameTime = 0

		this.maxAmmo = 20
		this.currentAmmo = this.maxAmmo
		this.ammoRegenerate = 1
		this.lastAmmoRegenTime = 0
		this.ammoRegenRate = 1
		this.lastShotTime = 0
		this.shootDelay = 500

		this.enemySpawnDelay = 2000
		this.lastEnemySpawnTime = 0

		this.currentScore = 0

		this.isPaused = false
		this.hasLost = false
	}

	preload() {
		// Загружаем задний фон
		this.load.image('background', './assets/bg.png')

		// Загружаем корабль игрока
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
			'./assets/greenEnemyShip/ship/greenEnemyShip.png',
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
				frameWidth: 128,
				frameHeight: 128,
			}
		)

		// Огонь двигателя greenEnemyShip
		this.load.image(
			'engineFire1',
			'./assets/greenEnemyShip/engineFire/Ship1_normal_flight_001.png'
		)

		this.load.image(
			'engineFire2',
			'./assets/greenEnemyShip/engineFire/Ship1_normal_flight_002.png'
		)

		this.load.image(
			'engineFire3',
			'./assets/greenEnemyShip/engineFire/Ship1_normal_flight_003.png'
		)

		this.load.image(
			'engineFire4',
			'./assets/greenEnemyShip/engineFire/Ship1_normal_flight_004.png'
		)
	}

	create() {
		// Удаляем старые элементы DOM перед созданием новых
		this.removeDOMElements()

		// Пауза
		this.pauseDiv = document.createElement('div')
		this.pauseDiv.style.position = 'absolute'
		this.pauseDiv.style.top = '50%'
		this.pauseDiv.style.left = '50%'
		this.pauseDiv.style.transform = 'translate(-50%, -50%)'
		this.pauseDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
		this.pauseDiv.style.border = '1px solid #fff'
		this.pauseDiv.style.color = '#fff'
		this.pauseDiv.style.opacity = '0.8'
		this.pauseDiv.style.padding = '20px'
		this.pauseDiv.style.borderRadius = '10px'
		this.pauseDiv.style.fontFamily = 'Jersey 15, sans-serif'
		this.pauseDiv.style.fontSize = '24px'
		this.pauseDiv.style.textAlign = 'center'
		this.pauseDiv.style.display = 'none'
		this.pauseDiv.innerText =
			'Pause\n\nPress ESC to continue\n Press R to restart'

		// Добавляем элемент на страницу
		document.body.appendChild(this.pauseDiv)

		// Меню проигрыша
		this.looseDiv = document.createElement('div')
		this.looseDiv.style.position = 'absolute'
		this.looseDiv.style.top = '50%'
		this.looseDiv.style.left = '50%'
		this.looseDiv.style.transform = 'translate(-50%, -50%)'
		this.looseDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8'
		this.looseDiv.style.opacity = '0.8'
		this.looseDiv.style.padding = '20px'
		this.looseDiv.style.border = '1px solid #fff'
		this.looseDiv.style.color = 'red'
		this.looseDiv.style.fontFamily = 'Jersey 15, sans-serif'
		this.looseDiv.style.fontSize = '24px'
		this.looseDiv.style.textAlign = 'center'
		this.looseDiv.style.display = 'none'

		document.body.appendChild(this.looseDiv)

		// Состояние паузы
		this.isPaused = false

		// Создаем задний фон
		const bg = this.add.image(0, 0, 'background').setOrigin(0, 0)
		bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)

		// Создаем анимацию корабля
		this.anims.create({
			key: 'shipAnimation',
			frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
			frameRate: 6,
			repeat: -1,
		})

		// Создаем анимацию взрыва
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

		// Анимация двигателя врагов
		this.anims.create({
			key: 'greenEnemyShipEngineFireAnim',
			frames: [
				{ key: 'engineFire1' },
				{ key: 'engineFire2' },
				{ key: 'engineFire3' },
				{ key: 'engineFire4' },
			],
			frameRate: 4,
			repeat: -1,
		})

		// Размещаем корабль игрока и запускаем его анимацию
		this.ship = { sprite: this.physics.add.sprite(200, 400, 'ship') }
		this.ship.sprite.anims.play('shipAnimation')

		// Отслеживаем нажимаемые клавиши
		this.cursors = this.input.keyboard.createCursorKeys()
		this.keys = this.input.keyboard.addKeys({
			space: Phaser.Input.Keyboard.KeyCodes.SPACE,
			w: Phaser.Input.Keyboard.KeyCodes.W,
			s: Phaser.Input.Keyboard.KeyCodes.S,
			esc: Phaser.Input.Keyboard.KeyCodes.ESC,
		})

		// Показываем количество патронов
		this.ammoTextDiv = document.createElement('div')
		this.ammoTextDiv.style.position = 'absolute'
		this.ammoTextDiv.style.top = '50px'
		this.ammoTextDiv.style.left = '60px'
		this.ammoTextDiv.style.fontFamily = 'Jersey 15, sans-serif'
		this.ammoTextDiv.style.fontSize = '20px'
		this.ammoTextDiv.style.color = '#fefe22'
		this.ammoTextDiv.style.textAlign = 'left'
		this.ammoTextDiv.innerText = 'Ammo: ' + '|'.repeat(this.currentAmmo)

		document.body.appendChild(this.ammoTextDiv)

		// Счет
		this.scoreDiv = document.createElement('div')
		this.scoreDiv.style.position = 'absolute'
		this.scoreDiv.style.top = '50px'
		this.scoreDiv.style.left = '50%'
		this.scoreDiv.style.transform = 'translateX(-50%)'
		this.scoreDiv.style.fontFamily = 'Jersey 15, sans-serif'
		this.scoreDiv.style.fontSize = '32px'
		this.scoreDiv.style.color = '#fefe22'
		this.scoreDiv.style.textAlign = 'center'
		this.scoreDiv.innerText = `${this.currentScore}`

		document.body.appendChild(this.scoreDiv)

		// Таймер
		this.timerDiv = document.createElement('div')
		this.timerDiv.style.position = 'absolute'
		this.timerDiv.style.top = '50px'
		this.timerDiv.style.right = '140px'
		this.timerDiv.style.fontFamily = 'Jersey 15, sans-serif'
		this.timerDiv.style.fontSize = '20px'
		this.timerDiv.style.color = '#fefe22'
		this.timerDiv.style.textAlign = 'right'
		this.timerDiv.innerText = '00:00'

		document.body.appendChild(this.timerDiv)

		// Группы
		this.bullets = this.physics.add.group()
		this.enemies = this.physics.add.group()
		this.enemyEngineFires = this.add.group()
		this.explosions = this.physics.add.group()

		// Настройка пересечений между пулями и врагами
		this.physics.add.overlap(
			this.bullets,
			this.enemies,
			this.destroyEnemy,
			null,
			this
		)

		// Обработчик нажатия клавиши "Esc"
		this.input.keyboard.on('keydown-ESC', () => {
			this.togglePause()
		})

		// Обработчик событий клавиши R
		this.input.keyboard.on('keydown-R', () => {
			this.restartGame()
		})
	}

	// Логика игры
	update(time, delta) {
		if (this.isPaused || this.hasLost) {
			return
		}

		this.handleDirectionInput()
		this.moveShip(delta)
		this.handleShooting(time)
		this.regenerateAmmo(time)
		this.spawnEnemy(time)

		// Обновляем время игры
		this.gameTime += delta
		this.updateTimer(this.gameTime)

		this.updateEnemy()
		this.checkBullets()
		this.isLooseGame()
	}

	restartGame() {
		// Сброс состояния игры
		this.isPaused = false
		this.hasLost = false
		this.currentScore = 0
		this.currentAmmo = this.maxAmmo
		this.lastShotTime = 0
		this.lastAmmoRegenTime = 0
		this.lastEnemySpawnTime = 0

		// Сброс времени игры
		this.gameTime = 0

		// Скрываем элементы интерфейса
		this.pauseDiv.style.display = 'none'
		this.looseDiv.style.display = 'none'

		// Сбрасываем таймер на 00:00
		this.timerDiv.innerText = '00:00'

		// Перезапуск сцены
		this.scene.restart()
	}

	// Удаление старых элементов DOM
	removeDOMElements() {
		if (this.pauseDiv && this.pauseDiv.parentNode) {
			this.pauseDiv.parentNode.removeChild(this.pauseDiv)
		}
		if (this.looseDiv && this.looseDiv.parentNode) {
			this.looseDiv.parentNode.removeChild(this.looseDiv)
		}
		if (this.ammoTextDiv && this.ammoTextDiv.parentNode) {
			this.ammoTextDiv.parentNode.removeChild(this.ammoTextDiv)
		}
		if (this.scoreDiv && this.scoreDiv.parentNode) {
			this.scoreDiv.parentNode.removeChild(this.scoreDiv)
		}
		if (this.timerDiv && this.timerDiv.parentNode) {
			this.timerDiv.parentNode.removeChild(this.timerDiv)
		}
	}

	// Вызов паузы
	togglePause() {
		this.isPaused = !this.isPaused
		this.pauseDiv.style.display = this.isPaused ? 'block' : 'none'

		// Pause or resume physics (unchanged)
		if (this.isPaused) {
			this.pausePhysics()
		} else {
			this.resumePhysics()
		}
	}

	pausePhysics() {
		// Останавливаем врагов
		this.enemies.getChildren().forEach(enemy => {
			enemy.setVelocity(0)
		})

		// Останавливаем пули
		this.bullets.getChildren().forEach(bullet => {
			bullet.setVelocity(0)
		})
	}

	resumePhysics() {
		// Возобновляем движение врагов
		this.enemies.getChildren().forEach(enemy => {
			enemy.setVelocityX(-200)
		})

		// Возобновляем движение пуль
		this.bullets.getChildren().forEach(bullet => {
			bullet.setVelocityX(400)
		})
	}

	// Удаляем пули, вышедшие за пределы экрана
	checkBullets() {
		this.bullets.getChildren().forEach(bullet => {
			if (bullet.x > this.sys.game.config.width) {
				bullet.destroy()
			}
		})
	}

	// Обновление таймера
	updateTimer(time) {
		// Преобразуем время в формат минуты:секунды
		const minutes = Math.floor(time / 60000)
		const seconds = Math.floor((time % 60000) / 1000)
		this.timerDiv.innerText = `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`
	}

	// Стрельба игрока
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

	// Восстановление патронов
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
		this.ammoTextDiv.innerText = 'Ammo: ' + '|'.repeat(this.currentAmmo)
	}

	updateScore() {
		this.scoreDiv.innerText = `${this.currentScore}`
	}

	// Получаем место случайное расположение врага
	getRandomY() {
		const minY = 100
		const maxY = this.sys.game.config.height - this.ship.sprite.height - 30
		return Phaser.Math.Between(minY, maxY)
	}

	// Spawn-им врага
	spawnEnemy(time) {
		if (time - this.lastEnemySpawnTime > this.enemySpawnDelay) {
			const positionY = this.getRandomY()

			const enemy = this.enemies.create(
				this.sys.game.config.width + 64,
				positionY,
				'greenEnemyShip'
			)

			enemy.setVelocityX(-200)

			// Создаем огонь двигателя для врага
			const engineFire = this.enemyEngineFires.create(
				enemy.x,
				enemy.y + 32, // Под врагом
				'engineFire1'
			)
			engineFire.setOrigin(0.5, 0.5)
			engineFire.anims.play('greenEnemyShipEngineFireAnim')

			// Связываем огонь двигателя с врагом
			enemy.engineFire = engineFire

			this.lastEnemySpawnTime = time
		}
	}

	// Создаем группу анимации двигателя и корабля
	updateEnemy() {
		this.enemies.getChildren().forEach(enemy => {
			if (enemy.engineFire) {
				enemy.engineFire.setPosition(enemy.x + 32, enemy.y)
			}
		})
	}

	// Уничтожение врага при столкновении с патроном
	destroyEnemy(bullet, enemy) {
		// Удаляем огонь двигателя врага
		if (enemy.engineFire) {
			enemy.engineFire.destroy()
		}

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

		// Добавляем очки
		this.currentScore++

		// Обновляем значение очков
		this.updateScore()

		// Удаляем объект взрыва после завершения анимации
		explosion.on('animationcomplete', () => {
			explosion.destroy()
		})
	}

	// Определяем направление движение корабля игрока
	handleDirectionInput() {
		this.direction = null

		if (this.cursors.up.isDown || this.keys.w.isDown) {
			this.direction = 'up'
		} else if (this.cursors.down.isDown || this.keys.s.isDown) {
			this.direction = 'down'
		}
	}

	// Перемещаем корабль
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

	// Проигрыш
	isLooseGame() {
		this.enemies.getChildren().forEach(enemy => {
			if (enemy.x < this.ship.sprite.x) {
				console.log('Loose')
				this.hasLost = true
				console.log(this.hasLost)

				this.pausePhysics()

				if (localStorage.getItem('bestScore') < this.currentScore) {
					localStorage.setItem('bestScore', this.currentScore)
				}

				// Сброс времени игры
				this.gameTime = 0

				// Сбрасываем таймер на 00:00
				this.timerDiv.innerText = '00:00'

				this.looseDiv.innerText = `YOU LOOSE\n\n Your score: ${
					this.currentScore
				}\n Your Best Score: ${localStorage.getItem(
					'bestScore'
				)}\n\nPress R to restart`
				this.looseDiv.style.display = 'block'
			}
		})
	}
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
