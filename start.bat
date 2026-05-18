@echo off
chcp 65001 >nul
echo ======================================
echo   运动计步器 - 快速启动脚本
echo ======================================
echo.

REM 检查Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python
    echo 请先安装Python: https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo.

REM 检查依赖
python -c "import flask" 2>nul
if %errorlevel% neq 0 (
    echo 📦 正在安装依赖包...
    pip install -r requirements.txt
    echo.
)

REM 创建数据目录
if not exist data mkdir data

REM 获取本机IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo 🌐 网络信息:
echo   本地访问: http://localhost:5000
if defined IP echo   手机访问: http://%IP%:5000
echo.

echo 🚀 启动应用...
echo 按 Ctrl+C 停止服务器
echo ======================================
echo.

REM 启动Flask应用
python app.py

pause
