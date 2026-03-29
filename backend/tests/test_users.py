"""Tests for user endpoints: create, list, update status"""
import pytest

ADMIN_EMAIL = "admin@crm.vn"
ADMIN_PASSWORD = "Admin@123"


def get_admin_token(client):
    resp = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    return resp.json()["data"]["access_token"]


def test_create_user(seeded_client):
    token = get_admin_token(seeded_client)
    resp = seeded_client.post(
        "/api/v1/users",
        json={"full_name": "Test User", "email": "testuser@crm.vn", "password": "Test@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testuser@crm.vn"
    assert data["data"]["status"] == "active"


def test_create_user_duplicate_email(seeded_client):
    token = get_admin_token(seeded_client)
    # Create first
    seeded_client.post(
        "/api/v1/users",
        json={"full_name": "Dup User", "email": "dup@crm.vn", "password": "Test@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # Try duplicate
    resp = seeded_client.post(
        "/api/v1/users",
        json={"full_name": "Dup User 2", "email": "dup@crm.vn", "password": "Test@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_list_users(seeded_client):
    token = get_admin_token(seeded_client)
    resp = seeded_client.get("/api/v1/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "items" in data["data"]
    assert "pagination" in data["data"]


def test_update_user_status(seeded_client):
    token = get_admin_token(seeded_client)
    # Create a user to update
    create_resp = seeded_client.post(
        "/api/v1/users",
        json={"full_name": "Status User", "email": "statususer@crm.vn", "password": "Test@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_resp.json()["data"]["id"]

    # Deactivate
    resp = seeded_client.patch(
        f"/api/v1/users/{user_id}/status",
        json={"status": "inactive"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "inactive"
    assert resp.json()["data"]["is_active"] is False


def test_inactive_user_cannot_login(seeded_client):
    token = get_admin_token(seeded_client)
    # Create user
    create_resp = seeded_client.post(
        "/api/v1/users",
        json={"full_name": "Locked User", "email": "locked@crm.vn", "password": "Test@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = create_resp.json()["data"]["id"]

    # Deactivate
    seeded_client.patch(
        f"/api/v1/users/{user_id}/status",
        json={"status": "inactive"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Try login
    resp = seeded_client.post("/api/v1/auth/login", json={"email": "locked@crm.vn", "password": "Test@123"})
    assert resp.status_code == 401
