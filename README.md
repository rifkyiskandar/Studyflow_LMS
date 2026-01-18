# Universitas Shane LMS (StudyFlow)

StudyFlow is a modern Learning Management System (LMS) built with **Laravel**, **Inertia.js (React)**, and **Tailwind CSS**. It features comprehensive modules for academic administration, student management, course catalogs, and tuition billing integrated with **Midtrans**.

## 🛠 Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React (via Inertia.js) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Payment Gateway**: Midtrans
- **Localization**: English & Indonesian (Switchable)

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- [PHP 8.2+](https://www.php.net/downloads) or higher
- [Composer](https://getcomposer.org/)
- [Node.js & NPM](https://nodejs.org/)
- MySQL  or [PostgreSQL](https://www.postgresql.org/)

## 🚀 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/lms.git
    cd lms
    ```

2.  **Install PHP Dependencies**
    ```bash
    composer install
    ```

3.  **Install Node.js Dependencies**
    ```bash
    npm install
    ```

4.  **Environment Setup**
    Copy the example environment file and configure your database and Midtrans credentials.
    ```bash
    cp .env.example .env
    ```

5.  **Generate Application Key**
    ```bash
    php artisan key:generate
    ```

6.  **Database Migration & Seeding**
    Create the necessary tables and populate them with dummy data.
    ```bash
    php artisan migrate --seed
    ```

## 💻 Running Locally

To run the application locally, you need to start both the Laravel server and the Vite development server.

1.  **Start Laravel Server**
    ```bash
    php artisan serve
    ```
    The app will be available at `http://127.0.0.1:8000`.

2.  **Start Vite (Frontend)**
    Open a new terminal and run:
    ```bash
    npm run dev
    ```

## 🌐 Running with Ngrok (For Payment Gateway)

Since Midtrans requires a public URL to send Webhook notifications (e.g., payment success callbacks), you must expose your local server using **Ngrok**.

1.  **Start Ngrok**
    Run the following command to tunnel port 8000 to your reserved domain:
    ```bash
    ngrok http --domain=unhypnotisable-gimlety-hillary.ngrok-free.dev 8000
    ```

2.  **Update Environment Variables**
    In your `.env` file, update `APP_URL` to match your Ngrok domain so that generated links and callbacks use the correct URL.
    ```env
    APP_URL=https://unhypnotisable-gimlety-hillary.ngrok-free.dev
    ```

3.  **App Access**
    Open `https://unhypnotisable-gimlety-hillary.ngrok-free.dev` in your browser instead of localhost.

## 🔐 Default Credentials (Seeder)

Use the following accounts to access the system after running `php artisan migrate --seed`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `password` |
| **Lecturer (Dosen)** | `dosen@lms.com` | `password` |
| **Student** | `student@lms.com` | `password` |

## 🧪 Testing Payments

1.  Login as a **Student** (`student@gmail.com`).
2.  Go to the **Billing / Keuangan** menu.
3.  Click "Pay Now" on an invoice.
4.  Use Midtrans Sandbox credentials to complete the payment.
5.  If Ngrok is running, the payment status will automatically update to `PAID` via the webhook.
