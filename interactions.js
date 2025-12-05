/* ===================================
   ADVANCED INTERACTIVITY
   - 3D Tilt Effect
   - Magnetic Button
   - Custom Cursor
=================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTiltEffect();
    // initMagneticButtons(); // Disabled per user request
    initCustomCursor();
});

/* -----------------------------------------
   3D TILT EFFECT
   Makes the glass card tilt towards mouse
----------------------------------------- */
function initTiltEffect() {
    const container = document.querySelector('.container');
    const content = document.querySelector('.content-wrapper');

    if (!container || !content) return;

    // Add perspective to container
    container.style.perspective = '1000px';
    content.style.transformStyle = 'preserve-3d';

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return; // Disable on mobile

        const x = e.clientX;
        const y = e.clientY;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Calculate rotation (max 15 degrees)
        const rotateX = -((y - h / 2) / h) * 15;
        const rotateY = ((x - w / 2) / w) * 15;

        // requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
            content.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                scale3d(1.02, 1.02, 1.02)
            `;
        });
    });

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        content.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
}

/* -----------------------------------------
   MAGNETIC BUTTON (DISABLED)
----------------------------------------- */
// function initMagneticButtons() {
//     const buttons = document.querySelectorAll('.launch-btn');
//
//     buttons.forEach(btn => {
//         btn.addEventListener('mousemove', (e) => {
//             const rect = btn.getBoundingClientRect();
//             const x = e.clientX - rect.left - rect.width / 2;
//             const y = e.clientY - rect.top - rect.height / 2;
//
//             // Magnetic strength
//             const strength = 0.4;
//
//             btn.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.1)`;
//             btn.querySelector('.btn-content').style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
//         });
//
//         btn.addEventListener('mouseleave', () => {
//             btn.style.transform = 'translate(0, 0) scale(1)';
//             btn.querySelector('.btn-content').style.transform = 'translate(0, 0)';
//         });
//     });
// }

/* -----------------------------------------
   CUSTOM GLOWING CURSOR
----------------------------------------- */
function initCustomCursor() {
    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    const cursorDot = document.createElement('div');
    cursorDot.classList.add('cursor-dot');

    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    // Movement logic
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant move for dot
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;
    });

    // Smooth trailing for main glow
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.25; // Smooth factor increased for responsiveness
        cursorY += dy * 0.25;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate3d(-50%, -50%, 0)`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states
    const clickables = document.querySelectorAll('button, a, input, .logo-circle');

    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorDot.classList.add('cursor-hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursorDot.classList.remove('cursor-hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
        }
    });

    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
    });
}
