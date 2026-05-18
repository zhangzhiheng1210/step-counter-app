from flask import Flask, render_template, request, jsonify
from datetime import datetime, date
import sqlite3
import os

app = Flask(__name__)

# 确保数据目录存在
os.makedirs('data', exist_ok=True)

# 数据库初始化
def init_db():
    conn = sqlite3.connect('data/steps.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS step_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT DEFAULT 'default_user',
            date TEXT NOT NULL,
            steps INTEGER NOT NULL,
            calories REAL,
            distance REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    """主页面"""
    return render_template('index.html')

@app.route('/api/save_steps', methods=['POST'])
def save_steps():
    """保存步数数据"""
    try:
        data = request.json
        today = date.today().isoformat()
        
        conn = sqlite3.connect('data/steps.db')
        cursor = conn.cursor()
        
        # 检查今天是否已有记录
        cursor.execute('SELECT id FROM step_records WHERE date = ?', (today,))
        existing = cursor.fetchone()
        
        if existing:
            # 更新今天的记录
            cursor.execute('''
                UPDATE step_records 
                SET steps = ?, calories = ?, distance = ?
                WHERE date = ?
            ''', (data['steps'], data['calories'], data['distance'], today))
        else:
            # 插入新记录
            cursor.execute('''
                INSERT INTO step_records (date, steps, calories, distance)
                VALUES (?, ?, ?, ?)
            ''', (today, data['steps'], data['calories'], data['distance']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'status': 'success', 'message': '数据保存成功'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/get_today', methods=['GET'])
def get_today():
    """获取今天的步数"""
    try:
        today = date.today().isoformat()
        conn = sqlite3.connect('data/steps.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT steps, calories, distance 
            FROM step_records 
            WHERE date = ?
        ''', (today,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return jsonify({
                'status': 'success',
                'data': {
                    'steps': result[0],
                    'calories': result[1],
                    'distance': result[2]
                }
            })
        else:
            return jsonify({
                'status': 'success',
                'data': {
                    'steps': 0,
                    'calories': 0,
                    'distance': 0
                }
            })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/get_history', methods=['GET'])
def get_history():
    """获取历史记录（最近7天）"""
    try:
        conn = sqlite3.connect('data/steps.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, steps, calories, distance 
            FROM step_records 
            ORDER BY date DESC 
            LIMIT 7
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        history = []
        for row in results:
            history.append({
                'date': row[0],
                'steps': row[1],
                'calories': row[2],
                'distance': row[3]
            })
        
        return jsonify({
            'status': 'success',
            'data': history
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # 在本地开发时使用
    # app.run(debug=True, host='0.0.0.0', port=5001)
    
    # 在服务器部署时使用
    app.run(debug=False, host='0.0.0.0', port=5001)
