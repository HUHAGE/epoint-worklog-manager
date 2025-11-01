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
    // 等待页面加载完成
    function waitForElement(selector, callback, maxTries = 30, interval = 500) {
      let tries = 0;
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          console.log('Element found:', selector);
          callback(element);
          return true;
        } else if (tries < maxTries) {
          tries++;
          console.log(`Waiting for element ${selector}, attempt ${tries}/${maxTries}`);
          setTimeout(checkElement, interval);
          return false;
        } else {
          console.error(`Element ${selector} not found after ${maxTries} attempts`);
          return false;
        }
      };
      return checkElement();
    }

    // 等待mini加载完成 - 增加更长的等待时间和更多的检查次数
    if (typeof mini === 'undefined') {
      // 如果mini框架未定义，等待一段时间再检查
      console.log('mini framework not immediately found, waiting...');
      
      // 增加等待次数和时间，最多等待10秒
      let waitCount = 0;
      const maxWaitCount = 20; // 最多等待20次，每次500ms，总共10秒
      const checkInterval = 500; // 每500ms检查一次
      
      const checkForMini = () => {
        waitCount++;
        console.log(`检查mini框架是否存在，第${waitCount}/${maxWaitCount}次`);
        
        if (typeof mini !== 'undefined') {
          console.log('mini框架已找到，开始执行填充逻辑');
          return executeFillLogic(logData);
        } else if (waitCount < maxWaitCount) {
          // 继续等待
          setTimeout(checkForMini, checkInterval);
          return 'waiting for mini framework';
        } else {
          // 超时，尝试其他方式
          console.warn('mini框架未找到，尝试使用备选方案');
          
          // 检查是否有其他可能的框架或元素
          const possibleElements = document.querySelectorAll('[class*="mini"], [id*="mini"], .datagrid, #datagrid, [class*="grid"], form, input, textarea');
          if (possibleElements.length > 0) {
            console.log('发现可能相关的元素，尝试直接填充');
            // 尝试直接填充表单
            fillFormElements(logData);
            alert('已尝试将日志数据填充到页面表单中。如果未成功，请检查页面是否完全加载或联系技术支持。');
            return 'success';
          } else {
            console.error('页面上未找到mini框架或相关元素，请确保在正确的页面上操作');
            alert('页面加载可能尚未完成，请稍等页面完全加载后再试，或确保您在正确的日志填写页面上操作。\n\n如果页面已完全加载但仍出现此提示，请检查页面URL是否符合以下模式之一：\n- 包含missionapply\n- 包含missionapplyadd\n- 包含epointprojectm和mission\n- 包含worklog\n- 包含log和mission或task');
            return 'error: mini framework not found';
          }
        }
      };
      
      // 开始检查
      return checkForMini();
    } else {
      console.log('mini框架已立即找到，开始执行填充逻辑');
      return executeFillLogic(logData);
    }

    // 执行填充逻辑的函数
    function executeFillLogic(logData) {
      console.log('Executing fill logic with logData:', logData);
      
      // 查找可能的数据表格元素（增加更多选择器）
      const possibleGridSelectors = [
        '#datagrid',
        '.datagrid',
        '[id*="grid"]',
        '[id*="datagrid"]',
        '[class*="grid"]',
        '[class*="datagrid"]'
      ];
      
      let gridElement = null;
      let gridSelector = '';
      
      // 尝试找到数据表格元素
      for (const selector of possibleGridSelectors) {
        gridElement = document.querySelector(selector);
        if (gridElement) {
          gridSelector = selector;
          console.log('Found grid element with selector:', selector);
          break;
        }
      }
      
      if (!gridElement) {
        console.warn('No grid element found with common selectors');
        
        // 如果找不到标准的表格元素，尝试查找表单元素
        const formElements = document.querySelectorAll('input, textarea, select');
        if (formElements.length > 0) {
          console.log('Found form elements, attempting to fill form');
          fillFormElements(logData);
          return 'success';
        }
        
        alert('未找到数据表格或表单元素，请确保在正确的页面上操作');
        return 'error: no grid or form elements found';
      }
      
      console.log('Grid element found:', gridElement);
      
      // 尝试获取mini-datagrid组件实例
      let grid = null;
      if (typeof mini !== 'undefined' && mini.get) {
        // 尝试通过ID获取
        grid = mini.get(gridElement.id || 'datagrid');
        
        // 如果通过ID获取失败，尝试其他方式
        if (!grid) {
          console.log('Trying to get grid by element reference');
          grid = mini.get(gridElement);
        }
        
        // 如果还是失败，尝试遍历所有mini组件
        if (!grid) {
          console.log('Trying to find grid among all mini components');
          const allComponents = mini.getAllComponents ? mini.getAllComponents() : [];
          for (const component of allComponents) {
            if (component.type && component.type.includes('grid')) {
              grid = component;
              break;
            }
          }
        }
      }
      
      if (!grid) {
        console.warn('mini-datagrid instance not found, attempting direct DOM manipulation');
        fillGridDirectly(gridElement, logData);
        return 'success';
      }
      
      console.log('Got grid instance:', grid);

      // 获取当前日期
      const today = new Date().toISOString().split('T')[0];

      // 创建新行数据
      const newRow = {
        MissionName: logData.project, // 任务名称使用项目名称
        ContentType: '01', // 默认工作类型
        contentdescription: logData.content, // 工作内容
        FinishDate: today, // 任务时间默认为当天
        expectcosted: logData.hours, // 申请工时
        completepercent: '100', // 完成比例默认100%
        rowguid: typeof mini !== 'undefined' && mini.newId ? mini.newId() : 'row_' + Date.now() // 生成新的行ID
      };

      console.log('Created new row data:', newRow);

      // 检查现有行数
      const data = grid.getData ? grid.getData() : [];
      console.log('Current grid data:', data);
      
      let emptyRowIndex = -1;
      
      // 查找空行或已有数据的最后一行
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.MissionName && !row.contentdescription) {
          emptyRowIndex = i;
          break;
        }
      }
      
      if (emptyRowIndex >= 0) {
        // 如果有空行，更新该行
        console.log('Updating existing row at index:', emptyRowIndex);
        if (grid.updateRow) {
          grid.updateRow(newRow, emptyRowIndex);
        } else {
          console.warn('updateRow method not available, trying alternative');
          grid.setData([...data.slice(0, emptyRowIndex), newRow, ...data.slice(emptyRowIndex + 1)]);
        }
      } else {
        // 如果没有空行，添加新行
        console.log('Adding new row');
        if (grid.addRow) {
          grid.addRow(newRow);
        } else if (grid.addRows) {
          grid.addRows([newRow]);
        } else {
          console.warn('addRow method not available, trying alternative');
          grid.setData([...data, newRow]);
        }
        
        // 确保至少有3行数据
        const currentData = grid.getData ? grid.getData() : [];
        if (currentData.length < 3) {
          // 添加空行直到达到3行
          console.log('Adding empty rows to reach minimum of 3');
          const emptyRows = [];
          for (let i = currentData.length; i < 3; i++) {
            emptyRows.push({
              rowguid: typeof mini !== 'undefined' && mini.newId ? mini.newId() : 'row_' + Date.now() + '_' + i
            });
          }
          if (grid.addRows) {
            grid.addRows(emptyRows);
          } else {
            grid.setData([...currentData, ...emptyRows]);
          }
        }
      }

      // 自动调整行高
      console.log('Adjusting row height');
      if (grid.autoHeight) {
        grid.autoHeight();
      }
      
      // 确保数据已更新
      console.log('Final grid data:', grid.getData ? grid.getData() : 'getData method not available');
      
      // 尝试触发表格刷新
      try {
        if (grid.doLayout) grid.doLayout();
        if (grid.refresh) grid.refresh();
      } catch (e) {
        console.warn('Error during grid refresh:', e);
      }
      
      alert('日志数据已填充到表格中！');
      return 'success';
    }
    
    // 直接操作DOM填充表格的备选方案
    function fillGridDirectly(gridElement, logData) {
      console.log('Attempting to fill grid directly via DOM manipulation');
      
      // 查找表格中的行
      const rows = gridElement.querySelectorAll('tr');
      if (rows.length > 0) {
        // 查找空行
        let emptyRow = null;
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          let isEmpty = true;
          for (const cell of cells) {
            if (cell.textContent.trim() !== '') {
              isEmpty = false;
              break;
            }
          }
          if (isEmpty) {
            emptyRow = row;
            break;
          }
        }
        
        if (emptyRow) {
          // 填充空行
          const cells = emptyRow.querySelectorAll('td');
          if (cells.length >= 4) {
            cells[0].textContent = logData.project;
            cells[1].textContent = logData.content;
            cells[2].textContent = logData.hours;
            cells[3].textContent = new Date().toISOString().split('T')[0];
          }
          alert('日志数据已通过DOM操作填充到表格中！');
        } else {
          alert('未找到空行，无法填充数据');
        }
      } else {
        alert('无法识别表格结构，无法填充数据');
      }
    }
    
    // 填充表单元素的函数
    function fillFormElements(logData) {
      console.log('Attempting to fill form elements with data:', logData);
      
      // 查找可能的表单字段，增加更多选择器
      const projectFields = document.querySelectorAll('input[name*="project"], input[name*="mission"], input[id*="project"], input[id*="mission"], input[placeholder*="项目"], input[placeholder*="任务"]');
      const contentFields = document.querySelectorAll('textarea[name*="content"], textarea[id*="content"], input[name*="content"], input[id*="content"], textarea[placeholder*="工作内容"], textarea[placeholder*="内容"]');
      const hoursFields = document.querySelectorAll('input[name*="hour"], input[id*="hour"], input[type="number"], input[name*="time"], input[id*="time"]');
      const dateFields = document.querySelectorAll('input[type="date"], input[name*="date"], input[id*="date"], input[placeholder*="日期"]');
      
      let filledFields = 0;
      
      // 填充项目名称
      if (projectFields.length > 0) {
        projectFields[0].value = logData.project;
        // 触发change事件
        const event = new Event('change', { bubbles: true });
        projectFields[0].dispatchEvent(event);
        projectFields[0].focus(); // 聚焦到字段
        filledFields++;
        console.log('Filled project field with:', logData.project);
      }
      
      // 填充工作内容
      if (contentFields.length > 0) {
        contentFields[0].value = logData.content;
        // 触发change事件
        const event = new Event('change', { bubbles: true });
        contentFields[0].dispatchEvent(event);
        filledFields++;
        console.log('Filled content field with:', logData.content);
      }
      
      // 填充工时
      if (hoursFields.length > 0) {
        hoursFields[0].value = logData.hours;
        // 触发change事件
        const event = new Event('change', { bubbles: true });
        hoursFields[0].dispatchEvent(event);
        filledFields++;
        console.log('Filled hours field with:', logData.hours);
      }
      
      // 填充日期（如果有的话）
      if (dateFields.length > 0 && logData.date) {
        dateFields[0].value = logData.date;
        // 触发change事件
        const event = new Event('change', { bubbles: true });
        dateFields[0].dispatchEvent(event);
        filledFields++;
        console.log('Filled date field with:', logData.date);
      }
      
      if (filledFields > 0) {
        alert(`日志数据已填充到表单中！已填充${filledFields}个字段。\n\n请检查数据是否正确，如有需要请手动调整。`);
      } else {
        alert('未找到可填充的表单字段。请确保您在正确的日志填写页面上，并且页面已完全加载。');
      }
    }
  } catch (error) {
    console.error('Error in injected script:', error);
    alert('填充数据时发生错误: ' + error.message);
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