# 运动步数统计应用

## 项目简介
这是一个类似微信运动的Web应用，可以在手机浏览器中运行，统计用户的步数并展示运动数据。

## 技术栈
- 前端: HTML5 + CSS3 + JavaScript (使用DeviceMotion API)
- 后端: Python Flask
- 数据库: SQLite (轻量级)

## 项目结构
```
step_counter_app/
├── app.py              # Flask后端主程序
├── requirements.txt    # Python依赖包
├── static/            # 静态文件目录
│   ├── css/
│   │   └── style.css  # 样式文件
│   ├── js/
│   │   └── pedometer.js  # 步数统计逻辑
│   └── manifest.json  # PWA配置文件
├── templates/         # HTML模板目录
│   └── index.html    # 主页面
└── data/             # 数据库目录
    └── steps.db      # SQLite数据库
```

## 安装步骤

### 1. 在电脑上开发和测试

#### 安装依赖
```bash
pip install -r requirements.txt
```

#### 运行应用
```bash
python app.py
```

然后在浏览器访问 `http://localhost:5000`

### 2. 部署到手机

#### 方案A: 使用云服务器（推荐）
1. 购买云服务器（阿里云、腾讯云等）
2. 上传代码到服务器
3. 运行 `python app.py`
4. 手机浏览器访问服务器IP地址

#### 方案B: 使用Termux在手机本地运行
1. 安装Termux App
2. 在Termux中安装Python和依赖
3. 运行应用
4. 手机浏览器访问 `http://localhost:5000`

#### 方案C: 使用免费部署平台
- Render.com
- Railway.app
- PythonAnywhere

## 功能特点
✅ 实时步数统计
✅ 每日运动数据展示
✅ 历史记录查询
✅ 响应式设计，适配手机屏幕
✅ 可添加到手机桌面（PWA）
