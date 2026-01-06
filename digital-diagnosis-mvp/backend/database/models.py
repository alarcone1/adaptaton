"""
Modelos de base de datos SQLAlchemy
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Usuario(Base):
    """Modelo de usuario del sistema"""
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)  # UP, ASESOR, ADMIN
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultimo_acceso = Column(DateTime)
    
    # Relaciones
    diagnosticos = relationship("Diagnostico", back_populates="usuario", cascade="all, delete-orphan")
    asignaciones_asesor = relationship("AsignacionAsesor", foreign_keys="AsignacionAsesor.asesor_id", back_populates="asesor")
    asignaciones_up = relationship("AsignacionAsesor", foreign_keys="AsignacionAsesor.up_id", back_populates="up")

class Dimension(Base):
    """Modelo de dimensiones de madurez digital"""
    __tablename__ = "dimensiones"
    
    id = Column(Integer, primary_key=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    orden = Column(Integer, nullable=False)
    activa = Column(Boolean, default=True)
    
    # Relaciones
    subdimensiones = relationship("Subdimension", back_populates="dimension", cascade="all, delete-orphan")
    preguntas = relationship("Pregunta", back_populates="dimension")

class Subdimension(Base):
    """Modelo de subdimensiones"""
    __tablename__ = "subdimensiones"
    
    id = Column(Float, primary_key=True)  # 1.1, 1.2, etc.
    dimension_id = Column(Integer, ForeignKey("dimensiones.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    orden = Column(Integer, nullable=False)
    activa = Column(Boolean, default=True)
    
    # Relaciones
    dimension = relationship("Dimension", back_populates="subdimensiones")
    preguntas = relationship("Pregunta", back_populates="subdimension")

class Pregunta(Base):
    """Modelo de preguntas del cuestionario"""
    __tablename__ = "preguntas"
    
    id = Column(String(20), primary_key=True)  # D1.1.1, D1.1.2, etc.
    dimension_id = Column(Integer, ForeignKey("dimensiones.id"), nullable=False)
    subdimension_id = Column(Float, ForeignKey("subdimensiones.id"), nullable=False)
    texto_pregunta = Column(Text, nullable=False)
    tipo_pregunta = Column(String(50), nullable=False)  # SELECCION_UNICA, BINARIA, etc.
    opciones_respuesta = Column(JSON, nullable=False)  # JSON con opciones y valores
    obligatoria = Column(Boolean, default=True)
    orden = Column(Integer, nullable=False)
    activa = Column(Boolean, default=True)
    
    # Relaciones
    dimension = relationship("Dimension", back_populates="preguntas")
    subdimension = relationship("Subdimension", back_populates="preguntas")
    respuestas = relationship("Respuesta", back_populates="pregunta")

class Diagnostico(Base):
    """Modelo de diagnósticos realizados"""
    __tablename__ = "diagnosticos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_finalizacion = Column(DateTime)
    estado = Column(String(50), default="EN_PROGRESO")  # EN_PROGRESO, COMPLETADO, ABANDONADO
    
    # Puntajes calculados
    puntaje_global = Column(Float)
    puntajes_dimensiones = Column(JSON)  # {1: 75.5, 2: 60.2, ...}
    puntajes_subdimensiones = Column(JSON)  # {1.1: 80, 1.2: 70, ...}
    
    # Análisis generado por IA
    analisis_dofa = Column(JSON)  # {fortalezas: [...], debilidades: [...]}
    plan_accion_propuesto = Column(JSON)  # Plan generado por IA
    plan_accion_final = Column(JSON)  # Plan ajustado por asesor
    estado_plan = Column(String(50), default="BORRADOR")  # BORRADOR, REVISION, ACTIVO
    
    # Metadatos
    datos_empresa = Column(JSON)  # Información adicional de la UP
    notas_asesor = Column(Text)
    fecha_activacion_plan = Column(DateTime)
    progreso_plan = Column(Float, default=0.0)  # Porcentaje de progreso 0-100
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="diagnosticos")
    respuestas = relationship("Respuesta", back_populates="diagnostico", cascade="all, delete-orphan")

class Respuesta(Base):
    """Modelo de respuestas al cuestionario"""
    __tablename__ = "respuestas"
    
    id = Column(Integer, primary_key=True, index=True)
    diagnostico_id = Column(String(36), ForeignKey("diagnosticos.id"), nullable=False)
    pregunta_id = Column(String(20), ForeignKey("preguntas.id"), nullable=False)
    respuesta_seleccionada = Column(JSON, nullable=False)  # Respuesta(s) seleccionada(s)
    valor_calculado = Column(Float, nullable=False)  # Valor numérico de la respuesta
    fecha_respuesta = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    diagnostico = relationship("Diagnostico", back_populates="respuestas")
    pregunta = relationship("Pregunta", back_populates="respuestas")

class Recurso(Base):
    """Modelo de recursos formativos"""
    __tablename__ = "recursos"
    
    id = Column(String(20), primary_key=True)  # REC001, REC002, etc.
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo_recurso = Column(String(50), nullable=False)  # VIDEO, PDF, TALLER_VIVO, etc.
    nivel_dificultad = Column(String(20), nullable=False)  # BASICO, INTERMEDIO, AVANZADO
    duracion_estimada = Column(String(50), nullable=False)  # "30 minutos", "2 horas"
    dimension_principal = Column(Integer, ForeignKey("dimensiones.id"), nullable=False)
    subdimensiones_mapeo = Column(JSON, nullable=False)  # [1.1, 1.2, ...]
    url_contenido = Column(String(500))  # URL o "INTERNO"
    objetivos_aprendizaje = Column(Text)
    prerequisitos = Column(String(255))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    dimension = relationship("Dimension")

class AsignacionAsesor(Base):
    """Modelo de asignación de UPs a asesores"""
    __tablename__ = "asignaciones_asesor"
    
    id = Column(Integer, primary_key=True, index=True)
    asesor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    up_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)
    activa = Column(Boolean, default=True)
    notas = Column(Text)
    
    # Relaciones
    asesor = relationship("Usuario", foreign_keys=[asesor_id], back_populates="asignaciones_asesor")
    up = relationship("Usuario", foreign_keys=[up_id], back_populates="asignaciones_up")

class SeguimientoRecurso(Base):
    """Modelo de seguimiento de recursos por UP"""
    __tablename__ = "seguimiento_recursos"
    
    id = Column(Integer, primary_key=True, index=True)
    diagnostico_id = Column(String(36), ForeignKey("diagnosticos.id"), nullable=False)
    recurso_id = Column(String(20), ForeignKey("recursos.id"), nullable=False)
    estado = Column(String(50), default="ASIGNADO")  # ASIGNADO, EN_PROGRESO, COMPLETADO
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)
    fecha_inicio = Column(DateTime)
    fecha_completado = Column(DateTime)
    progreso = Column(Float, default=0.0)  # 0-100
    comentarios_up = Column(Text)
    calificacion = Column(Integer)  # 1-5 estrellas
    
    # Relaciones
    diagnostico = relationship("Diagnostico")
    recurso = relationship("Recurso")