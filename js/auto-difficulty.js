// 自动设置难度系数为4星
(function() {
  'use strict';
  
  function injectButton() {
    if (document.getElementById('oneKeySplitBtn')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'oneKeySplitContainer';
    wrapper.style.position = 'fixed';
    wrapper.style.top = '10px';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translateX(-50%)';
    wrapper.style.zIndex = '9999';
    const btn = document.createElement('button');
    btn.id = 'oneKeySplitBtn';
    btn.textContent = '一键发放';
    btn.style.padding = '10px 18px';
    btn.style.borderRadius = '999px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    btn.style.background = 'linear-gradient(135deg, #FF7A59 0%, #FF4D4F 50%, #FF9A8F 100%)';
    btn.onclick = runOneKeySplit;
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function isBudgetSelectPage() {
    const t = (document.title || '').trim();
    return !!document.getElementById('btnSelect') && !!document.getElementById('datagrid') && (t.includes('项目预算选择') || t.includes('预算'));
  }

  async function autoSelectBudgetInPage() {
    const ready = await ensureMiniReady();
    if (!ready) return;
    const dg = mini.get('datagrid');
    if (!dg) return;
    let tries = 0;
    while (tries++ < 40) {
      const data = typeof dg.getData === 'function' ? dg.getData() : [];
      if (data && data.length > 0) break;
      await sleep(250);
    }
    try {
      const data = dg.getData ? dg.getData() : [];
      const row = data && data[0];
      if (row) {
        if (typeof dg.select === 'function') dg.select(row);
        else if (typeof dg.setSelected === 'function') dg.setSelected(row);
      }
    } catch (_) {}
    await sleep(300);
    if (typeof window.selectInfo === 'function') {
      try { window.selectInfo(); } catch (_) {}
    } else {
      const btn = document.getElementById('btnSelect');
      if (btn) { try { btn.click(); } catch (_) {} }
    }
  }

  function findBudgetFrameContext() {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const win = iframe.contentWindow;
        const doc = iframe.contentDocument;
        if (!win || !doc) continue;
        const t = (doc.title || '').trim();
        const ok = doc.getElementById('btnSelect') && doc.getElementById('datagrid') && (t.includes('项目预算选择') || t.includes('预算'));
        if (ok) return { win, doc };
      } catch (_) {}
    }
    return null;
  }

  async function autoSelectBudgetInDialog() {
    let ctx = null;
    for (let i = 0; i < 40; i++) {
      ctx = findBudgetFrameContext();
      if (ctx) break;
      await sleep(250);
    }
    if (!ctx) return false;
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (ctx.win.mini) { ready = true; break; }
      await sleep(200);
    }
    if (!ready) return false;
    const dg = ctx.win.mini.get('datagrid');
    if (!dg) return false;
    let tries = 0;
    while (tries++ < 40) {
      const data = typeof dg.getData === 'function' ? dg.getData() : [];
      if (data && data.length > 0) break;
      await sleep(250);
    }
    try {
      const data = dg.getData ? dg.getData() : [];
      const row = data && data[0];
      if (row) {
        if (typeof dg.select === 'function') dg.select(row);
        else if (typeof dg.setSelected === 'function') dg.setSelected(row);
      }
    } catch (_) {}
    await sleep(300);
    if (typeof ctx.win.selectInfo === 'function') {
      try { ctx.win.selectInfo(); } catch (_) {}
    } else {
      const btn = ctx.doc.getElementById('btnSelect');
      if (btn) { try { btn.click(); } catch (_) {} }
    }
    return true;
  }

  async function ensureMiniReady(retries = 40) {
    for (let i = 0; i < retries; i++) {
      if (typeof mini !== 'undefined') return true;
      await sleep(200);
    }
    return false;
  }

  async function pickBudget() {
    const budgetComp = typeof mini !== 'undefined' ? mini.get('budget') : null;
    if (typeof window.selectBudget === 'function') {
      try { window.selectBudget(); } catch (_) {}
      await sleep(600);
      await autoSelectBudgetInDialog();
    } else if (budgetComp) {
      try {
        const el = budgetComp.getEl ? budgetComp.getEl() : budgetComp.el;
        if (el) {
          const btn = el.querySelector('.mini-buttonedit-button') || el;
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await sleep(600);
          await autoSelectBudgetInDialog();
        }
      } catch (_) {}
    } else {
      await sleep(500);
    }
    let ok = false;
    for (let i = 0; i < 40; i++) {
      const v = budgetComp && (budgetComp.getValue ? budgetComp.getValue() : budgetComp.value);
      if (v && String(v).length > 0) { ok = true; break; }
      await sleep(250);
    }
    return ok;
  }

  async function selectAllGridRows() {
    const dg = typeof mini !== 'undefined' ? mini.get('datagrid') : null;
    if (!dg) return false;
    let tries = 0;
    while (tries++ < 20) {
      const data = typeof dg.getData === 'function' ? dg.getData() : [];
      if (data && data.length > 0) break;
      await sleep(200);
    }
    try {
      if (typeof dg.selectAll === 'function') {
        dg.selectAll();
      } else {
        const data = dg.getData ? dg.getData() : [];
        for (const row of data) {
          if (typeof dg.select === 'function') dg.select(row);
          else if (typeof dg.setSelected === 'function') dg.setSelected(row);
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function triggerSave() {
    if (typeof window.saveMissionApply === 'function') {
      try { window.saveMissionApply(); } catch (_) {}
      await sleep(1800);
      return true;
    }
    const btn = document.getElementById('btnSplit');
    if (btn) {
      try { btn.click(); } catch (_) {}
      await sleep(1800);
      return true;
    }
    await sleep(800);
    return false;
  }

  async function runOneKeySplit() {
    const ready = await ensureMiniReady();
    if (!ready) return;
    const projectComp = mini.get('projectsel');
    if (!projectComp) return;
    let list = [];
    try {
      list = typeof projectComp.getData === 'function' ? projectComp.getData() : [];
    } catch (_) {}
    if (!list || list.length === 0) {
      const rawEl = document.getElementById('projectsel');
      if (rawEl && rawEl.tagName === 'INPUT') {
        try { projectComp.setValue(rawEl.value); } catch (_) {}
      }
      list = typeof projectComp.getData === 'function' ? projectComp.getData() : [];
    }
    for (const item of list) {
      const val = item.value || item.id || item.guid || item.ProjectGuid || item.valueField || item.key;
      try { projectComp.setValue(val); } catch (_) {}
      await sleep(800);
      const budgetOk = await pickBudget();
      if (!budgetOk) await sleep(600);
      const selected = await selectAllGridRows();
      if (!selected) await sleep(600);
      await triggerSave();
      await sleep(1200);
    }
  }

  function setDifficulty() {
    let attemptCount = 0;
    const maxAttempts = 40;
    
    const checkInterval = setInterval(() => {
      attemptCount++;
      
      // 检查mini对象
      if (typeof mini === 'undefined') {
        if (attemptCount >= maxAttempts) {
          clearInterval(checkInterval);
        }
        return;
      }
      
      // 尝试获取组件
      const miniRate = mini.get('difficultydegree');
      
      if (miniRate) {
        clearInterval(checkInterval);
        
        // 获取DOM元素
        const el = miniRate.getEl ? miniRate.getEl() : miniRate.el;
        if (!el) return;
        
        // 查找星星元素
        const selectors = ['li', 'a', 'i', 'span', '.mini-rate-item'];
        let stars = null;
        
        for (const selector of selectors) {
          const elements = el.querySelectorAll(selector);
          if (elements.length >= 5) {
            stars = elements;
            break;
          }
        }
        
        if (!stars || stars.length < 4) return;
        
        // 延迟点击，确保页面完全渲染
        setTimeout(() => {
          // 先尝试点击
          stars[3].click();
          
          // 验证并使用API设置
          setTimeout(() => {
            const currentValue = miniRate.getValue ? miniRate.getValue() : miniRate.value;
            if (currentValue != 4) {
              try {
                miniRate.setValue(4);
                console.log('已自动设置难度系数为4星');
              } catch (e) {
                // 静默失败
              }
            } else {
              console.log('已自动设置难度系数为4星');
            }
          }, 500);
        }, 1000);
        
      } else if (attemptCount >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 500);
  }
  
  // 立即执行
  setDifficulty();
  
  // 延迟执行（备用）
  setTimeout(setDifficulty, 3000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isBudgetSelectPage()) autoSelectBudgetInPage();
      else injectButton();
    });
  } else {
    if (isBudgetSelectPage()) autoSelectBudgetInPage();
    else injectButton();
  }
  
})();
