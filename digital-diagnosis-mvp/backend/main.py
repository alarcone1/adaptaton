"""
Aplicación principal FastAPI
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path

# Importar configuración
from .config import settings

# Importar routers de API
from .api.auth import router as auth_router
from .api.cuestionario import router as cuestionario_router
from .api.diagnostico import router as diagnostico_router
from .api.recursos import router as recursos_router
from .api.usuarios import router as usuarios_router

# Crear aplicación FastAPI
app = FastAPI(
    title="Herramienta de Diagnóstico Digital",
    description="MVP para evaluación de madurez digital de Unidades Productivas - A1ia Tech",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers de API
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(cuestionario_router, prefix="/api/cuestionario", tags=["Cuestionario"])
app.include_router(diagnostico_router, prefix="/api/diagnostico", tags=["Diagnóstico"])
app.include_router(recursos_router, prefix="/api/recursos", tags=["Recursos"])
app.include_router(usuarios_router, prefix="/api/usuarios", tags=["Usuarios"])

# Servir archivos estáticos del frontend
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Servir assets (logos, favicon)
assets_path = frontend_path / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

# Favicon específico
@app.get("/favicon.ico", response_class=FileResponse)
async def favicon_ico():
    """Favicon para compatibilidad con navegadores"""
    favicon_path = Path(__file__).parent.parent / "frontend" / "assets" / "favicon.ico"
    if favicon_path.exists():
        return FileResponse(str(favicon_path))
    # Fallback al SVG si no existe ICO
    favicon_svg = Path(__file__).parent.parent / "frontend" / "assets" / "favicon.svg"
    if favicon_svg.exists():
        return FileResponse(str(favicon_svg))
    raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/favicon.svg", response_class=FileResponse)
async def favicon_svg():
    """Favicon SVG"""
    favicon_path = Path(__file__).parent.parent / "frontend" / "assets" / "favicon.svg"
    if favicon_path.exists():
        return FileResponse(str(favicon_path))
    raise HTTPException(status_code=404, detail="Favicon SVG not found")

@app.get("/", response_class=HTMLResponse)
async def home():
    """Página principal - Landing page"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Plataforma Inteligente de Consultoría Digital - A1ia Tech</title>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #151F3B 0%, #3A4A6B 100%);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                color: white;
                padding: 60px 0;
            }
            
            .header h1 {
                font-size: 3rem;
                margin-bottom: 20px;
                background: linear-gradient(45deg, #FF8C00, #99F683);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .header p {
                font-size: 1.2rem;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(45deg, #FF8C00, #FFA500);
                color: white;
                padding: 15px 30px;
                font-size: 1.1rem;
                text-decoration: none;
                border-radius: 8px;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                margin: 10px;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 140, 0, 0.4);
            }
            
            .stats {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 40px;
                margin: 40px 0;
                text-align: center;
            }
            
            .stats h2 {
                color: white;
                margin-bottom: 30px;
                font-size: 2rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 20px;
                max-width: 900px;
                margin: 0 auto;
            }
            
            .stat-item {
                color: white;
            }
            
            .stat-number {
                display: block;
                font-size: 2.5rem;
                font-weight: bold;
                color: #99F683;
                margin-bottom: 5px;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 30px;
                margin: 60px auto;
                max-width: 1000px;
            }
            
            .feature-card {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            
            .feature-card:hover {
                transform: translateY(-5px);
            }
            
            .feature-icon {
                font-size: 3rem;
                margin-bottom: 20px;
                display: block;
            }
            
            .feature-title {
                font-size: 1.5rem;
                color: #151F3B;
                margin-bottom: 15px;
            }
            
            .feature-description {
                color: #666;
                margin-bottom: 20px;
            }
            
            .kpis-section {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                padding: 40px;
                margin: 40px 0;
                text-align: center;
            }
            
            .kpis-section h2 {
                color: #151F3B;
                margin-bottom: 30px;
                font-size: 2rem;
            }
            
            .kpis-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 25px;
                max-width: 900px;
                margin: 30px auto 0;
            }
            
            .kpi-card {
                background: linear-gradient(135deg, #FF8C00, #FFA500);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
            }
            
            .kpi-value {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 8px;
                display: block;
            }
            
            .kpi-label {
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            .process-flow {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 40px;
                margin: 40px 0;
                color: white;
            }
            
            .process-flow h2 {
                text-align: center;
                margin-bottom: 40px;
                font-size: 2rem;
            }
            
            .flow-steps {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 20px;
                max-width: 900px;
                margin: 0 auto;
            }
            
            .step {
                text-align: center;
                padding: 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                transition: all 0.3s ease;
            }
            
            .step:hover {
                border-color: #99F683;
                transform: translateY(-5px);
            }
            
            .step-number {
                display: inline-block;
                width: 40px;
                height: 40px;
                background: #99F683;
                color: #151F3B;
                border-radius: 50%;
                line-height: 40px;
                font-weight: bold;
                margin-bottom: 15px;
            }
            
            .step-title {
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .footer {
                text-align: center;
                color: white;
                margin-top: 60px;
                padding: 40px 0;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Plataforma Inteligente de Consultoría Digital</h1>
                <p>Para Asesores Especializados en Transformación Digital</p>
                <p>Gestiona múltiples UPs • Planes dinámicos • Seguimiento inteligente • IA adaptativa</p>
                <a href="/pages/login.html" class="cta-button">🚀 Acceder como Asesor</a>
            </div>
            
            <div class="stats">
                <h2>Sistema de Consultoría Avanzado</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">119</span>
                        <span>Preguntas Especializadas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">6</span>
                        <span>Dimensiones de Análisis</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">28+</span>
                        <span>Recursos Dinámicos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">AI</span>
                        <span>Google Gemini 2.5</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">∞</span>
                        <span>UPs Gestionables</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span>Seguimiento Activo</span>
                    </div>
                </div>
            </div>
            
            <div class="features">
                <div class="feature-card">
                    <span class="feature-icon">🎯</span>
                    <h3 class="feature-title">Diagnóstico Inteligente</h3>
                    <p class="feature-description">
                        Evaluación automática de 6 dimensiones de madurez digital 
                        usando inteligencia artificial avanzada
                    </p>
                </div>
                
                <div class="feature-card">
                    <span class="feature-icon">📊</span>
                    <h3 class="feature-title">Análisis DOFA Automático</h3>
                    <p class="feature-description">
                        Generación automática de análisis de Debilidades, Oportunidades, 
                        Fortalezas y Amenazas personalizadas
                    </p>
                </div>
                
                <div class="feature-card">
                    <span class="feature-icon">🎯</span>
                    <h3 class="feature-title">Recomendaciones Personalizadas</h3>
                    <p class="feature-description">
                        Planes de acción hiperpersonalizados basados en el perfil 
                        específico de tu unidad productiva
                    </p>
                </div>
                
                <div class="feature-card">
                    <span class="feature-icon">👥</span>
                    <h3 class="feature-title">Colaboración Humano-IA</h3>
                    <p class="feature-description">
                        Enfoque transparente que combina inteligencia artificial 
                        con expertise humano especializado
                    </p>
                </div>
                
                <div class="feature-card">
                    <span class="feature-icon">📚</span>
                    <h3 class="feature-title">Biblioteca de Recursos</h3>
                    <p class="feature-description">
                        Acceso a recursos formativos curados y organizados 
                        según las necesidades específicas identificadas
                    </p>
                </div>
                
                <div class="feature-card">
                    <span class="feature-icon">📈</span>
                    <h3 class="feature-title">Seguimiento de Progreso</h3>
                    <p class="feature-description">
                        Dashboard interactivo para monitorear el avance 
                        en la implementación de recomendaciones
                    </p>
                </div>
            </div>
            
            <div class="kpis-section">
                <h2>KPIs y Métricas Inteligentes</h2>
                <p>Seguimiento automático de indicadores clave para cada UP con análisis predictivo</p>
                <div class="kpis-grid">
                    <div class="kpi-card">
                        <span class="kpi-value">95%</span>
                        <span class="kpi-label">Precisión de Diagnósticos</span>
                    </div>
                    <div class="kpi-card">
                        <span class="kpi-value">85%</span>
                        <span class="kpi-label">Implementación de Planes</span>
                    </div>
                    <div class="kpi-card">
                        <span class="kpi-value">72h</span>
                        <span class="kpi-label">Tiempo Promedio de Análisis</span>
                    </div>
                    <div class="kpi-card">
                        <span class="kpi-value">+40%</span>
                        <span class="kpi-label">Mejora en Madurez Digital</span>
                    </div>
                    <div class="kpi-card">
                        <span class="kpi-value">15+</span>
                        <span class="kpi-label">UPs por Asesor</span>
                    </div>
                    <div class="kpi-card">
                        <span class="kpi-value">90%</span>
                        <span class="kpi-label">Satisfacción del Cliente</span>
                    </div>
                </div>
            </div>
            
            <div class="process-flow">
                <h2>Flujo Integral de Consultoría</h2>
                <div class="flow-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-title">Diagnóstico</div>
                        <div>Evaluación completa de 6 dimensiones</div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-title">Análisis</div>
                        <div>Matriz DOFA automática y análisis dimensional</div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-title">Planificación</div>
                        <div>Plan de trabajo dinámico personalizado</div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-title">Implementación</div>
                        <div>Recursos adaptativos según disponibilidad</div>
                    </div>
                    <div class="step">
                        <div class="step-number">5</div>
                        <div class="step-title">Seguimiento</div>
                        <div>Monitoreo continuo y ajustes inteligentes</div>
                    </div>
                    <div class="step">
                        <div class="step-number">6</div>
                        <div class="step-title">Optimización</div>
                        <div>Planes dinámicos que evolucionan</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>A1ia Tech</strong> - Plataforma Inteligente de Consultoría Digital v1.0.0</p>
                <p>Transformación digital avanzada con IA adaptativa para Unidades Productivas</p>
                <p>🔒 Seguro • 🚀 Escalable • 🤖 Inteligente • 📊 Analítico</p>
            </div>
        </div>
    </body>
    </html>
    """)



@app.get("/login", response_class=HTMLResponse)
async def login_page():
    """Página de login"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "login.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Login - Archivo no encontrado</h1><p>Verifica que login.html esté en frontend/pages/</p>")

@app.get("/pages/login.html", response_class=HTMLResponse)
async def login_page_direct():
    """Página de login - ruta directa"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "login.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Login - Archivo no encontrado</h1>")

@app.get("/pages/dashboard.html", response_class=HTMLResponse)
async def dashboard_page():
    """Dashboard page"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "dashboard.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Dashboard - Archivo no encontrado</h1>")

# Endpoint de salud
@app.get("/health")
async def health_check():
    """Verificación de salud del sistema"""
    return {
        "status": "healthy",
        "app": "Herramienta de Diagnóstico Digital",
        "version": "1.0.0",
        "organization": "A1ia Tech"
    }

# Endpoint de información del sistema
@app.get("/api/info")
async def system_info():
    """Información del sistema"""
    return {
        "app_name": "Herramienta de Diagnóstico Digital",
        "version": "1.0.0",
        "organization": "A1ia Tech",
        "description": "MVP para evaluación de madurez digital de Unidades Productivas",
        "features": {
            "cuestionario_preguntas": 119,
            "dimensiones_madurez": 6,
            "recursos_biblioteca": 28,
            "ai_engine": "Google Gemini 2.5",
            "database": "SQLite",
            "frontend": "HTML5/CSS3/JavaScript"
        },
        "brand_colors": {
            "primary": "#FF8C00",
            "secondary": "#99F683", 
            "dark": "#151F3B"
        }
    }

@app.get("/pages/asesor-cuestionario.html", response_class=HTMLResponse)
async def asesor_cuestionario_page():
    """Página de cuestionario para asesor"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "asesor-cuestionario.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Cuestionario Asesor - Archivo no encontrado</h1>")

@app.get("/pages/asesor.html", response_class=HTMLResponse)
async def asesor_page():
    """Dashboard del asesor"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "asesor.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Dashboard Asesor - Archivo no encontrado</h1>")

@app.get("/pages/admin.html", response_class=HTMLResponse)
async def admin_page():
    """Dashboard del administrador"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "admin.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Dashboard Admin - Archivo no encontrado</h1>")

@app.get("/pages/gestion-ups.html", response_class=HTMLResponse)
async def gestion_ups_page():
    """Página de gestión de UPs"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "gestion-ups.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Gestión de UPs - Archivo no encontrado</h1>")

@app.get("/pages/mis-ups.html", response_class=HTMLResponse)
async def mis_ups_page():
    """Página de UPs asignadas para asesor"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "mis-ups.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Mis UPs - Archivo no encontrado</h1>")

@app.get("/pages/dashboard-resultado.html", response_class=HTMLResponse)
async def dashboard_resultado_page():
    """Dashboard de resultados de diagnóstico"""
    frontend_path = Path(__file__).parent.parent / "frontend" / "pages" / "dashboard-resultado.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    return HTMLResponse("<h1>Dashboard de Resultados - Archivo no encontrado</h1>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)