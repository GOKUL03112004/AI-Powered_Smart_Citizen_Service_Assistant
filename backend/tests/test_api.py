import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_chat_unauthorized():
    # Chat requires auth
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/chat", json={"query": "hello"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_eligibility_unauthorized():
    # Eligibility requires auth
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/eligibility", json={
            "age": 30,
            "occupation": "Farmer",
            "annual_income": 50000
        })
    assert response.status_code == 401
