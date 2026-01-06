"""
API de Recursos básica
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Recurso
from .auth import get_current_user

router = APIRouter()

@router.get("/catalogo")
async def obtener_catalogo_recursos(db: Session = Depends(get_db)):
    """Obtener catálogo básico de recursos"""
    
    recursos = db.query(Recurso).filter(Recurso.activo == True).limit(10).all()
    
    recursos_lista = []
    for recurso in recursos:
        recursos_lista.append({
            "id": recurso.id,
            "titulo": recurso.titulo,
            "descripcion": recurso.descripcion,
            "tipo": recurso.tipo_recurso,
            "duracion": recurso.duracion_estimada,
            "nivel": recurso.nivel_dificultad
        })
    
    return {
        "total_recursos": len(recursos_lista),
        "recursos": recursos_lista
    }

@router.get("/test")
async def test_recursos():
    """Test de la API de recursos"""
    return {"message": "API de recursos funcionando", "status": "OK"}