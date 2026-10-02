# HealthUp - A Healthcare Management System

A full-stack healthcare application for patients and doctors. It provides account registration and login, patient and doctor profiles, doctor search, appointment booking and management, prescriptions, medicine lookup, password resets, and Braintree Sandbox payment integration.

## Technology

- Frontend: React 19, React Router, Vite, Bootstrap
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Medicine typo-tolerant search: MongoDB Atlas Search
- Authentication: JSON Web Tokens (JWT)
- Payments: Braintree Sandbox
- Password-reset email: Nodemailer with Gmail

## Project Structure

```text
backend/
	controllers/      Request handlers for auth, patients, doctors, and payments
	helper/           Password hashing helpers
	middlewares/      Role-based authentication
	models/           Mongoose models
	routes/           Express route definitions
	medicines.json    Initial medicine records
	seedMedicines.js  Medicine database seeder
	server.js         API startup and medicine endpoints
frontend/
	Pages/            React pages and workflows
	context/          Shared patient and doctor profile state
	CSS/, Styles/     Page and shared styles
	src/              Vite application entry point and app configuration
```

## Requirements

- Node.js 20 or newer and npm
- A MongoDB database, either local or MongoDB Atlas
- A MongoDB Atlas Search index for typo-tolerant medicine results
- Braintree Sandbox credentials to use payment checkout
- Gmail address and App Password to send password-reset emails

The API defaults to port `9000`; Vite defaults to port `5173`. The frontend currently calls the API at `http://localhost:9000`.

## Local Configuration

1. Create `backend/.env` from the example file:

	 ```powershell
	 Copy-Item backend/.env.example backend/.env
	 ```

	 Or, from a macOS/Linux shell:

	 ```sh
	 cp backend/.env.example backend/.env
	 ```

2. Set `MONGO_URI` to your MongoDB connection string. For local MongoDB, for example:

	 ```dotenv
	 MONGO_URI=mongodb://localhost:27017/healthcare
	 ```

	 For Atlas, use the connection string from the Atlas deployment and include the database name. Configure Atlas network access and a database user that can read and write to that database.

3. Replace `JWT_SECRET` with a long, random value. Generate one with Node.js:

	 ```sh
	 node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
	 ```

	 The same secret is used to sign and verify login tokens. Changing it invalidates existing tokens, so users will need to sign in again.

4. Configure optional integrations as needed:

	 - `ATLAS_SEARCH_INDEX`: Atlas Search index name; defaults to `medicines-search`.
	 - `EMAIL_USER` and `EMAIL_PASS`: Gmail account and Gmail App Password for the forgot-password email flow. These are not needed for registration or login.
	 - `BT_MERCHANT_ID`, `BT_PUBLIC_KEY`, and `BT_PRIVATE_KEY`: Braintree Sandbox credentials for payment flows.

Keep real credentials in `backend/.env`; do not commit that file or put real credentials in `.env.example`.

## MongoDB Atlas Search Setup

The medicine collection is named `medicines` (Mongoose model `Medicine`). The backend seeds it from `backend/medicines.json` when the collection is empty. The Atlas Search index must be created on the same database and collection used by `MONGO_URI`.

In Atlas, open the database's **Search** tab, create a Search index for the `medicines` collection, and use the name configured by `ATLAS_SEARCH_INDEX`. A static mapping for the medicine name field can use:

```json
{
	"mappings": {
		"dynamic": false,
		"fields": {
			"name": {
				"type": "string"
			}
		}
	}
}
```

The search endpoint uses Atlas Search fuzzy matching with up to two edits and returns up to ten results. If Atlas Search is unavailable or the index has not been created, the API falls back to a regular-expression search; that fallback does not provide true typo tolerance.

## Run Locally

Install dependencies and start the backend in one terminal:

```sh
cd backend
npm install
node server.js
```

The API connects to MongoDB, seeds the medicine collection if it is empty, and listens on `http://localhost:9000`. A basic health check is available at `http://localhost:9000/api/test`.

In a second terminal, install frontend dependencies and start Vite:

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Main API Routes

- Authentication: `/api/healthcare/auth` (`/signup-patient`, `/signup-doctor`, `/login`, `/forgot-password`, `/reset-password/:token`)
- Patient: `/api/healthcare/patient` (profile, doctor search, appointments, prescriptions)
- Doctor: `/api/healthcare/doctor` (profile, appointment management, prescriptions)
- Payments: `/api/payment` (`/token`, `/checkout`)
- Medicine price lookup: `/api/medicines/:key`
- Medicine search: `/api/medicines/search/:q`

## Checks

From `frontend/`, run the production build and lint checks:

```sh
npm run build
npm run lint
```

The backend currently has no automated test script. To check the server and controller JavaScript syntax, run from `backend/`:

```sh
node --check server.js
node --check controllers/authcontroller.js
node --check controllers/patientcontroller.js
node --check controllers/doctorcontroller.js
```
