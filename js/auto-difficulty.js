// 自动设置难度系数为4星
(function() {
  'use strict';
  
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
  
})();
