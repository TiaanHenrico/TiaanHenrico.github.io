// Scroll smooth for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const href = a.getAttribute('href');
    if(href.startsWith('#')){
      e.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
});

// Dynamic curve drawing
const curvesSvg = document.getElementById('curvesSvg');
const pathsGroup = document.getElementById('pathsGroup');
let sections = Array.from(document.querySelectorAll('.timeline-content .panel'));

function sizeSvgToDocument(){
  const docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  const docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
  curvesSvg.setAttribute('width', docW);
  curvesSvg.setAttribute('height', docH);
  curvesSvg.setAttribute('viewBox', `0 0 ${docW} ${docH}`);
}

function updateCurves(){
  // refresh sections in case DOM changed
  sections = Array.from(document.querySelectorAll('.timeline-content .panel'));
  // Set SVG to viewport size for fixed positioning
  curvesSvg.setAttribute('width', window.innerWidth);
  curvesSvg.setAttribute('height', window.innerHeight);
  curvesSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  pathsGroup.innerHTML = '';

  for(let i=0; i<sections.length-1; i++){
    const rect1 = sections[i].getBoundingClientRect();
    const rect2 = sections[i+1].getBoundingClientRect();

    // Use viewport coordinates since SVG is position:fixed
    const x1 = rect1.left + rect1.width/2;
    const y1 = rect1.top + rect1.height/2;
    const x2 = rect2.left + rect2.width/2;
    const y2 = rect2.top + rect2.height/2;

    // Control point for a smooth curve (offset vertically for nicer arcs)
    const controlX = (x1 + x2) / 2;
    const controlY = Math.min(y1, y2) - Math.abs(y2 - y1) * 0.25;

    const pathData = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#d4af37');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '12 8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.style.animation = 'dashFlow 0.8s linear infinite';
    pathsGroup.appendChild(path);

    // Add connection circles
    const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c1.setAttribute('cx', x1);
    c1.setAttribute('cy', y1);
    c1.setAttribute('r', '8');
    c1.setAttribute('fill', '#d4af37');
    c1.setAttribute('opacity', '0.95');
    pathsGroup.appendChild(c1);

    const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c2.setAttribute('cx', x2);
    c2.setAttribute('cy', y2);
    c2.setAttribute('r', '8');
    c2.setAttribute('fill', '#d4af37');
    c2.setAttribute('opacity', '0.95');
    pathsGroup.appendChild(c2);
  }
}

// Rate-limit updates for performance
let updateScheduled = false;
function scheduleUpdate(){
  if(updateScheduled) return;
  updateScheduled = true;
  requestAnimationFrame(()=>{ updateCurves(); updateScheduled = false; });
}

window.addEventListener('scroll', scheduleUpdate, {passive:true});
window.addEventListener('resize', scheduleUpdate);
document.addEventListener('DOMContentLoaded', ()=>{ sizeSvgToDocument(); updateCurves(); });

// Initial draw after a brief delay to ensure layout is complete
setTimeout(()=>{ sizeSvgToDocument(); updateCurves(); }, 200);
