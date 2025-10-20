document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    
    // Se eliminó la referencia al botón de música
    const pauseToggleBtn = document.getElementById('pauseToggle');
    const restartBtn = document.getElementById('restartBtn');
    
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    let score = 0;
    let elements = [];
    let isPaused = false;
    let animationId = null;

    const gameContainer = document.getElementById('game-container');
    canvas.width = gameContainer.clientWidth;
    canvas.height = window.innerHeight * 0.6;

    window.addEventListener('resize', () => {
        canvas.width = gameContainer.clientWidth;
        canvas.height = window.innerHeight * 0.6;
    });

    const calaveraImg1 = new Image();
    calaveraImg1.src = 'assets/calavera1.png';
    const calaveraImg2 = new Image();
    calaveraImg2.src = 'assets/calavera2.png';
    const images = [calaveraImg1, calaveraImg2]; 

    // Intenta reproducir la música. Si falla, se iniciará con el primer clic del usuario.
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("La reproducción automática fue bloqueada. La música iniciará con la interacción del usuario.");
        });
    }

    class Elemento {
        constructor() {
            this.radius = 30;
            this.width = 60;
            this.height = 60;
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() > 0.5 ? -this.height : canvas.height + this.height;
            this.image = images[Math.floor(Math.random() * images.length)];
            this.speedX = (Math.random() - 0.5) * 4;
            this.speedY = (Math.random() * 2 + 1) * (this.y < 0 ? 1 : -1);
            this.movementType = ['linear', 'sine'][Math.floor(Math.random() * 2)];
            this.angle = 0;
        }
        update() {
            if (this.movementType === 'linear') {
                this.x += this.speedX;
                this.y += this.speedY;
            } else if (this.movementType === 'sine') {
                this.x += this.speedX;
                this.y += this.speedY + Math.sin(this.angle) * 2;
                this.angle += 0.05;
            }
            if (this.x < -this.width || this.x > canvas.width + this.width || this.y < -this.height || this.y > canvas.height + this.height) {
               this.reset();
            }
        }
        draw() {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }

    function init() {
        elements = []; 
        for (let i = 0; i < 15; i++) {
            elements.push(new Elemento());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elements.forEach(el => {
            el.update();
            el.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('click', (event) => {
        // Si la música está pausada (porque el autoplay falló), la iniciamos con el primer clic.
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        }

        if (isPaused) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            const distance = Math.sqrt(Math.pow(mouseX - el.x, 2) + Math.pow(mouseY - el.y, 2));
            
            if (distance < el.radius) {
                elements.splice(i, 1);
                elements.push(new Elemento());
                score++;
                scoreEl.textContent = score;
                break;
            }
        }
    });

    function pauseGame() {
        isPaused = true;
        cancelAnimationFrame(animationId);
        backgroundMusic.pause();
        pauseToggleBtn.textContent = '▶️';
    }

    function resumeGame() {
        isPaused = false;
        backgroundMusic.play(); // Siempre intenta reanudar la música
        pauseToggleBtn.textContent = '⏸️';
        animate();
    }

    function restartGame() {
        cancelAnimationFrame(animationId);
        score = 0;
        scoreEl.textContent = score;
        init();
        isPaused = false;
        pauseToggleBtn.textContent = '⏸️';
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        animate();
    }

    pauseToggleBtn.addEventListener('click', () => {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    restartBtn.addEventListener('click', restartGame);

    init();
    animate();
});
