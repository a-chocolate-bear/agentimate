// Animated typing effect for the input field
const inputEl = document.getElementById('animated-input');
const card = document.getElementById('floating-card');
const lines = [
  card.querySelector('.component-line'),
  card.querySelector('.component-line.short'),
  card.querySelector('.component-line.tiny'),
];
const cardCTA = document.getElementById('card-cta-btn');

const typingSequences = [
  {
    text: "Make it horizontal, and make it black to blue gradient with a call to action",
    cardClass: 'horizontal',
    lineWidths: ['80%', '55%', '35%'],
    showCTA: true,
    glow: false
  },
  {
    text: "Make it glow",
    cardClass: 'horizontal glow',
    lineWidths: ['80%', '55%', '35%'],
    showCTA: true,
    glow: true
  }
];

let seqIdx = 0;

function typeText(text, cb) {
  let idx = 0;
  function typeChar() {
    if (idx <= text.length) {
      inputEl.innerHTML = text.slice(0, idx) + '<span class="caret">|</span>';
      idx++;
      setTimeout(typeChar, (90 + Math.random() * 60) * 0.5);
    } else {
      inputEl.innerHTML = text;
      setTimeout(cb, 350);
    }
  }
  typeChar();
}

// Caret blink
if (!document.getElementById('caret-style')) {
  const style = document.createElement('style');
  style.id = 'caret-style';
  style.innerHTML = `.caret { display: inline-block; width: 1ch; animation: blink 0.5s steps(1) infinite; }\n@keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }`;
  document.head.appendChild(style);
}

function animateCard(seq, cb) {
  card.classList.remove('vertical', 'horizontal', 'glow');
  // Always use vertical style
  card.classList.add('vertical');
  // Animate lines
  setTimeout(() => {
    lines[0].style.width = seq.lineWidths[0];
    lines[1].style.width = seq.lineWidths[1];
    lines[2].style.width = seq.lineWidths[2];
    // Show/hide CTA
    if (seq.showCTA) {
      cardCTA.style.display = 'block';
    } else {
      cardCTA.style.display = 'none';
    }
    setTimeout(cb, 600);
  }, 200);
}

function loopSequence() {
  const seq = typingSequences[seqIdx % typingSequences.length];
  typeText(seq.text, () => {
    animateCard(seq, () => {
      seqIdx = (seqIdx + 1) % typingSequences.length;
      setTimeout(loopSequence, 1200);
    });
  });
}

loopSequence();

// Optionally, you can add a little bounce or color change on hover
card.addEventListener('mouseenter', () => {
  card.style.boxShadow = '0 24px 80px 0 rgba(97,195,255,0.22), 0 2px 16px 0 rgba(255,75,75,0.18)';
});
card.addEventListener('mouseleave', () => {
  card.style.boxShadow = '';
});
// Keyboard accessibility for card hover/glow
card.addEventListener('focus', () => {
  card.classList.add('keyboard-focus');
  card.style.boxShadow = '0 24px 80px 0 rgba(97,195,255,0.22), 0 2px 16px 0 rgba(255,75,75,0.18)';
});
card.addEventListener('blur', () => {
  card.classList.remove('keyboard-focus');
  card.style.boxShadow = '';
});
card.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    card.classList.toggle('glow');
    e.preventDefault();
  }
});

// --- Assembling Demo Animation ---
// Remove SVG animation logic and implement grid staggering animation
import { createTimeline, utils, stagger } from '../lib/anime.esm.js';

const gridContainer = document.querySelector('.grid-stagger');
const cardEl = document.querySelector('.website-component-card');
const cardHeader = cardEl?.querySelector('.card-header');
const cardLines = cardEl?.querySelectorAll('.card-line');
const cardAction = cardEl?.querySelector('.card-action');

const gridRows = 8;
const gridCols = 12;
const dotSize = 12;
const dotGap = 8;
const gridDots = [];

function createGrid() {
  gridContainer.innerHTML = '';
  gridDots.length = 0;
  gridContainer.style.position = 'absolute';
  gridContainer.style.left = '50%';
  gridContainer.style.top = '50%';
  gridContainer.style.transform = 'translate(-50%, -50%)';
  gridContainer.style.width = `${gridCols * (dotSize + dotGap)}px`;
  gridContainer.style.height = `${gridRows * (dotSize + dotGap)}px`;
  gridContainer.style.display = 'grid';
  gridContainer.style.gridTemplateRows = `repeat(${gridRows}, ${dotSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, ${dotSize}px)`;
  gridContainer.style.justifyContent = 'center';
  gridContainer.style.alignItems = 'center';
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const dot = document.createElement('div');
      dot.className = 'grid-dot';
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.borderRadius = '50%';
      dot.style.background = '#FF4B4B';
      dot.style.margin = `${dotGap/2}px`;
      dot.style.opacity = '1';
      dot.style.position = 'relative';
      dot.style.transform = 'scale(1)';
      gridContainer.appendChild(dot);
      gridDots.push({dot, r, c});
    }
  }
}

function animateGridStagger() {
  cardEl.style.display = 'none';
  createGrid();
  // Center of grid
  const centerR = (gridRows-1)/2;
  const centerC = (gridCols-1)/2;
  // Explode out to 50%
  const timeline = createTimeline({
    defaults: {ease: 'outCubic'},
    onComplete: () => setTimeout(reverseGridStagger, 300)
  });
  gridDots.forEach(({dot, r, c}, i) => {
    const dx = c - centerC;
    const dy = r - centerR;
    const dist = Math.sqrt(dx*dx + dy*dy);
    timeline.add(dot, {
      x: dx * 20, // 50% of previous 40
      y: dy * 20,
      scale: 1.1,
      opacity: 1,
      duration: 350 + dist*20,
      delay: dist*20
    }, 0);
  });
}

function reverseGridStagger() {
  // Center of grid
  const centerR = (gridRows-1)/2;
  const centerC = (gridCols-1)/2;
  const timeline = createTimeline({
    defaults: {ease: 'inCubic'},
    onComplete: () => setTimeout(() => {
      // Animate dots fading out while card grows and fades in
      // Get grid size and position
      const gridRect = gridContainer.getBoundingClientRect();
      const parentRect = gridContainer.parentElement.getBoundingClientRect();
      // Set card to grid size/position
      cardEl.style.display = 'flex';
      cardEl.style.opacity = '0';
      cardEl.style.width = gridRect.width + 'px';
      cardEl.style.height = gridRect.height + 'px';
      cardEl.style.left = ((gridRect.left + gridRect.width/2) - parentRect.left) / parentRect.width * 100 + '%';
      cardEl.style.top = ((gridRect.top + gridRect.height/2) - parentRect.top) / parentRect.height * 100 + '%';
      cardEl.style.transform = 'translate(-50%, -50%) scale(1)';
      cardEl.style.padding = '16px';
      // Animate dots out
      let dotsFaded = 0;
      gridDots.forEach(({dot}, i) => {
        createTimeline().add(dot, {
          opacity: 0,
          duration: 400,
          delay: 0,
          complete: () => {
            dotsFaded++;
            if (dotsFaded === gridDots.length) {
              gridContainer.innerHTML = '';
            }
          }
        });
      });
      // Animate card to full size and fade in
      createTimeline().add(cardEl, {
        opacity: 1,
        width: ['' + gridRect.width + 'px', '90vw'],
        height: ['' + gridRect.height + 'px', '220px'],
        padding: ['16px', '2.2rem'],
        duration: 500,
        easing: 'outCubic',
        complete: () => setTimeout(() => {
          cardEl.style.display = 'none';
          setTimeout(animateGridStagger, 600);
        }, 1200)
      });
    }, 200)
  });
  gridDots.forEach(({dot, r, c}, i) => {
    const dx = c - centerC;
    const dy = r - centerR;
    const dist = Math.sqrt(dx*dx + dy*dy);
    timeline.add(dot, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 350 + dist*20,
      delay: dist*20
    }, 0);
  });
}

function convergeToCard() {
  // Card position and size
  const cardRect = cardEl.getBoundingClientRect();
  const gridRect = gridContainer.getBoundingClientRect();
  // Animate dots to card area
  let completed = 0;
  gridDots.forEach(({dot, r, c}, i) => {
    // Map dots to card area (roughly)
    const fracR = r / (gridRows-1);
    const fracC = c / (gridCols-1);
    const targetX = (cardRect.left - gridRect.left) + fracC * cardRect.width;
    const targetY = (cardRect.top - gridRect.top) + fracR * cardRect.height;
    createTimeline().add(dot, {
      x: targetX - dot.offsetLeft,
      y: targetY - dot.offsetTop,
      scale: 0.9,
      background: '#FF4B4B',
      duration: 600,
      ease: 'inOutCubic',
      complete: () => {
        completed++;
        if (completed === gridDots.length) showCardDetails();
      }
    });
  });
}

function showCardDetails() {
  cardEl.style.display = 'flex';
  cardEl.style.opacity = '0';
  createTimeline().add(cardEl, {
    opacity: 1,
    duration: 400,
    complete: () => setTimeout(resetGridStagger, 1200)
  });
}

function resetGridStagger() {
  cardEl.style.display = 'none';
  gridContainer.innerHTML = '';
  setTimeout(animateGridStagger, 600);
}

// Start the loop
setTimeout(animateGridStagger, 1000); 