import requests
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import pytz
import time

# Database connection
def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='softmatter',
            user='newuser',
            password='12345'
        )
        if connection.is_connected():
            print("Connected to the database")
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

# Create table if not exists
def create_table(connection):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS api_piececount (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operator VARCHAR(30) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        pieceCount INT NOT NULL,
        UNIQUE KEY unique_entry (operator, timestamp)
    )
    """
    cursor = connection.cursor()
    cursor.execute(create_table_query)
    connection.commit()

# Insert shooter count into the database
def insert_shooter_count(connection, operator, piece_count, timestamp):
    insert_query = "INSERT INTO api_piececount (operator, timestamp, pieceCount) VALUES (%s, %s, %s)"
    cursor = connection.cursor()
    cursor.execute(insert_query, (operator, timestamp, piece_count))
    connection.commit()

# Fetch the last shooter count for an operator
def get_last_shooter_count(connection, operator):
    select_query = "SELECT pieceCount FROM api_piececount WHERE operator=%s ORDER BY timestamp DESC LIMIT 1"
    cursor = connection.cursor()
    cursor.execute(select_query, (operator,))
    result = cursor.fetchone()
    return int(result[0]) if result else None

# Fetch data from the API
def fetch_data_from_api():
    url = "https://utech-iiot.lk/enmonqa/public/api/MachineData_mas"
    response = requests.post(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return None

# Main logic to process the data and save to database
def main():
    connection = create_connection()
    if connection:
        create_table(connection)

        while True:
            data = fetch_data_from_api()
            if data:
                current_date = datetime.utcnow().date()
                for operator, details in data.items():
                    piece_count = details['data_set'].get('shooter_Count', None)
                    if piece_count is None:
                        piece_count = details['data_set'].get('shooter_Count1', None)
                        if piece_count is None:
                            piece_count = details['data_set'].get('shooter_Count2', None)

                    time_index = details.get('time_index')
                    if piece_count is not None and time_index:
                        time_index_date = datetime.strptime(time_index.split(' ')[0], '%Y-%m-%d').date()
                        if time_index_date == current_date:
                            # Strip the timezone offset
                            timestamp_utc = datetime.strptime(time_index.split('+')[0], '%Y-%m-%d %H:%M:%S.%f')
                            # Convert UTC timestamp to local time (UTC+5:30)
                            utc_zone = pytz.utc
                            local_zone = pytz.timezone('Asia/Kolkata')
                            timestamp_utc = utc_zone.localize(timestamp_utc)
                            timestamp_local = timestamp_utc.astimezone(local_zone).strftime('%Y-%m-%d %H:%M:%S')

                            last_shooter_count = get_last_shooter_count(connection, operator)
                            if last_shooter_count is not None:
                                difference = int(piece_count) - last_shooter_count
                                if difference > 0:  # Ensure the difference is positive
                                    insert_shooter_count(connection, operator, difference, timestamp_local)
                                    print(f"Inserted data for operator: {operator} with pieceCount: {difference}")
                                else:
                                    print(f"No positive change in shooter count for operator: {operator}, skipping insertion.")
                            else:
                                piece_count = int(piece_count)
                                if piece_count >= 0:  # Ensure the piece_count is non-negative
                                    insert_shooter_count(connection, operator, piece_count, timestamp_local)
                                    print(f"Inserted data for operator: {operator} with pieceCount: {piece_count}")
            time.sleep(60)

if __name__ == "__main__":
    main()
