# Recipe Scheduler

This is a scheduling application designed to manage and send recipe reminders. The project is containerized using Docker for easy setup and deployment.

## Getting Started

Follow the instructions below to clone the repository, set up the environment, and start the application.

### 1. Clone the Repository

```bash
git clone https://github.com/stiles3/recipe-scheduler-AnifowoseMubarak
cd recipe-scheduler-AnifowoseMubarak
```

2. Set Up Environment Variables
Create a .env file in the root directory of the project and add the following variables:

```bash
PORT=3000
IS_LOCAL=true
AWS_REGION=us-east-1
REMINDER_LEAD_MINUTES=30
REDIS_HOST=redis
REDIS_PORT=6379
```

3. Start the Application
Use Docker Compose to start the application in detached mode:
```bash
docker compose up -d
```
4. Troubleshooting: Table Creation
If you encounter issues with table creation, run the following command to force table creation:

```bash
docker compose -f 'docker-compose.yml' up -d --build 'create-tables'
```

Accessing the Application
Once the containers are running, the application will be available at:

```bash
http://localhost:3000
```