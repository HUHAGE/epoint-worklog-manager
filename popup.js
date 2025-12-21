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
// 当前活动的日期筛选（待申请/已申请）
let activePendingDateFilter = '';

// DOM元素
const tabButtons = document.querySelectorAll('.tab-button');
const pendingTab = document.getElementById('pending-tab');
const filledTab = document.getElementById('filled-tab');
const pendingLogsList = document.getElementById('pending-logs-list');
const filledLogsList = document.getElementById('filled-logs-list');
const projectTabs = document.querySelector('.project-tabs');
const presetProjectsBtn = document.getElementById('preset-projects-btn');
const presetModal = document.getElementById('preset-modal');
const closeModal = document.querySelector('.close-modal');
const presetProjectsList = document.getElementById('preset-projects-list');
const newPresetProject = document.getElementById('new-preset-project');
const addPresetProjectBtn = document.getElementById('add-preset-project-btn');
const toastContainer = document.getElementById('toast-container');
const demandTagSelect = document.getElementById('demand-tag-select');
const workTypeSelect = document.getElementById('work-type-select');
const closeRemindersCheckbox = document.getElementById('close-reminders-checkbox');
const groupByProjectCheckbox = document.getElementById('group-by-project-checkbox');
const captureBlueprintBtn = document.getElementById('capture-blueprint-btn');
const applyBlueprintBtn = document.getElementById('apply-blueprint-btn');
const blueprintAutoApplyCheckbox = document.getElementById('blueprint-auto-apply-checkbox');
const blueprintPresetsList = document.getElementById('blueprint-presets-list');
// 筛选栏元素引用（与popup.html一致）
const pendingProjectDropdown = document.getElementById('pending-project-filter');
const pendingDateFilter = document.getElementById('pending-date-filter');
const filledProjectDropdown = document.getElementById('filled-project-filter');
const filledDateFilter = document.getElementById('filled-date-filter');
// 任务状态筛选（待申请页面）
const pendingStatusFilter = document.getElementById('pending-status-filter');
// 选择模式与批量操作控件
const pendingSelectModeBtn = document.getElementById('pending-select-mode-btn');
const pendingSelectAllBtn = document.getElementById('pending-select-all-btn');
const pendingDeleteSelectedBtn = document.getElementById('pending-delete-selected-btn');
const filledSelectModeBtn = document.getElementById('filled-select-mode-btn');
  const filledSelectAllBtn = document.getElementById('filled-select-all-btn');
  const filledDeleteSelectedBtn = document.getElementById('filled-delete-selected-btn');
  // 可选：清除全部按钮（如果未在HTML中提供，则为null）
  const pendingClearAllBtn = document.getElementById('pending-clear-all-btn');
const filledClearAllBtn = document.getElementById('filled-clear-all-btn');
// 新增日志按钮
const addNewLogBtn = document.getElementById('add-new-log-btn');
// 模态框元素
const addLogModal = document.getElementById('add-log-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalSaveContinueBtn = document.getElementById('modal-save-continue-btn');
const modalAddLogForm = document.getElementById('modal-add-log-form');
const modalProjectSelect = document.getElementById('modal-project');
const modalProjectDatalist = document.getElementById('modal-project-list');
const modalTaskNameInput = document.getElementById('modal-task-name');
const modalContentTextarea = document.getElementById('modal-content');
const modalHoursInput = document.getElementById('modal-hours');
const modalDateInput = document.getElementById('modal-date');
const copyTaskToContentBtn = document.getElementById('copy-task-to-content-btn');
const autoCopyTaskContentSwitch = document.getElementById('auto-copy-task-to-content-switch');
const autoCopySwitchLabel = document.getElementById('auto-copy-switch-label');
const clearHoursBtn = document.getElementById('clear-hours-btn');
// 自动填充总开关与按钮 UI 引用
const autoFillPresetsCheckbox = document.getElementById('auto-fill-presets-checkbox');
const applyPresetsBtn = document.getElementById('apply-presets-btn');
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
const captureAllBtn = document.getElementById('capture-all-btn');
const unifiedPresetsList = document.getElementById('unified-presets-list');
const unifiedDetailsModal = document.getElementById('unified-details-modal');
const unifiedDetailsBody = document.getElementById('unified-details-body');
const unifiedDetailsCloseBtn = document.getElementById('unified-details-close-btn');
const unifiedDetailsCancelBtn = document.getElementById('unified-details-cancel-btn');
let presetDemandTag = '';
let presetWorkType = '';
let presetCloseReminders = false;
let presetBlueprints = {};
let presetBlueprintAutoApply = true;
let presetStageDemands = {};
let presetStageDemandAutoApply = true;
let presetTaskReviewers = {};
let presetTaskReviewerAutoApply = true;
let presetAutoFillPresets = true; // 预设配置自动填充总开关，默认开启
// 已申请日期筛选状态
let activeFilledDateFilter = '';
// 是否按项目分组展示（首页）
let groupByProjectEnabled = true;

// 选择模式状态与选中集合
let pendingSelectionMode = false;
let filledSelectionMode = false;
const pendingSelectedIds = new Set();
const filledSelectedIds = new Set();
// 待申请页面的任务状态筛选
let activePendingStatusFilter = 'pending';
let pendingAccordionState = {};

// 项目颜色分配函数
// 项目名称到颜色索引的映射缓存
let projectColorMapping = {};
let usedColorIndices = new Set();
let nextAvailableColorIndex = 0;

const UPDATE_URL = 'https://pan.quark.cn/s/46b7bbd538d7';
const LATEST_VERSION_URL = 'https://github.com/HUHAGE/epoint-worklog-manager/blob/main/latest-version.txt';

function getProjectColorIndex(projectName) {
  if (!projectName) return 0;
  
  // 如果已经有映射，直接返回
  if (projectColorMapping[projectName] !== undefined) {
    return projectColorMapping[projectName];
  }
  
  // 为新项目分配颜色索引
  let colorIndex;
  
  // 如果还有未使用的颜色索引，按顺序分配
  if (nextAvailableColorIndex < 10) {
    colorIndex = nextAvailableColorIndex;
    nextAvailableColorIndex++;
  } else {
    // 如果10种颜色都用完了，使用改进的哈希函数
    let hash = 0;
    for (let i = 0; i < projectName.length; i++) {
      const char = projectName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    colorIndex = Math.abs(hash) % 10;
  }
  
  // 缓存映射关系
  projectColorMapping[projectName] = colorIndex;
  usedColorIndices.add(colorIndex);
  
  return colorIndex;
}

// 初始化项目颜色映射
function initializeProjectColorMapping() {
  // 重置映射状态
  projectColorMapping = {};
  usedColorIndices = new Set();
  nextAvailableColorIndex = 0;
  
  // 收集所有项目名称
  const allProjects = new Set();
  
  // 从待填写日志中收集项目
  logs.pending.forEach(log => {
    if (log.project && log.project.trim()) {
      allProjects.add(log.project.trim());
    }
  });
  
  // 从已填写日志中收集项目
  logs.filled.forEach(log => {
    if (log.project && log.project.trim()) {
      allProjects.add(log.project.trim());
    }
  });
  
  // 为每个项目分配颜色索引
  Array.from(allProjects).forEach(projectName => {
    getProjectColorIndex(projectName);
  });
}

function fetchLatestVersionOnline(url) {
  return new Promise(async (resolve) => {
    try {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = controller ? setTimeout(function(){ try { controller.abort(); } catch(e){} }, 5000) : null;
      var effectiveUrl = String(url || '');
      if (/github\.com/i.test(effectiveUrl) && /\/blob\//i.test(effectiveUrl)) {
        effectiveUrl = effectiveUrl.replace(/^https?:\/\/github\.com\//i, 'https://raw.githubusercontent.com/').replace(/\/blob\//i, '/');
      }
      var res = await fetch(effectiveUrl, { method: 'GET', cache: 'no-store', signal: controller ? controller.signal : undefined });
      if (timer) clearTimeout(timer);
      var ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
      var text = await res.text();
      var v = '';
      if (/text\/plain|text\/txt|application\/octet-stream/i.test(ct) || /latest-version\.txt/i.test(effectiveUrl)) {
        v = String(text || '').trim().split(/\s+/)[0] || '';
      } else {
        var m = text.match(/href\s*=\s*"([^"]*latest-version\.[^"]*)"/i) || text.match(/(https?:\/\/[^\s"']*latest-version\.[a-z0-9]+)/i);
        var fileUrl = m && m[1] ? m[1] : '';
        if (fileUrl) {
          try { fileUrl = new URL(fileUrl, effectiveUrl).href; } catch(e) {}
          if (/github\.com/i.test(fileUrl) && /\/blob\//i.test(fileUrl)) {
            fileUrl = fileUrl.replace(/^https?:\/\/github\.com\//i, 'https://raw.githubusercontent.com/').replace(/\/blob\//i, '/');
          }
          var r2 = await fetch(fileUrl, { method: 'GET', cache: 'no-store' });
          var t2 = await r2.text();
          v = String(t2 || '').trim().split(/\s+/)[0] || '';
        }
      }
      resolve(v);
    } catch (e) {
      resolve('');
    }
  });
}

async function initVersionBanner() {
  var updateUrl = String(UPDATE_URL || '');
  var localVersion = '';
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
      var mf = chrome.runtime.getManifest();
      localVersion = String((mf && mf.version) || '');
    }
  } catch (e) {}
  var url = '';
  try { url = localStorage.getItem('latestVersionUrl') || LATEST_VERSION_URL || ''; } catch (e) {}
  if (!url || !updateUrl) return;
  var remoteVersion = '';
  try { remoteVersion = await fetchLatestVersionOnline(url); } catch (e) {}
  if (!remoteVersion) return;
  if (String(localVersion) !== String(remoteVersion)) {
    var header = document.querySelector('.header');
    if (!header) return;
    var titleEl = header.querySelector('h1') || header;
    var tip = document.getElementById('update-tip-btn');
    if (!tip) {
      tip = document.createElement('button');
      tip.id = 'update-tip-btn';
      tip.className = 'header-update-tip';
      tip.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> 有新版本，点击下载';
      titleEl.appendChild(tip);
    }
    tip.style.display = 'inline-flex';
    tip.onclick = function() {
      try {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: updateUrl });
          return;
        }
      } catch (e) {}
      try { window.open(updateUrl, '_blank'); } catch (e2) {}
    };
  }
}

// 初始化
// 计算工时总和的函数
function calculateTotalHours(logsList, projectFilter = 'all', dateFilter = '') {
  return logsList.reduce((total, log) => {
    const matchProject = (projectFilter === 'all' || log.project === projectFilter);
    const matchDate = (!dateFilter || log.date === dateFilter);
    if (matchProject && matchDate) {
      return total + (parseFloat(log.hours) || 0);
    }
    return total;
  }, 0);
}

// 更新状态指示器的函数
function updateStatusIndicator(isLogPage) {
  const hoursValue = document.querySelector('.hours-value');
  const statusHours = document.querySelector('.status-hours');
  const statusFilledHours = document.querySelector('.status-filled-hours');
  const filledHoursValue = document.querySelector('.filled-hours-value');
  const statusIndicator = document.querySelector('.status-indicator');

  // 计算待填写和已填写的工时总和
  const pendingHours = calculateTotalHours(logs.pending, activeProjectFilter, typeof activePendingDateFilter !== 'undefined' ? activePendingDateFilter : '');
  const filledHours = calculateTotalHours(logs.filled, typeof activeFilledProjectFilter !== 'undefined' ? activeFilledProjectFilter : 'all', typeof activeFilledDateFilter !== 'undefined' ? activeFilledDateFilter : '');

  // 根据当前标签页显示不同的工时信息
  if (activeTab === 'pending' && typeof activePendingStatusFilter !== 'undefined' && activePendingStatusFilter === 'all') {
    if (statusHours) statusHours.style.display = 'none';
    if (statusFilledHours) statusFilledHours.style.display = 'none';
    if (statusIndicator) statusIndicator.style.display = 'none';
    return;
  }
  if (activeTab === 'filled') {
    // 在已填写标签页显示已填工时
    filledHoursValue.textContent = filledHours.toFixed(1);
    statusHours.style.display = 'none';
    statusFilledHours.style.display = 'flex';
    if (statusIndicator) statusIndicator.style.display = 'flex';
  } else {
    // 在其他标签页显示待填工时
    hoursValue.textContent = pendingHours.toFixed(1);
    statusHours.style.display = 'flex';
    statusFilledHours.style.display = 'none';
    if (statusIndicator) statusIndicator.style.display = 'flex';
  }
}

// 检查当前页面是否为日志申请页面
function checkCurrentPageIsLogPage(callback) {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        callback(false);
        return;
      }
      
      const tab = tabs[0];
      const url = tab.url || '';
      const normalizedUrl = url.toLowerCase();
      
      const isLogPage = url && (
        /missionapply/i.test(url) || 
        /missionapplyadd/i.test(url) ||
        (/epointprojectm/i.test(url) && /mission/i.test(url)) ||
        normalizedUrl.includes('missionapply') ||
        normalizedUrl.includes('missionapplyadd') ||
        normalizedUrl.includes('mission') && normalizedUrl.includes('apply') ||
        normalizedUrl.includes('worklog') ||
        normalizedUrl.includes('log') && (normalizedUrl.includes('mission') || normalizedUrl.includes('task'))
      );
      
      callback(isLogPage);
    });
  } else {
    // 本地预览环境（无chrome API）降级为非日志页面状态
    callback(false);
  }
}

// 检查当前窗口中的标签页
function checkLogPages() {
  // 首先检查当前窗口中的标签页
  if (typeof chrome !== 'undefined' && chrome.windows && chrome.tabs) {
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
  } else {
    // 本地预览环境（无chrome API）降级为非日志页面状态
    updateStatusIndicator(false);
  }
}

// 监听标签页更新事件
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      checkLogPages();
    }
  });
}

// 监听标签页关闭事件
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    checkLogPages();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // 初始检查页面状态
  checkLogPages();
  
  // 加载存储的日志数据和预设项目
  loadLogs();
  loadPresetProjects();
  loadPresetDemandTag();
  loadPresetWorkType();
  loadPresetCloseReminders();
  loadPresetBlueprints();
  loadPresetStageDemands();
  loadPresetTaskReviewers();
  try { renderUnifiedPresetsList(); } catch (e) {}
  loadGroupByProjectEnabled();
  // 统一由总开关管理自动应用行为，移除各自自动应用开关的加载
  // 加载“自动填充预设配置”总开关
  loadPresetAutoFillPresets();
  // 打开插件时自动填充预设需求标签、工作类型和关闭提醒到OA页面（仅在总开关开启时）
  if (presetAutoFillPresets) {
    // 统一在总开关开启时，应用所有预设到OA页面
    autofillDemandTagToStory(presetDemandTag);
    autofillWorkTypeToMission(presetWorkType);
    if (presetCloseReminders) {
      autofillCloseRemindersToPage(presetCloseReminders);
    }
    applyBlueprintPresetToOA();
    applyStageDemandPresetToOA();
    applyTaskReviewerPresetToOA();
  }
  
  // 检查当前页面是否为missionapplyadd页面（在扩展环境中）
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
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
  }
  
  // 绑定事件监听器
  bindEventListeners();

  // 获取并显示当前版本号
  const currentVersion = chrome.runtime.getManifest().version;
  document.getElementById('current-version').textContent = currentVersion;

  // 检测更新
  document.getElementById('check-update-btn').addEventListener('click', () => {
    fetch('latest-version.txt')
      .then(response => response.text())
      .then(latestVersion => {
        if (latestVersion.trim() > currentVersion) {
          document.getElementById('update-info').style.display = 'block';
          const latestEl = document.getElementById('latest-version');
          if (latestEl) { latestEl.textContent = latestVersion.trim(); }
          document.getElementById('download-link').href = 'https://pan.quark.cn/s/46b7bbd538d7'; // 在这里替换为您的下载链接
        } else {
          alert('当前已是最新版本！');
        }
      });
  });

  // 绑定“填充”按钮点击，并初次根据当前标签与总开关更新可见性
  if (applyPresetsBtn) {
    applyPresetsBtn.addEventListener('click', () => {
      // 检查当前页面是否为日志申请页面
      checkCurrentPageIsLogPage((isLogPage) => {
        if (!isLogPage) {
          showErrorToast('未打开日志申请页面，无法填充');
          return;
        }
        
        // 如果在日志申请页面，执行填充操作
        autofillDemandTagToStory(presetDemandTag);
        autofillWorkTypeToMission(presetWorkType);
        if (presetCloseReminders) {
          autofillCloseRemindersToPage(presetCloseReminders);
        }
        applyBlueprintPresetToOA();
        applyStageDemandPresetToOA();
        applyTaskReviewerPresetToOA();
        showToast('已填充预设配置');
      });
    });
  }

  if (captureAllBtn) {
    captureAllBtn.addEventListener('click', () => {
      captureAllPresetsFromOA();
    });
  }

  if (unifiedDetailsCloseBtn) {
    unifiedDetailsCloseBtn.addEventListener('click', () => {
      if (unifiedDetailsModal) unifiedDetailsModal.style.display = 'none';
    });
  }
  if (unifiedDetailsCancelBtn) {
    unifiedDetailsCancelBtn.addEventListener('click', () => {
      if (unifiedDetailsModal) unifiedDetailsModal.style.display = 'none';
    });
  }
  
  // 初始化项目选择下拉框
  updateProjectSelect();
  try { updateExportProjectOptions(); } catch (e) {}
  
  // 切换到待申请标签页
  switchTab('pending');
  try { initVersionBanner(); } catch (e) {}
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
  
  const headerConfigBtn = document.getElementById('header-config-btn');
  if (headerConfigBtn) {
    headerConfigBtn.addEventListener('click', () => {
      switchTab('preset');
    });
  }
  const openSidepanelBtn = document.getElementById('open-sidepanel-btn');
  if (openSidepanelBtn) {
    openSidepanelBtn.addEventListener('click', () => {
      try {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
          showErrorToast('Chrome API不可用');
          return;
        }
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (!tabs || tabs.length === 0) {
            showErrorToast('未找到活动标签页');
            return;
          }
          const tabId = tabs[0].id;
          if (chrome.sidePanel && chrome.sidePanel.setOptions) {
            try {
              chrome.sidePanel.setOptions({ tabId: tabId, enabled: true, path: 'popup.html' }, function() {
                if (chrome.runtime.lastError) {
                  showErrorToast('侧边栏设置失败');
                  return;
                }
                if (chrome.sidePanel && chrome.sidePanel.open) {
                  chrome.sidePanel.open({ tabId: tabId });
                } else {
                  showErrorToast('当前浏览器不支持侧边栏');
                }
              });
            } catch (e) {
              showErrorToast('打开侧边栏失败');
            }
          } else {
            showErrorToast('当前浏览器不支持侧边栏');
          }
        });
      } catch (e) {}
    });
  }
  const closeConfigBtn = document.getElementById('close-config-btn');
  if (closeConfigBtn) {
    closeConfigBtn.addEventListener('click', () => {
      switchTab('pending');
    });
  }
  
  // 添加问题反馈按钮事件监听器
  const feedbackBtn = document.getElementById('feedback-btn');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      // 打开问题反馈页面
      window.open('https://huhafish.feishu.cn/share/base/form/shrcnCjMxCiAH2xXXWen8Cy2nUb', '_blank');
    });
  }

  const issueListBtn = document.getElementById('issue-list-btn');
  if (issueListBtn) {
    issueListBtn.addEventListener('click', () => {
      window.open('https://huhafish.feishu.cn/wiki/Hxs2walGYipBHCkWTGmcxwALnwb?table=tblnxeCbDF1m9BQN&view=vewvmrKz23', '_blank');
    });
  }
  
  // 添加申请非公按钮事件监听器
  const applyNonPublicBtn = document.getElementById('apply-non-public-btn');
  
  const openApplyNonPublicPage = () => {
    // 获取当前日期并格式化为YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // 打开申请非公页面，带上当前日期参数
    window.open(`https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/projectselect?RZDate=${currentDate}`, '_blank');
  };
  
  if (applyNonPublicBtn) {
    applyNonPublicBtn.addEventListener('click', openApplyNonPublicPage);
  }
  
  // 添加写日志按钮事件监听器
  const writeLogBtn = document.getElementById('write-log-btn');
  
  const openWriteLogPage = () => {
    // 获取当前日期并格式化为YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // 打开写日志页面，带上当前日期参数
    window.open(`https://oa.epoint.com.cn/dailyreportmanage/pages/dailyrecord/dailyrecordaddv2/calendarmonth`, '_blank');
  };
  
  if (writeLogBtn) {
    writeLogBtn.addEventListener('click', openWriteLogPage);
  }
  
  // 添加发放非功按钮事件监听器
  const distributeNonPublicBtn = document.getElementById('distribute-non-public-btn');
  
  const openDistributeNonPublicPage = () => {
    // 打开发放非功页面
    window.open('https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplysplitv2', '_blank');
  };
  
  if (distributeNonPublicBtn) {
    distributeNonPublicBtn.addEventListener('click', openDistributeNonPublicPage);
  }
  
  // 项目标签页切换
  projectTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('project-tab-btn')) {
      switchProjectFilter(e.target.dataset.project);
    }
  });
  


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

  // 新增日志按钮事件
  if (addNewLogBtn) {
    addNewLogBtn.addEventListener('click', () => {
      openAddLogWindow();
    });
  }

  // 模态框事件监听
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAddLogModal);
  }
  
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', closeAddLogModal);
  }
  
  if (modalSaveContinueBtn) {
    modalSaveContinueBtn.addEventListener('click', () => {
      saveLogAndContinue();
    });
  }
  // 自动复制开关交互
  if (autoCopyTaskContentSwitch) {
    const updateContentRequired = () => {
      const enabled = !!autoCopyTaskContentSwitch.checked;
      if (modalContentTextarea) {
        modalContentTextarea.placeholder = enabled ? '可不填写，保存时将使用任务名称' : '请输入工作内容';
        // 根据开关状态动态控制必填
        try { modalContentTextarea.required = !enabled; } catch (e) {}
      }
      if (autoCopySwitchLabel) {
        autoCopySwitchLabel.textContent = enabled ? '自动复制任务名称' : '手动填写工作内容';
      }
    };
    autoCopyTaskContentSwitch.addEventListener('change', updateContentRequired);
    updateContentRequired();
  }
  if (copyTaskToContentBtn) {
    copyTaskToContentBtn.addEventListener('click', () => {
      const v = (modalTaskNameInput && modalTaskNameInput.value || '').trim();
      if (!v) {
        showErrorToast('请输入任务名称');
        return;
      }
      if (modalContentTextarea) {
        modalContentTextarea.value = v;
        showToast('已复制任务名称到工作内容');
      }
    });
  }
  if (clearHoursBtn) {
    clearHoursBtn.addEventListener('click', () => {
      if (modalHoursInput) {
        modalHoursInput.value = '';
      }
    });
  }
  
  // 模态框只能通过关闭按钮关闭，不允许点击外部区域关闭
  // 移除了点击模态框外部关闭的功能
  
  // 模态框表单提交
  if (modalAddLogForm) {
    modalAddLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
    const project = modalProjectSelect.value;
    const taskName = modalTaskNameInput.value.trim();
    let content = modalContentTextarea.value.trim();
    const hours = parseFloat(modalHoursInput.value);
    const date = modalDateInput.value;

      // 验证输入
      if (!project) {
        showErrorToast('请选择项目名称');
        return;
      }
      if (!taskName) {
        showErrorToast('请输入任务名称');
        return;
      }
      // 自动复制任务名称到工作内容（当开关开启且内容为空）
      const autoCopyEnabled = autoCopyTaskContentSwitch ? !!autoCopyTaskContentSwitch.checked : true;
      if (!content && autoCopyEnabled) {
        if (!taskName) {
          showErrorToast('任务名称为空，无法自动复制');
          return;
        }
        content = taskName;
        if (modalContentTextarea) { modalContentTextarea.value = content; }
      }
      if (!content) {
        showErrorToast('请输入工作内容');
        return;
      }
      if (!hours || hours <= 0) {
        showErrorToast('请输入有效的工作时长');
        return;
      }
      if (!date) {
        showErrorToast('请选择工作日期');
        return;
      }

      // 若项目不在预设列表中，自动加入并持久化
      const projName = (project || '').trim();
      if (projName && !presetProjects.includes(projName)) {
        presetProjects.push(projName);
        try {
          localStorage.setItem('presetProjects', JSON.stringify(presetProjects));
        } catch (err) {}
        updateProjectSelect();
        try { renderPresetProjectsList(); } catch (e) {}
      }

      // 检查是否为编辑模式
      const editingLogId = modalAddLogForm.dataset.editingLogId;
      const editingLogStatus = modalAddLogForm.dataset.editingLogStatus;
      
      if (editingLogId) {
        // 编辑现有日志
        if (editingLogStatus === 'filled') {
          // 编辑已填写日志
          const logIndex = logs.filled.findIndex(log => log.id === editingLogId);
          if (logIndex !== -1) {
            logs.filled[logIndex] = {
              ...logs.filled[logIndex],
              project: project,
              taskName: taskName,
              content: content,
              hours: hours,
              date: date
            };
          }
        } else {
          // 编辑待填写日志
          const logIndex = logs.pending.findIndex(log => log.id === editingLogId);
          if (logIndex !== -1) {
            logs.pending[logIndex] = {
              ...logs.pending[logIndex],
              project: project,
              taskName: taskName,
              content: content,
              hours: hours,
              date: date
            };
          }
        }
        delete modalAddLogForm.dataset.editingLogId;
        delete modalAddLogForm.dataset.editingLogStatus;
        showToast('日志更新成功！');
      } else {
        // 创建新日志
        const newLog = {
          id: Date.now().toString(),
          project: project,
          taskName: taskName,
          content: content,
          hours: hours,
          date: date,
          status: 'pending'
        };
        logs.pending.push(newLog);
        showToast('日志添加成功！');
      }

      saveLogs();
      renderPendingLogs();
      renderFilledLogs();
      updateHoursStatistics();
      
      // 关闭模态框
      closeAddLogModal();
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
  
  // —— 筛选栏事件绑定 ——
  // 待申请：项目筛选
  if (pendingProjectDropdown) {
    pendingProjectDropdown.addEventListener('change', (e) => {
      const value = e.target.value || 'all';
      switchProjectFilter(value);
    });
  }
  // 待申请：日期筛选
  if (pendingDateFilter) {
    pendingDateFilter.addEventListener('change', (e) => {
      activePendingDateFilter = e.target.value || '';
      renderPendingLogs();
      updateHoursStatistics();
    });
  }
  // 待申请：任务状态筛选
  if (pendingStatusFilter) {
    pendingStatusFilter.addEventListener('change', (e) => {
      activePendingStatusFilter = e.target.value || 'pending';
      // 切换状态时更新项目下拉为两类任务并集
      updateProjectTabs();
      renderPendingLogs();
      updateHoursStatistics();
    });
  }
  // 已申请：项目筛选
  if (filledProjectDropdown) {
    filledProjectDropdown.addEventListener('change', (e) => {
      const value = e.target.value || 'all';
      switchFilledProjectFilter(value);
    });
  }
  // 已申请：日期筛选
  if (filledDateFilter) {
    filledDateFilter.addEventListener('change', (e) => {
      activeFilledDateFilter = e.target.value || '';
      renderFilledLogs();
      updateHoursStatistics();
    });
  }
  // 待申请：选择模式切换
  if (pendingSelectModeBtn) {
    pendingSelectModeBtn.addEventListener('click', () => {
      pendingSelectionMode = !pendingSelectionMode;
      if (pendingSelectAllBtn) pendingSelectAllBtn.classList.toggle('hidden', !pendingSelectionMode);
      if (pendingDeleteSelectedBtn) pendingDeleteSelectedBtn.classList.toggle('hidden', !pendingSelectionMode);
      if (!pendingSelectionMode) {
        pendingSelectedIds.clear();
      }
      renderPendingLogs();
    });
  }
  // 待申请：全选
  if (pendingSelectAllBtn) {
    pendingSelectAllBtn.addEventListener('click', () => {
      if (!pendingSelectionMode) return;
      let filteredLogs = logs.pending;
      if (activeProjectFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.project === activeProjectFilter);
      }
      if (activePendingDateFilter) {
        filteredLogs = filteredLogs.filter(log => log.date === activePendingDateFilter);
      }
      filteredLogs.forEach(log => pendingSelectedIds.add(log.id));
      renderPendingLogs();
    });
  }
  // 待申请：批量删除
  if (pendingDeleteSelectedBtn) {
    pendingDeleteSelectedBtn.addEventListener('click', () => {
      if (!pendingSelectionMode) return;
      const count = pendingSelectedIds.size;
      if (count === 0) {
        showToast('请先选择要删除的日志');
        return;
      }
      if (!confirm(`确定删除选中的 ${count} 条待填写日志吗？此操作不可恢复！`)) return;
      logs.pending = logs.pending.filter(log => !pendingSelectedIds.has(log.id));
      pendingSelectedIds.clear();
      saveLogs();
      updateProjectTabs();
      renderPendingLogs();
      updateHoursStatistics();
      showToast(`已删除选中的 ${count} 条待填写日志`);
    });
  }
  // 已申请：选择模式切换
  if (filledSelectModeBtn) {
    filledSelectModeBtn.addEventListener('click', () => {
      filledSelectionMode = !filledSelectionMode;
      if (filledSelectAllBtn) filledSelectAllBtn.classList.toggle('hidden', !filledSelectionMode);
      if (filledDeleteSelectedBtn) filledDeleteSelectedBtn.classList.toggle('hidden', !filledSelectionMode);
      if (!filledSelectionMode) {
        filledSelectedIds.clear();
      }
      renderFilledLogs();
    });
  }
  // 已申请：全选
  if (filledSelectAllBtn) {
    filledSelectAllBtn.addEventListener('click', () => {
      if (!filledSelectionMode) return;
      let filteredLogs = logs.filled;
      if (typeof activeFilledProjectFilter !== 'undefined' && activeFilledProjectFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.project === activeFilledProjectFilter);
      }
      if (activeFilledDateFilter) {
        filteredLogs = filteredLogs.filter(log => log.date === activeFilledDateFilter);
      }
      filteredLogs.forEach(log => filledSelectedIds.add(log.id));
      renderFilledLogs();
    });
  }
  // 已申请：批量删除
  if (filledDeleteSelectedBtn) {
    filledDeleteSelectedBtn.addEventListener('click', () => {
      if (!filledSelectionMode) return;
      const count = filledSelectedIds.size;
      if (count === 0) {
        showToast('请先选择要删除的日志');
        return;
      }
      if (!confirm(`确定删除选中的 ${count} 条已填写日志吗？此操作不可恢复！`)) return;
      logs.filled = logs.filled.filter(log => !filledSelectedIds.has(log.id));
      filledSelectedIds.clear();
      saveLogs();
      updateFilledProjectTabs();
      renderFilledLogs();
      updateHoursStatistics();
      showToast(`已删除选中的 ${count} 条已填写日志`);
    });
  }
  
  // 待申请：清除全部按钮
  if (pendingClearAllBtn) {
    pendingClearAllBtn.addEventListener('click', () => {
      clearAllPendingLogs();
    });
  }
  
  // 已申请：清除全部按钮
  if (filledClearAllBtn) {
    filledClearAllBtn.addEventListener('click', () => {
      clearAllFilledLogs();
    });
  }
  
  // 关于卡片：打开文档链接
  const openDocsBtn = document.getElementById('open-docs-btn');
  if (openDocsBtn) {
    openDocsBtn.addEventListener('click', () => {
      window.open('https://huhafish.feishu.cn/wiki/M6AvwaTiYiUtNakqRBRcasjLn4g?from=from_copylink', '_blank');
    });
  }

  const exportLogsBtn = document.getElementById('export-logs-btn');
  const importLogsBtn = document.getElementById('import-logs-btn');
  const clearAllDataBtn = document.getElementById('clear-all-data-btn');
  const importLogsFileInput = document.getElementById('import-logs-file-input');
  if (exportLogsBtn) {
    exportLogsBtn.addEventListener('click', () => {
      exportTasksToJson();
    });
  }
  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', () => {
      clearAllTaskData();
    });
  }
  if (importLogsBtn && importLogsFileInput) {
    importLogsBtn.addEventListener('click', () => {
      importLogsFileInput.click();
    });
    importLogsFileInput.addEventListener('change', (e) => {
      const f = e.target && e.target.files && e.target.files[0];
      if (!f) return;
      importTasksFromJsonFile(f);
      try { importLogsFileInput.value = ''; } catch (err) {}
    });
  }

  const exportPluginBtn = document.getElementById('export-plugin-btn');
  const importPluginBtn = document.getElementById('import-plugin-btn');
  const clearPluginDataBtn = document.getElementById('clear-plugin-data-btn');
  const importPluginFileInput = document.getElementById('import-plugin-file-input');
  if (exportPluginBtn) {
    exportPluginBtn.addEventListener('click', () => {
      exportPluginDataToJson();
    });
  }
  if (clearPluginDataBtn) {
    clearPluginDataBtn.addEventListener('click', () => {
      clearPluginData();
    });
  }
  if (importPluginBtn && importPluginFileInput) {
    importPluginBtn.addEventListener('click', () => {
      importPluginFileInput.click();
    });
    importPluginFileInput.addEventListener('change', (e) => {
      const f = e.target && e.target.files && e.target.files[0];
      if (!f) return;
      importPluginDataFromJsonFile(f);
      try { importPluginFileInput.value = ''; } catch (err) {}
    });
  }
}

// 清除所有待填写日志
function clearAllPendingLogs() {
  if (logs.pending.length === 0) {
    showToast('暂无待填写日志可清除');
    return;
  }
  
  // 确认对话框
  if (confirm('确定要清除所有待填写日志吗？此操作不可恢复！')) {
    logs.pending = [];
    saveLogs();
    renderPendingLogs();
    updateProjectTabs();
    updateHoursStatistics();
    showToast('已清除所有待填写日志');
  }
}

// 清除所有已填写日志
function clearAllFilledLogs() {
  if (logs.filled.length === 0) {
    showToast('暂无已填写日志可清除');
    return;
  }
  
  // 确认对话框
  if (confirm('确定要清除所有已填写日志吗？此操作不可恢复！')) {
    logs.filled = [];
    saveLogs();
    renderFilledLogs();
    updateFilledProjectTabs();
    updateHoursStatistics();
    showToast('已清除所有已填写日志');
  }
}

// 清除所有任务数据（待填写和已填写）
function clearAllTaskData() {
  // 检查是否有数据可清除
  if (logs.pending.length === 0 && logs.filled.length === 0) {
    showToast('暂无任务数据可清除');
    return;
  }
  
  // 确认对话框
  if (confirm('确定要清除全部任务数据吗？此操作不可恢复！')) {
    logs.pending = [];
    logs.filled = [];
    saveLogs();
    
    // 更新界面
    renderLogs();
    updateProjectTabs();
    updateFilledProjectTabs();
    
    // 重置颜色映射
    initializeProjectColorMapping();
    
    showToast('已清除全部任务数据');
  }
}

// 清除插件数据
function clearPluginData() {
  if (confirm('确定要清除所有插件数据（预设配置、捕获数据等）吗？此操作不可恢复！\n\n注意：此操作不会删除任务日志。')) {
    // 清除预设配置
    localStorage.removeItem('presetDemandTag');
    localStorage.removeItem('presetWorkType');
    localStorage.removeItem('presetCloseReminders');
    localStorage.removeItem('groupByProjectEnabled');
    localStorage.removeItem('presetAutoFillPresets');
    localStorage.removeItem('presetBlueprintAutoApply');
    localStorage.removeItem('presetStageDemandAutoApply');
    localStorage.removeItem('presetTaskReviewerAutoApply');
    
    // 清除捕获数据
    localStorage.removeItem('presetBlueprints');
    localStorage.removeItem('presetStageDemands');
    localStorage.removeItem('presetTaskReviewers');
    localStorage.removeItem('presetProjects');
    
    // 重新加载配置
    loadPresetDemandTag();
    loadPresetWorkType();
    loadPresetCloseReminders();
    loadGroupByProjectEnabled();
    loadPresetAutoFillPresets();
    loadPresetBlueprints();
    loadPresetBlueprintAutoApply();
    loadPresetStageDemands();
    loadPresetStageDemandAutoApply();
    loadPresetTaskReviewers();
    loadPresetTaskReviewerAutoApply();
    loadPresetProjects();
    
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateExportProjectOptions(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
    
    // 刷新界面上的开关状态
    if (autoFillPresetsCheckbox) autoFillPresetsCheckbox.checked = true;
    if (groupByProjectCheckbox) groupByProjectCheckbox.checked = true;
    if (closeRemindersCheckbox) closeRemindersCheckbox.checked = false;
    if (demandTagSelect) demandTagSelect.value = '';
    if (workTypeSelect) workTypeSelect.value = '';
    
    showToast('已清除所有插件数据');
  }
}

function exportTasksToJson() {
  try {
    const statusEl = document.getElementById('export-status-filter');
    const projectEl = document.getElementById('export-project-filter');
    const startEl = document.getElementById('export-date-start');
    const endEl = document.getElementById('export-date-end');
    const status = statusEl ? (statusEl.value || 'all') : 'all';
    const project = projectEl ? (projectEl.value || 'all') : 'all';
    const start = startEl && startEl.value ? startEl.value : '';
    const end = endEl && endEl.value ? endEl.value : '';

    let pending = status === 'filled' ? [] : (Array.isArray(logs.pending) ? logs.pending.slice() : []);
    let filled = status === 'pending' ? [] : (Array.isArray(logs.filled) ? logs.filled.slice() : []);

    if (project !== 'all') {
      pending = pending.filter(l => (l.project || '') === project);
      filled = filled.filter(l => (l.project || '') === project);
    }
    if (start) {
      pending = pending.filter(l => String(l.date || '').slice(0, 10) >= start);
      filled = filled.filter(l => String(l.date || '').slice(0, 10) >= start);
    }
    if (end) {
      pending = pending.filter(l => String(l.date || '').slice(0, 10) <= end);
      filled = filled.filter(l => String(l.date || '').slice(0, 10) <= end);
    }

    const data = { pending, filled };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const name = `worklogs-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('已导出任务数据');
  } catch (err) {
    showErrorToast('导出失败');
  }
}

function importTasksFromJsonFile(file) {
  try {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const text = e && e.target ? e.target.result : '';
        const obj = JSON.parse(text || '{}');
        const src = obj && obj.logs ? obj.logs : obj;
        const p = src && Array.isArray(src.pending) ? src.pending : [];
        const f = src && Array.isArray(src.filled) ? src.filled : [];
        const norm = function(it) {
          const project = it && it.project ? String(it.project) : '';
          const taskName = it && it.taskName ? String(it.taskName) : '';
          const content = it && it.content ? String(it.content) : '';
          const hours = parseFloat(it && it.hours) || 0.5;
          const dateRaw = it && it.date ? String(it.date) : new Date().toISOString().split('T')[0];
          const date = new Date(dateRaw).toString() !== 'Invalid Date' ? new Date(dateRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const status = it && it.status === 'filled' ? 'filled' : 'pending';
          let id = it && it.id ? String(it.id) : '';
          if (!id) { id = String(Date.now()) + Math.random().toString(16).slice(2); }
          return { id, project, taskName, content, hours, date, status };
        };
        const existingIds = new Set([ ...logs.pending.map(x => String(x.id)), ...logs.filled.map(x => String(x.id)) ]);
        const makeId = () => String(Date.now()) + Math.random().toString(16).slice(2);
        p.map(norm).forEach(it => {
          let id = String(it.id || '');
          if (!id || existingIds.has(id)) { id = makeId(); it.id = id; }
          existingIds.add(id);
          it.status = 'pending';
          logs.pending.push(it);
        });
        f.map(norm).forEach(it => {
          let id = String(it.id || '');
          if (!id || existingIds.has(id)) { id = makeId(); it.id = id; }
          existingIds.add(id);
          it.status = 'filled';
          logs.filled.push(it);
        });
        saveLogs();
        updateProjectTabs();
        renderLogs();
        updateHoursStatistics();
        const set = new Set([ ...logs.pending.map(x => x.project), ...logs.filled.map(x => x.project) ]);
        let changed = false;
        set.forEach(v => { if (v && !presetProjects.includes(v)) { presetProjects.push(v); changed = true; } });
        if (changed) { try { localStorage.setItem('presetProjects', JSON.stringify(presetProjects)); } catch (err) {} updateProjectSelect(); try { renderPresetProjectsList(); } catch (e) {} }
        try { updateExportProjectOptions(); } catch (e) {}
        showToast('任务数据已导入');
      } catch (err) {
        showErrorToast('导入失败：JSON格式错误');
      }
    };
    reader.readAsText(file);
  } catch (err) {
    showErrorToast('导入失败');
  }
}

function exportPluginDataToJson() {
  try {
    const getBool = (key, def=true) => {
      const v = localStorage.getItem(key);
      return v === null ? def : (v === 'true');
    };
    const safeParse = (key, def) => {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : def;
      } catch (e) { return def; }
    };

    const data = {
      meta: {
        name: 'epoint-worklog-manager-plugin-data',
        version: 1,
        exportedAt: new Date().toISOString()
      },
      settings: {
        presetDemandTag: localStorage.getItem('presetDemandTag') || '',
        presetWorkType: localStorage.getItem('presetWorkType') || '',
        presetCloseReminders: getBool('presetCloseReminders', false),
        groupByProjectEnabled: getBool('groupByProjectEnabled', true),
        presetAutoFillPresets: getBool('presetAutoFillPresets', true),
        presetBlueprintAutoApply: getBool('presetBlueprintAutoApply', true),
        presetStageDemandAutoApply: getBool('presetStageDemandAutoApply', true),
        presetTaskReviewerAutoApply: getBool('presetTaskReviewerAutoApply', true)
      },
      captured: {
        presetBlueprints: safeParse('presetBlueprints', {}),
        presetStageDemands: safeParse('presetStageDemands', {}),
        presetTaskReviewers: safeParse('presetTaskReviewers', {})
      },
      presets: {
        presetProjects: safeParse('presetProjects', [])
      }
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const name = `plugin-data-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('已导出插件数据');
  } catch (err) {
    showErrorToast('导出插件数据失败');
  }
}

function importPluginDataFromJsonFile(file) {
  try {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const text = e && e.target ? e.target.result : '';
        const obj = JSON.parse(text || '{}');
        const settings = obj && obj.settings ? obj.settings : obj;
        const captured = obj && obj.captured ? obj.captured : obj;
        const presets = obj && obj.presets ? obj.presets : obj;

        const writeBool = (key, val, def=true) => {
          if (typeof val === 'boolean') localStorage.setItem(key, String(val));
          else if (val === undefined && def !== undefined) localStorage.setItem(key, String(def));
        };
        const writeStr = (key, val) => { if (typeof val === 'string') localStorage.setItem(key, val); };
        const writeJson = (key, val, def) => {
          if (val && typeof val === 'object') localStorage.setItem(key, JSON.stringify(val));
          else if (def !== undefined) localStorage.setItem(key, JSON.stringify(def));
        };

        writeStr('presetDemandTag', settings.presetDemandTag);
        writeStr('presetWorkType', settings.presetWorkType);
        writeBool('presetCloseReminders', settings.presetCloseReminders, false);
        writeBool('groupByProjectEnabled', settings.groupByProjectEnabled, true);
        writeBool('presetAutoFillPresets', settings.presetAutoFillPresets, true);
        writeBool('presetBlueprintAutoApply', settings.presetBlueprintAutoApply, true);
        writeBool('presetStageDemandAutoApply', settings.presetStageDemandAutoApply, true);
        writeBool('presetTaskReviewerAutoApply', settings.presetTaskReviewerAutoApply, true);

        writeJson('presetBlueprints', captured.presetBlueprints, {});
        writeJson('presetStageDemands', captured.presetStageDemands, {});
        writeJson('presetTaskReviewers', captured.presetTaskReviewers, {});

        writeJson('presetProjects', presets.presetProjects, []);

        loadPresetDemandTag();
        loadPresetWorkType();
        loadPresetCloseReminders();
        loadGroupByProjectEnabled();
        loadPresetAutoFillPresets();
        loadPresetBlueprints();
        loadPresetBlueprintAutoApply();
        loadPresetStageDemands();
        loadPresetStageDemandAutoApply();
        loadPresetTaskReviewers();
        loadPresetTaskReviewerAutoApply();
        loadPresetProjects();
        try { renderUnifiedPresetsList(); } catch (e) {}
        try { updateExportProjectOptions(); } catch (e) {}
        try { updateProjectTabs(); } catch (e) {}
        try { updateFilledProjectTabs(); } catch (e) {}
        showToast('插件数据已导入');
      } catch (err) {
        showErrorToast('导入失败：JSON格式错误');
      }
    };
    reader.readAsText(file);
  } catch (err) {
    showErrorToast('导入插件数据失败');
  }
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

  const closeConfigBtn = document.getElementById('close-config-btn');
  if (closeConfigBtn) {
    closeConfigBtn.style.display = tabName === 'preset' ? 'flex' : 'none';
  }
  const headerConfigBtn = document.getElementById('header-config-btn');
  if (headerConfigBtn) {
    headerConfigBtn.style.display = tabName === 'preset' ? 'none' : 'inline-flex';
  }
  const applyNonPublicContainer = document.querySelector('.apply-non-public-container');
  if (applyNonPublicContainer) {
    applyNonPublicContainer.style.display = tabName === 'preset' ? 'none' : 'flex';
  }
  
  // 渲染对应标签页的内容
  try { updateProjectTabs(); } catch (e) {}
  try { updateFilledProjectTabs(); } catch (e) {}
  renderLogs();
}

// 切换项目筛选
function switchProjectFilter(projectName) {
  activeProjectFilter = projectName;
  // 同步下拉框显示
  if (pendingProjectDropdown) {
    pendingProjectDropdown.value = projectName;
  }
  
  // 重新渲染待填写日志列表
  renderPendingLogs();
  
  // 更新工时统计
  updateHoursStatistics();
}

// 将这些函数定义为全局函数
window.editLog = function(id, status = 'pending') {
  // 根据状态查找日志
  let log;
  if (status === 'pending') {
    log = logs.pending.find(log => log.id === id);
  } else {
    log = logs.filled.find(log => log.id === id);
  }
  
  if (!log) return;
  
  // 获取当前日期作为默认值
  const today = new Date().toISOString().split('T')[0];
  
  // 填充项目选项 - 包含现有日志项目和预设项目，确保编辑的项目包含在内
  const projectsSet = new Set([log.project, ...getCapturedProjects()]);
  
  // 清空并重新填充项目候选列表（datalist）
  if (modalProjectDatalist) {
    modalProjectDatalist.innerHTML = '';
    projectsSet.forEach(project => {
      const option = document.createElement('option');
      option.value = project;
      modalProjectDatalist.appendChild(option);
    });
  }
  
  // 打开模态框
  addLogModal.style.display = 'block';
  
  // 设置编辑模式标记，包含状态信息
  modalAddLogForm.dataset.editingLogId = id;
  modalAddLogForm.dataset.editingLogStatus = status;
  
  // 更新模态框标题为编辑模式
  const modalTitle = addLogModal.querySelector('.modal-header h3');
  if (modalTitle) {
    modalTitle.textContent = '编辑工作日志';
  }
  
  // 填充模态框表单数据
  modalProjectSelect.value = log.project;
  modalTaskNameInput.value = log.taskName || '';
  modalContentTextarea.value = log.content;
  modalHoursInput.value = log.hours;
  modalDateInput.value = log.date;
};

// 处理项目选择变化
// 更新项目选择下拉框（用于模态框）
function updateProjectSelect() {
  // 确保modalProjectDatalist存在
  if (!modalProjectDatalist) return;
  
  modalProjectDatalist.innerHTML = '';
  getCapturedProjects().forEach(project => {
    const option = document.createElement('option');
    option.value = project;
    modalProjectDatalist.appendChild(option);
  });
}

function updateExportProjectOptions() {
  const select = document.getElementById('export-project-filter');
  if (!select) return;
  const projects = ['all', ...getCapturedProjects()];
  select.innerHTML = '';
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p === 'all' ? '全部项目' : p;
    select.appendChild(option);
  });
}

// 更新工时统计
function updateHoursStatistics() {
  // 根据当前标签页更新工时显示
  const hoursValue = document.querySelector('.hours-value');
  const filledHoursValue = document.querySelector('.filled-hours-value');
  const statusHours = document.querySelector('.status-hours');
  const statusFilledHours = document.querySelector('.status-filled-hours');
  const statusIndicator = document.querySelector('.status-indicator');

  // 计算两类工时
  const pendingHours = calculateTotalHours(
    logs.pending,
    activeProjectFilter,
    typeof activePendingDateFilter !== 'undefined' ? activePendingDateFilter : ''
  );
  // 在待申请页使用同一个日期筛选来计算已申请工时
  const filledHours = calculateTotalHours(
    logs.filled,
    typeof activeFilledProjectFilter !== 'undefined' ? activeFilledProjectFilter : 'all',
    typeof activePendingDateFilter !== 'undefined' ? activePendingDateFilter : ''
  );

  if (activeTab === 'preset') {
    if (statusHours) statusHours.style.display = 'none';
    if (statusFilledHours) statusFilledHours.style.display = 'none';
    if (statusIndicator) statusIndicator.style.display = 'none';
    return;
  }

  // 在待申请标签页根据任务状态筛选显示
  if (activeTab === 'pending' && typeof activePendingStatusFilter !== 'undefined') {
    if (activePendingStatusFilter === 'filled') {
      if (filledHoursValue) filledHoursValue.textContent = filledHours.toFixed(1);
      if (statusHours) statusHours.style.display = 'none';
      if (statusFilledHours) statusFilledHours.style.display = 'flex';
      if (statusIndicator) statusIndicator.style.display = 'flex';
      return;
    }
    if (activePendingStatusFilter === 'all') {
      if (statusHours) statusHours.style.display = 'none';
      if (statusFilledHours) statusFilledHours.style.display = 'none';
      if (statusIndicator) statusIndicator.style.display = 'none';
      return;
    }
  }
  // 默认显示待填工时
  if (hoursValue) hoursValue.textContent = pendingHours.toFixed(1);
  if (statusHours) statusHours.style.display = 'flex';
  if (statusFilledHours) statusFilledHours.style.display = 'none';
  if (statusIndicator) statusIndicator.style.display = 'flex';
}

// 更新项目标签
function updateProjectTabs() {
  // 使用待申请筛选下拉框替代项目标签
  if (!pendingProjectDropdown) return;
  const projects = ['all', ...getCapturedProjects()];
  pendingProjectDropdown.innerHTML = '';
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p === 'all' ? '全部项目' : p;
    pendingProjectDropdown.appendChild(option);
  });
  // 保持当前筛选值
  pendingProjectDropdown.value = activeProjectFilter;
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
  
  // 根据任务状态筛选选择数据源
  let sourceItems = [];
  const status = typeof activePendingStatusFilter !== 'undefined' ? activePendingStatusFilter : 'pending';
  if (status === 'pending') {
    sourceItems = logs.pending.map(log => ({ log, status: 'pending' }));
  } else if (status === 'filled') {
    sourceItems = logs.filled.map(log => ({ log, status: 'filled' }));
  } else {
    sourceItems = [
      ...logs.pending.map(log => ({ log, status: 'pending' })),
      ...logs.filled.map(log => ({ log, status: 'filled' }))
    ];
  }
  
  // 根据项目筛选
  if (activeProjectFilter !== 'all') {
    sourceItems = sourceItems.filter(item => item.log.project === activeProjectFilter);
  }
  // 日期筛选
  if (activePendingDateFilter) {
    sourceItems = sourceItems.filter(item => item.log.date === activePendingDateFilter);
  }
  
  if (sourceItems.length === 0) {
    pendingLogsList.innerHTML = '<p class="empty-message">暂无日志</p>';
    return;
  }
  
  // 清空列表
  pendingLogsList.innerHTML = '';
  if (groupByProjectEnabled) {
    const groupMap = new Map();
    sourceItems.forEach(({ log, status }) => {
      const key = log.project || '';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push({ log, status });
    });

    Array.from(groupMap.keys()).sort().forEach((projectName) => {
      const items = groupMap.get(projectName) || [];
      const totalHours = items.reduce((sum, it) => sum + (parseFloat(it.log.hours) || 0), 0);
      const colorIndex = getProjectColorIndex(projectName);
      if (pendingAccordionState[projectName] === undefined) pendingAccordionState[projectName] = true;
      const accordion = document.createElement('div');
      accordion.className = `accordion-item project-color-${colorIndex} ${pendingAccordionState[projectName] ? '' : 'open'}`;
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `
        <div class="accordion-title">
          <span class="folder-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M3 7h5l1.8 2H21v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="#3b82f6"/>
            </svg>
          </span>
          <span class="accordion-project-name" title="${escapeHtml(projectName)}">${escapeHtml(projectName)}</span>
          <div class="accordion-actions">
            <button class="action-icon add-btn" type="button" aria-label="新增" title="新增" data-project="${escapeHtml(projectName)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="action-icon apply-btn" type="button" aria-label="申请" title="申请" data-project="${escapeHtml(projectName)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="none"></polygon>
              </svg>
            </button>
          </div>
        </div>
        <div class="accordion-meta">
          <span class="accordion-count">${items.length}条</span>
          <span class="accordion-hours">${totalHours.toFixed(1)}h</span>
          <span class="accordion-toggle" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          </span>
        </div>`;
      const content = document.createElement('div');
      content.className = 'accordion-content';

      items.forEach(({ log, status }) => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.dataset.id = log.id;
        const logColorIndex = getProjectColorIndex(log.project);
        logItem.classList.add(`project-color-${logColorIndex}`);
        const actionsIconsHtml = `
          <div class="log-actions">
            <div class="action-icon edit-btn" title="修改">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
              </svg>
            </div>
            <div class="action-icon delete-btn" title="删除">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div class="action-icon fill-btn" title="填充">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>`;
        logItem.innerHTML = `
          <div class=\"log-item-header\">\n        ${pendingSelectionMode ? `<input type=\"checkbox\" class=\"log-select-checkbox\" data-id=\"${log.id}\" ${pendingSelectedIds.has(log.id) ? 'checked' : ''}>` : ''}
            <span class=\"log-task-title\">${escapeHtml(log.taskName)}</span>
            <div class=\"log-date\">${formatDate(log.date)}</div>
            <div class=\"log-hours\">${log.hours}h</div>
          </div>
          <div class=\"log-content\"><span class=\"log-content-text\">${escapeHtml(log.content)}</span>${actionsIconsHtml}</div>
        `;
        const headerActions = logItem.querySelector('.log-item-header .log-actions');
        const contentDiv = logItem.querySelector('.log-content');
        if (headerActions && contentDiv) {
          contentDiv.appendChild(headerActions);
        }
        const fillBtn = logItem.querySelector('.fill-btn');
        const deleteBtn = logItem.querySelector('.delete-btn');
        const editBtn = logItem.querySelector('.edit-btn');
        if (status === 'pending') {
          const selectCheckbox = logItem.querySelector('.log-select-checkbox');
          if (fillBtn) fillBtn.addEventListener('click', function() { window.fillLog(log.id); });
          if (deleteBtn) deleteBtn.addEventListener('click', () => deleteLog(log.id, 'pending'));
          if (editBtn) editBtn.addEventListener('click', () => editLog(log.id, 'pending'));
          if (selectCheckbox) {
            selectCheckbox.addEventListener('change', (e) => {
              const id = log.id;
              if (e.target.checked) pendingSelectedIds.add(id);
              else pendingSelectedIds.delete(id);
            });
          }
        } else {
          const restoreBtn = logItem.querySelector('.restore-btn');
          if (restoreBtn) restoreBtn.addEventListener('click', () => restoreLog(log.id));
          if (deleteBtn) deleteBtn.addEventListener('click', () => deleteLog(log.id, 'filled'));
          if (fillBtn) fillBtn.addEventListener('click', () => fillLog(log.id));
          if (editBtn) editBtn.addEventListener('click', () => editLog(log.id, 'filled'));
        }
        content.appendChild(logItem);
      });

      const applyBtn = header.querySelector('.apply-btn');
      const addBtn = header.querySelector('.add-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', (ev) => {
          try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
          openApplyPageForProject(projectName);
        });
      }
      if (addBtn) {
        addBtn.addEventListener('click', (ev) => {
          try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
          openAddLogWindowForProject(projectName);
        });
      }

      header.addEventListener('click', () => {
        const isOpen = accordion.classList.contains('open');
        if (isOpen) {
          accordion.classList.remove('open');
          pendingAccordionState[projectName] = true;
        } else {
          accordion.classList.add('open');
          pendingAccordionState[projectName] = false;
        }
      });

      accordion.appendChild(header);
      accordion.appendChild(content);
      pendingLogsList.appendChild(accordion);
    });
  } else {
    sourceItems.forEach(({ log, status }) => {
      const logItem = document.createElement('div');
      logItem.className = 'log-item';
      logItem.dataset.id = log.id;
      const logColorIndex = getProjectColorIndex(log.project);
      logItem.classList.add(`project-color-${logColorIndex}`);
      const actionsIconsHtml = `
        <div class="log-actions">
          <div class="action-icon edit-btn" title="修改">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </div>
          <div class="action-icon delete-btn" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div class="action-icon fill-btn" title="填充">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>`;
      logItem.innerHTML = `
        <div class=\"log-item-header\">
          <div class=\"log-header-left\">${pendingSelectionMode ? `<input type=\"checkbox\" class=\"log-select-checkbox\" data-id=\"${log.id}\" ${pendingSelectedIds.has(log.id) ? 'checked' : ''}>` : ''}<span class=\"log-task-title\">${escapeHtml(log.taskName)}</span></div>
          <div class=\"log-header-right\">
            <span class=\"log-project-tag\" data-full-name=\"${escapeHtml(log.project)}\">${escapeHtml((log.project || '').slice(0,3))}</span>
            <div class=\"log-date\">${formatDate(log.date)}</div>
            <div class=\"log-hours\">${log.hours}h</div>
            ${actionsIconsHtml}
          </div>
        </div>
        <div class=\"log-content\"><span class=\"log-content-text\">${escapeHtml(log.content)}</span></div>
      `;
      const headerActions = logItem.querySelector('.log-item-header .log-actions');
      const contentDiv = logItem.querySelector('.log-content');
      if (headerActions && contentDiv) {
        contentDiv.appendChild(headerActions);
      }
      const fillBtn = logItem.querySelector('.fill-btn');
      const deleteBtn = logItem.querySelector('.delete-btn');
      const editBtn = logItem.querySelector('.edit-btn');
      if (status === 'pending') {
        const selectCheckbox = logItem.querySelector('.log-select-checkbox');
        if (fillBtn) fillBtn.addEventListener('click', function() { window.fillLog(log.id); });
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteLog(log.id, 'pending'));
        if (editBtn) editBtn.addEventListener('click', () => editLog(log.id, 'pending'));
        if (selectCheckbox) {
          selectCheckbox.addEventListener('change', (e) => {
            const id = log.id;
            if (e.target.checked) pendingSelectedIds.add(id);
            else pendingSelectedIds.delete(id);
          });
        }
      } else {
        const restoreBtn = logItem.querySelector('.restore-btn');
        if (restoreBtn) restoreBtn.addEventListener('click', () => restoreLog(log.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteLog(log.id, 'filled'));
        if (fillBtn) fillBtn.addEventListener('click', () => fillLog(log.id));
        if (editBtn) editBtn.addEventListener('click', () => editLog(log.id, 'filled'));
      }
      pendingLogsList.appendChild(logItem);
    });
  }
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
  // 日期筛选（可选）
  if (activeFilledDateFilter) {
    filteredLogs = filteredLogs.filter(log => log.date === activeFilledDateFilter);
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
    
    // 添加项目颜色类
    const colorIndex = getProjectColorIndex(log.project);
    logItem.classList.add(`project-color-${colorIndex}`);
    
    logItem.innerHTML = `
      <div class=\"log-item-header\">
        <div class=\"log-header-left\">
          ${filledSelectionMode ? `<input type=\"checkbox\" class=\"log-select-checkbox\" data-id=\"${log.id}\" ${filledSelectedIds.has(log.id) ? 'checked' : ''}>` : ''}
          <span class=\"log-task-title\">${escapeHtml(log.taskName)}</span>
        </div>
        <div class=\"log-header-right\">
          <span class=\"log-project-tag\" data-full-name=\"${escapeHtml(log.project)}\">${escapeHtml(log.project.slice(0,3))}</span>
          <div class=\"log-date\">${formatDate(log.date)}</div>
          <div class=\"log-hours\">${log.hours}h</div>
          <div class=\"log-actions\">
            <div class=\"action-icon edit-btn\" title=\"修改\">
              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"></path><path d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"></path></svg>
            </div>
            <div class=\"action-icon delete-btn\" title=\"删除\">
              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><line x1=\"10\" y1=\"11\" x2=\"10\" y2=\"17\"></line><line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\"></line></svg>
            </div>
            <div class=\"action-icon fill-btn\" title=\"填充\">
              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"9 11 12 14 22 4\"></polyline><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"></path></svg>
            </div>
          </div>
        </div>
      </div>
      <div class=\"log-content\"><span class=\"log-content-text\">${escapeHtml(log.content)}</span></div>
    `;
    
    // 添加事件监听器
    const deleteBtn = logItem.querySelector('.delete-btn');
    const fillBtn = logItem.querySelector('.fill-btn');
    const editBtn = logItem.querySelector('.edit-btn');
    const selectCheckbox = logItem.querySelector('.log-select-checkbox');
    
    deleteBtn.addEventListener('click', () => deleteLog(log.id, 'filled'));
    fillBtn.addEventListener('click', () => fillLog(log.id));
    if (editBtn) editBtn.addEventListener('click', () => editLog(log.id, 'filled'));

    // 选择复选框事件
    if (selectCheckbox) {
      selectCheckbox.addEventListener('change', (e) => {
        const id = log.id;
        if (e.target.checked) {
          filledSelectedIds.add(id);
        } else {
          filledSelectedIds.delete(id);
        }
      });
    }
    
    filledLogsList.appendChild(logItem);
  });
}

// 更新已填写项目标签
function updateFilledProjectTabs() {
  // 使用已申请下拉框填充项目列表
  if (!filledProjectDropdown) return;
  const projects = ['all', ...getCapturedProjects()];
  filledProjectDropdown.innerHTML = '';
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p === 'all' ? '全部项目' : p;
    filledProjectDropdown.appendChild(option);
  });
  // 保持当前筛选值
  filledProjectDropdown.value = activeFilledProjectFilter;
}

function getCapturedProjects(){
  try {
    var names = new Set();
    var bp = presetBlueprints || {};
    var sd = presetStageDemands || {};
    var tr = presetTaskReviewers || {};
    Object.keys(bp).forEach(function(k){ var n = (bp[k] && bp[k].ProjectName) || k; n = (n || '').trim(); if (n) names.add(n); });
    Object.keys(sd).forEach(function(k){ var n = (sd[k] && sd[k].ProjectName) || k; n = (n || '').trim(); if (n) names.add(n); });
    Object.keys(tr).forEach(function(k){ var n = (tr[k] && tr[k].ProjectName) || k; n = (n || '').trim(); if (n) names.add(n); });
    return Array.from(names).sort();
  } catch (e) { return []; }
}

function getProjectGuidByName(projectName){
  try {
    var bp = presetBlueprints || {}; var sd = presetStageDemands || {}; var tr = presetTaskReviewers || {};
    var k = projectName;
    var g = (bp[k] && bp[k].ProjectGuid) || (sd[k] && sd[k].ProjectGuid) || (tr[k] && tr[k].ProjectGuid);
    if (g) return g;
    var keys;
    keys = Object.keys(bp); for (var i=0;i<keys.length;i++){ var v = bp[keys[i]]; if (v && (v.ProjectName === projectName || keys[i] === projectName) && v.ProjectGuid) return v.ProjectGuid; }
    keys = Object.keys(sd); for (var j=0;j<keys.length;j++){ var v2 = sd[keys[j]]; if (v2 && (v2.ProjectName === projectName || keys[j] === projectName) && v2.ProjectGuid) return v2.ProjectGuid; }
    keys = Object.keys(tr); for (var m=0;m<keys.length;m++){ var v3 = tr[keys[m]]; if (v3 && (v3.ProjectName === projectName || keys[m] === projectName) && v3.ProjectGuid) return v3.ProjectGuid; }
    return '';
  } catch (e) { return ''; }
}

function openApplyPageForProject(projectName){
  try {
    var guid = getProjectGuidByName(projectName);
    if (!guid) { try { showToast('未捕获到该项目的 ProjectGuid'); } catch(e) {} return; }
    var today = new Date().toISOString().split('T')[0];
    var url = 'https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplyadd?ProjectGuid=' + encodeURIComponent(guid) + '&RZDate=' + encodeURIComponent(today);
    try { if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) { chrome.tabs.create({ url: url }); return; } } catch (e) {}
    try { window.open(url, '_blank'); } catch (e) {}
  } catch (e) {}
}

// 切换已填写项目筛选
function switchFilledProjectFilter(projectName) {
  activeFilledProjectFilter = projectName;
  // 同步下拉框显示
  if (filledProjectDropdown) {
    filledProjectDropdown.value = projectName;
  }
  
  // 重新渲染已填写日志列表
  renderFilledLogs();
  // 更新工时统计
  updateHoursStatistics();
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
  
  // 首先尝试从待填写列表中查找
  let logIndex = logs.pending.findIndex(log => log.id === id);
  let log;
  let fromPending = true;
  
  if (logIndex === -1) {
    // 如果在待填写列表中找不到，尝试从已填写列表中查找
    logIndex = logs.filled.findIndex(log => log.id === id);
    if (logIndex === -1) {
      console.error('Log not found with id:', id);
      showToast('未找到对应的日志记录，请刷新页面后重试');
      return;
    }
    // 从已填写列表中获取日志
    log = logs.filled[logIndex];
    fromPending = false;
  } else {
    // 从待填写列表中获取日志
    log = logs.pending[logIndex];
  }
  
  // 如果是从待填写列表中填充，则移动日志到已填写列表
  if (fromPending) {
    // 从待填写列表中移除
    logs.pending.splice(logIndex, 1)[0];
    // 添加到已填写列表
    logs.filled.push(log);
    
    // 保存并重新渲染
    saveLogs();
    updateProjectTabs();
    renderLogs();
  }
  
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
        
        // 填充数据后，执行额外的自动填充操作来激活编辑状态
        // 这些操作与底部快捷按钮的功能一致，可以确保datagrid处于可编辑状态
        setTimeout(() => {
          console.log('执行额外的自动填充操作来激活编辑状态...');
          
          // 执行与底部快捷按钮相同的自动填充操作
          autofillDemandTagToStory(presetDemandTag);
          autofillWorkTypeToMission(presetWorkType);
          if (presetCloseReminders) {
            autofillCloseRemindersToPage(presetCloseReminders);
          }
          applyBlueprintPresetToOA();
          applyStageDemandPresetToOA();
          applyTaskReviewerPresetToOA();
          
          console.log('额外的自动填充操作完成');
        }, 1000); // 延迟1秒确保数据填充完成后再执行
      }
    });
  } catch (error) {"explanation:修改fillLogToPage函数，在数据填充成功后，添加与底部快捷按钮相同的自动填充操作，确保datagrid处于可编辑状态"}
    console.error('Error executing script:', error);
    showToast('填充日志时发生错误: ' + error.message);
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
  deleteBtn.className = 'action-icon delete-btn';
  deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  deleteBtn.dataset.index = index;
  deleteBtn.title = '删除';
  
  const viewBtn = document.createElement('button');
  viewBtn.className = 'action-icon detail-btn';
  viewBtn.title = '查看';
  viewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="viewGradPreset" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="url(#viewGradPreset)" fill-opacity="0.9"/><circle cx="12" cy="12" r="3.5" fill="#ffffff"/><circle cx="12" cy="12" r="2" fill="#2d3748"/></svg>';
  viewBtn.addEventListener('click', () => {
    try { openUnifiedDetailsModal(project); } catch (e) {}
  });
  
  projectItem.appendChild(projectInput);
  projectItem.appendChild(viewBtn);
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
      const idxStr = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.index : undefined;
      const index = parseInt(idxStr, 10);
      if (Number.isInteger(index) && index >= 0 && index < presetProjects.length) {
        presetProjects.splice(index, 1);
        renderPresetProjectsList();
        // 删除预设项目后自动保存
        savePresetProjects();
      }
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
  
  // 初始化项目颜色映射
  initializeProjectColorMapping();
  
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
  editIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
  editIcon.title = '编辑';
  
  // 填充图标
  const submitIcon = document.createElement('div');
  submitIcon.className = 'action-icon';
  submitIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>';
  submitIcon.title = '填充';
  
  // 删除图标
  const deleteIcon = document.createElement('div');
  deleteIcon.className = 'action-icon';
  deleteIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
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
  // 项目分组展示勾选后立即保存并刷新首页列表
  if (groupByProjectCheckbox) {
    groupByProjectCheckbox.addEventListener('change', () => {
      saveGroupByProjectEnabled();
    });
  }
  // 自动填充总开关勾选后保存，并切换底部按钮显示
  if (autoFillPresetsCheckbox) {
    autoFillPresetsCheckbox.addEventListener('change', () => {
      savePresetAutoFillPresets();
      // 开启时立即应用所有预设；关闭时仅不再自动应用（不撤销已应用）
      if (presetAutoFillPresets) {
        autofillDemandTagToStory(presetDemandTag);
        autofillWorkTypeToMission(presetWorkType);
        if (presetCloseReminders) {
          autofillCloseRemindersToPage(presetCloseReminders);
        }
        applyBlueprintPresetToOA();
        applyStageDemandPresetToOA();
        applyTaskReviewerPresetToOA();
      }
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

// 加载“项目分组展示”配置
function loadGroupByProjectEnabled() {
  try {
    const saved = localStorage.getItem('groupByProjectEnabled');
    groupByProjectEnabled = saved === null ? true : (saved === 'true');
    if (groupByProjectCheckbox) {
      groupByProjectCheckbox.checked = !!groupByProjectEnabled;
    }
    renderLogs();
  } catch (error) {
    console.error('加载项目分组展示配置失败:', error);
    groupByProjectEnabled = true;
    if (groupByProjectCheckbox) groupByProjectCheckbox.checked = true;
  }
}

// 保存“项目分组展示”配置
function saveGroupByProjectEnabled() {
  try {
    groupByProjectEnabled = !!(groupByProjectCheckbox && groupByProjectCheckbox.checked);
    localStorage.setItem('groupByProjectEnabled', String(groupByProjectEnabled));
    showToast(groupByProjectEnabled ? '已开启项目分类展示' : '已关闭项目分类展示');
    renderLogs();
  } catch (error) {
    console.error('保存项目分组展示配置失败:', error);
  }
}

// 加载“自动填充预设配置”总开关
function loadPresetAutoFillPresets() {
  try {
    const saved = localStorage.getItem('presetAutoFillPresets');
    // 默认开启；若不存在则使用true
    presetAutoFillPresets = saved === null ? true : (saved === 'true');
    if (autoFillPresetsCheckbox) {
      autoFillPresetsCheckbox.checked = !!presetAutoFillPresets;
    }
    // 加载设置后立即更新按钮可见性
    updateApplyPresetsBtnVisibility();
  } catch (error) {
    console.error('加载自动填充设置失败:', error);
    presetAutoFillPresets = true;
    if (autoFillPresetsCheckbox) autoFillPresetsCheckbox.checked = true;
    // 出错时也要更新按钮可见性
    updateApplyPresetsBtnVisibility();
  }
}

// 保存“自动填充预设配置”总开关
function savePresetAutoFillPresets() {
  try {
    presetAutoFillPresets = !!(autoFillPresetsCheckbox && autoFillPresetsCheckbox.checked);
    localStorage.setItem('presetAutoFillPresets', String(presetAutoFillPresets));
    
    showToast(presetAutoFillPresets ? '已开启自动填充' : '已关闭自动填充');
  } catch (error) {
    console.error('保存自动填充设置失败:', error);
    showToast('保存自动填充设置失败');
  }
}

// 统一更新底部“填充”按钮的显示/隐藏逻辑
function updateApplyPresetsBtnVisibility() {
  try {
    const btn = document.getElementById('apply-presets-btn');
    if (!btn) return;
    // 填充按钮始终显示
    btn.classList.remove('hidden');
    btn.style.display = 'block';
  } catch (error) {
    console.error('更新填充按钮可见性失败:', error);
  }
}

// 加载蓝图预设映射（ProjectGuid -> Blueprint preset）
function loadPresetBlueprints() {
  try {
    const saved = localStorage.getItem('presetBlueprints');
    presetBlueprints = saved ? JSON.parse(saved) : {};
    renderBlueprintPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  } catch (error) {
    console.error('加载蓝图预设失败:', error);
    presetBlueprints = {};
    renderBlueprintPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  }
}

// 保存蓝图预设映射
function savePresetBlueprints(quiet) {
  try {
    localStorage.setItem('presetBlueprints', JSON.stringify(presetBlueprints || {}));
    renderBlueprintPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
    if (!quiet) { showToast('蓝图预设已保存'); }
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
    delBtn.className = 'action-icon delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
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

// ===================== 新增日志功能 =====================
function openAddLogWindow() {
  try {
    // 获取当前日期作为默认值
    const today = new Date().toISOString().split('T')[0];
    
    // 填充项目选项 - 包含现有日志项目和预设项目
    const projectsSet = new Set(getCapturedProjects());
    
    // 清空并重新填充项目候选列表（datalist）
    if (modalProjectDatalist) {
      modalProjectDatalist.innerHTML = '';
      projectsSet.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        modalProjectDatalist.appendChild(option);
      });
    }

    // 设置默认日期和工时
    modalDateInput.value = today;
    modalHoursInput.value = '2'; // 默认工时为2小时
    
    // 清空其他表单字段
    modalTaskNameInput.value = '';
    modalContentTextarea.value = '';
    
    // 显示模态框
    addLogModal.style.display = 'block';
    
  } catch (error) {
    console.error('打开新增日志窗口失败:', error);
    showToast('打开新增日志窗口失败，请重试');
  }
}

function openAddLogWindowForProject(projectName) {
  openAddLogWindow();
  try {
    if (modalProjectSelect) modalProjectSelect.value = projectName || '';
    if (modalTaskNameInput) {
      modalTaskNameInput.value = '';
      modalTaskNameInput.disabled = false;
    }
    const modalTitle = addLogModal && addLogModal.querySelector('.modal-header h3');
    if (modalTitle) modalTitle.textContent = '新增工作日志';
  } catch (e) {}
}

// 关闭模态框函数
function closeAddLogModal() {
  addLogModal.style.display = 'none';
  modalAddLogForm.reset();
  
  // 重置模态框标题为默认标题
  const modalTitle = addLogModal.querySelector('.modal-header h3');
  if (modalTitle) {
    modalTitle.textContent = '新增工作日志';
  }
  
  // 清除编辑模式标记
  delete modalAddLogForm.dataset.editingLogId;
  delete modalAddLogForm.dataset.editingLogStatus;
  try { if (modalTaskNameInput) modalTaskNameInput.disabled = false; } catch (e) {}
}

// 保存日志并继续函数
function saveLogAndContinue() {
  try {
    const project = modalProjectSelect.value;
    const taskName = modalTaskNameInput.value.trim();
    let content = modalContentTextarea.value.trim();
    const hours = parseFloat(modalHoursInput.value);
    const date = modalDateInput.value;

    // 验证输入
    if (!project) {
      showErrorToast('请选择项目名称');
      return;
    }
    if (!taskName) {
      showErrorToast('请输入任务名称');
      return;
    }
    // 自动复制任务名称到工作内容（当开关开启且内容为空）
    const autoCopyEnabled = autoCopyTaskContentSwitch ? !!autoCopyTaskContentSwitch.checked : true;
    if (!content && autoCopyEnabled) {
      if (!taskName) {
        showErrorToast('任务名称为空，无法自动复制');
        return;
      }
      content = taskName;
      if (modalContentTextarea) { modalContentTextarea.value = content; }
    }
    if (!content) {
      showErrorToast('请输入工作内容');
      return;
    }
    if (!hours || hours <= 0) {
      showErrorToast('请输入有效的工作时长');
      return;
    }
    if (!date) {
      showErrorToast('请选择工作日期');
      return;
    }

    // 项目来源来自一键捕获的项目列表，不再写入旧的预设项目

    // 创建新日志
    const newLog = {
      id: Date.now().toString(),
      project: project,
      taskName: taskName,
      content: content,
      hours: hours,
      date: date,
      status: 'pending'
    };

    // 添加到待填写日志列表
    logs.pending.push(newLog);
    saveLogs();
    renderPendingLogs();
    updateHoursStatistics();
    
    // 保存当前项目选择
    const currentProject = modalProjectSelect.value;
    
    // 清空表单，但保留项目选择
    modalTaskNameInput.value = '';
    modalContentTextarea.value = '';
    modalHoursInput.value = '2'; // 重置为默认工时
    
    // 恢复项目选择
    modalProjectSelect.value = currentProject;
    
    
    // 显示成功消息
    showToast('日志添加成功！可继续添加下一条日志。');
    
  } catch (error) {
    console.error('保存日志失败:', error);
    showErrorToast('保存日志失败，请重试');
  }
}

// ===================== 任务审核人预设：存储与渲染 =====================
function loadPresetTaskReviewers() {
  try {
    const saved = localStorage.getItem('presetTaskReviewers');
    presetTaskReviewers = saved ? JSON.parse(saved) : {};
    renderTaskReviewerPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  } catch (error) {
    console.error('加载任务审核人预设失败:', error);
    presetTaskReviewers = {};
    renderTaskReviewerPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  }
}

function savePresetTaskReviewers(quiet) {
  try {
    localStorage.setItem('presetTaskReviewers', JSON.stringify(presetTaskReviewers || {}));
    renderTaskReviewerPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
    if (!quiet) { showToast('任务审核人预设已保存'); }
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
    delBtn.className = 'action-icon delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
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
function captureCurrentTaskReviewerFromOA(quiet) {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      if (!quiet) { showToast('请在扩展环境中使用此功能'); }
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { if (!quiet) { showToast('未找到活动标签页'); } return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { if (!quiet) { showToast('请在OA页面使用捕获功能'); } return; }
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
          if (!found) { if (!quiet) { showToast('未捕获到任务审核人，请先在OA页选择'); } return; }
          const key = (found.ProjectName || '').trim();
          if (!key) { if (!quiet) { showToast('无法识别项目名称'); } return; }
          presetTaskReviewers[key] = found;
          savePresetTaskReviewers(quiet);
          if (!quiet) { showToast('已捕获并保存任务审核人预设'); }
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          if (!quiet) { showToast('捕获任务审核人失败'); }
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
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  } catch (error) {
    console.error('加载工作场景预设失败:', error);
    presetStageDemands = {};
    renderStageDemandPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
  }
}

// 保存工作场景预设映射
function savePresetStageDemands(quiet) {
  try {
    localStorage.setItem('presetStageDemands', JSON.stringify(presetStageDemands || {}));
    renderStageDemandPresetsList();
    try { renderUnifiedPresetsList(); } catch (e) {}
    try { updateProjectTabs(); } catch (e) {}
    try { updateFilledProjectTabs(); } catch (e) {}
    if (!quiet) { showToast('工作场景预设已保存'); }
  } catch (error) {
    console.error('保存工作场景预设失败:', error);
  }
}

function captureAllPresetsFromOA() {
  try {
    captureCurrentBlueprintFromOA(true);
    captureCurrentStageDemandFromOA(true);
    captureCurrentTaskReviewerFromOA(true);
    setTimeout(function(){ 
      try { renderUnifiedPresetsList(); } catch (e) {}
      try { updateProjectTabs(); } catch (e) {}
      try { updateFilledProjectTabs(); } catch (e) {}
      showToast('一键捕获完成，已保存预设');
    }, 800);
  } catch (e) {}
}

function renderUnifiedPresetsList() {
  try {
    if (!unifiedPresetsList) return;
    var bpMap = presetBlueprints || {};
    var sdMap = presetStageDemands || {};
    var trMap = presetTaskReviewers || {};
    var keys = Array.from(new Set([].concat(Object.keys(bpMap), Object.keys(sdMap), Object.keys(trMap))));
    if (keys.length === 0) {
      unifiedPresetsList.innerHTML = '<p style="color:#888;">暂无捕获数据</p>';
      return;
    }
    var ul = document.createElement('ul');
    ul.className = 'preset-list';
    keys.forEach(function(k){
      var bp = bpMap[k] || {};
      var sd = sdMap[k] || {};
      var tr = trMap[k] || {};
      var projName = bp.ProjectName || sd.ProjectName || tr.ProjectName || k;
      var li = document.createElement('li');
      var info = document.createElement('div');
      info.className = 'preset-info';
      var s1 = document.createElement('span');
      s1.textContent = '项目: ' + (projName || '');
      info.appendChild(s1);

  var actions = document.createElement('div');
  actions.className = 'preset-actions';
  var detailBtn = document.createElement('button');
  detailBtn.className = 'action-icon detail-btn';
  detailBtn.type = 'button';
  detailBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="viewGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="url(#viewGrad)" fill-opacity="0.9"/><circle cx="12" cy="12" r="3.5" fill="#ffffff"/><circle cx="12" cy="12" r="2" fill="#2d3748"/></svg>';
  detailBtn.addEventListener('click', function(ev){
    try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    openUnifiedDetailsModal(k);
  });
  actions.appendChild(detailBtn);

  var delBtn = document.createElement('button');
  delBtn.className = 'action-icon delete-btn';
  delBtn.type = 'button';
  delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
  delBtn.title = '删除';
  delBtn.addEventListener('click', function(ev){
    try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    removeUnifiedPreset(k);
  });
  actions.appendChild(delBtn);
  
  li.appendChild(info);
  li.appendChild(actions);
  ul.appendChild(li);
    });
    unifiedPresetsList.innerHTML = '';
    unifiedPresetsList.appendChild(ul);
  } catch (e) {}
}

function openUnifiedDetailsModal(projectKey){
  try {
    var bp = (presetBlueprints || {})[projectKey] || {};
    var sd = (presetStageDemands || {})[projectKey] || {};
    var tr = (presetTaskReviewers || {})[projectKey] || {};
    var projName = bp.ProjectName || sd.ProjectName || tr.ProjectName || projectKey;
    var projGuid = bp.ProjectGuid || sd.ProjectGuid || tr.ProjectGuid || '';
    if (unifiedDetailsBody) {
      var wrap = document.createElement('div');
      wrap.className = 'details-grid';

      var secBase = document.createElement('div');
      secBase.className = 'details-section';
      var secBaseTitle = document.createElement('div');
      secBaseTitle.className = 'details-section-title';
      secBaseTitle.textContent = '基础信息';
      var secBaseBody = document.createElement('div');
      secBaseBody.className = 'details-section-body';
      secBaseBody.appendChild(makeDetailRow('项目名称', projName));
      secBaseBody.appendChild(makeDetailRow('ProjectGuid', projGuid));
      secBase.appendChild(secBaseTitle);
      secBase.appendChild(secBaseBody);

      var secBp = document.createElement('div');
      secBp.className = 'details-section';
      var secBpTitle = document.createElement('div');
      secBpTitle.className = 'details-section-title';
      secBpTitle.textContent = '蓝图';
      var secBpBody = document.createElement('div');
      secBpBody.className = 'details-section-body';
      secBpBody.appendChild(makeDetailRow('蓝图名称', bp.BluePrint_Formal || ''));
      secBpBody.appendChild(makeDetailRow('蓝图GUID', bp.BluePrint_FormalGuid || ''));
      secBpBody.appendChild(makeDetailRow('蓝图等级', bp.BluePrintLevel || ''));
      secBpBody.appendChild(makeDetailRow('合同GUID', bp.ContractGuid || ''));
      secBpBody.appendChild(makeDetailRow('是否有建设合同', bp.IsWYSJSHT || ''));
      secBpBody.appendChild(makeDetailRow('合同编号', bp.ContractNumber || ''));
      if (typeof bp.YLGZMoney !== 'undefined') secBpBody.appendChild(makeDetailRow('遗留工作金额', bp.YLGZMoney || ''));
      if (typeof bp.HasYLGZ !== 'undefined') secBpBody.appendChild(makeDetailRow('是否存在遗留工作', bp.HasYLGZ || ''));
      secBp.appendChild(secBpTitle);
      secBp.appendChild(secBpBody);

      var secSd = document.createElement('div');
      secSd.className = 'details-section';
      var secSdTitle = document.createElement('div');
      secSdTitle.className = 'details-section-title';
      secSdTitle.textContent = '工作场景';
      var secSdBody = document.createElement('div');
      secSdBody.className = 'details-section-body';
      secSdBody.appendChild(makeDetailRow('场景名称', sd.StageDemandName || ''));
      secSdBody.appendChild(makeDetailRow('场景GUID', sd.StageDemandGuid || ''));
      secSd.appendChild(secSdTitle);
      secSd.appendChild(secSdBody);

      var secTr = document.createElement('div');
      secTr.className = 'details-section';
      var secTrTitle = document.createElement('div');
      secTrTitle.className = 'details-section-title';
      secTrTitle.textContent = '任务审核人';
      var secTrBody = document.createElement('div');
      secTrBody.className = 'details-section-body';
      secTrBody.appendChild(makeDetailRow('审核人姓名', tr.TaskReviewerName || ''));
      secTrBody.appendChild(makeDetailRow('审核人GUID', tr.TaskReviewerGuid || ''));
      secTr.appendChild(secTrTitle);
      secTr.appendChild(secTrBody);

      wrap.appendChild(secBase);
      wrap.appendChild(secBp);
      wrap.appendChild(secSd);
      wrap.appendChild(secTr);

      unifiedDetailsBody.innerHTML = '';
      unifiedDetailsBody.appendChild(wrap);
    }
    if (unifiedDetailsModal) unifiedDetailsModal.style.display = 'block';
  } catch (e) {}
}

function makeDetailRow(label, value){
  var row = document.createElement('div');
  row.className = 'details-row';
  var l = document.createElement('div');
  l.className = 'details-label';
  l.textContent = label;
  var v = document.createElement('div');
  v.className = 'details-value';
  v.textContent = value || '—';
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

function removeUnifiedPreset(projectKey) {
  try {
    if (!projectKey) return;
    var changed = false;
    if (presetBlueprints && presetBlueprints[projectKey]) { delete presetBlueprints[projectKey]; changed = true; }
    if (presetStageDemands && presetStageDemands[projectKey]) { delete presetStageDemands[projectKey]; changed = true; }
    if (presetTaskReviewers && presetTaskReviewers[projectKey]) { delete presetTaskReviewers[projectKey]; changed = true; }
    if (changed) {
      try {
        if (presetBlueprints && Object.keys(presetBlueprints).length) localStorage.setItem('presetBlueprints', JSON.stringify(presetBlueprints)); else localStorage.removeItem('presetBlueprints');
        if (presetStageDemands && Object.keys(presetStageDemands).length) localStorage.setItem('presetStageDemands', JSON.stringify(presetStageDemands)); else localStorage.removeItem('presetStageDemands');
        if (presetTaskReviewers && Object.keys(presetTaskReviewers).length) localStorage.setItem('presetTaskReviewers', JSON.stringify(presetTaskReviewers)); else localStorage.removeItem('presetTaskReviewers');
      } catch (e) {}
      try { renderBlueprintPresetsList(); } catch (e) {}
      try { renderStageDemandPresetsList(); } catch (e) {}
      try { renderTaskReviewerPresetsList(); } catch (e) {}
      try { renderUnifiedPresetsList(); } catch (e) {}
      showToast('已删除该项目的捕获数据');
    }
  } catch (e) {}
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
    delBtn.className = 'action-icon delete-btn';
    delBtn.type = 'button';
    delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
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
function captureCurrentStageDemandFromOA(quiet) {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      if (!quiet) { showToast('请在扩展环境中使用此功能'); }
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { if (!quiet) { showToast('未找到活动标签页'); } return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { if (!quiet) { showToast('请在OA页面使用捕获功能'); } return; }
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
          if (!found) { if (!quiet) { showToast('未捕获到工作场景，请先在OA页选择工作场景'); } return; }
          const key = found.ProjectName;
          presetStageDemands[key] = found;
          savePresetStageDemands(quiet);
          if (!quiet) { showToast('已捕获并保存工作场景预设'); }
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          if (!quiet) { showToast('捕获工作场景失败'); }
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
function captureCurrentBlueprintFromOA(quiet) {
  try {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      if (!quiet) { showToast('请在扩展环境中使用此功能'); }
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) { if (!quiet) { showToast('未找到活动标签页'); } return; }
      const tab = tabs[0];
      const url = tab.url || '';
      if (!url.includes('oa.epoint.com.cn')) { if (!quiet) { showToast('请在OA页面使用捕获功能'); } return; }
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
          if (!found) { if (!quiet) { showToast('未捕获到蓝图，请先在OA页选择蓝图'); } return; }
          const key = found.ProjectName;
          presetBlueprints[key] = found;
          savePresetBlueprints(quiet);
          if (!quiet) { showToast('已捕获并保存蓝图预设'); }
        } catch (e) {
          console.error('处理捕获结果失败:', e);
          if (!quiet) { showToast('捕获蓝图失败'); }
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
