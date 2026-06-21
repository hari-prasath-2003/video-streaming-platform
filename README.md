# StreamForge 🎥

A cloud-native video streaming platform built to explore backend engineering, distributed systems, DevOps, and scalable application design.

StreamForge is a hands-on engineering project focused on designing, building, and operating a production-inspired video platform. The objective is not to replicate YouTube, but to gain practical experience with modern backend architectures, asynchronous processing, CI/CD automation, containerization, and cloud-native deployment practices.

---

## Objectives

- Build a scalable video streaming platform
- Design and implement backend services
- Explore distributed system patterns
- Implement event-driven workflows
- Automate deployments using CI/CD
- Deploy applications using Kubernetes
- Practice observability and monitoring
- Apply production-oriented engineering practices

---

## Architecture Overview

```text
                         ┌──────────────┐
                         │   Next.js    │
                         │   Frontend   │
                         └──────┬───────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │    Video Service    │
                    └──────┬──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼

     PostgreSQL       Redis Cache     Object Storage
                                        (MinIO / S3)

                           │
                           ▼

                     Message Queue
                  (BullMQ / Kafka)

                           │
                ┌──────────┴──────────┐
                ▼                     ▼

      Transcoding Worker    Notification Service
```

---

## Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- ShadCN UI

### Backend

- Node.js
- Express.js / Fastify
- TypeScript

### Data Layer

- PostgreSQL
- Redis

### Messaging & Background Processing

- BullMQ
- Kafka (planned)

### Storage

- MinIO
- Amazon S3 (planned)

### DevOps & Infrastructure

- Docker
- Kubernetes
- Jenkins
- GitHub Webhooks

### Monitoring & Observability

- Prometheus
- Grafana
- Loki

---

## Repository Structure

```text
streamforge/

├── frontend/
│
├── services/
│   └── video-service/
│
├── workers/
│   └── transcoder-worker/
│
├── infrastructure/
│   └── kubernetes/
│
│
├── shared/
│   ├── types/
│   └── utilities/
│
└── docs/
```

---

## Core Features

### Video Management

- Video uploads
- Video metadata management
- Visibility controls
- Streaming support

### Processing Pipeline

- Asynchronous upload processing
- Queue-driven workflows
- Video transcoding
- Thumbnail generation

### User Features

- Authentication and authorization
- User profiles
- Upload history

### Platform Engineering

- Containerized services
- Automated deployments
- Kubernetes orchestration
- Centralized logging
- Metrics collection
- Horizontal scaling

---

## CI/CD Workflow

```text
Developer Push
      │
      ▼
GitHub Webhook
      │
      ▼
 Jenkins Pipeline
      │
      ▼
   Run Tests
      │
      ▼
 Build Image
      │
      ▼
 Push Registry
      │
      ▼
 Deploy to Kubernetes
      │
      ▼
 Rolling Update
```

---

## Learning Focus

This project serves as a practical environment for learning and demonstrating:

- Backend Development
- API Design
- Distributed Systems
- Event-Driven Architecture
- Docker
- Kubernetes
- Jenkins
- CI/CD Automation
- System Design
- Observability
- Scalability Patterns

---

## Roadmap

### Phase 1

- Frontend prototype
- Video service foundation
- PostgreSQL integration
- Docker setup

### Phase 2

- Video upload workflow
- Redis integration
- Queue processing
- Background workers

### Phase 3

- CI/CD with Jenkins
- Kubernetes deployment
- Monitoring and logging

### Phase 4

- Advanced scaling patterns
- Search capabilities
- Recommendation engine
- Live streaming exploration

---

## Project Status

🚧 Active Development

This repository is being developed incrementally, with a focus on engineering fundamentals, maintainability, scalability, and operational excellence.

---

## License

This project is intended for educational and portfolio purposes.
