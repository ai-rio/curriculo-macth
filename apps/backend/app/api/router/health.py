from fastapi import APIRouter, Depends, status

from app.core import get_db_session
from app.core.database import SupabaseSession

health_check = APIRouter()


@health_check.get("/ping", tags=["Health check"], status_code=status.HTTP_200_OK)
async def ping(db: SupabaseSession = Depends(get_db_session)):
    """
    health check endpoint
    """
    try:
        # Test Supabase connection with a simple query
        result = db.client.table("profiles").select("id").limit(1).execute()
        db_status = "reachable" if result.data is not None else "not reachable"
    except Exception:
        import logging

        logging.error("Database health check failed", exc_info=True)
        db_status = "unreachable"
    return {"message": "pong", "database": db_status}
