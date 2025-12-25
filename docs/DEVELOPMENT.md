# Snapory Development Guide

## Development Environment Setup

### Prerequisites Installation

#### 1. Install Required Tools

**On macOS (using Homebrew):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install git
brew install --cask docker
brew install dotnet-sdk
brew install node
brew install python@3.11
```

**On Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Git
sudo apt install git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install .NET 8.0
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip
```

**On Windows:**
- Download and install [Git](https://git-scm.com/download/win)
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Download and install [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- Download and install [Node.js 20 LTS](https://nodejs.org/)
- Download and install [Python 3.11](https://www.python.org/downloads/)

### 2. Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/karthikurao/Snapory.git
cd Snapory

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# On Linux/Mac: nano .env
# On Windows: notepad .env
```

### 3. Configure OVH S3 Storage

1. Log in to [OVH Cloud](https://www.ovh.com/auth/)
2. Go to Public Cloud → Object Storage
3. Create a new S3 bucket (e.g., `snapory-photos-dev`)
4. Generate S3 credentials (Access Key and Secret Key)
5. Update `.env` file with your credentials

## Running Services Locally

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or use the quick start script
./quick-start.sh
```

### Option 2: Running Services Individually

#### Terminal 1 - Redis
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

#### Terminal 2 - Backend API
```bash
cd backend
dotnet restore
dotnet run --project src/Snapory.Api/Snapory.Api.csproj
```

API: http://localhost:5000

#### Terminal 3 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

#### Terminal 4 - AI Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

AI Service: http://localhost:8000

## Development Workflow

### 1. Creating a New Feature

```bash
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Create Pull Request
```

### 2. Testing

```bash
# Backend
cd backend && dotnet test

# Frontend
cd frontend && npm test

# AI Service
cd ai-service && pytest
```

## Debugging

See full debugging guide in [DEVELOPMENT.md](../docs/DEVELOPMENT.md)

## Common Tasks

- Adding API endpoint: See `backend/src/Snapory.Api/Controllers/`
- Adding React component: See `frontend/src/components/`
- Adding AI feature: See `ai-service/app/services/`

## Troubleshooting

### Port in use
```bash
lsof -ti:5000  # Find process
kill -9 <PID>  # Kill it
```

### Docker issues
```bash
docker-compose down -v
docker system prune -a
```

## Resources

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
