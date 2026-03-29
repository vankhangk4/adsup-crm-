def test_health_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_success_true(client):
    response = client.get("/health")
    data = response.json()
    assert data["success"] is True


def test_health_response_format(client):
    response = client.get("/health")
    data = response.json()
    assert "success" in data
    assert "message" in data
    assert "data" in data
