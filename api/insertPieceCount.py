import time
import requests
import pymysql
from datetime import datetime, timedelta
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
    {"start": "18:20", "end": "18:40", "label": "6th Hour"},
    {"start": "18:40", "end": "19:40", "label": "7th Hour"},
    {"start": "19:40", "end": "20:40", "label": "8th Hour"},
    {"start": "20:40", "end": "21:40", "label": "9th Hour"},
    {"start": "21:40", "end": "22:40", "label": "10th Hour"}
]

def fetch_data_for_all_slots(slots, shift):
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
            all_data.append(('No operator', 0, slot['label'], shift))
        else:
            for row in result:
                operator = row[0]
                total_piece_count = row[1]
                
                # Fetch the previous piece count from the database
                prev_query = """
                    SELECT pieceCount
                    FROM piececount
                    WHERE operator = %s AND slot_label = %s AND shift = %s
                    ORDER BY timestamp DESC LIMIT 1
                """
                
                cursor.execute(prev_query, (operator, slot['label'], shift))
                prev_result = cursor.fetchone()
                
                previous_count = prev_result[0] if prev_result else 0
                diff = total_piece_count - previous_count
                
                print(f"Operator: {operator}, Total Piece Count: {total_piece_count}, Previous Count: {previous_count}, Diff: {diff}")

                if diff != 0:  # Only add data if the pieceCount has changed
                    all_data.append((operator, diff, slot['label'], shift))

                    # Update the previous piece count in the database
                    update_query = """
                        INSERT INTO api_piececount_prev (operator, pieceCount, slot_label, shift, timestamp)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(update_query, (operator, total_piece_count, slot['label'], shift, datetime.now()))

    connection.commit()
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
        print(f"Posting data: {post_data}")
        try:
            response = requests.post(API_URL, json=post_data)
            response.raise_for_status()
            print(f"Successfully posted data for operator {operator}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to post data for operator {operator}: {e}")

def get_all_slots_for_today():
    current_time = datetime.now().strftime('%H:%M')
    if '06:00' <= current_time < '14:00':
        return shift_a_time_slots, 'A'
    elif '14:00' <= current_time < '22:00':
        return shift_b_time_slots, 'B'
    else:
        return [], ''

def main():
    while True:
        current_time = datetime.now().strftime('%H:%M')
        current_date = datetime.now().strftime('%Y-%m-%d')

        # Fetch data for the current and previous time slots
        slots_to_check = []
        for slots, shift in [(shift_a_time_slots, 'A'), (shift_b_time_slots, 'B')]:
            for slot in slots:
                start_time = f"{current_date} {slot['start']}:00"
                end_time = f"{current_date} {slot['end']}:00"
                if start_time <= current_time < end_time:
                    slots_to_check.append((slots, shift, slot))
                    break  # Stop checking further slots for this shift

        if not slots_to_check:
            # No active slot, try to insert data for previous slots if available
            for slots, shift in [(shift_a_time_slots, 'A'), (shift_b_time_slots, 'B')]:
                if slots_to_check:
                    break  # If we already found a previous slot, no need to check further
                for i, slot in enumerate(slots):
                    if i == 0:
                        continue  # Skip the first slot as there is no previous slot for it
                    previous_slot = slots[i - 1]
                    start_time = f"{current_date} {previous_slot['start']}:00"
                    end_time = f"{current_date} {previous_slot['end']}:00"
                    slots_to_check.append((slots, shift, previous_slot))
                    break  # Stop checking further slots for this shift

        if slots_to_check:
            print(f"Fetching data for slots at {current_time}")
            for slots, shift, slot in slots_to_check:
                data = fetch_data_for_all_slots(slots, shift)
                print(f"Posting data for slots at {current_time}")
                post_data(data)

        time.sleep(60)

if __name__ == "__main__":
    main()
