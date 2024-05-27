import time
import requests
import pymysql
from datetime import datetime
import base64

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'newuser',
    'password': '12345',
    'database': 'softmatter'
}

# API configuration
API_URL = 'http://localhost:5000/set/setPieceCount'

# Time slot definitions for Shift A and Shift B
shift_a_time_slots = [
    {"start": "06:00", "end": "06:20", "label": "1st Hour"},
    {"start": "06:20", "end": "07:20", "label": "2nd Hour"},
    {"start": "07:20", "end": "08:20", "label": "3rd Hour"},
    {"start": "08:20", "end": "09:40", "label": "4th Hour"},
    {"start": "09:40", "end": "10:40", "label": "5th Hour"},
    {"start": "10:40", "end": "11:00", "label": "6th Hour"},
    {"start": "11:00", "end": "12:00", "label": "7th Hour"},
    {"start": "12:00", "end": "13:00", "label": "8th Hour"},
    {"start": "13:00", "end": "14:00", "label": "9th Hour"}
]

shift_b_time_slots = [
    {"start": "14:00", "end": "14:20", "label": "1st Hour"},
    {"start": "14:20", "end": "15:20", "label": "2nd Hour"},
    {"start": "15:20", "end": "16:20", "label": "3rd Hour"},
    {"start": "16:20", "end": "17:20", "label": "4th Hour"},
    {"start": "17:20", "end": "18:20", "label": "5th Hour"},
    {"start": "18:20", "end": "19:20", "label": "6th Hour"},
    {"start": "19:20", "end": "19:40", "label": "7th Hour"},
    {"start": "19:40", "end": "20:00", "label": "8th Hour"}
]

def fetch_data_for_all_slots(slots):
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()

    all_data = []
    
    for slot in slots:
        query = """
            SELECT operator, SUM(pieceCount) as totalPieceCount
            FROM api_piececount
            WHERE timestamp BETWEEN %s AND %s
            GROUP BY operator
        """
        
        start_time = f"{datetime.now().strftime('%Y-%m-%d')} {slot['start']}:00"
        end_time = f"{datetime.now().strftime('%Y-%m-%d')} {slot['end']}:00"
        
        cursor.execute(query, (start_time, end_time))
        result = cursor.fetchall()
        
        if not result:
            all_data.append(('No operator', 0, slot['label'], 'A' if slots == shift_a_time_slots else 'B'))
        else:
            for row in result:
                all_data.append((row[0], row[1], slot['label'], 'A' if slots == shift_a_time_slots else 'B'))

    connection.close()
    
    return all_data

def post_data(data):
    for row in data:
        operator = row[0]
        total_piece_count = row[1]
        current_slot_label = row[2]
        shift = row[3]
        
        encoded_username = base64.b64encode(operator.encode('utf-8')).decode('utf-8')
        
        post_data = {
            'username': encoded_username,
            'pieceCount': int(total_piece_count),
            'hour': current_slot_label,
            'shift': shift
        }
        print(post_data)
        response = requests.post(API_URL, json=post_data)
        
        if response.status_code == 200:
            print(f"Successfully posted data for operator {operator}")
        else:
            print(f"Failed to post data for operator {operator}, status code: {response.status_code}")

def main():
    while True:
        current_time = datetime.now().strftime('%H:%M')
        if '06:00' <= current_time < '14:00':
            slots = shift_a_time_slots
        elif '14:00' <= current_time < '20:00':
            slots = shift_b_time_slots
        else:
            slots = []
        
        if slots:
            data = fetch_data_for_all_slots(slots)
            post_data(data)
        
        time.sleep(60)

if __name__ == "__main__":
    main()
