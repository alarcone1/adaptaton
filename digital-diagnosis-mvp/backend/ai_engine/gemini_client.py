"""
Cliente para Google Gemini API - Versión Optimizada
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

import google.generativeai as genai
import json
from typing import Dict, List, Any, Optional
from ..config import settings

class GeminiClient:
    """Cliente para interactuar con Google Gemini API"""
    
    def __init__(self):
        """Inicializar cliente Gemini"""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY no configurada en .env")
        
        try:
            # Configurar API
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # --- SELECCIÓN DE MODELO ---
            # Usamos el alias 'gemini-1.5-flash' que es más robusto que la versión -001
            self.model_name = "gemini-2.5-flash" 
            
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                )
            )
            
        except Exception as e:
            print(f"⚠️ Error inicializando Gemini con {getattr(self, 'model_name', 'modelo desconocido')}: {e}")
            
            # Autodiagnóstico: Intentar listar modelos disponibles si falla
            try:
                print("🔍 Buscando modelos disponibles para tu API Key...")
                available_models = []
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        available_models.append(m.name)
                print(f"✅ Modelos disponibles encontrados: {available_models}")
            except Exception as list_error:
                print(f"❌ No se pudo listar los modelos (Posible error de API Key): {list_error}")
                
            raise e
        
    def generar_analisis_dofa(self, respuestas_cuestionario: Dict, puntajes: Dict) -> Dict:
        """Generar análisis DOFA basado en respuestas del cuestionario"""
        
        prompt = f"""
Eres un experto consultor en transformación digital para pequeñas empresas familiares de 1-5 empleados.

Analiza este diagnóstico de madurez digital:

PUNTAJES POR DIMENSIÓN (0-100):
- Estrategia y Liderazgo Digital: {puntajes.get('dimensiones', {}).get(1, 0)}
- Procesos y Operaciones: {puntajes.get('dimensiones', {}).get(2, 0)}
- Marketing Digital: {puntajes.get('dimensiones', {}).get(3, 0)}
- Tecnología e Infraestructura: {puntajes.get('dimensiones', {}).get(4, 0)}
- Cultura y Talento Humano: {puntajes.get('dimensiones', {}).get(5, 0)}
- Ciberseguridad: {puntajes.get('dimensiones', {}).get(6, 0)}

PUNTAJE GLOBAL: {puntajes.get('global', 0)}/100

INSTRUCCIONES:
1. Genera un análisis DOFA específico para esta empresa familiar
2. Usa lenguaje sencillo, sin tecnicismos
3. Enfócate en herramientas gratuitas y móviles
4. Sé específico y práctico

Responde ÚNICAMENTE en formato JSON:
{{
    "fortalezas": ["fortaleza 1", "fortaleza 2"],
    "debilidades": ["debilidad 1", "debilidad 2"],
    "oportunidades": ["oportunidad 1", "oportunidad 2"],
    "amenazas": ["amenaza 1", "amenaza 2"],
    "resumen_ejecutivo": "Resumen en 1-2 líneas",
    "nivel_madurez_general": "BASICO"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            dofa_text = response.text.strip()
            
            # Limpiar posible formato markdown
            if dofa_text.startswith("```json"):
                dofa_text = dofa_text[7:]
            if dofa_text.endswith("```"):
                dofa_text = dofa_text[:-3]
            
            dofa_analysis = json.loads(dofa_text)
            
            return {
                "fortalezas": dofa_analysis.get("fortalezas", []),
                "debilidades": dofa_analysis.get("debilidades", []),
                "oportunidades": dofa_analysis.get("oportunidades", []),
                "amenazas": dofa_analysis.get("amenazas", []),
                "resumen_ejecutivo": dofa_analysis.get("resumen_ejecutivo", ""),
                "nivel_madurez_general": dofa_analysis.get("nivel_madurez_general", "BASICO")
            }
            
        except Exception as e:
            print(f"Error generando análisis DOFA: {e}")
            return self._dofa_fallback(puntajes.get('global', 0))
    
    def test_connection(self) -> bool:
        """Probar conexión con Gemini API"""
        try:
            test_prompt = "Responde con una sola palabra: 'CONECTADO'"
            response = self.model.generate_content(test_prompt)
            return "CONECTADO" in response.text.upper() or len(response.text) > 0
        except Exception as e:
            print(f"Error en test de conexión: {e}")
            return False
    
    def _dofa_fallback(self, puntaje_global: float) -> Dict:
        """Análisis DOFA de respaldo basado en puntaje"""
        if puntaje_global < 30:
            nivel = "INICIAL"
        elif puntaje_global < 60:
            nivel = "BASICO"
        else:
            nivel = "INTERMEDIO"
            
        return {
            "fortalezas": [
                "Motivación para digitalizarse",
                "Conocimiento profundo del negocio familiar",
                "Flexibilidad para adoptar cambios"
            ],
            "debilidades": [
                "Limitaciones en herramientas digitales actuales",
                "Falta de presencia online estructurada",
                "Procesos principalmente manuales"
            ],
            "oportunidades": [
                "Implementar herramientas gratuitas como WhatsApp Business",
                "Crear presencia en Google My Business",
                "Digitalizar procesos básicos con apps móviles"
            ],
            "amenazas": [
                "Competencia más digitalizada",
                "Cambios en comportamiento del consumidor",
                "Dependencia excesiva de métodos tradicionales"
            ],
            "resumen_ejecutivo": f"Empresa con nivel {nivel.lower()} de madurez digital ({puntaje_global:.1f}/100) que requiere implementación gradual de herramientas básicas.",
            "nivel_madurez_general": nivel
        }
    
    def generar_analisis_dimension(self, dimension: str, puntaje: int, up_nombre: str, 
                                 up_sector: str, puntajes_generales: Dict = None) -> str:
        """Generar análisis específico para una dimensión usando Gemini"""
        
        # Contextos específicos por dimensión
        contextos_dimensiones = {
            "Estrategia Digital": "visión estratégica, liderazgo digital y toma de decisiones basada en datos",
            "Tecnología": "infraestructura tecnológica, hardware, software y conectividad",
            "Datos y Analytics": "gestión de datos, análisis de información y business intelligence",
            "Procesos": "digitalización de procesos internos y automatización operativa", 
            "Cultura Digital": "mentalidad digital, adopción del cambio y colaboración",
            "Talento Digital": "competencias digitales del equipo y desarrollo profesional"
        }
        
        contexto = contextos_dimensiones.get(dimension, "transformación digital integral")
        
        # Crear prompt especializado
        prompt = f"""
Eres un asesor experto en transformación digital especializado en pequeñas empresas familiares.

INFORMACIÓN DE LA EMPRESA:
• Nombre: {up_nombre}
• Sector: {up_sector}
• Dimensión analizada: {dimension}
• Puntaje obtenido: {puntaje}/100

CONTEXTO DE LA DIMENSIÓN:
Esta dimensión evalúa: {contexto}

PUNTAJES COMPARATIVOS:
{self._formatear_puntajes_comparativos(puntajes_generales) if puntajes_generales else "No disponible"}

INSTRUCCIONES:
Genera un análisis profesional de máximo 280 palabras estructurado así:

**SITUACIÓN ACTUAL** (70-90 palabras):
Interpreta el puntaje {puntaje}/100 específicamente para {up_nombre} en el sector {up_sector}. 
Explica qué significa este nivel de madurez en términos prácticos.

**ÁREAS DE MEJORA** (90-110 palabras):
Identifica 2-3 brechas concretas basadas en el puntaje. Sé específico sobre qué aspectos 
de {dimension} necesitan atención para {up_nombre}.

**RECOMENDACIONES PRIORITARIAS** (90-110 palabras):
Proporciona 3-4 acciones específicas y realizables para {up_nombre}. Incluye herramientas 
concretas, pasos prácticos y consideraciones del sector {up_sector}.

REQUISITOS:
- Personaliza completamente para {up_nombre} y sector {up_sector}
- Usa lenguaje directo, sin tecnicismos excesivos
- Enfócate en herramientas accesibles para pequeñas empresas
- Sé específico y accionable, no genérico

Genera SOLO el análisis, sin encabezados adicionales.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Error generando análisis dimensional: {e}")
            return self._generar_analisis_fallback(dimension, puntaje, up_nombre)
    
    def _formatear_puntajes_comparativos(self, puntajes_generales: Dict) -> str:
        """Formatear puntajes para el prompt"""
        if not puntajes_generales:
            return "Puntajes comparativos no disponibles"
        
        dimensiones_mapeadas = {
            1: "Estrategia Digital",
            2: "Procesos",
            3: "Marketing Digital", 
            4: "Tecnología",
            5: "Cultura Digital",
            6: "Ciberseguridad"
        }
        
        lineas = []
        for dim_id, puntaje in puntajes_generales.items():
            nombre = dimensiones_mapeadas.get(dim_id, f"Dimensión {dim_id}")
            lineas.append(f"• {nombre}: {puntaje}/100")
        
        return "\n".join(lineas)
    
    def _generar_analisis_fallback(self, dimension: str, puntaje: int, up_nombre: str) -> str:
        """Análisis básico en caso de error de IA"""
        if puntaje >= 80:
            nivel = "excelente"
            descripcion = "muestra un dominio sólido"
            accion = "mantener las buenas prácticas y buscar optimizaciones avanzadas"
        elif puntaje >= 60:
            nivel = "bueno"
            descripcion = "tiene una base sólida con oportunidades claras"
            accion = "enfocarse en mejoras específicas identificadas"
        elif puntaje >= 40:
            nivel = "regular"
            descripcion = "muestra desarrollo parcial que requiere atención"
            accion = "desarrollar capacidades fundamentales con un plan estructurado"
        else:
            nivel = "básico"
            descripcion = "está en etapa inicial y necesita desarrollo prioritario"
            accion = "implementar mejoras estructurales con soporte especializado"
        
        return f"""**SITUACIÓN ACTUAL**
{up_nombre} presenta un nivel {nivel} en {dimension} con {puntaje}/100 puntos. La empresa {descripcion} en esta dimensión crítica para la transformación digital. Este resultado refleja el estado actual de desarrollo en las prácticas relacionadas con {dimension}.

**ÁREAS DE MEJORA**
Se identifican oportunidades específicas de crecimiento en {dimension} que pueden generar mayor impacto en el desempeño general del negocio. Las brechas detectadas requieren atención enfocada para avanzar efectivamente en la madurez digital.

**RECOMENDACIONES PRIORITARIAS**
Es recomendable {accion}. Se sugiere implementar mejoras graduales que sean sostenibles para {up_nombre}, considerando los recursos disponibles y las características específicas del sector para maximizar el retorno de la inversión."""