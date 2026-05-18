// 全局变量
let stepCount = 0;
let isTracking = false;
let lastAcceleration = { x: 0, y: 0, z: 0 };
let lastStepTime = 0;
const STEP_THRESHOLD = 1.2; // 步数检测阈值
const MIN_STEP_INTERVAL = 300; // 最小步间隔(毫秒)
const GOAL_STEPS = 10000; // 目标步数
let startTime = null;
let trackingInterval = null;

// DOM元素
const stepCountEl = document.getElementById('stepCount');
const caloriesEl = document.getElementById('caloriesValue');
const distanceEl = document.getElementById('distanceValue');
const timeEl = document.getElementById('timeValue');
const progressRingEl = document.getElementById('progressRing');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const dateDisplayEl = document.getElementById('dateDisplay');
const historyListEl = document.getElementById('historyList');
const supportWarningEl = document.getElementById('supportWarning');
const permissionBoxEl = document.getElementById('permissionBox');
const requestPermissionBtn = document.getElementById('requestPermissionBtn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateDateDisplay();
    loadTodayData();
    loadHistory();
    checkSensorSupport();
});

// 更新日期显示
function updateDateDisplay() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateDisplayEl.textContent = now.toLocaleDateString('zh-CN', options);
}

// 检查传感器支持
function checkSensorSupport() {
    if (window.DeviceMotionEvent) {
        // iOS 13+ 需要请求权限
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            permissionBoxEl.style.display = 'block';
            requestPermissionBtn.addEventListener('click', requestMotionPermission);
        } else {
            // Android 和旧版iOS直接可用
            console.log('传感器可用');
        }
    } else {
        supportWarningEl.style.display = 'block';
        startBtn.disabled = true;
    }
}

// 请求运动权限 (iOS 13+)
async function requestMotionPermission() {
    try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
            permissionBoxEl.style.display = 'none';
            alert('权限已授予,可以开始记录步数!');
        } else {
            alert('需要授权才能使用计步功能');
        }
    } catch (error) {
        console.error('权限请求失败:', error);
        alert('权限请求失败: ' + error.message);
    }
}

// 计算步数
function detectStep(acceleration) {
    const now = Date.now();
    
    // 计算加速度变化幅度
    const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
    const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
    const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    
    // 检测步数
    if (totalDelta > STEP_THRESHOLD && (now - lastStepTime) > MIN_STEP_INTERVAL) {
        stepCount++;
        lastStepTime = now;
        updateDisplay();
        saveToServer();
    }
    
    lastAcceleration = { ...acceleration };
}

// 开始记录
startBtn.addEventListener('click', () => {
    if (!isTracking) {
        isTracking = true;
        startTime = Date.now();
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        
        // 监听设备运动
        window.addEventListener('devicemotion', handleMotion);
        
        // 启动时间更新
        trackingInterval = setInterval(updateTime, 1000);
        
        console.log('开始记录步数');
    }
});

// 停止记录
stopBtn.addEventListener('click', () => {
    stopTracking();
});

function stopTracking() {
    if (isTracking) {
        isTracking = false;
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        
        window.removeEventListener('devicemotion', handleMotion);
        
        if (trackingInterval) {
            clearInterval(trackingInterval);
        }
        
        saveToServer();
        console.log('停止记录');
    }
}

// 处理设备运动事件
function handleMotion(event) {
    if (!isTracking) return;
    
    const acc = event.accelerationIncludingGravity;
    if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        detectStep({
            x: acc.x || 0,
            y: acc.y || 0,
            z: acc.z || 0
        });
    }
}

// 重置今日数据
resetBtn.addEventListener('click', () => {
    if (confirm('确定要重置今日步数吗?')) {
        stepCount = 0;
        startTime = Date.now();
        updateDisplay();
        saveToServer();
    }
});

// 更新显示
function updateDisplay() {
    // 更新步数
    stepCountEl.textContent = stepCount.toLocaleString();
    
    // 计算卡路里 (简化公式: 步数 * 0.04)
    const calories = (stepCount * 0.04).toFixed(1);
    caloriesEl.textContent = calories;
    
    // 计算距离 (简化公式: 步数 * 0.0007 km)
    const distance = (stepCount * 0.0007).toFixed(2);
    distanceEl.textContent = distance;
    
    // 更新进度环
    const progress = Math.min((stepCount / GOAL_STEPS) * 100, 100);
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (progress / 100) * circumference;
    progressRingEl.style.strokeDashoffset = offset;
}

// 更新时间
function updateTime() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
    timeEl.textContent = elapsed;
}

// 保存到服务器
async function saveToServer() {
    try {
        const calories = (stepCount * 0.04).toFixed(1);
        const distance = (stepCount * 0.0007).toFixed(2);
        
        const response = await fetch('/api/save_steps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                steps: stepCount,
                calories: parseFloat(calories),
                distance: parseFloat(distance)
            })
        });
        
        const result = await response.json();
        console.log('保存结果:', result);
    } catch (error) {
        console.error('保存失败:', error);
    }
}

// 加载今日数据
async function loadTodayData() {
    try {
        const response = await fetch('/api/get_today');
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            stepCount = result.data.steps || 0;
            updateDisplay();
        }
    } catch (error) {
        console.error('加载今日数据失败:', error);
    }
}

// 加载历史记录
async function loadHistory() {
    try {
        const response = await fetch('/api/get_history');
        const result = await response.json();
        
        if (result.status === 'success') {
            displayHistory(result.data);
        }
    } catch (error) {
        console.error('加载历史失败:', error);
        historyListEl.innerHTML = '<p class="loading">加载失败</p>';
    }
}

// 显示历史记录
function displayHistory(history) {
    if (!history || history.length === 0) {
        historyListEl.innerHTML = '<p class="loading">暂无历史记录</p>';
        return;
    }
    
    historyListEl.innerHTML = history.map(record => `
        <div class="history-item">
            <div class="history-date">${formatDate(record.date)}</div>
            <div class="history-stats">
                <div class="history-stat">
                    <div class="history-stat-value">${record.steps.toLocaleString()}</div>
                    <div class="history-stat-label">步</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${record.calories.toFixed(1)}</div>
                    <div class="history-stat-label">千卡</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-value">${record.distance.toFixed(2)}</div>
                    <div class="history-stat-label">公里</div>
                </div>
            </div>
        </div>
    `).join('');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
        return '今天';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
        return '昨天';
    } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
}

// 定期自动保存
setInterval(() => {
    if (isTracking && stepCount > 0) {
        saveToServer();
    }
}, 60000); // 每分钟保存一次
