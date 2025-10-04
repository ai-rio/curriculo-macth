"""Pytest configuration and fixtures for Resume-Matcher backend tests."""

import asyncio
import os
import uuid
from collections.abc import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.core.config import settings
from app.core.database import SupabaseSession
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_user_id() -> str:
    """Return a test user ID."""
    return "test-user-12345"


@pytest.fixture
def test_resume_id() -> str:
    """Return a test resume ID."""
    return str(uuid.uuid4())


@pytest.fixture
def test_job_id() -> str:
    """Return a test job ID."""
    return str(uuid.uuid4())


@pytest.fixture
def test_optimization_id() -> str:
    """Return a test optimization ID."""
    return str(uuid.uuid4())


@pytest.fixture
def test_payment_intent_id() -> str:
    """Return a test payment intent ID."""
    return "pi_test_1234567890"


@pytest.fixture
def mock_stripe_session():
    """Mock Stripe checkout session data."""
    return {
        "id": "cs_test_1234567890",
        "url": "https://checkout.stripe.com/pay/cs_test_1234567890",
        "payment_intent": "pi_test_1234567890",
        "payment_status": "paid",
        "status": "complete",
        "amount_total": 5000,
        "currency": "brl",
        "customer_details": {"email": "test@example.com"},
        "metadata": {
            "optimization_id": "test-opt-123",
            "user_id": "test-user-123",
            "service": "resume_optimization",
        },
        "expires_at": 1234567890,
    }


@pytest.fixture
def mock_optimization_result():
    """Mock AI optimization result."""
    return {
        "optimized_text": "JOÃO SILVA\n\n📧 joao.silva@email.com | 📱 (11) 98765-4321 | 💼 linkedin.com/in/joaosilva\n\n🎯 OBJETIVO\nDesenvolvedor Python Sênior com 5 anos de experiência, buscando oportunidade para aplicar conhecimentos em desenvolvimento de aplicações escaláveis e contribuir com o crescimento da empresa.\n\n🚀 EXPERIÊNCIA PROFISSIONAL\n\nDesenvolvedor Python Sênior | TechCorp | São Paulo, SP\n2020 - Presente\n- Desenvolvimento de APIs RESTful utilizando FastAPI e Django REST Framework\n- Implementação de microserviços com Docker e Kubernetes\n- Otimização de consultas SQL e modelos de dados PostgreSQL\n- Mentoria para equipe júnior em boas práticas de desenvolvimento\n\nDesenvolvedor Python Pleno | StartupXYZ | São Paulo, SP\n2018 - 2020\n- Criação de aplicações web utilizando Django e Flask\n- Integração com APIs de terceiros e processamento de dados\n- Desenvolvimento de testes unitários e de integração\n\n🎓 EDUCAÇÃO\n\nBacharelado em Ciência da Computação | USP | São Paulo, SP\n2014 - 2018\n\n💻 HABILIDADES TÉCNICAS\n\nLinguagens: Python, JavaScript, SQL, TypeScript\nFrameworks: FastAPI, Django, Flask, React, Vue.js\nBancos de Dados: PostgreSQL, MySQL, MongoDB\nFerramentas: Docker, Kubernetes, Git, AWS, Azure\nMetodologias: Agile, Scrum, TDD, CI/CD\n\n🌟 IDIOMAS\n\nPortuguês: Nativo\nInglês: Avançado\nEspanhol: Intermediário",
        "match_percentage": 85,
        "suggestions": [
            "Adicione métricas e resultados quantificáveis em suas experiências",
            "Inclua projetos pessoais ou contribuições open source relevantes",
            "Destaque experiências com nuvem (AWS/GCP/Azure)",
            "Mencione certificações técnicas relevantes",
        ],
        "keywords": [
            "python",
            "fastapi",
            "django",
            "postgresql",
            "docker",
            "kubernetes",
            "api",
            "microserviços",
            "aws",
            "azure",
            "devops",
            "sql",
            "nosql",
            "agile",
            "scrum",
        ],
    }


@pytest.fixture
def mock_resume_data():
    """Mock resume data from database."""
    return {
        "resume_id": str(uuid.uuid4()),
        "content": "João Silva\nDesenvolvedor Python\n5 anos de experiência\nSkills: Python, Django, PostgreSQL",
        "filename": "joao_silva.pdf",
        "created_at": "2024-01-01T00:00:00Z",
    }


@pytest.fixture
def mock_job_data():
    """Mock job data from database."""
    return {
        "job_id": str(uuid.uuid4()),
        "content": "Vaga: Desenvolvedor Python Sênior\nRequisitos: 5+ anos experiência Python, FastAPI, PostgreSQL, Docker\nSalário: R$ 10.000 - R$ 15.000\nLocal: São Paulo/SP (Remoto)",
        "created_at": "2024-01-01T00:00:00Z",
    }


@pytest.fixture
def mock_supabase_client():
    """Create a mock Supabase client."""
    mock_client = MagicMock()

    # Mock table operations
    mock_table = MagicMock()
    mock_client.table.return_value = mock_table

    # Mock common operations
    mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": 1}])
    mock_table.delete.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    # Mock storage operations
    mock_storage = MagicMock()
    mock_client.storage.from_.return_value = mock_storage
    mock_storage.upload.return_value = MagicMock(data={"path": "test/path"})
    mock_storage.download.return_value = b"mock_file_content"

    return mock_client


@pytest.fixture
def mock_stripe_service():
    """Create a mock Stripe service."""
    mock_service = MagicMock()

    # Mock checkout session creation
    mock_service.create_checkout_session.return_value = {
        "session_id": "cs_test_1234567890",
        "checkout_url": "https://checkout.stripe.com/pay/cs_test_1234567890",
        "expires_at": 1234567890,
    }

    # Mock payment verification
    mock_service.verify_payment.return_value = {
        "payment_status": "paid",
        "status": "complete",
        "amount_total": 5000,
        "currency": "brl",
        "payment_intent": "pi_test_1234567890",
    }

    # Mock webhook signature verification
    mock_service.verify_webhook_signature.return_value = MagicMock(
        type="checkout.session.completed",
        id="evt_test_1234567890",
        data={"object": {"id": "cs_test_1234567890"}},
    )

    # Mock payment intent retrieval
    mock_service.get_payment_intent.return_value = {
        "id": "pi_test_1234567890",
        "status": "succeeded",
        "amount": 5000,
        "currency": "brl",
    }

    return mock_service


@pytest.fixture
def mock_ai_optimization_service():
    """Create a mock AI optimization service."""
    mock_service = MagicMock()

    # Mock optimization result
    mock_result = MagicMock()
    mock_result.to_dict.return_value = {
        "optimized_text": "Optimized resume content...",
        "match_percentage": 85,
        "suggestions": ["Suggestion 1", "Suggestion 2"],
        "keywords": ["keyword1", "keyword2"],
    }

    mock_service.optimize_resume.return_value = mock_result

    return mock_service


@pytest.fixture
def mock_docx_service():
    """Create a mock DOCX generation service."""
    mock_service = MagicMock()
    mock_service.generate_docx.return_value = b"mock_docx_content"
    return mock_service


@pytest_asyncio.fixture
async def mock_db_session():
    """Create a mock database session."""
    mock_session = MagicMock(spec=SupabaseSession)
    return mock_session


@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI app."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


# Override settings for testing
@pytest.fixture(autouse=True)
def test_settings():
    """Override settings for testing."""
    original_values = {}
    test_values = {
        "OPENROUTER_API_KEY": "test-key",
        "stripe_secret_key": "sk_test_1234567890",
        "stripe_webhook_secret": "whsec_test_1234567890",
        "supabase_url": "https://test.supabase.co",
        "supabase_service_role_key": "test-service-key",
        "ALLOW_MODEL_OVERRIDE": True,
        "STRICT_MODEL_VALIDATION": False,
    }

    # Store original values and set test values
    for key, value in test_values.items():
        if hasattr(settings, key):
            original_values[key] = getattr(settings, key)
        setattr(settings, key, value)

    yield

    # Restore original values
    for key, value in original_values.items():
        setattr(settings, key, value)


@pytest.fixture
def sample_resume_pdf():
    """Get path to sample PDF file for testing."""
    # In a real scenario, you would have a sample PDF file
    # For now, return a mock path
    return os.path.join(os.path.dirname(__file__), "samples", "resume.pdf")


@pytest.fixture
def sample_job_description():
    """Sample job description for testing."""
    return """
    Vaga: Desenvolvedor Python Sênior

    Empresa: TechCorp Solutions

    Descrição:
    Estamos procurando um Desenvolvedor Python Sênior experiente para juntar-se à nossa equipe de desenvolvimento. Você será responsável por desenvolver e manter aplicações web escaláveis usando tecnologias modernas.

    Requisitos:
    - 5+ anos de experiência em desenvolvimento Python
    - Experiência com FastAPI, Django ou Flask
    - Conhecimento em PostgreSQL e bancos de dados NoSQL
    - Experiência com Docker e Kubernetes
    - Conhecimento em AWS ou Azure
    - Inglês avançado

    Diferenciais:
    - Experiência com microserviços
    - Contribuições em projetos open source
    - Certificações AWS/Azure

    Salário: R$ 10.000 - R$ 15.000
    Local: São Paulo/SP (Remoto/Híbrido)

    Benefícios:
    - Plano de saúde e odontológico
    - Vale transporte e alimentação
    - Auxílio home office
    - Orçamento para educação
    - Seguro de vida
    """
