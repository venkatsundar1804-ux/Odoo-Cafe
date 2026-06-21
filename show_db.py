import sqlite3
import os

print("\n==== 1. sql_app.db ====")
if os.path.exists('sql_app.db'):
    conn = sqlite3.connect('sql_app.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print("Tables inside sql_app.db:")
    for t in tables:
        print(f" - {t[0]}")
    conn.close()
else:
    print("sql_app.db not found")

print("\n==== 2. backend_server/sql_app.db ====")
if os.path.exists('backend_server/sql_app.db'):
    conn = sqlite3.connect('backend_server/sql_app.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print("Tables inside backend_server/sql_app.db:")
    for t in tables:
        print(f" - {t[0]}")
    conn.close()
else:
    print("backend_server/sql_app.db not found")
