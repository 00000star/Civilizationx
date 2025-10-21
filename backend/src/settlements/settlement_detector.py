"""Settlement detection and formation system."""
import logging
from typing import List, Dict, Optional, Set, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import math

logger = logging.getLogger(__name__)


class Settlement:
    """Represents a settlement formed by agents."""

    def __init__(self, settlement_id: str, founder_ids: List[str], center_position: Tuple[float, float]):
        self.id = settlement_id
        self.name: Optional[str] = None
        self.founder_ids = founder_ids
        self.member_ids: Set[str] = set(founder_ids)
        self.center_position = center_position
        self.radius = 10.0  # Initial radius
        self.founded_at = datetime.now()
        self.population = len(founder_ids)

        # Settlement characteristics
        self.settlement_type = "camp"  # camp -> village -> town -> city
        self.structures: List[Dict] = []
        self.resources_stockpile: Dict[str, int] = {}
        self.specialized_roles: Dict[str, List[str]] = {}  # role -> list of agent IDs

        # Governance
        self.leader_id: Optional[str] = None
        self.governance_type = "none"  # none, elder, council, chiefdom, etc.

        # Culture
        self.cultural_traits: List[str] = []
        self.traditions: List[Dict] = []

    def add_member(self, agent_id: str):
        """Add a new member to the settlement."""
        if agent_id not in self.member_ids:
            self.member_ids.add(agent_id)
            self.population = len(self.member_ids)
            logger.info(f"Agent {agent_id[:8]} joined settlement {self.name or self.id[:8]}")

    def remove_member(self, agent_id: str):
        """Remove a member from the settlement."""
        if agent_id in self.member_ids:
            self.member_ids.remove(agent_id)
            self.population = len(self.member_ids)
            logger.info(f"Agent {agent_id[:8]} left settlement {self.name or self.id[:8]}")

    def update_settlement_type(self):
        """Update settlement type based on population."""
        if self.population >= 50:
            self.settlement_type = "city"
            self.radius = 30.0
        elif self.population >= 20:
            self.settlement_type = "town"
            self.radius = 20.0
        elif self.population >= 8:
            self.settlement_type = "village"
            self.radius = 15.0
        else:
            self.settlement_type = "camp"
            self.radius = 10.0

    def to_dict(self) -> Dict:
        """Convert settlement to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "center_position": self.center_position,
            "radius": self.radius,
            "population": self.population,
            "settlement_type": self.settlement_type,
            "member_ids": list(self.member_ids),
            "leader_id": self.leader_id,
            "governance_type": self.governance_type,
            "founded_at": self.founded_at.isoformat(),
            "structures": self.structures,
            "resources_stockpile": self.resources_stockpile,
        }


class SettlementDetector:
    """Detects and manages settlement formation."""

    def __init__(self):
        # Active settlements: settlement_id -> Settlement
        self.settlements: Dict[str, Settlement] = {}

        # Track agent proximity over time: (frozenset of agent_ids) -> list of timestamps
        self.proximity_tracking: Dict[frozenset, List[datetime]] = defaultdict(list)

        # Track which settlement each agent belongs to: agent_id -> settlement_id
        self.agent_settlements: Dict[str, str] = {}

    def check_for_settlement_formation(
        self,
        agents: List[Dict],
        min_group_size: int = 3,
        proximity_radius: float = 15.0,
        stability_hours: float = 12.0
    ):
        """
        Check if any groups of agents should form a settlement.

        Args:
            agents: List of agent dictionaries with position and id
            min_group_size: Minimum number of agents to form settlement
            proximity_radius: Distance threshold for grouping
            stability_hours: Hours agents must stay together to form settlement
        """
        # Find groups of agents in proximity
        agent_groups = self._find_proximity_groups(agents, proximity_radius, min_group_size)

        current_time = datetime.now()

        # Track each group
        for group in agent_groups:
            group_key = frozenset(group)

            # Record this group observation
            self.proximity_tracking[group_key].append(current_time)

            # Clean old observations (older than stability_hours * 2)
            cutoff = current_time - timedelta(hours=stability_hours * 2)
            self.proximity_tracking[group_key] = [
                t for t in self.proximity_tracking[group_key] if t > cutoff
            ]

            # Check if group has been stable long enough
            observations = self.proximity_tracking[group_key]
            if len(observations) >= 3:  # At least 3 observations
                time_span = (observations[-1] - observations[0]).total_seconds() / 3600.0

                if time_span >= stability_hours:
                    # Check if these agents aren't already in a settlement
                    if not any(agent_id in self.agent_settlements for agent_id in group):
                        # Form new settlement!
                        self._form_settlement(group, agents)
                        # Clear tracking for this group
                        del self.proximity_tracking[group_key]

    def _find_proximity_groups(
        self,
        agents: List[Dict],
        radius: float,
        min_size: int
    ) -> List[List[str]]:
        """Find groups of agents within proximity radius."""
        # Filter to alive agents
        alive_agents = [a for a in agents if a.get("is_alive", True)]

        if len(alive_agents) < min_size:
            return []

        # Build proximity graph
        agent_neighbors: Dict[str, Set[str]] = defaultdict(set)

        for i, agent_a in enumerate(alive_agents):
            for agent_b in alive_agents[i+1:]:
                distance = self._calculate_distance(
                    agent_a["position"],
                    agent_b["position"]
                )

                if distance <= radius:
                    agent_neighbors[agent_a["id"]].add(agent_b["id"])
                    agent_neighbors[agent_b["id"]].add(agent_a["id"])

        # Find connected components (groups)
        visited = set()
        groups = []

        for agent_id in agent_neighbors.keys():
            if agent_id not in visited:
                # BFS to find connected component
                group = self._bfs_group(agent_id, agent_neighbors, visited)
                if len(group) >= min_size:
                    groups.append(group)

        return groups

    def _bfs_group(
        self,
        start_id: str,
        neighbors: Dict[str, Set[str]],
        visited: Set[str]
    ) -> List[str]:
        """BFS to find connected group of agents."""
        group = []
        queue = [start_id]
        visited.add(start_id)

        while queue:
            agent_id = queue.pop(0)
            group.append(agent_id)

            for neighbor_id in neighbors.get(agent_id, []):
                if neighbor_id not in visited:
                    visited.add(neighbor_id)
                    queue.append(neighbor_id)

        return group

    def _calculate_distance(self, pos_a: Tuple[float, float], pos_b: Tuple[float, float]) -> float:
        """Calculate Euclidean distance between two positions."""
        return math.sqrt((pos_a[0] - pos_b[0])**2 + (pos_a[1] - pos_b[1])**2)

    def _form_settlement(self, agent_ids: List[str], all_agents: List[Dict]):
        """Form a new settlement from a group of agents."""
        # Calculate center position
        positions = []
        agent_names = []

        for agent in all_agents:
            if agent["id"] in agent_ids:
                positions.append(agent["position"])
                agent_names.append(agent.get("name", "Unknown"))

        if not positions:
            return

        center_x = sum(p[0] for p in positions) / len(positions)
        center_y = sum(p[1] for p in positions) / len(positions)
        center_position = (center_x, center_y)

        # Create settlement
        settlement_id = f"settlement_{len(self.settlements)}_{datetime.now().timestamp()}"
        settlement = Settlement(settlement_id, agent_ids, center_position)

        # Generate settlement name
        settlement.name = self._generate_settlement_name(len(self.settlements))

        self.settlements[settlement_id] = settlement

        # Update agent settlements mapping
        for agent_id in agent_ids:
            self.agent_settlements[agent_id] = settlement_id

        logger.info(
            f"🏘️ New settlement '{settlement.name}' formed at ({center_x:.1f}, {center_y:.1f}) "
            f"with {len(agent_ids)} founders: {', '.join(agent_names[:3])}{'...' if len(agent_names) > 3 else ''}"
        )

    def _generate_settlement_name(self, index: int) -> str:
        """Generate a name for a new settlement."""
        prefixes = [
            "New", "Old", "East", "West", "North", "South", "High", "Low",
            "Stone", "Wood", "River", "Hill", "Green", "Red"
        ]
        suffixes = [
            "haven", "ford", "ton", "ville", "burg", "dale", "field",
            "wood", "port", "mount", "valley", "ridge", "brook"
        ]

        import random
        prefix = random.choice(prefixes)
        suffix = random.choice(suffixes)

        return f"{prefix}{suffix}"

    def update_settlements(self, agents: List[Dict]):
        """Update existing settlements based on current agent positions."""
        for settlement_id, settlement in list(self.settlements.items()):
            # Check which members are still nearby
            nearby_members = []
            departed_members = []

            for agent_id in list(settlement.member_ids):
                agent = next((a for a in agents if a["id"] == agent_id), None)

                if not agent or not agent.get("is_alive", True):
                    # Agent died or doesn't exist
                    departed_members.append(agent_id)
                    continue

                distance = self._calculate_distance(agent["position"], settlement.center_position)

                if distance > settlement.radius * 2:  # Agent wandered too far
                    departed_members.append(agent_id)
                else:
                    nearby_members.append(agent_id)

            # Remove departed members
            for agent_id in departed_members:
                settlement.remove_member(agent_id)
                if agent_id in self.agent_settlements:
                    del self.agent_settlements[agent_id]

            # Check if settlement should be disbanded
            if settlement.population < 2:
                logger.info(f"Settlement '{settlement.name}' disbanded due to low population")
                del self.settlements[settlement_id]
                continue

            # Update settlement type based on population
            settlement.update_settlement_type()

            # Recalculate center position based on remaining members
            if nearby_members:
                positions = []
                for agent in agents:
                    if agent["id"] in nearby_members:
                        positions.append(agent["position"])

                if positions:
                    new_center_x = sum(p[0] for p in positions) / len(positions)
                    new_center_y = sum(p[1] for p in positions) / len(positions)
                    settlement.center_position = (new_center_x, new_center_y)

    def get_agent_settlement(self, agent_id: str) -> Optional[Settlement]:
        """Get the settlement an agent belongs to."""
        settlement_id = self.agent_settlements.get(agent_id)
        if settlement_id:
            return self.settlements.get(settlement_id)
        return None

    def get_all_settlements(self) -> List[Settlement]:
        """Get all active settlements."""
        return list(self.settlements.values())

    def get_settlement_by_id(self, settlement_id: str) -> Optional[Settlement]:
        """Get a specific settlement by ID."""
        return self.settlements.get(settlement_id)

    def assign_leader(self, settlement_id: str, leader_id: str) -> bool:
        """Assign a leader to a settlement."""
        settlement = self.settlements.get(settlement_id)
        if not settlement or leader_id not in settlement.member_ids:
            return False

        settlement.leader_id = leader_id
        settlement.governance_type = "chiefdom"

        logger.info(f"Agent {leader_id[:8]} became leader of settlement '{settlement.name}'")
        return True

    def add_structure(self, settlement_id: str, structure_type: str, position: Tuple[float, float]):
        """Add a structure to a settlement."""
        settlement = self.settlements.get(settlement_id)
        if not settlement:
            return False

        structure = {
            "type": structure_type,
            "position": position,
            "built_at": datetime.now().isoformat(),
        }

        settlement.structures.append(structure)
        logger.info(f"Built {structure_type} in settlement '{settlement.name}'")
        return True


# Global instance
settlement_detector = SettlementDetector()
