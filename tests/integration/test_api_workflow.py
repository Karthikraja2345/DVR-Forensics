import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.main import app
from scripts.create_demo_case import create_demo_case


@pytest.fixture(scope="module")
def client():
    create_demo_case()
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"


def test_cases_list(client):
    res = client.get("/api/v1/cases")
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) >= 1
    demo = next((c for c in cases if c["id"] == "DEMO-CASE-001"), None)
    assert demo is not None


def test_custody_verification(client):
    res = client.post("/api/v1/cases/DEMO-CASE-001/custody/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["status"] == "CHAIN VALID"


def test_timeline(client):
    res = client.get("/api/v1/cases/DEMO-CASE-001/timeline")
    assert res.status_code == 200
    data = res.json()
    assert data["total_events"] >= 4
    assert "CAM-01" in data["cameras_represented"]


def test_lineage_graph(client):
    res = client.get("/api/v1/cases/DEMO-CASE-001/lineage")
    assert res.status_code == 200
    data = res.json()
    assert data["total_nodes"] >= 4
    assert data["total_edges"] >= 3


def test_oem_matrix(client):
    res = client.get("/api/v1/validation/matrix")
    assert res.status_code == 200
    data = res.json()
    assert data["total_oems"] == 8
    assert data["validated_count"] >= 2
