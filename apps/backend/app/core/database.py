"""
Supabase database configuration for Resume-Matcher backend.

This module provides a compatibility layer that mimics SQLAlchemy's session interface
while using Supabase as the underlying database. It maintains the same API surface
so existing services can be migrated with minimal changes.

Key changes from SQLAlchemy:
- No more session management - Supabase handles connections automatically
- Direct table operations instead of ORM models
- Dictionary-based results instead of model objects
- Automatic retry logic for network operations
"""

from __future__ import annotations

import logging
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from .supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)

# Type aliases for compatibility
DatabaseResult = dict[str, Any]
DatabaseRow = dict[str, Any]


class SupabaseSession:
    """
    Compatibility layer that mimics SQLAlchemy AsyncSession interface
    while using Supabase client underneath.

    This allows existing services to work with minimal changes.
    """

    def __init__(self):
        self.client = get_supabase_admin_client()
        self._committed = False
        self._rolled_back = False

    def add(self, obj: Any) -> None:
        """
        Compatibility method - in Supabase we don't 'add' objects,
        we directly insert data. This method does nothing.
        """
        pass  # No-op for Supabase compatibility

    async def flush(self) -> None:
        """
        Compatibility method - Supabase auto-commits,
        so this is a no-op.
        """
        pass  # No-op for Supabase compatibility

    async def commit(self) -> None:
        """Compatibility method - Supabase handles commits automatically."""
        self._committed = True

    async def rollback(self) -> None:
        """Compatibility method - Supabase doesn't support rollback."""
        self._rolled_back = True
        logger.warning("Rollback called on Supabase session - operation not supported")

    async def close(self) -> None:
        """Compatibility method - no connection to close in Supabase."""
        pass


class DatabaseQuery:
    """
    Helper class to build and execute database queries using Supabase.
    Provides a SQLAlchemy-like interface for common operations.
    """

    def __init__(self, session: SupabaseSession):
        self.session = session
        self.client = session.client
        self._table_name: str | None = None
        self._filters: list[dict[str, Any]] = []
        self._select_columns: str = "*"
        self._limit: int | None = None
        self._order: str | None = None

    def table(self, table_name: str) -> DatabaseQuery:
        """Set the table for the query."""
        self._table_name = table_name
        return self

    def where(self, column: str, operator: str, value: Any) -> DatabaseQuery:
        """Add a WHERE condition to the query."""
        self._filters.append({"column": column, "operator": operator, "value": value})
        return self

    def select(self, columns: str = "*") -> DatabaseQuery:
        """Set columns to select."""
        self._select_columns = columns
        return self

    def limit(self, limit: int) -> DatabaseQuery:
        """Set limit on number of results."""
        self._limit = limit
        return self

    def order_by(self, column: str, ascending: bool = True) -> DatabaseQuery:
        """Set ordering of results."""
        direction = "asc" if ascending else "desc"
        self._order = f"{column}.{direction}"
        return self

    async def execute(self) -> DatabaseResult:
        """Execute the query and return results."""
        if not self._table_name:
            raise ValueError("Table name is required")

        query = self.client.table(self._table_name).select(self._select_columns)

        # Apply filters
        for filter_condition in self._filters:
            if filter_condition["operator"] == "==":
                query = query.eq(filter_condition["column"], filter_condition["value"])
            elif filter_condition["operator"] == "!=":
                query = query.neq(filter_condition["column"], filter_condition["value"])
            elif filter_condition["operator"] == "like":
                query = query.like(filter_condition["column"], filter_condition["value"])
            elif filter_condition["operator"] == "ilike":
                query = query.ilike(filter_condition["column"], filter_condition["value"])
            elif filter_condition["operator"] == "in":
                query = query.in_(filter_condition["column"], filter_condition["value"])
            # Note: IS operations not commonly used in our services, skipping for now

        # Apply ordering
        if self._order:
            query = query.order(self._order)

        # Apply limit
        if self._limit:
            query = query.limit(self._limit)

        try:
            result = query.execute()
            return DatabaseResult(result.data, query)
        except Exception as e:
            logger.error(f"Database query failed: {str(e)}")
            raise

    async def scalar(self) -> dict[str, Any] | None:
        """Execute query and return first result or None."""
        result = await self.limit(1).execute()
        data = result.data
        return data[0] if data else None

    async def scalars(self) -> list[dict[str, Any]]:
        """Execute query and return all results."""
        result = await self.execute()
        return result.data


class DatabaseResult:
    """
    Container for query results that mimics SQLAlchemy result interface.
    """

    def __init__(self, data: list[dict[str, Any]], query: Any):
        self.data = data
        self.query = query

    def scalars(self) -> ScalarResult:
        """Return a scalar result interface."""
        return ScalarResult(self.data)

    def first(self) -> dict[str, Any] | None:
        """Return first result or None."""
        return self.data[0] if self.data else None


class ScalarResult:
    """
    Scalar result interface that mimics SQLAlchemy scalars().
    """

    def __init__(self, data: list[dict[str, Any]]):
        self.data = data

    def first(self) -> dict[str, Any] | None:
        """Return first result or None."""
        return self.data[0] if self.data else None


class DatabaseOperations:
    """
    High-level database operations using Supabase.
    Provides commonly used CRUD operations with error handling.
    """

    def __init__(self, session: SupabaseSession):
        self.session = session
        self.client = session.client

    async def insert(self, table_name: str, data: dict[str, Any]) -> dict[str, Any]:
        """Insert a single record into the specified table."""
        try:
            result = self.client.table(table_name).insert(data).execute()
            if not result.data:
                raise ValueError(f"Failed to insert into {table_name}: No data returned")
            return result.data[0]
        except Exception as e:
            logger.error(f"Insert operation failed on {table_name}: {str(e)}")
            raise

    async def insert_many(self, table_name: str, data_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Insert multiple records into the specified table."""
        try:
            result = self.client.table(table_name).insert(data_list).execute()
            if not result.data:
                raise ValueError(f"Failed to insert into {table_name}: No data returned")
            return result.data
        except Exception as e:
            logger.error(f"Batch insert operation failed on {table_name}: {str(e)}")
            raise

    async def update(self, table_name: str, filters: dict[str, Any], data: dict[str, Any]) -> list[dict[str, Any]]:
        """Update records matching the filters."""
        try:
            query = self.client.table(table_name).update(data)

            # Apply filters
            for column, value in filters.items():
                query = query.eq(column, value)

            result = query.execute()
            return result.data
        except Exception as e:
            logger.error(f"Update operation failed on {table_name}: {str(e)}")
            raise

    async def delete(self, table_name: str, filters: dict[str, Any]) -> list[dict[str, Any]]:
        """Delete records matching the filters."""
        try:
            query = self.client.table(table_name).delete()

            # Apply filters
            for column, value in filters.items():
                query = query.eq(column, value)

            result = query.execute()
            return result.data
        except Exception as e:
            logger.error(f"Delete operation failed on {table_name}: {str(e)}")
            raise

    async def select_by_id(self, table_name: str, id_column: str, id_value: str | uuid.UUID) -> dict[str, Any] | None:
        """Select a single record by ID."""
        try:
            result = self.client.table(table_name).select("*").eq(id_column, id_value).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Select by ID failed on {table_name}: {str(e)}")
            raise


# Global session factory compatibility
class SessionFactory:
    """Factory that creates Supabase sessions for SQLAlchemy compatibility."""

    @staticmethod
    def create_session() -> SupabaseSession:
        """Create a new Supabase session."""
        return SupabaseSession()


# Export SQLAlchemy-compatible interfaces
SessionLocal = SessionFactory
AsyncSessionLocal = SessionFactory


def get_sync_db_session():
    """
    Compatibility function that returns a synchronous database session.
    Note: Supabase is async-first, so this returns an async session for compatibility.
    """
    session = SupabaseSession()
    try:
        yield session
        # No explicit commit needed for Supabase
    except Exception:
        # No explicit rollback needed for Supabase
        logger.warning("Exception occurred in database session")
        raise
    finally:
        # No explicit close needed for Supabase
        pass


async def get_db_session() -> AsyncGenerator[SupabaseSession, None]:
    """
    Get a database session for async operations.
    Returns a Supabase session that mimics SQLAlchemy's AsyncSession interface.
    """
    session = SupabaseSession()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise


# Database initialization compatibility
async def init_models(Base: Any = None) -> None:
    """
    Compatibility function for database initialization.
    Supabase handles schema creation through migrations, so this is a no-op.
    """
    logger.info("Supabase database initialization complete - schema managed through migrations")


# Legacy SQLAlchemy compatibility exports
AsyncSession = SupabaseSession
Session = SupabaseSession
