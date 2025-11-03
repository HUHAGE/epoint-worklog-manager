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
const closeRemindersCheckbox = document.getElementById('close-reminders-checkbox');
const captureBlueprintBtn = document.getElementById('capture-blueprint-btn');
const applyBlueprintBtn = document.getElementById('apply-blueprint-btn');
const blueprintAutoApplyCheckbox = document.getElementById('blueprint-auto-apply-checkbox');
const blueprintPresetsList = document.getElementById('blueprint-presets-list');
// 任务审核人预设 UI 引用
const captureTaskReviewerBtn = document.getElementById('capture-taskreviewer-btn');
const applyTaskReviewerBtn = document.getElementById('apply-taskreviewer-btn');
const taskReviewerAutoApplyCheckbox = document.getElementById('taskreviewer-auto-apply-checkbox');
const taskReviewerPresetsList = document.getElementById('taskreviewer-presets-list');
// 工作场景预设 UI 引用
const captureStageDemandBtn = document.getElementById('capture-stagedemand-btn');
const applyStageDemandBtn = document.getElementById('apply-stagedemand-btn');
const stageDemandAutoApplyCheckbox = document.getElementById('stagedemand-auto-apply-checkbox');
const stageDemandPresetsList = document.getElementById('stagedemand-presets-list');
let presetDemandTag = '';
let presetWorkType = '';
let presetCloseReminders = false;
let presetBlueprints = {};
let presetBlueprintAutoApply = true;
let presetStageDemands = {};
let presetStageDemandAutoApply = true;
let presetTaskReviewers = {};
let presetTaskReviewerAutoApply = true;

// 初始化
// 计算工时总和的函数
function calculateTotalHours(logsList, projectFilter = 'all') {
  return logsList.reduce((total, log) => {
    if (projectFilter === 'all' || log.project === projectFilter) {
      return total + (parseFloat(log.hours) || 0);
    }
    return total;
  }, 0);
}

// 更新状态指示器的函数
function updateStatusIndicator(isLogPage) {
  const statusIcon = document.querySelector('.status-icon');
  const statusText = document.querySelector('.status-text');
  const hoursValue = document.querySelector('.hours-value');
  const statusHours = document.querySelector('.status-hours');
  const statusFilledHours = document.querySelector('.status-filled-hours');
  const filledHoursValue = document.querySelector('.filled-hours-value');

  // 计算待填写和已填写的工时总和
  const pendingHours = calculateTotalHours(logs.pending, activeProjectFilter);
  const filledHours = calculateTotalHours(logs.filled, activeProjectFilter);
  const totalHours = pendingHours + filledHours;

  if (isLogPage) {
    statusIcon.classList.remove('non-log');
    statusIcon.classList.add('normal');
    statusText.textContent = '正常';
    
    // 根据当前标签页显示不同的工时信息
    if (activeTab === 'filled') {
      // 在已填写标签页显示已填工时
      filledHoursValue.textContent = filledHours.toFixed(1);
      statusHours.style.display = 'none';
      statusFilledHours.style.display = 'flex';
    } else {
      // 在其他标签页显示待填工时
      hoursValue.textContent = pendingHours.toFixed(1);
      statusHours.style.display = 'flex';
      statusFilledHours.style.display = 'none';
    }
  } else {
    statusIcon.classList.remove('normal');
    statusIcon.classList.add('non-log');
    statusText.textContent = '非日志页面';
    
    // 即使在非日志页面也显示工时统计
    if (activeTab === 'filled') {
      // 在已填写标签页显示已填工时
      filledHoursValue.textContent = filledHours.toFixed(1);
      statusHours.style.display = 'none';
      statusFilledHours.style.display = 'flex';
    } else {
      // 在其他标签页显示待填工时
      hoursValue.textContent = pendingHours.toFixed(1);
      statusHours.style.display = 'flex';
      statusFilledHours.style.display = 'none';
    }
  }
}

// 检查当前窗口中的标签页
function checkLogPages() {
  // 首先检查当前窗口中的标签页
  chrome.windows.getCurrent({ populate: true }, function(window) {
    if (window && window.tabs) {
      const hasLogPageInCurrentWindow = window.tabs.some(tab => {
        if (!tab.url) return false;
        const normalizedUrl = tab.url.toLowerCase();
        return (
          /missionapply/i.test(tab.url) || 
          /missionapplyadd/i.test(tab.url) ||
          (/epointprojectm/i.test(tab.url) && /mission/i.test(tab.url)) ||
          normalizedUrl.includes('missionapply') ||
          normalizedUrl.includes('missionapplyadd') ||
          normalizedUrl.includes('mission') && normalizedUrl.includes('apply') ||
          normalizedUrl.includes('worklog') ||
          normalizedUrl.includes('log') && (normalizedUrl.includes('mission') || normalizedUrl.includes('task'))
        );
      });
      updateStatusIndicator(hasLogPageInCurrentWindow);
    } else {
      // 如果无法获取当前窗口信息，回退到检查所有标签页
      chrome.tabs.query({}, function(tabs) {
        const hasLogPage = tabs.some(tab => {
          if (!tab.url) return false;
          const normalizedUrl = tab.url.toLowerCase();
          return (
            /missionapply/i.test(tab.url) || 
            /missionapplyadd/i.test(tab.url) ||
            (/epointprojectm/i.test(tab.url) && /mission/i.test(tab.url)) ||
            normalizedUrl.includes('missionapply') ||
            normalizedUrl.includes('missionapplyadd') ||
            normalizedUrl.includes('mission') && normalizedUrl.includes('apply') ||
            normalizedUrl.includes('worklog') ||
            normalizedUrl.includes('log') && (normalizedUrl.includes('mission') || normalizedUrl.includes('task'))
          );
        });
        updateStatusIndicator(hasLogPage);
      });
    }
  });
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    checkLogPages();
  }
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  checkLogPages();
});

document.addEventListener('DOMContentLoaded', function() {
  // 初始检查页面状态
  checkLogPages();
  // 设置默认日期为今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  
  // 加载存储的日志数据和预设项目
  loadLogs();
  loadPresetProjects();
  loadPresetDemandTag();
  loadPresetWorkType();
  loadPresetCloseReminders();
  loadPresetBlueprints();
  loadPresetBlueprintAutoApply();
  loadPresetStageDemands();
  loadPresetStageDemandAutoApply();
  loadPresetTaskReviewers();
  loadPresetTaskReviewerAutoApply();
  loadPresetStageDemands();
  loadPresetStageDemandAutoApply();
  // 打开插件时自动填充预设需求标签到OA页面
  autofillDemandTagToStory(presetDemandTag);
  // 打开插件时自动填充预设工作类型到OA页面
  autofillWorkTypeToMission(presetWorkType);
  // 打开插件时根据预设关闭提醒，自动隐藏帮助信息区域
  autofillCloseRemindersToPage(presetCloseReminders);
  // 打开插件时若开启自动应用蓝图，尝试应用蓝图预设到OA页面
  if (presetBlueprintAutoApply) {
    applyBlueprintPresetToOA();
  }
  if (presetStageDemandAutoApply) {
    applyStageDemandPresetToOA();
  }
  if (presetTaskReviewerAutoApply) {
    applyTaskReviewerPresetToOA();
  }
  // 打开插件时若开启自动应用工作场景，尝试应用工作场景预设到OA页面
  if (presetStageDemandAutoApply) {
    applyStageDemandPresetToOA();
  }
  
  // 检查当前页面是否为missionapplyadd页面
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || tabs.length === 0) return;
    const tab = tabs[0];
    const url = tab.url || '';
    const normalizedUrl = url.toLowerCase();
    if (normalizedUrl.includes('missionapplyadd')) {
      showToast('预设配置已成功加载！');
      // 在工具标题右侧添加绿色勾图标
      const toolTitle = document.querySelector('.form-container h2');
      if (toolTitle) {
        const checkIcon = document.createElement('span');
        checkIcon.className = 'preset-loaded-icon';
        toolTitle.appendChild(checkIcon);
      }
    }
  });
  
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
  
  // 添加问题反馈按钮事件监听器
  const feedbackBtn = document.getElementById('feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      // 打开问题反馈页面
      window.open('https://huhafish.feishu.cn/share/base/form/shrcnCjMxCiAH2xXXWen8Cy2nUb', '_blank');
    });
  }
  
  // 添加申请非公按钮事件监听器
  const applyNonPublicBtn = document.getElementById('apply-non-public-btn');
  if (applyNonPublicBtn) {
    applyNonPublicBtn.addEventListener('click', () => {
      // 获取当前日期并格式化为YYYY-MM-DD
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      
      // 打开申请非公页面，带上当前日期参数
      window.open(`https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/projectselect?RZDate=${currentDate}`, '_blank');
    });
  }
  
  // 添加发放非功按钮事件监听器
  const distributeNonPublicBtn = document.getElementById('distribute-non-public-btn');
  if (distributeNonPublicBtn) {
    distributeNonPublicBtn.addEventListener('click', () => {
      // 打开发放非功页面
      window.open('https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplysplitv2', '_blank');
    });
  }
  
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

  // 蓝图预设：捕获与应用按钮
  if (captureBlueprintBtn) {
    captureBlueprintBtn.addEventListener('click', () => {
      captureCurrentBlueprintFromOA();
    });
  }
  if (applyBlueprintBtn) {
    applyBlueprintBtn.addEventListener('click', () => {
      applyBlueprintPresetToOA();
    });
  }
  if (blueprintAutoApplyCheckbox) {
    blueprintAutoApplyCheckbox.addEventListener('change', () => {
      savePresetBlueprintAutoApply();
    });
  }

  // 蓝图预设列表删除事件委托（兜底）
  if (blueprintPresetsList) {
    blueprintPresetsList.addEventListener('click', (e) => {
      const btn = e.target.closest('button.delete-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.dataset.key;
        if (key) {
          removeBlueprintPreset(key);
        }
      }
    });
  }

  // 任务审核人预设：捕获与应用按钮
  if (captureTaskReviewerBtn) {
    captureTaskReviewerBtn.addEventListener('click', () => {
      captureCurrentTaskReviewerFromOA();
    });
  }
  if (applyTaskReviewerBtn) {
    applyTaskReviewerBtn.addEventListener('click', () => {
      applyTaskReviewerPresetToOA();
    });
  }
  if (taskReviewerAutoApplyCheckbox) {
    taskReviewerAutoApplyCheckbox.addEventListener('change', () => {
      savePresetTaskReviewerAutoApply();
    });
  }

  // 任务审核人预设列表删除事件委托（兜底）
  if (taskReviewerPresetsList) {
    taskReviewerPresetsList.addEventListener('click', (e) => {
      const btn = e.target.closest('button.delete-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.dataset.key;
        if (key) {
          removeTaskReviewerPreset(key);
        }
      }
    });
  }

  // 工作场景预设：捕获与应用按钮
  if (captureStageDemandBtn) {
    captureStageDemandBtn.addEventListener('click', () => {
      captureCurrentStageDemandFromOA();
    });
  }
  if (applyStageDemandBtn) {
    applyStageDemandBtn.addEventListener('click', () => {
      applyStageDemandPresetToOA();
    });
  }
  if (stageDemandAutoApplyCheckbox) {
    stageDemandAutoApplyCheckbox.addEventListener('change', () => {
      savePresetStageDemandAutoApply();
    });
  }

  // 工作场景预设列表删除事件委托（兜底）
  if (stageDemandPresetsList) {
    stageDemandPresetsList.addEventListener('click', (e) => {
      const btn = e.target.closest('button.delete-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.dataset.key;
        if (key) {
          removeStageDemandPreset(key);
        }
      }
    });
  }
  
  // 全局兜底：任何 delete-btn 点击都能路由到对应删除函数
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button.delete-btn');
    if (!btn) return;
    try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
    const key = btn.dataset.key;
    const type = btn.dataset.type;
    if (!key) return;
    if (type === 'blueprint') {
      removeBlueprintPreset(key);
    } else if (type === 'taskreviewer') {
      removeTaskReviewerPreset(key);
    } else if (type === 'stagedemand') {
      removeStageDemandPreset(key);
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
          showErrorToast('请输入项目名称');
          return;
        }
        
        if (presetProjects.includes(projectName)) {
          showErrorToast('该项目已存在');
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

// 显示错误提示的toast
function showErrorToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast-message error'; // 添加error类以应用红色背景
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
  
  // 控制状态指示器的显示/隐藏
  const statusIndicator = document.querySelector('.status-indicator');
  if (statusIndicator) {
    if (tabName === 'preset') {
      // 在配置标签页隐藏状态指示器
      statusIndicator.style.display = 'none';
    } else {
      // 在其他标签页显示状态指示器
      statusIndicator.style.display = 'flex';
    }
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
  
  // 更新工时统计（无论是否在日志页面都显示工时）
  if (activeTab === 'filled') {
    const filledHoursValue = document.querySelector('.filled-hours-value');
    const filledHours = calculateTotalHours(logs.filled, activeProjectFilter);
    filledHoursValue.textContent = filledHours.toFixed(1);
  } else {
    const hoursValue = document.querySelector('.hours-value');
    const pendingHours = calculateTotalHours(logs.pending, activeProjectFilter);
    hoursValue.textContent = pendingHours.toFixed(1);
  }
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
  const taskName = document.getElementById('task-name').value.trim();
  const content = document.getElementById('content').value.trim();
  const hours = parseFloat(document.getElementById('hours').value);
  const date = document.getElementById('date').value;
  
  // 验证所有字段是否已填写
  if (!project) {
    showErrorToast('请选择项目名称');
    return;
  }
  
  if (!taskName) {
    showErrorToast('请输入任务名称');
    return;
  }
  
  if (!content) {
    showErrorToast('请输入工作内容');
    return;
  }
  
  if (!hours || hours <= 0) {
    showErrorToast('请输入有效的工时');
    return;
  }
  
  if (!date) {
    showErrorToast('请选择日期');
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
  
  // 立即更新页面下方指示器中的工时统计
  updateHoursStatistics();
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

// 更新工时统计
function updateHoursStatistics() {
  // 根据当前标签页更新工时显示
  if (activeTab === 'filled') {
    const filledHoursValue = document.querySelector('.filled-hours-value');
    const filledHours = calculateTotalHours(logs.filled, activeProjectFilter);
    if (filledHoursValue) {
      filledHoursValue.textContent = filledHours.toFixed(1);
    }
    const statusHours = document.querySelector('.status-hours');
    const statusFilledHours = document.querySelector('.status-filled-hours');
    if (statusHours) statusHours.style.display = 'none';
    if (statusFilledHours) statusFilledHours.style.display = 'flex';
  } else {
    const hoursValue = document.querySelector('.hours-value');
    const pendingHours = calculateTotalHours(logs.pending, activeProjectFilter);
    if (hoursValue) {
      hoursValue.textContent = pendingHours.toFixed(1);
    }
    const statusHours = document.querySelector('.status-hours');
    const statusFilledHours = document.querySelector('.status-filled-hours');
    if (statusHours) statusHours.style.display = 'flex';
    if (statusFilledHours) statusFilledHours.style.display = 'none';
  }
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
  
  // 更新工时统计
  updateHoursStatistics();
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
          showToast('操作已取消');
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
      const oldValue = presetProjects[index];
      const newValue = e.target.value.trim();
      if (newValue && !presetProjects.includes(newValue)) {
        // 更新预设项目列表
        presetProjects[index] = newValue;
        
        // 同步更新任务列表中的项目名称
        syncProjectNameInLogs(oldValue, newValue);
        
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

// 同步更新任务列表中的项目名称
function syncProjectNameInLogs(oldName, newName) {
  // 更新待填写日志中的项目名称
  logs.pending.forEach(log => {
    if (log.project === oldName) {
      log.project = newName;
    }
  });
  
  // 更新已填写日志中的项目名称
  logs.filled.forEach(log => {
    if (log.project === oldName) {
      log.project = newName;
    }
  });
  
  // 保存更新后的日志
  saveLogs();
  
  // 重新渲染日志列表和项目标签
  renderLogs();
  updateProjectTabs();
  
  // 更新已填写项目标签
  updateFilledProjectTabs();
  
  // 更新项目选择下拉框
  updateProjectSelect();
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
  // 关闭提醒勾选后立即保存并尝试隐藏页面帮助信息区域
  if (closeRemindersCheckbox) {
    closeRemindersCheckbox.addEventListener('change', () => {
      savePresetCloseReminders();
      autofillCloseRemindersToPage(presetCloseReminders);
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

// 加载预设关闭提醒
function loadPresetCloseReminders() {
  try {
    const saved = localStorage.getItem('presetCloseReminders');
    presetCloseReminders = saved === 'true';
    if (closeRemindersCheckbox) {
      closeRemindersCheckbox.checked = presetCloseReminders;
    }
  } catch (error) {
    console.error('加载预设关闭提醒失败:', error);
    presetCloseReminders = false;
    if (closeRemindersCheckbox) closeRemindersCheckbox.checked = false;
  }
}

// 保存预设关闭提醒
function savePresetCloseReminders() {
  try {
    if (closeRemindersCheckbox) {
      presetCloseReminders = !!closeRemindersCheckbox.checked;
    }
    localStorage.setItem('presetCloseReminders', String(presetCloseReminders));
    showToast('关闭提醒已保存');
  } catch (error) {
    console.error('保存预设关闭提醒失败:', error);
  }
}

// 加载蓝图预设映射（ProjectGuid -> Blueprint preset）
function loadPresetBlueprints() {
  try {
    const saved = localStorage.getItem('presetBlueprints');
    presetBlueprints = saved ? JSON.parse(saved) : {};
    renderBlueprintPresetsList();
  } catch (error) {
    console.error('加载蓝图预设失败:', error);
    presetBlueprints = {};
    renderBlueprintPresetsList();
  }
}

// 保存蓝图预设映射
function savePresetBlueprints() {
  try {
    localStorage.setItem('presetBlueprints', JSON.stringify(presetBlueprints || {}));
    renderBlueprintPresetsList();
    showToast('蓝图预设已保存');
  } catch (error) {
    console.error('保存蓝图预设失败:', error);
  }
}

// 渲染蓝图预设列表
function renderBlueprintPresetsList() {
  try {
    if (!blueprintPresetsList) return;
    const map = presetBlueprints || {};
    const keys = Object.keys(map);
    if (keys.length === 0) {
      blueprintPresetsList.innerHTML = '<p style="color:#888;">暂无蓝图预设</p>';
      return;
    }
    // 使用DOM构建并绑定事件，避免内联onclick不生效
  const ul = document.createElement('ul');
  ul.className = 'preset-list';
  keys.forEach((projectKey) => {
    const bp = map[projectKey] || {};
    const name = bp.BluePrint_Formal || '(未命名蓝图)';
    const projName = bp.ProjectName || projectKey || '(未命名项目)';
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'preset-info';
    const spanProj = document.createElement('span');
    spanProj.textContent = `项目: ${projName}`;
    const spanName = document.createElement('span');
    spanName.textContent = `蓝图: ${name}`;
    spanName.style.marginLeft = '8px';
    info.appendChild(spanProj);
    info.appendChild(spanName);
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '×';
    delBtn.title = '删除';
    delBtn.dataset.key = projectKey;
    delBtn.dataset.type = 'blueprint';
    delBtn.addEventListener('click', (ev) => {
      try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
      showToast('正在删除蓝图预设…');
      removeBlueprintPreset(projectKey);
    });
    li.appendChild(info);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
    blueprintPresetsList.innerHTML = '';
    blueprintPresetsList.appendChild(ul);
  } catch (error) {
    console.error('渲染蓝图预设列表失败:', error);
  }
}

// 删除单个蓝图预设
function removeBlueprintPreset(projectKey) {
  try {
    if (!projectKey) return;
    if (presetBlueprints && presetBlueprints[projectKey]) {
      const oldPresets = {...presetBlueprints};
      delete presetBlueprints[projectKey];
      try {
        // 如果删除后对象为空，则完全删除localStorage中的键
        if (Object.keys(presetBlueprints).length === 0) {
          localStorage.removeItem('presetBlueprints');
        } else {
          localStorage.setItem('presetBlueprints', JSON.stringify(presetBlueprints));
        }
        // 重新从localStorage加载以确保数据一致性
        loadPresetBlueprints();
        showToast('已删除蓝图预设');
      } catch (err) {
        console.error('删除蓝图预设时保存失败:', err);
        presetBlueprints = oldPresets; // 还原数据
        renderBlueprintPresetsList();
        showToast('删除蓝图预设失败');
      }
    }
  } catch (error) {
    console.error('删除蓝图预设失败:', error);
    showToast('删除蓝图预设失败');
  }
}

// 暴露到窗口，供列表删除按钮调用
window.removeBlueprintPreset = removeBlueprintPreset;

// 加载“自动应用蓝图”设置
function loadPresetBlueprintAutoApply() {
  try {
    const saved = localStorage.getItem('presetBlueprintAutoApply');
    presetBlueprintAutoApply = saved === null ? true : (saved === 'true');
    if (blueprintAutoApplyCheckbox) {
      blueprintAutoApplyCheckbox.checked = !!presetBlueprintAutoApply;
    }
  } catch (error) {
    console.error('加载蓝图自动应用设置失败:', error);
    presetBlueprintAutoApply = true;
    if (blueprintAutoApplyCheckbox) blueprintAutoApplyCheckbox.checked = true;
  }
}

// 保存“自动应用蓝图”设置
function savePresetBlueprintAutoApply() {
  try {
    presetBlueprintAutoApply = !!(blueprintAutoApplyCheckbox && blueprintAutoApplyCheckbox.checked);
    localStorage.setItem('presetBlueprintAutoApply', String(presetBlueprintAutoApply));
    showToast('蓝图自动应用设置已保存');
  } catch (error) {
    console.error('保存蓝图自动应用设置失败:', error);
  }
}

// ===================== 任务审核人预设：存储与渲染 =====================
function loadPresetTaskReviewers() {
  try {
    const saved = localStorage.getItem('presetTaskReviewers');
    presetTaskReviewers = saved ? JSON.parse(saved) : {};
    renderTaskReviewerPresetsList();
  } catch (error) {
    console.error('加载任务审核人预设失败:', error);
    presetTaskReviewers = {};
    renderTaskReviewerPresetsList();
  }
}

function savePresetTaskReviewers() {
  try {
    localStorage.setItem('presetTaskReviewers', JSON.stringify(presetTaskReviewers || {}));
    renderTaskReviewerPresetsList();
    showToast('任务审核人预设已保存');
  } catch (error) {
    console.error('保存任务审核人预设失败:', error);
  }
}

function renderTaskReviewerPresetsList() {
  try {
    if (!taskReviewerPresetsList) return;
    const map = presetTaskReviewers || {};
    const keys = Object.keys(map);
    if (keys.length === 0) {
      taskReviewerPresetsList.innerHTML = '<p style="color:#888;">暂无任务审核人预设</p>';
      return;
    }
  const ul = document.createElement('ul');
  ul.className = 'preset-list';
  keys.forEach((projectKey) => {
    const tr = map[projectKey] || {};
    const name = tr.TaskReviewerName || '(未命名审核人)';
    const projName = tr.ProjectName || projectKey || '(未命名项目)';
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'preset-info';
    const spanProj = document.createElement('span');
    spanProj.textContent = `项目: ${projName}`;
    const spanName = document.createElement('span');
    spanName.textContent = `审核人: ${name}`;
    spanName.style.marginLeft = '8px';
    info.appendChild(spanProj);
    info.appendChild(spanName);
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '×';
    delBtn.title = '删除';
    delBtn.dataset.key = projectKey;
    delBtn.dataset.type = 'taskreviewer';
    delBtn.addEventListener('click', (ev) => {
      try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
      showToast('正在删除任务审核人预设…');
      removeTaskReviewerPreset(projectKey);
    });
    li.appendChild(info);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
    taskReviewerPresetsList.innerHTML = '';
    taskReviewerPresetsList.appendChild(ul);
  } catch (error) {
    console.error('渲染任务审核人预设列表失败:', error);
  }
}

function removeTaskReviewerPreset(projectKey) {
  try {
    if (!projectKey) return;
    if (presetTaskReviewers && presetTaskReviewers[projectKey]) {
      const oldPresets = {...presetTaskReviewers};
      delete presetTaskReviewers[projectKey];
      try {
        // 如果删除后对象为空，则完全删除localStorage中的键
        if (Object.keys(presetTaskReviewers).length === 0) {
          localStorage.removeItem('presetTaskReviewers');
        } else {
          localStorage.setItem('presetTaskReviewers', JSON.stringify(presetTaskReviewers));
        }
        // 重新从localStorage加载以确保数据一致性
        loadPresetTaskReviewers();
        showToast('已删除任务审核人预设');
      } catch (err) {
        console.error('删除任务审核人预设时保存失败:', err);
        presetTaskReviewers = oldPresets; // 还原数据
        renderTaskReviewerPresetsList();
        showToast('删除任务审核人预设失败');
      }
    }
  } catch (error) {
    console.error('删除任务审核人预设失败:', error);
    showToast('删除任务审核人预设失败');
  }
}

window.removeTaskReviewerPreset = removeTaskReviewerPreset;

function loadPresetTaskReviewerAutoApply() {
  try {
    const saved = localStorage.getItem('presetTaskReviewerAutoApply');
    presetTaskReviewerAutoApply = saved === null ? true : (saved === 'true');
    if (taskReviewerAutoApplyCheckbox) {
      taskReviewerAutoApplyCheckbox.checked = !!presetTaskReviewerAutoApply;
    }
  } catch (error) {
    console.error('加载任务审核人自动应用设置失败:', error);
    presetTaskReviewerAutoApply = true;
    if (taskReviewerAutoApplyCheckbox) taskReviewerAutoApplyCheckbox.checked = true;
  }
}

function savePresetTaskReviewerAutoApply() {
  try {
    presetTaskReviewerAutoApply = !!(taskReviewerAutoApplyCheckbox && taskReviewerAutoApplyCheckbox.checked);
    localStorage.setItem('presetTaskReviewerAutoApply', String(presetTaskReviewerAutoApply));
    showToast('任务审核人自动应用设置已保存');
  } catch (error) {
    console.error('保存任务审核人自动应用设置失败:', error);
  }
}

// ===================== 任务审核人预设：捕获与应用 =====================
function captureCurrentTaskReviewerFromOA() {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      showToast('请在扩展环境中使用此功能');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { showToast('未找到活动标签页'); return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { showToast('请在OA页面使用捕获功能'); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        func: function() {
          try {
            var w = window; var miniObj = w.mini; var doc = document;
            function getCtrl(id) { try { return miniObj && miniObj.get && miniObj.get(id); } catch(e) { return null; } }
            function getValue(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var v = '';
              try {
                if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || '';
                else if (el) v = (el.value || el.textContent || '').trim();
              } catch (e) {}
              return v || '';
            }
            function getText(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var t = '';
              try {
                if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || '';
                else if (el) t = (el.innerText || el.textContent || '').trim();
              } catch (e) {}
              return t || '';
            }
            var projectName = (getText('lblProjectName') || getValue('ProjectName') || '').trim();
            var projectGuid = getValue('ProjectGuid');
            if (!projectGuid) { try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {} }
            // 可能的审核人控件/隐藏域ID集合
            var nameIds = ['sender','TaskReviewer','MissionReviewer','MissionCheckMan','CheckMan','AuditUser','ShenHeRen','MissionAuditUser'];
            var guidIds = ['senderguid','TaskReviewerGuid','MissionReviewerGuid','MissionCheckManGuid','CheckManGuid','AuditUserGuid','ShenHeRenGuid','MissionAuditUserGuid'];
            var altNameIds = ['sender','TaskReviewerName','MissionReviewerName','MissionCheckManName','CheckManName','AuditUserName','ShenHeRenName'];
            var reviewerGuid = '';
            var reviewerName = '';
            // 从控件优先读取：文本用于姓名，值用于GUID（若看起来像GUID）
            for (var i=0;i<nameIds.length;i++){
              var id = nameIds[i];
              if (!reviewerName) {
                var t = getText(id);
                if (t) reviewerName = t;
              }
              if (!reviewerGuid) {
                var v = getValue(id);
                // 简单判断是否为GUID（包含连字符或较长的十六进制串）
                if (v && (/^[0-9a-fA-F-]{8,}$/.test(v))) reviewerGuid = v;
              }
            }
            // 再尝试从常见隐藏域读取GUID
            for (var j=0;j<guidIds.length;j++){ var gid = guidIds[j]; var gv = getValue(gid); if (!reviewerGuid && gv) reviewerGuid = gv; }
            // 兜底从备用name隐藏域读取姓名
            for (var k=0;k<altNameIds.length;k++){ var nid = altNameIds[k]; if (!reviewerName) { var nv = getValue(nid); if (nv) reviewerName = nv; } }
            // 简单的文本校正（避免取到label文字）
            reviewerName = (reviewerName || '').replace(/^[^:：]*[:：]\s*/, '').trim();
            var preset = {
              ProjectName: projectName,
              ProjectGuid: projectGuid,
              TaskReviewerGuid: reviewerGuid,
              TaskReviewerName: reviewerName
            };
            if (!preset.ProjectName) return null;
            if (!preset.TaskReviewerGuid && !preset.TaskReviewerName) return null;
            return preset;
          } catch (e) {
            console.error('[CaptureTaskReviewer] injection error:', e);
            return null;
          }
        }
      }, (results) => {
        try {
          const arr = Array.isArray(results) ? results : [];
          const found = arr.map(r => r && r.result).find(r => r && r.ProjectName);
          if (!found) { showToast('未捕获到任务审核人，请先在OA页选择'); return; }
          const key = (found.ProjectName || '').trim();
          if (!key) { showToast('无法识别项目名称'); return; }
          presetTaskReviewers[key] = found;
          savePresetTaskReviewers();
          showToast('已捕获并保存任务审核人预设');
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          showToast('捕获任务审核人失败');
        }
      });
    });
  } catch (error) {
    console.error('捕获当前任务审核人失败:', error);
  }
}

function applyTaskReviewerPresetToOA() {
  try {
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
        args: [presetTaskReviewers || {}],
        func: function(map) {
          try {
            (function(){
              var tries = 10; var delay = 700;
              function run(doc){
                var w = doc.defaultView || window; var miniObj = w.mini;
                function getCtrl(id){ try { return miniObj && miniObj.get && miniObj.get(id); } catch(e){ return null; } }
                function getValue(id) { var ctrl = getCtrl(id); var el = doc.getElementById(id); var v = ''; try { if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || ''; else if (el) v = (el.value || el.textContent || '').trim(); } catch (e) {} return v || ''; }
                function getText(id) { var ctrl = getCtrl(id); var el = doc.getElementById(id); var t = ''; try { if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || ''; else if (el) t = (el.innerText || el.textContent || '').trim(); } catch (e) {} return t || ''; }
                var projectName = (getText('lblProjectName') || getValue('ProjectName') || '').trim();
                var projectGuid = getValue('ProjectGuid');
                if (!projectGuid) { try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {} }
                var preset = (projectName && map && map[projectName]) || (projectGuid && map && map[projectGuid]);
                if (!preset) return false;

                var beforeFrames = Array.prototype.slice.call(doc.querySelectorAll('iframe'));
                function findSelectIframe(){
                  var frames = doc.querySelectorAll('iframe');
                  for (var i = frames.length - 1; i >= 0; i--) {
                    var f = frames[i];
                    try {
                      var p = f.parentNode;
                      var src = f.src || '';
                      var isDialog = p && p.className && p.className.indexOf('mini-window') >= 0;
                      var looksNew = beforeFrames.indexOf(f) === -1;
                      var isUserSel = /(sender|user|person|employee|selectuser|selectperson)/i.test(src);
                      if (isDialog || looksNew || isUserSel) return f;
                    } catch(e) {}
                  }
                  return null;
                }
                function makePresetData(){
                  // 与蓝图、工作场景保持一致，提供通用字段名称以兼容父页回调
                  var guid = preset.TaskReviewerGuid || '';
                  var name = preset.TaskReviewerName || '';
                  return {
                    // 通用字段
                    Guid: guid,
                    Name: name,
                    // 选择窗口常见字段
                    value: guid,
                    text: name,
                    title: name,
                    rowguid: guid,
                    // 兼容页面自定义字段
                    sender: name,
                    senderguid: guid,
                    TaskReviewerName: name,
                    TaskReviewerGuid: guid
                  };
                }
                function patchChildAndConfirm(child){
                  try {
                    var cw = child.contentWindow; var cd = child.contentDocument;
                    if (!cw || !cd) return false;
                    var data = makePresetData();
                    try { cw.GetData = function(){ return data; }; } catch(e) {}
                    if (typeof cw.CloseOwnerWindow === 'function') { cw.CloseOwnerWindow(data); return true; }
                    var btns = cd.querySelectorAll('button,input[type=button],a');
                    for (var i = 0; i < btns.length; i++) {
                      var txt = (btns[i].innerText || btns[i].value || btns[i].textContent || '').trim();
                      if (/^(确定|选择|选中|OK|Ok)$/i.test(txt)) { try { btns[i].click(); return true; } catch(e) {} }
                    }
                    return false;
                  } catch(e) { return false; }
                }

                var child = findSelectIframe();
                if (child && patchChildAndConfirm(child)) { return true; }

                // 回调兜底
                try {
                  if (typeof w.CallBack_SelSender === 'function') { w.CallBack_SelSender(makePresetData()); return true; }
                } catch(e) {}

                // 最后兜底：直接设置控件与隐藏域，并触发change
                try {
                  var ids = ['sender','TaskReviewer','MissionReviewer','MissionCheckMan','CheckMan','AuditUser','ShenHeRen','MissionAuditUser'];
                  for (var i=0;i<ids.length;i++){
                    var ctrl = getCtrl(ids[i]);
                    if (ctrl && typeof ctrl.setText === 'function') ctrl.setText(preset.TaskReviewerName || '');
                    // 严格只在有GUID时设置值，避免把姓名写入value导致提交流程错误
                    if (ctrl && typeof ctrl.setValue === 'function') ctrl.setValue(preset.TaskReviewerGuid || '');
                    var el = doc.getElementById(ids[i]); if (el) { try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch(e) {} }
                  }
                  var guidIds = ['senderguid','TaskReviewerGuid','MissionReviewerGuid','MissionCheckManGuid','CheckManGuid','AuditUserGuid','ShenHeRenGuid','MissionAuditUserGuid'];
                  for (var j=0;j<guidIds.length;j++){ var elg = doc.getElementById(guidIds[j]); if (elg) elg.value = preset.TaskReviewerGuid || ''; }
                  var nameIds = ['TaskReviewerName','MissionReviewerName','MissionCheckManName','CheckManName','AuditUserName','ShenHeRenName'];
                  for (var k=0;k<nameIds.length;k++){ var eln = doc.getElementById(nameIds[k]); if (eln) eln.value = preset.TaskReviewerName || ''; }
                  // 输出提示控件（若存在），显示当前选择的审核人
                  var sendersmCtrl = getCtrl('sendersm');
                  if (sendersmCtrl && typeof sendersmCtrl.setValue === 'function') sendersmCtrl.setValue(preset.TaskReviewerName || '');
                  return true;
                } catch (e) { return false; }
              }
              function runner(){
                var done = false;
                try { done = run(document); } catch (e) {}
                if (!done) {
                  var iframes = document.getElementsByTagName('iframe');
                  for (var i = 0; i < iframes.length && !done; i++) {
                    try {
                      var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                      if (doc) done = run(doc) || done;
                    } catch (e) {}
                  }
                }
                if (!done && tries > 0) { tries--; setTimeout(runner, delay); }
              }
              runner();
            })();
            return 'ok';
          } catch (e) {
            console.error('[ApplyTaskReviewer] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        console.log('[ApplyTaskReviewer] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动应用任务审核人预设失败:', error);
  }
}

// 加载工作场景预设映射（ProjectName -> StageDemand preset）
function loadPresetStageDemands() {
  try {
    const saved = localStorage.getItem('presetStageDemands');
    presetStageDemands = saved ? JSON.parse(saved) : {};
    renderStageDemandPresetsList();
  } catch (error) {
    console.error('加载工作场景预设失败:', error);
    presetStageDemands = {};
    renderStageDemandPresetsList();
  }
}

// 保存工作场景预设映射
function savePresetStageDemands() {
  try {
    localStorage.setItem('presetStageDemands', JSON.stringify(presetStageDemands || {}));
    renderStageDemandPresetsList();
    showToast('工作场景预设已保存');
  } catch (error) {
    console.error('保存工作场景预设失败:', error);
  }
}

// 渲染工作场景预设列表
function renderStageDemandPresetsList() {
  try {
    if (!stageDemandPresetsList) return;
    const map = presetStageDemands || {};
    const keys = Object.keys(map);
    if (keys.length === 0) {
      stageDemandPresetsList.innerHTML = '<p style="color:#888;">暂无工作场景预设</p>';
      return;
    }
  const ul = document.createElement('ul');
  ul.className = 'preset-list';
  keys.forEach((projectKey) => {
    const sd = map[projectKey] || {};
    const name = sd.StageDemandName || '(未命名工作场景)';
    const projName = sd.ProjectName || projectKey || '(未命名项目)';
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.className = 'preset-info';
    const spanProj = document.createElement('span');
    spanProj.textContent = `项目: ${projName}`;
    const spanName = document.createElement('span');
    spanName.textContent = `工作场景: ${name}`;
    spanName.style.marginLeft = '8px';
    info.appendChild(spanProj);
    info.appendChild(spanName);
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '×';
    delBtn.title = '删除';
    delBtn.dataset.key = projectKey;
    delBtn.dataset.type = 'stagedemand';
    delBtn.addEventListener('click', (ev) => {
      try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
      showToast('正在删除工作场景预设…');
      removeStageDemandPreset(projectKey);
    });
    li.appendChild(info);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
    stageDemandPresetsList.innerHTML = '';
    stageDemandPresetsList.appendChild(ul);
  } catch (error) {
    console.error('渲染工作场景预设列表失败:', error);
  }
}

// 删除单个工作场景预设
function removeStageDemandPreset(projectKey) {
  try {
    if (!projectKey) return;
    if (presetStageDemands && presetStageDemands[projectKey]) {
      const oldPresets = {...presetStageDemands};
      delete presetStageDemands[projectKey];
      try {
        // 如果删除后对象为空，则完全删除localStorage中的键
        if (Object.keys(presetStageDemands).length === 0) {
          localStorage.removeItem('presetStageDemands');
        } else {
          localStorage.setItem('presetStageDemands', JSON.stringify(presetStageDemands));
        }
        // 重新从localStorage加载以确保数据一致性
        loadPresetStageDemands();
        showToast('已删除工作场景预设');
      } catch (err) {
        console.error('删除工作场景预设时保存失败:', err);
        presetStageDemands = oldPresets; // 还原数据
        renderStageDemandPresetsList();
        showToast('删除工作场景预设失败');
      }
    }
  } catch (error) {
    console.error('删除工作场景预设失败:', error);
    showToast('删除工作场景预设失败');
  }
}

// 暴露到窗口，供列表删除按钮调用
window.removeStageDemandPreset = removeStageDemandPreset;

// 加载“自动应用工作场景”设置
function loadPresetStageDemandAutoApply() {
  try {
    const saved = localStorage.getItem('presetStageDemandAutoApply');
    presetStageDemandAutoApply = saved === null ? true : (saved === 'true');
    if (stageDemandAutoApplyCheckbox) {
      stageDemandAutoApplyCheckbox.checked = !!presetStageDemandAutoApply;
    }
  } catch (error) {
    console.error('加载工作场景自动应用设置失败:', error);
    presetStageDemandAutoApply = true;
    if (stageDemandAutoApplyCheckbox) stageDemandAutoApplyCheckbox.checked = true;
  }
}

// 保存“自动应用工作场景”设置
function savePresetStageDemandAutoApply() {
  try {
    presetStageDemandAutoApply = !!(stageDemandAutoApplyCheckbox && stageDemandAutoApplyCheckbox.checked);
    localStorage.setItem('presetStageDemandAutoApply', String(presetStageDemandAutoApply));
    showToast('工作场景自动应用设置已保存');
  } catch (error) {
    console.error('保存工作场景自动应用设置失败:', error);
  }
}

// 从当前激活的OA页面捕获工作场景信息并保存为预设
function captureCurrentStageDemandFromOA() {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      showToast('请在扩展环境中使用此功能');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { showToast('未找到活动标签页'); return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { showToast('请在OA页面使用捕获功能'); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        func: function() {
          try {
            var w = window; var miniObj = w.mini; var doc = document;
            function getCtrl(id) { try { return miniObj && miniObj.get && miniObj.get(id); } catch(e) { return null; } }
            function getValue(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var v = '';
              try {
                if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || '';
                else if (el) v = (el.value || el.textContent || '').trim();
              } catch (e) {}
              return v || '';
            }
            function getText(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var t = '';
              try {
                if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || '';
                else if (el) t = (el.innerText || el.textContent || '').trim();
              } catch (e) {}
              return t || '';
            }
            var projectName = getText('lblProjectName') || getValue('ProjectName');
            var projectGuid = getValue('ProjectGuid');
            if (!projectGuid) { try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {} }
            var sdGuid = getValue('stagedemand') || getValue('stagedemandguid');
            var sdName = getText('stagedemand') || getValue('stagedemandname');
            var preset = {
              ProjectName: projectName,
              ProjectGuid: projectGuid,
              StageDemandGuid: sdGuid,
              StageDemandName: sdName
            };
            if (!preset.ProjectName) return null;
            if (!preset.StageDemandGuid) return null;
            return preset;
          } catch (e) {
            console.error('[CaptureStageDemand] injection error:', e);
            return null;
          }
        }
      }, (results) => {
        try {
          const arr = Array.isArray(results) ? results : [];
          const found = arr.map(r => r && r.result).find(r => r && r.ProjectName);
          if (!found) { showToast('未捕获到工作场景，请先在OA页选择工作场景'); return; }
          const key = found.ProjectName;
          presetStageDemands[key] = found;
          savePresetStageDemands();
          showToast('已捕获并保存工作场景预设');
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          showToast('捕获工作场景失败');
        }
      });
    });
  } catch (error) {
    console.error('捕获当前工作场景失败:', error);
  }
}

// 在当前激活的OA页应用工作场景预设（根据项目名称优先匹配，兼容GUID）
function applyStageDemandPresetToOA() {
  try {
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
        args: [presetStageDemands || {}],
        func: function(map) {
          try {
            (function(){
              var tries = 10; var delay = 700;
              function run(doc){
                var w = doc.defaultView || window; var miniObj = w.mini;
                function getCtrl(id){ try { return miniObj && miniObj.get && miniObj.get(id); } catch(e){ return null; } }
                function getValue(id) {
                  var ctrl = getCtrl(id); var el = doc.getElementById(id);
                  var v = '';
                  try {
                    if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || '';
                    else if (el) v = (el.value || el.textContent || '').trim();
                  } catch (e) {}
                  return v || '';
                }
                function getText(id) {
                  var ctrl = getCtrl(id); var el = doc.getElementById(id);
                  var t = '';
                  try {
                    if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || '';
                    else if (el) t = (el.innerText || el.textContent || '').trim();
                  } catch (e) {}
                  return t || '';
                }
                var projectName = getText('lblProjectName') || getValue('ProjectName');
                var projectGuid = getValue('ProjectGuid');
                if (!projectGuid) { try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {} }
                var preset = (projectName && map && map[projectName]) || (projectGuid && map && map[projectGuid]);
                if (!preset) return false;

                var beforeFrames = Array.prototype.slice.call(doc.querySelectorAll('iframe'));
                function findSelectIframe(){
                  var frames = doc.querySelectorAll('iframe');
                  for (var i = frames.length - 1; i >= 0; i--) {
                    var f = frames[i];
                    try {
                      var p = f.parentNode;
                      var src = f.src || '';
                      var isDialog = p && p.className && p.className.indexOf('mini-window') >= 0;
                      var looksNew = beforeFrames.indexOf(f) === -1;
                      var isSD = /(stage|demand|stagedemand)/i.test(src);
                      if (isDialog || looksNew || isSD) return f;
                    } catch(e) {}
                  }
                  return null;
                }
                function makePresetData(){
                  // 兼容 epoint.openDialog 回调的 rtnValue.title / rtnValue.rowguid
                  return {
                    // 标准字段
                    Guid: preset.StageDemandGuid || '',
                    StageDemandGuid: preset.StageDemandGuid || '',
                    Name: preset.StageDemandName || '',
                    StageDemandName: preset.StageDemandName || '',
                    // epoint.openDialog 期望字段
                    title: preset.StageDemandName || '',
                    rowguid: preset.StageDemandGuid || ''
                  };
                }
                function patchChildAndConfirm(child){
                  try {
                    var cw = child.contentWindow; var cd = child.contentDocument;
                    if (!cw || !cd) return false;
                    var data = makePresetData();
                    try { cw.GetData = function(){ return data; }; } catch(e) {}
                    if (typeof cw.CloseOwnerWindow === 'function') { cw.CloseOwnerWindow(data); return true; }
                    var btns = cd.querySelectorAll('button,input[type=button],a');
                    for (var i = 0; i < btns.length; i++) {
                      var txt = (btns[i].innerText || btns[i].value || btns[i].textContent || '').trim();
                      if (/^(确定|选择|选中|OK|Ok)$/i.test(txt)) { try { btns[i].click(); return true; } catch(e) {} }
                    }
                    return false;
                  } catch(e) { return false; }
                }

                var child = findSelectIframe();
                if (child && patchChildAndConfirm(child)) { return true; }

                // 兜底：直接调用父页可能存在的工作场景回调
                try { if (typeof w.CallBack_SelStageDemand === 'function') { w.CallBack_SelStageDemand(makePresetData()); return true; } } catch(e) {}

                // 最后兜底：直接设置控件值与隐藏域，并触发change，且触发 changedListInfo(4)
                try {
                  var sdCtrl = miniObj && miniObj.get && miniObj.get('stagedemand');
                  if (sdCtrl && typeof sdCtrl.setText === 'function') sdCtrl.setText(preset.StageDemandName || '');
                  if (sdCtrl && typeof sdCtrl.setValue === 'function') sdCtrl.setValue(preset.StageDemandGuid || '');
                  var sdGuidEl = doc.getElementById('stagedemandguid'); if (sdGuidEl) sdGuidEl.value = preset.StageDemandGuid || '';
                  var sdNameEl = doc.getElementById('stagedemandname'); if (sdNameEl) sdNameEl.value = preset.StageDemandName || '';
                  var el = doc.getElementById('stagedemand'); if (el) { try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch(e) {} }
                  // 根据页面逻辑触发联动更新
                  try { if (typeof w.changedListInfo === 'function') w.changedListInfo(4); } catch(e) {}
                  return true;
                } catch (e) { return false; }
              }
              function runner(){
                var done = false;
                try { done = run(document); } catch (e) {}
                if (!done) {
                  var iframes = document.getElementsByTagName('iframe');
                  for (var i = 0; i < iframes.length && !done; i++) {
                    try {
                      var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                      if (doc) done = run(doc) || done;
                    } catch (e) {}
                  }
                }
                if (!done && tries > 0) { tries--; setTimeout(runner, delay); }
              }
              runner();
            })();
            return 'ok';
          } catch (e) {
            console.error('[ApplyStageDemand] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        console.log('[ApplyStageDemand] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动应用工作场景预设失败:', error);
  }
}

// 从当前激活的OA页面捕获蓝图信息并保存为预设
function captureCurrentBlueprintFromOA() {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      showToast('请在扩展环境中使用此功能');
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { showToast('未找到活动标签页'); return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { showToast('请在OA页面使用捕获功能'); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'MAIN',
        func: function() {
          try {
            var w = window; var miniObj = w.mini; var doc = document;
            function getCtrl(id) { try { return miniObj && miniObj.get && miniObj.get(id); } catch(e) { return null; } }
            function getValue(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var v = '';
              try {
                if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || '';
                else if (el) v = (el.value || el.textContent || '').trim();
              } catch (e) {}
              return v || '';
            }
            function getText(id) {
              var ctrl = getCtrl(id); var el = doc.getElementById(id);
              var t = '';
              try {
                if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || '';
                else if (el) t = (el.innerText || el.textContent || '').trim();
              } catch (e) {}
              return t || '';
            }
            var projectName = getText('lblProjectName') || getValue('ProjectName');
            var projectGuid = getValue('ProjectGuid');
            if (!projectGuid) { try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {} }
            var bpGuid = getValue('BluePrint_Formal');
            var ylgzmoney = getValue('ylgzmoney');
            var hasYLGZRaw = getValue('HasYLGZ');
            var hasYLGZ = hasYLGZRaw || (((parseFloat(ylgzmoney) || 0) > 0) ? '1' : '0');
            var preset = {
              ProjectName: projectName,
              ProjectGuid: projectGuid,
              BluePrint_FormalGuid: bpGuid,
              BluePrint_Formal: getText('BluePrint_Formal'),
              BluePrintLevel: getValue('BluePrintLevel'),
              ContractGuid: getValue('ContractGuid'),
              IsWYSJSHT: getValue('IsWYSJSHT'),
              ContractNumber: getValue('contractnumber'),
              YLGZMoney: ylgzmoney,
              HasYLGZ: hasYLGZ
            };
            if (!preset.ProjectName) return null;
            if (!preset.BluePrint_FormalGuid) return null;
            return preset;
          } catch (e) {
            console.error('[CaptureBlueprint] injection error:', e);
            return null;
          }
        }
      }, (results) => {
        try {
          const arr = Array.isArray(results) ? results : [];
          const found = arr.map(r => r && r.result).find(r => r && r.ProjectName);
          if (!found) { showToast('未捕获到蓝图，请先在OA页选择蓝图'); return; }
          const key = found.ProjectName;
          presetBlueprints[key] = found;
          savePresetBlueprints();
          showToast('已捕获并保存蓝图预设');
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          showToast('捕获蓝图失败');
        }
      });
    });
  } catch (error) {
    console.error('捕获当前蓝图失败:', error);
  }
}

// 在当前激活的OA页应用蓝图预设（根据ProjectGuid自动匹配）
function applyBlueprintPresetToOA() {
  try {
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
        args: [presetBlueprints || {}],
        func: function(map) {
          try {
            (function(){
              var tries = 10; var delay = 700; var attemptedFallback = false;

              function run(doc){
                var w = doc.defaultView || window; var miniObj = w.mini;
                function getCtrl(id){ try { return miniObj && miniObj.get && miniObj.get(id); } catch(e){ return null; } }
                function getValue(id) {
                  var ctrl = getCtrl(id); var el = doc.getElementById(id);
                  var v = '';
                  try {
                    if (ctrl && typeof ctrl.getValue === 'function') v = ctrl.getValue() || '';
                    else if (el) v = (el.value || el.textContent || '').trim();
                  } catch (e) {}
                  return v || '';
                }
                function getText(id) {
                  var ctrl = getCtrl(id); var el = doc.getElementById(id);
                  var t = '';
                  try {
                    if (ctrl && typeof ctrl.getText === 'function') t = ctrl.getText() || '';
                    else if (el) t = (el.innerText || el.textContent || '').trim();
                  } catch (e) {}
                  return t || '';
                }
                var projectName = getText('lblProjectName') || getValue('ProjectName');
                var projectGuid = getValue('ProjectGuid');
                if (!projectGuid) {
                  try { projectGuid = new URL(w.location.href).searchParams.get('ProjectGuid') || ''; } catch (e) {}
                }
                var preset = (projectName && map && map[projectName]) || (projectGuid && map && map[projectGuid]);
                if (!preset) return false;

                var beforeFrames = Array.prototype.slice.call(doc.querySelectorAll('iframe'));

                function findSelectIframe(){
                  var frames = doc.querySelectorAll('iframe');
                  for (var i = frames.length - 1; i >= 0; i--) {
                    var f = frames[i];
                    try {
                      var p = f.parentNode;
                      var src = f.src || '';
                      var isDialog = p && p.className && p.className.indexOf('mini-window') >= 0;
                      var looksNew = beforeFrames.indexOf(f) === -1;
                      var isBp = /blueprint/i.test(src);
                      if (isDialog || looksNew || isBp) return f;
                    } catch(e) {}
                  }
                  return null;
                }

                function makePresetData(){
                  var data = {
                    Guid: preset.BluePrint_FormalGuid || preset.BluePrintGuid || '',
                    BluePrintGuid: preset.BluePrint_FormalGuid || '',
                    BluePrint_FormalGuid: preset.BluePrint_FormalGuid || '',
                    Name: preset.BluePrint_Formal || '',
                    BluePrintName: preset.BluePrint_Formal || '',
                    BluePrint_Formal: preset.BluePrint_Formal || '',
                    Level: preset.BluePrintLevel || '',
                    BluePrintLevel: preset.BluePrintLevel || '',
                    ContractGuid: preset.ContractGuid || '',
                    IsWYSJSHT: preset.IsWYSJSHT || '',
                    ContractNumber: preset.ContractNumber || ''
                  };
                  // 兼容遗留工作字段
                  if (typeof preset.YLGZMoney !== 'undefined') { data.YLGZMoney = preset.YLGZMoney; }
                  if (typeof preset.HasYLGZ !== 'undefined') { data.HasYLGZ = preset.HasYLGZ; }
                  return data;
                }

                function patchChildAndConfirm(child){
                  try {
                    var cw = child.contentWindow; var cd = child.contentDocument;
                    if (!cw || !cd) return false;
                    var data = makePresetData();
                    try { cw.GetData = function(){ return data; }; } catch(e) {}

                    // 将数据对象作为参数关闭窗口，父页的回调将直接拿到对象
                    if (typeof cw.CloseOwnerWindow === 'function') { cw.CloseOwnerWindow(data); return true; }

                    var btns = cd.querySelectorAll('button,input[type=button],a');
                    for (var i = 0; i < btns.length; i++) {
                      var txt = (btns[i].innerText || btns[i].value || btns[i].textContent || '').trim();
                      if (/^(确定|选择|选中|OK|Ok)$/i.test(txt)) { try { btns[i].click(); return true; } catch(e) {} }
                    }
                    return false;
                  } catch(e) { return false; }
                }

                // 若用户已手动打开选择窗口，直接在子窗体中注入并确认
                var child = findSelectIframe();
                if (child && patchChildAndConfirm(child)) { return true; }

                // 第二兜底：直接调用父页回调，绕过弹窗
                try {
                  if (typeof w.CallBack_SelBluePrint === 'function') { w.CallBack_SelBluePrint(makePresetData()); return true; }
                } catch(e) {}

                // 最后兜底：直接设置控件值并触发相关事件，避免完全失败
                try {
                  var bpCtrl = getCtrl('BluePrint_Formal');
                  if (bpCtrl && typeof bpCtrl.setText === 'function') bpCtrl.setText(preset.BluePrint_Formal || '');
                  if (bpCtrl && typeof bpCtrl.setValue === 'function') bpCtrl.setValue(preset.BluePrint_FormalGuid || '');
                  var lvlCtrl = getCtrl('BluePrintLevel');
                  if (lvlCtrl && typeof lvlCtrl.setValue === 'function') lvlCtrl.setValue(preset.BluePrintLevel || '');
                  var oldContractGuid = getValue('ContractGuid');
                  var cgCtrl = getCtrl('ContractGuid');
                  if (cgCtrl && typeof cgCtrl.setValue === 'function') cgCtrl.setValue(preset.ContractGuid || '');
                  var jsCtrl = getCtrl('IsWYSJSHT');
                  if (jsCtrl && typeof jsCtrl.setValue === 'function') jsCtrl.setValue(preset.IsWYSJSHT || '');
                  var numCtrl = getCtrl('contractnumber');
                  if (numCtrl && typeof numCtrl.setValue === 'function') numCtrl.setValue(preset.ContractNumber || '');
                  if (oldContractGuid && oldContractGuid !== (preset.ContractGuid || '')) {
                    var senderCtrl = getCtrl('sender');
                    if (senderCtrl && typeof senderCtrl.setText === 'function') senderCtrl.setText('');
                    if (senderCtrl && typeof senderCtrl.setValue === 'function') senderCtrl.setValue('');
                    var sendersmCtrl = getCtrl('sendersm');
                    if (sendersmCtrl && typeof sendersmCtrl.setValue === 'function') sendersmCtrl.setValue('');
                  }

                  var el = doc.getElementById('BluePrint_Formal');
                  if (el) { try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch(e) {} }
                  attemptedFallback = true;
                  return true;
                } catch (e) { return false; }
              }

              function runner(){
                var done = false;
                try { done = run(document); } catch (e) {}
                // 跨iframe尝试（通常主页面即可）
                if (!done) {
                  var iframes = document.getElementsByTagName('iframe');
                  for (var i = 0; i < iframes.length && !done; i++) {
                    try {
                      var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                      if (doc) done = run(doc) || done;
                    } catch (e) {}
                  }
                }
                if (!done && tries > 0) { tries--; setTimeout(runner, delay); }
              }
              runner();
            })();
            return 'ok';
          } catch (e) {
            console.error('[ApplyBlueprint] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        console.log('[ApplyBlueprint] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动应用蓝图预设失败:', error);
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

// 在当前激活的OA页，根据预设隐藏帮助信息区域（fui-notice）
function autofillCloseRemindersToPage(enabled) {
  try {
    if (!enabled) return;
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
        args: [enabled],
        func: function(flag) {
          try {
            (function() {
              var tries = 5;
              var delay = 600;
              function hideHelpArea(doc) {
                try {
                  var els = doc.querySelectorAll('.fui-notice');
                  els && els.forEach(function(el){
                    el.style.display = 'none';
                    el.classList.add('hidden');
                  });
                } catch (e) {}
              }
              function tick() {
                hideHelpArea(document);
                var iframes = document.getElementsByTagName('iframe');
                for (var i = 0; i < iframes.length; i++) {
                  try {
                    var doc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
                    if (doc) hideHelpArea(doc);
                  } catch (e) {}
                }
                // 重复执行以抵御后续脚本重置显示
                if (tries > 0) { tries--; setTimeout(tick, delay); }
              }
              tick();
            })();
            return 'ok';
          } catch (e) {
            console.error('[CloseReminders] injection error:', e);
            return 'error';
          }
        }
      }, (results) => {
        console.log('[CloseReminders] injection results:', results);
      });
    });
  } catch (error) {
    console.error('自动隐藏帮助信息区域失败:', error);
  }
}