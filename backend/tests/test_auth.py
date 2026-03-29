"""Tests for auth endpoints: login, refresh, logout, /me"""
import pytest


ADMIN_EMAIL = "admin@crm.vn"
ADMIN_PASSWORD = "Admin@123"


def test_login_success(seeded_client):
    resp = seeded_client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == ADMIN_EMAIL


def test_login_wrong_password(seeded_client):
    resp = seeded_client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpassword"})
    assert resp.status_code == 401
    assert resp.json()["success"] is False


def test_login_nonexistent_user(seeded_client):
    resp = seeded_client.post("/api/v1/auth/login", json={"email": "nobody@crm.vn", "password": "pass"})
    assert resp.status_code == 401


def test_get_me_authenticated(seeded_client):
    # Login first
    login_resp = seeded_client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    token = login_resp.json()["data"]["access_token"]

    resp = seeded_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == ADMIN_EMAIL


def test_get_me_unauthenticated(seeded_client):
    resp = seeded_client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_refresh_token(seeded_client):
    login_resp = seeded_client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    refresh_token = login_resp.json()["data"]["refresh_token"]

    resp = seeded_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


def test_refresh_invalid_token(seeded_client):
    resp = seeded_client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid-token-xyz"})
    assert resp.status_code == 401


def test_logout(seeded_client):
    login_resp = seeded_client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    refresh_token = login_resp.json()["data"]["refresh_token"]

    resp = seeded_client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    # Using revoked token should fail
    resp2 = seeded_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp2.status_code == 401
