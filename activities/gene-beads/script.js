const BEADS = {
  star: { id: 'star', name: '노란 별 구슬', color: '#f59e0b', codes: ['AUG'] },
  circle: { id: 'circle', name: '파란 원형 구슬', color: '#3b82f6', codes: ['GAA', 'GAG'] },
  triangle: { id: 'triangle', name: '초록 세모 구슬', color: '#10b981', codes: ['CUU', 'CUC', 'CUA'] },
  square: { id: 'square', name: '보라 네모 구슬', color: '#8b5cf6', codes: ['CCU', 'CCC'] },
  diamond: { id: 'diamond', name: '빨간 마름모 구슬', color: '#f43f5e', codes: ['CAU', 'CAC'] }
};

const CODE_TO_BEAD = {};
Object.values(BEADS).forEach(b => {
  b.codes.forEach(c => { CODE_TO_BEAD[c] = b.id; });
});

function getBeadSVG(beadId, size = 54) {
  const b = BEADS[beadId];
  if (!b) return '';
  let shape = '';
  if (beadId === 'star') {
    shape = `<polygon points="28,5 34,19 49,20 38,30 41,45 28,37 15,45 18,30 7,20 22,19" fill="${b.color}" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>`;
  } else if (beadId === 'circle') {
    shape = `<circle cx="28" cy="28" r="20" fill="${b.color}" stroke="#1d4ed8" stroke-width="2"/>`;
  } else if (beadId === 'triangle') {
    shape = `<polygon points="28,7 48,44 8,44" fill="${b.color}" stroke="#047857" stroke-width="2" stroke-linejoin="round"/>`;
  } else if (beadId === 'square') {
    shape = `<rect x="10" y="10" width="36" height="36" rx="7" fill="${b.color}" stroke="#5b21b6" stroke-width="2"/>`;
  } else if (beadId === 'diamond') {
    shape = `<polygon points="28,6 49,28 28,50 7,28" fill="${b.color}" stroke="#be123c" stroke-width="2" stroke-linejoin="round"/>`;
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56">
      ${shape}
      <circle cx="28" cy="28" r="4.5" fill="#ffffff" opacity="0.85"/>
    </svg>
  `;
}

// ==================== 1단계: 연습 ====================
const practiceSequence = ['A','U','G','G','A','A','C','U','U','C','C','U','G','A','G'];
const practiceTriplets = ['AUG', 'GAA', 'CUU', 'CCU', 'GAG'];
let sliceCuts = new Set();
let practiceSlots = [null, null, null, null, null];
let selectedBeadId = null;

function renderSlicer() {
  const stream = document.getElementById('letter-stream');
  stream.innerHTML = '';
  practiceSequence.forEach((letter, idx) => {
    const tile = document.createElement('div');
    tile.className = 'base-tile';
    tile.dataset.b = letter;
    tile.textContent = letter;
    stream.appendChild(tile);

    if (idx < practiceSequence.length - 1) {
      const gap = document.createElement('div');
      gap.className = 'slice-gap' + (sliceCuts.has(idx) ? ' cut' : '');
      gap.onclick = () => {
        sliceCuts.has(idx) ? sliceCuts.delete(idx) : sliceCuts.add(idx);
        renderSlicer();
      };
      stream.appendChild(gap);
    }
  });

  const correctPositions = [2, 5, 8, 11];
  const isAllCorrect = correctPositions.every(p => sliceCuts.has(p)) && sliceCuts.size === 4;
  const statusEl = document.getElementById('slice-status');

  if (isAllCorrect) {
    statusEl.innerHTML = `<span style="color:var(--success);">✅ 완벽합니다! 15개의 글자가 3글자씩 5묶음(AUG / GAA / CUU / CCU / GAG)으로 정확히 나뉘었습니다.</span>`;
  } else {
    statusEl.textContent = `현재 나눈 칸막이: ${sliceCuts.size}개 (목표: 3글자씩 4개의 칸막이로 나누기)`;
  }
}

function autoSlicePractice() {
  sliceCuts = new Set([2, 5, 8, 11]);
  renderSlicer();
}

function renderDecoder(containerId, highlightCodes = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  Object.values(BEADS).forEach(b => {
    const row = document.createElement('div');
    row.className = 'decoder-row';
    const codesHtml = b.codes.map(c => `<span class="code-pill${highlightCodes.includes(c) ? ' highlight' : ''}">${c}</span>`).join('');
    row.innerHTML = `
      <div class="decoder-codes">${codesHtml}</div>
      <div class="decoder-bead-info">${getBeadSVG(b.id, 34)}<span>${b.name}</span></div>
    `;
    container.appendChild(row);
  });
}

function renderPalette(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  Object.values(BEADS).forEach(b => {
    const item = document.createElement('div');
    item.className = 'bead-item' + (selectedBeadId === b.id ? ' selected-bead' : '');
    item.draggable = true;
    item.innerHTML = `${getBeadSVG(b.id, 46)}<span class="bead-name">${b.name}</span>`;

    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', b.id);
      selectedBeadId = b.id;
    });

    item.addEventListener('click', () => {
      selectedBeadId = (selectedBeadId === b.id) ? null : b.id;
      renderPalette('practice-palette');
      renderPalette('practical-palette');
    });

    container.appendChild(item);
  });
}

function renderPracticeWire() {
  const wire = document.getElementById('practice-wire');
  wire.innerHTML = '<div class="wire-line"></div>';

  practiceTriplets.forEach((code, idx) => {
    const unit = document.createElement('div');
    unit.className = 'slot-unit';
    const placedBead = practiceSlots[idx];
    unit.innerHTML = `
      <div class="triplet-label">${code}</div>
      <div class="bead-slot ${placedBead ? 'filled' : ''}">
        ${placedBead ? getBeadSVG(placedBead, 62) : '<span style="font-size:12px; color:#94a3b8; font-weight:700;">구슬 놓기</span>'}
      </div>
    `;

    const slotEl = unit.querySelector('.bead-slot');
    slotEl.addEventListener('dragover', e => { e.preventDefault(); slotEl.classList.add('drag-over'); });
    slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drag-over'));
    slotEl.addEventListener('drop', e => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      tryPlacePracticeBead(idx, e.dataTransfer.getData('text/plain'), slotEl);
    });
    slotEl.addEventListener('click', () => {
      if (selectedBeadId) tryPlacePracticeBead(idx, selectedBeadId, slotEl);
      else if (practiceSlots[idx]) { practiceSlots[idx] = null; renderPracticeWire(); }
    });

    wire.appendChild(unit);
  });

  const insight = document.getElementById('duplicate-insight');
  if (practiceSlots[1] === 'circle' && practiceSlots[4] === 'circle') insight.classList.add('show');
  else insight.classList.remove('show');
}

function tryPlacePracticeBead(slotIdx, beadId, slotEl) {
  if (beadId === CODE_TO_BEAD[practiceTriplets[slotIdx]]) {
    practiceSlots[slotIdx] = beadId;
    renderPracticeWire();
  } else {
    slotEl.classList.add('wrong');
    setTimeout(() => slotEl.classList.remove('wrong'), 400);
  }
}

function resetPracticeBeads() {
  practiceSlots = [null, null, null, null, null];
  renderPracticeWire();
}

// ==================== 2단계: 실전 ====================
const GENE_CASES = {
  normal: {
    dna: ['TAC', 'CTT', 'GAA', 'GGA', 'CTC'],
    rna: ['AUG', 'GAA', 'CUU', 'CCU', 'GAG'],
    mutatedGroupIdx: -1,
    mutatedBaseIdx: -1,
    foldDesc: '가운데 <strong>초록 세모 구슬(▲)</strong>이 사슬을 안쪽으로 꺾어주어 양쪽의 파란 원형 구슬(●)들이 마주 보며 <strong>안정적인 둥근 고리 형태</strong>로 접혔습니다.'
  },
  same: {
    dna: ['TAC', 'CTC', 'GAA', 'GGA', 'CTC'],
    rna: ['AUG', 'GAG', 'CUU', 'CCU', 'GAG'],
    mutatedGroupIdx: 1,
    mutatedBaseIdx: 2,
    foldDesc: '2번째 묶음이 <code>GAA</code>에서 <code>GAG</code>로 바뀌었지만, 두 조합 모두 <strong>똑같은 파란 원형 구슬(●)</strong>을 지정하므로 완성된 단백질의 꼬임 형태는 <strong>기준 단백질과 100% 동일</strong>합니다!'
  },
  diff: {
    dna: ['TAC', 'CTT', 'GTA', 'GGA', 'CTC'],
    rna: ['AUG', 'GAA', 'CAU', 'CCU', 'GAG'],
    mutatedGroupIdx: 2,
    mutatedBaseIdx: 1,
    foldDesc: '3번째 묶음이 <code>CUU</code>에서 <code>CAU</code>로 바뀌면서 <strong>초록 세모 구슬(▲) 대신 빨간 마름모 구슬(◆)</strong>이 끼워졌습니다. 그 결과 사슬이 반대쪽으로 꺾이며 <strong>완전히 다른 꼬임 구조</strong>가 되었습니다!'
  }
};

let currentGeneKey = 'normal';
let practicalSlots = [null, null, null, null, null];
let foldAnimId = null;

function selectGeneCase(caseKey) {
  currentGeneKey = caseKey;
  document.querySelectorAll('.gene-card-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`gene-btn-${caseKey}`).classList.add('active');
  practicalSlots = [null, null, null, null, null];
  renderPracticalSequences();
  renderPracticalWire();
  drawFoldingCanvas('canvas-current', practicalSlots, 0);
  document.getElementById('current-fold-desc').innerHTML = '구슬 5개를 모두 끼우면 구슬 모양의 맞물림에 따라 사슬이 자동으로 휘어지며 입체 구조를 만듭니다.';
}

function renderPracticalSequences() {
  const gene = GENE_CASES[currentGeneKey];
  const dnaEl = document.getElementById('dna-display');
  const rnaEl = document.getElementById('rna-display');
  dnaEl.innerHTML = '';
  rnaEl.innerHTML = '';

  gene.dna.forEach((triplet, gIdx) => {
    const group = document.createElement('div');
    group.className = 'triplet-group' + (gene.mutatedGroupIdx === gIdx ? ' mutated' : '');
    group.innerHTML = triplet.split('').map((b, bIdx) => `<div class="mini-base ${gene.mutatedGroupIdx === gIdx && gene.mutatedBaseIdx === bIdx ? 'diff' : ''}">${b}</div>`).join('');
    dnaEl.appendChild(group);
  });

  gene.rna.forEach((triplet, gIdx) => {
    const group = document.createElement('div');
    group.className = 'triplet-group' + (gene.mutatedGroupIdx === gIdx ? ' mutated' : '');
    group.innerHTML = triplet.split('').map((b, bIdx) => `<div class="mini-base ${gene.mutatedGroupIdx === gIdx && gene.mutatedBaseIdx === bIdx ? 'diff' : ''}">${b}</div>`).join('');
    rnaEl.appendChild(group);
  });

  renderDecoder('practical-decoder-list', gene.rna);
}

function renderPracticalWire() {
  const gene = GENE_CASES[currentGeneKey];
  const wire = document.getElementById('practical-wire');
  wire.innerHTML = '<div class="wire-line"></div>';

  gene.rna.forEach((code, idx) => {
    const unit = document.createElement('div');
    unit.className = 'slot-unit';
    const placedBead = practicalSlots[idx];
    unit.innerHTML = `
      <div class="triplet-label" style="${gene.mutatedGroupIdx === idx ? 'border-color:#f43f5e; color:#e11d48;' : ''}">${code}</div>
      <div class="bead-slot ${placedBead ? 'filled' : ''}">
        ${placedBead ? getBeadSVG(placedBead, 62) : '<span style="font-size:12px; color:#94a3b8; font-weight:700;">구슬 놓기</span>'}
      </div>
    `;

    const slotEl = unit.querySelector('.bead-slot');
    slotEl.addEventListener('dragover', e => { e.preventDefault(); slotEl.classList.add('drag-over'); });
    slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drag-over'));
    slotEl.addEventListener('drop', e => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      tryPlacePracticalBead(idx, e.dataTransfer.getData('text/plain'), slotEl);
    });
    slotEl.addEventListener('click', () => {
      if (selectedBeadId) tryPlacePracticalBead(idx, selectedBeadId, slotEl);
      else if (practicalSlots[idx]) {
        practicalSlots[idx] = null;
        renderPracticalWire();
        drawFoldingCanvas('canvas-current', practicalSlots, 0);
      }
    });

    wire.appendChild(unit);
  });
}

function tryPlacePracticalBead(slotIdx, beadId, slotEl) {
  const gene = GENE_CASES[currentGeneKey];
  if (beadId === CODE_TO_BEAD[gene.rna[slotIdx]]) {
    practicalSlots[slotIdx] = beadId;
    renderPracticalWire();
    checkAndTriggerFolding();
  } else {
    slotEl.classList.add('wrong');
    setTimeout(() => slotEl.classList.remove('wrong'), 400);
  }
}

function autoFillPracticalBeads() {
  practicalSlots = GENE_CASES[currentGeneKey].rna.map(code => CODE_TO_BEAD[code]);
  renderPracticalWire();
  checkAndTriggerFolding();
}

function resetPracticalBeads() {
  practicalSlots = [null, null, null, null, null];
  renderPracticalWire();
  drawFoldingCanvas('canvas-current', practicalSlots, 0);
  document.getElementById('current-fold-desc').innerHTML = '구슬 5개를 모두 끼우면 구슬 모양의 맞물림에 따라 사슬이 자동으로 휘어지며 입체 구조를 만듭니다.';
}

function checkAndTriggerFolding() {
  if (practicalSlots.every(b => b !== null)) {
    document.getElementById('current-fold-desc').innerHTML = GENE_CASES[currentGeneKey].foldDesc;
    replayFoldAnimation();
  } else {
    drawFoldingCanvas('canvas-current', practicalSlots, 0);
  }
}

function replayFoldAnimation() {
  if (!practicalSlots.every(b => b !== null)) return;
  if (foldAnimId) cancelAnimationFrame(foldAnimId);
  let start = null;
  const duration = 900;

  function step(ts) {
    if (!start) start = ts;
    const t = Math.min((ts - start) / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    drawFoldingCanvas('canvas-current', practicalSlots, ease);
    if (t < 1) foldAnimId = requestAnimationFrame(step);
  }
  foldAnimId = requestAnimationFrame(step);
}

function drawFoldingCanvas(canvasId, beads, foldProgress) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let x = 20; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 20; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const linearCoords = [
    { x: 52, y: 125 }, { x: 116, y: 125 }, { x: 180, y: 125 }, { x: 244, y: 125 }, { x: 308, y: 125 }
  ];

  const middleBead = beads[2];
  const foldedCoords = (middleBead === 'diamond')
    ? [{ x: 65, y: 185 }, { x: 115, y: 120 }, { x: 180, y: 115 }, { x: 245, y: 65 }, { x: 305, y: 95 }]
    : [{ x: 115, y: 190 }, { x: 110, y: 115 }, { x: 180, y: 58 }, { x: 250, y: 115 }, { x: 235, y: 185 }];

  const currentCoords = linearCoords.map((lin, i) => ({
    x: lin.x + (foldedCoords[i].x - lin.x) * foldProgress,
    y: lin.y + (foldedCoords[i].y - lin.y) * foldProgress
  }));

  if (foldProgress > 0.8 && middleBead === 'triangle') {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(currentCoords[1].x, currentCoords[1].y);
    ctx.lineTo(currentCoords[4].x, currentCoords[4].y);
    ctx.stroke();
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 11px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('고리 맞물림 완성', (currentCoords[1].x + currentCoords[4].x) / 2, (currentCoords[1].y + currentCoords[4].y) / 2 + 4);
    ctx.restore();
  }

  if (foldProgress > 0.8 && middleBead === 'diamond') {
    ctx.save();
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 12px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 가운데 구슬 모양이 바뀌어 고리가 만들어지지 않음!', W / 2, 225);
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  currentCoords.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
  ctx.stroke();
  ctx.restore();

  currentCoords.forEach((pt, i) => drawBeadOnCanvas(ctx, pt.x, pt.y, beads[i], i + 1));
}

function drawBeadOnCanvas(ctx, x, y, beadId, orderNum) {
  ctx.save();
  ctx.translate(x, y);

  if (!beadId) {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.fillStyle = BEADS[beadId].color;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffffff';

  if (beadId === 'circle') {
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (beadId === 'square') {
    ctx.beginPath(); ctx.roundRect(-18, -18, 36, 36, 7); ctx.fill(); ctx.stroke();
  } else if (beadId === 'triangle') {
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(21, 16); ctx.lineTo(-21, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (beadId === 'diamond') {
    ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(23, 0); ctx.lineTo(0, 23); ctx.lineTo(-23, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (beadId === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const oa = (i * 72 - 90) * Math.PI / 180;
      const ia = ((i * 72 + 36) - 90) * Math.PI / 180;
      if (i === 0) ctx.moveTo(Math.cos(oa) * 22, Math.sin(oa) * 22);
      else ctx.lineTo(Math.cos(oa) * 22, Math.sin(oa) * 22);
      ctx.lineTo(Math.cos(ia) * 10, Math.sin(ia) * 10);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(orderNum, 0, 1);
  ctx.restore();
}

function switchStage(stageNum) {
  document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`stage-${stageNum}`).classList.add('active');
  document.querySelectorAll('.tab-btn')[stageNum - 1].classList.add('active');

  if (stageNum === 2) {
    drawFoldingCanvas('canvas-reference', ['star', 'circle', 'triangle', 'square', 'circle'], 1);
    drawFoldingCanvas('canvas-current', practicalSlots, practicalSlots.every(b => b !== null) ? 1 : 0);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderSlicer();
  renderDecoder('decoder-list', practiceTriplets);
  renderPalette('practice-palette');
  renderPalette('practical-palette');
  renderPracticeWire();

  renderPracticalSequences();
  renderPracticalWire();
  drawFoldingCanvas('canvas-reference', ['star', 'circle', 'triangle', 'square', 'circle'], 1);
  drawFoldingCanvas('canvas-current', practicalSlots, 0);
});
