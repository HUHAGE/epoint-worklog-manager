// 日志数据结构
let logs = {
  pending: [], // 待填写日志
  filled: []   // 已填写日志
};

// 预设项目列表
let presetProjects = [];

// 当前活动的标签页
let activeTab = 'add';

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
const projectSelect = document.getElementById('project-select');
const projectInput = document.getElementById('project');
const toastContainer = document.getElementById('toast-container');
const demandTagSelect = document.getElementById('demand-tag-select');
const workTypeSelect = document.getElementById('work-type-select');
let presetDemandTag = '';
let presetWorkType = '';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 设置默认日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 加载存储的日志数据和预设项目
  loadLogs();
  loadPresetProjects();
  loadPresetDemandTag();
  loadPresetWorkType();
  // 打开插件时自动填充预设需求标签到OA页面
  autofillDemandTagToStory(presetDemandTag);
  // 打开插件时自动填充预设工作类型到OA页面
  autofillWorkTypeToMission(presetWorkType);
  
  // 绑定事件监听器
  bindEventListeners();
  
  // 初始化项目选择下拉框
  updateProjectSelect();
  
  // 切换到增加日志标签页
  switchTab('add');
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
    presetProjectsBtn.addEventListener('click', () => {
      switchTab('preset');
    });
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
  
  // 移除了模态框中的保存预设项目按钮，因为添加预设项目后会自动保存
  
  // 项目选择变化
  if (projectSelect) {
    projectSelect.addEventListener('change', handleProjectSelectChange);
  }
  
  // 预设标签页中的添加按钮
  const addPresetProjectTabBtn = document.getElementById('add-preset-project-tab-btn');
  if (addPresetProjectTabBtn) {
    addPresetProjectTabBtn.addEventListener('click', () => {
      const newPresetProjectTab = document.getElementById('new-preset-project-tab');
      if (newPresetProjectTab) {
        const projectName = newPresetProjectTab.value.trim();
        if (!projectName) {
          showToast('请输入项目名称');
          return;
        }
        
        if (presetProjects.includes(projectName)) {
          showToast('该项目已存在');
          return;
        }
        
        presetProjects.push(projectName);
        newPresetProjectTab.value = '';
        renderPresetProjectsList();
        // 保存预设项目到localStorage
        savePresetProjects();
      }
    });
  }
  
  // 移除了保存预设项目按钮，因为添加预设项目后会自动保存
}

function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
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
  // 移除了与"其他"选项相关的处理逻辑
  
  const taskName = document.getElementById('task-name').value;
  const content = document.getElementById('content').value;
  const hours = parseFloat(document.getElementById('hours').value);
  const date = document.getElementById('date').value;
  
  if (!project) {
    showToast('项目名称不能为空');
    return;
  }

  // 检查是否在编辑模式
  const editingLogId = logForm.dataset.editingLogId;
  
  // 创建新的日志对象
  const newLog = {
    id: editingLogId ? parseInt(editingLogId) : Date.now(), // 如果是编辑模式，使用原来的ID
    project,
    taskName,
    content,
    hours,
    date,
    createdAt: new Date().toISOString()
  };
  
  if (editingLogId) {
    // 编辑模式：替换原有日志
    const index = logs.pending.findIndex(log => log.id === parseInt(editingLogId));
    if (index !== -1) {
      logs.pending[index] = newLog;
    }
    // 清除编辑状态
    delete logForm.dataset.editingLogId;
  } else {
    // 添加模式：添加到待填写日志列表
    logs.pending.push(newLog);
  }
  
  // 保存到存储
  saveLogs();
  
  // 重置表单
  logForm.reset();
  
  // 设置日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 显示成功提示
  showToast(editingLogId ? '日志修改成功' : '日志已保存');
  
  // 更新项目标签
  updateProjectTabs();
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
  
  // 如果是编辑模式，立即切换到待填写标签页
  if (editingLogId) {
    switchTab('pending');
  }
  // 注意：新增模式下不再自动跳转到待填写页面
  // 用户可以手动点击"待填写"标签页查看新增的日志
}

// 将这些函数定义为全局函数
window.editLog = function(id) {
  const log = logs.pending.find(log => log.id === id);
  if (!log) return;
  
  // 切换到添加日志标签页
  switchTab('add');
  
  // 显示表单
  showLogForm();
  
  // 设置编辑模式标记
  logForm.dataset.editingLogId = id;
  
  // 填充表单数据
  // 检查项目是否在预设项目中
  if (presetProjects.includes(log.project)) {
    projectSelect.value = log.project;
    projectSelect.classList.remove('hidden');
    projectInput.classList.add('hidden');
  } else {
    // 如果项目不在预设项目中，直接使用项目名称
    projectSelect.value = log.project;
    projectSelect.classList.remove('hidden');
    projectInput.classList.add('hidden');
  }
  
  document.getElementById('content').value = log.content;
  document.getElementById('hours').value = log.hours;
  document.getElementById('date').value = log.date;
  document.getElementById('task-name').value = log.taskName || '';
};

// 处理项目选择变化
function handleProjectSelectChange() {
  // 移除了与"其他"选项相关的处理逻辑
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
  
  // 移除了"其他"选项，只使用预设项目
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
  
  // 清空列表
  pendingLogsList.innerHTML = '';
  
  // 为每个日志创建元素
  filteredLogs.forEach(log => {
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.dataset.id = log.id;
    
    logItem.innerHTML = `
      <div class="log-item-header">
        <div class="log-project">${escapeHtml(log.project)}</div>
        <div class="log-date">${formatDate(log.date)}</div>
        <div class="log-hours">${log.hours}h</div>
        <div class="log-actions">
          <div class="action-icon edit-btn" title="编辑">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </div>
          <div class="action-icon delete-btn" title="删除">×</div>
          <div class="action-icon fill-btn" title="提交">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
        </div>
      </div>
      <div class="log-content">${escapeHtml(log.content)}</div>
    `;
    
    // 添加事件监听器
    const editBtn = logItem.querySelector('.edit-btn');
    const fillBtn = logItem.querySelector('.fill-btn');
    const deleteBtn = logItem.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => editLog(log.id));
    
    // 修改提交按钮的事件处理，使用函数表达式而不是箭头函数
    fillBtn.addEventListener('click', function() {
      console.log('Fill button clicked for log:', log.id);
      window.fillLog(log.id);
    });
    
    deleteBtn.addEventListener('click', () => deleteLog(log.id, 'pending'));
    
    pendingLogsList.appendChild(logItem);
  });
}

// 渲染已填写日志列表
// 当前活动的已填写项目筛选
let activeFilledProjectFilter = 'all';

// 修改renderFilledLogs函数
function renderFilledLogs() {
  // 确保filledLogsList存在
  if (!filledLogsList) return;
  
  // 更新已填写项目标签
  updateFilledProjectTabs();
  
  if (logs.filled.length === 0) {
    filledLogsList.innerHTML = '<p class="empty-message">暂无已填写日志</p>';
    return;
  }
  
  // 根据项目筛选过滤日志
  let filteredLogs = logs.filled;
  if (activeFilledProjectFilter !== 'all') {
    filteredLogs = logs.filled.filter(log => log.project === activeFilledProjectFilter);
  }
  
  if (filteredLogs.length === 0) {
    filledLogsList.innerHTML = '<p class="empty-message">暂无已填写日志</p>';
    return;
  }
  
  // 清空列表
  filledLogsList.innerHTML = '';
  
  // 为每个日志创建元素
  filteredLogs.forEach(log => {
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.dataset.id = log.id;
    
    logItem.innerHTML = `
      <div class="log-item-header">
        <div class="log-project">${escapeHtml(log.project)}</div>
        <div class="log-date">${formatDate(log.date)}</div>
        <div class="log-hours">${log.hours}h</div>
        <div class="log-actions">
          <div class="action-icon restore-btn" title="还原">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
            </svg>
          </div>
          <div class="action-icon delete-btn" title="删除">×</div>
        </div>
      </div>
      <div class="log-content">${escapeHtml(log.content)}</div>
    `;
    
    // 添加事件监听器
    const restoreBtn = logItem.querySelector('.restore-btn');
    const deleteBtn = logItem.querySelector('.delete-btn');
    
    restoreBtn.addEventListener('click', () => restoreLog(log.id));
    deleteBtn.addEventListener('click', () => deleteLog(log.id, 'filled'));
    
    filledLogsList.appendChild(logItem);
  });
}

// 更新已填写项目标签
function updateFilledProjectTabs() {
  const filledProjectTabs = document.getElementById('filled-project-tabs');
  if (!filledProjectTabs) {
    // 如果不存在，创建项目标签容器
    const filledTab = document.getElementById('filled-tab');
    if (filledTab) {
      const projectTabs = document.createElement('div');
      projectTabs.id = 'filled-project-tabs';
      projectTabs.className = 'project-tabs';
      filledTab.insertBefore(projectTabs, filledLogsList);
    }
    return;
  }

  // 获取所有唯一的项目名称
  const projects = [...new Set(logs.filled.map(log => log.project))];
  
  // 清空项目标签容器
  filledProjectTabs.innerHTML = '<button class="project-tab-btn active" data-project="all">全部项目</button>';
  
  // 为每个项目创建标签按钮
  projects.forEach(project => {
    const button = document.createElement('button');
    button.className = 'project-tab-btn';
    button.dataset.project = project;
    button.textContent = project;
    if (activeFilledProjectFilter === project) {
      button.classList.add('active');
    }
    filledProjectTabs.appendChild(button);
  });

  // 添加点击事件监听器
  filledProjectTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('project-tab-btn')) {
      switchFilledProjectFilter(e.target.dataset.project);
    }
  });
}

// 切换已填写项目筛选
function switchFilledProjectFilter(projectName) {
  activeFilledProjectFilter = projectName;
  
  // 更新项目标签按钮状态
  const filledProjectTabs = document.getElementById('filled-project-tabs');
  if (filledProjectTabs) {
    filledProjectTabs.querySelectorAll('.project-tab-btn').forEach(button => {
      if (button.dataset.project === projectName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  // 重新渲染已填写日志列表
  renderFilledLogs();
}

// 添加还原日志功能
window.restoreLog = function(id) {
  const logIndex = logs.filled.findIndex(log => log.id === id);
  if (logIndex === -1) return;
  
  // 从已填写列表中移除
  const log = logs.filled.splice(logIndex, 1)[0];
  
  // 添加到待填写列表
  logs.pending.push(log);
  
  // 保存并重新渲染
  saveLogs();
  updateProjectTabs();
  renderLogs();
  
  // 显示成功提示
  showToast('日志已还原到待填写列表');
};

// 将这些函数定义为全局函数
window.fillLog = function(id) {
  console.log('fillLog called with id:', id);
  
  const logIndex = logs.pending.findIndex(log => log.id === id);
  if (logIndex === -1) {
    console.error('Log not found with id:', id);
    showToast('未找到对应的日志记录，请刷新页面后重试');
    return;
  }
  
  // 从待填写列表中移除
  const log = logs.pending.splice(logIndex, 1)[0];
  
  // 添加到已填写列表
  logs.filled.push(log);
  
  // 保存并重新渲染
  saveLogs();
  updateProjectTabs();
  renderLogs();
  
  // 使用setTimeout确保UI更新后再处理tabs操作
  setTimeout(() => {
    try {
      // 检查chrome.tabs API是否可用
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        console.error('chrome.tabs API not available');
        showToast('Chrome API不可用，请确保扩展权限正确设置。');
        return;
      }
      
      // 获取当前标签页
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log('Current tabs:', tabs);
        if (!tabs || tabs.length === 0) {
          console.error('No active tabs found');
          const userChoice = confirm(
            '无法自动获取当前页面URL，可能是因为权限限制。\n\n' +
            '是否要手动输入当前页面URL进行验证？\n\n' +
            '点击"确定"手动输入URL\n' +
            '点击"取消"继续尝试在当前页面填充数据'
          );
          
          if (userChoice) {
            const manualUrl = prompt('请输入当前页面的完整URL:');
            if (manualUrl) {
              // 使用手动输入的URL继续处理
              const fakeTab = { id: Date.now(), url: manualUrl };
              processTabUrl(fakeTab, log);
            } else {
              showToast('未输入URL，将尝试在当前页面填充数据');
              // 尝试获取当前标签页ID，即使没有URL
              chrome.tabs.query({}, function(allTabs) {
                if (allTabs && allTabs.length > 0) {
                  const currentTab = allTabs[0];
                  processTabUrl(currentTab, log);
                } else {
                  showToast('无法获取任何标签页信息，请刷新页面后重试');
                  // 恢复日志状态
                  logs.filled.pop();
                  logs.pending.push(log);
                  saveLogs();
                  updateProjectTabs();
                  renderLogs();
                }
              });
            }
          } else {
            // 尝试获取当前标签页ID，即使没有URL
            chrome.tabs.query({}, function(allTabs) {
              if (allTabs && allTabs.length > 0) {
                const currentTab = allTabs[0];
                processTabUrl(currentTab, log);
              } else {
                showToast('无法获取任何标签页信息，请刷新页面后重试');
                // 恢复日志状态
                logs.filled.pop();
                logs.pending.push(log);
                saveLogs();
                updateProjectTabs();
                renderLogs();
              }
            });
          }
          return;
        }
        
        const currentTab = tabs[0];
        processTabUrl(currentTab, log);
      });
    
    // 处理标签页URL的函数
    function processTabUrl(currentTab, log) {
      const currentUrl = currentTab.url || '未获取到URL';
      console.log('Current tab URL:', currentUrl);
      
      // 检查是否已经在日志填写页面 - 使用更宽松的匹配条件
      console.log('检测URL:', currentUrl);
      
      // 改进URL检测逻辑，支持更多变体
      const normalizedUrl = currentUrl.toLowerCase();
      const isOnLogPage = currentUrl && (
        /missionapply/i.test(currentUrl) || 
        /missionapplyadd/i.test(currentUrl) ||
        (/epointprojectm/i.test(currentUrl) && /mission/i.test(currentUrl)) ||
        normalizedUrl.includes('missionapply') ||
        normalizedUrl.includes('missionapplyadd') ||
        normalizedUrl.includes('mission') && normalizedUrl.includes('apply') ||
        normalizedUrl.includes('worklog') ||
        normalizedUrl.includes('log') && (normalizedUrl.includes('mission') || normalizedUrl.includes('task'))
      );
      
      console.log('URL匹配详情:', {
        url: currentUrl,
        normalizedUrl: normalizedUrl,
        missionapplyTest: /missionapply/i.test(currentUrl),
        missionapplyaddTest: /missionapplyadd/i.test(currentUrl),
        epointprojectmTest: /epointprojectm/i.test(currentUrl) && /mission/i.test(currentUrl),
        includesMissionapply: normalizedUrl.includes('missionapply'),
        includesMissionapplyadd: normalizedUrl.includes('missionapplyadd'),
        includesMissionAndApply: normalizedUrl.includes('mission') && normalizedUrl.includes('apply'),
        includesWorklog: normalizedUrl.includes('worklog'),
        includesLogWithMissionOrTask: normalizedUrl.includes('log') && (normalizedUrl.includes('mission') || normalizedUrl.includes('task')),
        finalResult: isOnLogPage
      });
      
      if (isOnLogPage) {
        console.log('Already on log page, detected URL:', currentUrl);
        // 如果已经在日志页面，直接填充数据
        fillLogToPage(currentTab.id, log);
      } else {
        console.log('Not on log page, current URL:', currentUrl);
        // 如果不在日志页面，显示详细提示信息
        const userChoice = confirm(
          '当前页面URL未被识别为日志填写页面，是否仍要尝试填充数据？\n\n' +
          '当前URL: ' + currentUrl + '\n\n' +
          '识别规则: 包含missionapply、missionapplyadd等关键词\n\n' +
          '点击"确定"强制在当前页面尝试填充数据\n' +
          '点击"取消"取消操作并将日志移回待填写列表'
        );
        
        if (userChoice) {
          // 用户选择在当前页面填充（即使URL不匹配）
          console.log('User chose to force fill on current page');
          fillLogToPage(currentTab.id, log);
        } else {
          // 用户取消操作，将日志移回待填写列表
          logs.filled.pop(); // 从已填写列表移除
          logs.pending.push(log); // 添加回待填写列表
          saveLogs();
          updateProjectTabs();
          renderLogs();
          showToast('操作已取消，日志已移回待填写列表');
        }
      }
    }
    } catch (error) {
      console.error('Error in fillLog:', error);
      showToast('发生错误: ' + error.message);
      
      // 出错时，将日志移回待填写列表
      logs.filled.pop(); // 从已填写列表移除
      logs.pending.push(log); // 添加回待填写列表
      saveLogs();
      updateProjectTabs();
      renderLogs();
    }
  }, 100); // 短暂延迟确保UI更新
};

// 向日志页面填充数据
function fillLogToPage(tabId, log) {
  console.log('fillLogToPage called with tabId:', tabId, 'log:', log);
  
  // 注入填充脚本
  try {
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      // 在页面主世界执行，确保可访问 window.mini 和 HandleRowAdd
      world: 'MAIN',
      func: injectFillLogScript,
      args: [log]
    }, (results) => {
      console.log('Script execution results:', results);
      if (chrome.runtime.lastError) {
        console.error('脚本注入失败:', chrome.runtime.lastError.message);
        showToast(`脚本注入失败: ${chrome.runtime.lastError.message}`);
        // 恢复日志到待填写列表
        window.restoreLog(log.id);
      } else if (results && results[0] && results[0].result === 'success') {
        showToast('日志填写成功！');
      }
    });
  } catch (error) {
    console.error('Error executing script:', error);
    showToast('填充日志时发生错误: ' + error.message);
  }
}

// 注入到页面的脚本函数
function injectFillLogScript(logData) {
  console.log('Injected script running with data:', logData);
  try {
    // 填充数据到datagrid
    async function fillDataIntoGrid(log) {
      // 获取所有可访问文档上下文（包含同源 iframe）
      function getAllContexts() {
        const contexts = [{ win: window, doc: document }];
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          try {
            if (iframe.contentWindow && iframe.contentDocument) {
              contexts.push({ win: iframe.contentWindow, doc: iframe.contentDocument });
            }
          } catch (err) {
            console.log('Skip cross-origin iframe:', err);
          }
        }
        return contexts;
      }

      function findDatagridContext() {
        const contexts = getAllContexts();
        for (const ctx of contexts) {
          try {
            if (ctx.win.mini && typeof ctx.win.mini.get === 'function') {
              const dg = ctx.win.mini.get('datagrid');
              if (dg) return { dg, ctx };
            }
            // 放宽判断：只要能找到 #datagrid 元素，就视为该 frame 是目标上下文
            const el = ctx.doc.getElementById('datagrid');
            if (el) {
              let dg = null;
              try {
                if (ctx.win.mini && typeof ctx.win.mini.get === 'function') {
                  dg = ctx.win.mini.get('datagrid') || null;
                }
              } catch (e2) { /* ignore */ }
              return { dg, ctx };
            }
          } catch (e) { /* ignore */ }
        }
        return null;
      }

      // 锁定到正确的 datagrid 上下文，如果没有则直接跳过当前 frame
      const dgCtx = findDatagridContext();
      if (!dgCtx) {
        console.log('No datagrid element found in this frame, skipping.');
        return; // 不抛错，避免错误 frame 影响整体结果
      }

      // 查找可用的行索引
       function findAvailableRowIndex() {
         // 优先使用 mini datagrid API
         if (dgCtx && dgCtx.dg) {
           const data = dgCtx.dg.getData ? dgCtx.dg.getData() : [];
           console.log('Datagrid current rows:', data.length);
           for (let i = 0; i < data.length; i++) {
             const row = data[i];
             const mission = (row && row.MissionName) ? String(row.MissionName).trim() : '';
             if (!mission) {
               console.log(`Found empty row via datagrid at index ${i + 1}`);
               return { rowIndex: i + 1, needsNewRow: false, dgCtx };
             }
           }
           console.log(`All ${data.length} rows occupied; need to create new row at ${data.length + 1}`);
           return { rowIndex: data.length + 1, needsNewRow: true, dgCtx };
         }

         // 退回到原有 DOM 探测（编辑器元素）
         let rowIndex = 1;
         let maxAttempts = 50;
         while (rowIndex <= maxAttempts) {
           const taskNameId = `mini-54$${rowIndex}$2$editor$text`;
           const taskNameEl = document.getElementById(taskNameId);
           if (!taskNameEl) {
             console.log(`Row ${rowIndex} does not exist, need to add new row`);
             return { rowIndex: rowIndex, needsNewRow: true, dgCtx: null };
           }
           if (!taskNameEl.value || taskNameEl.value.trim() === '') {
             console.log(`Found empty row at index ${rowIndex}`);
             return { rowIndex: rowIndex, needsNewRow: false, dgCtx: null };
           }
           console.log(`Row ${rowIndex} is occupied with value: ${taskNameEl.value}`);
           rowIndex++;
         }
         console.log(`All rows up to ${maxAttempts} are occupied, need to create new row at ${rowIndex}`);
         return { rowIndex: rowIndex, needsNewRow: true, dgCtx: null };
       }
      
      // 添加新行的函数
       function addNewRowIfNeeded(targetRowIndex) {
         console.log(`Attempting to add new row at index ${targetRowIndex}`);
         // 仅在锁定的 datagrid 上下文中执行新增
         try {
           const doc = dgCtx.ctx.doc;
           const win = dgCtx.ctx.win;
           // 方法1：点击该上下文中的新增按钮
           const btns = doc.querySelectorAll('span[type="action"][icon="icon-add"][onclick="HandleRowAdd"], span[onclick="HandleRowAdd"]');
           if (btns.length > 0) {
             console.log('Clicking add button in datagrid frame');
             btns[0].click();
             return true;
           }
           // 方法2：直接调用该上下文中的 HandleRowAdd
           if (typeof win.HandleRowAdd === 'function') {
             console.log('Invoking HandleRowAdd in datagrid frame');
             win.HandleRowAdd();
             return true;
           }
           // 方法3：mini datagrid API 添加新行
           if (dgCtx.dg && typeof dgCtx.dg.addRow === 'function') {
             const newRowData = {
               rowguid: 'temp_' + Date.now(),
               MissionName: '',
               ContentType: '',
               GZDWorkTypeName: '',
               themetagname: '',
               contentdescription: '',
               expectcosted: 0,
               completepercent: '0%',
               FinishDate: new Date().toISOString().split('T')[0]
             };
             dgCtx.dg.addRow(newRowData);
             console.log('Successfully added new row using mini API in datagrid frame');
             return true;
           }
         } catch (err) {
           console.log('Failed to add row in datagrid frame:', err);
         }

         console.error('All methods to add new row failed');
         return false;
       }
      
      // 获取可用的行索引
       const rowInfo = findAvailableRowIndex();
       
       // 统一处理行填充逻辑
       const processRowFilling = async (targetRowIndex, needsNewRow) => {
         if (needsNewRow) {
           console.log(`All existing rows are occupied, attempting to add new row`);
           const addSuccess = addNewRowIfNeeded(targetRowIndex);
           
           if (!addSuccess) {
             console.error('Failed to add new row, cannot proceed with filling');
             throw new Error('无法添加新行，请手动添加行后重试');
           }
           
           // 等待新行创建完成
           const actualRowIndex = await waitForNewRowCreation(dgCtx);
           fillRowData(actualRowIndex, log, dgCtx);
         } else {
           // 如果找到了空行，直接填充
           console.log(`Using existing empty row at index ${targetRowIndex}`);
           fillRowData(targetRowIndex, log, dgCtx);
         }
       };
       
       // 等待新行创建的统一函数
       const waitForNewRowCreation = (dgCtx) => {
         return new Promise((resolve, reject) => {
           let retryCount = 0;
           const maxRetries = 5;
           const tryCheck = () => {
             retryCount++;
             console.log(`Checking for new row via datagrid, attempt ${retryCount}/${maxRetries}`);
             try {
               if (dgCtx && dgCtx.dg && typeof dgCtx.dg.getData === 'function') {
                 const data = dgCtx.dg.getData();
                 // 寻找第一条任务名称为空的行
                 for (let i = 0; i < data.length; i++) {
                   const mission = (data[i] && data[i].MissionName) ? String(data[i].MissionName).trim() : '';
                   if (!mission) {
                     console.log(`Found new empty row at index ${i + 1}`);
                     resolve(i + 1);
                     return;
                   }
                 }
                 // 若没有空行但增加了数据长度，则返回末尾行索引
                 console.log('No empty mission row detected yet');
               } else {
                 // 退回 DOM 探测
                 for (let i = 1; i <= 50; i++) {
                   const testId = `mini-54$${i}$2$editor$text`;
                   const testEl = document.getElementById(testId);
                   if (testEl && (!testEl.value || testEl.value.trim() === '')) {
                     console.log(`Found available row at index ${i} via DOM after addition`);
                     resolve(i);
                     return;
                   }
                 }
               }
             } catch (e) { /* ignore and retry */ }
             if (retryCount < maxRetries) {
               setTimeout(tryCheck, 600);
             } else {
               reject(new Error('新行未出现'));
             }
           };
           setTimeout(tryCheck, 500);
         });
       };
       
       // 执行填充处理
       try {
         await processRowFilling(rowInfo.rowIndex, rowInfo.needsNewRow);
       } catch (error) {
         console.error('Failed to process row filling:', error);
         throw error;
       }
      
      function fillRowData(index, logData, dgCtx) {
        console.log(`Filling data into row ${index}`);
        
        // 优先使用 mini datagrid API 更新行数据
        try {
          if (dgCtx && dgCtx.dg) {
            const dg = dgCtx.dg;
            const data = dg.getData ? dg.getData() : [];
            const row = data[index - 1];
            if (row && typeof dg.updateRow === 'function') {
              const rowUpdate = {
                MissionName: (logData.taskName || logData.project || ''),
                contentdescription: logData.content || '',
                expectcosted: logData.hours || 0,
                FinishDate: logData.date || new Date().toISOString().split('T')[0]
              };
              dg.updateRow(row, rowUpdate);
              console.log('Row updated via datagrid API:', rowUpdate);
              return;
            }
          }
        } catch (e) {
          console.log('Failed to update via datagrid API, falling back to DOM editors:', e);
        }

        // Fallback：通过 DOM 编辑器元素填充
        const taskNameId = `mini-54$${index}$2$editor$text`;
        const contentId = `mini-54$${index}$9$editor$text`;
        const hoursId = `mini-54$${index}$11$editor$text`;
        const dateId = `mini-54$${index}$10$editor$text`;

        const taskNameEl = document.getElementById(taskNameId);
        const contentEl = document.getElementById(contentId);
        const hoursEl = document.getElementById(hoursId);
        const dateEl = document.getElementById(dateId);

        if (taskNameEl) {
          taskNameEl.value = (logData.taskName || logData.project || '');
          console.log(`Set task name: ${logData.taskName || logData.project || ''}`);
        } else {
          console.warn(`Task name element not found: ${taskNameId}`);
        }
        if (contentEl) {
          contentEl.value = logData.content;
          console.log(`Set content: ${logData.content}`);
        } else {
          console.warn(`Content element not found: ${contentId}`);
        }
        if (hoursEl) {
          hoursEl.value = logData.hours;
          console.log(`Set hours: ${logData.hours}`);
        } else {
          console.warn(`Hours element not found: ${hoursId}`);
        }
        if (dateEl) {
          dateEl.value = logData.date;
          console.log(`Set date: ${logData.date}`);
        } else {
          console.warn(`Date element not found: ${dateId}`);
        }
        [taskNameEl, contentEl, hoursEl, dateEl].forEach(el => {
          if (el) {
            const event = new Event('change', { bubbles: true });
            el.dispatchEvent(event);
          }
        });
      }
    }

    fillDataIntoGrid(logData).catch(error => {
      console.error('Error filling data into grid:', error);
    });

    return 'success';
  } catch (error) {
    console.error('Error in injectFillLogScript:', error);
    return 'error: ' + error.message;
  }
}

window.deleteLog = function(id, type) {
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
};

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
  const presetProjectsTabList = document.getElementById('preset-projects-tab-list');
  if (!presetProjectsTabList) return;

  presetProjectsTabList.innerHTML = '';
  
  presetProjects.forEach((project, index) => {
    const projectItem = document.createElement('div');
    projectItem.className = 'preset-project-item';
    
    const projectInput = document.createElement('input');
    projectInput.type = 'text';
    projectInput.value = project;
    projectInput.className = 'preset-project-input';
    projectInput.dataset.index = index;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.dataset.index = index;
    deleteBtn.title = '删除';
    
    projectItem.appendChild(projectInput);
    projectItem.appendChild(deleteBtn);
    presetProjectsTabList.appendChild(projectItem);
    
    // 添加修改事件监听
    projectInput.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const newValue = e.target.value.trim();
      if (newValue && !presetProjects.includes(newValue)) {
        presetProjects[index] = newValue;
        // 修改预设项目后自动保存
        savePresetProjects();
      } else {
        e.target.value = presetProjects[index];
        if (presetProjects.includes(newValue)) {
          showToast('项目名称已存在');
        }
      }
    });
    
    // 添加删除事件监听
    deleteBtn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      presetProjects.splice(index, 1);
      renderPresetProjectsList();
      // 删除预设项目后自动保存
      savePresetProjects();
    });
  });
}

// 保存预设项目
function savePresetProjects() {
  try {
    localStorage.setItem('presetProjects', JSON.stringify(presetProjects));
    updateProjectSelect();
    hidePresetModal();
    showToast('预设项目已保存');
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
  renderPresetProjectsList();
  updateProjectSelect();
}

// 删除预设项目
function removePresetProject(index) {
  presetProjects.splice(index, 1);
  renderPresetProjectsList();
  // 删除预设项目后自动保存
  savePresetProjects();
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



function createLogElement(log) {
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  
  const header = document.createElement('div');
  header.className = 'log-item-header';
  
  const project = document.createElement('div');
  project.className = 'log-project';
  project.textContent = log.project;
  
  const hours = document.createElement('div');
  hours.className = 'log-hours';
  hours.textContent = log.hours + 'h';
  
  const actions = document.createElement('div');
  actions.className = 'log-actions';
  
  // 编辑图标
  const editIcon = document.createElement('div');
  editIcon.className = 'action-icon';
  editIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  editIcon.title = '编辑';
  
  // 提交图标
  const submitIcon = document.createElement('div');
  submitIcon.className = 'action-icon';
  submitIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  submitIcon.title = '提交';
  
  // 删除图标
  const deleteIcon = document.createElement('div');
  deleteIcon.className = 'action-icon';
  deleteIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
  deleteIcon.title = '删除';
  
  actions.appendChild(editIcon);
  actions.appendChild(submitIcon);
  actions.appendChild(deleteIcon);
  
  // 将项目名称、工时和操作按钮添加到header
  header.appendChild(project);
  header.appendChild(hours);
  header.appendChild(actions);
  
  // 日期显示在单独的行
  const date = document.createElement('div');
  date.className = 'log-date';
  date.textContent = log.date;
  
  const content = document.createElement('div');
  content.className = 'log-content';
  content.textContent = log.content;
  
  logItem.appendChild(header);
  logItem.appendChild(date);
  logItem.appendChild(content);
  
  // 添加事件监听器
  editIcon.addEventListener('click', () => {
    // 编辑日志的处理逻辑
  });
  
  submitIcon.addEventListener('click', () => {
    // 提交日志的处理逻辑
  });
  
  deleteIcon.addEventListener('click', () => {
    // 删除日志的处理逻辑
  });
  
  return logItem;
}
  // 初始自动填充已在 DOMContentLoaded 中触发
  // 需求标签变更后立即保存并尝试填充到页面
  if (demandTagSelect) {
    demandTagSelect.addEventListener('change', () => {
      savePresetDemandTag();
      autofillDemandTagToStory(presetDemandTag);
    });
  }
  // 工作类型变更后立即保存并尝试填充到页面
  if (workTypeSelect) {
    workTypeSelect.addEventListener('change', () => {
      savePresetWorkType();
      autofillWorkTypeToMission(presetWorkType);
    });
  }
// 加载预设需求标签
function loadPresetDemandTag() {
  try {
    const saved = localStorage.getItem('presetDemandTag');
    presetDemandTag = saved || '';
    if (demandTagSelect) {
      demandTagSelect.value = presetDemandTag;
    }
  } catch (error) {
    console.error('加载预设需求标签失败:', error);
    presetDemandTag = '';
  }
}

// 保存预设需求标签
function savePresetDemandTag() {
  try {
    presetDemandTag = demandTagSelect ? demandTagSelect.value : '';
    localStorage.setItem('presetDemandTag', presetDemandTag);
    showToast('需求标签已保存');
  } catch (error) {
    console.error('保存预设需求标签失败:', error);
  }
}

// 加载预设工作类型
function loadPresetWorkType() {
  try {
    const saved = localStorage.getItem('presetWorkType');
    presetWorkType = saved || '';
    if (workTypeSelect) {
      workTypeSelect.value = presetWorkType;
    }
  } catch (error) {
    console.error('加载预设工作类型失败:', error);
    presetWorkType = '';
  }
}

// 保存预设工作类型
function savePresetWorkType() {
  try {
    presetWorkType = workTypeSelect ? workTypeSelect.value : '';
    localStorage.setItem('presetWorkType', presetWorkType);
    showToast('工作类型已保存');
  } catch (error) {
    console.error('保存预设工作类型失败:', error);
  }
}

// 在当前激活的OA页，将需求标签填充到id为story的控件
function autofillDemandTagToStory(tagValue) {
  try {
    if (!tagValue) return;
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      // 在非扩展预览环境中，跳过
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) return;
      const tab = tabs[0];
      const url = tab.url || '';
      // 限制在OA域名页执行
      if (!url.includes('oa.epoint.com.cn')) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        args: [tagValue],
        func: function(presetText) {
          try {
            (function() {
              var tries = 5;
              var delay = 800; // 等待页面/数据初始化

              function tryFill(doc) {
                var w = doc.defaultView || window;
                // 优先使用 MiniUI 控件
                var miniObj = w.mini;
                var storyEl = doc.getElementById('story');
                var combo = null;
                try { combo = miniObj && miniObj.get && miniObj.get('story'); } catch (e) {}

                // 如果 MiniUI 未就绪但原生元素存在，做降级填充
                if (!combo && storyEl) {
                  try {
                    storyEl.value = presetText;
                    storyEl.dispatchEvent(new Event('change', { bubbles: true }));
                    if (typeof w.changedListInfo === 'function') {
                      try { w.changedListInfo(1); } catch (e) {}
                    }
                    return true;
                  } catch (e) {}
                }
                if (!combo) return false;

                // 获取数据源
                var data = [];
                try {
                  if (typeof combo.getData === 'function') data = combo.getData() || [];
                  else if (Array.isArray(combo.data)) data = combo.data;
                } catch (e) {}

                function findMatch(list) {
                  if (!Array.isArray(list)) return null;
                  var exact = list.find(function(it) {
                    var t = it.text || it.name || it.label || '';
                    return t === presetText;
                  });
                  if (exact) return exact;
                  var icase = String(presetText).toLowerCase();
                  return list.find(function(it) {
                    var t = String(it.text || it.name || it.label || '').toLowerCase();
                    return t.indexOf(icase) >= 0;
                  });
                }

                var match = findMatch(data);

                // 若本地数据未加载，尝试调用页面方法或使用全局列表
                if (!match) {
                  var tips = w.storyTipsList;
                  if (!tips && typeof w.getStoryTips === 'function') {
                    try { tips = w.getStoryTips(); } catch (e) {}
                  }
                  if (Array.isArray(tips) && tips.length) {
                    try {
                      if (typeof combo.setData === 'function') combo.setData(tips);
                    } catch (e) {}
                    match = findMatch(tips);
                  }
                }

                if (match) {
                  try {
                    var val = match.value || match.id || match.guid || '';
                    if (typeof combo.setValue === 'function') {
                      combo.setValue(val);
                    } else if (storyEl) {
                      storyEl.value = val;
                      storyEl.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (typeof w.changedListInfo === 'function') {
                      try { w.changedListInfo(1); } catch (e) {}
                    }
                    return true;
                  } catch (e) {}
                }

                // 兜底：仅设置文本，供用户确认
                try {
                  if (typeof combo.setText === 'function') combo.setText(presetText);
                  if (typeof w.changedListInfo === 'function') {
                    try { w.changedListInfo(1); } catch (e) {}
                  }
                  return true;
                } catch (e) {}

                return false;
              }

              function tryAll() {
                var ok = false;
                try { ok = tryFill(document); } catch (e) {}
                var iframes = document.getElementsByTagName('iframe');
                for (var i = 0; i < iframes.length; i++) {
                  try {
                    var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                    if (doc) ok = tryFill(doc) || ok;
                  } catch (e) {}
                }
                return ok;
              }

              function runner() {
                var done = tryAll();
                if (!done && tries > 0) {
                  tries--;
                  setTimeout(runner, delay);
                }
              }

              runner();
            })();
            return 'ok';
          } catch (e) {
            console.error('[PresetDemandTag] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        // 可选：根据结果记录日志，不打扰用户
        console.log('[PresetDemandTag] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动填充需求标签失败:', error);
  }
}

// 在当前激活的OA页，将工作类型填充到id为missionworktype的控件
function autofillWorkTypeToMission(typeText) {
  try {
    if (!typeText) return;
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) return;
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        args: [typeText],
        func: function(presetText) {
          try {
            (function() {
              var tries = 5;
              var delay = 800;

              function tryFill(doc) {
                var w = doc.defaultView || window;
                var miniObj = w.mini;
                var el = doc.getElementById('missionworktype');
                var ctrl = null;
                try { ctrl = miniObj && miniObj.get && miniObj.get('missionworktype'); } catch (e) {}

                if (!ctrl && !el) return false;

                // 获取数据源
                var data = [];
                try {
                  if (ctrl && typeof ctrl.getData === 'function') data = ctrl.getData() || [];
                  else if (ctrl && Array.isArray(ctrl.data)) data = ctrl.data;
                } catch (e) {}

                function findMatch(list) {
                  if (!Array.isArray(list)) return null;
                  var exact = list.find(function(it) {
                    var t = it.text || it.name || it.label || '';
                    return t === presetText;
                  });
                  if (exact) return exact;
                  var icase = String(presetText).toLowerCase();
                  return list.find(function(it) {
                    var t = String(it.text || it.name || it.label || '').toLowerCase();
                    return t.indexOf(icase) >= 0;
                  });
                }

                var match = findMatch(data);

                // 如数据未加载，尝试等待并重试（外层重试机制处理）
                if (match) {
                  try {
                    var val = match.value || match.id || match.guid || '';
                    if (ctrl && typeof ctrl.setValue === 'function') {
                      ctrl.setValue(val);
                    } else if (el) {
                      // RadiobuttonList 原生降级不易，尽量通过 ctrl
                      el.value = val;
                      el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (typeof w.checkIsHTW === 'function') {
                      try { w.checkIsHTW(); } catch (e) {}
                    }
                    return true;
                  } catch (e) {}
                }

                // 兜底：仅设置文本以提示用户（部分控件可能不支持setText）
                try {
                  if (ctrl && typeof ctrl.setText === 'function') ctrl.setText(presetText);
                  if (typeof w.checkIsHTW === 'function') {
                    try { w.checkIsHTW(); } catch (e) {}
                  }
                  return true;
                } catch (e) {}

                return false;
              }

              function tryAll() {
                var ok = false;
                try { ok = tryFill(document); } catch (e) {}
                var iframes = document.getElementsByTagName('iframe');
                for (var i = 0; i < iframes.length; i++) {
                  try {
                    var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                    if (doc) ok = tryFill(doc) || ok;
                  } catch (e) {}
                }
                return ok;
              }

              function runner() {
                var done = tryAll();
                if (!done && tries > 0) {
                  tries--;
                  setTimeout(runner, delay);
                }
              }

              runner();
            })();
            return 'ok';
          } catch (e) {
            console.error('[PresetWorkType] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        console.log('[PresetWorkType] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动填充工作类型失败:', error);
  }
}