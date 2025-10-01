# Seminar Sentry

A streamlined web application for managing hotel seminar attendees, focusing on efficient breakfast service tracking and reporting.

[cloudflarebutton]

## About The Project

Seminar Sentry is a sophisticated, minimalist web application designed for a 4-star hotel to manage seminar attendees with a primary focus on streamlining breakfast service. The application features three main components: a Seminar Management dashboard for administrators to create and oversee events; an Attendee Management system that allows for manual entry or bulk import of guest information, linking each attendee to a specific seminar and room; and a high-speed Breakfast Check-in interface for restaurant staff. This check-in view allows staff to instantly retrieve a guest's details by their room number and mark their breakfast as served with a single click. The application provides real-time tracking of breakfast service, with filterable lists of served and pending guests, and concludes with a robust reporting feature to export daily service lists to CSV or PDF for accounting and record-keeping.

## Key Features

*   **Breakfast Dashboard**: A high-speed interface for restaurant staff to look up guests by room number and confirm breakfast service with a single click.
*   **Real-Time Tracking**: Instantly view lists of guests who are pending breakfast or have already been served.
*   **Seminar Management**: An administrative dashboard to easily create, read, update, and delete seminars.
*   **Attendee Management**: Manage attendees for each seminar, with support for both manual entry and bulk CSV import.
*   **Reporting & Export**: Generate and export daily breakfast service reports to CSV or PDF for record-keeping.
*   **Responsive Design**: A flawless user experience across desktops, tablets, and mobile devices.

## Technology Stack

*   **Frontend**: React, Vite, TypeScript, Tailwind CSS
*   **UI Components**: shadcn/ui, Framer Motion, Lucide React
*   **State Management**: Zustand
*   **Backend**: Hono on Cloudflare Workers
*   **Database**: Cloudflare Durable Objects
*   **Tooling**: Bun, Wrangler, Vite

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Bun](https://bun.sh/) installed on your machine.
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/seminar-sentry.git
    cd seminar-sentry
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    ```sh
    bun dev
    ```
    The application will be available at `http://localhost:3000`. The backend worker will also be running locally and proxying API requests.

## Development

The project is organized into three main directories:

*   `src/`: Contains the React frontend application code, including pages, components, and hooks.
*   `worker/`: Contains the Hono backend code that runs on Cloudflare Workers, including API routes and entity definitions.
*   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend.

### Adding API Endpoints

To add new API endpoints, modify the `worker/user-routes.ts` file. Follow the existing patterns using the Hono framework and the provided data helpers.

### Creating Data Models

New data models (Entities) can be defined in `worker/entities.ts` by extending the `IndexedEntity` class from `worker/core-utils.ts`.

## Deployment

This application is designed for seamless deployment to the Cloudflare network.

1.  **Build the project:**
    ```sh
    bun build
    ```

2.  **Deploy to Cloudflare:**
    ```sh
    bun deploy
    ```
    This command will build the application and deploy both the static frontend assets and the backend Worker to your Cloudflare account.

Or deploy directly with the button below:

[cloudflarebutton]