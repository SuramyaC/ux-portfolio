// ===== Connected Network Background (Geometric/Polygon Style) =====
const canvas = document.getElementById('dots-canvas');
const ctx = canvas.getContext('2d');

function getColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    dotDark: isDark ? 'rgba(108, 140, 255, 0.5)' : 'rgba(74, 108, 247, 0.25)',
    dotLight: isDark ? 'rgba(108, 140, 255, 0.3)' : 'rgba(74, 108, 247, 0.15)',
    line: isDark ? 'rgba(108, 140, 255, 0.12)' : 'rgba(74, 108, 247, 0.08)',
    lineBold: isDark ? 'rgba(108, 140, 255, 0.22)' : 'rgba(74, 108, 247, 0.14)',
  };
}

// Seeded random for consistent layout
let seed = 77;
function seededRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function generateNodes(width, height) {
  const nodes = [];
  const density = 0.00004; // nodes per square pixel
  const count = Math.floor(width * height * density);

  // Create clusters in top-left and top-right corners (like the inspo image)
  for (let i = 0; i < count; i++) {
    let x, y;
    const zone = seededRandom();

    if (zone < 0.35) {
      // Top-left cluster (denser)
      x = seededRandom() * width * 0.45;
      y = seededRandom() * height * 0.5;
    } else if (zone < 0.6) {
      // Top-right cluster
      x = width * 0.6 + seededRandom() * width * 0.4;
      y = seededRandom() * height * 0.35;
    } else if (zone < 0.8) {
      // Bottom-left sparse
      x = seededRandom() * width * 0.35;
      y = height * 0.5 + seededRandom() * height * 0.5;
    } else {
      // Scattered middle/bottom
      x = seededRandom() * width;
      y = seededRandom() * height;
    }

    nodes.push({
      x,
      y,
      radius: seededRandom() * 2.5 + 1.5,
      isDark: seededRandom() > 0.5,
    });
  }
  return nodes;
}

function drawNetwork() {
  const scrollHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    2000
  );
  canvas.width = window.innerWidth;
  canvas.height = scrollHeight;
  canvas.style.height = scrollHeight + 'px';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const colors = getColors();

  seed = 77; // Reset seed for consistent layout
  const nodes = generateNodes(canvas.width, canvas.height);
  const connectionDistance = 180;
  const boldDistance = 100;

  // Draw connections first (behind dots)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = dist < boldDistance ? colors.lineBold : colors.line;
        ctx.lineWidth = dist < boldDistance ? 1.2 : 0.7;
        ctx.stroke();
      }
    }
  }

  // Draw dots
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.isDark ? colors.dotDark : colors.dotLight;
    ctx.fill();
  });
}

drawNetwork();
window.addEventListener('resize', drawNetwork);
window.addEventListener('load', drawNetwork);

// ===== Dark Mode Toggle =====
const themeToggle = document.querySelector('.theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  drawNetwork(); // Redraw with new colors
}

// Load saved theme or follow system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  setTheme(prefersDark.matches ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Listen for system theme changes
prefersDark.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Scroll-based Staggered Fade-in Animation =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add fade-in class to animatable elements
document.querySelectorAll(
  '.case-card, .method-card, .skill-category, .about-content, .contact-item, .section-title, .section-subtitle, .work-category'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNavLink);

// ===== Back to Top Button Visibility =====
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

// ===== Tilt Effect on Cards =====
const cards = document.querySelectorAll('.case-card');

cards.forEach(card => {
  // Make entire card clickable
  card.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') return; // Let links work normally
    const link = card.querySelector('.case-card-link');
    if (link) window.location.href = link.href;
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
  });
});

// ===== Make Thought Cards Clickable =====
document.querySelectorAll('.thought-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') return;
    const link = card.querySelector('.thought-link');
    if (link) window.location.href = link.href;
  });
});

// ===== Carousel Scroll Buttons =====
document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
  const carousel = wrapper.querySelector('.case-studies-carousel');
  const leftBtn = wrapper.querySelector('.carousel-btn-left');
  const rightBtn = wrapper.querySelector('.carousel-btn-right');
  const scrollAmount = 360;

  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
});
