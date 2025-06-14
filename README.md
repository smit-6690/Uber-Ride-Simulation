# 🚖 Uber Ride-Sharing Simulation – Distributed Microservices Architecture

A production-inspired, scalable simulation of the Uber ride-sharing platform.
This project was developed as part of the **Distributed Systems for Data Engineering** course to demonstrate robust microservices design using modern, industry-relevant technologies like **Kafka, Docker, MySQL, MongoDB, Redis, and Machine Learning**.

---

## 🏗️ System Architecture

```
Frontend (React / Node.js)
        ↓
REST APIs (Express Microservices)
        ↓
Kafka Broker ↔ Redis Cache
        ↓
MySQL + MongoDB
```

* **Microservices** for Customer, Driver, Billing, Rides, and Admin
* Services communicate asynchronously via **Kafka** broker
* Dockerized containers ensure portability and scalability
* Frontend communicates via **REST APIs** with backend services

---

## 🚀 Key Features

* 🔁 **Microservices Architecture**: Independent modules for core Uber functionalities
* 📦 **Kafka Messaging Queue**: Enables event-driven, decoupled communication
* 🧠 **Dynamic Pricing Engine**: Real-time pricing based on traffic/load via ML model (Scikit-learn)
* ⚡ **Redis Caching**: Speeds up frequent read operations, reduces DB load
* 📍 **Geo-based Driver Matching**: Real-time location matching for rider-driver allocation
* 📷 **Media Upload Support**: Handles user and driver media (images/videos) via MongoDB GridFS
* 📊 **Admin Dashboard**: Live statistics, ride analytics, revenue tracking

---

## 🔧 Tech Stack Overview

| Layer         | Technologies                                   |
| ------------- | ---------------------------------------------- |
| **Frontend**  | React.js, Node.js                              |
| **Backend**   | Express.js, REST APIs, Kafka                   |
| **Databases** | MySQL (structured data), MongoDB (media)       |
| **Caching**   | Redis                                          |
| **ML Engine** | Python, Scikit-learn                           |
| **DevOps**    | Docker, Docker Compose, JMeter, GitHub Actions |

---

## ⚙️ Quick Start (Dockerized Setup)

### 1. Clone the Repository:

```bash
git clone https://github.com/<your-username>/Uber_Rides.git
cd Uber_Rides
```

### 2. Build & Start All Microservices:

```bash
docker-compose up --build -d
```

### 3. Verify Services:

```bash
docker-compose logs -f
```

### 4. Start Frontend Locally:

```bash
cd frontend
npm install
npm run dev
```

> ✅ **Ensure Docker Desktop is running before starting services.**

---

## 📈 Performance & Scalability Testing

Conducted load testing using **Apache JMeter** under multiple configurations:

| Setup                   | Throughput | Latency  |
| ----------------------- | ---------- | -------- |
| Base (No Caching/Kafka) | Moderate   | Moderate |
| + SQL Caching (Redis)   | High       | Low      |
| + Kafka Messaging       | Higher     | Lower    |
| + Full Optimization     | Highest    | Lowest   |

---

## 🖼️ UI Snapshots

### 🚘 Main Uber Hero Section

![Uber Hero](https://github.com/user-attachments/assets/5121c425-3aed-4947-bcac-191fd41ee860)

### 🙌 Why Choose Us Section

![Why Choose Us](https://github.com/user-attachments/assets/b1cc3c4e-d4be-4707-bcaf-46e46fe97c60)

---

## ✅ Final Notes

This project demonstrates:

* **Asynchronous, event-driven design**
* **Dynamic, ML-powered decision making**
* **Scalability via Dockerized Microservices**
* **Real-world cloud architecture principles**

> ⭐ **Feel free to fork, star, or contribute if you find this project useful or inspiring!**

---

## 👨‍💻 Author

**Smit Ardeshana**
[LinkedIn](https://linkedin.com/in/smit-ardeshana-956512220) • [GitHub](https://github.com/smit-6690)
