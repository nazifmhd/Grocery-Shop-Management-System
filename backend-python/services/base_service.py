"""
Base service class with common functionality
"""

from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

class BaseService:
    """Base service class with common database operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def commit(self) -> bool:
        """Commit database transaction"""
        try:
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Database commit error: {e}")
            self.db.rollback()
            return False
    
    def rollback(self) -> None:
        """Rollback database transaction"""
        self.db.rollback()
    
    def refresh(self, obj: Any) -> None:
        """Refresh object from database"""
        self.db.refresh(obj)
    
    def flush(self) -> None:
        """Flush pending changes to database"""
        self.db.flush()
    
    def close(self) -> None:
        """Close database session"""
        self.db.close()
