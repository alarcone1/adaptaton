#!/usr/bin/env python3
"""
Script principal para ejecutar el MVP localmente
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

import os
import sys
import subprocess
import uvicorn
from pathlib import Path

def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    try:
        import fastapi
        import sqlalchemy
        import google.generativeai
        print("✅ Dependencias verificadas correctamente")
        return True
    except ImportError as e:
        print(f"❌ Error: Dependencia faltante - {e}")
        print("Ejecuta: pip install -r requirements.txt")
        return False

def setup_environment():
    """Configura el entorno inicial"""
    # Crear directorio data si no existe
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    
    # Verificar archivo .env
    if not Path(".env").exists():
        if Path(".env.example").exists():
            print("⚠️  Archivo .env no encontrado. Copiando desde .env.example")
            import shutil
            shutil.copy(".env.example", ".env")
            print("📝 Archivo .env creado. Puedes editarlo si necesitas cambiar configuraciones.")
        else:
            print("❌ Error: Archivo .env.example no encontrado")
            return False
    
    print("✅ Entorno configurado correctamente")
    return True

def initialize_database():
    """Inicializa la base de datos con datos iniciales"""
    try:
        from backend.database.init_db import initialize_database as init_db
        init_db()
        print("✅ Base de datos inicializada correctamente")
        return True
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando MVP - Herramienta de Diagnóstico Digital")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
    
    # Configurar entorno
    if not setup_environment():
        sys.exit(1)
    
    # Inicializar base de datos
    if not initialize_database():
        sys.exit(1)
    
    print("\n📋 INFORMACIÓN DEL SISTEMA:")
    print("- Frontend: http://127.0.0.1:8000")
    print("- API Docs: http://127.0.0.1:8000/docs")
    print("- Usuarios predeterminados:")
    print("  * Admin: admin@a1iatech.com / admin123")
    print("  * Asesor: asesor@a1iatech.com / asesor123")
    print("  * UP Demo: up@empresa.com / up123")
    
    print("\n🎯 FUNCIONALIDADES DISPONIBLES:")
    print("- ✅ Cuestionario inteligente (119 preguntas)")
    print("- ✅ Diagnóstico automático con IA")
    print("- ✅ Análisis DOFA con Gemini")
    print("- ✅ Recomendaciones personalizadas")
    print("- ✅ Dashboard interactivo")
    print("- ✅ Biblioteca de recursos (28 recursos)")
    print("- ✅ Colaboración Humano-IA")
    
    print("\n🔧 Para detener el servidor: Ctrl+C")
    print("=" * 50)
    
    # Iniciar servidor
    try:
        uvicorn.run(
            "backend.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido. ¡Gracias por usar la Herramienta de Diagnóstico Digital!")
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()