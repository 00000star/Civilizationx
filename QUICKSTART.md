# 🚀 Quick Start Guide

Get the AI Civilization Simulation running in **5 minutes**!

---

## Prerequisites Check

Before starting, ensure you have:

- [ ] **Docker** installed ([Get Docker](https://docs.docker.com/get-docker/))
- [ ] **Docker Compose** installed (usually comes with Docker Desktop)
- [ ] **4GB+ RAM** available
- [ ] **2GB+ disk space** free

**OR** for manual setup:
- [ ] **Python 3.11+** ([Download](https://www.python.org/downloads/))
- [ ] **Node.js 18+** ([Download](https://nodejs.org/))
- [ ] **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- [ ] **Redis** ([Download](https://redis.io/download))

---

## 🐳 Option 1: Docker (Recommended - Easiest!)

### Step 1: Clone & Navigate

```bash
git clone <your-repo-url>
cd Civilizationx
```

### Step 2: Configure Environment (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Optional: Edit .env to add LLM API keys for richer narratives
# nano .env  # or use any text editor
```

**Note**: The simulation works without API keys using template-based fallbacks!

### Step 3: Start Everything

```bash
docker-compose up
```

**What this does:**
- Builds backend (Python/FastAPI) container
- Builds frontend (React/TypeScript) container
- Starts PostgreSQL database
- Starts Redis cache
- Initializes database schemas
- Generates procedural world

**First run takes 2-3 minutes to build. Subsequent runs take ~10 seconds.**

### Step 4: Open Your Browser

Once you see:
```
frontend_1  | ready - started server on 0.0.0.0:3000
backend_1   | INFO:     Application startup complete.
```

Navigate to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### Step 5: Spawn Agents & Watch!

1. Click **"Spawn Agents"** button (start with 10-15 agents)
2. Click **"Play"** ▶️ to start simulation
3. Watch the magic happen! 🎉

**What you'll see:**
- Agents moving around, gathering food
- Technologies discovered (~5-10 min)
- Settlements forming (~10-15 min)
- Relationships developing
- Conversations happening
- Potentially conflicts/wars (~20+ min)

### Stopping the Simulation

```bash
# Stop (keeps data)
docker-compose stop

# Stop and remove containers (fresh start next time)
docker-compose down

# Stop, remove containers, and delete all data
docker-compose down -v
```

---

## 💻 Option 2: Manual Setup (Development)

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd Civilizationx
```

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Start backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend should now be running at http://localhost:8000**

### Step 3: Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local if needed (default should work)

# Start frontend
npm start
```

**Frontend should now be running at http://localhost:3000**

### Step 4: Setup Database (New Terminal)

```bash
# Start PostgreSQL (if not already running)
# Linux:
sudo systemctl start postgresql

# macOS:
brew services start postgresql

# Create database
createdb civilizationx

# Start Redis
# Linux:
sudo systemctl start redis

# macOS:
brew services start redis
```

### Step 5: Initialize Database

```bash
cd backend
source venv/bin/activate  # if not already activated

# Run migrations (creates tables)
alembic upgrade head
```

### Step 6: Open Browser & Start!

Navigate to http://localhost:3000 and spawn agents!

---

## 🎮 First Simulation Guide

### Understanding the Interface

**Top Bar:**
- **Statistics**: Total agents, settlements, technologies discovered
- **Controls**: Play/Pause, Speed slider, Spawn agents button

**Left Sidebar - Panels (click to expand):**
1. **Statistics**: Real-time metrics
2. **Agents**: List of all agents with health/needs
3. **Settlements**: Formed settlements with populations
4. **Technologies**: Discovered tech tree
5. **Event Timeline**: Real-time event feed
6. **Social Network**: Relationship graph

**Main View:**
- **3D World**: Agents moving around, gathering, socializing
- **Camera Controls**: Click/drag to pan, scroll to zoom

### What to Watch For

**First 5 minutes:**
- ✅ Agents spawn and start moving
- ✅ Agents gather food (berries from bushes)
- ✅ Needs fluctuate (hunger, energy, social)
- ✅ GOAP planning in action (multi-step behavior)

**5-10 minutes:**
- ✅ First technology discovered (usually "gathering_knowledge" or "hunting")
- ✅ Agents start grouping together
- ✅ Conversations begin between nearby agents
- ✅ Relationships form (check Social Network panel)

**10-20 minutes:**
- ✅ First settlement forms (Camp or Village)
- ✅ More technologies discovered (fire, stone tools)
- ✅ Specialization emerges (gatherers, hunters)
- ✅ Cultural traits start developing

**20+ minutes:**
- ✅ Multiple settlements exist
- ✅ Trade between agents occurs
- ✅ Leadership positions emerge
- ✅ Potential conflicts (duels, wars if hostile relationships form)
- ✅ Complex civilization behaviors

### Tips for Best Results

1. **Start with 10-15 agents**: Too few = slow progress, too many = overwhelming
2. **Use 2x speed**: Click speed slider to 2.0x for faster progression
3. **Check Event Timeline**: See what's happening in real-time
4. **Click on agents**: See their memories, plans, relationships
5. **Be patient**: Emergent behavior takes time to develop

### Troubleshooting

**Problem**: Agents aren't doing anything
- **Solution**: Click "Play" button (might be paused)

**Problem**: No technologies discovered after 15 minutes
- **Solution**: Normal! Discovery is probabilistic. Wait longer or spawn more agents.

**Problem**: Backend/Frontend not connecting
- **Solution**: Check that both are running. Backend should show "Application startup complete."

**Problem**: Docker build fails
- **Solution**: Ensure Docker has enough resources (4GB+ RAM). Check `docker stats`.

**Problem**: "Port already in use" error
- **Solution**: Stop other services on ports 3000, 8000, 5432, 6379.

---

## 📊 Performance Expectations

**System Requirements:**
- **Minimum**: 4GB RAM, Dual-core CPU
- **Recommended**: 8GB RAM, Quad-core CPU

**Performance:**
- **10-20 agents**: Smooth (60 FPS)
- **20-50 agents**: Good (30-60 FPS)
- **50-100 agents**: Moderate (15-30 FPS)
- **100+ agents**: May slow down (optimization needed)

---

## 🎯 What to Try Next

Once you have a running simulation:

1. **Add LLM Integration**:
   - Get OpenAI API key: https://platform.openai.com/
   - Or Anthropic API key: https://console.anthropic.com/
   - Add to `.env` file
   - Restart simulation
   - Enjoy natural language conversations and narratives!

2. **Experiment with Settings**:
   - Edit `.env` file to change world size, simulation speed, etc.
   - Restart to apply changes

3. **Explore the Code**:
   - Check `backend/src/` for all systems
   - Read `COMPLETE_IMPLEMENTATION_SUMMARY.md` for detailed docs
   - Look at `backend/tests/` for test examples

4. **Contribute**:
   - See `DEVELOPMENT.md` for contribution guidelines
   - Check GitHub issues for "good first issue" tags
   - Add new features or fix bugs!

---

## 🆘 Getting Help

**Documentation:**
- `README.md` - Full project documentation
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - System details
- `TESTING_GUIDE.md` - Testing documentation
- `planning.md` - Original design specification

**Support:**
- GitHub Issues: Report bugs or request features
- API Docs: http://localhost:8000/docs (when running)
- Code comments: Extensive inline documentation

**Common Questions:**

**Q: Do I need LLM API keys?**
A: No! The simulation works with template-based fallbacks. API keys just make narratives richer.

**Q: How long until I see a civilization?**
A: Settlements form in ~10-15 minutes. Full civilization behaviors emerge after 20-30 minutes.

**Q: Can I save my simulation?**
A: Not yet! Database persistence is partially implemented. Coming soon!

**Q: Can I run multiple simulations?**
A: Currently one simulation at a time. Separate databases could support multiple instances.

---

## ✅ Success Checklist

After following this guide, you should see:

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] Agents spawn and move around
- [ ] Agents gather resources (berries)
- [ ] Technologies get discovered (check Technology panel)
- [ ] Settlements form (check Settlements panel)
- [ ] Events appear in Event Timeline
- [ ] No errors in console/logs

**If all checked: Congratulations! 🎉 You're running an AI civilization!**

---

## 🚀 Next Steps

Now that you're running, check out:
- **[README.md](README.md)** - Complete documentation
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - How to contribute
- **[COMPLETE_IMPLEMENTATION_SUMMARY.md](../COMPLETE_IMPLEMENTATION_SUMMARY.md)** - Technical deep dive

**Happy simulating!** 🌍🤖🏛️
