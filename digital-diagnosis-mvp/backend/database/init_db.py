"""
Script de inicialización de base de datos
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

import pandas as pd
import json
from pathlib import Path
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Importar modelos y configuración
from .database import engine, SessionLocal, create_tables
from .models import (
    Usuario, Dimension, Subdimension, Pregunta, 
    Recurso, AsignacionAsesor
)
from ..config import settings

# Configurar hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Generar hash de contraseña"""
    return pwd_context.hash(password)

def load_csv_data():
    """Cargar datos desde archivos CSV"""
    # Cargar preguntas desde el CSV
    preguntas_path = settings.BASE_DIR / "data" / "cuestionario_preguntas.csv"
    if preguntas_path.exists():
        preguntas_df = pd.read_csv(preguntas_path)
        return preguntas_df
    else:
        print(f"Archivo de preguntas no encontrado: {preguntas_path}")
        return None

def initialize_database():
    """Inicializar base de datos con datos iniciales"""
    print("Inicializando base de datos...")
    
    # Crear tablas
    create_tables()
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # 1. Verificar si ya existen datos
        if db.query(Usuario).first():
            print("Base de datos ya inicializada.")
            return True
        
        # 2. Crear dimensiones
        print("Creando dimensiones...")
        for dim_id, dim_data in settings.DIMENSIONES_MADUREZ.items():
            dimension = Dimension(
                id=dim_id,
                nombre=dim_data["nombre"],
                descripcion=f"Dimensión {dim_id}: {dim_data['nombre']}",
                orden=dim_id
            )
            db.add(dimension)
            
            # Crear subdimensiones
            for subdim_id, subdim_nombre in dim_data["subdimensiones"].items():
                subdimension = Subdimension(
                    id=subdim_id,
                    dimension_id=dim_id,
                    nombre=subdim_nombre,
                    descripcion=f"Subdimensión {subdim_id}: {subdim_nombre}",
                    orden=int((subdim_id % 1) * 10)
                )
                db.add(subdimension)
        
        # 3. Cargar preguntas desde CSV
        print("Cargando preguntas del cuestionario...")
        preguntas_df = load_csv_data()
        if preguntas_df is not None:
            for _, row in preguntas_df.iterrows():
                try:
                    # Parsear opciones JSON
                    opciones = json.loads(row['opciones_respuesta'])
                    
                    pregunta = Pregunta(
                        id=row['id'],
                        dimension_id=int(row['dimension_id']),
                        subdimension_id=float(row['subdimension_id']),
                        texto_pregunta=row['texto_pregunta'],
                        tipo_pregunta=row['tipo_pregunta'],
                        opciones_respuesta=opciones,
                        orden=len(db.query(Pregunta).all()) + 1
                    )
                    db.add(pregunta)
                except Exception as e:
                    print(f"Error procesando pregunta {row.get('id', 'N/A')}: {e}")
        
        # 4. Crear usuarios predeterminados
        print("Creando usuarios predeterminados...")
        for user_data in settings.DEFAULT_USERS:
            usuario = Usuario(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                nombre=user_data["nombre"],
                rol=user_data["rol"],
                activo=user_data["activo"]
            )
            db.add(usuario)
        
        # 5. Crear recursos del catálogo
        print("Creando recursos del catálogo...")
        recursos_data = get_recursos_catalogo()
        for recurso_data in recursos_data:
            recurso = Recurso(**recurso_data)
            db.add(recurso)
        
        # Confirmar cambios
        db.commit()
        print("Base de datos inicializada correctamente!")
        
        return True
        
    except Exception as e:
        print(f"Error inicializando base de datos: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def get_recursos_catalogo():
    """Definir recursos del catálogo"""
    return [
        {
            "id": "REC001",
            "titulo": "Mi Primera Planificación Digital",
            "descripcion": "Plantilla simple para definir objetivos digitales en una página",
            "tipo_recurso": "PLANTILLA",
            "nivel_dificultad": "BASICO",
            "duracion_estimada": "20 min",
            "dimension_principal": 1,
            "subdimensiones_mapeo": [1.1],
            "url_contenido": "INTERNO",
            "objetivos_aprendizaje": "Escribir 3 objetivos digitales claros para el próximo año",
            "prerequisitos": "NINGUNO"
        },
        {
            "id": "REC002",
            "titulo": "¿Por dónde empiezo? - Video para dueños",
            "descripcion": "Video motivacional sobre primeros pasos digitales",
            "tipo_recurso": "VIDEO",
            "nivel_dificultad": "BASICO",
            "duracion_estimada": "8 min",
            "dimension_principal": 1,
            "subdimensiones_mapeo": [1.2],
            "url_contenido": "https://ejemplo.com/video1",
            "objetivos_aprendizaje": "Convencer al propietario de dar el primer paso digital",
            "prerequisitos": "NINGUNO"
        },
        {
            "id": "REC003",
            "titulo": "WhatsApp Business: Más allá del chat",
            "descripcion": "Catálogo, respuestas automáticas, estadísticas",
            "tipo_recurso": "VIDEO",
            "nivel_dificultad": "BASICO",
            "duracion_estimada": "16 min",
            "dimension_principal": 3,
            "subdimensiones_mapeo": [3.2],
            "url_contenido": "https://ejemplo.com/video3",
            "objetivos_aprendizaje": "Configurar tienda en WhatsApp Business",
            "prerequisitos": "NINGUNO"
        }
    ]

if __name__ == "__main__":
    initialize_database()