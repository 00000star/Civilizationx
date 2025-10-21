"""LLM service for agent cognition and narrative generation."""
import logging
import asyncio
from typing import Optional, List, Dict
from enum import Enum

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

from config import settings

logger = logging.getLogger(__name__)


class LLMProvider(Enum):
    """Available LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class LLMService:
    """Service for LLM-based agent cognition."""

    def __init__(self):
        self.provider = self._determine_provider()
        self.openai_client = None
        self.anthropic_client = None

        # Initialize clients based on available API keys
        if self.provider == LLMProvider.OPENAI and OPENAI_AVAILABLE:
            if settings.openai_api_key:
                openai.api_key = settings.openai_api_key
                self.openai_client = openai
                logger.info("✓ OpenAI client initialized")
            else:
                logger.warning("OpenAI API key not found")

        elif self.provider == LLMProvider.ANTHROPIC and ANTHROPIC_AVAILABLE:
            if settings.anthropic_api_key:
                self.anthropic_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
                logger.info("✓ Anthropic client initialized")
            else:
                logger.warning("Anthropic API key not found")

        self.use_llm = self.openai_client is not None or self.anthropic_client is not None

        if not self.use_llm:
            logger.warning("⚠️ No LLM API keys configured - using fallback templates")

    def _determine_provider(self) -> LLMProvider:
        """Determine which LLM provider to use."""
        # Prefer Anthropic if available
        if settings.anthropic_api_key and ANTHROPIC_AVAILABLE:
            return LLMProvider.ANTHROPIC
        elif settings.openai_api_key and OPENAI_AVAILABLE:
            return LLMProvider.OPENAI
        else:
            return LLMProvider.OPENAI  # Default fallback

    async def generate_conversation_message(
        self,
        agent_name: str,
        agent_context: Dict,
        other_agent_name: str,
        conversation_topic: str,
        conversation_history: List[Dict],
        max_tokens: int = 150
    ) -> str:
        """
        Generate a conversation message for an agent.

        Args:
            agent_name: Name of the speaking agent
            agent_context: Agent's context (memories, personality, current state)
            other_agent_name: Name of the other agent
            conversation_topic: Topic of conversation
            conversation_history: Previous messages in this conversation
            max_tokens: Maximum tokens to generate

        Returns:
            Generated message string
        """
        if not self.use_llm:
            return self._fallback_conversation_message(agent_name, conversation_topic)

        # Build context-aware prompt
        prompt = self._build_conversation_prompt(
            agent_name,
            agent_context,
            other_agent_name,
            conversation_topic,
            conversation_history
        )

        try:
            if self.provider == LLMProvider.ANTHROPIC:
                return await self._generate_anthropic(prompt, max_tokens)
            else:
                return await self._generate_openai(prompt, max_tokens)
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return self._fallback_conversation_message(agent_name, conversation_topic)

    async def generate_reflection_insights(
        self,
        agent_name: str,
        agent_context: Dict,
        significant_memories: List[Dict],
        max_insights: int = 3
    ) -> List[str]:
        """
        Generate reflection insights from memories.

        Args:
            agent_name: Agent's name
            agent_context: Agent context
            significant_memories: List of important memories
            max_insights: Maximum number of insights to generate

        Returns:
            List of insight strings
        """
        if not self.use_llm:
            return self._fallback_reflection_insights(significant_memories)

        prompt = self._build_reflection_prompt(agent_name, agent_context, significant_memories)

        try:
            if self.provider == LLMProvider.ANTHROPIC:
                response = await self._generate_anthropic(prompt, max_tokens=400)
            else:
                response = await self._generate_openai(prompt, max_tokens=400)

            # Parse insights (expect numbered list)
            insights = [
                line.strip().lstrip('0123456789.-) ')
                for line in response.split('\n')
                if line.strip() and len(line.strip()) > 10
            ]

            return insights[:max_insights]

        except Exception as e:
            logger.error(f"Reflection generation failed: {e}")
            return self._fallback_reflection_insights(significant_memories)

    async def generate_discovery_narrative(
        self,
        agent_name: str,
        technology_name: str,
        technology_description: str,
        agent_context: Dict
    ) -> str:
        """
        Generate a narrative for a technology discovery.

        Args:
            agent_name: Name of discovering agent
            technology_name: Name of technology
            technology_description: Description of technology
            agent_context: Agent's current context

        Returns:
            First-person discovery narrative
        """
        if not self.use_llm:
            return f"I've discovered {technology_name}! This will help me survive."

        prompt = f"""You are {agent_name}, a primitive human living in a simulation of early civilization.

You have just discovered: {technology_name}
Description: {technology_description}

Your current state:
- Location: {agent_context.get('location', 'unknown')}
- Recent activities: {', '.join(agent_context.get('recent_activities', ['exploring']))}

Write a brief (2-3 sentences) first-person internal monologue about this discovery.
Express your thoughts, emotions, and how this might help you survive.
Use simple, direct language. Show excitement and practical thinking.

Discovery narrative:"""

        try:
            if self.provider == LLMProvider.ANTHROPIC:
                return await self._generate_anthropic(prompt, max_tokens=150)
            else:
                return await self._generate_openai(prompt, max_tokens=150)
        except Exception as e:
            logger.error(f"Discovery narrative generation failed: {e}")
            return f"I've discovered {technology_name}! This changes everything."

    def _build_conversation_prompt(
        self,
        agent_name: str,
        agent_context: Dict,
        other_agent_name: str,
        topic: str,
        history: List[Dict]
    ) -> str:
        """Build prompt for conversation generation."""
        # Format recent memories
        memories_str = "\n".join([
            f"- {m['content']}"
            for m in agent_context.get('memories', [])[:5]
        ])

        # Format conversation history
        history_str = "\n".join([
            f"{msg['speaker_id']}: {msg['content']}"
            for msg in history[-4:]  # Last 4 messages
        ])

        prompt = f"""You are {agent_name}, a person in an early civilization simulation.

Your recent experiences:
{memories_str if memories_str else "- Just beginning my journey"}

Current conversation with {other_agent_name}:
Topic: {topic}

Recent exchange:
{history_str if history_str else "[Beginning of conversation]"}

Generate {agent_name}'s next message (1-2 sentences).
Be natural, contextual, and authentic to a primitive human society.
Keep it brief and conversational.

{agent_name}:"""

        return prompt

    def _build_reflection_prompt(
        self,
        agent_name: str,
        agent_context: Dict,
        memories: List[Dict]
    ) -> str:
        """Build prompt for reflection generation."""
        memories_str = "\n".join([
            f"- {m['content']} (importance: {m['importance_score']})"
            for m in memories[:20]
        ])

        prompt = f"""You are {agent_name}, reflecting on your recent experiences in an early civilization.

Your recent memories and experiences:
{memories_str}

Analyze these experiences and generate 3 key insights or patterns you've noticed.
Each insight should be a realization about survival, social dynamics, or your environment.
Write in first-person, as {agent_name}'s internal thoughts.

Format as a numbered list:
1. [First insight]
2. [Second insight]
3. [Third insight]

Insights:"""

        return prompt

    async def _generate_anthropic(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text using Anthropic API."""
        if not self.anthropic_client:
            raise ValueError("Anthropic client not initialized")

        response = await asyncio.to_thread(
            self.anthropic_client.messages.create,
            model="claude-3-5-sonnet-20241022",
            max_tokens=max_tokens,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        return response.content[0].text.strip()

    async def _generate_openai(self, prompt: str, max_tokens: int = 150) -> str:
        """Generate text using OpenAI API."""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")

        response = await asyncio.to_thread(
            self.openai_client.chat.completions.create,
            model="gpt-4o-mini",
            max_tokens=max_tokens,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        return response.choices[0].message.content.strip()

    def _fallback_conversation_message(self, agent_name: str, topic: str) -> str:
        """Fallback conversation message when LLM unavailable."""
        templates = {
            "knowledge_sharing": [
                "I've learned something interesting. Would you like me to share it?",
                "I have some knowledge that might help you.",
                "Let me tell you what I've discovered."
            ],
            "social_bonding": [
                "It's good to see you again.",
                "How have you been managing?",
                "I'm glad we're here together."
            ],
            "request_help": [
                "I could use some assistance.",
                "Would you be able to help me?",
                "I'm facing some challenges."
            ],
            "greeting": [
                "Hello!",
                "Greetings.",
                "Good to see you."
            ],
            "first_meeting": [
                f"Hello, I'm {agent_name}.",
                "Greetings, friend.",
                "Nice to meet you."
            ]
        }

        import random
        messages = templates.get(topic, templates["greeting"])
        return random.choice(messages)

    def _fallback_reflection_insights(self, memories: List[Dict]) -> List[str]:
        """Fallback reflection insights when LLM unavailable."""
        insights = []

        # Count activity types
        activities = {}
        for memory in memories:
            content = memory['content'].lower()
            if 'gather' in content or 'berries' in content:
                activities['gathering'] = activities.get('gathering', 0) + 1
            elif 'conversation' in content or 'talk' in content:
                activities['social'] = activities.get('social', 0) + 1
            elif 'discover' in content or 'learn' in content:
                activities['learning'] = activities.get('learning', 0) + 1

        if activities.get('gathering', 0) > 5:
            insights.append("I spend a lot of time gathering resources. This is essential for survival.")

        if activities.get('social', 0) > 3:
            insights.append("I value my connections with others. We are stronger together.")

        if activities.get('learning', 0) > 0:
            insights.append("Learning new things helps me adapt and thrive.")

        if not insights:
            insights.append("I am learning to survive in this world.")
            insights.append("Each day brings new challenges and opportunities.")

        return insights

    def is_available(self) -> bool:
        """Check if LLM service is available."""
        return self.use_llm


# Global instance
llm_service = LLMService()
