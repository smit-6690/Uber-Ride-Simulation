# 🚗 Uber Ride Simulation – Distributed Systems Class Project

## 📌 Overview

This project simulates a real-world Uber-like system using a **3-tier distributed architecture**. It implements functionalities such as ride matching, billing, customer and driver management, and dynamic pricing based on real-time demand and historical data.

Developed as part of **San Jose State University's Distributed Systems for Data Engineering** course, the project focuses on system scalability, fault tolerance, distributed services, and efficient database design.

---

## 🛠 Tech Stack

**Backend & Middleware:**  
`Node.js` · `Express.js` · `REST APIs` · `Kafka` (messaging queue)

**Client Tier:**  
`Node.js GUI` (local app interface)

**Databases:**  
`MySQL` · `MongoDB` · `Redis` (SQL Caching for performance)

**DevOps & Infra:**  
`Docker` · `Kubernetes` (AWS) · `Apache JMeter` (load testing)

**Data & Algorithms:**  
`JSON` · `Dynamic Pricing Algorithm` · `Machine Learning`  
`Kaggle Dataset: [Uber Fares Dataset](https://www.kaggle.com/datasets/yasserh/uber-fares-dataset)`

---

## 🧩 System Architecture

```text
 ┌────────────┐     REST API      ┌──────────────┐     DB Access     ┌────────────┐
 │  Client UI │ ───────────────▶ │  Middleware  │ ───────────────▶ │  Database  │
 │  (Node.js) │   Kafka Events    │  (Express.js)│     Redis Cache   │  (MySQL,   │
 └────────────┘ ◀─────────────── └──────────────┘ ◀─────────────── │  MongoDB)  │


## 🚀 Key Features

* 🔁 **Microservices Architecture**: Independent modules for core Uber functionalities
* 📦 **Kafka Messaging Queue**: Enables event-driven, decoupled communication
* 🧠 **Dynamic Pricing Engine**: Real-time pricing based on traffic/load via ML model (Scikit-learn)
* ⚡ **Redis Caching**: Speeds up frequent read operations, reduces DB load
* 📍 **Geo-based Driver Matching**: Real-time location matching for rider-driver allocation
* 📷 **Media Upload Support**: Handles user and driver media (images/videos) via MongoDB GridFS
* 📊 **Admin Dashboard**: Live statistics, ride analytics, revenue tracking

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
