# 🌍 AI Civilization Simulation

> **Watch autonomous AI agents evolve from primitive individuals into complex civilizations with emergent behaviors, technology discovery, social structures, and dynamic conflicts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![Status: 75% Complete](https://img.shields.io/badge/status-75%25%20complete-yellow.svg)]()

---

## 🎯 What Is This?

An AI-powered civilization simulation where **intelligent agents** autonomously:
- 🔥 Discover technologies from **fire to agriculture** through experience
- 🤝 Form **relationships, friendships, and rivalries**
- 🏘️ Build **settlements** that grow from camps to cities
- ⚔️ Engage in **duels and wars** when relationships turn hostile
- 💬 Have **natural language conversations** (with optional LLM integration)
- 🧠 **Remember, reflect, and plan** multi-step actions intelligently
- 🎨 Develop **unique cultures** with distinct traits and traditions

**All from simple rules creating complex emergent behavior!**

---

## ✨ Features

### 🧠 **Intelligent Agent Cognition**
- ✅ **GOAP Planning**: Goal-Oriented Action Planning with A* pathfinding for multi-step intelligent behavior
- ✅ **4 Memory Types**: Episodic (events), Semantic (knowledge), Procedural (skills), Collective (cultural)
- ✅ **Reflection System**: Agents synthesize insights from experiences every 24 simulation hours
- ✅ **LLM Integration**: Natural language narratives with GPT-4/Claude (graceful template fallback if no API key)

### 🔬 **Technology & Discovery**
- ✅ **10 Technologies**: Fire, stone tools, hunting, agriculture, pottery, and more
- ✅ **Experience-Based Discovery**: Agents discover through repeated activities (no predetermined unlocks)
- ✅ **Teaching System**: Agents teach each other, spreading knowledge through social networks
- ✅ **Era Progression**: Primitive → Ancient eras (Classical/Industrial/Modern planned)

---

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API.md) - REST API documentation
- [Development Guide](docs/DEVELOPMENT.md) - Contributing guidelines
- [User Guide](docs/USER_GUIDE.md) - How to use the simulation

---

## 📖 Known Challenges & Solutions

### LLM API Costs
- **Challenge**: High-frequency LLM calls can be expensive
- **Solution**: Aggressive caching, template-based responses, tiered model usage (Claude for complex, GPT-3.5 for simple)

### Knowledge Leakage Prevention
- **Challenge**: LLMs inherently know modern technologies
- **Solution**: Multi-layer validation, context filtering, output scanning, forbidden term detection

### Emergence Pacing
- **Challenge**: Civilizations progress too fast or too slow
- **Solution**: Configurable discovery rates, dynamic difficulty adjustment

---

## 📖 Contributing

Contributions are welcome! Please read [DEVELOPMENT.md](docs/DEVELOPMENT.md) for guidelines.

---

## 📖 License

[Add your license here]

---

## 📖 Acknowledgments

This project is inspired by:
- "Generative Agents: Interactive Simulacra of Human Behavior" (Stanford, 2023)
- Classic civilization games (Civilization series, Dwarf Fortress)
- Emergent complexity research and agent-based modeling

---

## 📖 Support

For questions, issues, or discussions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the planning document for detailed specifications

---

**Status**: Phase 1 Development (Foundation)

Built with passion for emergent complexity and AI-driven simulation. 🚀
