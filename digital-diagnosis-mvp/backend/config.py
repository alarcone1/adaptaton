"""
Configuración del sistema
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from decouple import config
from pathlib import Path

class Settings:
    """Configuración de la aplicación"""
    
    # Configuración general
    DEBUG: bool = config("DEBUG", default=True, cast=bool)
    SECRET_KEY: str = config("SECRET_KEY", default="change_this_secret_key_in_production")
    
    # Base de datos
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./data/database.db")
    
    # Google Gemini API
    GEMINI_API_KEY: str = config("GEMINI_API_KEY", default="")
    
    # Configuración del servidor
    HOST: str = config("HOST", default="127.0.0.1")
    PORT: int = config("PORT", default=8000, cast=int)
    
    # JWT Configuration
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    ALGORITHM: str = "HS256"
    
    # A1ia Tech Branding
    BRAND_PRIMARY_COLOR: str = config("BRAND_PRIMARY_COLOR", default="#FF8C00")
    BRAND_SECONDARY_COLOR: str = config("BRAND_SECONDARY_COLOR", default="#99F683")
    BRAND_DARK_COLOR: str = config("BRAND_DARK_COLOR", default="#151F3B")
    
    # Rutas de archivos
    BASE_DIR: Path = Path(__file__).parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    FRONTEND_DIR: Path = BASE_DIR / "frontend"
    
    # Configuración del modelo de madurez
    DIMENSIONES_MADUREZ = {
        1: {
            "nombre": "Estrategia y Liderazgo Digital",
            "subdimensiones": {
                1.1: "Visión y Hoja de Ruta Digital",
                1.2: "Implicación del Liderazgo",
                1.3: "Cultura Orientada a Datos"
            }
        },
        2: {
            "nombre": "Procesos, Operaciones y Datos", 
            "subdimensiones": {
                2.1: "Digitalización de Procesos Administrativos",
                2.2: "Gestión de la Cadena de Suministro",
                2.3: "Operaciones y Producción"
            }
        },
        3: {
            "nombre": "Marketing y Experiencia del Cliente",
            "subdimensiones": {
                3.1: "Atracción de Clientes",
                3.2: "Proceso de Venta Digital", 
                3.3: "Fidelización y Servicio Post-Venta"
            }
        },
        4: {
            "nombre": "Tecnología e Infraestructura",
            "subdimensiones": {
                4.1: "Hardware y Equipos",
                4.2: "Software y Aplicaciones",
                4.3: "Conectividad y Redes"
            }
        },
        5: {
            "nombre": "Cultura y Talento Humano",
            "subdimensiones": {
                5.1: "Competencias Digitales del Equipo",
                5.2: "Formación y Desarrollo de Talento",
                5.3: "Cultura de Colaboración y Gestión del Cambio"
            }
        },
        6: {
            "nombre": "Ciberseguridad y Gobernanza",
            "subdimensiones": {
                6.1: "Seguridad Técnica",
                6.2: "Gobernanza de la Información"
            }
        }
    }
    
    # Configuración de usuarios predeterminados
    DEFAULT_USERS = [
        {
            "email": "admin@a1iatech.com",
            "password": "admin123",
            "rol": "ADMIN",
            "nombre": "Administrador A1ia Tech",
            "activo": True
        },
        {
            "email": "asesor@a1iatech.com", 
            "password": "asesor123",
            "rol": "ASESOR",
            "nombre": "Asesor de Transformación Digital",
            "activo": True
        },
        {
            "email": "up@empresa.com",
            "password": "up123", 
            "rol": "UP",
            "nombre": "Empresa Demo",
            "activo": True
        }
    ]

# Instancia global de configuración
settings = Settings()

# Crear directorios necesarios
settings.DATA_DIR.mkdir(exist_ok=True)