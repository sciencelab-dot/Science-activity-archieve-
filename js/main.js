// =========================================================================
// [활동 목록 등록소] 새로운 활동을 만들 때마다 아래 배열에 항목을 추가하세요.
// =========================================================================
const ACTIVITIES = [
  {
    id: 'gene-beads',
    category: '생명과학',
    date: '2026. 10. 28',
    badge: '총 2단계',
    title: '통합과학 생명과학\n유전 정보와 구슬 꿰기',
    url: './activities/gene-beads/index.html'
  }
  // 예시: 추후 활동 추가 시 아래 주석을 해제하고 폴더 경로만 맞춰주면 됩니다.
  /*
  ,{
    id: 'gravity-collision',
    category: '물리학',
    date: '2026. 11. 02',
    badge: '총 2단계',
    title: '통합과학 물리\n자유 낙하와 수평 포물선 운동',
    url: './activities/gravity-collision/index.html'
  }
  */
];

// =========================================================================
// [고정 렌더링 로직] 아래 코드는 수정할 필요가 없습니다.
// =========================================================================
const gridEl = document.getElementById('archive-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderCards(selectedCategory = 'all') {
  gridEl.innerHTML = '';

  const filtered = selectedCategory === 'all'
    ? ACTIVITIES
    : ACTIVITIES.filter(item => item.category === selectedCategory);

  if (filtered.length === 0) {
    gridEl.innerHTML = `<div class="empty-state">아직 등록된 ${selectedCategory} 활동이 없습니다.</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('a');
    card.className = 'activity-card';
    card.href = item.url;
    card.innerHTML = `
      <div>
        <div class="card-meta">
          <span class="card-date">${item.date}</span>
          <span class="card-badge">${item.badge}</span>
        </div>
        <h2 class="card-main-title">${item.title}</h2>
      </div>
      <div class="card-action">
        <span>활동 시작하기</span>
        <span>→</span>
      </div>
    `;
    gridEl.appendChild(card);
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.category);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  renderCards('all');
});
