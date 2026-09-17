import pytest
import sys
from pathlib import Path

# Add backend and root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "backend"))
sys.path.insert(0, str(ROOT_DIR))

from app.models.base import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
