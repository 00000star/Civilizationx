"""Conversation engine for agent-to-agent interactions."""
import logging
import random
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from .relationship_manager import relationship_manager
from src.agents.memory.memory_manager import memory_manager
from src.technology.discovery_engine import discovery_engine

logger = logging.getLogger(__name__)


class Conversation:
    """Represents an ongoing conversation between agents."""

    def __init__(self, participants: List[str]):
        self.id = f"conv_{datetime.now().timestamp()}"
        self.participants = participants
        self.topic: Optional[str] = None
        self.turn_count = 0
        self.started_at = datetime.now()
        self.messages: List[Dict] = []
        self.outcomes: List[Dict] = []

    def add_message(self, speaker_id: str, content: str, message_type: str = "statement"):
        """Add a message to the conversation."""
        self.messages.append({
            "speaker_id": speaker_id,
            "content": content,
            "message_type": message_type,
            "timestamp": datetime.now()
        })
        self.turn_count += 1


class ConversationEngine:
    """Manages conversations between agents."""

    def __init__(self):
        # Active conversations: conversation_id -> Conversation
        self.active_conversations: Dict[str, Conversation] = {}

        # Cooldown tracking: (agent_a, agent_b) -> last_conversation_time
        self.conversation_cooldowns: Dict[Tuple[str, str], datetime] = {}

    def can_start_conversation(
        self,
        agent_a_id: str,
        agent_b_id: str,
        cooldown_hours: float = 1.0
    ) -> bool:
        """Check if two agents can start a conversation."""
        # Check if agents are already in conversation
        for conv in self.active_conversations.values():
            if agent_a_id in conv.participants and agent_b_id in conv.participants:
                return False

        # Check cooldown
        key = tuple(sorted([agent_a_id, agent_b_id]))
        if key in self.conversation_cooldowns:
            hours_since = (datetime.now() - self.conversation_cooldowns[key]).total_seconds() / 3600.0
            if hours_since < cooldown_hours:
                return False

        return True

    def initiate_conversation(
        self,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str,
        context: Optional[Dict] = None
    ) -> Optional[Conversation]:
        """
        Initiate a conversation between two agents.

        Args:
            agent_a_id: First agent's ID
            agent_a_name: First agent's name
            agent_b_id: Second agent's ID
            agent_b_name: Second agent's name
            context: Optional context (location, activity, etc.)

        Returns:
            Conversation object if successful, None otherwise
        """
        if not self.can_start_conversation(agent_a_id, agent_b_id):
            return None

        # Get relationship
        rel = relationship_manager.get_relationship(agent_a_id, agent_b_id)

        # Determine conversation topic based on relationship and context
        topic = self._determine_conversation_topic(
            agent_a_id, agent_b_id, rel, context
        )

        if not topic:
            return None

        # Create conversation
        conv = Conversation([agent_a_id, agent_b_id])
        conv.topic = topic
        self.active_conversations[conv.id] = conv

        logger.info(f"🗣️ {agent_a_name} and {agent_b_name} started conversation about '{topic}'")

        # Generate opening exchange
        self._generate_greeting(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name, rel)

        return conv

    def _determine_conversation_topic(
        self,
        agent_a_id: str,
        agent_b_id: str,
        relationship: Optional[object],
        context: Optional[Dict]
    ) -> Optional[str]:
        """Determine appropriate conversation topic."""
        topics = []

        # First meeting - always greeting
        if not relationship or relationship.interaction_count == 0:
            return "first_meeting"

        # Check for knowledge sharing opportunities
        a_techs = set(discovery_engine.get_agent_technologies(agent_a_id))
        b_techs = set(discovery_engine.get_agent_technologies(agent_b_id))

        if a_techs - b_techs or b_techs - a_techs:
            topics.append("knowledge_sharing")

        # Social bonding for friends
        if relationship and relationship.relationship_score > 20:
            topics.append("social_bonding")

        # Help request if agent has critical need
        if context and context.get("has_critical_need"):
            topics.append("request_help")

        # General greeting
        topics.append("greeting")

        # Choose randomly weighted by relationship
        if relationship and relationship.relationship_score > 40:
            # Friends more likely to have deeper conversations
            weights = {
                "knowledge_sharing": 0.3,
                "social_bonding": 0.4,
                "request_help": 0.2,
                "greeting": 0.1
            }
        else:
            weights = {
                "knowledge_sharing": 0.2,
                "social_bonding": 0.1,
                "request_help": 0.2,
                "greeting": 0.5
            }

        available_topics = [t for t in topics if t in weights]
        if not available_topics:
            return None

        weights_list = [weights.get(t, 0.1) for t in available_topics]
        return random.choices(available_topics, weights=weights_list)[0]

    def _generate_greeting(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str,
        relationship: Optional[object]
    ):
        """Generate opening greeting messages."""
        if conv.topic == "first_meeting":
            conv.add_message(agent_a_id, f"Hello! I'm {agent_a_name}.", "greeting")
            conv.add_message(agent_b_id, f"Greetings, {agent_a_name}. I'm {agent_b_name}.", "greeting")
        elif relationship and relationship.relationship_type == "close_friend":
            greetings = [
                f"Hey {agent_b_name}! Good to see you!",
                f"{agent_b_name}! How are you doing?",
                f"Hello my friend! It's been a while."
            ]
            conv.add_message(agent_a_id, random.choice(greetings), "greeting")
            conv.add_message(agent_b_id, f"Hello {agent_a_name}! Good to see you too.", "greeting")
        else:
            conv.add_message(agent_a_id, f"Hello {agent_b_name}.", "greeting")
            conv.add_message(agent_b_id, f"Hello {agent_a_name}.", "greeting")

    def continue_conversation(
        self,
        conv_id: str,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ) -> bool:
        """
        Continue an active conversation for one more turn.

        Returns:
            True if conversation continued, False if ended
        """
        if conv_id not in self.active_conversations:
            return False

        conv = self.active_conversations[conv_id]

        # Conversations have limited turns
        max_turns = 6
        if conv.turn_count >= max_turns:
            self.end_conversation(conv_id, agent_a_id, agent_a_name, agent_b_id, agent_b_name)
            return False

        # Generate conversation based on topic
        if conv.topic == "knowledge_sharing":
            self._handle_knowledge_sharing(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name)
        elif conv.topic == "social_bonding":
            self._handle_social_bonding(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name)
        elif conv.topic == "request_help":
            self._handle_help_request(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name)
        else:
            # Simple greeting conversation
            self._handle_simple_conversation(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name)

        # Check if conversation should end
        if conv.turn_count >= random.randint(3, 6):
            self.end_conversation(conv_id, agent_a_id, agent_a_name, agent_b_id, agent_b_name)
            return False

        return True

    def _handle_knowledge_sharing(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """Handle knowledge sharing conversation."""
        # Find technologies one knows but the other doesn't
        a_techs = set(discovery_engine.get_agent_technologies(agent_a_id))
        b_techs = set(discovery_engine.get_agent_technologies(agent_b_id))

        teachable_from_a = list(a_techs - b_techs)
        teachable_from_b = list(b_techs - a_techs)

        if teachable_from_a and conv.turn_count % 2 == 0:
            # Agent A teaches
            tech_to_teach = random.choice(teachable_from_a)
            conv.add_message(
                agent_a_id,
                f"I've learned about {tech_to_teach}. Would you like me to show you?",
                "offer_teaching"
            )
            conv.add_message(
                agent_b_id,
                f"Yes, I'd like to learn about {tech_to_teach}!",
                "accept_teaching"
            )

            # Attempt teaching
            success = discovery_engine.teach_technology(
                agent_a_id, agent_a_name,
                agent_b_id, agent_b_name,
                tech_to_teach
            )

            if success:
                conv.outcomes.append({
                    "type": "knowledge_transfer",
                    "teacher": agent_a_id,
                    "student": agent_b_id,
                    "technology": tech_to_teach
                })
                relationship_manager.handle_positive_interaction(agent_a_id, agent_b_id, "teaching")
            else:
                conv.add_message(agent_b_id, "I'm having trouble understanding. Perhaps another time.", "statement")

        elif teachable_from_b and conv.turn_count % 2 == 1:
            # Agent B teaches
            tech_to_teach = random.choice(teachable_from_b)
            conv.add_message(
                agent_b_id,
                f"I know about {tech_to_teach}. Would you like to learn?",
                "offer_teaching"
            )
            conv.add_message(
                agent_a_id,
                f"Yes, please teach me about {tech_to_teach}!",
                "accept_teaching"
            )

            success = discovery_engine.teach_technology(
                agent_b_id, agent_b_name,
                agent_a_id, agent_a_name,
                tech_to_teach
            )

            if success:
                conv.outcomes.append({
                    "type": "knowledge_transfer",
                    "teacher": agent_b_id,
                    "student": agent_a_id,
                    "technology": tech_to_teach
                })
                relationship_manager.handle_positive_interaction(agent_a_id, agent_b_id, "teaching")
        else:
            # Fallback to general discussion
            conv.add_message(agent_a_id, "I enjoy learning new things.", "statement")
            conv.add_message(agent_b_id, "As do I. Knowledge helps us survive.", "statement")

    def _handle_social_bonding(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """Handle social bonding conversation."""
        bonding_exchanges = [
            (f"I'm glad we crossed paths today.", f"Me too, {agent_a_name}. It's good to have company."),
            (f"How has your day been?", f"Challenging but manageable. How about yours?"),
            (f"I find this area quite pleasant.", f"Yes, I agree. It has good resources."),
            (f"We should work together more often.", f"I'd like that. Together we're stronger."),
        ]

        exchange = random.choice(bonding_exchanges)
        conv.add_message(agent_a_id, exchange[0], "statement")
        conv.add_message(agent_b_id, exchange[1], "statement")

        # Positive relationship impact
        relationship_manager.handle_positive_interaction(agent_a_id, agent_b_id, "cooperation")

    def _handle_help_request(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """Handle help request conversation."""
        conv.add_message(agent_a_id, "I'm struggling to find food. Can you help?", "request")

        rel = relationship_manager.get_relationship(agent_a_id, agent_b_id)

        # Help depends on relationship
        if rel and rel.relationship_score > 30:
            conv.add_message(agent_b_id, "Of course! I know a good spot nearby.", "accept")
            conv.outcomes.append({
                "type": "help_given",
                "helper": agent_b_id,
                "helped": agent_a_id
            })
            relationship_manager.handle_positive_interaction(agent_a_id, agent_b_id, "help")
        else:
            conv.add_message(agent_b_id, "I'm sorry, I have my own needs to attend to.", "decline")
            conv.outcomes.append({
                "type": "help_declined",
                "requester": agent_a_id,
                "decliner": agent_b_id
            })

    def _handle_simple_conversation(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """Handle simple greeting conversation."""
        simple_exchanges = [
            ("How are you?", "I'm well, thank you."),
            ("Nice weather today.", "Yes, it is pleasant."),
            ("Take care.", "You too."),
        ]

        exchange = random.choice(simple_exchanges)
        conv.add_message(agent_a_id, exchange[0], "statement")
        conv.add_message(agent_b_id, exchange[1], "statement")

        relationship_manager.handle_positive_interaction(agent_a_id, agent_b_id, "greeting")

    def end_conversation(
        self,
        conv_id: str,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """End a conversation and process outcomes."""
        if conv_id not in self.active_conversations:
            return

        conv = self.active_conversations[conv_id]

        # Farewell messages
        farewells = ["Goodbye!", "Take care!", "Until next time!", "Farewell!"]
        conv.add_message(agent_a_id, random.choice(farewells), "farewell")
        conv.add_message(agent_b_id, random.choice(farewells), "farewell")

        # Create memories of conversation
        self._create_conversation_memories(conv, agent_a_id, agent_a_name, agent_b_id, agent_b_name)

        # Update cooldown
        key = tuple(sorted([agent_a_id, agent_b_id]))
        self.conversation_cooldowns[key] = datetime.now()

        # Remove from active conversations
        del self.active_conversations[conv_id]

        logger.info(f"Conversation ended between {agent_a_name} and {agent_b_name} after {conv.turn_count} turns")

    def _create_conversation_memories(
        self,
        conv: Conversation,
        agent_a_id: str,
        agent_a_name: str,
        agent_b_id: str,
        agent_b_name: str
    ):
        """Create memories for both participants."""
        # Determine importance based on outcomes
        importance = 5.0
        memory_summary = f"Had a conversation with {agent_b_name}"

        if conv.outcomes:
            for outcome in conv.outcomes:
                if outcome["type"] == "knowledge_transfer":
                    importance = 7.0
                    tech = outcome["technology"]
                    if outcome["teacher"] == agent_a_id:
                        memory_summary = f"Taught {agent_b_name} about {tech}"
                    else:
                        memory_summary = f"Learned {tech} from {agent_b_name}"
                elif outcome["type"] == "help_given":
                    importance = 6.5
                    if outcome["helper"] == agent_a_id:
                        memory_summary = f"Helped {agent_b_name} with their needs"
                    else:
                        memory_summary = f"Received help from {agent_b_name}"

        # Create memory for agent A
        memory_manager.create_memory(
            agent_id=agent_a_id,
            memory_type="episodic",
            content=memory_summary,
            importance_score=importance,
            metadata={
                "conversation": True,
                "other_agent": agent_b_id,
                "topic": conv.topic,
                "turn_count": conv.turn_count
            }
        )

        # Create memory for agent B (inverse perspective)
        if "Taught" in memory_summary:
            b_memory = memory_summary.replace(f"Taught {agent_b_name}", f"Learned from {agent_a_name}")
        elif "Learned" in memory_summary:
            b_memory = memory_summary.replace(f"Learned", f"Taught").replace(f"from {agent_b_name}", agent_a_name)
        elif "Helped" in memory_summary:
            b_memory = memory_summary.replace(f"Helped {agent_b_name}", f"Was helped by {agent_a_name}")
        elif "Received help" in memory_summary:
            b_memory = memory_summary.replace(f"Received help from {agent_b_name}", f"Helped {agent_a_name}")
        else:
            b_memory = f"Had a conversation with {agent_a_name}"

        memory_manager.create_memory(
            agent_id=agent_b_id,
            memory_type="episodic",
            content=b_memory,
            importance_score=importance,
            metadata={
                "conversation": True,
                "other_agent": agent_a_id,
                "topic": conv.topic,
                "turn_count": conv.turn_count
            }
        )

    def get_active_conversation(self, agent_id: str) -> Optional[Conversation]:
        """Get the active conversation for an agent."""
        for conv in self.active_conversations.values():
            if agent_id in conv.participants:
                return conv
        return None

    def is_in_conversation(self, agent_id: str) -> bool:
        """Check if agent is currently in a conversation."""
        return self.get_active_conversation(agent_id) is not None


# Global instance
conversation_engine = ConversationEngine()
