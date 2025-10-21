"""World state management."""
import logging
from typing import List, Dict, Tuple, Optional
from .terrain_generator import TerrainGenerator
from .resource_spawner import ResourceSpawner

logger = logging.getLogger(__name__)


class WorldState:
    """Manages world state including terrain and resources."""

    def __init__(self, width: int = 1024, height: int = 1024, seed: int = 42):
        """
        Initialize world state.

        Args:
            width: World width in tiles
            height: World height in tiles
            seed: Random seed for procedural generation
        """
        self.width = width
        self.height = height
        self.seed = seed

        # World data
        self.tiles: List[Dict] = []
        self.resources: List[Dict] = []

        # Generation status
        self.is_generated = False

    def generate_world(self):
        """Generate complete world with terrain and resources."""
        if self.is_generated:
            logger.warning("World already generated, skipping...")
            return

        logger.info(f"Generating world: {self.width}x{self.height}, seed={self.seed}")

        # Generate terrain
        terrain_gen = TerrainGenerator(self.width, self.height, self.seed)
        self.tiles = terrain_gen.generate_world()

        # Spawn resources
        resource_spawner = ResourceSpawner(self.seed)
        self.resources = resource_spawner.spawn_resources(self.tiles)

        self.is_generated = True
        logger.info("World generation complete")

    def get_tile(self, x: int, y: int) -> Optional[Dict]:
        """Get tile at coordinates."""
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return None

        # Tiles are stored in row-major order
        idx = y * self.width + x
        if idx < len(self.tiles):
            return self.tiles[idx]
        return None

    def get_resources_near(self, position: Tuple[float, float], radius: float = 5.0) -> List[Dict]:
        """
        Get resources within radius of position.

        Args:
            position: (x, y) coordinate
            radius: Search radius in tiles

        Returns:
            List of resources within radius
        """
        nearby = []
        px, py = position

        for resource in self.resources:
            rx, ry = resource["position"]
            distance = ((rx - px) ** 2 + (ry - py) ** 2) ** 0.5

            if distance <= radius:
                nearby.append(resource)

        return nearby

    def get_nearest_resource(self, position: Tuple[float, float],
                           resource_type: Optional[str] = None) -> Optional[Dict]:
        """
        Find nearest resource of given type.

        Args:
            position: (x, y) coordinate
            resource_type: Type of resource to find (or None for any)

        Returns:
            Nearest resource or None
        """
        px, py = position
        nearest = None
        nearest_distance = float('inf')

        for resource in self.resources:
            # Skip if type doesn't match
            if resource_type and resource["resource_type"] != resource_type:
                continue

            # Skip depleted resources
            if resource.get("is_depleted", False) or resource["current_quantity"] <= 0:
                continue

            rx, ry = resource["position"]
            distance = ((rx - px) ** 2 + (ry - py) ** 2) ** 0.5

            if distance < nearest_distance:
                nearest = resource
                nearest_distance = distance

        return nearest

    def harvest_resource(self, resource: Dict, amount: int = 1) -> int:
        """
        Harvest from a resource.

        Args:
            resource: Resource dictionary
            amount: Amount to harvest

        Returns:
            Actual amount harvested
        """
        current = resource["current_quantity"]
        harvested = min(amount, current)

        resource["current_quantity"] -= harvested

        if resource["current_quantity"] <= 0:
            resource["is_depleted"] = True

        return harvested

    def update_resource_regeneration(self, delta_time: float):
        """
        Update resource regeneration.

        Args:
            delta_time: Time elapsed in seconds
        """
        hours = delta_time / 3600.0

        for resource in self.resources:
            regen_rate = resource["regeneration_rate"]
            if regen_rate > 0 and resource["current_quantity"] < resource["max_quantity"]:
                regenerated = regen_rate * hours
                resource["current_quantity"] = min(
                    resource["current_quantity"] + regenerated,
                    resource["max_quantity"]
                )

                # No longer depleted if quantity > 0
                if resource["current_quantity"] > 0:
                    resource["is_depleted"] = False

    def is_position_traversable(self, position: Tuple[float, float]) -> bool:
        """Check if position is traversable."""
        x, y = int(position[0]), int(position[1])
        tile = self.get_tile(x, y)

        if not tile:
            return False

        return tile.get("traversable", False)

    def get_movement_speed_modifier(self, position: Tuple[float, float]) -> float:
        """Get movement speed modifier at position."""
        x, y = int(position[0]), int(position[1])
        tile = self.get_tile(x, y)

        if not tile:
            return 1.0

        return tile.get("movement_speed_modifier", 1.0)

    def get_spawn_locations(self, count: int = 10) -> List[Tuple[float, float]]:
        """Get suitable spawn locations for agents."""
        terrain_gen = TerrainGenerator(self.width, self.height, self.seed)
        return terrain_gen.get_spawn_locations(self.tiles, count)

    def to_dict(self) -> Dict:
        """Convert world state to dictionary for serialization."""
        return {
            "width": self.width,
            "height": self.height,
            "seed": self.seed,
            "is_generated": self.is_generated,
            "tile_count": len(self.tiles),
            "resource_count": len(self.resources),
        }

    def get_world_summary(self) -> Dict:
        """Get summary of world state for client."""
        # Biome distribution
        biome_counts = {}
        for tile in self.tiles:
            biome = tile["biome"]
            biome_counts[biome] = biome_counts.get(biome, 0) + 1

        # Resource distribution
        resource_counts = {}
        for resource in self.resources:
            res_type = resource["resource_type"]
            resource_counts[res_type] = resource_counts.get(res_type, 0) + 1

        return {
            "dimensions": {"width": self.width, "height": self.height},
            "seed": self.seed,
            "biomes": biome_counts,
            "resources": resource_counts,
            "total_tiles": len(self.tiles),
            "total_resources": len(self.resources),
        }
