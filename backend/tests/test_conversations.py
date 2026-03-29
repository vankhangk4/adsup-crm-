"""Tests for conversation endpoints: create, message, assign, update status"""
import pytest
import uuid

ADMIN_EMAIL = "admin@crm.vn"
ADMIN_PASSWORD = "Admin@123"


def get_admin_token(client):
    resp = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["data"]["access_token"]


def create_channel_and_page(client, token):
    """Helper: create a channel and page with unique codes, return page_id."""
    uid = uuid.uuid4().hex[:8]
    ch_resp = client.post(
        "/api/v1/channels",
        json={"name": f"Test Channel {uid}", "code": f"ch_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ch_resp.status_code == 201, ch_resp.text
    channel_id = ch_resp.json()["data"]["id"]

    page_resp = client.post(
        "/api/v1/pages",
        json={"channel_id": channel_id, "page_name": f"Test Page {uid}", "page_code": f"pg_{uid}"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert page_resp.status_code == 201, page_resp.text
    return page_resp.json()["data"]["id"]


def test_create_conversation(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    resp = seeded_client.post(
        "/api/v1/conversations",
        json={
            "page_id": page_id,
            "external_customer_id": "cust_001",
            "customer_name": "Nguyen Van A",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["page_id"] == page_id
    assert data["data"]["customer_name"] == "Nguyen Van A"
    assert data["data"]["conversation_status"] == "open"


def test_create_conversation_invalid_page(seeded_client):
    token = get_admin_token(seeded_client)
    resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": 99999, "customer_name": "Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_add_message_updates_last_message(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    # Create conversation
    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Test Customer"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    # Add message
    msg_resp = seeded_client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        json={"message_text": "Hello from page staff", "sender_type": "page_staff"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert msg_resp.status_code == 201
    assert msg_resp.json()["data"]["message_text"] == "Hello from page staff"

    # Verify last_message updated on conversation
    conv_detail = seeded_client.get(
        f"/api/v1/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert conv_detail.json()["data"]["last_message"] == "Hello from page staff"
    assert conv_detail.json()["data"]["last_message_time"] is not None


def test_list_messages_sorted_by_sent_at(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Sort Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    for i in range(3):
        seeded_client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"message_text": f"Message {i}", "sender_type": "page_staff"},
            headers={"Authorization": f"Bearer {token}"},
        )

    msgs_resp = seeded_client.get(
        f"/api/v1/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert msgs_resp.status_code == 200
    items = msgs_resp.json()["data"]["items"]
    assert len(items) == 3
    # Verify sorted ascending
    sent_times = [m["sent_at"] for m in items]
    assert sent_times == sorted(sent_times)


def test_assign_conversation(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Assign Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    # Get admin user id
    me_resp = seeded_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_id = me_resp.json()["data"]["id"]

    assign_resp = seeded_client.post(
        f"/api/v1/conversations/{conv_id}/assign",
        json={"user_id": user_id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["success"] is True

    # Verify assigned_page_user_id updated
    conv_detail = seeded_client.get(
        f"/api/v1/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert conv_detail.json()["data"]["assigned_page_user_id"] == user_id


def test_update_conversation_status(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Status Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    # Update to resolved
    status_resp = seeded_client.patch(
        f"/api/v1/conversations/{conv_id}/status",
        json={"status": "resolved"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["conversation_status"] == "resolved"


def test_update_conversation_status_invalid(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Invalid Status Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    resp = seeded_client.patch(
        f"/api/v1/conversations/{conv_id}/status",
        json={"status": "invalid_status"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_mark_hot(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Hot Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    resp = seeded_client.post(
        f"/api/v1/conversations/{conv_id}/mark-hot",
        json={"is_hot": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["is_hot"] is True


def test_mark_phone_collected(seeded_client):
    token = get_admin_token(seeded_client)
    page_id = create_channel_and_page(seeded_client, token)

    conv_resp = seeded_client.post(
        "/api/v1/conversations",
        json={"page_id": page_id, "customer_name": "Phone Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = conv_resp.json()["data"]["id"]

    resp = seeded_client.post(
        f"/api/v1/conversations/{conv_id}/mark-phone-collected",
        json={"phone": "0901234567"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["phone_collected"] is True
    assert resp.json()["data"]["collected_phone"] == "0901234567"
