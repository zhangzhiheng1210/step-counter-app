# 运动计步器 - 详细安装部署指南

## 📋 目录
1. [本地开发测试](#本地开发测试)
2. [部署到云服务器](#部署到云服务器)
3. [部署到免费平台](#部署到免费平台)
4. [在手机上运行](#在手机上运行)
5. [常见问题](#常见问题)

---

## 🖥️ 本地开发测试

### 第一步: 安装Python环境

确保你的电脑上已安装Python 3.7+

```bash
# 检查Python版本
python --version
# 或
python3 --version
```

如果没有安装Python,请访问: https://www.python.org/downloads/

### 第二步: 下载项目代码

将整个 `step_counter_app` 文件夹保存到你的电脑

### 第三步: 安装依赖

打开命令行/终端,进入项目目录:

```bash
cd step_counter_app
```

安装Python依赖包:

```bash
pip install -r requirements.txt
```

如果使用的是pip3:
```bash
pip3 install -r requirements.txt
```

### 第四步: 运行应用

```bash
python app.py
```

或者:
```bash
python3 app.py
```

看到类似输出表示成功:
```
 * Running on http://0.0.0.0:5000
```

### 第五步: 在电脑浏览器测试

打开浏览器访问: `http://localhost:5000`

### 第六步: 在手机上测试

1. 确保手机和电脑在同一WiFi网络
2. 查看电脑IP地址:
   - Windows: 打开命令提示符,输入 `ipconfig`,查找IPv4地址
   - Mac/Linux: 打开终端,输入 `ifconfig` 或 `ip addr`
3. 在手机浏览器输入: `http://你的电脑IP:5000`
   例如: `http://192.168.1.100:5000`

---

## ☁️ 部署到云服务器 (推荐)

### 方案A: 使用腾讯云/阿里云

#### 1. 购买云服务器
- 选择最便宜的配置即可(1核2G)
- 操作系统选择 Ubuntu 20.04 或 22.04

#### 2. 连接服务器
使用SSH工具连接(Windows可用PuTTY,Mac/Linux直接用终端)

```bash
ssh root@你的服务器IP
```

#### 3. 安装Python和依赖

```bash
# 更新系统
sudo apt update

# 安装Python3和pip
sudo apt install python3 python3-pip -y

# 安装git
sudo apt install git -y
```

#### 4. 上传代码

方法1: 使用git (如果代码在GitHub)
```bash
git clone 你的仓库地址
cd step_counter_app
```

方法2: 使用SCP上传
在你的电脑上运行:
```bash
scp -r step_counter_app root@服务器IP:/root/
```

#### 5. 安装依赖并运行

```bash
cd step_counter_app
pip3 install -r requirements.txt
python3 app.py
```

#### 6. 使用进程管理工具保持运行

安装supervisor:
```bash
sudo apt install supervisor -y
```

创建配置文件:
```bash
sudo nano /etc/supervisor/conf.d/step_counter.conf
```

添加内容:
```ini
[program:step_counter]
command=python3 /root/step_counter_app/app.py
directory=/root/step_counter_app
autostart=true
autorestart=true
stderr_logfile=/var/log/step_counter.err.log
stdout_logfile=/var/log/step_counter.out.log
```

启动服务:
```bash
sudo supervisorctl reload
sudo supervisorctl start step_counter
```

#### 7. 配置防火墙

```bash
# 允许5000端口
sudo ufw allow 5000
```

现在可以在手机浏览器访问: `http://你的服务器IP:5000`

### 配置域名(可选)

如果你有域名,可以:
1. 将域名解析到服务器IP
2. 安装Nginx做反向代理
3. 使用Let's Encrypt配置HTTPS

---

## 🆓 部署到免费平台

### 方案B: 使用Render.com (推荐,永久免费)

#### 1. 创建账号
访问 https://render.com 并注册

#### 2. 准备代码
需要将代码上传到GitHub (创建一个公开仓库)

#### 3. 在项目根目录添加启动配置

创建 `render.yaml`:
```yaml
services:
  - type: web
    name: step-counter
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
```

#### 4. 在Render创建Web Service
- 选择 "New Web Service"
- 连接你的GitHub仓库
- 选择免费套餐
- 点击 "Create Web Service"

等待部署完成,会得到一个免费域名,例如:
`https://step-counter.onrender.com`

---

## 📱 在手机上运行 (Termux方案)

如果不想用服务器,可以直接在Android手机上运行:

### 1. 安装Termux
从F-Droid下载Termux: https://f-droid.org/en/packages/com.termux/
(不要用Google Play版本,已过时)

### 2. 在Termux中安装依赖

```bash
# 更新包管理器
pkg update && pkg upgrade -y

# 安装Python
pkg install python -y

# 安装git
pkg install git -y
```

### 3. 下载代码并运行

```bash
# 克隆或下载代码
# 假设你把代码放在了Downloads
cd ~/storage/downloads/step_counter_app

# 安装依赖
pip install -r requirements.txt

# 运行应用
python app.py
```

### 4. 访问应用

在手机浏览器打开: `http://localhost:5000`

---

## ❓ 常见问题

### Q1: 传感器不工作怎么办?
**A:** 
- iOS设备需要点击"授予权限"按钮
- 确保使用HTTPS或localhost访问(Chrome安全限制)
- 某些浏览器可能不支持,建议使用Chrome或Safari

### Q2: 如何配置HTTPS?
**A:** 
- 云服务器: 使用Let's Encrypt + Nginx
- Render等平台: 自动提供HTTPS
- 本地测试: 生成自签名证书

### Q3: 步数统计不准确?
**A:** 
- 算法使用简化版本,可调整 `STEP_THRESHOLD` 参数
- 不同设备传感器灵敏度不同
- 可以根据实际情况微调阈值

### Q4: 如何修改目标步数?
**A:** 
编辑 `pedometer.js`,修改:
```javascript
const GOAL_STEPS = 10000; // 改成你想要的数值
```

### Q5: 数据会丢失吗?
**A:** 
- 数据保存在SQLite数据库中
- 建议定期备份 `data/steps.db` 文件
- 可以扩展为使用MySQL等数据库

### Q6: 能否添加多用户功能?
**A:** 
可以!需要:
1. 添加用户登录系统
2. 修改数据库schema添加user_id
3. 在保存/读取时关联用户

### Q7: 如何查看日志?
**A:** 
```bash
# 查看Supervisor日志
sudo tail -f /var/log/step_counter.out.log
sudo tail -f /var/log/step_counter.err.log
```

---

## 🚀 进阶优化建议

1. **性能优化**
   - 使用Redis缓存实时数据
   - 异步保存到数据库
   - 前端使用Service Worker缓存

2. **功能扩展**
   - 添加用户系统
   - 好友排行榜
   - 运动挑战和徽章
   - 数据导出功能

3. **UI优化**
   - 添加动画效果
   - 深色模式
   - 多语言支持

4. **数据分析**
   - 周/月统计图表
   - 运动趋势分析
   - AI建议

---

## 📞 技术支持

如有问题,可以:
1. 检查浏览器控制台错误信息
2. 查看服务器日志
3. 确认网络连接和防火墙设置

祝使用愉快! 🏃‍♂️💪
