"""
AI optimization service for Resume-Matcher.

Uses OpenRouter API to optimize resumes for specific job descriptions.
Provides Brazilian Portuguese output with professional formatting.
"""

import json
import logging
from typing import Any

import httpx
from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIOptimizationError(Exception):
    """Raised when AI optimization fails."""

    pass


class OptimizationResult:
    """Result of resume optimization."""

    def __init__(
        self,
        optimized_text: str,
        match_percentage: int,
        suggestions: list[str],
        keywords: list[str],
    ):
        """
        Initialize optimization result.

        Args:
            optimized_text: Optimized resume text
            match_percentage: Match percentage (0-100)
            suggestions: List of improvement suggestions
            keywords: ATS keywords identified
        """
        self.optimized_text = optimized_text
        self.match_percentage = match_percentage
        self.suggestions = suggestions
        self.keywords = keywords

    def to_dict(self) -> dict[str, Any]:
        """Convert result to dictionary."""
        return {
            "optimized_text": self.optimized_text,
            "match_percentage": self.match_percentage,
            "suggestions": self.suggestions,
            "keywords": self.keywords,
        }


class AIOptimizationService:
    """Service for AI-powered resume optimization using OpenRouter."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        max_tokens: int | None = None,
    ):
        """
        Initialize AI optimization service.

        Args:
            api_key: OpenRouter API key (defaults to settings.OPENROUTER_API_KEY)
            model: Model to use (defaults to settings.OPENROUTER_MODEL)
            max_tokens: Max tokens for response (defaults to settings.OPENROUTER_MAX_TOKENS)
        """
        self.api_key = api_key or getattr(settings, "OPENROUTER_API_KEY", None)
        self.model = model or getattr(settings, "OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")
        self.max_tokens = max_tokens or getattr(settings, "OPENROUTER_MAX_TOKENS", 4000)

        if not self.api_key:
            raise AIOptimizationError("OPENROUTER_API_KEY não configurada")

        # Initialize OpenAI client with OpenRouter base URL
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
        )

        logger.info(f"Initialized AIOptimizationService with model: {self.model}")

    async def optimize_resume(
        self,
        resume_text: str,
        job_description: str,
        user_id: str | None = None,
    ) -> OptimizationResult:
        """
        Optimize resume for a specific job description using AI.

        Args:
            resume_text: Original resume text
            job_description: Target job description
            user_id: Optional user ID for tracking

        Returns:
            OptimizationResult with optimized text and metadata

        Raises:
            AIOptimizationError: If optimization fails
        """
        try:
            logger.info(f"Starting resume optimization (user: {user_id or 'anonymous'})")

            # Build optimization prompt
            prompt = self._build_optimization_prompt(resume_text, job_description)

            # Call OpenRouter API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em otimização de currículos para o mercado brasileiro.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"},
            )

            # Parse response
            result = self._parse_ai_response(response)

            logger.info(
                f"Resume optimization completed - Match: {result.match_percentage}%, "
                f"Suggestions: {len(result.suggestions)}, Keywords: {len(result.keywords)}"
            )

            return result

        except httpx.HTTPError as e:
            logger.exception(f"HTTP error during AI optimization: {str(e)}")
            raise AIOptimizationError(f"Erro de conexão com o serviço de IA: {str(e)}") from e
        except json.JSONDecodeError as e:
            logger.exception(f"Error parsing AI response: {str(e)}")
            raise AIOptimizationError(f"Erro ao processar resposta da IA: {str(e)}") from e
        except Exception as e:
            logger.exception(f"Unexpected error during AI optimization: {str(e)}")
            raise AIOptimizationError(f"Erro inesperado na otimização: {str(e)}") from e

    def _build_optimization_prompt(self, resume_text: str, job_description: str) -> str:
        """
        Build optimization prompt for AI model.

        Args:
            resume_text: Original resume text
            job_description: Target job description

        Returns:
            Formatted prompt string
        """
        prompt = f"""
Você é um especialista em otimização de currículos para o mercado de trabalho brasileiro.
Sua missão é otimizar o currículo do candidato para aumentar suas chances de passar por
sistemas ATS (Applicant Tracking Systems) e impressionar recrutadores humanos.

**CURRÍCULO ORIGINAL:**
{resume_text}

**DESCRIÇÃO DA VAGA:**
{job_description}

**INSTRUÇÕES:**

1. **Análise de Compatibilidade**: Analise a compatibilidade entre o currículo e a vaga
2. **Otimização Estratégica**: Reescreva o currículo para maximizar a compatibilidade:
   - Alinhe as experiências do candidato com os requisitos da vaga
   - Use palavras-chave da descrição da vaga naturalmente no texto
   - Destaque conquistas e resultados quantificáveis
   - Mantenha um tom profissional e direto
   - Preserve a veracidade das informações (não invente experiências)
3. **Formato Profissional**: Organize o currículo de forma clara e ATS-friendly
4. **Idioma**: Mantenha todo o texto em Português Brasileiro
5. **Tom**: Use tratamento formal "você" (não use "tu")

**RESPONDA EM FORMATO JSON:**

{{
  "optimized_text": "Texto completo do currículo otimizado em formato profissional",
  "match_percentage": 85,
  "suggestions": [
    "Sugestão 1 de melhoria específica",
    "Sugestão 2 de melhoria específica",
    "Sugestão 3 de melhoria específica"
  ],
  "keywords": [
    "palavra-chave-1",
    "palavra-chave-2",
    "palavra-chave-3"
  ]
}}

**IMPORTANTE:**
- O "optimized_text" deve ser o currículo completo e pronto para uso
- O "match_percentage" deve ser um número inteiro de 0 a 100
- As "suggestions" devem ser acionáveis e específicas
- As "keywords" devem ser termos relevantes da descrição da vaga
"""
        return prompt.strip()

    def _parse_ai_response(self, response: Any) -> OptimizationResult:
        """
        Parse AI API response into OptimizationResult.

        Args:
            response: OpenAI API response

        Returns:
            OptimizationResult object

        Raises:
            AIOptimizationError: If parsing fails
        """
        try:
            # Extract content from response
            content = response.choices[0].message.content

            if not content:
                raise AIOptimizationError("Resposta vazia da IA")

            # Parse JSON
            data = json.loads(content)

            # Validate required fields
            required_fields = ["optimized_text", "match_percentage", "suggestions", "keywords"]
            for field in required_fields:
                if field not in data:
                    raise AIOptimizationError(f"Campo obrigatório ausente na resposta: {field}")

            # Create result object
            result = OptimizationResult(
                optimized_text=str(data["optimized_text"]),
                match_percentage=int(data["match_percentage"]),
                suggestions=list(data["suggestions"]),
                keywords=list(data["keywords"]),
            )

            # Validate match percentage range
            if not 0 <= result.match_percentage <= 100:
                logger.warning(f"Invalid match percentage: {result.match_percentage}. Clamping to 0-100 range.")
                result.match_percentage = max(0, min(100, result.match_percentage))

            return result

        except (KeyError, ValueError, TypeError) as e:
            logger.exception(f"Error parsing AI response: {str(e)}")
            raise AIOptimizationError(f"Erro ao processar resposta da IA: {str(e)}") from e

    async def estimate_token_usage(self, resume_text: str, job_description: str) -> dict[str, int]:
        """
        Estimate token usage for optimization (useful for cost calculation).

        Args:
            resume_text: Original resume text
            job_description: Target job description

        Returns:
            Dict with estimated input_tokens and output_tokens
        """
        # Rough estimation: ~4 characters per token
        prompt = self._build_optimization_prompt(resume_text, job_description)
        input_tokens = len(prompt) // 4
        output_tokens = self.max_tokens

        return {
            "estimated_input_tokens": input_tokens,
            "estimated_output_tokens": output_tokens,
            "estimated_total_tokens": input_tokens + output_tokens,
        }


# Singleton instance
_ai_optimization_service: AIOptimizationService | None = None


def get_ai_optimization_service() -> AIOptimizationService:
    """Get or create the singleton AIOptimizationService instance."""
    global _ai_optimization_service

    if _ai_optimization_service is None:
        _ai_optimization_service = AIOptimizationService()

    return _ai_optimization_service
