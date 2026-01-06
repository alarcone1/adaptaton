"""
Configuración de base de datos SQLAlchemy
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from ..config import settings

# Crear directorio de datos si no existe
settings.DATA_DIR.mkdir(exist_ok=True)

# Configurar SQLite con ruta absoluta
database_path = settings.DATA_DIR / "database.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{database_path}"

# Crear engine con configuración para SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Para SQLite
    echo=settings.DEBUG  # Log SQL queries en modo debug
)

# Crear SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obtener sesión de base de datos
    Se usa en FastAPI con Depends()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Crear todas las tablas en la base de datos"""
    from .models import Base
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Eliminar todas las tablas (usar con cuidado)"""
    from .models import Base
    Base.metadata.drop_all(bind=engine)

def reset_database():
    """Resetear completamente la base de datos"""
    drop_tables()
    create_tables()

# Test de conexión
def test_connection():
    """Probar conexión a la base de datos"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        print(f"Error de conexión a la base de datos: {e}")
        return False