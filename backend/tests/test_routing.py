"""Tests for Routing & Queue (B110)"""
import pytest
import uuid

ADMIN_EMAIL = "admin@crm.vn"
ADMIN_PASSWORD = "Admin@123"


def get_admin_token(client):
    resp = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["data"]["access_token"]


def get_or_create_service(client, token):
    resp = client.get("/api/v1/services", headers={"Authorization": f"Bearer {token}"})
    items = resp.json()["data"]["items"]
    if items:
        return items[0]["id"]
    uid = uuid.uuid4().hex[:6]
    resp = client.post(
        "/api/v1/services",
        json={"name": f"Test Service {uid}", "code": f"svc_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    return resp.json()["data"]["id"]


def create_tele_group(client, token):
    uid = uuid.uuid4().hex[:6]
    resp = client.post(
        "/api/v1/tele-groups",
        json={"name": f"Group {uid}", "code": f"grp_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["data"]["id"]


def create_lead(client, token, service_id):
    uid = uuid.uuid4().hex[:6]
    resp = client.post(
        "/api/v1/leads",
        json={"full_name": f"Test Lead {uid}", "phone": f"09{uid[:8]}", "service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["data"]["id"]


def add_member_to_group(client, token, group_id, user_id):
    resp = client.post(
        f"/api/v1/tele-groups/{group_id}/members",
        json={"user_id": user_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code in (200, 201), resp.text


def get_current_user_id(client, token):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    return resp.json()["data"]["id"]


# ── Test 1: Create routing rule ──────────────────────────────────────────────

def test_create_routing_rule(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)
    group_id = create_tele_group(seeded_client, token)

    resp = seeded_client.post(
        "/api/v1/routing-rules",
        json={
            "name": "Test Rule",
            "priority": 10,
            "service_id": service_id,
            "target_group_id": group_id,
            "assignment_strategy": "direct_group",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Test Rule"
    assert data["data"]["priority"] == 10
    assert data["data"]["service_id"] == service_id
    assert data["data"]["target_group_id"] == group_id
    assert data["data"]["is_active"] is True


# ── Test 2: Route lead into group (direct_group) ─────────────────────────────

def test_route_lead_direct_group(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)
    group_id = create_tele_group(seeded_client, token)
    user_id = get_current_user_id(seeded_client, token)

    # Add admin as member so group has active members
    add_member_to_group(seeded_client, token, group_id, user_id)

    # Create routing rule matching this service
    seeded_client.post(
        "/api/v1/routing-rules",
        json={
            "name": f"Direct Rule {uuid.uuid4().hex[:4]}",
            "priority": 100,
            "service_id": service_id,
            "target_group_id": group_id,
            "assignment_strategy": "direct_group",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Create lead with matching service
    lead_id = create_lead(seeded_client, token, service_id)

    # Route the lead
    resp = seeded_client.post(
        f"/api/v1/leads/{lead_id}/route",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["status"] == "assigned"
    assert data["data"]["group_id"] == group_id


# ── Test 3: Route lead → queue if no rule matches ────────────────────────────

def test_route_lead_no_rule_queued(seeded_client):
    token = get_admin_token(seeded_client)

    # Create a service that has NO routing rule
    uid = uuid.uuid4().hex[:6]
    svc_resp = seeded_client.post(
        "/api/v1/services",
        json={"name": f"No Rule Svc {uid}", "code": f"norule_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert svc_resp.status_code == 201
    no_rule_service_id = svc_resp.json()["data"]["id"]

    lead_id = create_lead(seeded_client, token, no_rule_service_id)

    resp = seeded_client.post(
        f"/api/v1/leads/{lead_id}/route",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["status"] == "queued"
    assert data["data"]["reason"] == "no_rule"
    assert "queue_id" in data["data"]


# ── Test 4: Release queue ────────────────────────────────────────────────────

def test_release_queue(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)
    group_id = create_tele_group(seeded_client, token)
    user_id = get_current_user_id(seeded_client, token)

    # Create lead and push to queue (no matching rule for this specific lead)
    uid = uuid.uuid4().hex[:6]
    svc_resp = seeded_client.post(
        "/api/v1/services",
        json={"name": f"Queue Svc {uid}", "code": f"qsvc_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    queue_service_id = svc_resp.json()["data"]["id"]
    lead_id = create_lead(seeded_client, token, queue_service_id)

    # Route → should queue (no rule for this service)
    route_resp = seeded_client.post(
        f"/api/v1/leads/{lead_id}/route",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert route_resp.status_code == 200
    queue_id = route_resp.json()["data"]["queue_id"]

    # Release the queue entry
    release_resp = seeded_client.post(
        f"/api/v1/lead-queues/{queue_id}/release",
        json={"group_id": group_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert release_resp.status_code == 200, release_resp.text
    data = release_resp.json()
    assert data["success"] is True
    assert data["data"]["status"] == "released"
    assert data["data"]["released_by"] == user_id
