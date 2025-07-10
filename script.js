const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor(x, y, isFirework = false, isAnime = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * (isAnime ? 8 : 6) + (isAnime ? 4 : 3);
    this.speedX = (Math.random() - 0.5) * (isAnime ? 15 : 12);
    this.speedY = (Math.random() - 0.5) * (isAnime ? 15 : 12);
    
    if (isAnime) {
      // Anime-style vibrant colors
      const colors = [
        '#FF1493', '#00FFFF', '#FFD700', '#FF69B4', '#00FF00',
        '#FF4500', '#9370DB', '#00BFFF', '#FF6347', '#32CD32',
        '#FF1493', '#FFFF00', '#FF69B4', '#00CED1', '#FFA500'
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.shape = Math.random() > 0.5 ? 'star' : 'circle';
      this.sparkle = Math.random() > 0.7;
    } else {
      this.color = `hsl(${Math.random() * 360}, 100%, ${50 + Math.random() * 30}%)`;
      this.shape = 'circle';
      this.sparkle = false;
    }
    
    this.life = isAnime ? 150 : 120;
    this.maxLife = this.life;
    this.gravity = isAnime ? 0.08 : 0.1;
    this.friction = 0.98;
    this.isFirework = isFirework;
    this.isAnime = isAnime;
    this.trail = [];
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
  }

  update() {
    // Add current position to trail
    const trailLength = this.isAnime ? 12 : 8;
    this.trail.push({ x: this.x, y: this.y, life: this.isAnime ? 15 : 10, size: this.size });
    if (this.trail.length > trailLength) this.trail.shift();

    // Update trail
    this.trail.forEach(point => point.life--);
    this.trail = this.trail.filter(point => point.life > 0);

    this.speedX *= this.friction;
    this.speedY *= this.friction;
    this.speedY += this.gravity;
    
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 1;
    this.size *= this.isAnime ? 0.985 : 0.97;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    // Draw trail
    this.trail.forEach((point, index) => {
      const maxLife = this.isAnime ? 15 : 10;
      const alpha = (point.life / maxLife) * (this.life / this.maxLife) * 0.5;
      const size = (point.size || this.size) * (point.life / maxLife) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (this.isAnime && this.shape === 'star') {
        this.drawStar(point.x, point.y, size * 0.7, this.color);
      } else {
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw main particle
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Enhanced glow effect for anime particles
    if (this.isAnime) {
      ctx.shadowBlur = 25;
      ctx.shadowColor = this.color;
      
      // Add sparkle effect
      if (this.sparkle && Math.random() > 0.7) {
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#FFFFFF';
      }
    } else {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
    }
    
    // Draw shape based on type
    if (this.shape === 'star') {
      this.drawStar(this.x, this.y, this.size, this.color);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    
    // Add inner bright core
    ctx.shadowBlur = 0;
    if (this.shape === 'star') {
      this.drawStar(this.x, this.y, this.size * 0.4, 'white');
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  drawStar(x, y, size, color) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = color;
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

class AnimeFirework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.createExplosion();
  }

  createExplosion() {
    const particleCount = 50 + Math.random() * 30;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.x, this.y, true, true));
    }
    
    // Add some extra sparkle particles
    for (let i = 0; i < 20; i++) {
      const sparkle = new Particle(this.x, this.y, true, true);
      sparkle.size *= 0.5;
      sparkle.life *= 1.5;
      sparkle.sparkle = true;
      this.particles.push(sparkle);
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

function createAnimeFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.1;
  fireworks.push(new AnimeFirework(x, y));
}

function createRocketExplosion(x, y) {
  // Create a massive explosion at rocket impact
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      fireworks.push(new AnimeFirework(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 50));
    }, i * 200);
  }
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
                // Add floating animation to second message
                anime({
                  targets: '#message2',
                  translateY: [-8, 8],
                  duration: 3000,
                  direction: 'alternate',
                  loop: 3,
                  easing: 'easeInOutSine',
                });
                
                setTimeout(() => {
                  // Fade out second message
                  anime({
                    targets: '#message2',
                    opacity: [1, 0],
                    scale: [1, 0.8],
                    duration: 1000,
                    easing: 'easeInQuad',
                    complete: () => {
                      // Show third message
                      anime({
                        targets: '#message3',
                        opacity: [0, 1],
                        scale: [0.5, 1],
                        rotateX: [90, 0],
                        duration: 1500,
                        easing: 'easeOutElastic(1, .8)',
                        complete: () => {
                          // Add continuous floating to third message
                          anime({
                            targets: '#message3',
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
          },
        });
      }, 4000);
    },
  });
}

// Enhanced button click handler with rocket animation
document.getElementById('clickButton').addEventListener('click', () => {
  const button = document.getElementById('clickButton');
  
  // Create rocket trail effect
  const trail = document.createElement('div');
  trail.className = 'rocket-trail';
  document.body.appendChild(trail);
  
  const buttonRect = button.getBoundingClientRect();
  trail.style.left = (buttonRect.left + buttonRect.width / 2) + 'px';
  trail.style.top = buttonRect.top + 'px';
  
  // Rocket launch animation
  anime({
    targets: button,
    translateY: -window.innerHeight - 200,
    scale: [1, 0.3],
    rotate: [0, 360],
    duration: 1500,
    easing: 'easeInQuart',
    complete: () => {
      button.style.display = 'none';
      // Create explosion at the top
      createRocketExplosion(window.innerWidth / 2, 100);
    }
  });
  
  // Animate rocket trail
  anime({
    targets: trail,
    height: [0, window.innerHeight],
    opacity: [0.8, 0],
    duration: 1500,
    easing: 'easeOutQuart',
    complete: () => {
      trail.remove();
    }
  });
  
  // Start enhanced fireworks show
  setTimeout(() => {
    startEnhancedFireworksShow();
  }, 800);
});

function startEnhancedFireworksShow() {
  // Create multiple anime fireworks with varied timing
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createAnimeFirework();
      if (i === 0) {
        animateFireworks();
      }
    }, i * 300 + Math.random() * 200);
  }
  
  // Add some regular fireworks for variety
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createRandomFirework();
    }, i * 500 + 1000);
  }
}

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
