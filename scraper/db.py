import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="ycDatabase",
        user="postgres",
        password="1234", 
        port="5432",
        cursor_factory=RealDictCursor
    )