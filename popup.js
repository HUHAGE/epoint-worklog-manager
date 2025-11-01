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
  
  // 保存预设项目
  if (savePresetProjectsBtn) {
    savePresetProjectsBtn.addEventListener('click', savePresetProjects);
  }
  
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
          alert('请输入项目名称');
          return;
        }
        
        if (presetProjects.includes(projectName)) {
          alert('该项目已存在');
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
  
  // 预设标签页中的保存按钮
  const savePresetProjectsTabBtn = document.getElementById('save-preset-projects-tab-btn');
  if (savePresetProjectsTabBtn) {
    savePresetProjectsTabBtn.addEventListener('click', savePresetProjects);
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

  // 检查是否在编辑模式
  const editingLogId = logForm.dataset.editingLogId;
  
  // 创建新的日志对象
  const newLog = {
    id: editingLogId ? parseInt(editingLogId) : Date.now(), // 如果是编辑模式，使用原来的ID
    project,
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
  showSuccessMessage(editingLogId ? '日志修改成功' : '日志添加成功，可在"待填写"页面查看');
  
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
    projectSelect.value = 'other';
    projectInput.value = log.project;
    projectSelect.classList.remove('hidden');
    projectInput.classList.remove('hidden');
  }
  
  document.getElementById('content').value = log.content;
  document.getElementById('hours').value = log.hours;
  document.getElementById('date').value = log.date;
};

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
        <div class="log-hours">${log.hours}h</div>
        <div class="log-actions">
          <div class="action-icon edit-btn" title="编辑">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </div>
          <div class="action-icon fill-btn" title="提交">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <div class="action-icon delete-btn" title="删除">×</div>
        </div>
      </div>
      <div class="log-date">${formatDate(log.date)}</div>
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
      <div class="log-date">${formatDate(log.date)}</div>
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
  showSuccessMessage('日志已还原到待填写列表');
};

// 将这些函数定义为全局函数
window.fillLog = function(id) {
  console.log('fillLog called with id:', id);
  
  const logIndex = logs.pending.findIndex(log => log.id === id);
  if (logIndex === -1) {
    console.error('Log not found with id:', id);
    alert('未找到对应的日志记录，请刷新页面后重试');
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
        alert('Chrome API不可用，请确保扩展权限正确设置。');
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
              alert('未输入URL，将尝试在当前页面填充数据');
              // 尝试获取当前标签页ID，即使没有URL
              chrome.tabs.query({}, function(allTabs) {
                if (allTabs && allTabs.length > 0) {
                  const currentTab = allTabs[0];
                  processTabUrl(currentTab, log);
                } else {
                  alert('无法获取任何标签页信息，请刷新页面后重试');
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
                alert('无法获取任何标签页信息，请刷新页面后重试');
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
          alert('操作已取消，日志已移回待填写列表');
        }
      }
    }
    } catch (error) {
      console.error('Error in fillLog:', error);
      alert('发生错误: ' + error.message);
      
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
      target: { tabId: tabId },
      func: injectFillLogScript,
      args: [log]
    }, (results) => {
      console.log('Script execution results:', results);
      if (chrome.runtime.lastError) {
        console.error('Script execution error:', chrome.runtime.lastError);
        alert('填充日志时发生错误: ' + chrome.runtime.lastError.message);
      } else if (results && results[0] && results[0].result === 'success') {
        alert('日志已成功填充到页面！');
      }
    });
  } catch (error) {
    console.error('Error executing script:', error);
    alert('填充日志时发生错误: ' + error.message);
  }
}

// 注入到页面的脚本函数
function injectFillLogScript(logData) {
  console.log('Injected script running with data:', logData);
  try {
    // 填充数据到datagrid
    function fillDataIntoGrid(log) {
      // 假设我们要填充第一行
      const rowIndex = 1; 

      // 构建ID
      const taskNameId = `mini-54$${rowIndex}$2$editor$text`;
      const contentId = `mini-54$${rowIndex}$9$editor$text`;
      const hoursId = `mini-54$${rowIndex}$11$editor$text`;
      const dateId = `mini-54$${rowIndex}$10$editor$text`;

      // 填充数据
      const taskNameEl = document.getElementById(taskNameId);
      if (taskNameEl) taskNameEl.value = log.project;

      const contentEl = document.getElementById(contentId);
      if (contentEl) contentEl.value = log.content;

      const hoursEl = document.getElementById(hoursId);
      if (hoursEl) hoursEl.value = log.hours;

      const dateEl = document.getElementById(dateId);
      if (dateEl) dateEl.value = log.date;
    }

    fillDataIntoGrid(logData);

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
    deleteBtn.className = 'btn-small delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.dataset.index = index;
    
    projectItem.appendChild(projectInput);
    projectItem.appendChild(deleteBtn);
    presetProjectsTabList.appendChild(projectItem);
    
    // 添加修改事件监听
    projectInput.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const newValue = e.target.value.trim();
      if (newValue && !presetProjects.includes(newValue)) {
        presetProjects[index] = newValue;
      } else {
        e.target.value = presetProjects[index];
        if (presetProjects.includes(newValue)) {
          alert('项目名称已存在');
        }
      }
    });
    
    // 添加删除事件监听
    deleteBtn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      presetProjects.splice(index, 1);
      renderPresetProjectsList();
    });
  });
}

// 保存预设项目
function savePresetProjects() {
  try {
    localStorage.setItem('presetProjects', JSON.stringify(presetProjects));
    updateProjectSelect();
    hidePresetModal();
    showSuccessMessage('预设项目已保存');
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