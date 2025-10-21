"""Economic system for specialization and trade."""
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from collections import defaultdict
import random

logger = logging.getLogger(__name__)


class TradeOffer:
    """Represents a trade offer between agents."""

    def __init__(
        self,
        offer_id: str,
        offerer_id: str,
        target_id: str,
        offering_items: Dict[str, int],
        requesting_items: Dict[str, int]
    ):
        self.id = offer_id
        self.offerer_id = offerer_id
        self.target_id = target_id
        self.offering_items = offering_items
        self.requesting_items = requesting_items
        self.status = "pending"  # pending, accepted, rejected, cancelled
        self.created_at = datetime.now()
        self.resolved_at: Optional[datetime] = None


class AgentSpecialization:
    """Tracks an agent's economic specialization."""

    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.primary_role: Optional[str] = None  # gatherer, hunter, crafter, builder, farmer
        self.skill_levels: Dict[str, float] = defaultdict(float)  # skill -> level (0-100)
        self.production_history: Dict[str, int] = defaultdict(int)  # item -> count produced
        self.trade_history: List[Dict] = []

    def update_skill(self, skill: str, amount: float):
        """Update skill level."""
        self.skill_levels[skill] = min(100.0, self.skill_levels[skill] + amount)

    def determine_primary_role(self):
        """Determine primary role based on skill levels."""
        if not self.skill_levels:
            return

        # Get highest skill
        top_skill = max(self.skill_levels.items(), key=lambda x: x[1])

        role_mapping = {
            "gathering": "gatherer",
            "hunting": "hunter",
            "crafting": "crafter",
            "building": "builder",
            "farming": "farmer",
            "mining": "miner",
        }

        self.primary_role = role_mapping.get(top_skill[0], "generalist")


class TradeSystem:
    """Manages economic activities and trade."""

    def __init__(self):
        # Agent specializations: agent_id -> AgentSpecialization
        self.specializations: Dict[str, AgentSpecialization] = {}

        # Active trade offers: offer_id -> TradeOffer
        self.active_offers: Dict[str, TradeOffer] = {}

        # Trade history
        self.completed_trades: List[Dict] = []

        # Market prices (simple supply/demand)
        self.market_prices: Dict[str, float] = {
            "wood": 1.0,
            "stone": 1.2,
            "berries": 0.8,
            "meat": 2.0,
            "fish": 1.5,
            "seeds": 1.0,
            "cloth": 3.0,
            "tools": 5.0,
        }

    def get_or_create_specialization(self, agent_id: str) -> AgentSpecialization:
        """Get or create agent specialization."""
        if agent_id not in self.specializations:
            self.specializations[agent_id] = AgentSpecialization(agent_id)
        return self.specializations[agent_id]

    def record_activity(self, agent_id: str, activity_type: str, items_produced: Optional[Dict[str, int]] = None):
        """
        Record an agent's economic activity to build specialization.

        Args:
            agent_id: Agent's ID
            activity_type: Type of activity (gathering, hunting, crafting, etc.)
            items_produced: Items produced during activity
        """
        spec = self.get_or_create_specialization(agent_id)

        # Update skill based on activity
        skill_gains = {
            "gathering_resources": ("gathering", 0.5),
            "hunting": ("hunting", 0.8),
            "crafting": ("crafting", 1.0),
            "building": ("building", 1.2),
            "farming": ("farming", 0.7),
            "mining": ("mining", 0.9),
        }

        if activity_type in skill_gains:
            skill, gain = skill_gains[activity_type]
            spec.update_skill(skill, gain)

        # Update production history
        if items_produced:
            for item, count in items_produced.items():
                spec.production_history[item] += count

        # Periodically update primary role
        if random.random() < 0.1:  # 10% chance to recalculate
            spec.determine_primary_role()

    def evaluate_trade_need(
        self,
        agent_id: str,
        agent_inventory: Dict[str, int],
        agent_needs: Dict[str, float]
    ) -> Optional[Tuple[Dict[str, int], Dict[str, int]]]:
        """
        Evaluate if agent should seek trade based on inventory and needs.

        Returns:
            Tuple of (items_to_offer, items_to_request) or None
        """
        spec = self.get_or_create_specialization(agent_id)

        # Identify surplus items (agent has more than they need)
        surplus_items = {}
        for item, count in agent_inventory.items():
            if count > 5:  # Threshold for surplus
                surplus_items[item] = min(count - 3, 5)  # Offer up to 5, keep at least 3

        if not surplus_items:
            return None

        # Identify needed items (based on needs and inventory)
        needed_items = {}

        # Check critical needs
        if agent_needs.get("hunger", 100) < 50:
            # Need food
            food_items = ["berries", "meat", "fish"]
            for food in food_items:
                if agent_inventory.get(food, 0) < 3:
                    needed_items[food] = 3 - agent_inventory.get(food, 0)
                    break

        # Specialized agents need their materials
        if spec.primary_role == "crafter":
            if agent_inventory.get("stone", 0) < 5:
                needed_items["stone"] = 5
        elif spec.primary_role == "builder":
            if agent_inventory.get("wood", 0) < 5:
                needed_items["wood"] = 5

        if not needed_items:
            return None

        return (surplus_items, needed_items)

    def create_trade_offer(
        self,
        offerer_id: str,
        target_id: str,
        offering_items: Dict[str, int],
        requesting_items: Dict[str, int]
    ) -> TradeOffer:
        """Create a trade offer."""
        offer_id = f"trade_{len(self.active_offers)}_{datetime.now().timestamp()}"

        offer = TradeOffer(
            offer_id,
            offerer_id,
            target_id,
            offering_items,
            requesting_items
        )

        self.active_offers[offer_id] = offer

        logger.info(
            f"Trade offer created: {offerer_id[:8]} offers {offering_items} "
            f"for {requesting_items} to {target_id[:8]}"
        )

        return offer

    def evaluate_trade_offer(
        self,
        offer_id: str,
        target_inventory: Dict[str, int],
        target_needs: Dict[str, float],
        relationship_score: float = 0.0
    ) -> bool:
        """
        Evaluate if target agent should accept trade offer.

        Args:
            offer_id: Trade offer ID
            target_inventory: Target agent's inventory
            target_needs: Target agent's needs
            relationship_score: Relationship score between agents (-100 to 100)

        Returns:
            True if offer should be accepted
        """
        offer = self.active_offers.get(offer_id)
        if not offer or offer.status != "pending":
            return False

        # Check if target has the requested items
        for item, count in offer.requesting_items.items():
            if target_inventory.get(item, 0) < count:
                return False

        # Calculate trade value
        offered_value = sum(
            self.market_prices.get(item, 1.0) * count
            for item, count in offer.offering_items.items()
        )

        requested_value = sum(
            self.market_prices.get(item, 1.0) * count
            for item, count in offer.requesting_items.items()
        )

        # Base acceptance on value ratio and relationship
        value_ratio = offered_value / requested_value if requested_value > 0 else 0

        # Good relationship = more lenient acceptance
        relationship_modifier = 1.0 + (relationship_score / 200.0)  # -0.5 to +0.5
        adjusted_ratio = value_ratio * relationship_modifier

        # Check if offered items meet target's needs
        need_bonus = 0.0
        if target_needs.get("hunger", 100) < 50:
            # Target is hungry
            for item in offer.offering_items:
                if item in ["berries", "meat", "fish"]:
                    need_bonus += 0.3

        adjusted_ratio += need_bonus

        # Accept if ratio is favorable (>0.8) or if desperately needed (>0.6 with need_bonus)
        return adjusted_ratio >= 0.8

    def execute_trade(
        self,
        offer_id: str,
        offerer_inventory: Dict[str, int],
        target_inventory: Dict[str, int]
    ) -> bool:
        """
        Execute a trade, updating both inventories.

        Returns:
            True if trade successful
        """
        offer = self.active_offers.get(offer_id)
        if not offer or offer.status != "pending":
            return False

        # Verify offerer has items to give
        for item, count in offer.offering_items.items():
            if offerer_inventory.get(item, 0) < count:
                offer.status = "cancelled"
                return False

        # Verify target has items to give
        for item, count in offer.requesting_items.items():
            if target_inventory.get(item, 0) < count:
                offer.status = "cancelled"
                return False

        # Execute the trade
        # Offerer gives items
        for item, count in offer.offering_items.items():
            offerer_inventory[item] -= count

        # Offerer receives items
        for item, count in offer.requesting_items.items():
            offerer_inventory[item] = offerer_inventory.get(item, 0) + count

        # Target gives items
        for item, count in offer.requesting_items.items():
            target_inventory[item] -= count

        # Target receives items
        for item, count in offer.offering_items.items():
            target_inventory[item] = target_inventory.get(item, 0) + count

        # Mark trade as completed
        offer.status = "accepted"
        offer.resolved_at = datetime.now()

        # Record in history
        trade_record = {
            "offerer_id": offer.offerer_id,
            "target_id": offer.target_id,
            "offered_items": offer.offering_items,
            "received_items": offer.requesting_items,
            "timestamp": datetime.now().isoformat()
        }

        self.completed_trades.append(trade_record)

        # Update specialization trade history
        offerer_spec = self.get_or_create_specialization(offer.offerer_id)
        target_spec = self.get_or_create_specialization(offer.target_id)

        offerer_spec.trade_history.append(trade_record)
        target_spec.trade_history.append(trade_record)

        # Remove from active offers
        del self.active_offers[offer_id]

        logger.info(
            f"✓ Trade completed: {offer.offerer_id[:8]} ↔ {offer.target_id[:8]} "
            f"({offer.offering_items} for {offer.requesting_items})"
        )

        return True

    def reject_trade(self, offer_id: str):
        """Reject a trade offer."""
        offer = self.active_offers.get(offer_id)
        if offer and offer.status == "pending":
            offer.status = "rejected"
            offer.resolved_at = datetime.now()
            del self.active_offers[offer_id]

    def update_market_prices(self):
        """Update market prices based on supply and demand."""
        # Count total production of each item
        production_counts = defaultdict(int)

        for spec in self.specializations.values():
            for item, count in spec.production_history.items():
                production_counts[item] += count

        # Adjust prices based on relative production
        if production_counts:
            avg_production = sum(production_counts.values()) / len(production_counts)

            for item, count in production_counts.items():
                if item in self.market_prices:
                    # High production = lower price, low production = higher price
                    ratio = count / avg_production if avg_production > 0 else 1.0
                    price_adjustment = 1.0 / (ratio + 0.5)
                    self.market_prices[item] = max(0.5, min(10.0, self.market_prices[item] * (0.9 + price_adjustment * 0.1)))

    def get_specialist_agents(self, role: str) -> List[str]:
        """Get list of agents specialized in a specific role."""
        specialists = []
        for agent_id, spec in self.specializations.items():
            if spec.primary_role == role:
                specialists.append(agent_id)
        return specialists

    def get_agent_specialization(self, agent_id: str) -> Optional[AgentSpecialization]:
        """Get agent's specialization info."""
        return self.specializations.get(agent_id)

    def get_trade_statistics(self) -> Dict:
        """Get overall trade statistics."""
        return {
            "total_trades": len(self.completed_trades),
            "active_offers": len(self.active_offers),
            "specialists": {
                role: len(self.get_specialist_agents(role))
                for role in ["gatherer", "hunter", "crafter", "builder", "farmer", "miner"]
            },
            "market_prices": self.market_prices.copy()
        }


# Global instance
trade_system = TradeSystem()
