import google.generativeai as genai
import os

def get_api_key_manual():
    """Lee el archivo .env manualmente sin necesitar librerías extra"""
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                # Busca líneas que empiecen con GEMINI_API_KEY o GOOGLE_API_KEY
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    
                    if key in ['GEMINI_API_KEY', 'GOOGLE_API_KEY']:
                        return value
    except FileNotFoundError:
        print("❌ ERROR: No encuentro el archivo .env en esta carpeta.")
        return None
    return None

# Intentar obtener la llave
api_key = os.getenv("GEMINI_API_KEY") or get_api_key_manual()

if not api_key:
    print("❌ ERROR: No se encontró la GEMINI_API_KEY en el archivo .env")
    print("Asegúrate de tener un archivo llamado .env con la línea: GEMINI_API_KEY=tu_clave")
    exit()

print(f"🔑 Probando llave que empieza con: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    
    print("\n📡 Conectando con Google para listar modelos disponibles...")
    models = genai.list_models()
    
    available = []
    print("\n📋 MODELOS DISPONIBLES PARA TI:")
    print("-" * 40)
    for m in models:
        # Filtramos solo los que sirven para generar texto (generateContent)
        if 'generateContent' in m.supported_generation_methods:
            # Limpiamos el prefijo 'models/' para mostrarte el nombre limpio
            clean_name = m.name.replace("models/", "")
            print(f"✅ {clean_name}")
            available.append(clean_name)
    print("-" * 40)
    
    if not available:
        print("⚠️ CONEXIÓN EXITOSA PERO SIN MODELOS DE TEXTO.")
        print("Tu API Key podría no tener activada la 'Generative Language API'.")
    else:
        print(f"\n💡 SUGERENCIA FINAL:")
        print(f"Edita 'backend/ai_engine/gemini_client.py' y usa uno de estos nombres:")
        # Priorizamos el flash si está disponible
        best_choice = next((m for m in available if 'flash' in m), available[0])
        print(f'model_name = "{best_choice}"') 

except Exception as e:
    print(f"\n❌ ERROR DE CONEXIÓN: {e}")