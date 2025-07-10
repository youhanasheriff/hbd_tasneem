const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor(x, y, isFirework = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 3;
    this.speedX = (Math.random() - 0.5) * 12;
    this.speedY = (Math.random() - 0.5) * 12;
    this.color = `hsl(${Math.random() * 360}, 100%, ${
      50 + Math.random() * 30
    }%)`;
    this.life = 120;
    this.maxLife = 120;
    this.gravity = 0.1;
    this.friction = 0.98;
    this.isFirework = isFirework;
    this.trail = [];
  }

  update() {
    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y, life: 10 });
    if (this.trail.length > 8) this.trail.shift();

    // Update trail
    this.trail.forEach(point => point.life--);
    this.trail = this.trail.filter(point => point.life > 0);

    this.speedX *= this.friction;
    this.speedY *= this.friction;
    this.speedY += this.gravity;

    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    this.size *= 0.97;
  }

  draw() {
    // Draw trail
    this.trail.forEach((point, index) => {
      const alpha = (point.life / 10) * (this.life / this.maxLife) * 0.5;
      const size = this.size * (point.life / 10) * 0.5;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    });

    // Draw main particle
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Add inner bright core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.restore();
  }
}

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.createExplosion();
  }

  createExplosion() {
    const particleCount = 30 + Math.random() * 20;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.x, this.y, true));
    }
  }

  update() {
    this.particles.forEach((particle, index) => {
      particle.update();
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  draw() {
    this.particles.forEach(particle => particle.draw());
  }

  isDead() {
    return this.particles.length === 0;
  }
}

let fireworks = [];
let animationId;

function createRandomFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.1;
  fireworks.push(new Firework(x, y));
}

function animateFireworks() {
  ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach((firework, index) => {
    firework.update();
    firework.draw();
    if (firework.isDead()) {
      fireworks.splice(index, 1);
    }
  });

  if (fireworks.length > 0) {
    animationId = requestAnimationFrame(animateFireworks);
  } else {
    showMessages();
  }
}

function showMessages() {
  // First message animation
  anime({
    targets: '#message1',
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 1500,
    easing: 'easeOutElastic(1, .8)',
    complete: () => {
      // Add floating animation to first message
      anime({
        targets: '#message1',
        translateY: [-5, 5],
        duration: 2000,
        direction: 'alternate',
        loop: 3,
        easing: 'easeInOutSine',
      });

      setTimeout(() => {
        // Fade out first message
        anime({
          targets: '#message1',
          opacity: [1, 0],
          scale: [1, 0.8],
          duration: 1000,
          easing: 'easeInQuad',
          complete: () => {
            // Show second message
            anime({
              targets: '#message2',
              opacity: [0, 1],
              scale: [0.5, 1],
              rotateY: [90, 0],
              duration: 1500,
              easing: 'easeOutElastic(1, .8)',
              complete: () => {
                // Add continuous floating to second message
                anime({
                  targets: '#message2',
                  translateY: [-8, 8],
                  duration: 3000,
                  direction: 'alternate',
                  loop: true,
                  easing: 'easeInOutSine',
                });
              },
            });
          },
        });
      }, 4000);
    },
  });
}

// Enhanced button click handler
document.getElementById('clickButton').addEventListener('click', () => {
  const button = document.getElementById('clickButton');

  // Animate button disappearing
  anime({
    targets: button,
    scale: [1, 0],
    opacity: [1, 0],
    duration: 500,
    easing: 'easeInBack',
    complete: () => {
      button.style.display = 'none';
    },
  });

  // Create multiple fireworks with delays
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createRandomFirework();
      if (i === 0) {
        animateFireworks();
      }
    }, i * 300);
  }
});

// Add some ambient particles on load
function createAmbientEffect() {
  const ambientParticles = [];

  for (let i = 0; i < 20; i++) {
    ambientParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
      alpha: Math.random() * 0.5 + 0.2,
    });
  }

  function animateAmbient() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ambientParticles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.restore();
    });

    if (fireworks.length === 0) {
      requestAnimationFrame(animateAmbient);
    }
  }

  animateAmbient();
}

// Start ambient effect on load
createAmbientEffect();
