# Expense Tracker

An expense tracking application built with SvelteKit and Appwrite.

## Features

- User authentication (login/register)
- Add, edit, and delete expenses
- Categorize expenses
- View total expenses
- Responsive UI with TailwindCSS

## Prerequisites

- Node.js (v18 or later)
- pnpm
- Appwrite instance (self-hosted or cloud)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd expense-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your Appwrite configuration:
     ```
     PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
     PUBLIC_APPWRITE_PROJECT_ID=your-project-id
     PUBLIC_APPWRITE_DATABASE_ID=expense-tracker
     PUBLIC_APPWRITE_COLLECTION_ID=expenses
     ```

4. Create an Appwrite project and configure the following:

   a. Create a new project in Appwrite Console

   b. Create a new database with the ID specified in `PUBLIC_APPWRITE_DATABASE_ID`

   c. Create a new collection with the ID specified in `PUBLIC_APPWRITE_COLLECTION_ID` and add these attributes:

   - `userId` (String, required)
   - `amount` (Float, required)
   - `category` (Enum, required)
     - Elements: "food", "rent", "transportation", "entertainment", "shopping", "healthcare", "utilities", "education", "other"
   - `description` (String, required)
   - `date` (DateTime, required)
   - `createdAt` (DateTime, required)
   - `updatedAt` (DateTime, required)

   d. Configure collection permissions:

   - Enable Document Security in Collection Settings
   - At collection level, only set:
     - Create: `["role:all"]` (allows all authenticated users to create documents)
   - Document-level permissions are set automatically when creating expenses

5. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
pnpm build
```

## Technologies Used

- SvelteKit
- Appwrite
- TailwindCSS
- TypeScript
- date-fns

## License

MIT
