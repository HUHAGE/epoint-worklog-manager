// 日志数据结构
let logs = {
  pending: [], // 待填写日志
  filled: []   // 已填写日志
};

// 当前活动的标签页
let activeTab = 'pending';

// DOM元素
const tabButtons = document.querySelectorAll('.tab-button');
const pendingTab = document.getElementById('pending-tab');
const filledTab = document.getElementById('filled-tab');
const logForm = document.getElementById('log-form');
const pendingLogsList = document.getElementById('pending-logs-list');
const filledLogsList = document.getElementById('filled-logs-list');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 设置默认日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 加载存储的日志数据
  loadLogs();
  
  // 绑定事件监听器
  bindEventListeners();
});

// 绑定事件监听器
function bindEventListeners() {
  // 标签页切换
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
  
  // 表单提交
  logForm.addEventListener('submit', handleFormSubmit);
}

// 切换标签页
function switchTab(tabName) {
  activeTab = tabName;
  
  // 更新标签按钮状态
  tabButtons.forEach(button => {
    if (button.dataset.tab === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // 显示对应的标签内容
  if (tabName === 'pending') {
    pendingTab.classList.add('active');
    filledTab.classList.remove('active');
  } else {
    pendingTab.classList.remove('active');
    filledTab.classList.add('active');
  }
  
  // 渲染对应标签页的内容
  renderLogs();
}

// 处理表单提交
function handleFormSubmit(event) {
  event.preventDefault();
  
  // 获取表单数据
  const project = document.getElementById('project').value;
  const content = document.getElementById('content').value;
  const hours = parseFloat(document.getElementById('hours').value);
  const date = document.getElementById('date').value;
  
  // 创建新的日志对象
  const newLog = {
    id: Date.now(), // 使用时间戳作为唯一ID
    project,
    content,
    hours,
    date,
    createdAt: new Date().toISOString()
  };
  
  // 添加到待填写日志列表
  logs.pending.push(newLog);
  
  // 保存到存储
  saveLogs();
  
  // 重置表单
  logForm.reset();
  
  // 设置日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
}

// 渲染所有日志
function renderLogs() {
  renderPendingLogs();
  renderFilledLogs();
}

// 渲染待填写日志列表
function renderPendingLogs() {
  if (logs.pending.length === 0) {
    pendingLogsList.innerHTML = '<p class="empty-message">暂无待填写日志</p>';
    return;
  }
  
  pendingLogsList.innerHTML = logs.pending.map(log => `
    <div class="log-item" data-id="${log.id}">
      <div class="log-header">
        <span class="log-project">${escapeHtml(log.project)}</span>
        <span class="log-date">${formatDate(log.date)}</span>
      </div>
      <div class="log-content">${escapeHtml(log.content)}</div>
      <div class="log-hours">工时: ${log.hours} 小时</div>
      <div class="log-actions">
        <button class="btn-small btn-edit" onclick="editLog(${log.id})">编辑</button>
        <button class="btn-small btn-fill" onclick="fillLog(${log.id})">填充</button>
        <button class="btn-small btn-delete" onclick="deleteLog(${log.id}, 'pending')">删除</button>
      </div>
    </div>
  `).join('');
}

// 渲染已填写日志列表
function renderFilledLogs() {
  if (logs.filled.length === 0) {
    filledLogsList.innerHTML = '<p class="empty-message">暂无已填写日志</p>';
    return;
  }
  
  filledLogsList.innerHTML = logs.filled.map(log => `
    <div class="log-item filled-log-item" data-id="${log.id}">
      <div class="log-header">
        <span class="log-project">${escapeHtml(log.project)}</span>
        <span class="log-date">${formatDate(log.date)}</span>
      </div>
      <div class="log-content">${escapeHtml(log.content)}</div>
      <div class="log-hours">工时: ${log.hours} 小时</div>
      <div class="log-actions">
        <button class="btn-small btn-delete" onclick="deleteLog(${log.id}, 'filled')">删除</button>
      </div>
    </div>
  `).join('');
}

// 编辑日志
function editLog(id) {
  const log = logs.pending.find(log => log.id === id);
  if (!log) return;
  
  // 填充表单数据
  document.getElementById('project').value = log.project;
  document.getElementById('content').value = log.content;
  document.getElementById('hours').value = log.hours;
  document.getElementById('date').value = log.date;
  
  // 从待填写列表中移除该日志
  logs.pending = logs.pending.filter(log => log.id !== id);
  
  // 保存并重新渲染
  saveLogs();
  renderPendingLogs();
}

// 填充日志（将日志从未填写移动到已填写）
function fillLog(id) {
  const logIndex = logs.pending.findIndex(log => log.id === id);
  if (logIndex === -1) return;
  
  // 从待填写列表中移除
  const log = logs.pending.splice(logIndex, 1)[0];
  
  // 添加到已填写列表
  logs.filled.push(log);
  
  // 保存并重新渲染
  saveLogs();
  renderLogs();
  
  // 这里应该实现实际的填充逻辑，将日志数据发送到公司系统
  console.log('正在将日志填充到公司系统:', log);
  // TODO: 实现实际的填充功能
}

// 删除日志
function deleteLog(id, type) {
  if (!confirm('确定要删除这条日志吗？')) return;
  
  if (type === 'pending') {
    logs.pending = logs.pending.filter(log => log.id !== id);
  } else {
    logs.filled = logs.filled.filter(log => log.id !== id);
  }
  
  // 保存并重新渲染
  saveLogs();
  renderLogs();
}

// 保存日志到localStorage
function saveLogs() {
  try {
    localStorage.setItem('worklogs', JSON.stringify(logs));
  } catch (error) {
    console.error('保存日志失败:', error);
  }
}

// 从localStorage加载日志
function loadLogs() {
  try {
    const savedLogs = localStorage.getItem('worklogs');
    if (savedLogs) {
      logs = JSON.parse(savedLogs);
    }
  } catch (error) {
    console.error('加载日志失败:', error);
    logs = { pending: [], filled: [] };
  }
  renderLogs();
}

// 辅助函数：转义HTML特殊字符
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 辅助函数：格式化日期
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
}