"""Procedural terrain generation using Perlin noise."""
import logging
from typing import List, Dict, Tuple
import numpy as np
from noise import pnoise2

logger = logging.getLogger(__name__)


class TerrainGenerator:
    """Generates procedural terrain using Perlin noise."""

    def __init__(self, width: int, height: int, seed: int = 42):
        """
        Initialize terrain generator.

        Args:
            width: World width in tiles
            height: World height in tiles
            seed: Random seed for reproducibility
        """
        self.width = width
        self.height = height
        self.seed = seed

    def generate_world(self) -> List[Dict]:
        """
        Generate complete world with biomes.

        Returns:
            List of tile dictionaries with biome, elevation, moisture, etc.
        """
        logger.info(f"Generating world: {self.width}x{self.height} tiles, seed={self.seed}")

        # Generate elevation map
        elevation_map = self._generate_elevation_map()

        # Generate moisture map
        moisture_map = self._generate_moisture_map()

        # Assign biomes based on elevation and moisture
        tiles = []
        for y in range(self.height):
            for x in range(self.width):
                elevation = elevation_map[y][x]
                moisture = moisture_map[y][x]
                biome = self._determine_biome(elevation, moisture)

                tile = {
                    "x": x,
                    "y": y,
                    "biome": biome,
                    "elevation": float(elevation),
                    "moisture": float(moisture),
                    "traversable": self._is_traversable(biome),
                    "movement_speed_modifier": self._get_speed_modifier(biome),
                }
                tiles.append(tile)

        logger.info(f"Generated {len(tiles)} tiles")
        self._log_biome_distribution(tiles)

        return tiles

    def _generate_elevation_map(self) -> np.ndarray:
        """Generate elevation map using Perlin noise."""
        elevation_map = np.zeros((self.height, self.width))

        # Multiple octaves for realistic terrain
        octaves = 6
        persistence = 0.5
        scale = 100.0

        for y in range(self.height):
            for x in range(self.width):
                value = 0.0
                amplitude = 1.0
                frequency = 1.0

                for octave in range(octaves):
                    sample_x = x / scale * frequency
                    sample_y = y / scale * frequency
                    noise_value = pnoise2(
                        sample_x,
                        sample_y,
                        octaves=1,
                        persistence=persistence,
                        lacunarity=2.0,
                        repeatx=self.width,
                        repeaty=self.height,
                        base=self.seed + octave
                    )
                    value += noise_value * amplitude
                    amplitude *= persistence
                    frequency *= 2.0

                # Normalize to range -5 to 120 (meters)
                elevation_map[y][x] = self._normalize(value, -1, 1, -5, 120)

        return elevation_map

    def _generate_moisture_map(self) -> np.ndarray:
        """Generate moisture map using separate Perlin noise."""
        moisture_map = np.zeros((self.height, self.width))

        # Different parameters for moisture
        octaves = 4
        persistence = 0.6
        scale = 150.0

        for y in range(self.height):
            for x in range(self.width):
                value = 0.0
                amplitude = 1.0
                frequency = 1.0

                for octave in range(octaves):
                    sample_x = x / scale * frequency
                    sample_y = y / scale * frequency
                    noise_value = pnoise2(
                        sample_x,
                        sample_y,
                        octaves=1,
                        persistence=persistence,
                        lacunarity=2.0,
                        repeatx=self.width,
                        repeaty=self.height,
                        base=self.seed + 1000 + octave  # Different seed offset
                    )
                    value += noise_value * amplitude
                    amplitude *= persistence
                    frequency *= 2.0

                # Normalize to range 0.0 to 1.0
                moisture_map[y][x] = self._normalize(value, -1, 1, 0, 1)

        return moisture_map

    def _determine_biome(self, elevation: float, moisture: float) -> str:
        """
        Determine biome type based on elevation and moisture.

        Biome rules from planning.md:
        - Water: elevation < 0
        - Mountain: elevation > 80
        - Desert: elevation < 50 and moisture < 0.2
        - Forest: elevation < 50 and moisture > 0.6
        - Plains: everything else
        """
        if elevation < 0:
            return "water"
        elif elevation > 80:
            return "mountain"
        elif moisture < 0.2:
            return "desert"
        elif moisture > 0.6 and elevation < 50:
            return "forest"
        else:
            return "plains"

    def _is_traversable(self, biome: str) -> bool:
        """Check if biome is traversable by agents."""
        # Water is not traversable in Phase 1 (no boats yet)
        return biome != "water"

    def _get_speed_modifier(self, biome: str) -> float:
        """Get movement speed modifier for biome."""
        modifiers = {
            "forest": 0.8,   # Slower due to density
            "plains": 1.0,   # Normal speed
            "mountain": 0.6, # Slow due to steep terrain
            "water": 0.1,    # Very slow (swimming)
            "desert": 0.9    # Slightly slower
        }
        return modifiers.get(biome, 1.0)

    def _normalize(self, value: float, old_min: float, old_max: float,
                   new_min: float, new_max: float) -> float:
        """Normalize value from one range to another."""
        old_range = old_max - old_min
        new_range = new_max - new_min
        return (((value - old_min) * new_range) / old_range) + new_min

    def _log_biome_distribution(self, tiles: List[Dict]):
        """Log distribution of biomes for debugging."""
        biome_counts = {}
        for tile in tiles:
            biome = tile["biome"]
            biome_counts[biome] = biome_counts.get(biome, 0) + 1

        total = len(tiles)
        logger.info("Biome distribution:")
        for biome, count in sorted(biome_counts.items()):
            percentage = (count / total) * 100
            logger.info(f"  {biome}: {count} tiles ({percentage:.1f}%)")

    def get_spawn_locations(self, tiles: List[Dict], count: int = 10) -> List[Tuple[float, float]]:
        """
        Get suitable spawn locations for agents.

        Args:
            tiles: List of tile dictionaries
            count: Number of spawn locations to find

        Returns:
            List of (x, y) coordinates suitable for spawning
        """
        # Find plains and forest tiles (good starting locations)
        suitable_tiles = [
            tile for tile in tiles
            if tile["biome"] in ["plains", "forest"] and tile["traversable"]
        ]

        if not suitable_tiles:
            logger.warning("No suitable spawn locations found, using any traversable tile")
            suitable_tiles = [tile for tile in tiles if tile["traversable"]]

        # Randomly select spawn locations
        np.random.seed(self.seed)
        selected = np.random.choice(len(suitable_tiles), min(count, len(suitable_tiles)), replace=False)

        spawn_locations = []
        for idx in selected:
            tile = suitable_tiles[idx]
            # Add small random offset within tile
            offset_x = np.random.uniform(-0.4, 0.4)
            offset_y = np.random.uniform(-0.4, 0.4)
            spawn_locations.append((
                float(tile["x"]) + offset_x,
                float(tile["y"]) + offset_y
            ))

        logger.info(f"Generated {len(spawn_locations)} spawn locations")
        return spawn_locations
