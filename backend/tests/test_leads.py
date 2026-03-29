"""Tests for Customer & Lead endpoints (B080)"""
import pytest
import uuid

ADMIN_EMAIL = "admin@crm.vn"
ADMIN_PASSWORD = "Admin@123"


def get_admin_token(client):
    resp = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["data"]["access_token"]


def get_or_create_service(client, token):
    """Get first available service or create one."""
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
    assert resp.status_code == 201, resp.text
    return resp.json()["data"]["id"]


def create_channel_and_page(client, token):
    uid = uuid.uuid4().hex[:8]
    ch = client.post(
        "/api/v1/channels",
        json={"name": f"Ch {uid}", "code": f"ch_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ch.status_code == 201
    channel_id = ch.json()["data"]["id"]
    pg = client.post(
        "/api/v1/pages",
        json={"channel_id": channel_id, "page_name": f"Page {uid}", "page_code": f"pg_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pg.status_code == 201
    return pg.json()["data"]["id"]


# ── Test 1: Create customer ──────────────────────────────────────────────────

def test_create_customer(seeded_client):
    token = get_admin_token(seeded_client)
    uid = uuid.uuid4().hex[:6]
    resp = seeded_client.post(
        "/api/v1/customers",
        json={"full_name": f"Nguyen Van A {uid}", "phone": "0901234567"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["full_name"].startswith("Nguyen Van A")
    # Phone should be normalized
    assert data["data"]["normalized_phone"] == "+84901234567"


# ── Test 2: Create lead manual ───────────────────────────────────────────────

def test_create_lead_manual(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)

    resp = seeded_client.post(
        "/api/v1/leads",
        json={
            "full_name": "Tran Thi B",
            "phone": "0912345678",
            "service_id": service_id,
            "note_page": "Khách hỏi về dịch vụ",
            "interest_level": "warm",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["service_id"] == service_id
    assert data["data"]["lead_status_code"] == "new"
    assert data["data"]["interest_level"] == "warm"


# ── Test 3: Create lead from conversation ────────────────────────────────────

def test_create_lead_from_conversation(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)
    page_id = create_channel_and_page(seeded_client, token)

    # Create conversation with phone collected
    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Le Van C"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert conv_resp.status_code == 201
    conv_id = conv_resp.json()["data"]["id"]

    # Mark phone collected
    seeded_client.post(
        f"/api/v1/conversations/{conv_id}/mark-phone-collected",
        json={"phone": "0923456789"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Create lead from conversation
    lead_resp = seeded_client.post(
        f"/api/v1/leads/from-conversation/{conv_id}",
        json={"service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert lead_resp.status_code == 201
    lead_data = lead_resp.json()["data"]
    assert lead_data["conversation_id"] == conv_id
    assert lead_data["page_id"] == page_id

    # Verify conversation status = converted
    conv_detail = seeded_client.get(
        f"/api/v1/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert conv_detail.json()["data"]["conversation_status"] == "converted"
    assert conv_detail.json()["data"]["waiting_for_tele"] is True


# ── Test 4: Duplicate flag ───────────────────────────────────────────────────

def test_duplicate_flag(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)
    uid = uuid.uuid4().hex[:6]
    phone = f"09{uid[:8]}"  # unique phone per test run

    # Create first lead
    resp1 = seeded_client.post(
        "/api/v1/leads",
        json={"full_name": f"Dup Test {uid}", "phone": phone, "service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp1.status_code == 201
    assert resp1.json()["data"]["is_duplicate"] is False

    # Create second lead with same phone + service → should be duplicate
    resp2 = seeded_client.post(
        "/api/v1/leads",
        json={"full_name": f"Dup Test {uid}", "phone": phone, "service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp2.status_code == 201
    assert resp2.json()["data"]["is_duplicate"] is True
    assert "duplicate" in resp2.json()["message"].lower()


# ── Test 5: Update lead status ───────────────────────────────────────────────

def test_update_lead_status(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)

    # Create lead
    lead_resp = seeded_client.post(
        "/api/v1/leads",
        json={"full_name": "Status Test", "phone": "0934567890", "service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert lead_resp.status_code == 201
    lead_id = lead_resp.json()["data"]["id"]

    # Update status to contacted
    status_resp = seeded_client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status_code": "contacted"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["lead_status_code"] == "contacted"


def test_update_lead_status_invalid(seeded_client):
    token = get_admin_token(seeded_client)
    service_id = get_or_create_service(seeded_client, token)

    lead_resp = seeded_client.post(
        "/api/v1/leads",
        json={"full_name": "Invalid Status Test", "phone": "0945678901", "service_id": service_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    lead_id = lead_resp.json()["data"]["id"]

    resp = seeded_client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status_code": "invalid_xyz"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422
