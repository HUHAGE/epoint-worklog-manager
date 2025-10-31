// 日志数据结构
let logs = {
  pending: [], // 待填写日志
  filled: []   // 已填写日志
};

// 预设项目列表
let presetProjects = [];

// 当前活动的标签页
let activeTab = 'pending';

// 当前活动的项目筛选
let activeProjectFilter = 'all';

// DOM元素
const tabButtons = document.querySelectorAll('.tab-button');
const pendingTab = document.getElementById('pending-tab');
const filledTab = document.getElementById('filled-tab');
const logForm = document.getElementById('log-form');
const pendingLogsList = document.getElementById('pending-logs-list');
const filledLogsList = document.getElementById('filled-logs-list');
const addLogBtn = document.getElementById('add-log-btn');
const cancelLogBtn = document.getElementById('cancel-log-btn');
const projectTabs = document.querySelector('.project-tabs');
const presetProjectsBtn = document.getElementById('preset-projects-btn');
const presetModal = document.getElementById('preset-modal');
const closeModal = document.querySelector('.close-modal');
const presetProjectsList = document.getElementById('preset-projects-list');
const newPresetProject = document.getElementById('new-preset-project');
const addPresetProjectBtn = document.getElementById('add-preset-project-btn');
const savePresetProjectsBtn = document.getElementById('save-preset-projects-btn');
const projectSelect = document.getElementById('project-select');
const projectInput = document.getElementById('project');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 设置默认日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 加载存储的日志数据和预设项目
  loadLogs();
  loadPresetProjects();
  
  // 绑定事件监听器
  bindEventListeners();
  
  // 初始化项目选择下拉框
  updateProjectSelect();
});



// 绑定事件监听器
function bindEventListeners() {
  // 标签页切换
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // 添加日志按钮
  if (addLogBtn) {
    addLogBtn.addEventListener('click', showLogForm);
  }
  
  // 取消添加日志按钮
  if (cancelLogBtn) {
    cancelLogBtn.addEventListener('click', hideLogForm);
  }
  
  // 表单提交
  logForm.addEventListener('submit', handleFormSubmit);
  
  // 项目标签页切换
  projectTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('project-tab-btn')) {
      switchProjectFilter(e.target.dataset.project);
    }
  });
  
  // 预设项目按钮
  if (presetProjectsBtn) {
    presetProjectsBtn.addEventListener('click', showPresetModal);
  }
  
  // 关闭模态框
  if (closeModal) {
    closeModal.addEventListener('click', hidePresetModal);
  }
  if (presetModal) {
    presetModal.addEventListener('click', (e) => {
      if (e.target === presetModal) {
        hidePresetModal();
      }
    });
  }
  
  // 添加预设项目
  if (addPresetProjectBtn) {
    addPresetProjectBtn.addEventListener('click', addNewPresetProject);
  }
  
  // 保存预设项目
  if (savePresetProjectsBtn) {
    savePresetProjectsBtn.addEventListener('click', savePresetProjects);
  }
  
  // 项目选择变化
  if (projectSelect) {
    projectSelect.addEventListener('change', handleProjectSelectChange);
  }
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
  
  // 获取所有标签页内容
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // 隐藏所有标签页内容
  tabPanes.forEach(pane => {
    pane.classList.remove('active');
  });
  
  // 显示对应的标签内容
  const activePane = document.getElementById(`${tabName}-tab`);
  if (activePane) {
    activePane.classList.add('active');
  }
  
  // 渲染对应标签页的内容
  renderLogs();
}

// 切换项目筛选
function switchProjectFilter(projectName) {
  activeProjectFilter = projectName;
  
  // 更新项目标签按钮状态
  document.querySelectorAll('.project-tab-btn').forEach(button => {
    if (button.dataset.project === projectName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
}

// 显示日志表单
function showLogForm() {
  if (addLogBtn) {
    addLogBtn.classList.add('hidden');
  }
  logForm.classList.remove('hidden');
}

// 隐藏日志表单
function hideLogForm() {
  logForm.classList.add('hidden');
  if (addLogBtn) {
    addLogBtn.classList.remove('hidden');
  }
  logForm.reset();
  
  // 设置日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

// 处理表单提交
function handleFormSubmit(event) {
  event.preventDefault();
  
  // 获取表单数据
  let project = projectSelect.value;
  if (!project) {
    project = projectInput.value;
  }
  
  const content = document.getElementById('content').value;
  const hours = parseFloat(document.getElementById('hours').value);
  const date = document.getElementById('date').value;
  
  if (!project) {
    alert('请选择或输入项目名称');
    return;
  }
  
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
  
  // 显示成功提示
  showSuccessMessage('日志添加成功，可在"待填写"页面查看');
  
  // 更新项目标签
  updateProjectTabs();
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
  
  // 切换到待填写标签页
  setTimeout(() => {
    switchTab('pending');
  }, 1500);
}

// 处理项目选择变化
function handleProjectSelectChange() {
  if (projectSelect.value === 'other') {
    projectSelect.classList.add('hidden');
    projectInput.classList.remove('hidden');
    projectInput.focus();
  }
}

// 更新项目选择下拉框
function updateProjectSelect() {
  // 确保projectSelect存在
  if (!projectSelect) return;
  
  projectSelect.innerHTML = '<option value="">请选择项目</option>';
  
  presetProjects.forEach(project => {
    const option = document.createElement('option');
    option.value = project;
    option.textContent = project;
    projectSelect.appendChild(option);
  });
  
  // 添加"其他"选项
  const otherOption = document.createElement('option');
  otherOption.value = 'other';
  otherOption.textContent = '其他（手动输入）';
  projectSelect.appendChild(otherOption);
}

// 更新项目标签
function updateProjectTabs() {
  // 确保projectTabs存在
  if (!projectTabs) return;
  
  // 获取所有唯一的项目名称
  const projects = [...new Set(logs.pending.map(log => log.project))];
  
  // 清空项目标签容器
  projectTabs.innerHTML = '<button class="project-tab-btn active" data-project="all">全部项目</button>';
  
  // 为每个项目创建标签按钮
  projects.forEach(project => {
    const button = document.createElement('button');
    button.className = 'project-tab-btn';
    button.dataset.project = project;
    button.textContent = project;
    if (activeProjectFilter === project) {
      button.classList.add('active');
    }
    projectTabs.appendChild(button);
  });
}

// 渲染所有日志
function renderLogs() {
  renderPendingLogs();
  renderFilledLogs();
}

// 渲染待填写日志列表
function renderPendingLogs() {
  // 确保pendingLogsList存在
  if (!pendingLogsList) return;
  
  // 根据项目筛选过滤日志
  let filteredLogs = logs.pending;
  if (activeProjectFilter !== 'all') {
    filteredLogs = logs.pending.filter(log => log.project === activeProjectFilter);
  }
  
  if (filteredLogs.length === 0) {
    pendingLogsList.innerHTML = '<p class="empty-message">暂无待填写日志</p>';
    return;
  }
  
  pendingLogsList.innerHTML = filteredLogs.map(log => `
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
  // 确保filledLogsList存在
  if (!filledLogsList) return;
  
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
  
  // 显示表单
  showLogForm();
  
  // 填充表单数据
  // 检查项目是否在预设项目中
  if (presetProjects.includes(log.project)) {
    projectSelect.value = log.project;
    projectSelect.classList.remove('hidden');
    projectInput.classList.add('hidden');
  } else {
    projectSelect.value = 'other';
    projectInput.value = log.project;
    projectSelect.classList.remove('hidden');
    projectInput.classList.remove('hidden');
  }
  
  document.getElementById('content').value = log.content;
  document.getElementById('hours').value = log.hours;
  document.getElementById('date').value = log.date;
  
  // 从待填写列表中移除该日志
  logs.pending = logs.pending.filter(log => log.id !== id);
  
  // 保存并重新渲染
  saveLogs();
  updateProjectTabs();
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
  updateProjectTabs();
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
  updateProjectTabs();
  renderLogs();
}

// 显示预设项目模态框
function showPresetModal() {
  renderPresetProjectsList();
  if (presetModal) {
    presetModal.classList.remove('hidden');
  }
}

// 隐藏预设项目模态框
function hidePresetModal() {
  if (presetModal) {
    presetModal.classList.add('hidden');
  }
}

// 渲染预设项目列表
function renderPresetProjectsList() {
  // 确保presetProjectsList存在
  if (!presetProjectsList) return;
  
  if (presetProjects.length === 0) {
    presetProjectsList.innerHTML = '<p class="empty-message">暂无预设项目</p>';
    return;
  }
  
  presetProjectsList.innerHTML = presetProjects.map((project, index) => `
    <div class="preset-project-item">
      <span>${escapeHtml(project)}</span>
      <button class="btn-small btn-delete" onclick="removePresetProject(${index})">删除</button>
    </div>
  `).join('');
}

// 添加新的预设项目
function addNewPresetProject() {
  // 确保newPresetProject存在
  if (!newPresetProject) return;
  
  const projectName = newPresetProject.value.trim();
  if (!projectName) {
    alert('请输入项目名称');
    return;
  }
  
  if (presetProjects.includes(projectName)) {
    alert('该项目已存在');
    return;
  }
  
  presetProjects.push(projectName);
  newPresetProject.value = '';
  renderPresetProjectsList();
}

// 删除预设项目
function removePresetProject(index) {
  presetProjects.splice(index, 1);
  renderPresetProjectsList();
}

// 保存预设项目
function savePresetProjects() {
  try {
    localStorage.setItem('presetProjects', JSON.stringify(presetProjects));
    updateProjectSelect();
    hidePresetModal();
    console.log('预设项目已保存');
  } catch (error) {
    console.error('保存预设项目失败:', error);
  }
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
  updateProjectTabs();
}

// 从localStorage加载预设项目
function loadPresetProjects() {
  try {
    const savedPresetProjects = localStorage.getItem('presetProjects');
    if (savedPresetProjects) {
      presetProjects = JSON.parse(savedPresetProjects);
    }
  } catch (error) {
    console.error('加载预设项目失败:', error);
    presetProjects = [];
  }
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

// 显示成功提示消息
function showSuccessMessage(message) {
  // 创建提示元素
  const messageElement = document.createElement('div');
  messageElement.className = 'success-message';
  messageElement.textContent = message;
  
  // 添加到页面
  document.querySelector('.container').appendChild(messageElement);
  
  // 显示提示
  setTimeout(() => {
    messageElement.classList.add('show');
  }, 100);
  
  // 自动隐藏提示
  setTimeout(() => {
    messageElement.classList.remove('show');
    setTimeout(() => {
      messageElement.remove();
    }, 500);
  }, 3000);
}