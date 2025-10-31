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
const presetTab = document.getElementById('preset-tab'); // 新增预设信息tab
const logForm = document.getElementById('log-form');
const pendingLogsList = document.getElementById('pending-logs-list');
const filledLogsList = document.getElementById('filled-logs-list');
const presetProjectsTabList = document.getElementById('preset-projects-tab-list'); // 预设信息tab中的列表
const newPresetProjectTab = document.getElementById('new-preset-project-tab'); // 预设信息tab中的输入框
const addPresetProjectTabBtn = document.getElementById('add-preset-project-tab-btn'); // 预设信息tab中的添加按钮
const savePresetProjectsTabBtn = document.getElementById('save-preset-projects-tab-btn'); // 预设信息tab中的保存按钮
const addLogBtn = document.getElementById('add-log-btn');
const cancelLogBtn = document.getElementById('cancel-log-btn');
const projectTabs = document.querySelector('.project-tabs');
const presetModal = document.getElementById('preset-modal');
const closeModal = document.querySelector('.close-modal');
const closeInfoModalBtn = document.getElementById('close-info-modal'); // 关闭信息模态框的按钮
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
  
  // 确保预设项目模态框初始状态为隐藏
  if (presetModal) {
    presetModal.classList.add('hidden');
  }
});

// 绑定事件监听器
function bindEventListeners() {
  // 标签页切换
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
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
  
  // 关闭信息模态框按钮
  if (closeInfoModalBtn) {
    closeInfoModalBtn.addEventListener('click', hidePresetModal);
  }
  
  // 项目选择变化
  if (projectSelect) {
    projectSelect.addEventListener('change', handleProjectSelectChange);
  }
  
  // 预设信息tab中的功能
  if (addPresetProjectTabBtn) {
    addPresetProjectTabBtn.addEventListener('click', addNewPresetProjectFromTab);
  }
  
  if (savePresetProjectsTabBtn) {
    savePresetProjectsTabBtn.addEventListener('click', savePresetProjectsFromTab);
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
  
  // 显示对应的标签内容
  if (tabName === 'pending') {
    pendingTab.classList.add('active');
    filledTab.classList.remove('active');
    presetTab.classList.remove('active'); // 隐藏预设信息tab
  } else if (tabName === 'filled') {
    pendingTab.classList.remove('active');
    filledTab.classList.add('active');
    presetTab.classList.remove('active'); // 隐藏预设信息tab
  } else if (tabName === 'preset') {
    pendingTab.classList.remove('active');
    filledTab.classList.remove('active');
    presetTab.classList.add('active'); // 显示预设信息tab
    
    // 渲染预设项目列表
    renderPresetProjectsListForTab();
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
  
  // 隐藏表单
  hideLogForm();
  
  // 更新项目标签
  updateProjectTabs();
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
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

// 显示预设项目提示模态框
function showPresetModal() {
  if (presetModal) {
    presetModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
}

// 隐藏预设项目模态框
function hidePresetModal() {
  if (presetModal) {
    presetModal.classList.add('hidden');
  }
}

// 渲染预设项目列表（tab页中）
function renderPresetProjectsListForTab() {
  // 确保presetProjectsTabList存在
  if (!presetProjectsTabList) return;
  
  if (presetProjects.length === 0) {
    presetProjectsTabList.innerHTML = '<p class="empty-message">暂无预设项目</p>';
    return;
  }
  
  presetProjectsTabList.innerHTML = presetProjects.map((project, index) => `
    <div class="preset-project-item">
      <input type="text" value="${escapeHtml(project)}" data-index="${index}" class="preset-project-input">
      <button class="btn-small btn-delete" onclick="removePresetProjectFromTab(${index})">删除</button>
    </div>
  `).join('');
  
  // 为每个输入框添加事件监听器
  document.querySelectorAll('.preset-project-input').forEach(input => {
    input.addEventListener('blur', function() {
      const index = parseInt(this.dataset.index);
      const newValue = this.value.trim();
      if (newValue && newValue !== presetProjects[index]) {
        presetProjects[index] = newValue;
      }
    });
    
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        this.blur();
      }
    });
  });
}

// 添加新的预设项目（tab页中）
function addNewPresetProjectFromTab() {
  // 确保newPresetProjectTab存在
  if (!newPresetProjectTab) return;
  
  const projectName = newPresetProjectTab.value.trim();
  if (!projectName) {
    alert('请输入项目名称');
    return;
  }
  
  if (presetProjects.includes(projectName)) {
    alert('该项目已存在');
    return;
  }
  
  presetProjects.push(projectName);
  newPresetProjectTab.value = '';
  renderPresetProjectsListForTab();
}

// 删除预设项目（tab页中）
function removePresetProjectFromTab(index) {
  presetProjects.splice(index, 1);
  renderPresetProjectsListForTab();
}

// 保存预设项目（tab页中）
function savePresetProjectsFromTab() {
  try {
    localStorage.setItem('presetProjects', JSON.stringify(presetProjects));
    updateProjectSelect();
    console.log('预设项目已保存');
    alert('预设项目保存成功！');
  } catch (error) {
    console.error('保存预设项目失败:', error);
    alert('保存预设项目失败，请查看控制台了解详情。');
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