"""
API de Usuarios
Herramienta de Diagnóstico Digital para Unidades Productivas
A1ia Tech - MVP
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Usuario, AsignacionAsesor
from .auth import get_current_user, hash_password

# Añadir al inicio del archivo usuarios.py
from typing import List, Optional
from pydantic import BaseModel, EmailStr

router = APIRouter()

@router.get("/asesor/mis-ups")
async def obtener_mis_ups(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener UPs asignadas al asesor actual"""
    try:
        # Verificar que el usuario sea asesor
        if current_user.rol != "ASESOR":
            raise HTTPException(status_code=403, detail="Solo los asesores pueden acceder a esta función")
        
        # Obtener asignaciones activas del asesor
        asignaciones = db.query(AsignacionAsesor).filter(
            AsignacionAsesor.asesor_id == current_user.id,
            AsignacionAsesor.activa == True
        ).all()
        
        ups = []
        for asignacion in asignaciones:
            up = asignacion.up
            ups.append({
                "id": up.id,
                "nombre": up.nombre,
                "email": up.email,
                "fecha_asignacion": asignacion.fecha_asignacion.isoformat()
            })
        
        return {"ups": ups}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo UPs del asesor: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/perfil")
async def obtener_perfil_usuario(
    current_user: Usuario = Depends(get_current_user)
):
    """Obtener información del perfil del usuario actual"""
    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "rol": current_user.rol
    }

###

from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Schemas de request/response
class UPCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    asesor_id: Optional[int] = None  # Si no se especifica, se asigna automáticamente

class UPUpdate(BaseModel):
    nombre: Optional[str] = None
    asesor_id: Optional[int] = None
    activo: Optional[bool] = None

class UPResponse(BaseModel):
    id: int
    nombre: str
    email: str
    activo: bool
    fecha_creacion: str
    asesor_asignado: Optional[dict] = None
    fecha_asignacion: Optional[str] = None

# CRUD Endpoints para UPs
@router.get("/ups", response_model=List[UPResponse])
async def listar_ups(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar todas las UPs (solo admins) o UPs asignadas (asesores)"""
    try:
        if current_user.rol == "ADMIN":
            # Admin ve todas las UPs
            ups = db.query(Usuario).filter(Usuario.rol == "UP").all()
        elif current_user.rol == "ASESOR":
            # Asesor ve solo sus UPs asignadas
            asignaciones = db.query(AsignacionAsesor).filter(
                AsignacionAsesor.asesor_id == current_user.id,
                AsignacionAsesor.activa == True
            ).all()
            ups = [asignacion.up for asignacion in asignaciones]
        else:
            raise HTTPException(status_code=403, detail="Sin permisos para ver UPs")
        
        result = []
        for up in ups:
            # Buscar asignación activa
            asignacion = db.query(AsignacionAsesor).filter(
                AsignacionAsesor.up_id == up.id,
                AsignacionAsesor.activa == True
            ).first()
            
            asesor_info = None
            fecha_asignacion = None
            if asignacion:
                asesor_info = {
                    "id": asignacion.asesor.id,
                    "nombre": asignacion.asesor.nombre,
                    "email": asignacion.asesor.email
                }
                fecha_asignacion = asignacion.fecha_asignacion.isoformat()
            
            result.append(UPResponse(
                id=up.id,
                nombre=up.nombre,
                email=up.email,
                activo=up.activo,
                fecha_creacion=up.fecha_creacion.isoformat(),
                asesor_asignado=asesor_info,
                fecha_asignacion=fecha_asignacion
            ))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando UPs: {str(e)}")

@router.post("/ups", response_model=UPResponse)
async def crear_up(
    up_data: UPCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nueva UP y asignar asesor"""
    try:
        # Solo admin puede crear UPs
        if current_user.rol != "ADMIN":
            raise HTTPException(status_code=403, detail="Solo administradores pueden crear UPs")
        
        # Verificar que email no exista
        existing_user = db.query(Usuario).filter(Usuario.email == up_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email ya existe")
        
        # Determinar asesor a asignar
        asesor_id = up_data.asesor_id
        if not asesor_id:
            # Asignación automática - buscar asesor con menos UPs
            asesores = db.query(Usuario).filter(Usuario.rol == "ASESOR", Usuario.activo == True).all()
            if not asesores:
                raise HTTPException(status_code=400, detail="No hay asesores disponibles")
            
            # Contar UPs por asesor y asignar al que tenga menos
            asesor_counts = {}
            for asesor in asesores:
                count = db.query(AsignacionAsesor).filter(
                    AsignacionAsesor.asesor_id == asesor.id,
                    AsignacionAsesor.activa == True
                ).count()
                asesor_counts[asesor.id] = count
            
            asesor_id = min(asesor_counts, key=asesor_counts.get)
        else:
            # Verificar que asesor existe y está activo
            asesor = db.query(Usuario).filter(
                Usuario.id == asesor_id,
                Usuario.rol == "ASESOR", 
                Usuario.activo == True
            ).first()
            if not asesor:
                raise HTTPException(status_code=400, detail="Asesor no válido")
        
        # Crear UP
        nueva_up = Usuario(
            email=up_data.email,
            password_hash=hash_password(up_data.password),
            nombre=up_data.nombre,
            rol="UP",
            activo=True
        )
        db.add(nueva_up)
        db.flush()  # Para obtener ID
        
        # Crear asignación
        asignacion = AsignacionAsesor(
            asesor_id=asesor_id,
            up_id=nueva_up.id,
            activa=True,
            notas=f"Asignación automática al crear UP"
        )
        db.add(asignacion)
        db.commit()
        
        # Obtener asesor para respuesta
        asesor = db.query(Usuario).filter(Usuario.id == asesor_id).first()
        
        return UPResponse(
            id=nueva_up.id,
            nombre=nueva_up.nombre,
            email=nueva_up.email,
            activo=nueva_up.activo,
            fecha_creacion=nueva_up.fecha_creacion.isoformat(),
            asesor_asignado={
                "id": asesor.id,
                "nombre": asesor.nombre,
                "email": asesor.email
            },
            fecha_asignacion=asignacion.fecha_asignacion.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando UP: {str(e)}")

@router.put("/ups/{up_id}", response_model=UPResponse)
async def actualizar_up(
    up_id: int,
    up_data: UPUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar UP (cambiar asesor, estado, etc.)"""
    try:
        # Solo admin puede actualizar UPs
        if current_user.rol != "ADMIN":
            raise HTTPException(status_code=403, detail="Solo administradores pueden actualizar UPs")
        
        # Buscar UP
        up = db.query(Usuario).filter(Usuario.id == up_id, Usuario.rol == "UP").first()
        if not up:
            raise HTTPException(status_code=404, detail="UP no encontrada")
        
        # Actualizar campos básicos
        if up_data.nombre:
            up.nombre = up_data.nombre
        if up_data.activo is not None:
            up.activo = up_data.activo
        
        # Cambiar asesor si se especifica
        if up_data.asesor_id:
            # Verificar que asesor existe
            asesor = db.query(Usuario).filter(
                Usuario.id == up_data.asesor_id,
                Usuario.rol == "ASESOR",
                Usuario.activo == True
            ).first()
            if not asesor:
                raise HTTPException(status_code=400, detail="Asesor no válido")
            
            # Desactivar asignación actual
            asignacion_actual = db.query(AsignacionAsesor).filter(
                AsignacionAsesor.up_id == up_id,
                AsignacionAsesor.activa == True
            ).first()
            if asignacion_actual:
                asignacion_actual.activa = False
            
            # Crear nueva asignación
            nueva_asignacion = AsignacionAsesor(
                asesor_id=up_data.asesor_id,
                up_id=up_id,
                activa=True,
                notas="Reasignación manual"
            )
            db.add(nueva_asignacion)
        
        db.commit()
        
        # Obtener datos actualizados
        asignacion = db.query(AsignacionAsesor).filter(
            AsignacionAsesor.up_id == up_id,
            AsignacionAsesor.activa == True
        ).first()
        
        asesor_info = None
        fecha_asignacion = None
        if asignacion:
            asesor_info = {
                "id": asignacion.asesor.id,
                "nombre": asignacion.asesor.nombre,
                "email": asignacion.asesor.email
            }
            fecha_asignacion = asignacion.fecha_asignacion.isoformat()
        
        return UPResponse(
            id=up.id,
            nombre=up.nombre,
            email=up.email,
            activo=up.activo,
            fecha_creacion=up.fecha_creacion.isoformat(),
            asesor_asignado=asesor_info,
            fecha_asignacion=fecha_asignacion
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error actualizando UP: {str(e)}")

@router.delete("/ups/{up_id}")
async def eliminar_up(
    up_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar UP (desactivar)"""
    try:
        # Solo admin puede eliminar UPs
        if current_user.rol != "ADMIN":
            raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar UPs")
        
        # Buscar UP
        up = db.query(Usuario).filter(Usuario.id == up_id, Usuario.rol == "UP").first()
        if not up:
            raise HTTPException(status_code=404, detail="UP no encontrada")
        
        # Desactivar UP y sus asignaciones
        up.activo = False
        
        # Desactivar asignaciones
        asignaciones = db.query(AsignacionAsesor).filter(AsignacionAsesor.up_id == up_id).all()
        for asignacion in asignaciones:
            asignacion.activa = False
        
        db.commit()
        
        return {"message": "UP eliminada correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error eliminando UP: {str(e)}")

@router.get("/asesores")
async def listar_asesores(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar asesores disponibles para asignación"""
    try:
        # Solo admin puede ver lista de asesores
        if current_user.rol != "ADMIN":
            raise HTTPException(status_code=403, detail="Solo administradores pueden ver asesores")
        
        asesores = db.query(Usuario).filter(
            Usuario.rol == "ASESOR",
            Usuario.activo == True
        ).all()
        
        result = []
        for asesor in asesores:
            # Contar UPs asignadas
            ups_count = db.query(AsignacionAsesor).filter(
                AsignacionAsesor.asesor_id == asesor.id,
                AsignacionAsesor.activa == True
            ).count()
            
            result.append({
                "id": asesor.id,
                "nombre": asesor.nombre,
                "email": asesor.email,
                "ups_asignadas": ups_count
            })
        
        return {"asesores": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando asesores: {str(e)}")