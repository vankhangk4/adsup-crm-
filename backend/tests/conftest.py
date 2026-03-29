import os
import sys
import pytest

# Set required env vars before importing app
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_crm.db")


@pytest.fixture(scope="session")
def client():
    import importlib
    main_module = importlib.import_module("app.main")
    fastapi_app = main_module.app

    from app.core.database import Base, engine
    import app.models  # ensure all models are registered
    Base.metadata.create_all(bind=engine)

    from fastapi.testclient import TestClient
    with TestClient(fastapi_app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def db_session():
    from app.core.database import SessionLocal, Base, engine
    import app.models
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def seeded_client(client, db_session):
    """Client with base seed data and admin user."""
    from app.seeds.seed_base import seed as seed_base
    from app.seeds.seed_admin import seed as seed_admin
    seed_base(db_session)
    seed_admin(db_session)
    return client
