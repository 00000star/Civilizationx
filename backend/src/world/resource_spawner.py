"""Resource spawning system for world generation."""
import logging
from typing import List, Dict, Tuple
import random

logger = logging.getLogger(__name__)


class ResourceSpawner:
    """Spawns resources on terrain based on biome distributions."""

    def __init__(self, seed: int = 42):
        """Initialize resource spawner with seed."""
        self.seed = seed
        random.seed(seed)

    def spawn_resources(self, tiles: List[Dict]) -> List[Dict]:
        """
        Spawn resources on tiles based on biome.

        Args:
            tiles: List of tile dictionaries with biome information

        Returns:
            List of resource dictionaries
        """
        logger.info("Spawning resources on world...")

        resources = []

        # Group tiles by biome for efficient spawning
        tiles_by_biome = {}
        for tile in tiles:
            biome = tile["biome"]
            if biome not in tiles_by_biome:
                tiles_by_biome[biome] = []
            tiles_by_biome[biome].append(tile)

        # Spawn resources per biome
        for biome, biome_tiles in tiles_by_biome.items():
            resources.extend(self._spawn_for_biome(biome, biome_tiles))

        logger.info(f"Spawned {len(resources)} resources")
        self._log_resource_distribution(resources)

        return resources

    def _spawn_for_biome(self, biome: str, tiles: List[Dict]) -> List[Dict]:
        """Spawn resources for a specific biome."""
        resources = []

        if biome == "forest":
            resources.extend(self._spawn_trees(tiles, density=0.7))
            resources.extend(self._spawn_berry_bushes(tiles, density=0.25))
            resources.extend(self._spawn_stone(tiles, density=0.15))

        elif biome == "plains":
            resources.extend(self._spawn_trees(tiles, density=0.08))
            resources.extend(self._spawn_berry_bushes(tiles, density=0.08))
            resources.extend(self._spawn_stone(tiles, density=0.15))

        elif biome == "mountain":
            resources.extend(self._spawn_trees(tiles, density=0.10))
            resources.extend(self._spawn_stone(tiles, density=0.80))
            resources.extend(self._spawn_ore_deposits(tiles, density=0.05))

        elif biome == "desert":
            resources.extend(self._spawn_stone(tiles, density=0.40))

        return resources

    def _spawn_trees(self, tiles: List[Dict], density: float) -> List[Dict]:
        """Spawn trees on tiles."""
        resources = []
        spawn_count = int(len(tiles) * density)

        for _ in range(spawn_count):
            if not tiles:
                break
            tile = random.choice(tiles)

            resource = {
                "resource_type": "tree",
                "position": (float(tile["x"]), float(tile["y"])),
                "biome": tile["biome"],
                "current_quantity": random.randint(8, 12),  # Wood units
                "max_quantity": 12,
                "regeneration_rate": 0.0,  # Trees don't regrow
                "metadata": {
                    "species": random.choice(["oak", "pine", "birch"]),
                    "age": random.randint(10, 100)
                }
            }
            resources.append(resource)

        return resources

    def _spawn_berry_bushes(self, tiles: List[Dict], density: float) -> List[Dict]:
        """Spawn berry bushes on tiles."""
        resources = []
        spawn_count = int(len(tiles) * density)

        for _ in range(spawn_count):
            if not tiles:
                break
            tile = random.choice(tiles)

            resource = {
                "resource_type": "bush",
                "position": (float(tile["x"]), float(tile["y"])),
                "biome": tile["biome"],
                "current_quantity": random.randint(3, 5),  # Berry units
                "max_quantity": 5,
                "regeneration_rate": 0.5,  # 0.5 berries per hour
                "metadata": {
                    "berry_type": random.choice(["strawberry", "blueberry", "blackberry"]),
                    "season_modifier": 1.0
                }
            }
            resources.append(resource)

        return resources

    def _spawn_stone(self, tiles: List[Dict], density: float) -> List[Dict]:
        """Spawn stone deposits on tiles."""
        resources = []
        spawn_count = int(len(tiles) * density)

        for _ in range(spawn_count):
            if not tiles:
                break
            tile = random.choice(tiles)

            resource = {
                "resource_type": "rock",
                "position": (float(tile["x"]), float(tile["y"])),
                "biome": tile["biome"],
                "current_quantity": random.randint(20, 50),  # Stone units
                "max_quantity": 50,
                "regeneration_rate": 0.0,  # Non-renewable
                "metadata": {
                    "stone_type": random.choice(["limestone", "granite", "sandstone"]),
                    "hardness": random.uniform(0.5, 1.0)
                }
            }
            resources.append(resource)

        return resources

    def _spawn_ore_deposits(self, tiles: List[Dict], density: float) -> List[Dict]:
        """Spawn rare ore deposits (mountains only)."""
        resources = []
        spawn_count = int(len(tiles) * density)

        for _ in range(spawn_count):
            if not tiles:
                break
            tile = random.choice(tiles)

            # Determine ore type (copper most common, gold rarest)
            rand = random.random()
            if rand < 0.7:
                ore_type = "copper"
            elif rand < 0.95:
                ore_type = "iron"
            else:
                ore_type = "gold"

            resource = {
                "resource_type": "ore_deposit",
                "position": (float(tile["x"]), float(tile["y"])),
                "biome": tile["biome"],
                "current_quantity": random.randint(10, 30),
                "max_quantity": 30,
                "regeneration_rate": 0.0,
                "metadata": {
                    "ore_type": ore_type,
                    "purity": random.uniform(0.6, 1.0)
                }
            }
            resources.append(resource)

        return resources

    def _log_resource_distribution(self, resources: List[Dict]):
        """Log distribution of resources for debugging."""
        type_counts = {}
        for resource in resources:
            res_type = resource["resource_type"]
            type_counts[res_type] = type_counts.get(res_type, 0) + 1

        logger.info("Resource distribution:")
        for res_type, count in sorted(type_counts.items()):
            logger.info(f"  {res_type}: {count}")
