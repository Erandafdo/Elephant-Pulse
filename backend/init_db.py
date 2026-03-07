import sqlite3
import hashlib

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Drop tables if they exist to apply new schema
    cursor.execute('DROP TABLE IF EXISTS daily_logs')
    cursor.execute('DROP TABLE IF EXISTS stress_logs')
    cursor.execute('DROP TABLE IF EXISTS health_logs')
    cursor.execute('DROP TABLE IF EXISTS elephants')
    cursor.execute('DROP TABLE IF EXISTS users')

    # Create Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Vet'
        )
    ''')

    # Create Elephants Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS elephants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT,
            weight_kg REAL,
            height_m REAL,
            special_notes TEXT,
            image_url TEXT,
            base_health_score INTEGER DEFAULT 80,
            activity_level TEXT DEFAULT 'Medium'
        )
    ''')

    # Create Health Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            elephant_id INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature REAL,
            heart_rate REAL, 
            respiratory_rate REAL,
            weight_change REAL,
            food_intake INTEGER,
            stool_consistency TEXT,
            activity_level TEXT,
            edema TEXT,
            trunk_moisture TEXT,
            mucous_membrane TEXT,
            gait_score TEXT,
            predicted_status TEXT,
            diagnosis TEXT,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')

    # Create Stress Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stress_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            elephant_id INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            stress_level REAL,
            status TEXT,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')

    # Create Daily Food Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            elephant_id INTEGER NOT NULL,
            temperature_c REAL,
            humidity_percent REAL,
            activity_score REAL,
            health_status TEXT,
            morning_food_kg REAL,
            evening_food_kg REAL,
            ai_remark TEXT,
            FOREIGN KEY (elephant_id) REFERENCES elephants (id)
        )
    ''')

    # Seed Users (Password is 'password' hashed)
    password_hash = hashlib.sha256('password'.encode()).hexdigest()
    
    users = [
        ('vet_kamal', password_hash, 'Vet'),
        ('feeder_sunil', password_hash, 'Feeder')
    ]
    
    cursor.executemany('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', users)

    # Seed Elephants
    elephants = [
        ('Raja', 45, 'Male', 4500.0, 3.2, 'Tusker with gentle temperament.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Elephant_Pinnawala.jpg/800px-Elephant_Pinnawala.jpg', 90, 'Medium'),
        ('Kandula', 22, 'Male', 3800.0, 2.8, 'Young and energetic.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Asian_Elephant_at_Pinnawala_Elephant_Orphanage.jpg/800px-Asian_Elephant_at_Pinnawala_Elephant_Orphanage.jpg', 85, 'High'),
        ('Menike', 60, 'Female', 3200.0, 2.5, 'Matriarch figure.', 'https://upload.wikimedia.org/wikipedia/commons/2/23/Sri_Lankan_Elephant_Pinnawala.jpg', 75, 'Low'),
        ('Sama', 10, 'Female', 1500.0, 1.8, 'Rescued from a well in 2015.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Pinnawala_Elephant_Orphanage_2.jpg/800px-Pinnawala_Elephant_Orphanage_2.jpg', 80, 'High'),
        ('Bhanu', 33, 'Male', 4100.0, 3.0, 'Previously worked in logging.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Asian_Elephants_at_Pinnawala.jpg/800px-Asian_Elephants_at_Pinnawala.jpg', 80, 'Medium')
    ]
    
    cursor.executemany('INSERT OR IGNORE INTO elephants (name, age, gender, weight_kg, height_m, special_notes, image_url, base_health_score, activity_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', elephants)

    conn.commit()
    conn.close()
    print("Database initialized with full schema and seed data.")

if __name__ == '__main__':
    init_db()
